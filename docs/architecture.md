# Arquitetura — Nossa Grana

> Documento de referência arquitetural do projeto.
>
> **Status:** v0.1 — MVP
> **Princípio:** estruturar o necessário agora sem antecipar complexidade.

## 1. Objetivo

O Nossa Grana será desenvolvido verticalmente: cada MVP deve entregar uma funcionalidade completa, da interface até a persistência.

Exemplo:

```text
Cadastro de lançamento
    ↓
Tela
    ↓
Caso de uso
    ↓
Regra de domínio
    ↓
Persistência
    ↓
Funcionalidade utilizável
```

A arquitetura deve permitir evolução gradual sem exigir que o MVP já possua a complexidade da versão final.

---

## 2. Stack

| Área | Tecnologia / decisão |
|---|---|
| Aplicação | SPA |
| Framework | Vue 3 |
| Linguagem | TypeScript |
| Build | Vite |
| API do Vue | Composition API |
| Componentes Vue | `<script setup lang="ts">` |
| Roteamento | Vue Router |
| Arquitetura | FSD pragmática |
| Modelagem | DDD pragmático |
| Persistência do MVP | LocalStorage |
| Persistência futura | Supabase / PostgreSQL |
| Hospedagem | Vercel |
| Interface | Mobile-first |

---

## 3. Princípios arquiteturais

A arquitetura segue quatro ideias principais:

1. **FSD organiza a aplicação.**
2. **DDD organiza o domínio.**
3. **Infraestrutura deve ser substituível.**
4. **Abstrações só existem quando resolvem um problema concreto.**

Não será implementado DDD ou FSD de forma rígida apenas para seguir padrões.

O objetivo é obter separação de responsabilidades sem criar burocracia arquitetural.

---

# 4. FSD pragmática

Estrutura atual:

```text
src/
├── app/
│   ├── composition/
│   ├── router/
│   ├── App.vue
│   ├── main.ts
│   └── styles.css
│
├── pages/
│   ├── home/
│   ├── transactions/
│   ├── categories/
│   ├── recurrences/
│   └── goals/
│
├── features/
│   ├── transactions/
│   ├── categories/
│   ├── recurrences/
│   └── goals/
│
├── entities/
│   ├── transaction/
│   ├── category/
│   ├── recurrence/
│   └── goal/
│
└── env.d.ts
```

`shared/` será criado somente quando houver código compartilhado real. Não serão criadas camadas FSD adicionais como `widgets` ou `processes`.

Elas somente devem aparecer caso exista uma necessidade concreta.

---

## 5. Responsabilidade das camadas

### `app`

Inicialização e configuração global da aplicação.

Exemplos:

- Vue Router;
- providers;
- configuração global;
- montagem da aplicação.

Não deve conter regras financeiras.

---

### `pages`

Representam páginas acessíveis através do roteamento.

Exemplos:

```text
pages/dashboard
pages/lancamentos
pages/configuracoes
```

Uma página deve principalmente compor features e componentes.

Evitar colocar regras de negócio diretamente nela.

---

### `features`

Representam ações que o usuário executa.

Exemplos:

```text
criar-lancamento
editar-lancamento
excluir-lancamento
filtrar-lancamentos
```

Estrutura possível:

```text
features/
└── criar-lancamento/
    ├── model/
    │   └── criarLancamento.ts
    ├── ui/
    │   └── CriarLancamentoForm.vue
    └── index.ts
```

Uma feature pode coordenar:

```text
UI
 ↓
caso de uso
 ↓
domínio
 ↓
repository
```

---

### `entities`

Representam conceitos do domínio.

Exemplos:

```text
Lancamento
Competencia
Categoria
Dinheiro
```

Exemplo:

```text
entities/
└── lancamento/
    ├── model/
    │   ├── Lancamento.ts
    │   ├── LancamentoRepository.ts
    │   └── rules.ts
    └── index.ts
```

Entidades e regras de domínio devem utilizar TypeScript puro.

---

### `shared`

Código genérico que não pertence a uma feature específica.

Exemplos:

```text
shared/ui
shared/lib
shared/types
shared/infrastructure
```

Evitar transformar `shared` em um diretório para qualquer código que não sabemos onde colocar.

---

# 6. DDD pragmático

O projeto utilizará conceitos de Domain-Driven Design quando eles ajudarem a representar corretamente o negócio.

Não será utilizado DDD cerimonial.

## Regra principal

O domínio não deve conhecer detalhes técnicos externos.

Código dentro do domínio não deve depender diretamente de:

```ts
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '...'
```

O domínio deve continuar funcionando como TypeScript puro.

---

# 7. Direção das dependências

Conceitualmente:

