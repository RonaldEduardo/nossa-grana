<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Category } from '@/entities/category/model/category'
import { categoryFeatures } from '@/app/composition/features'

const categories = ref<Category[]>([])
const error = ref('')
const newCategoryName = ref('')
const subcategoryNames = ref<Record<string, string>>({})
const expandedCategoryId = ref<string | null>(null)

async function refresh() {
  categories.value = await categoryFeatures.getCategories()
}

onMounted(refresh)

async function run(action: () => Promise<void>) {
  error.value = ''
  try {
    await action()
    await refresh()
  } catch (exception) {
    error.value = exception instanceof Error ? exception.message : 'Nao foi possivel atualizar categorias.'
  }
}

async function addCategory() {
  if (!newCategoryName.value.trim()) return
  await run(() => categoryFeatures.createCategory(newCategoryName.value))
  newCategoryName.value = ''
}

async function editCategory(category: Category) {
  const name = window.prompt('Nome da categoria', category.name)
  if (name?.trim()) await run(() => categoryFeatures.updateCategory(category.id, name))
}

async function addSubcategory(category: Category) {
  const name = subcategoryNames.value[category.id]?.trim()
  if (!name) return
  await run(() => categoryFeatures.createSubcategory(category.id, name))
  subcategoryNames.value[category.id] = ''
}

function toggleSubcategoryForm(categoryId: string) {
  expandedCategoryId.value = expandedCategoryId.value === categoryId ? null : categoryId
}

async function editSubcategory(categoryId: string, subcategoryId: string, currentName: string) {
  const name = window.prompt('Nome da subcategoria', currentName)
  if (name?.trim()) await run(() => categoryFeatures.updateSubcategory(categoryId, subcategoryId, name))
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
        <div class="category-heading"><strong>{{ category.name }}</strong><span><button type="button" @click="editCategory(category)">Editar</button><button type="button" class="danger" @click="run(() => categoryFeatures.deleteCategory(category.id))">Excluir</button></span></div>
        <ul v-if="category.subcategories.length">
          <li v-for="subcategory in category.subcategories" :key="subcategory.id">{{ subcategory.name }} <button type="button" @click="editSubcategory(category.id, subcategory.id, subcategory.name)">Editar</button> <button type="button" class="danger" @click="run(() => categoryFeatures.deleteSubcategory(category.id, subcategory.id))">Excluir</button></li>
        </ul>
        <button type="button" class="soft-button" @click="toggleSubcategoryForm(category.id)">{{ expandedCategoryId === category.id ? 'Cancelar' : 'Adicionar subcategoria' }}</button>
        <form v-if="expandedCategoryId === category.id" class="inline-form" @submit.prevent="addSubcategory(category)">
          <label>Nova subcategoria<input v-model="subcategoryNames[category.id]" /></label>
          <button type="submit">Adicionar</button>
        </form>
      </article>
    </div>
  </section>
</template>
