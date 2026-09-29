# Plano de Implementacao - Etapa 6: Home Mensal Util

## Objetivo

Transformar a Home mensal em uma visao pratica para identificar pendencias, pagamentos e o saldo previsto do mes.

## Sera implementado

- Ordenacao da lista mensal por prioridade:
  - Lancamentos com `needsValue = true`.
  - Saidas pendentes.
  - Lancamentos pagos.
- Destaque textual para `Valor a informar`, `Pendente` e informacao de pagamento.
- Acoes rapidas na Home:
  - Editar valor.
  - Marcar como pago.
  - Desmarcar pago.
- Consolidacao do resumo mensal ja existente para acomodar recorrencias e classificacoes.
- Totais opcionais por responsavel: `CASA`, `RONALD` e `KAMILLE`.

## Regras

- A ordem deve tornar valores nao informados visiveis antes dos demais itens.
- Total pago e pendente continuam considerando somente saidas.
- O saldo previsto continua sendo `entradas - saidas`.
- Um pagamento efetuado em outro mes nao altera a competencia do lancamento.
- Acoes rapidas devem preservar os mesmos efeitos das telas completas de edicao e pagamento.
- Os totais por responsavel devem usar os lancamentos da competencia selecionada.

## Validacao manual

1. Abrir um mes contendo uma conta variavel sem valor, uma saida pendente e uma saida paga.
2. Confirmar a ordem: valor a informar, pendente e pago.
3. Informar o valor da conta variavel diretamente pela Home.
4. Marcar e desmarcar uma saida como paga sem sair da Home.
5. Conferir entradas, saidas, pago, pendente e saldo previsto.
6. Criar lancamentos para CASA, RONALD e KAMILLE e conferir os totais individuais, caso a separacao seja ativada.

## Fora do escopo

- Graficos e dashboards visuais.
- Filtros avancados, busca e exportacao.
- Alertas automaticos de atraso.
- Metas e reservas.
