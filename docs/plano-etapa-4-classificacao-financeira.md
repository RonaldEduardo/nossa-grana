# Plano de Implementacao - Etapa 4: Classificacao Financeira

## Objetivo

Permitir classificar os lancamentos para validar se as categorias, o comportamento e a necessidade ajudam na organizacao financeira.

## Sera implementado

- Campos adicionais no lancamento:
  - `categoryId`.
  - `subcategoryId` opcional.
  - `behavior`.
  - `necessity`.
- Categorias iniciais disponiveis: Moradia, Alimentacao, Transporte, Saude, Pets, Lazer, Assinaturas, Reserva e Outros.
- Persistencia das categorias no `localStorage`, na chave `finance.categories`.
- Tela simples para criar, editar e excluir categorias e subcategorias.
- Selecao de categoria, subcategoria, comportamento e necessidade no cadastro e na edicao de lancamentos.

## Regras

- Categoria e obrigatoria para novos lancamentos.
- Subcategoria e opcional e pertence a uma categoria.
- Comportamento permite `FIXO` ou `VARIAVEL`.
- Necessidade permite `ESSENCIAL`, `NECESSARIO`, `OPCIONAL` ou `DESPERDICIO`.
- Categoria nao define automaticamente comportamento ou necessidade.
- A edicao de uma classificacao deve manter os demais dados do lancamento.
- A exclusao de categoria com lancamentos vinculados deve ser bloqueada ou exigir que os lancamentos sejam reclassificados antes.

## Validacao manual

1. Criar ou selecionar a categoria `Alimentacao` e a subcategoria `Delivery`.
2. Cadastrar um lancamento `Delivery`, de R$ 80, como `VARIAVEL` e `OPCIONAL`.
3. Confirmar que a classificacao e persistida apos recarregar a pagina.
4. Editar somente a necessidade para `DESPERDICIO`.
5. Confirmar que descricao, valor, categoria, subcategoria e comportamento permanecem inalterados.

## Fora do escopo

- Relatorios e filtros por categoria.
- Regras automaticas de classificacao.
- Orcamentos por categoria.
- Recorrencias, metas e reservas.
