# Plano de Implementacao - Etapa 2: Competencia Mensal

## Objetivo

Organizar os lancamentos pela competencia financeira e exibir um resumo de cada mes.

## Sera implementado

- Campo `competence` nos lancamentos, no formato `YYYY-MM`.
- Funcao TypeScript unica, `calculateCompetence(date, paymentMethod)`, para calcular a competencia a partir da data e forma de pagamento.
- Reutilizacao de `calculateCompetence` no cadastro, na edicao e na adaptacao dos dados existentes.
- Home mensal em `/`, aberta inicialmente no mes atual.
- Navegacao entre mes anterior, mes atual e proximo mes.
- Listagem restrita aos lancamentos da competencia selecionada.
- Resumo mensal com:
  - Entradas.
  - Saidas.
  - Total pago.
  - Total pendente.
  - Saldo previsto.
- Adaptacao de registros existentes no `localStorage`: quando `competence` estiver ausente, calcula-la com `date` e `paymentMethod` e persistir o registro adaptado novamente.

## Regras

- Para `PIX`, `DEBITO` e `DINHEIRO`, a competencia e o mesmo mes da data do lancamento.
- Para `CREDITO`, a competencia e sempre o mes seguinte a data do lancamento.
- Ao editar `date` ou `paymentMethod`, recalcular `competence` com `calculateCompetence`.
- Fechamento, vencimento e configuracao de cartao nao fazem parte desta etapa.
- O saldo previsto e calculado como `entradas - saidas`.
- Entradas e saidas consideram todos os lancamentos do respectivo tipo, independentemente do status.
- Total pago considera somente lancamentos `SAIDA` com status `PAGO`.
- Total pendente considera somente lancamentos `SAIDA` com status `PENDENTE`.
- O status de pagamento nao altera a competencia original do lancamento.

## Validacao manual

1. Criar `Mercado`, pago via `PIX`, em 15/09, no valor de R$ 180.
2. Confirmar que ele aparece na competencia de setembro.
3. Criar `Compra`, paga no `CREDITO`, em 15/09, no valor de R$ 300.
4. Confirmar que ela aparece na competencia de outubro.
5. Navegar entre setembro e outubro e confirmar que cada mes mostra apenas seus lancamentos.
6. Conferir entradas, saidas e saldo previsto de cada competencia.
7. Marcar uma saida como paga e confirmar a atualizacao dos totais pago e pendente, sem troca de mes.
8. Editar a data ou a forma de pagamento de um lancamento e confirmar que a competencia e recalculada.
9. Criar ou manter um registro antigo sem `competence`, recarregar a aplicacao e confirmar que a competencia foi calculada e persistida no `localStorage`.

## Fora do escopo

- Compras parceladas.
- Categorias, subcategorias e classificacoes.
- Recorrencias.
- Metas e reservas.
- Configuracao de fechamento ou vencimento de cartao.
