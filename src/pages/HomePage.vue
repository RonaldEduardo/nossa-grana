<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { Transaction } from '@/models/transaction'
import { responsibles } from '@/models/transaction'
import { ensureRecurrencesForMonth } from '@/services/recurrences'
import { deleteTransaction, getTransactions, toggleTransactionPaid, updateTransactionAmount } from '@/services/transactions'

const currentDate = new Date()
const selectedMonth = ref(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`)
ensureRecurrencesForMonth(selectedMonth.value)
const transactions = ref<Transaction[]>(getTransactions())

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
const responsibleSummary = computed(() => responsibles.map((responsible) => ({
  responsible,
  balance: monthTransactions.value.filter((transaction) => transaction.responsible === responsible).reduce((total, transaction) => total + (transaction.type === 'ENTRADA' ? transaction.amountCents : -transaction.amountCents), 0),
})))

function refreshForMonth() {
  ensureRecurrencesForMonth(selectedMonth.value)
  transactions.value = getTransactions()
}

function changeMonth(offset: number) {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const next = new Date(year, month - 1 + offset, 1)
  selectedMonth.value = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
  refreshForMonth()
}

function goToCurrentMonth() {
  selectedMonth.value = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  refreshForMonth()
}

function editValue(transaction: Transaction) {
  const value = window.prompt('Informe o valor', String(transaction.amountCents / 100))
  if (value === null) return
  const amountCents = Math.round(Number(value.replace(',', '.')) * 100)
  if (!Number.isInteger(amountCents) || amountCents < 0) return
  updateTransactionAmount(transaction.id, amountCents)
  transactions.value = getTransactions()
}

function clearTestData() {
  if (!window.confirm('Limpar todos os dados de teste?')) return
  ;['finance.transactions', 'finance.categories', 'finance.recurrences', 'finance.goals', 'finance.goalMovements'].forEach((key) => localStorage.removeItem(key))
  refreshForMonth()
}

function togglePaid(id: string) {
  toggleTransactionPaid(id)
  transactions.value = getTransactions()
}

function remove(id: string) {
  const transaction = transactions.value.find((item) => item.id === id)
  const deleteGroup = transaction?.installmentGroupId
    ? window.confirm('Excluir todas as parcelas desta compra? Clique em Cancelar para excluir somente esta parcela.')
    : false
  if (!transaction || (!transaction.installmentGroupId && !window.confirm('Excluir este lancamento?'))) return
  deleteTransaction(id, deleteGroup)
  transactions.value = getTransactions()
}
</script>

<template>
  <section class="month-controls">
    <button type="button" @click="changeMonth(-1)">Mes anterior</button>
    <div>
      <strong>{{ selectedMonth }}</strong>
      <button type="button" class="link-button" @click="goToCurrentMonth">Mes atual</button>
    </div>
    <button type="button" @click="changeMonth(1)">Proximo mes</button>
  </section>

  <section class="summary" aria-label="Resumo mensal">
    <div><span>Entradas</span><strong>{{ formatCurrency(summary.entries) }}</strong></div>
    <div><span>Saidas</span><strong>{{ formatCurrency(summary.exits) }}</strong></div>
    <div><span>Pago (saidas)</span><strong>{{ formatCurrency(summary.paid) }}</strong></div>
    <div><span>Pendente (saidas)</span><strong>{{ formatCurrency(summary.pending) }}</strong></div>
    <div><span>Saldo previsto</span><strong>{{ formatCurrency(summary.balance) }}</strong></div>
  </section>
  <section class="summary responsible-summary" aria-label="Resumo por responsavel"><div v-for="item in responsibleSummary" :key="item.responsible"><span>{{ item.responsible }}</span><strong>{{ formatCurrency(item.balance) }}</strong></div></section>

  <section class="transactions-section">
    <h1>Lancamentos</h1>
    <p v-if="monthTransactions.length === 0" class="empty">Nenhum lancamento nesta competencia.</p>
    <div v-else class="transaction-list">
      <article v-for="transaction in monthTransactions" :key="transaction.id" class="transaction-card">
        <div>
          <strong>{{ transaction.description }}<template v-if="transaction.installmentNumber"> {{ transaction.installmentNumber }}/{{ transaction.installmentCount }}</template></strong>
          <p>{{ transaction.type }} | {{ formatCurrency(transaction.amountCents) }} | {{ transaction.date }}</p>
          <p>{{ transaction.responsible }} | {{ transaction.paymentMethod }} | <template v-if="transaction.needsValue">Valor a informar</template><template v-else-if="transaction.status === 'PAGO'">Pago em {{ transaction.paidAt?.slice(0, 10) }}</template><template v-else>Pendente</template></p>
        </div>
        <div class="actions">
          <RouterLink :to="`/transactions/${transaction.id}/edit`">Editar</RouterLink>
          <button v-if="transaction.needsValue" type="button" @click="editValue(transaction)">Editar valor</button>
          <button type="button" @click="togglePaid(transaction.id)">{{ transaction.status === 'PAGO' ? 'Desmarcar pago' : 'Marcar como pago' }}</button>
          <button type="button" class="danger" @click="remove(transaction.id)">Excluir</button>
        </div>
      </article>
    </div>
  </section>
  <button type="button" class="danger clear-data" @click="clearTestData">Limpar dados de teste</button>
</template>
