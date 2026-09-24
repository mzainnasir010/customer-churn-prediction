import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Overview', component: () => import('../views/HomeView.vue') },
    { path: '/predict', name: 'Predict', component: () => import('../views/PredictView.vue') },
    { path: '/model', name: 'Model', component: () => import('../views/ModelView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})