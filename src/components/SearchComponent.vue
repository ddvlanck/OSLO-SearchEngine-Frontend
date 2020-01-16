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
                        <vl-button disabled>Termen</vl-button>
                        <vl-input-field v-on:keyup.enter="executeQuery" v-model="query" id="inputfield"
                                        name="inputfield" mod-block :mod-error="emptyOnSubmit"/>
                        <vl-input-addon @click="executeQuery" tag-name="button" tooltip="" type="button" icon="search"
                                        text="Zoeken"/>
                    </vl-input-group>
                    <vl-column v-if="emptyOnSubmit" width="8" style="color: red">Gelieve 1 of meer zoektermen mee te geven.</vl-column>
                </vl-column>
            </vl-grid>
        </vl-layout>
    </div>
</template>

<script>

    const config = require('../../config.js');

    import EventBus from '../../eventbus.js';

    let client = new elasticsearch.Client({
        hosts: ['http://127.0.0.1:9200']
    });

    export default {
        name: "SearchComponent",
        data() {
            return {
                query: '',
                emptyOnSubmit: false
            }
        },
        methods: {
            executeQuery() {
                document.getElementById('inputfield').blur();   // Remove focus from input field

                if (this.query) {
                    this.emptyOnSubmit = false;
                    const queryTerms = this.query.split(' ');

                    let body = {};
                    if (queryTerms.length === 1) {
                        body.query = {
                            "query_string": {
                                "query": queryTerms[0] + '*',
                                "fields": ["keywords", "type"]
                            }
                        }
                    } else {
                        let query = "";
                        queryTerms.forEach(term => {
                            if (term === queryTerms[queryTerms.length - 1]) {
                                query += '(' + term + '*)';
                            } else {
                                query += '(' + term + '*) AND ';
                            }

                        });

                        body.query = {
                            "query_string": {
                                query: query,
                                fields: ['keywords', 'type']
                            }
                        }
                    }

                    body.size = 50;
                    body.from = 0;

                    // Search Elasticsearch URL index
                    client.search({index: config.URL_INDEX, body: body, type: config.URL_TYPE})
                        .then(results => {
                            EventBus.$emit('url_results', results.hits.hits);
                        })
                        .catch(err => {
                            console.log(err)
                        });

                    // Search Elasticsearch fragment index
                    client.search({
                        index: config.FRAGMENT_IDENTIFIER_INDEX,
                        body: body,
                        type: config.FRAGMENT_IDENTIFIER_TYPE
                    })
                        .then(results => {
                            EventBus.$emit('fragment_identifier_results', results.hits.hits);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                } else {
                    // Show error when input field is empty
                    this.emptyOnSubmit = true;
                }


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
        transition: background-color 0.5s ease;
        border-bottom-right-radius: 10px;
        border-top-right-radius: 10px;
    }

    .vl-input-addon:hover {
        background-color: lightgrey;
    }


</style>
