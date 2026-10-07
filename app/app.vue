<template>
  <header class="app-header">
    <NuxtLink to="/" class="brand">Nossa Grana</NuxtLink>
    <NuxtLink to="/transactions/new" class="button primary header-action">Novo</NuxtLink>
  </header>
  <main class="page"><NuxtPage /></main>
  <nav class="bottom-nav" aria-label="Navegacao principal">
    <NuxtLink to="/">Inicio</NuxtLink>
    <NuxtLink to="/categories">Categorias</NuxtLink>
    <NuxtLink to="/recurrences">Recorrencias</NuxtLink>
    <NuxtLink to="/goals">Metas</NuxtLink>
  </nav>
</template>
