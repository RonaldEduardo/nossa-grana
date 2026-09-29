<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { goalMovementTypes, type Goal, type GoalMovement } from '@/entities/goal/model/goal'
import { goalFeatures } from '@/app/composition/features'

const goals = ref<Awaited<ReturnType<typeof goalFeatures.getGoals>>>([])
const summaries = ref<Record<string, { balanceCents: number; suggestionCents: number | null }>>({})
const goalMovements = ref<Record<string, GoalMovement[]>>({})
const error = ref('')
const name = ref('')
const targetAmount = ref(0)
const targetDate = ref('')
const movementValues = ref<Record<string, { type: 'CONTRIBUTION' | 'WITHDRAWAL'; amount: number; date: string; note: string }>>({})
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const currentMonth = new Date().toISOString().slice(0, 7)

async function refresh() { goals.value = await goalFeatures.getGoals(); summaries.value = Object.fromEntries(await Promise.all(goals.value.map(async (goal) => [goal.id, await goalFeatures.getGoalSummary(goal, currentMonth)]))) as Record<string, { balanceCents: number; suggestionCents: number | null }>; goalMovements.value = Object.fromEntries(await Promise.all(goals.value.map(async (goal) => [goal.id, await goalFeatures.getGoalMovements(goal.id)]))) as Record<string, GoalMovement[]> }
onMounted(refresh)
function summary(goal: Goal) { return summaries.value[goal.id] ?? { balanceCents: 0, suggestionCents: null } }
function movements(goalId: string) { return goalMovements.value[goalId] ?? [] }
async function addGoal() { error.value = ''; if (!name.value.trim() || targetAmount.value <= 0 || !targetDate.value) { error.value = 'Informe nome, objetivo e prazo.'; return }; await goalFeatures.createGoal(name.value, Math.round(targetAmount.value * 100), targetDate.value); name.value = ''; targetAmount.value = 0; targetDate.value = ''; await refresh() }
function movementForm(id: string) { return movementValues.value[id] ?? (movementValues.value[id] = { type: 'CONTRIBUTION', amount: 0, date: new Date().toISOString().slice(0, 10), note: '' }) }
async function addMovement(goalId: string) { const form = movementForm(goalId); if (form.amount <= 0 || !form.date) return; await goalFeatures.createGoalMovement(goalId, form.type, Math.round(form.amount * 100), form.date, form.note); movementValues.value[goalId] = { type: 'CONTRIBUTION', amount: 0, date: new Date().toISOString().slice(0, 10), note: '' }; await refresh() }
async function toggleGoalAction(id: string) { await goalFeatures.toggleGoal(id); await refresh() }
async function deleteGoalAction(id: string) { await goalFeatures.deleteGoal(id); await refresh() }
async function deleteGoalMovementAction(id: string) { await goalFeatures.deleteGoalMovement(id); await refresh() }
</script>

<template>
  <section class="form-page"><h1>Metas e reservas</h1><form @submit.prevent="addGoal"><label>Nome<input v-model="name" /></label><label>Valor objetivo<input v-model.number="targetAmount" type="number" min="0.01" step="0.01" inputmode="decimal" /></label><label>Prazo<input v-model="targetDate" type="month" /></label><p v-if="error" class="error">{{ error }}</p><button class="primary" type="submit">Criar meta</button></form></section>
  <section class="list-page"><article v-for="goal in goals" :key="goal.id" class="goal-card"><div><h2>{{ goal.name }}</h2><p>Saldo: <strong>{{ currency.format(summary(goal).balanceCents / 100) }}</strong> de {{ currency.format(goal.targetAmountCents / 100) }}</p><p v-if="summary(goal).suggestionCents !== null">Sugestao mensal: {{ currency.format((summary(goal).suggestionCents ?? 0) / 100) }}</p><p v-else>Prazo vencido: sem sugestao mensal.</p></div><div class="actions"><button type="button" @click="toggleGoalAction(goal.id)">{{ goal.active ? 'Desativar' : 'Ativar' }}</button><button type="button" class="danger" @click="deleteGoalAction(goal.id)">Excluir</button></div><form class="movement-form" @submit.prevent="addMovement(goal.id)"><label>Movimento<select v-model="movementForm(goal.id).type"><option v-for="type in goalMovementTypes" :key="type" :value="type">{{ type === 'CONTRIBUTION' ? 'Aporte' : 'Retirada' }}</option></select></label><label>Valor<input v-model.number="movementForm(goal.id).amount" type="number" min="0.01" step="0.01" inputmode="decimal" /></label><label>Data<input v-model="movementForm(goal.id).date" type="date" /></label><label>Observacao<input v-model="movementForm(goal.id).note" /></label><button type="submit">Registrar</button></form><ul><li v-for="movement in movements(goal.id)" :key="movement.id">{{ movement.type === 'CONTRIBUTION' ? '+' : '-' }} {{ currency.format(movement.amountCents / 100) }} em {{ movement.date }} <button type="button" class="danger" @click="deleteGoalMovementAction(movement.id)">Excluir</button></li></ul></article></section>
</template>
