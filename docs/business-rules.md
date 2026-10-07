# Regras de negócio atuais

- Valores financeiros são inteiros em centavos: R$ 25,90 é `2590`.
- PIX entra na competência da data. Crédito entra na competência do mês seguinte.
- Uma compra parcelada divide em centavos; o resto fica na última parcela. Ex.: 10000 em 3 gera 3333, 3333 e 3334.
- Marcar pagamento preenche `paidAt`; desmarcar limpa esse campo.
- Recorrência é identificada por ID e competência. A variável é gerada com valor zero e `needsValue`; a fixa usa o valor padrão.
- Aportes geram saída e retiradas geram entrada, vinculadas ao movimento da meta. Excluir a meta ou movimento exclui os lançamentos vinculados.

Essas regras descrevem a implementação e os testes atuais. Migrações de infraestrutura não devem alterá-las sem decisão explícita.
