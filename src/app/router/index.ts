import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/home/HomePage.vue'
import TransactionFormPage from '@/pages/transactions/TransactionFormPage.vue'
import CategoriesPage from '@/pages/categories/CategoriesPage.vue'
import RecurrencesPage from '@/pages/recurrences/RecurrencesPage.vue'
import GoalsPage from '@/pages/goals/GoalsPage.vue'

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
