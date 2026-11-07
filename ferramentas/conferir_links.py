"""Confere os links internos do site gerado (_site): href, src e âncoras (#id).
Uso: python3 ferramentas/conferir_links.py [_site]
Sai com erro se algum link apontar para um arquivo ou âncora que não existe.
Os projetos do portfólio (portfolio.html#id) são montados pelo dados.js, então essas âncoras vêm de lá.
"""
import os, re, sys
from urllib.parse import urlsplit, unquote

RAIZ = sys.argv[1] if len(sys.argv) > 1 else "_site"
ids = {}
paginas = []
for pasta, _, arquivos in os.walk(RAIZ):
    for a in arquivos:
        if a.endswith(".html"):
            p = os.path.join(pasta, a)
            html = open(p, encoding="utf-8").read()
            paginas.append((p, html))
            ids[os.path.normpath(p)] = set(re.findall(r'\bid="([^"]+)"', html))
dados = os.path.join(RAIZ, "dados.js")
if os.path.exists(dados):
    projetos = set(re.findall(r'id:\s*"([^"]+)"', open(dados, encoding="utf-8").read()))
    for nome in ("portfolio.html", os.path.join("en", "portfolio.html")):
        ids.setdefault(os.path.normpath(os.path.join(RAIZ, nome)), set()).update(projetos)

erros = 0
for p, html in paginas:
    for attr, url in re.findall(r'\b(href|src)="([^"]+)"', html):
        u = urlsplit(url)
        if u.scheme or url.startswith("//") or url.startswith("mailto:") or url.startswith("data:"):
            continue
        caminho = unquote(u.path)
        if caminho == "":
            alvo = p
        elif caminho.startswith("/"):
            alvo = os.path.join(RAIZ, caminho.lstrip("/"))
        else:
            alvo = os.path.join(os.path.dirname(p), caminho)
        if alvo.endswith("/") or os.path.isdir(alvo):
            alvo = os.path.join(alvo, "index.html")
        alvo = os.path.normpath(alvo)
        if not os.path.exists(alvo):
            print(f"QUEBRADO  {p}: {url}"); erros += 1; continue
        # "#/..." são rotas do hub (hub.js), não âncoras
        if u.fragment and not u.fragment.startswith("/") and alvo.endswith(".html") and u.fragment not in ids.get(alvo, set()):
            print(f"ÂNCORA    {p}: {url}"); erros += 1
print(f"{len(paginas)} páginas conferidas, {erros} problema(s).")
sys.exit(1 if erros else 0)
