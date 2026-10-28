# Baseline do harness

## Estado inicial

- Data da coleta: 2026-10-28.
- Repositório Git: indisponível neste diretório (`git status --short` retornou código 128).
- Runtime inicial: Node `v16.20.2` / npm `8.19.4`; incompatível com `.nvmrc`.
- Runtime de validação: Node `v22.19.0` / npm `10.9.3`.
- Não há dependências de produção além de Vue; os testes usam Vitest já declarado.

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `node --version` | Falhou o requisito do projeto: `v16.20.2`. |
| `npm --version` | `8.19.4`. |
| `git status --short` | Bloqueado: diretório não é um repositório Git. |
| `nvm install 22.19.0` | Aprovado: Node `v22.19.0` instalado. |
| `npm ci` | Falhou: `package-lock.json` fora de sincronia com `package.json`. |
| `npm install --package-lock=false` | Aprovado somente para viabilizar a análise; não modificou o lockfile. Avisou incompatibilidade de engine em dependência transitiva e 9 vulnerabilidades de auditoria. |
| `npm run check` | Aprovado: typecheck, lint, 35 testes e build. |
| `npm ci` em cópia isolada | Falhou com o lockfile atual pelos mesmos pacotes transitivos ausentes ou incompatíveis. |
| `npm install --package-lock-only --ignore-scripts` em cópia isolada | Gerou lockfile consistente, com 1.777 linhas de diff. |
| `npm ci` com o lockfile regenerado, em cópia isolada | Aprovado: 850 pacotes instalados. |

## Testes existentes

Antes do harness havia 7 arquivos e 35 testes: domínio financeiro, features de transações, recorrências, metas, categorias, adapters LocalStorage e caracterização da composição real.

## Regras financeiras identificadas

- Valores são inteiros em centavos.
- PIX, débito e dinheiro usam a competência da data; crédito usa o mês seguinte.
- Parcelamento divide o total exatamente e deixa o resto na última parcela.
- Alternar pagamento preenche ou limpa `paidAt`.
- Recorrência é única por `recurrenceId + competence`; variável começa em zero com `needsValue`.
- Aporte cria saída e retirada cria entrada, ambas vinculadas ao movimento da meta.

## Arquivos relevantes

- `app/features/transactions/model/transaction-features.ts`
- `app/features/recurrences/model/recurrence-features.ts`
- `app/features/goals/model/goal-features.ts`
- `app/entities/*/api/local-storage-*-repository.ts`
- `app/composition/features.ts`

## Limitações conhecidas

Não há backend, autenticação, banco remoto ou transação multi-chave no LocalStorage. Recorrências são geradas ao abrir a competência.
