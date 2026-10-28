# Nossa Grana

Controle financeiro pessoal mobile-first. A interface é Nuxt 4 no cliente e persiste dados no LocalStorage do navegador. O servidor Nitro contém apenas `GET /api/health` nesta fase.

## Instalação

Use Node `22.19.0` (veja `.nvmrc`) e, em um checkout limpo:

```bash
nvm use
npm ci
```

## Comandos

| Comando | Comprova |
| --- | --- |
| `npm run dev` | desenvolvimento local com recarga |
| `npm run typecheck` | tipos TypeScript/Vue |
| `npm run lint` | regras ESLint em app, server e testes |
| `npm test` | regras de domínio, features e adapters |
| `npm run build` | build Nuxt + Nitro em `.output` |
| `npm run preview` | execução local do resultado do build |
| `npm run check` | tipos, lint, testes e build, nesta ordem |

Abra as rotas `/`, `/transactions/new`, `/categories`, `/recurrences` e `/goals`. Uma edição usa `/transactions/:id/edit`.

## Dados locais

Os dados são locais ao navegador e à origem (protocolo, domínio e porta). Assim, mudar de porta/domínio usa outro LocalStorage, mas não altera os dados da origem anterior. As chaves preservadas são `finance.transactions`, `finance.categories`, `finance.recurrences`, `finance.recurrenceCancellations`, `finance.goals` e `finance.goalMovements`. Exporte dados importantes no navegador antes de testes manuais.

## Fluxo de contribuição

Crie uma branch, faça uma alteração pequena, execute `npm run check`, abra PR e aguarde os checks. A integração Git da Vercel pode gerar preview para branches/PRs; a branch de produção configurada na Vercel recebe o deploy. Esta preparação não publica nada.

Consulte [desenvolvimento](docs/development.md), [arquitetura](docs/architecture.md), [regras de negócio](docs/business-rules.md) e [limitações](docs/known-limitations.md).
