# Plano de Implementacao - Etapa 7: Metas e Reservas

## Objetivo

Validar a reserva flexivel por meio de metas, aportes e retiradas com impacto visivel no fluxo financeiro mensal.

## Sera implementado

- Entidade `Goal` persistida em `finance.goals`.
- Campos: id, nome, valor objetivo, prazo, ativa e data de criacao.
- Entidade `GoalMovement` persistida em `finance.goalMovements`.
- Campos: id, meta, tipo, valor, data e observacao opcional.
- Tela em `/goals` para criar e administrar metas.
- Registro de movimentos `CONTRIBUTION` e `WITHDRAWAL`.
- Calculo do saldo atual da meta a partir dos movimentos.
- Calculo da sugestao mensal de aporte.
- Lancamento financeiro vinculado para cada aporte ou retirada.

## Regras

- O saldo da meta nunca e salvo manualmente.
- Saldo da meta = contribuicoes - retiradas.
- Aporte cria uma `SAIDA` financeira vinculada ao movimento da meta.
- Retirada cria uma `ENTRADA` financeira vinculada ao movimento da meta.
- A sugestao mensal usa o valor faltante dividido pelos meses restantes ate o prazo.
- O calculo deve tratar meta atingida, saldo acima do objetivo, prazo vencido e prazo no mes atual sem divisao invalida.
- Edicoes ou exclusoes de movimento e lancamento financeiro vinculado devem manter os dois lados consistentes.

## Validacao manual

1. Criar uma meta de R$ 10.000 com prazo futuro.
2. Registrar aporte de R$ 500 e retirada de R$ 200.
3. Confirmar saldo da meta de R$ 300.
4. Confirmar o recalculo da sugestao mensal apos cada movimento.
5. Confirmar uma saida de R$ 500 e uma entrada de R$ 200 vinculadas aos movimentos no fluxo financeiro.
6. Validar o comportamento para uma meta alcancada e para uma meta com prazo vencido.

## Fora do escopo

- Rendimentos, juros e correcao monetaria.
- Metas compartilhadas ou sincronizadas entre usuarios.
- Transferencias bancarias reais.
- Integracao com backend ou autenticacao.
