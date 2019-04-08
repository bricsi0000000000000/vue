import Vue from 'vue'
import App from './App.vue'
import Dropdown from 'hsy-vue-dropdown'

Vue.config.productionTip = false
Vue.use(Dropdown)

new Vue({
  render: h => h(App),
}).$mount('#app')
