# arcanospeedruns.github.io

Portfólio de Carlos Gouveia, product designer, em português e inglês: <https://carlosgouveia.is-a.dev>

## Como é feito

- Uma página só. A abertura mostra os três trabalhos (Psiquê, Ruela Discos e twenty one pilots); a imagem troca sozinha e, ao clicar nela ou no nome, a área do projeto sobe por cima.
- Cada projeto tem endereço próprio (`/#psique`, `/#ruela`, `/#twenty-one-pilots`), então dá para mandar o link direto e o botão voltar do navegador fecha a área. Sem JavaScript, os projetos aparecem um embaixo do outro.
- HTML, CSS e JavaScript sem framework. [Eleventy](https://www.11ty.dev/) gera a versão em português (`/`) e a em inglês (`/en/`) a partir de um modelo só: `{% tr %}texto<!--en-->text{% endtr %}`.
- As peças dos projetos são imagens WebP exportadas dos canvas de design, em `src/projetos/<projeto>/`.
- O GitHub Actions gera o site, cria as imagens de compartilhamento, confere os links internos e publica no GitHub Pages a cada push na `main`. Uma vez por semana outro fluxo confere os links externos.

## Estrutura

```
src/
  index.njk              a página (abertura e os três projetos)   -> / e /en/
  style.css, site.js     visual e comportamento da página
  _includes/base.njk     <head> e scripts
  _data/                 endereço do site e idiomas
  projetos/psique/, projetos/ruela/, projetos/twenty-one-pilots/   imagens
  404.njk                página de erro; manda links das páginas antigas para o início
  fonts/, curriculo.pdf, curriculo-en.pdf, favicon, og.png
ferramentas/conferir_links.py   confere href, src e âncoras do site gerado
ferramentas/og.py               imagens de compartilhamento
ferramentas/curriculo.py        gera os PDFs do currículo
```

## Rodar no computador

```
npm ci
npm run dev      # abre em http://localhost:8080 e recarrega ao salvar
npm run build    # gera o site em _site/
python3 ferramentas/conferir_links.py _site
```

## Mudanças comuns

- **Texto:** edite `src/index.njk`. Texto traduzido fica em `{% tr %}português<!--en-->inglês{% endtr %}`.
- **Imagem de um projeto:** coloque o `.webp` em `src/projetos/<projeto>/` e acrescente uma linha `foto(...)` na seção do projeto em `index.njk`, com a largura, a altura e a descrição em cada idioma. Imagens dentro de `<div class="fileira">` ficam lado a lado com a mesma altura.
- **Currículo (PDF):** edite `ferramentas/curriculo.py` e rode `python3 ferramentas/curriculo.py` (precisa do Playwright com Chromium).

## Fontes

Satoshi e Switzer ([Fontshare](https://www.fontshare.com), ITF Free Font License). Departure Mono e Michroma (SIL OFL) só nas imagens de compartilhamento.
