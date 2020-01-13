// Elasticsearch data and index creation

const SitemapGenerator = require('advanced-sitemap-generator');
const xml2js = require('xml2js');
const fs = require('fs');
const Parser = new xml2js.Parser({attrkey: "ATTR"});
const elasticsearch = require('elasticsearch');
require('es6-promise').polyfill();
require('isomorphic-fetch');
const getHrefs = require('get-hrefs');

const URL_INDEX = "data.vlaanderen";
const FRAGMENT_IDENTIFIER_INDEX = "data.vlaanderen_fis";
const URL_TYPE = "url_list";
const FRAGMENT_IDENTIFIER_TYPE = "fragment_identifier_list";
const ELASTICSEARCH_HOST = "http://localhost:9200";
const INVALID_FRAGMENTS_IDENTIFIERS = ['#absclstract', '#sotd', '#license-and-liability', '#conformance-statement', '#overview', '#classes', '#properties', '#external',
'#abstract', '#introduction', '#summary', '#status', '#license', '#conformance', '#overview'];

// TODO
// 1. Crawl web page of AP and vocs of adres en organisatie
// 2. Finish try-catch
// 3. Add CRON job

try {
    const generator = createSitemapGenerator();

    generator.on('done', async () => {
        console.log("DONE CRAWLING");

        // Index the sitemap
        let [indexed_urls, indexed_fis] = await indexData();

        // Create Elasticsearch client and an index
        const client = createElasticsearchClient();
        createElasticsearchIndex(client, URL_INDEX);
        createElasticsearchIndex(client, FRAGMENT_IDENTIFIER_INDEX);


        // Add data in bulk mode to Elasticsearch
        addDataInBulk(client, indexed_urls, URL_INDEX, URL_TYPE);
        addDataInBulk(client, indexed_fis, FRAGMENT_IDENTIFIER_INDEX, FRAGMENT_IDENTIFIER_TYPE);

        console.log("DONE INSERTING");
    });

    //generator.start();


} catch (e) {
    console.error('Something went wrong!');
    console.log(e);
}


function createElasticsearchClient() {

    console.log('\x1b[33m%s\x1b[0m ', "Creating an Elasticsearch client.");

    const client = new elasticsearch.Client({
        hosts: [ELASTICSEARCH_HOST]
    });

    console.log('\x1b[33m%s\x1b[0m ', "Pinging Elastichsearch client to be sure the service is running.");

    // Ping the client to be sure Elasticsearch is up
    client.ping({
        requestTimeout: 30000,
    }, function (error) {
        // At this point, eastic search is down, please check your Elasticsearch service
        if (error) {
            console.error('\x1b[31m%s\x1b[0m ', "Elasticsearch cluster is down")
        } else {
            console.log('\x1b[32m%s\x1b[0m ', "Elasticsearch cluster/client is running");
        }
    });

    return client;
}

function createElasticsearchIndex(client, name) {
    client.indices.create({
        index: name
    }, function (error, response, status) {
        if (error) {
            console.log(error);
        } else {
            console.log("Created a new index: " + name, response);
        }
    });
}

function elasticsearchIndexExists(client, index) {
    try {
        let exists = false;

        client.cat.indices({format: 'json'}).then(result => {


            for (let i in result) {
                if (result[i].index === index) {
                    exists = true;
                }
            }
        });

        return exists;
    } catch (e) {
        console.error('Something went wrong when checking if index exists');
    }
}

function addDataInBulk(client, data, index, type) {

    // Declare an empty array called bulk
    let bulk = [];

    // Loop through each city and create and push two objects into the array in each loop
    // first object sends the index and type you will be saving the data as
    // second object is the data you want to index
    data.forEach(url => {
        bulk.push({
            index: {
                _index: index,
                _type: type,
            }
        })
        bulk.push(url)
    })

    //perform bulk indexing of the data passed
    client.bulk({body: bulk}, function (err, response) {
        if (err) {
            console.log("Failed Bulk operation ", err)
        } else {
            console.log("Successfully imported ", data.length);
        }
    });

}

function createSitemapGenerator() {

    // Create sitemap generator for data.vlaanderen.be
    const generator = SitemapGenerator('https://data.vlaanderen.be', {
        stripQuerystring: true,
        ignoreHreflang: true,
        changeFreq: 'monthly',
        excludeURLs: ['adres', 'organisatie']   // Which patterns should be excluded
    });
    // Since we exclude patterns with 'adres' and 'organisatie' to prevent we crawl the address and organization register (datasets)
    // We have to add their application profiles and vocs manually.

    return generator;
}

