<template>
    <div>
        <vl-layout>
            <vl-grid mod-stacked>
                <vl-column>
                    <vl-title tag-name="h1">
                        OSLO Zoekmachine
                    </vl-title>
                </vl-column>
                <vl-column width="8" id="search_bar">
                    <vl-input-group>
                        <vl-button disabled>Termen:</vl-button>
                        <vl-input-field v-on:keyup.enter="executeQuery" v-model="query" id="inputfield" name="inputfield" mod-block/>
                        <vl-input-addon @click="executeQuery" tag-name="button" tooltip="" type="button" icon="search"
                                        text="Zoeken"/>
                    </vl-input-group>
                </vl-column>
            </vl-grid>
        </vl-layout>
    </div>
</template>

<script>
    const URL_INDEX = "data.vlaanderen";
    const FRAGMENT_IDENTIFIER_INDEX = "data.vlaanderen_fis";
    const URL_TYPE = "url_list";
    const FRAGMENT_IDENTIFIER_TYPE = "fragment_identifier_list";

    import EventBus from '../../eventbus.js';

    let client = new elasticsearch.Client({
        hosts: ['http://127.0.0.1:9200']
    });

    export default {
        name: "SearchComponent",
        data() {
            return {
                query: ''
            }
        },
        methods: {
            executeQuery() {
                const queryTerms = this.query.split(' ');

                let body = {
                    size: 30,
                    from: 0
                };
                if (queryTerms.length === 1) {
                    /*body.query = {
                        multi_match: {
                            query: queryTerms[0],
                            fields: ['keywords', 'type'],
                            fuzziness: "AUTO"
                        }
                    }*/
                    body.query = {
                        "query_string" : {
                            "query" : queryTerms[0] + '*',
                            "fields" : ["keywords", "type"]
                        }
                    }

                } else {
                    //let musts = [];
                    let query = "";
                    queryTerms.forEach( term => {
                        if(term === queryTerms[queryTerms.length-1]){
                            query += '(' + term + '*)';
                        } else {
                            query += '(' + term + '*) AND ';
                        }

                    });

                    body.query = {
                        "query_string" : {
                            query: query,
                            fields: ['keywords', 'type']
                        }
                    }
                    /*queryTerms.forEach(term => {
                        // Search in one field
                        let match = {
                            keywords: term
                        }
                        musts.push({match : match})


                        // Search in multiple field
                        musts.push({multi_match : {query: term, fields: ['keywords', 'type']}})
                    });*/

                    /*body.query = {
                        "bool" : musts
                    }*/
                    /*body.query = {
                        "bool" : {
                            "must" : musts
                        }
                    }*/

                }

                // Search Elasticsearch URL index
                client.search({index: URL_INDEX, body: body, type: URL_TYPE})
                    .then(results => {
                        EventBus.$emit('url_results', results.hits.hits);
                    })
                    .catch(err => {
                        console.log(err)
                    });

                // Search Elasticsearch fragment index
                client.search({index: FRAGMENT_IDENTIFIER_INDEX, body: body, type: FRAGMENT_IDENTIFIER_TYPE})
                    .then(results => {
                        EventBus.$emit('fragment_identifier_results', results.hits.hits);
                    })
                    .catch(err => {
                        console.log(err);
                    })
            },
        },
        watch: {
            query: function () {
                //this.executeQuery();
            }
        }
    }
</script>


<style lang="scss">
    @import "~@govflanders/vl-ui-core/src/scss/core";
    @import "~@govflanders/vl-ui-titles/src/scss/titles";
    @import "~@govflanders/vl-ui-input-group/src/scss/input-group";
    @import "~@govflanders/vl-ui-input-field/src/scss/input-field";
    @import "~@govflanders/vl-ui-button/src/scss/button";
    @import "~@govflanders/vl-ui-form-message/src/scss/form-message";
    @import "~@govflanders/vl-ui-input-addon/src/scss/input-addon";
    @import "~@govflanders/vl-ui-util/src/scss/util";
    @import "~@govflanders/vl-ui-checkbox/src/scss/checkbox";

    .vl-title, #options {
        text-align: center;
    }

    #search_bar {
        margin: auto;
    }

    .vl-button {
        border-bottom-left-radius: 10px;
        border-top-left-radius: 10px;
    }

    .vl-button:hover {
        background-color: #0055cc;
    }

    .vl-input-addon {
        border-bottom-right-radius: 10px;
        border-top-right-radius: 10px;
    }


</style>
