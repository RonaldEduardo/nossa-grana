# Plano de Implementacao - Etapa 8: Validacao Completa do Fluxo

## Objetivo

Validar o prototipo com dados proximos da realidade, corrigindo regras e simplificando o fluxo sem adicionar novas funcionalidades.

## Sera realizado

- Cadastro de um conjunto de dados de teste representativo.
- Execucao dos cenarios de uso definidos no plano principal.
- Conferencia da persistencia apos fechar e reabrir o navegador.
- Registro de regras confusas, resultados incorretos e pontos de atrito na interface.
- Correcao apenas de defeitos e simplificacoes necessarias nas regras ja existentes.
- Inclusao de uma acao para limpar dados de teste, se ainda nao estiver disponivel.

## Cenarios de validacao

1. Gasto comum: Mercado por PIX, com classificacao e pagamento posterior.
2. Credito a vista: compra em 1x deslocada para a competencia seguinte.
3. Credito parcelado: 12 parcelas, com soma igual ao total original.
4. Recorrencia fixa: Internet gerada mensalmente sem duplicacao.
5. Recorrencia variavel: Energia inicialmente sem valor e atualizada depois.
6. Pagamento atrasado: competencia original preservada e `paidAt` em mes posterior.
7. Responsaveis: totais validados para CASA, RONALD e KAMILLE.
8. Reserva: aporte, retirada, saldo, sugestao e impacto no mes financeiro.

## Criterio de aceite

O prototipo esta validado quando for possivel abrir um mes, consultar recorrencias, informar valores pendentes, registrar gastos por PIX e credito, usar parcelamento, pagar contas, consultar resumo e responsaveis, movimentar uma meta e reabrir o navegador mantendo todos os dados corretos.

## Fora do escopo

- Novas funcionalidades.
- Mudanca para Supabase, autenticacao ou backend.
- Design visual refinado, graficos e deploy.
- Arquitetura de producao.