// This function reads all URLs from the sitemap_2.xml and executes 2 functions
// 1 - A function to create a JSON object for the URL containing keywords, type, etc...
// 2 - A function that gets all fragment identifiers from the HTML body
async function indexData() {
    let data = await new Promise(resolve => {
        fs.readFile('./sitemap_2.xml',  (err, xmlString) => {
            if (err) {
                console.error('Error reading the sitemap_2.xml file');
            }
            Parser.parseString(xmlString.toString(), (err, res) => {
                if (err) {
                    console.error(err);
                }

                resolve(res);

            });
        });
    });

    let indexedURLs = convertURLsToJSON(data.urlset.url);
    let indexedFIs = await getFragmentIdentifiers(data.urlset.url);

    return [indexedURLs, indexedFIs];
}

function convertURLsToJSON(urls) {
    let indexedURLs = [];
    for (let index in urls) {

        // Create JSON objects for the sitemap_2.xml
        let object = {};
        object.url = urls[index].loc[0];
        object.keywords = createKeywords(object.url);
        object.priority = urls[index].priority[0];
        object.lastmod = urls[index].lastmod[0];
        object.type = urlType(object.url);
        indexedURLs.push(object);

    }
    return indexedURLs
}

// TODO:
// Get all fragment identifiers for the current URL
//const fragmentIdentifiersForCurrentURL = await getFragmentIdentifiersForURL(res.urlset.url[index].loc[0]);
//indexFIs = indexFIs.concat(fragmentIdentifiersForCurrentURL);
async function getFragmentIdentifiers(urls){
    let FIs = [];
    for(let index in urls){
        let FI = await getFragmentIdentifiersForURL(urls[index].loc[0]);
        FIs = FIs.concat(FI);
    }
    return FIs;
}


async function getFragmentIdentifiersForURL(url) {
    let html = await fetch(url).then(res => {
        return res.text()
    });
    let hrefs = getHrefs(html);
    hrefs = hrefs.filter(href => href.indexOf('#') === 0);  // Only keep fragment identifiers from this URL. (not those who refer to another domain);

    let fragmentIdentifiers = [];

    hrefs.forEach(link => {

        let isProperty = false;
        if (link.charAt(1) == link.charAt(1).toLowerCase() || link.indexOf('.') >= 0) {
            isProperty = true;
        }

        if (!INVALID_FRAGMENTS_IDENTIFIERS.includes(link)) {
            let keywords = link.substring(1, link.length).split('.');

            let type;
            if(link.indexOf('jsonld') >= 0){
                type = 'Context';
            } else {
                type = isProperty ? 'Eigenschap' : 'Klasse';
            }
            keywords.push(type);

            fragmentIdentifiers.push(
                {
                    url: url + link,
                    keywords: keywords,
                    type: type
                })
        }
    });

    return fragmentIdentifiers;
}


/*
* //////////////////////
* Small helper functions
* //////////////////////
* */


function createKeywords(url) {
    // Remove the base domain and use other parts as keywords
    // Main website has no other parts, so we define them ourselves
    if (url === 'https://data.vlaanderen.be/') {
        return ['data', 'vlaanderen', 'be'];
    } else if (url === 'https://data.vlaanderen.be/ns') {
        let keywords = url.replace('https://data.vlaanderen.be/', '').split('/');
        keywords.push('vocabularium', 'applicatieprofiel');
    } else {
        return url.replace('https://data.vlaanderen.be/', '').split('/');
    }

}

function urlType(url) {
    let type = null;

    if (url.indexOf('/applicatieprofiel') >= 0) {
        type = "Applicatieprofiel"
    } else if (url.indexOf('/ns') >= 0) {
        type = "Vocabularium"
    } else if (url.indexOf('/conceptscheme') >= 0) {
        type = "Codelijst"
    } else if (url.indexOf('/concept/') >= 0) {
        type = "Waarde van een codelijst"
    } else {
        type = "Pagina of document";
    }

    // Specific web pages
    if (url === 'https://data.vlaanderen.be/') {
        type = "Hoofdpagina"
    } else if (url === 'https://data.vlaanderen.be/dumps') {
        type = "Data dumps";
    } else if (url === 'https://data.vlaanderen.be/ns') {
        type = "Namespace met alle vocabularia en applicatieprofielen";
    }

    return type;
}
