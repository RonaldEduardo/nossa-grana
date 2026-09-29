# Plano de Implementação Vertical — MVP do Controle Financeiro

## Objetivo deste documento

Implementar um protótipo funcional do controle financeiro doméstico de forma **vertical e incremental**, validando uma regra de negócio por vez.

A prioridade agora é:

```text
funcionar → validar regra → ajustar → somente depois estruturar produção
```

Não construir:

```text
banco inteiro → backend inteiro → frontend inteiro
```

Construir:

```text
uma funcionalidade completa
→ tela
→ regra
→ persistência local
→ validação
→ próxima funcionalidade
```

Este protótipo NÃO é a versão final.

Depois de validar o comportamento, a aplicação será reorganizada para produção com hospedagem, Supabase, autenticação, segurança e demais preocupações.

---

# 1. Stack do protótipo

Usar:

```text
Vue 3
Vite
TypeScript
Vue Router
localStorage
CSS simples
```

Não usar agora:

```text
Supabase
Vercel
Backend Java
API REST
Pinia
Vuex
Tailwind
PrimeVue
Vuetify
biblioteca de gráficos
autenticação
PWA
Docker
testes E2E complexos
```

Se alguma biblioteca não for realmente necessária para validar regra de negócio, não adicionar.

---

# 2. Princípios

## 2.1 Vertical primeiro

Cada etapa deve funcionar de ponta a ponta antes da próxima.

Exemplo:

```text
Cadastro de gasto
↓
formulário
↓
validação
↓
regra
↓
salva no localStorage
↓
aparece na listagem
↓
edita
↓
exclui
```

Somente depois avançar.

---

## 2.2 Nada de arquitetura enterprise

Não criar antecipadamente:

```text
DDD completo
Clean Architecture em várias camadas
CQRS
UseCases para tudo
DTOs duplicando models
event bus
facades sem necessidade
repository genérico
state management global
```

Separar somente o suficiente para manter as regras compreensíveis.

---

## 2.3 Regra de negócio fora do componente quando fizer sentido

Componentes cuidam principalmente de:

```text
entrada
saída
interação
renderização
```

Cálculos importantes devem ficar em funções TypeScript simples.

Exemplo:

```text
calculateInstallments()
calculateCompetence()
calculateMonthlySummary()
calculateGoalSuggestion()
```

---

## 2.4 localStorage é temporário

Usar `localStorage` somente como persistência para validação.

Objetivo:

```text
fechar navegador
abrir novamente
dados continuam lá
```

Não criar uma abstração enorme.

Pode existir algo simples como:

```text
src/services/storage.ts
```

ou pequenos repositories específicos.

---

# 3. Estrutura inicial sugerida

```text
src/
├── components/
├── pages/
├── models/
├── services/
├── domain/
├── router/
├── utils/
├── App.vue
└── main.ts
```

Exemplo:

```text
domain/
├── transaction.ts
├── installment.ts
├── recurrence.ts
└── goal.ts
```

Não criar arquivos vazios antecipadamente.

Criar somente quando alguma implementação precisar.

---

# 4. Regras já definidas

## Responsáveis

```text
CASA
RONALD
KAMILLE
```

Não existe conceito de conta bancária nesta versão.

---

## Formas de pagamento

```text
PIX
DEBITO
CREDITO
DINHEIRO
```

---

## Tipo de lançamento

```text
ENTRADA
SAIDA
```

---

## Status

```text
PENDENTE
PAGO
```

Todo lançamento nasce como `PENDENTE`.

Ao marcar como pago:

```text
status = PAGO
paidAt = data/hora atual
```

Ao desmarcar:

```text
status = PENDENTE
paidAt = null
```

A competência original não muda.

---

## Fixo / Variável

```text
FIXO
VARIAVEL
```

Isso NÃO significa recorrência.

Exemplo:

```text
Internet
recorrente = sim
classificação = FIXO

Energia
recorrente = sim
classificação = VARIAVEL

Mercado
recorrente = não
classificação = VARIAVEL
```

---

## Necessidade

```text
ESSENCIAL
NECESSARIO
OPCIONAL
DESPERDICIO
```

