# Hub

`hub-fonte.js` é o código do hub. O `src/hub.js` (com o supabase-js dentro) é gerado
a cada `npm run build`, inclusive no GitHub Actions, e não vai para o repositório.
Para gerar só ele:

    npm run hub

O banco e as regras de acesso estão em `supabase/hub.sql`. A chave pública vai em `src/hub-config.js`.
