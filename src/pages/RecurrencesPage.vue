<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { behaviors, necessities, paymentMethods, responsibles, transactionTypes, type Behavior, type Necessity } from '@/models/transaction'
import { recurrenceValueTypes, type Recurrence, type RecurrenceInput } from '@/models/recurrence'
import { getCategories } from '@/services/categories'
import { createRecurrence, deleteRecurrence, getRecurrences, toggleRecurrence, updateRecurrence } from '@/services/recurrences'

const categories = getCategories()
const recurrences = ref(getRecurrences())
const error = ref('')
const editingId = ref<string | null>(null)
const currentMonth = new Date().toISOString().slice(0, 7)
const form = reactive({ description: '', type: 'SAIDA', categoryId: '', subcategoryId: '', responsible: 'CASA', paymentMethod: 'PIX', behavior: '', necessity: '', dueDay: 1, recurrenceValueType: 'FIXED', defaultAmount: 0, active: true, startMonth: currentMonth })
const selectedCategory = computed(() => categories.find((category) => category.id === form.categoryId))

function refresh() { recurrences.value = getRecurrences() }
function reset() { Object.assign(form, { description: '', type: 'SAIDA', categoryId: '', subcategoryId: '', responsible: 'CASA', paymentMethod: 'PIX', behavior: '', necessity: '', dueDay: 1, recurrenceValueType: 'FIXED', defaultAmount: 0, active: true, startMonth: currentMonth }); editingId.value = null }
function submit() {
  error.value = ''
  if (!form.description.trim() || !form.categoryId || !form.behavior || !form.necessity || !form.startMonth || (form.recurrenceValueType === 'FIXED' && form.defaultAmount <= 0)) { error.value = 'Preencha descricao, classificacao, mes inicial e valor da recorrencia fixa.'; return }
  const input: RecurrenceInput = { description: form.description.trim(), type: form.type as RecurrenceInput['type'], categoryId: form.categoryId, subcategoryId: form.subcategoryId || null, responsible: form.responsible as RecurrenceInput['responsible'], paymentMethod: form.paymentMethod as RecurrenceInput['paymentMethod'], behavior: form.behavior as Behavior, necessity: form.necessity as Necessity, dueDay: form.dueDay || null, recurrenceValueType: form.recurrenceValueType as RecurrenceInput['recurrenceValueType'], defaultAmountCents: Math.round(form.defaultAmount * 100), active: form.active, startMonth: form.startMonth }
  if (editingId.value) updateRecurrence(editingId.value, input); else createRecurrence(input)
  refresh(); reset()
}
function edit(recurrence: Recurrence) { Object.assign(form, { ...recurrence, defaultAmount: recurrence.defaultAmountCents / 100 }); editingId.value = recurrence.id }
</script>

<template>
  <section class="form-page">
    <h1>{{ editingId ? 'Editar recorrencia' : 'Nova recorrencia' }}</h1>
    <form @submit.prevent="submit">
      <label>Descricao<input v-model="form.description" /></label>
      <label>Tipo<select v-model="form.type"><option v-for="item in transactionTypes" :key="item" :value="item">{{ item }}</option></select></label>
      <label>Categoria<select v-model="form.categoryId"><option value="" disabled>Selecione</option><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option></select></label>
      <label>Subcategoria<select v-model="form.subcategoryId"><option value="">Nenhuma</option><option v-for="item in selectedCategory?.subcategories ?? []" :key="item.id" :value="item.id">{{ item.name }}</option></select></label>
      <label>Responsavel<select v-model="form.responsible"><option v-for="item in responsibles" :key="item" :value="item">{{ item }}</option></select></label>
      <label>Forma de pagamento<select v-model="form.paymentMethod"><option v-for="item in paymentMethods" :key="item" :value="item">{{ item }}</option></select></label>
      <label>Comportamento<select v-model="form.behavior"><option value="" disabled>Selecione</option><option v-for="item in behaviors" :key="item" :value="item">{{ item }}</option></select></label>
      <label>Necessidade<select v-model="form.necessity"><option value="" disabled>Selecione</option><option v-for="item in necessities" :key="item" :value="item">{{ item }}</option></select></label>
      <label>Dia de vencimento<input v-model.number="form.dueDay" type="number" min="1" max="28" /></label>
      <label>Tipo de valor<select v-model="form.recurrenceValueType"><option v-for="item in recurrenceValueTypes" :key="item" :value="item">{{ item }}</option></select></label>
      <label v-if="form.recurrenceValueType === 'FIXED'">Valor padrao<input v-model.number="form.defaultAmount" type="number" min="0.01" step="0.01" /></label>
      <label>Mes inicial<input v-model="form.startMonth" type="month" /></label>
      <label class="checkbox"><input v-model="form.active" type="checkbox" /> Ativa</label>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="form-actions"><button v-if="editingId" type="button" @click="reset">Cancelar</button><button class="primary" type="submit">Salvar</button></div>
    </form>
  </section>
  <section class="list-page"><h2>Recorrencias cadastradas</h2><p v-if="!recurrences.length" class="empty">Nenhuma recorrencia cadastrada.</p><article v-for="recurrence in recurrences" :key="recurrence.id" class="transaction-card"><div><strong>{{ recurrence.description }}</strong><p>{{ recurrence.recurrenceValueType }} | {{ recurrence.active ? 'Ativa' : 'Inativa' }} | desde {{ recurrence.startMonth }}</p></div><div class="actions"><button type="button" @click="edit(recurrence)">Editar</button><button type="button" @click="toggleRecurrence(recurrence.id); refresh()">{{ recurrence.active ? 'Desativar' : 'Ativar' }}</button><button type="button" class="danger" @click="deleteRecurrence(recurrence.id); refresh()">Excluir</button></div></article></section>
</template>
