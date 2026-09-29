# Plano de Implementacao - Etapa 5: Contas Recorrentes

## Objetivo

Eliminar o cadastro mensal manual de contas previsiveis, sem duplicar lancamentos ao abrir novamente uma competencia.

## Sera implementado

- Entidade `Recurrence` persistida em `finance.recurrences`.
- Tela em `/recurrences` para criar, editar, ativar, desativar e excluir recorrencias.
- Campos: descricao, tipo, categoria, subcategoria opcional, responsavel, forma de pagamento, comportamento, necessidade, dia de vencimento opcional, tipo de valor, valor padrao, ativa e mes inicial.
- Tipos de valor `FIXED` e `VARIABLE`.
- Funcao `ensureRecurrencesForMonth(month)` executada ao abrir uma competencia mensal.
- Campo `recurrenceId` nos lancamentos gerados.
- Indicacao clara de `Valor a informar` para recorrencias variaveis ainda sem valor.

## Regras

- Recorrencia fixa gera um lancamento pendente com o valor padrao.
- Recorrencia variavel gera um lancamento pendente de R$ 0 com `needsValue = true`.
- Ao informar um valor em uma recorrencia variavel gerada, `needsValue` passa a ser `false`.
- Uma recorrencia pode gerar no maximo um lancamento por competencia.
- A unicidade e definida por `recurrenceId + competence`.
- Editar um lancamento gerado altera somente aquele mes.
- Editar uma recorrencia altera somente geracoes futuras; nao altera lancamentos ja existentes.
- Recorrencias inativas nao devem gerar novos lancamentos.

## Validacao manual

1. Criar a recorrencia fixa `Internet`, de R$ 120.
2. Abrir outubro e confirmar uma geracao pendente de R$ 120.
3. Recarregar outubro e confirmar que nao houve duplicacao.
4. Abrir novembro e confirmar uma nova geracao de R$ 120.
5. Criar a recorrencia variavel `Energia`.
6. Abrir uma competencia e confirmar R$ 0 com `Valor a informar`.
7. Informar R$ 187,43 e confirmar a remocao da pendencia de valor.

## Fora do escopo

- Recorrencias semanais, anuais ou com data final.
- Ajuste automatico por inflacao ou historico de valores.
- Notificacoes e alertas.
- Metas e reservas.
