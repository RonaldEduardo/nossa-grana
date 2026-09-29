# Plano de Implementacao - Etapa 3: Credito Parcelado

## Objetivo

Permitir registrar compras no credito, a vista ou parceladas, distribuindo corretamente o valor total entre as competencias futuras.

## Sera implementado

- Campo de numero de parcelas exibido apenas quando a forma de pagamento for `CREDITO`.
- Registro do valor total da compra pelo usuario.
- Funcao TypeScript para gerar parcelas com valores em centavos e distribuicao exata do total.
- Criacao de um lancamento individual por parcela.
- Campos adicionais nos lancamentos parcelados:
  - `installmentGroupId`.
  - `installmentNumber`.
  - `installmentCount`.
  - `originalTotalAmount`.
- Identificacao visual da parcela, como `Notebook 3/12`.
- Exclusao de uma parcela individual ou de todas as parcelas vinculadas a mesma compra.

## Regras

- O usuario informa o valor total da compra, e nao o valor de cada parcela.
- Uma compra no credito em `1x` gera um unico lancamento na competencia do mes seguinte.
- A primeira parcela pertence ao mes posterior a data da compra.
- Cada parcela seguinte avanca uma competencia mensal.
- A soma das parcelas deve ser exatamente igual ao valor total informado.
- O arredondamento deve usar centavos: R$ 100 em 3x resulta em R$ 33,33, R$ 33,33 e R$ 33,34.
- Cada parcela nasce como `PENDENTE` e pode ser paga individualmente.
- Ao excluir uma parcela, o usuario deve escolher entre excluir somente aquela ou todo o grupo da compra.

## Validacao manual

1. Criar uma compra de R$ 1.200 no credito em 4x, datada em setembro.
2. Confirmar quatro lancamentos de R$ 300, de outubro a janeiro.
3. Criar uma compra de R$ 100 no credito em 3x.
4. Confirmar parcelas de R$ 33,33, R$ 33,33 e R$ 33,34, cuja soma e R$ 100.
5. Marcar somente uma parcela como paga e confirmar que as demais nao mudam.
6. Excluir uma parcela e validar as duas opcoes de exclusao.

## Fora do escopo

- Edicao em massa de parcelas.
- Fechamento, vencimento ou limite de cartao.
- Categorias e classificacoes.
- Recorrencias, metas e reservas.