A classificação pode ser alterada depois.

---

# 5. Estratégia de persistência temporária

Usar chaves simples:

```text
finance.transactions
finance.categories
finance.recurrences
finance.goals
finance.goalMovements
```

Opcionalmente:

```text
finance.settings
```

Os dados podem ser armazenados como JSON.

Criar também, no final do protótipo:

```text
Limpar dados de teste
```

para facilitar validações repetidas.

---

# 6. MVP 0 — Bootstrap mínimo

## Objetivo

Ter o projeto executando e navegável.

## Implementar

Criar Vue 3 + Vite + TypeScript.

Rotas iniciais:

```text
/
→ mês atual

/transactions/new
→ novo lançamento

/recurrences
→ recorrências

/goals
→ metas
```

Pode existir navegação simples por links/botões.

Sem preocupação visual além de legibilidade.

## Critério de aceite

```text
npm install
npm run dev
```

abre o projeto sem erros e todas as rotas renderizam uma tela simples.

---

# 7. MVP 1 — Cadastro básico de lançamento

## Objetivo

Validar o coração do sistema.

Fluxo completo:

```text
abrir
→ cadastrar gasto
→ salvar
→ ver na listagem
→ editar
→ excluir
```

## Campos inicialmente necessários

```text
id
type
description
amount
date
responsible
paymentMethod
status
paidAt
notes
createdAt
updatedAt
```

## Tela de cadastro

Campos:

```text
Tipo
Descrição
Valor
Data
Responsável
Forma de pagamento
Observação
```

Status NÃO precisa ser escolhido no cadastro.

Sempre nasce:

```text
PENDENTE
```

## Listagem

Exibir:

```text
Descrição
Valor
Data
Responsável
Forma
Status
```

Ações:

```text
Editar
Excluir
Marcar como pago
```

## Persistência

Salvar no:

```text
localStorage
```

## Critérios de aceite

Cadastrar:

```text
Mercado
SAIDA
R$ 180
PIX
CASA
```

Resultado:

```text
aparece na listagem
fica PENDENTE
continua após F5
pode editar
pode excluir
pode marcar como PAGO
```

Ao marcar como pago:

```text
paidAt != null
```

Ao voltar para pendente:

```text
paidAt = null
```

Não avançar antes disso funcionar.

---

# 8. MVP 2 — Competência mensal e visão do mês

## Objetivo

Parar de visualizar apenas uma lista e começar a validar a lógica financeira mensal.

Adicionar ao lançamento:

```text
competence
```

Formato conceitual:

```text
2026-10
```

## Regra

### PIX / Débito / Dinheiro

Competência é o mesmo mês da data.

```text
15/09/2026
PIX

→ 2026-09
```

### Crédito

Competência começa no mês seguinte.

```text
29/09/2026
Crédito

→ 2026-10
```

Por enquanto não considerar:

```text
fechamento
vencimento
data específica do cartão
```

Crédito = próximo mês. Sempre.

---

## Home mensal

A rota `/` deve mostrar o mês atual.

Permitir:

```text
← mês anterior
mês atual
próximo mês →
```

Exibir os lançamentos pela `competence`.

## Resumo

Calcular:

```text
Entradas
Saídas
Pago
Pendente
Saldo previsto
```

Regra inicial:

```text
saldoPrevisto = entradas - saídas
```

Mostrar separadamente:

```text
Total pago
Total pendente
```

## Critério de aceite

Criar:

```text
Mercado
PIX
15/09
R$ 180
```

Deve aparecer em setembro.

Criar:

```text
Compra
Crédito
15/09
R$ 300
```

Deve aparecer em outubro.

---

# 9. MVP 3 — Crédito parcelado

## Objetivo

Validar a regra mais importante da planilha atual.

No lançamento em crédito, permitir:

```text
Número de parcelas
```

O usuário informa o **VALOR TOTAL DA COMPRA**.

Exemplo:

```text
Notebook
Valor total: R$ 2.400
Parcelas: 12
Data: 29/09/2026
```

Gerar:

