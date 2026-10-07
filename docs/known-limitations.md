# Limitações conhecidas

- Os adapters em `app/entities/*/api/local-storage-*-repository.ts` usam `getAll/saveAll`; isso requer revisão antes de uso multiusuário.
- `app/features/goals/model/goal-features.ts` persiste movimentos de reserva e espelhos financeiros em etapas separadas; uma falha pode deixar gravação parcial.
- Os adapters de LocalStorage fazem parse com fallback vazio, o que pode ocultar erro de dados.
- Será necessária validação de runtime mais forte antes de APIs financeiras.
- Os resumos financeiros permanecem em `app/pages/index.vue`.
- Recorrências são geradas ao visitar a competência em `app/pages/index.vue`, não por agendamento no servidor.
- Não há autenticação, banco remoto, Supabase nem testes de RLS.
