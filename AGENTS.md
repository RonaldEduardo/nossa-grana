# Nossa Grana — instruções de trabalho

## Estado atual

Aplicação Nuxt 4 com interface renderizada no cliente (`ssr: false`), persistência em LocalStorage e somente o endpoint técnico `GET /api/health`. Não há backend financeiro, autenticação, banco remoto ou Supabase.

## Mapa

- `app/pages`: telas e URLs.
- `app/features`: casos de uso.
- `app/entities`: domínio TypeScript puro e adapters LocalStorage.
- `app/composition/features.ts`: composição dos casos de uso no cliente.
- `server/api`: endpoints Nitro sem dados financeiros.
- `docs/architecture.md`, `docs/business-rules.md` e `docs/known-limitations.md`: contexto do produto.

## Regras

- Dinheiro é sempre representado em centavos no domínio.
- Domínio não importa Vue nem LocalStorage.
- Preserve URLs e as chaves/formato dos dados locais.
- Não exponha credenciais no frontend, não use dados reais em fixtures e não publique/altere banco de produção.
- Falhas de teste devem ser investigadas, não contornadas.
- Não introduza subagentes, MCPs ou abstrações adicionais por padrão.

## Comandos

Use Node `22.19.0` (`nvm use`), depois `npm ci`. Rode `npm run dev` no desenvolvimento e `npm run check` antes de propor alteração.

## Processo

Leia o contexto, identifique a regra, altere uma fatia pequena, valide, revise o diff e relate evidências. Não execute reset de dados locais; exporte-os antes de qualquer operação potencialmente destrutiva.