```text
Out/26 → 1/12 → R$ 200
Nov/26 → 2/12 → R$ 200
...
Set/27 → 12/12 → R$ 200
```

## Regra

Primeira parcela:

```text
mês da compra + 1
```

Parcelas seguintes:

```text
+1 mês sequencialmente
```

## Arredondamento

A soma PRECISA fechar com o valor total.

Exemplo:

```text
100 / 3
```

Resultado:

```text
1/3 = 33,33
2/3 = 33,33
3/3 = 33,34
```

Nunca perder ou criar centavos.

## Modelagem temporária sugerida

Cada parcela pode ser um lançamento individual.

Campos adicionais:

```text
installmentGroupId
installmentNumber
installmentCount
originalTotalAmount
```

Exemplo:

```text
description = Notebook
amount = 200
installmentNumber = 3
installmentCount = 12
```

Visualmente:

```text
Notebook 3/12
R$ 200
```

## Exclusão

Para o protótipo, ao excluir uma parcela, perguntar:

```text
Excluir somente esta parcela
OU
Excluir todas as parcelas desta compra
```

Não implementar edição em massa sofisticada ainda.

## Critérios de aceite

Criar:

```text
R$ 1.200
4x
Crédito
Setembro
```

Esperado:

```text
Outubro 300
Novembro 300
Dezembro 300
Janeiro 300
```

Criar:

```text
R$ 100
3x
```

Esperado:

```text
33,33
33,33
33,34
```

Soma:

```text
100,00
```

---

# 10. MVP 4 — Classificação financeira

## Objetivo

Validar as classificações existentes na planilha.

Adicionar ao lançamento:

```text
categoryId
subcategoryId?
behavior
necessity
```

Onde:

```text
behavior:
FIXO
VARIAVEL
```

e:

```text
necessity:
ESSENCIAL
NECESSARIO
OPCIONAL
DESPERDICIO
```

---

## Categorias

Criar inicialmente algumas categorias fixas em código ou seed:

```text
Moradia
Alimentação
Transporte
Saúde
Pets
Lazer
Assinaturas
Reserva
Outros
```

Subcategorias podem ser cadastradas junto com elas.

Exemplo:

```text
Alimentação
├── Mercado
├── Restaurante
├── Delivery
└── Lanche
```

No protótipo, pode existir uma tela muito simples para:

```text
Adicionar categoria
Adicionar subcategoria
Editar
Excluir
```

Não precisa haver personalização visual.

## Regra

Categoria:

```text
obrigatória
```

Subcategoria:

```text
opcional
```

Categoria não obriga automaticamente comportamento ou necessidade.

---

## Critério de aceite

Cadastrar:

```text
Delivery
R$ 80
Categoria: Alimentação
Subcategoria: Delivery
Variável
Opcional
```

Depois editar apenas:

```text
Opcional → Desperdício
```

e manter todo o resto.

---

# 11. MVP 5 — Contas recorrentes

## Objetivo

Eliminar a necessidade de cadastrar manualmente todo mês contas previsíveis.

Criar entidade temporária:

```text
Recurrence
```

Campos:

```text
id
description
type
categoryId
subcategoryId?
responsible
paymentMethod
behavior
necessity
dueDay?
recurrenceValueType
defaultAmount
active
startMonth
```

Tipos de valor:

```text
FIXED
VARIABLE
```

---

## Recorrente fixa

Exemplo:

```text
Internet
FIXED
R$ 120
```

Ao visualizar um mês ainda não gerado:

```text
Internet
R$ 120
PENDENTE
```

---

## Recorrente variável

Exemplo:

```text
Energia
VARIABLE
```

Ao gerar:

```text
Energia
R$ 0
PENDENTE
needsValue = true
```

Mostrar de forma clara:

```text
Valor a informar
```

Ao editar para:

```text
R$ 187,43
```

definir:

```text
needsValue = false
```

---

## Regra de geração

Como não existe backend, gerar no próprio frontend.

Ao abrir um mês:

```text
ensureRecurrencesForMonth(month)
```

A função deve:

1. buscar recorrências ativas;
2. verificar se já existe lançamento daquele modelo naquele mês;
3. criar apenas os que ainda não existem.

