# Riscos de integridade

| Severidade | Risco comprovado | Evidência | Tratamento na Fase 1 |
| --- | --- | --- | --- |
| Crítico | JSON inválido era lido como coleção vazia e podia ser sobrescrito. | Adapters retornavam `[]`; `readTransactions` capturava erros. | Corrigido: erro identifica a chave e é propagado; NG-STO-002 protege. |
| Médio | Vulnerabilidades transitivas altas e críticas em ferramentas de desenvolvimento. | `npm audit --json` após lockfile: 6 altas e 4 críticas. | Não tratadas nesta fatia, por exigirem atualização deliberada de dependências diretas/transitivas. |
| Médio | LocalStorage não garante uma transação entre movimento e espelho. | NG-GOAL-003 e `goal-features.ts`. | Corrigido para falha do espelho: compensação restaura movimentos e repropaga o erro. Uma falha da própria compensação permanece impossível de tornar atômica. |
| Baixo | Cancelamento de recorrência exige uma nova chave local. | NG-REC-003 e `finance.recurrenceCancellations`. | Corrigido com coleção aditiva e compatível; falha de gravação continua propagada. |
| Baixo | Registros recorrentes antigos no crédito não possuem competência de origem. | NG-REC-004. | Compatibilidade explícita: usam a competência já persistida como origem, sem reclassificação. |
| Médio | Editar parcela altera o total efetivo do grupo. | NG-PAR-003. | Caracterizado; edição em massa permanece fora de escopo. |
| Médio | LocalStorage não oferece atomicidade entre chaves. | Contratos de goals e transactions são separados. | A compensação cobre falha do espelho; não substitui transação real se a gravação compensatória também falhar. |
| Médio | O parse valida somente sintaxe JSON, não o schema completo. | Casts TypeScript dos adapters. | Pendente: validação runtime compatível antes de importação/API. |
| Baixo | Lockfile regenerado fixa versões transitivas novas. | 75 entradas de pacote alteradas, sem mudança em `package.json`. | Validado em cópia isolada com `npm ci`, harness e check; manter sob revisão de dependências futura. |

## Auditoria de dependências

| Ambiente | Baixas | Moderadas | Altas | Críticas | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Antes, instalação sem lock reproduzível | 4 | 4 | 7 | 4 | 19 |
| Depois, `npm ci` com lock atualizado | 4 | 4 | 6 | 4 | 18 |

Não há vulnerabilidade nova alta ou crítica. A alta removida é `source-map-js` (1.2.1 para 1.2.2). As vulnerabilidades altas/críticas restantes estão na árvore das ferramentas declaradas em `devDependencies`: `@nuxt/devtools → simple-git`, `vitest → tinypool`, Vite, `undici`, `node-forge` e `zod`. A única dependência de produção direta é `vue`, sem achado no audit.

## Dados existentes

As chaves e formatos das cinco coleções permanecem os mesmos. O novo comportamento evita substituir JSON sintaticamente inválido; a UI poderá exibir a falha ao invés de tratar corrupção como ausência de dados.
