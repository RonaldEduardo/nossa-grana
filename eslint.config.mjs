import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  name: 'nossa-grana/compatibilidade-vue-3',
  rules: {
    'vue/html-self-closing': 'off',
    'vue/no-multiple-template-root': 'off',
  },
})
