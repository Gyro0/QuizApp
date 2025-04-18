import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './firebase/firebaseInit'

// Import Bootstrap Vue
import BootstrapVue3 from 'bootstrap-vue-3'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'

// Create the app
const app = createApp(App)

// Use plugins
app.use(router)
app.use(BootstrapVue3)

// Mount the app
app.mount('#app')