# Instruções para agentes neste repositório

Site estático gerado com Eleventy. **A fonte fica em `src/`; o site publicado é gerado no GitHub Actions.**

- Edite só arquivos em `src/` (e `ferramentas/`). Não crie nem edite `.html` na raiz do repositório: eles não são publicados.
- Toda página existe em português (`src/x.njk`) e inglês (`src/en/x.njk`). Mudou o texto de uma, mude a outra.
- Projetos do portfólio: `src/dados.js` (PT, com o código que monta os cartões) e `src/dados-en.js` (EN). Imagens em `src/projetos/<id>/`.
- Não escreva `?v=` nos links de CSS/JS: o filtro `versao` coloca o hash sozinho. Use caminhos começando com `/` em `scripts:` e `preload:`.
- Antes de publicar: `npm ci && npm run build && python3 ferramentas/conferir_links.py _site` (precisa terminar com 0 problemas).
- Outras sessões também publicam aqui: rode `git pull --rebase` antes de commitar.
- Mensagens de commit em português.
