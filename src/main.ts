import { createApp } from 'vue'
import '@/styles/index.css'
import App from '@/App.vue'
import i18n from '@/locales/index'

const app = createApp(App)
app.use(i18n)
app.mount('#app')
