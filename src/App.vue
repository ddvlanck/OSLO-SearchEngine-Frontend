<template>
  <div id="app">
    <vl-region>
      <SearchComponent></SearchComponent>
    </vl-region>
  </div>
</template>

<script>

import SearchComponent from "./components/SearchComponent";
export default {
  name: 'app',
  components: {
    SearchComponent
  }
}
</script>

<style lang="scss">
  $vl-icon-font-location: "assets/";
  @import "~@govflanders/vl-ui-core/src/scss/core";
  @import "~@govflanders/vl-ui-content-header/src/scss/content-header";
</style>