```text
UI ──────────────┐
                 ↓
Feature ─────→ Domain
                 ↑
                 │ implementa contrato
Infrastructure ──┘
```

Outra forma de visualizar:

```text
┌─────────────────────────────┐
│             UI              │
│        Vue / Pages          │
├─────────────────────────────┤
│          FEATURES           │
│       casos de uso          │
├─────────────────────────────┤
│           DOMAIN            │
│ entidades / regras / VOs    │
├─────────────────────────────┤
│       INFRASTRUCTURE        │
│ LocalStorage / Supabase     │
└─────────────────────────────┘
```

A infraestrutura pode depender dos contratos definidos pelo domínio.

O domínio não depende da infraestrutura.

---

# 8. Persistência

A persistência deve ficar atrás de contratos.

Exemplo:

```ts
export interface LancamentoRepository {
  salvar(lancamento: Lancamento): Promise<void>

  buscarPorCompetencia(
    competencia: Competencia
  ): Promise<Lancamento[]>

  excluir(id: string): Promise<void>
}
```

O domínio sabe que existe um `LancamentoRepository`, mas não sabe como os dados são armazenados.

## MVP

```text
LancamentoRepository
        ↑
LocalStorageLancamentoRepository
```

## Futuro

```text
LancamentoRepository
        ↑
SupabaseLancamentoRepository
```

Objetivo:

```text
           LancamentoRepository
                   ↑
                   │
         ┌─────────┴──────────┐
         │                    │
    LocalStorage           Supabase
       MVP                 Produção
```

A migração para Supabase não deve exigir alterações nas regras de domínio ou nos componentes da interface.

---

# 9. Dinheiro

Valores monetários no domínio serão representados em **centavos**.

Evitar:

```ts
const valor = 19.90
```

Preferir:

```ts
const valorCentavos = 1990
```

Exemplos:

```text
R$ 10,00    → 1000
R$ 19,90    → 1990
R$ 1.234,56 → 123456
```

Isso evita problemas de precisão de ponto flutuante em cálculos financeiros.

Um Value Object `Dinheiro` pode ser utilizado quando houver regras suficientes para justificar sua existência.

Exemplo:

```ts
class Dinheiro {
  constructor(readonly centavos: number) {
    if (!Number.isInteger(centavos)) {
      throw new Error('Valor monetário deve ser representado em centavos')
    }
  }

  somar(outro: Dinheiro): Dinheiro {
    return new Dinheiro(this.centavos + outro.centavos)
  }
}
```

---

# 10. Competência

Competência é um conceito explícito do domínio.

Não deve ser inferida implicitamente apenas através de `new Date()`.

Exemplo:

```ts
class Competencia {
  constructor(
    readonly ano: number,
    readonly mes: number
  ) {
    if (mes < 1 || mes > 12) {
      throw new Error('Mês inválido')
    }
  }
}
```

Devemos distinguir, conforme o domínio evoluir:

```text
data da compra
data de vencimento
data de pagamento
competência
data de criação do registro
```

Esses conceitos não devem ser tratados automaticamente como equivalentes.

As regras específicas para cartão, parcelamento e recorrência serão definidas quando essas funcionalidades entrarem no produto.

---

# 11. Vue

Será utilizado:

```text
Vue 3
Composition API
<script setup lang="ts">
```

Exemplo:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const valor = ref(0)

const valorFormatado = computed(() => {
  return `R$ ${valor.value}`
})

function salvar() {
  // ação
}
</script>
```

Composables podem ser utilizados para comportamento de interface e integração das features.

Exemplos:

```text
useLancamentos()
useCompetencia()
useCriarLancamento()
```

Composables não devem virar um local para esconder regras importantes do domínio.

---

# 12. Estado

Não será adotado um gerenciador global de estado apenas por convenção.

Ordem preferencial:

```text
estado local
    ↓
composable
    ↓
estado compartilhado
    ↓
Pinia, se houver necessidade real
```

Pinia poderá ser introduzido futuramente para estados realmente globais, como:

- usuário autenticado;
- configurações globais;
- contexto compartilhado entre áreas independentes.

---

# 13. Interface

A aplicação será desenvolvida **mobile-first**.

Prioridade:

```text
Mobile
  ↓
Tablet
  ↓
Desktop
```

A interface deve funcionar bem principalmente em dispositivos móveis.

Componentes reutilizáveis podem ficar em:

```text
shared/ui/
```

Exemplos futuros:

```text
AppButton.vue
AppInput.vue
AppSelect.vue
AppModal.vue
AppCard.vue
AppMoneyInput.vue
```

Não será criado um Design System completo durante o MVP.

Componentes compartilhados devem surgir conforme repetição real aparecer.

---

# 14. Supabase

Na versão posterior ao MVP, Supabase será responsável inicialmente por:

```text
PostgreSQL
Auth
Row Level Security (RLS)
```

Fluxo esperado:

```text
Vue
 │
 ├── Features
 │
 └── Repository
       │
       ↓
    Supabase
       │
       ├── PostgreSQL
       ├── Auth
       └── RLS
