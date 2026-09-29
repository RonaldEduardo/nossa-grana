<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { Transaction } from '@/entities/transaction/model/transaction'
import { responsibles } from '@/entities/transaction/model/transaction'
import { recurrenceFeatures, transactionFeatures } from '@/app/composition/features'

const currentDate = new Date()
const selectedMonth = ref(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`)
const transactions = ref<Transaction[]>([])

const monthTransactions = computed(() =>
  transactions.value
    .filter((transaction) => transaction.competence === selectedMonth.value)
    .sort((first, second) => priority(first) - priority(second)),
)
function priority(transaction: Transaction) { return transaction.needsValue ? 0 : transaction.type === 'SAIDA' && transaction.status === 'PENDENTE' ? 1 : 2 }
const summary = computed(() => {
  const entries = monthTransactions.value
    .filter((transaction) => transaction.type === 'ENTRADA')
    .reduce((total, transaction) => total + transaction.amountCents, 0)
  const exits = monthTransactions.value
    .filter((transaction) => transaction.type === 'SAIDA')
    .reduce((total, transaction) => total + transaction.amountCents, 0)
  const paid = monthTransactions.value
    .filter((transaction) => transaction.type === 'SAIDA' && transaction.status === 'PAGO')
    .reduce((total, transaction) => total + transaction.amountCents, 0)
  const pending = monthTransactions.value
    .filter((transaction) => transaction.type === 'SAIDA' && transaction.status === 'PENDENTE')
    .reduce((total, transaction) => total + transaction.amountCents, 0)
  return { entries, exits, paid, pending, balance: entries - exits }
})

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const formatCurrency = (amountCents: number) => currency.format(amountCents / 100)
const monthLabel = computed(() => new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(`${selectedMonth.value}-01T12:00:00`)))
const responsibleSummary = computed(() => responsibles.map((responsible) => ({
  responsible,
  balance: monthTransactions.value.filter((transaction) => transaction.responsible === responsible).reduce((total, transaction) => total + (transaction.type === 'ENTRADA' ? transaction.amountCents : -transaction.amountCents), 0),
})))

async function refreshForMonth() {
  await recurrenceFeatures.ensureRecurrencesForMonth(selectedMonth.value)
  transactions.value = await transactionFeatures.getTransactions()
}

onMounted(refreshForMonth)

async function changeMonth(offset: number) {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const next = new Date(year, month - 1 + offset, 1)
  selectedMonth.value = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
  await refreshForMonth()
}

async function goToCurrentMonth() {
  selectedMonth.value = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  await refreshForMonth()
}

async function editValue(transaction: Transaction) {
  const value = window.prompt('Informe o valor', String(transaction.amountCents / 100))
  if (value === null) return
  const amountCents = Math.round(Number(value.replace(',', '.')) * 100)
  if (!Number.isInteger(amountCents) || amountCents < 0) return
  await transactionFeatures.updateTransactionAmount(transaction.id, amountCents)
  transactions.value = await transactionFeatures.getTransactions()
}

async function togglePaid(id: string) {
  await transactionFeatures.toggleTransactionPaid(id)
  transactions.value = await transactionFeatures.getTransactions()
}

async function remove(id: string) {
  const transaction = transactions.value.find((item) => item.id === id)
  const deleteGroup = transaction?.installmentGroupId
    ? window.confirm('Excluir todas as parcelas desta compra? Clique em Cancelar para excluir somente esta parcela.')
    : false
  if (!transaction || (!transaction.installmentGroupId && !window.confirm('Excluir este lancamento?'))) return
  await transactionFeatures.deleteTransaction(id, deleteGroup)
  transactions.value = await transactionFeatures.getTransactions()
}
</script>

<template>
  <section class="month-controls" aria-label="Competencia selecionada">
    <button type="button" aria-label="Mes anterior" @click="changeMonth(-1)">&larr;</button>
    <div>
      <strong>{{ monthLabel }}</strong>
      <button type="button" class="link-button" @click="goToCurrentMonth">Mes atual</button>
    </div>
    <button type="button" aria-label="Proximo mes" @click="changeMonth(1)">&rarr;</button>
  </section>

  <section class="balance-card" :class="{ negative: summary.balance < 0 }" aria-label="Saldo previsto">
    <span>Saldo previsto</span>
    <strong>{{ formatCurrency(summary.balance) }}</strong>
  </section>

  <section class="summary" aria-label="Resumo mensal">
    <div><span>Entradas</span><strong>{{ formatCurrency(summary.entries) }}</strong></div>
    <div><span>Saidas</span><strong>{{ formatCurrency(summary.exits) }}</strong></div>
    <div><span>Pago (saidas)</span><strong>{{ formatCurrency(summary.paid) }}</strong></div>
    <div><span>Pendente (saidas)</span><strong>{{ formatCurrency(summary.pending) }}</strong></div>
  </section>

  <section class="transactions-section">
    <div class="section-heading"><div><p class="eyebrow">Visao do mes</p><h1>Lancamentos</h1></div><RouterLink to="/transactions/new" class="button primary compact-action">Novo</RouterLink></div>
    <p v-if="monthTransactions.length === 0" class="empty">Nenhum lancamento nesta competencia.</p>
    <div v-else class="transaction-list">
      <article v-for="transaction in monthTransactions" :key="transaction.id" class="transaction-card">
        <div>
          <strong>{{ transaction.description }}<template v-if="transaction.installmentNumber"> {{ transaction.installmentNumber }}/{{ transaction.installmentCount }}</template></strong>
          <p class="transaction-value">{{ formatCurrency(transaction.amountCents) }} <span>&middot; {{ transaction.date }}</span></p>
          <p>{{ transaction.responsible }} &middot; {{ transaction.paymentMethod }}</p>
          <span v-if="transaction.needsValue" class="status-chip warning">Valor a informar</span>
          <span v-else-if="transaction.status === 'PAGO'" class="status-chip paid">Pago{{ transaction.paidAt ? ` em ${transaction.paidAt.slice(0, 10)}` : '' }}</span>
          <span v-else class="status-chip pending">Pendente</span>
        </div>
        <div class="actions">
          <RouterLink :to="`/transactions/${transaction.id}/edit`">Editar</RouterLink>
          <button v-if="transaction.needsValue" type="button" @click="editValue(transaction)">Editar valor</button>
          <button type="button" :class="{ primary: transaction.status === 'PENDENTE' }" @click="togglePaid(transaction.id)">{{ transaction.status === 'PAGO' ? 'Desmarcar pago' : 'Marcar como pago' }}</button>
          <button v-if="!transaction.goalMovementId" type="button" class="danger" @click="remove(transaction.id)">Excluir</button>
        </div>
      </article>
    </div>
  </section>
  <section class="responsible-section" aria-label="Resumo por responsavel"><div class="section-heading"><div><p class="eyebrow">Distribuicao</p><h2>Por responsavel</h2></div></div><div class="responsible-summary"><div v-for="item in responsibleSummary" :key="item.responsible"><span>{{ item.responsible }}</span><strong>{{ formatCurrency(item.balance) }}</strong></div></div></section>
</template>
