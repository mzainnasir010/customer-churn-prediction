import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../views/HomeView.vue'), meta: { title: 'Overview' } },
    { path: '/predict', component: () => import('../views/PredictView.vue'), meta: { title: 'Prediction Studio' } },
        { path: '/batch', component: () => import('../views/BatchView.vue'), meta: { title: 'Batch Prediction' } },
    { path: '/insights', component: () => import('../views/InsightsView.vue'), meta: { title: 'Churn Insights' } },
    { path: '/model', component: () => import('../views/ModelView.vue'), meta: { title: 'Model Intelligence' } },
    { path: '/simulator', component: () => import('../views/SimulatorView.vue'), meta: { title: 'Retention Simulator' } },
    { path: '/methodology', component: () => import('../views/MethodologyView.vue'), meta: { title: 'Methodology' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
router.afterEach((to) => { document.title = `${String(to.meta.title)} | ChurnIQ` })
export default router