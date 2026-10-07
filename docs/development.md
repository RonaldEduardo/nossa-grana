# Desenvolvimento

## Pré-requisitos

Node `22.19.0` e npm. Execute `nvm use && npm ci` após clonar. Não são necessários segredos nem Supabase para desenvolver ou validar esta versão.

## Ciclo local

1. Rode `npm run dev` e use a URL indicada no terminal.
2. Valide a alteração com `npm run check`.
3. Para validar a saída de produção, rode `npm run build`, `npm run preview` e consulte `GET /api/health`.

Evite resetar LocalStorage. Para um teste funcional, use perfil/contexto isolado e dados fictícios.

## Integração

O fluxo esperado é branch → PR → checks → preview Vercel → merge. A workflow apenas verifica o projeto; deploys são responsabilidade da integração Git nativa da Vercel. Proteções de branch e integração Vercel dependem de configuração remota e não são criadas localmente.
