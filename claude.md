# controle-gastos-primo

App web simples para lançamento e exportação de gastos agrícolas. Arquivo único HTML com JS vanilla — sem framework, sem build step, sem dependências locais.

## Stack

- HTML + CSS + JS vanilla (arquivos separados: `index.html`, `style.css`, `script.js`)
- Biblioteca externa: `docx@8.5.0` via CDN (Cloudflare) — geração de `.docx` no browser
- Persistência: `localStorage` do navegador
- Sem backend, sem banco de dados, sem Node.js

## Como rodar

Abrir `index.html` diretamente no navegador. Não precisa de servidor.

## Estrutura dos arquivos

```
index.html   — estrutura HTML: formulário, tabela, modal
style.css    — todo o CSS (variáveis, layout, modal, responsivo)
script.js    — lógica de estado, filtros, render, exportação PDF e Word
```

## Funcionalidades principais

- Lançar gastos (data, histórico, valor com máscara BRL)
- Filtrar por mês/ano
- Resumo automático (total, contagem, média)
- Modal de pré-visualização do relatório antes de exportar
- Exportar PDF (via `window.print()` em nova aba)
- Exportar Word (`.docx` gerado via biblioteca `docx` no browser, download direto)

## Convenções de código

- Estado global em variável `gastos` (array de objetos `{id, data, hist, valor}`)
- `localStorage` como persistência — chave: `'gastos'`
- Formatação monetária sempre via `formatBRL()` / `parseBRL()`
- Datas armazenadas como `YYYY-MM-DD`, exibidas como `DD/MM/YYYY`
- Funções nomeadas em camelCase, sem classes
- CSS com variáveis em `:root` — não usar valores hardcoded de cor fora delas

## Correções e ajustes já aplicados

- Data do input usa `new Date().toISOString().split('T')[0]` (compatível com Firefox)
- `input[type="date"]` tem `lang="pt-BR"` para exibir no formato `dd/mm/aaaa` no Chrome/Edge
- `exportPDF`: verifica se `window.open` retornou `null` (popup bloqueado) antes de prosseguir
- `exportWord`: verifica `typeof docx === 'undefined'` antes de tentar usar a biblioteca
- Cards de estatísticas: padding aumentado, `letter-spacing: 0` nos valores, fonte em `2.2rem`

## O que NÃO fazer

- Não adicionar framework (React, Vue etc.) sem necessidade clara
- Não usar `sessionStorage` nem cookies — só `localStorage`
- Não remover o CDN do `docx` sem substituir a exportação Word
- Não mesclar CSS/JS de volta no HTML — a separação em três arquivos é intencional