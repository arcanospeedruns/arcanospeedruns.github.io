# arcanospeedruns.github.io

Portfólio de Carlos Gouveia, em português e inglês: <https://carlosgouveia.is-a.dev>

## Como é feito

- HTML, CSS e JavaScript sem framework. As animações (carpas em ASCII, onda de pontos, grade do portfólio) são desenhadas em `<canvas>`.
- [Eleventy](https://www.11ty.dev/) monta as páginas a partir de modelos Nunjucks: o `<head>`, o topo, o menu e o seletor de idioma são escritos uma vez só, em `src/_includes/`.
- Cada página tem um modelo só, com o português e o inglês lado a lado: `{% tr %}texto<!--en-->text{% endtr %}`. O Eleventy gera as duas versões (`/sobre.html` e `/en/sobre.html`).
- Os cartões do portfólio já saem prontos no HTML; o JavaScript só abre a gaveta de detalhes.
- Cada arquivo CSS e JS ganha `?v=` com o hash do conteúdo na hora de gerar, então o navegador só baixa de novo o que mudou.
- O GitHub Actions gera o site (inclusive o `hub.js`, empacotado com o esbuild), confere os links internos e publica no GitHub Pages a cada push na `main`. Uma vez por semana outro fluxo confere os links externos.

## Estrutura

```
src/
  _includes/base.njk   <head>, scripts e seletor de idioma
  _includes/topo.njk   topo com o nome, o idioma e o menu
  _data/site.json      endereço do site e textos do menu em cada idioma
  _data/projetos.cjs   projetos do portfólio, em português e inglês
  _data/eleventyComputed.cjs   língua, título e descrição de cada versão
  index.njk            landing (carpas)        -> /          e /en/
  sobre.njk            sobre                   -> /sobre.html e /en/sobre.html
  portfolio.njk        cartões dos projetos    -> /portfolio.html e /en/portfolio.html
  contato.njk          contato                 -> /contato.html e /en/contato.html
  projetos/psique.njk  página de um projeto
  hub.njk              hub (posts)             -> /hub.html
  404.njk, sitemap.njk, robots.txt
  *.css, *.js, fonts/, projetos/*/ imagens, PDFs do currículo
ferramentas/conferir_links.py   confere href, src e âncoras do site gerado
ferramentas/hub/hub-fonte.js    código do hub (vira src/hub.js no build)
```

## Rodar no computador

```
npm ci
npm run dev      # abre em http://localhost:8080 e recarrega ao salvar
npm run build    # gera o hub.js e o site em _site/
python3 ferramentas/conferir_links.py _site
```

## Mudanças comuns

- **Texto de uma página:** edite `src/<página>.njk`. Texto traduzido fica em `{% tr %}português<!--en-->inglês{% endtr %}`; o que é igual nos dois idiomas fica fora. Título e descrição de cada idioma ficam em `meta:` no cabeçalho.
- **Projeto no portfólio:** edite `src/_data/projetos.cjs` (cada texto tem `pt` e `en`).
- **Currículo (PDF):** edite o texto em `ferramentas/curriculo.py` e rode `python3 ferramentas/curriculo.py` (precisa do Playwright com Chromium). Gera `src/curriculo.pdf` e `src/curriculo-en.pdf`.
- **Imagem de compartilhamento (prévia no Discord, WhatsApp etc.):** gerada sozinha a cada publicação por `ferramentas/og.py`, com o título de cada página. Para mudar o visual, edite os modelos nesse arquivo.
- **Página nova:** copie o cabeçalho (front matter) de uma página parecida e ajuste `permalink`, `caminho` e o `meta:` com título e descrição em cada idioma.

## Fontes

Satoshi e Switzer ([Fontshare](https://www.fontshare.com), ITF Free Font License) e Departure Mono (SIL OFL).
