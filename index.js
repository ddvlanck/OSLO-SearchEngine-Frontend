// Elasticsearch data and index creation

const SitemapGenerator = require('advanced-sitemap-generator');
const xml2js = require('xml2js');
const fs = require('fs');
const Parser = new xml2js.Parser({attrkey: "ATTR"});
const elasticsearch = require('elasticsearch');

const INDEX = "data.vlaanderen";
const TYPE = "url_list";
const ELASTICSEARCH_HOST = "http://localhost:9200";

// TODO
// 1. Crawl web page of AP and vocs of adres en organisatie
// 2. Finish try-catch
// 3. Add CRON job

try {
    const generator = createSitemapGenerator();

    generator.on('done', async () => {

        // Index the sitemap
        let indexed_data = await indexData();

        // Create Elasticsearch client and an index
        const client = createElasticsearchClient();

        if(!elasticsearchIndexExists(client, INDEX)){
            createIndex(client);
        }

        // Add data in bulk mode to Elasticsearch
        addDataInBulk(client, indexed_data);
    });

    //generator.start();
} catch (e) {
    console.error('Something went wrong!');
    console.log(e);
}

function createElasticsearchClient(){

    console.log('\x1b[33m%s\x1b[0m ', "Creating an Elasticsearch client.");

    const client = new elasticsearch.Client({
        hosts: [ ELASTICSEARCH_HOST ]
    });

    console.log('\x1b[33m%s\x1b[0m ', "Pinging Elastichsearch client to be sure the service is running.");

    // Ping the client to be sure Elasticsearch is up
    client.ping({
        requestTimeout: 30000,
    }, function(error) {
        // At this point, eastic search is down, please check your Elasticsearch service
        if (error) {
            console.error('\x1b[31m%s\x1b[0m ', "Elasticsearch cluster is down")
        } else {
            console.log('\x1b[32m%s\x1b[0m ', "Elasticsearch cluster/client is running");
        }
    });

    return client;
}

function createIndex(client){
    client.indices.create({
        index: INDEX
    }, function (error, response, status) {
        if (error) {
            console.log(error);
        } else {
            console.log("Created a new index: " + INDEX, response);
        }
    });
}

function elasticsearchIndexExists(client, index){
    try {
        let exists = false;

        client.cat.indices({format: 'json'}).then(result => {


            for(let i in result){
                if(result[i].index === INDEX){
                    exists = true;
                }
            }
        });

        return exists;
    } catch (e) {
        console.error('Something went wrong when checking if index exists');
    }
}

function addDataInBulk(client, data){

    // Declare an empty array called bulk
    let bulk = [];

    // Loop through each city and create and push two objects into the array in each loop
    // first object sends the index and type you will be saving the data as
    // second object is the data you want to index
    data.forEach(url => {
        bulk.push({
            index: {
                _index: INDEX,
                _type: TYPE,
            }
        })
        bulk.push(url)
    })

    //perform bulk indexing of the data passed
    client.bulk({body: bulk}, function (err, response) {
        if (err) {
            console.log("Failed Bulk operation", err)
        } else {
            console.log("Successfully imported", data.length);
        }
    });

}

function createSitemapGenerator(){

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

async function indexData(){
    let result = await new Promise(resolve => {
        fs.readFile('./sitemap.xml', (err, xmlString) => {
            if (err) {
                console.error('Error reading the sitemap.xml file');
            }

            let indexMap = [];

            Parser.parseString(xmlString.toString(), (err, res) => {
                if (err) {
                    console.error(err);
                }

                for (let index in res.urlset.url) {
                    let object = {};
                    object.url = res.urlset.url[index].loc[0];
                    object.keywords = createKeywords(object.url);
                    object.priority = res.urlset.url[index].priority[0];
                    object.lastmod = res.urlset.url[index].lastmod[0];
                    object.type = urlType(object.url);
                    indexMap.push(object);
                }
            });

            resolve(indexMap);
        });
    });

    // Write data to a file
    //fs.writeFileSync('index.json', JSON.stringify(result, null, 4));

    // Or return JSON data immediately
    return result;
}

/*
* //////////////////////
* Small helper functions
* //////////////////////
* */


function createKeywords(url){
    // Remove the base domain and use other parts as keywords
    // Main website has no other parts, so we define them ourselves
    if(url === 'https://data.vlaanderen.be/'){
        return ['data', 'vlaanderen', 'be'];
    } else {
        return url.replace('https://data.vlaanderen.be/', '').split('/');
    }

}

function urlType(url){
    let type = null;

    if(url.indexOf('/applicatieprofiel') >= 0){
        type = "Applicatieprofiel"
    } else if(url.indexOf('/ns') >= 0){
        type = "Vocabularium"
    } else if(url.indexOf('/conceptscheme') >= 0){
        type = "Codelijst"
    } else if(url.indexOf('/concept/') >= 0) {
        type = "Waarde van een codelijst"
    } else {
        type = "Pagina of document";
    }

    // Specific web pages
    if(url === 'https://data.vlaanderen.be/'){
        type = "Hoofdpagina"
    } else if(url === 'https://data.vlaanderen.be/dumps'){
        type = "Data dumps";
    } else if(url === 'https://data.vlaanderen.be/ns'){
        type = "Namespace met alle vocabularia en applicatieprofielen";
    }

    return type;
}
