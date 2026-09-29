<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="brand">Nossa Grana</RouterLink>
    <nav><RouterLink to="/categories">Categorias</RouterLink><RouterLink to="/recurrences">Recorrencias</RouterLink><RouterLink to="/goals">Metas</RouterLink><RouterLink to="/transactions/new" class="button primary">Novo lancamento</RouterLink></nav>
  </header>
  <main class="page"><RouterView /></main>
</template>
