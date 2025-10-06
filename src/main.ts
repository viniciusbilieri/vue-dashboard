/**
 * Main application entry point
 * Configures Vue app with PrimeVue, TailwindCSS, Chart.js and Pinia
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import App from './App.vue'
import Dashboard from './pages/Dashboard.vue'

import 'primevue/resources/themes/lara-light-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

// Mount Dashboard component directly instead of using router
app.component('Dashboard', Dashboard)

app.use(pinia)
app.use(PrimeVue)
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')
