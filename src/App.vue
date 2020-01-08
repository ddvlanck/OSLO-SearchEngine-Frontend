<template>
  <div id="app">
    <vl-region>
      <SearchComponent></SearchComponent>
    </vl-region>
    <vl-region>
      <ResultComponent></ResultComponent>
    </vl-region>
  </div>
</template>

<script>

import SearchComponent from "./components/SearchComponent";
import ResultComponent from "./components/ResultComponent";
export default {
  name: 'app',
  components: {
    SearchComponent,
    ResultComponent
  }
}
</script>

<style lang="scss">
  $vl-icon-font-location: "assets/";
  @import "~@govflanders/vl-ui-core/src/scss/core";
  @import "~@govflanders/vl-ui-content-header/src/scss/content-header";
</style>
