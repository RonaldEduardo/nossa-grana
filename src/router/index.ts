import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import TransactionFormPage from '@/pages/TransactionFormPage.vue'
import CategoriesPage from '@/pages/CategoriesPage.vue'
import RecurrencesPage from '@/pages/RecurrencesPage.vue'
import GoalsPage from '@/pages/GoalsPage.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/transactions/new', component: TransactionFormPage },
    { path: '/transactions/:id/edit', component: TransactionFormPage },
    { path: '/categories', component: CategoriesPage },
    { path: '/recurrences', component: RecurrencesPage },
    { path: '/goals', component: GoalsPage },
  ],
})
