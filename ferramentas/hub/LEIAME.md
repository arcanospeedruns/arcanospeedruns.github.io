# Hub

`hub-fonte.js` é o código do hub. O `hub.js` da raiz é a versão empacotada (com o supabase-js dentro):

    npm install
    npx esbuild hub-fonte.js --bundle --minify --format=iife --target=es2020 --legal-comments=none --outfile=../../hub.js

O banco e as regras de acesso estão em `supabase/hub.sql`. A chave pública vai em `hub-config.js`.
