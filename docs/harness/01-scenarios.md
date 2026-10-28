# Cenários do regression harness

O comando `npm run harness` executa exclusivamente os testes em `app/harness`. Eles usam fixtures sintéticas, repositórios em memória ou `MemoryStorage`; não acessam dados do navegador.

| ID | Objetivo e regra protegida | Fixture | Resultado observado | Situação |
| --- | --- | --- | --- | --- |
| NG-TX-001 | Criar receita em centavos, pendente e persistida. | Receita sintética de 250050 centavos. | Persistida com competência correta. | Aprovado |
| NG-TX-002 | Criar despesa preservando campos e competência. | Despesa PIX de 12345 centavos. | Payload preservado. | Aprovado |
| NG-TX-003 | Alterar um lançamento sem mudar outro. | Duas despesas independentes. | Somente o ID solicitado é alterado. | Aprovado |
| NG-TX-004 | Excluir um lançamento sem excluir outro. | Duas despesas independentes. | Somente o ID solicitado é removido. | Aprovado |
| NG-TX-005 | Alternar pagamento e `paidAt`. | Duas despesas pendentes. | Estado e data alternam somente no lançamento alvo. | Aprovado |
| NG-PAR-001 | Criar R$ 1.200,00 em 6 parcelas. | Compra crédito de 120000 centavos. | Seis competências de 2026-10 a 2027-03, um grupo e soma exata. | Aprovado |
| NG-PAR-002 | Não perder centavos na divisão. | Compra de 10000 centavos em 3x. | 3333, 3333, 3334; soma 10000. | Aprovado |
| NG-PAR-003 | Caracterizar edição individual. | Compra de 9000 centavos em 3x. | Edição muda apenas a parcela selecionada; o total do grupo deixa de corresponder ao original. | Aprovado (caracterização) |
| NG-PAR-004 | Caracterizar exclusão individual e do grupo. | Compra de 9000 centavos em 3x. | Sem flag exclui uma; com `deleteGroup` exclui o grupo. | Aprovado (caracterização) |
| NG-REC-001 | Gerar ocorrência mensal. | Recorrência PIX fixa. | Gera lançamento na competência solicitada. | Aprovado |
| NG-REC-002 | Evitar duplicidade. | Mesma recorrência e competência. | Segunda geração não cria lançamento. | Aprovado |
| NG-REC-003 | Cancelar exclusivamente a competência de origem. | Recorrência crédito, cancelamento e reinicialização sintéticos. | Cancelamento idempotente impede recriação e não bloqueia o mês seguinte. | Aprovado |
| NG-REC-004 | Alinhar crédito recorrente ao manual. | Recorrência e lançamento crédito sintéticos. | Ambos usam o mês seguinte; a recorrência preserva a origem para unicidade. | Aprovado |
| NG-GOAL-001 | Criar aporte e espelho financeiro. | Meta e aporte sintéticos. | Movimento e saída vinculada são criados. | Aprovado |
| NG-GOAL-002 | Registrar retirada e espelho financeiro. | Meta e retirada sintéticos. | Movimento e entrada vinculada são criados. | Aprovado |
| NG-GOAL-003 | Evitar falha parcial. | Repositório de meta e espelho que falha. | Movimento é compensado e a falha do espelho é propagada. | Aprovado |
| NG-STO-001 | Distinguir base ausente de erro. | `MemoryStorage` vazio. | Retorna coleção vazia. | Aprovado |
| NG-STO-002 | Não confundir JSON inválido com vazio. | `finance.transactions` com `{`. | Erro é propagado e o conteúdo não é sobrescrito. | Aprovado |
| NG-STO-003 | Propagar falha de acesso e gravação. | Storage que lança em `getItem` ou `setItem`. | Todas as seis coleções retornam erro contextual com a chave; nada é tratado como coleção vazia. | Aprovado |
| NG-STO-004 | Manter formato legado compatível. | Transação com `amount` decimal. | Migra para `amountCents`, competência e vínculos preservados. | Aprovado |
| NG-STO-005 | Isolar o armazenamento de testes. | Nova instância por caso. | Não usa LocalStorage do navegador. | Aprovado |

## Tipos de teste

- **Unitários existentes:** funções de domínio e features isoladas.
- **Caracterização:** fixa comportamento atual que ainda exige decisão de produto.
- **Cenários do harness:** exercitam regras financeiras estáveis com IDs rastreáveis.
- **Integração em memória:** compõe cases de uso e contratos de repositório sem rede.
- **Falhas de persistência:** usa armazenamento sintético que falha, sem dados reais.