```

RLS será tratado como parte da segurança da aplicação.

A autorização dos dados não deve depender apenas de filtros enviados pelo frontend.

---

# 15. Testes

A prioridade de testes será o domínio e regras financeiras.

Exemplos:

```text
cálculo de saldo
soma de receitas
soma de despesas
competência
parcelamento
recorrência
regras de lançamento
```

Exemplo:

```ts
expect(
  dinheiro(1000).somar(dinheiro(500))
).toEqual(dinheiro(1500))
```

Não existe meta inicial de cobertura artificial.

Testes devem proteger comportamentos importantes.

---

# 16. Desenvolvimento vertical

Cada etapa deve produzir uma funcionalidade utilizável.

Evitar:

```text
banco inteiro
    ↓
backend inteiro
    ↓
frontend inteiro
```

Preferir:

```text
feature
  ↓
UI
  ↓
regra
  ↓
persistência
  ↓
validação
```

Exemplo:

```text
Cadastrar gasto
    ↓
formulário
    ↓
CriarLancamento
    ↓
Lancamento
    ↓
LancamentoRepository
    ↓
LocalStorage
```

Somente depois partimos para a próxima fatia.

---

# 17. O que NÃO faremos agora

Durante o MVP, evitar antecipar:

- estrutura completa do banco Supabase;
- backend próprio;
- microserviços;
- CQRS;
- Event Sourcing;
- Unit of Work;
- Domain Events sem necessidade;
- factories sem necessidade;
- services genéricos;
- abstrações para possíveis necessidades futuras;
- Pinia sem estado global real;
- Design System completo;
- sincronização offline avançada;
- Open Finance;
- importação bancária;
- sistema de permissões complexo;
- contas compartilhadas;
- organizações;
- infraestrutura complexa de CI/CD.

---

# 18. Regra contra overengineering

Antes de criar uma abstração, perguntar:

> Qual problema concreto essa abstração resolve hoje?

Se não houver uma resposta objetiva, provavelmente ainda não precisamos dela.

Não criar:

```text
Factory
Builder
Service
Manager
Helper
Adapter
Mapper
DTO
DomainEvent
```

apenas porque o padrão existe.

Criar quando o domínio ou a infraestrutura realmente exigirem.

---

# 19. Regra para novas funcionalidades

Ao implementar uma nova funcionalidade:

### 1. Identificar o domínio

Perguntar:

```text
Qual conceito financeiro está envolvido?
Existe uma regra de negócio?
Essa regra já existe?
```

### 2. Identificar a ação

Perguntar:

```text
O que o usuário está tentando fazer?
```

Isso normalmente indica a `feature`.

### 3. Identificar a interface

Perguntar:

```text
Em qual página essa ação aparece?
Existe componente compartilhável real?
```

### 4. Identificar persistência

Perguntar:

```text
Precisamos persistir algo?
Qual contrato de repository representa essa necessidade?
```

### 5. Implementar verticalmente

```text
UI
 ↓
Feature
 ↓
Domain
 ↓
Repository
 ↓
Infrastructure
```

### 6. Validar antes de expandir

A feature deve estar funcionando antes de iniciar abstrações ou funcionalidades adjacentes.

---

# 20. Critério para evolução da arquitetura

A arquitetura não é definitiva.

Durante o desenvolvimento devemos observar:

1. É fácil descobrir onde colocar código novo?
2. Uma feature consegue mudar sem afetar áreas não relacionadas?
3. As regras financeiras estão independentes da interface e da persistência?
4. Conseguimos testar regras sem subir Vue?
5. Estamos criando arquivos ou camadas que não entregam benefício?

Se a resposta da última pergunta começar a ser frequentemente **sim**, a arquitetura deve ser simplificada.

---

# Resumo

A arquitetura do Nossa Grana pode ser resumida por:

> **FSD organiza a aplicação. DDD organiza o domínio. A infraestrutura é substituível. Abstrações só existem quando resolvem um problema concreto.**

E o desenvolvimento segue:

```text
pensar pequeno
      ↓
implementar verticalmente
      ↓
validar
      ↓
aprender
      ↓
evoluir arquitetura
```

O MVP deve permanecer simples, mas suas fronteiras devem permitir que LocalStorage, autenticação, Supabase e novas regras financeiras sejam adicionados progressivamente sem reconstruir toda a aplicação.
