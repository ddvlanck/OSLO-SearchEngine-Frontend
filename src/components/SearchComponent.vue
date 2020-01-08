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
                        <vl-button disabled>Zoek</vl-button>
                        <vl-input-field id="map-address-03" name="map-address-03" mod-block/>
                        <vl-input-addon @click="executeQuery" tag-name="button" tooltip="" type="button" icon="search" text="Zoeken"/>
                    </vl-input-group>
                </vl-column>
                <vl-column id="options">
                        <vl-checkbox id="checkbox-ap" name="checkbox-ap" value="vocap">Vocabularium & Applicatieprofiel</vl-checkbox>
                        <vl-checkbox id="checkbox-class" name="checkbox-class" value="class" >Klasse</vl-checkbox>
                        <vl-checkbox id="checkbox-property" name="checkbox-property" value="property" >Eigenschap</vl-checkbox>
                        <vl-checkbox id="checkbox-doc" name="checkbox-name-doc" value="doc">Documentatie</vl-checkbox>
                        <vl-checkbox id="checkbox-context" name="checkbox-name-context" value="context">Context</vl-checkbox>
                </vl-column>
            </vl-grid>
        </vl-layout>
    </div>
</template>

<script>

    export default {
        name: "SearchComponent",
        data() {
            return {

            }
        },
        methods : {
            getCheckboxValues: function(){
                document.querySelectorAll('input[type=checkbox]:checked').forEach( input => {
                    console.log(input.value);
                });
            },
            executeQuery(){
                // Get values of checked checkboxes
                document.querySelectorAll('input[type=checkbox]:checked').forEach( input => {
                    console.log(input.value);
                });

                const data = new URLSearchParams();
                data.append('query', 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
                    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
                    'SELECT ?uri WHERE {\n' +
                    '\t?uri rdfs:label "Persoon"@nl.\n' +
                    '   filter(STRSTARTS(str(?uri),"https://data.vlaanderen.be")).\n' +
                    '}');
                fetch('https://data.vlaanderen.be/sparql', {
                    method : 'POST',
                    headers : {
                        'Accept' : 'application/sparql-results+json'
                    },
                    body : data
                }).then(res => res.json()).then(data => {
                    console.log(data.results.bindings[0].uri.value);
                })
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

    .vl-button:hover {
        background-color: #0055cc;
    }



</style>
