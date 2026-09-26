import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { vReveal } from './composables/reveal'
import './styles/main.css'

createApp(App)
  .use(createPinia())
  .use(router)
  .directive('reveal', vReveal)
  .mount('#app')