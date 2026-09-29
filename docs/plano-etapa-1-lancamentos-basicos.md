# Plano de Implementacao - Etapa 1: Lancamentos Basicos

## Objetivo

Permitir registrar e administrar entradas e saidas financeiras com persistencia local.

## Sera implementado

- Modelo de lancamento com os campos:
  - `id`
  - `type`
  - `description`
  - `amount`
  - `date`
  - `responsible`
  - `paymentMethod`
  - `status`
  - `paidAt`
  - `notes`
  - `createdAt`
  - `updatedAt`
- Tela de novo lancamento em `/transactions/new`.
- Validacao de campos obrigatorios e valor valido.
- Persistencia no `localStorage`, usando a chave `finance.transactions`.
- Listagem de lancamentos na Home.
- Edicao de um lancamento existente.
- Exclusao de um lancamento.
- Acao para marcar como pago e desfazer o pagamento.

## Regras

- Todo lancamento nasce com status `PENDENTE`.
- Ao marcar como pago:
  - `status` passa a ser `PAGO`.
  - `paidAt` recebe a data e hora atuais.
- Ao desfazer o pagamento:
  - `status` volta a ser `PENDENTE`.
  - `paidAt` volta a ser `null`.
- Responsaveis permitidos: `CASA`, `RONALD` e `KAMILLE`.
- Formas de pagamento permitidas: `PIX`, `DEBITO`, `CREDITO` e `DINHEIRO`.
- Tipos permitidos: `ENTRADA` e `SAIDA`.

## Validacao manual

1. Criar um gasto com descricao `Mercado`, tipo `SAIDA`, valor de R$ 180, forma `PIX` e responsavel `CASA`.
2. Confirmar que aparece na listagem como `PENDENTE`.
3. Atualizar a pagina e confirmar que o registro continua salvo.
4. Editar o lancamento e confirmar a atualizacao na lista.
5. Marcar como pago e confirmar que `paidAt` foi preenchido.
6. Desmarcar como pago e confirmar que `paidAt` foi limpo.
7. Excluir o lancamento e confirmar sua remocao.

## Fora do escopo

- Competencia mensal e filtros por mes.
- Parcelamento no credito.
- Categorias e classificacoes.
- Recorrencias.
- Metas e reservas.
