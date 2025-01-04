import { createRouter, createWebHistory } from 'vue-router'
import ModelView from '@/views/ModelView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ModelView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 