Cada lançamento gerado deve guardar:

```text
recurrenceId
```

Não gerar duplicado.

Chave conceitual:

```text
recurrenceId + competence
```

deve ser única.

---

## Alteração

Editar um lançamento mensal NÃO altera a recorrência.

São ações diferentes:

```text
Editar este lançamento
Editar recorrência
```

No protótipo, podem estar em telas/botões separados.

## Critérios de aceite

Recorrência fixa:

```text
Internet
R$ 120
```

Abrir outubro:

```text
gera uma vez
```

Recarregar:

```text
não duplica
```

Abrir novembro:

```text
gera novo lançamento de R$ 120
```

Recorrência variável:

```text
Energia
```

gera:

```text
R$ 0
Valor a informar
```

---

# 12. MVP 6 — Pendências úteis na Home

## Objetivo

Transformar a tela mensal em uma lista prática para o dia a dia.

Ordenar / destacar logicamente:

```text
1. Valor a informar
2. Pendente
3. Pago
```

Não precisa definir cores.

Mostrar algo como:

```text
Energia
Valor a informar

Internet
R$ 120
Pendente

Aluguel
R$ 900
Pago em 05/10
```

Ações rápidas:

```text
Editar valor
Marcar como pago
Desmarcar pago
```

## Resumo mensal

Exibir:

```text
Entradas
Saídas
Pago
Pendente
Saldo previsto
```

Opcionalmente separar por responsável:

```text
CASA
RONALD
KAMILLE
```

Essa separação é parte do MVP porque precisamos validar se o conceito de responsável realmente é útil.

## Critério de aceite

Ao abrir um mês, deve ser possível entender sem entrar em outras telas:

```text
quanto entrou
quanto saiu
quanto já foi pago
quanto falta
quais contas ainda precisam de valor
quanto sobra
```

---

# 13. MVP 7 — Metas e reservas

## Objetivo

Validar a ideia de reserva flexível.

Criar:

```text
Goal
```

Campos:

```text
id
name
targetAmount
targetDate
active
createdAt
```

Criar:

```text
GoalMovement
```

Campos:

```text
id
goalId
type
amount
date
note?
```

Tipos:

```text
CONTRIBUTION
WITHDRAWAL
```

---

## Saldo

Nunca armazenar manualmente o saldo atual.

Calcular:

```text
saldo =
soma(CONTRIBUTION)
-
soma(WITHDRAWAL)
```

---

## Sugestão mensal

Calcular:

```text
faltante = objetivo - saldo
mesesRestantes = meses até prazo
sugestaoMensal = faltante / mesesRestantes
```

Tratar:

```text
meta já alcançada
prazo vencido
prazo no mês atual
saldo maior que objetivo
```

sem gerar divisão inválida.

---

## Exemplo

```text
Meta: Mudança
Objetivo: R$ 10.000
Prazo: Dez/2027
Saldo: R$ 1.000
```

Sistema calcula sugestão.

Aporte:

```text
+ R$ 500
```

Retirada:

```text
- R$ 300
Motivo: mês apertado
```

Sistema recalcula.

---

## Integração temporária com fluxo financeiro

Para validar impacto real no orçamento:

```text
APORTE
→ cria SAÍDA financeira

RETIRADA
→ cria ENTRADA financeira
```

O lançamento deve estar vinculado ao movimento da meta.

Isso é uma regra do protótipo e deve ser validada na prática antes da arquitetura definitiva.

---

## Critério de aceite

Criar meta:

```text
R$ 10.000
prazo futuro
```

Registrar:

```text
aporte 500
retirada 200
```

Esperado:

```text
saldo da meta = 300
```

e a sugestão mensal deve ser recalculada.

---

# 14. MVP 8 — Validação completa do fluxo

Nesta etapa NÃO adicionar funcionalidade nova.

Objetivo:

```text
usar o protótipo
encontrar regra errada
corrigir
simplificar
```

Criar dados reais ou próximos da realidade.

---

## Cenário 1 — Gasto comum

```text
Mercado
R$ 180
PIX
Casa
Alimentação
Mercado
Variável
Essencial
```

