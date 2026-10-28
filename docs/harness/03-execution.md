# Execução do harness

## Pré-requisito

Use Node `22.19.0`. A instalação limpa atualmente está bloqueada pelo lockfile; veja `00-baseline.md`.

## Quality gate

```text
Alteração de código
  -> testes relevantes
  -> npm run harness
  -> npm run check
  -> revisão do diff
  -> evidências em docs/harness
```

## Comandos

```bash
npm run harness
npm test
npm run check
```

`npm run harness` executa só `app/harness`. `npm test` e `npm run check` executam toda a suíte, incluindo o harness, porque o Vitest inclui `app/**/*.test.ts`.

Não há workflow local de CI neste checkout. Como `check` incorpora `npm test`, uma pipeline que já executa `npm run check` valida os cenários sem criar job redundante.
