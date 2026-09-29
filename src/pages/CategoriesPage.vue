<script setup lang="ts">
import { ref } from 'vue'
import type { Category } from '@/models/category'
import {
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  getCategories,
  updateCategory,
  updateSubcategory,
} from '@/services/categories'

const categories = ref<Category[]>(getCategories())
const error = ref('')
const newCategoryName = ref('')
const subcategoryNames = ref<Record<string, string>>({})

function refresh() {
  categories.value = getCategories()
}

function run(action: () => void) {
  error.value = ''
  try {
    action()
    refresh()
  } catch (exception) {
    error.value = exception instanceof Error ? exception.message : 'Nao foi possivel atualizar categorias.'
  }
}

function addCategory() {
  if (!newCategoryName.value.trim()) return
  run(() => createCategory(newCategoryName.value))
  newCategoryName.value = ''
}

function editCategory(category: Category) {
  const name = window.prompt('Nome da categoria', category.name)
  if (name?.trim()) run(() => updateCategory(category.id, name))
}

function addSubcategory(category: Category) {
  const name = subcategoryNames.value[category.id]?.trim()
  if (!name) return
  run(() => createSubcategory(category.id, name))
  subcategoryNames.value[category.id] = ''
}

function editSubcategory(categoryId: string, subcategoryId: string, currentName: string) {
  const name = window.prompt('Nome da subcategoria', currentName)
  if (name?.trim()) run(() => updateSubcategory(categoryId, subcategoryId, name))
}
</script>

<template>
  <section class="categories-page">
    <h1>Categorias</h1>
    <form class="inline-form" @submit.prevent="addCategory">
      <label>Nova categoria<input v-model="newCategoryName" /></label>
      <button class="primary" type="submit">Adicionar</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>

    <div class="category-list">
      <article v-for="category in categories" :key="category.id" class="category-card">
        <div class="category-heading"><strong>{{ category.name }}</strong><span><button type="button" @click="editCategory(category)">Editar</button><button type="button" class="danger" @click="run(() => deleteCategory(category.id))">Excluir</button></span></div>
        <ul v-if="category.subcategories.length">
          <li v-for="subcategory in category.subcategories" :key="subcategory.id">{{ subcategory.name }} <button type="button" @click="editSubcategory(category.id, subcategory.id, subcategory.name)">Editar</button> <button type="button" class="danger" @click="run(() => deleteSubcategory(category.id, subcategory.id))">Excluir</button></li>
        </ul>
        <form class="inline-form" @submit.prevent="addSubcategory(category)">
          <label>Nova subcategoria<input v-model="subcategoryNames[category.id]" /></label>
          <button type="submit">Adicionar</button>
        </form>
      </article>
    </div>
  </section>
</template>
