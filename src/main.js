import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false;

import {
  VlCore,
  VlUtil,
  VlGrid,
  VlLayout,
  VlRegion,
  VlTitle,
  VlColumn,
  VlInputGroup,
  VlInputField,
  VlInputAddon,
  VlButton,
  VlFormMessage,
  VlCheckbox,
  VlInfoTile
} from '@govflanders/vl-ui-vue-components';

Vue.component('vl-title', VlTitle);
Vue.component('vl-grid', VlGrid);
Vue.component('vl-region', VlRegion);
Vue.component('vl-layout', VlLayout);
Vue.component('vl-column', VlColumn);
Vue.component('vl-input-group', VlInputGroup);
Vue.component('vl-input-field', VlInputField);
Vue.component('vl-input-addon', VlInputAddon);
Vue.component('vl-button', VlButton);
Vue.component('vl-form-message', VlFormMessage);
Vue.component('vl-checkbox', VlCheckbox);
Vue.component('vl-info-tile', VlInfoTile);

Vue.use(VlCore);
Vue.use(VlUtil);

new Vue({
  render: h => h(App),
}).$mount('#app')
