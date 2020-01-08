<template>
    <div>
        <vl-layout>
            <vl-grid mod-stacked>
                <vl-column>
                    <div id="resultTitle" class="vl-u-hr">
                        <vl-title tag-name="h3">Resultaten ({{this.results.length}})</vl-title>
                    </div>
                </vl-column>
                <vl-column width="8" v-for="result in this.results">
                    <vl-info-tile
                            :href= result.url
                            target="_blank"
                            :title= result.url
                            v-bind:subtitle= "'Laatst aangepast op ' + result.lastmod">
                            {{ result.type }}
                    </vl-info-tile>
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
                results: []
            }
        },
        methods: {
            processResults(results){
                this.results = [];

                for(let index in results){
                    let result = {};
                    result.url = results[index]._source.url;
                    result.lastmod = results[index]._source.lastmod;
                    result.priority = results[index]._source.priority;
                    result.type = results[index]._source.type
                    this.results.push(result);
                }

                // TODO : test this
                this.results.sort( (a,b) => (a.priority > b.priority) ? 1 : -1); // Sort according priority (correctness?)
                this.results.sort( (a,b) => (a.url < b.url) ? -1 : (a.url > b.url) ? 1 : 0);

                VueScrollTo.scrollTo('#resultTitle');
            }
        },
        mounted() {
            EventBus.$on('results', results => this.processResults(results));
        }
    }
</script>

<style lang="scss">
    @import "~@govflanders/vl-ui-core/src/scss/core";
    @import "~@govflanders/vl-ui-info-tile/src/scss/info-tile";
</style>
