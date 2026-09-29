<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { behaviors, necessities, paymentMethods, responsibles, transactionTypes, type Behavior, type Necessity, type TransactionInput } from '@/models/transaction'
import { getCategories } from '@/services/categories'
import { createCreditPurchase, createTransaction, getTransaction, updateTransaction } from '@/services/transactions'

const route = useRoute()
const router = useRouter()
const id = typeof route.params.id === 'string' ? route.params.id : undefined
const existing = id ? getTransaction(id) : undefined
const error = ref('')
const isEditing = computed(() => Boolean(id))
const categories = getCategories()

const form = reactive({
  type: existing?.type ?? 'SAIDA',
  description: existing?.description ?? '',
  amount: existing ? existing.amountCents / 100 : 0,
  date: existing?.date ?? new Date().toISOString().slice(0, 10),
  responsible: existing?.responsible ?? 'CASA',
  paymentMethod: existing?.paymentMethod ?? 'PIX',
  notes: existing?.notes ?? '',
  categoryId: existing?.categoryId ?? '',
  subcategoryId: existing?.subcategoryId ?? '',
  behavior: existing?.behavior ?? '',
  necessity: existing?.necessity ?? '',
  installmentCount: existing?.installmentCount ?? 1,
})

const selectedCategory = computed(() => categories.find((category) => category.id === form.categoryId))
const isCredit = computed(() => form.paymentMethod === 'CREDITO')

watch(() => form.categoryId, () => {
  if (!selectedCategory.value?.subcategories.some((subcategory) => subcategory.id === form.subcategoryId)) {
    form.subcategoryId = ''
  }
})

function submit() {
  error.value = ''
  if (!form.description.trim() || !form.date || form.amount <= 0 || !form.categoryId || !form.behavior || !form.necessity) {
    error.value = 'Informe descricao, valor maior que zero, data e classificacao.'
    return
  }
  if (isCredit.value && (!Number.isInteger(form.installmentCount) || form.installmentCount < 1)) {
    error.value = 'Informe um numero de parcelas valido.'
    return
  }
  try {
    const input: TransactionInput = {
      type: form.type,
      description: form.description.trim(),
      amountCents: Math.round(form.amount * 100),
      date: form.date,
      responsible: form.responsible,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim(),
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || null,
      behavior: form.behavior as Behavior,
      necessity: form.necessity as Necessity,
    }
    if (id) updateTransaction(id, input)
    else if (isCredit.value) createCreditPurchase(input, form.installmentCount)
    else createTransaction(input)
    router.push('/')
  } catch (exception) {
    error.value = exception instanceof Error ? exception.message : 'Nao foi possivel salvar o lancamento.'
  }
}
</script>

<template>
  <section class="form-page">
    <h1>{{ isEditing ? 'Editar lancamento' : 'Novo lancamento' }}</h1>
    <p v-if="id && !existing" class="error">Lancamento nao encontrado.</p>
    <form v-else @submit.prevent="submit">
      <label>Tipo<select v-model="form.type"><option v-for="type in transactionTypes" :key="type" :value="type">{{ type }}</option></select></label>
      <label>Descricao<input v-model="form.description" required /></label>
      <label>Valor total<input v-model.number="form.amount" type="number" min="0.01" step="0.01" required /></label>
      <label>Data<input v-model="form.date" type="date" required /></label>
      <label>Responsavel<select v-model="form.responsible"><option v-for="responsible in responsibles" :key="responsible" :value="responsible">{{ responsible }}</option></select></label>
      <label>Forma de pagamento<select v-model="form.paymentMethod"><option v-for="method in paymentMethods" :key="method" :value="method">{{ method }}</option></select></label>
      <label v-if="isCredit && !isEditing">Numero de parcelas<input v-model.number="form.installmentCount" type="number" min="1" step="1" required /></label>
      <label>Categoria<select v-model="form.categoryId" required><option value="" disabled>Selecione</option><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option></select></label>
      <label>Subcategoria<select v-model="form.subcategoryId"><option value="">Nenhuma</option><option v-for="subcategory in selectedCategory?.subcategories ?? []" :key="subcategory.id" :value="subcategory.id">{{ subcategory.name }}</option></select></label>
      <label>Comportamento<select v-model="form.behavior" required><option value="" disabled>Selecione</option><option v-for="behavior in behaviors" :key="behavior" :value="behavior">{{ behavior }}</option></select></label>
      <label>Necessidade<select v-model="form.necessity" required><option value="" disabled>Selecione</option><option v-for="necessity in necessities" :key="necessity" :value="necessity">{{ necessity }}</option></select></label>
      <label>Observacao<textarea v-model="form.notes" rows="3" /></label>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="form-actions"><RouterLink to="/">Cancelar</RouterLink><button class="primary" type="submit">Salvar</button></div>
    </form>
  </section>
</template>
