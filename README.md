# arcanospeedruns.github.io

Portfólio de Carlos Gouveia, em português e inglês: <https://arcanospeedruns.github.io>

## Como é feito

- HTML, CSS e JavaScript sem framework. As animações (carpas em ASCII, onda de pontos, grade do portfólio) são desenhadas em `<canvas>`.
- [Eleventy](https://www.11ty.dev/) monta as páginas a partir de modelos Nunjucks: o `<head>`, o topo, o menu e o seletor de idioma são escritos uma vez só, em `src/_includes/`.
- Cada arquivo CSS e JS ganha `?v=` com o hash do conteúdo na hora de gerar, então o navegador só baixa de novo o que mudou.
- O GitHub Actions gera o site, confere os links internos e publica no GitHub Pages a cada push na `main`. Uma vez por semana outro fluxo confere os links externos.

## Estrutura

```
src/
  _includes/base.njk   <head>, scripts e seletor de idioma
  _includes/topo.njk   topo com o nome, o idioma e o menu
  _data/site.json      endereço do site e textos do menu em cada idioma
  index.njk            landing (carpas)        -> /
  sobre.njk            sobre                   -> /sobre.html
  portfolio.njk        cartões dos projetos    -> /portfolio.html (dados em dados.js)
  contato.njk          contato                 -> /contato.html
  projetos/psique.njk  página de um projeto
  en/                  as mesmas páginas em inglês (dados-en.js tem os textos dos projetos)
  404.njk, sitemap.njk, robots.txt
  *.css, *.js, fonts/, projetos/*/ imagens, PDFs do currículo
ferramentas/conferir_links.py   confere href, src e âncoras do site gerado
```

## Rodar no computador

```
npm ci
npm run dev      # abre em http://localhost:8080 e recarrega ao salvar
npm run build    # gera em _site/
python3 ferramentas/conferir_links.py _site
```

## Mudanças comuns

- **Texto de uma página:** edite `src/<página>.njk` e a versão em `src/en/`.
- **Projeto no portfólio:** edite `src/dados.js` (português) e `src/dados-en.js` (inglês).
- **Página nova:** copie o cabeçalho (front matter) de uma página parecida e ajuste `permalink`, `par` (a página no outro idioma), `titulo`, `descricao` e `scripts`.

## Fontes

Tanker e Switzer ([Fontshare](https://www.fontshare.com), ITF Free Font License) e Departure Mono (SIL OFL).
