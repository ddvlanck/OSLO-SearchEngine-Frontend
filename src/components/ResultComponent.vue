<template>
    <div>
        <vl-layout>
            <vl-grid mod-stacked>
                <!--<vl-column>
                    <div id="resultTitle" class="vl-u-hr">
                        <vl-title tag-name="h3">Resultaten ({{this.URLResults.length}})</vl-title>
                    </div>
                </vl-column>-->
                <!--<vl-column width="8" v-for="result in this.URLResults">
                    <vl-info-tile
                            :href= result.url
                            target="_blank"
                            :title= result.url
                            v-bind:subtitle= "'Laatst aangepast op ' + result.lastmod">
                            {{ result.type }}
                    </vl-info-tile>
                </vl-column>-->
                <vl-column>
                    <vl-tabs v-if="this.URLResults.length > 0 || this.fragmentIdentifierResults.length > 0">
                        <vl-tab v-bind:label="'Vocbularium & applicatieprofielen (' + this.URLResults.length + ')'"
                                id="voc_ap" selected>
                            <vl-column width="8" v-for="result in this.URLResults">
                                <vl-info-tile
                                        :href=result.url
                                        target="_blank"
                                        :title=result.url
                                        subtitle="">
                                    {{ result.type }}
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
                                        :title=result.url
                                        subtitle="">
                                    {{ result.type }}
                                </vl-info-tile>
                                <br>
                            </vl-column>
                        </vl-tab>
                    </vl-tabs>
                </vl-column>
            </vl-grid>
        </vl-layout>
    </div>
</template>

<script>
    import EventBus from '../../eventbus.js';

    const VueScrollTo = require('vue-scrollto');


    let scrollOptions = {
        container: '#resultTitle',
        easing: 'ease-in',
        offset: -60,
        force: true,
        cancelable: true,
    }

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

                // TODO : test this
                this.URLResults.sort((a, b) => (a.priority > b.priority) ? 1 : -1); // Sort according priority (correctness?)
                this.URLResults.sort((a, b) => (a.url < b.url) ? -1 : (a.url > b.url) ? 1 : 0);

                //VueScrollTo.scrollTo('#resultTitle');
            },
            processFragmentIdentifierResults(results) {
                this.fragmentIdentifierResults = [];

                for (let index in results) {
                    let fi = {};
                    fi.url = results[index]._source.url;
                    fi.type = results[index]._source.type;
                    this.fragmentIdentifierResults.push(fi);
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
</style>
