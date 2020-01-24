<template>
    <div>
        <vl-layout>
            <vl-grid mod-stacked>
                <vl-column>
                    <vl-tabs v-if="this.URLResults.length > 0 || this.fragmentIdentifierResults.length > 0">
                        <vl-tab v-bind:label="'Vocabularium & applicatieprofielen (' + this.URLResults.length + ')'"
                                id="voc_ap" selected>
                            <vl-column width="8" v-for="result in this.URLResults">
                                <vl-info-tile
                                        :href=result.url
                                        target="_blank"
                                        :title=result.url
                                        subtitle="">
                                    <vl-pill>{{result.type}}</vl-pill>
                                </vl-info-tile>
                                <br>
                            </vl-column>
                        </vl-tab>
                        <vl-tab v-bind:label="'Klassen & eigenschappen (' + this.fragmentIdentifierResults.length + ')'"
                                id="class_prop">

                            <vl-column width="8" v-for="result in this.fragmentIdentifierResults">
                                <vl-info-tile
                                        :href=result.url
                                        target="_blank"
                                        :title=result.name
                                        :subtitle=result.url>
                                    <br>
                                    <p v-if="result.type === 'Eigenschap'" >
                                        <vl-pill>Klasse  {{result.className}}</vl-pill>&nbsp;
                                        <vl-pill>AP {{result.apName}}</vl-pill>
                                    </p>
                                    <p v-else>
                                        <vl-pill>AP {{result.apName}}</vl-pill>
                                    </p>
                                </vl-info-tile>
                                <br>
                            </vl-column>
                        </vl-tab>
                    </vl-tabs>
                </vl-column>
                <go-top :bottom="50" :right="100" :size="40" :has-outline="false" bg-color="#306ccf" fg-color="#ffffff"></go-top>
            </vl-grid>
        </vl-layout>
    </div>
</template>

<script>
    import EventBus from '../../eventbus.js';


    export default {
        name: "ResultComponent",
        data() {
            return {
                URLResults: [],
                fragmentIdentifierResults: []
            }
        },
        methods: {
            processURLResults(results) {
                this.URLResults = [];

                for (let index in results) {
                    let result = {};
                    result.url = results[index]._source.url;
                    result.lastmod = results[index]._source.lastmod;
                    result.priority = results[index]._source.priority;
                    result.type = results[index]._source.type
                    this.URLResults.push(result);
                }


            },
            processFragmentIdentifierResults(results) {
                this.fragmentIdentifierResults = [];

                for (let index in results) {
                    let fi = {};
                    fi.url = results[index]._source.url;
                    fi.type = results[index]._source.type;
                    fi.name = results[index]._source.name;
                    this.getParent(fi, results[index]._source.keywords);
                    this.fragmentIdentifierResults.push(fi);
                }
            },
            // This function will extract the parent(s) of the class or property
            // If the URL is a property, then its class and the name of the application profile will be extracted
            // IF the URL is a class, only the name of the application profile is extracted
            getParent(fiObject, keywords){
                if(fiObject.url.indexOf('.jsonld') >= 0){
                    fiObject.apName = fiObject.url.substring(fiObject.url.lastIndexOf('/') + 1, fiObject.url.indexOf('.jsonld'))
                } else {
                    fiObject.apName = fiObject.url.substring(fiObject.url.indexOf('/applicatieprofiel')+19).split('/')[0];
                }


                if(fiObject.type === 'Eigenschap'){
                    fiObject.className = keywords[0];
                }
            }
        },
        mounted() {
            EventBus.$on('url_results', results => this.processURLResults(results));
            EventBus.$on('fragment_identifier_results', results => this.processFragmentIdentifierResults(results));
        }
    }
</script>

<style lang="scss">
    @import "~@govflanders/vl-ui-core/src/scss/core";
    @import "~@govflanders/vl-ui-info-tile/src/scss/info-tile";
    @import "~@govflanders/vl-ui-tabs/src/scss/tabs";
    @import "~@govflanders/vl-ui-pill/src/scss/pill";

    .vl-info-tile__header__subtitle {
        word-wrap: break-word !important;
    }
</style>
