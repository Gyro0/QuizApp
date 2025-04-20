import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './firebase/firebaseInit'
import './assets/styles/main.css'

const app = createApp(App)
app.use(router)
app.mount('#app')