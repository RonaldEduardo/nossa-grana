export default defineNuxtConfig({
  ssr: false,
  css: ['~/assets/styles.css'],
  modules: ['@nuxt/eslint'],
  devtools: { enabled: false },
  compatibilityDate: '2026-10-02',
  typescript: { strict: true },
})