Esperado:

```text
mês atual
pendente
```

Depois marcar pago.

---

## Cenário 2 — Crédito à vista

```text
Compra R$ 300
Crédito
1x
Setembro
```

Esperado:

```text
Outubro R$ 300
```

---

## Cenário 3 — Parcelado

```text
Notebook
R$ 2.400
12x
Setembro
```

Esperado:

```text
Outubro até Setembro do ano seguinte
12 parcelas
soma total = 2.400
```

---

## Cenário 4 — Recorrente fixa

```text
Internet
R$ 120
```

Esperado:

```text
todo mês
R$ 120
pendente
sem duplicação
```

---

## Cenário 5 — Recorrente variável

```text
Energia
```

Esperado:

```text
todo mês
R$ 0
Valor a informar
```

Após edição:

```text
R$ 187,43
```

---

## Cenário 6 — Pagamento atrasado

```text
Internet
Competência: Outubro
```

Marcar pago em novembro.

Esperado:

```text
continua em Outubro
paidAt = Novembro
```

---

## Cenário 7 — Responsáveis

Criar lançamentos para:

```text
Casa
Ronald
Kamille
```

Validar totais individualmente.

---

## Cenário 8 — Reserva

Criar meta, aportar, retirar e validar:

```text
saldo
sugestão mensal
impacto mensal
```

---

# 15. Fluxo feliz final do protótipo

O protótipo é considerado validado quando este cenário funciona:

```text
Abrir Outubro
↓
ver contas recorrentes geradas
↓
Energia aparece com valor pendente
↓
informar valor da Energia
↓
registrar Mercado via PIX
↓
registrar compra no Crédito
↓
registrar compra parcelada
↓
marcar Internet como paga
↓
consultar resumo
↓
ver valores de Casa / Ronald / Kamille
↓
registrar aporte em uma meta
↓
fechar e abrir navegador
↓
todos os dados continuam corretos
```

---

# 16. O que NÃO fazer durante este protótipo

Não gastar tempo com:

```text
cores
branding
animações
dark mode
layout perfeito
responsividade refinada
component library
dashboard bonito
gráficos
deploy
login
segurança
Supabase
RLS
migration
CI/CD
testes de integração complexos
```

A interface deve apenas ser:

```text
legível
clicável
utilizável no navegador
razoavelmente confortável em largura de celular
```

---

# 17. Regra de trabalho para o Claude

Executar UM MVP por vez.

Para cada MVP:

1. ler a regra;
2. inspecionar o código atual;
3. implementar somente o necessário;
4. manter o projeto executando;
5. validar manualmente o cenário daquela etapa;
6. corrigir erros;
7. informar:
   - o que foi implementado;
   - arquivos alterados;
   - regra validada;
   - limitações atuais;
8. parar.

NÃO iniciar automaticamente o MVP seguinte.

Esperar a validação do usuário antes de continuar.

---

# 18. Prioridade de implementação

Ordem:

```text
MVP 0  Bootstrap
↓
MVP 1  Lançamento básico
↓
MVP 2  Competência mensal
↓
MVP 3  Crédito e parcelamento
↓
MVP 4  Classificação
↓
MVP 5  Recorrências
↓
MVP 6  Home mensal útil
↓
MVP 7  Metas e reservas
↓
MVP 8  Validação geral
```

Cada etapa deve deixar uma funcionalidade real funcionando.

---

# 19. Depois da validação

Somente quando o protótipo estiver validado, iniciar uma nova fase para decidir:

```text
modelagem definitiva
Supabase
PostgreSQL
Auth
RLS
Vue final
PWA
Vercel
sincronização entre Ronald e Kamille
estrutura de produção
migração dos dados
```

Não antecipar essas decisões agora.

---

# 20. Objetivo principal

O protótipo não existe para provar que a arquitetura está correta.

Ele existe para provar que:

```text
as regras financeiras estão corretas
+
o fluxo é simples de usar
+
o produto realmente ajuda no dia a dia
```

Se uma regra mudar durante os testes, mudar sem medo.

A arquitetura definitiva será feita depois que o comportamento do produto estiver validado.
