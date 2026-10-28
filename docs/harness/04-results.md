# Resultados da Fase 1 — fatia inicial

## FATIA: NG-HARNESS-001

**Problema:** regras financeiras importantes estavam distribuídas entre testes de feature sem uma suíte executável e rastreável por cenários.

**Causa identificada:** não existia comando dedicado nem cenários integrando use cases com repositórios em memória.

**Arquivos modificados:** `package.json`, `app/harness/**`, adapters LocalStorage, `transaction-features.ts`, testes de adapters e `docs/harness/**`.

**Regra protegida:** lançamentos, parcelas, recorrências, metas, persistência e compatibilidade legada listados em `01-scenarios.md`.

**Testes executados:** `npm run harness` e `npm run check`.

**Resultado:** harness com 18 aprovados, 0 falhos e 0 não executados. Suíte total com 53 aprovados em 9 arquivos; typecheck, lint e build aprovados.

**Riscos remanescentes:** falha durante a compensação de meta, edição de parcela, validação runtime incompleta e lockfile incompatível; veja `02-risks.md`.

**Próxima ação:** propor o formato versionado de backup/restauração antes de qualquer implementação de importação.

## FATIA: NG-REC-003-004

**Problema:** uma ocorrência excluída era recriada e recorrências no crédito divergiam da competência de lançamentos manuais.

**Causa identificada:** a unicidade usava a competência financeira e não havia estado persistido de cancelamento.

**Arquivos modificados:** contratos e adapter de recorrência, modelo de transação, feature e página mensal, testes de recorrência, harness e documentação.

**Regra protegida:** cancelamento idempotente por `recurrenceId + recurrenceSourceCompetence`; crédito recorrente usa competência financeira no mês seguinte sem reclassificar histórico.

**Testes executados:** cenários direcionados de recorrência, `npm run harness` e `npm run check`.

**Resultado:** 18 cenários do harness aprovados; suíte total com 55 testes aprovados em 9 arquivos.

**Riscos remanescentes:** o fallback de origem em registros antigos é conservador e não corrige competências financeiras históricas; a chave de cancelamentos deve ser incluída no futuro backup/restauração.

## FATIA: NG-STO-002-003

**Problema:** JSON inválido podia ser confundido com base vazia, e erros de acesso/gravação não traziam a chave afetada.

**Causa identificada:** cada adapter chamava LocalStorage diretamente ou convertia falha de parse em coleção vazia.

**Arquivos modificados:** helper compartilhado de LocalStorage, quatro adapters, harness e documentação.

**Regra protegida:** chave ausente retorna coleção vazia; JSON inválido, leitura indisponível e gravação indisponível falham com contexto e sem sobrescrita.

**Testes executados:** adapters e harness de persistência direcionados.

**Resultado:** 10 testes aprovados em 2 arquivos direcionados. A suíte completa será reexecutada após a decisão do lockfile.

**Riscos remanescentes:** o lockfile requer atualização de transitivos efetivos; a validação de schema dos payloads JSON continua pendente.

## FATIA: LOCKFILE-001

**Problema:** `npm ci` falha mesmo com Node 22.19.0.

**Causa identificada:** `package-lock.json` não contém `esbuild@0.28.2` e plataformas associadas, nem versões transitivas exigidas por Nuxt/Vite (`vite@8.3.5`, `rolldown@1.2.15`, `postcss@8.5.32` e outras).

**Evidência:** a regeneração isolada alterou 1.777 linhas e `npm ci` passou nessa cópia, instalando 850 pacotes.

**Situação:** bloqueado para alteração no workspace, pois não é uma correção apenas de metadados: atualiza versões transitivas efetivas, embora `package.json` permaneça inalterado.

## FATIA: LOCKFILE-001 — conclusão

**Alteração aprovada:** `package-lock.json` regenerado isoladamente; `package.json` permaneceu idêntico (SHA-256 `33029f94c6a667ed9b0872cd4d89217c3e05b63d5fbdbe3650fd2279dfa5836d`).

**Principais transitivos:** `postcss` 8.5.28 → 8.5.32; `rolldown` 1.2.12 → 1.2.15; `nanoid` 3.3.19 → 3.3.20; `source-map-js` 1.2.1 → 1.2.2; `@oxc-project/types` 0.152.0 → 0.155.0; adicionados os grafos requeridos de `vite` 8.3.5 e `esbuild` 0.28.2 para Nuxt.

**Validação isolada:** `npm ci` instalou 850 pacotes. No mesmo ambiente, `npm run harness` aprovou 18 cenários e `npm run check` aprovou typecheck, lint, build e 55 testes.

**Audit:** 19 achados antes (7 altos, 4 críticos) e 18 depois (6 altos, 4 críticos); nenhuma vulnerabilidade alta/crítica nova. Detalhe e caminhos em `02-risks.md`.
