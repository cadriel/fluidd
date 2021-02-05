import '@/scss/global.scss'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import VueMeta from 'vue-meta'
import { appInit } from './init'
import { Config } from './store/config/types'
import { FiltersPlugin } from './plugins/filters'
import { SocketPlugin } from './plugins/socketClient'
import { DayJSPlugin } from './plugins/dayjs'
import { AxiosPlugin } from './plugins/axios'
import i18n from './plugins/i18n'
// import { WorkboxPlugin } from './plugins/workbox'
import vueHeadful from 'vue-headful'

import BtnCollapse from '@/components/inputs/BtnCollapse.vue'
import CollapsableCard from '@/components/cards/CollapsableCard.vue'
import InlineHelpIcon from '@/components/inputs/InlineHelpIcon.vue'

Vue.component('btn-collapse', BtnCollapse)
Vue.component('collapsable-card', CollapsableCard)
Vue.component('vue-headful', vueHeadful)
Vue.component('inline-help', InlineHelpIcon)

// Use any Plugins
Vue.use(AxiosPlugin)
Vue.use(DayJSPlugin)
Vue.use(FiltersPlugin)
Vue.use(VueMeta)
// Vue.use(WorkboxPlugin)

appInit()
  .then((config: Config) => {
    console.debug('Loaded App Configuration', config)

    // Set vuetify to the correct initial theme.
    // if (store.state.config && store.state.config.fileConfig.general) {
    //   vuetify.framework.theme.dark = store.state.config.fileConfig.general.darkMode
    // }

    // Init the socket plugin
    Vue.use(SocketPlugin, {
      url: config.apiConfig.socketUrl,
      reconnectEnabled: true,
      reconnectInterval: 3000,
      store
    })

    if (config.apiConfig.socketUrl) {
      Vue.$socket.connect(config.apiConfig.socketUrl)
    }

    // Init Vue
    Vue.config.productionTip = false
    new Vue({
      router,
      i18n,
      store,
      vuetify,
      render: (h) => h(App)
    }).$mount('#app')
  })
  .catch((e) => {
    console.debug('Error attempting to init App:', e)
  })
