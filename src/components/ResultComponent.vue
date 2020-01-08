<template>
    <div>
        <vl-layout>
            <vl-grid mod-stacked>
                <vl-column width="7" v-for="result in this.results">
                    <vl-info-tile
                            :href= result.url
                            target="_blank"
                            :title= result.url
                            v-bind:subtitle= "'Laatst aangepast op s' + result.lastmod">
                            {{ result.type }}
                    </vl-info-tile>
                </vl-column>
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
