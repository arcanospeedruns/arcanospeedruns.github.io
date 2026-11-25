"""Gera as imagens de compartilhamento (og:image) de cada página do site gerado.

Roda no GitHub Actions depois do Eleventy, a cada publicação:
    python3 ferramentas/og.py _site

Para cada página que usa a imagem padrão (/og.png), desenha um cartão 1200x630
no visual do site, com o título daquela página, salva em _site/og/<página>.png
e troca o og:image da página por esse arquivo com ?v=<hash>. Como o endereço
muda quando a imagem muda, Discord, WhatsApp e LinkedIn buscam a versão nova.
Páginas com outra imagem ficam como estão.

Precisa do Playwright com Chromium:
    pip install playwright && python -m playwright install --with-deps chromium
"""
import base64
import hashlib
import html
import re
import sys
import unicodedata
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ_REPO = Path(__file__).resolve().parent.parent
SITE = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
FONTES = SITE / "fonts"
# gato da marca (o mesmo do canto do site), em preto com os olhos vazados
GATO = ('<svg class="marca-gato" viewBox="36 18 136 154" aria-hidden="true"><mask id="olhos-gato">'
        '<rect x="0" y="0" width="200" height="200" fill="#fff"/><g fill="#000">'
        '<ellipse cx="104" cy="112" rx="12" ry="17.5" transform="rotate(-5 104 112)"/>'
        '<ellipse cx="143" cy="110" rx="8" ry="16" transform="rotate(-5 143 110)"/></g></mask>'
        '<g mask="url(#olhos-gato)"><path d="M48 140 C48 116 47 98 50 82 C53 62 56 44 59 31 Q61 22 68 28 C79 39 90 51 100 60 '
        'C106 64 114 64 120 62 C123 61 125 60 127 58 C134 48 141 38 146 30 Q151 22 154 31 C157 46 161 64 164 80 C167 98 166 118 '
        '166 140 C166 160 156 170 138 170 L76 170 C58 170 48 160 48 140 Z" transform="translate(104 0) scale(1.1 1) translate(-107 0)" '
        'fill="currentColor"/></g></svg>')

TEXTOS = {
    "pt-BR": {"linha": "Product designer", "cidade": "São Paulo, Brasil"},
    "en": {"linha": "Product designer", "cidade": "São Paulo, Brazil"},
}

def fonte(arquivo):
    """Fonte embutida no cartão (a página do cartão não tem endereço, então não carrega arquivos)."""
    return "data:font/woff2;base64," + base64.b64encode((FONTES / arquivo).read_bytes()).decode()


def cartao_site(titulo, t):
    """Cartão 1200x630 no visual do site: gato, nome grande e Product designer à esquerda; à direita, uma tela do App Psiquê."""
    grande = "CARLOS<br>GOUVEIA" if titulo == "CARLOS GOUVEIA" else html.escape(titulo)
    trabalho = "data:image/webp;base64," + base64.b64encode((SITE / "projetos/psique-app/abertura-celular.webp").read_bytes()).decode()
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Satoshi;font-weight:900;src:url({fonte('satoshi-900.woff2')}) format("woff2")}}
@font-face{{font-family:Switzer;font-weight:500;src:url({fonte('switzer-500.woff2')}) format("woff2")}}
*{{box-sizing:border-box}}html,body{{margin:0}}
body{{width:1200px;height:630px;overflow:hidden;background:#e6e7e8;color:#000;display:grid;grid-template-columns:1fr 430px;font-family:Switzer}}
.texto{{padding:56px 56px 52px 64px;display:flex;flex-direction:column;justify-content:space-between}}
.trabalho{{background:url({trabalho}) center/cover}}
.gato{{width:84px;height:84px;background:#ffd60a;display:grid;place-items:center}}
.gato svg{{height:56px;width:auto;color:#000}}
h1{{margin:0;font-family:Satoshi;font-weight:900;font-size:118px;line-height:.9}}
.base{{display:flex;justify-content:space-between;align-items:baseline;font-size:28px;font-weight:500;border-top:2px solid #000;padding-top:20px}}
</style></head><body>
<div class="texto"><div class="gato">{GATO}</div>
<h1>{grande}</h1>
<div class="base"><span>{t['linha']}</span><span>{t['cidade']}</span></div></div>
<div class="trabalho"></div>
</body></html>"""


def titulo_da_pagina(doc):
    """'Carlos Gouveia | arcanospeedruns' -> 'CARLOS GOUVEIA'."""
    m = re.search(r'<meta property="og:title" content="([^"]*)"', doc)
    partes = [x.strip() for x in html.unescape(m.group(1) if m else "Carlos Gouveia").split("|")]
    t = next((x for x in partes if x.lower() != "arcanospeedruns"), "Carlos Gouveia")
    return t.upper()


def main():
    paginas = sorted(SITE.rglob("*.html"))
    cache = {}
    with sync_playwright() as p:
        nav = p.chromium.launch()
        aba = nav.new_page(viewport={"width": 1200, "height": 630})
        for arq in paginas:
            doc = arq.read_text(encoding="utf-8")
            m = re.search(r'(<meta property="og:image" content=")([^"]*)(")', doc)
            if not m or not m.group(2).split("?")[0].endswith("/og.png") or 'name="robots" content="noindex"' in doc:
                continue
            lang = "en" if 'lang="en"' in doc[:400] else "pt-BR"
            t = TEXTOS[lang]
            chave = ("site", lang, titulo_da_pagina(doc))
            if chave not in cache:
                sem_acento = lambda x: unicodedata.normalize("NFD", str(x)).encode("ascii", "ignore").decode()
                nome = "-".join(re.sub(r"[^a-z0-9]+", "-", sem_acento(x).lower()).strip("-") for x in chave)
                saida = SITE / "og" / f"{nome}.png"
                saida.parent.mkdir(exist_ok=True)
                aba.set_content(cartao_site(chave[2], t), wait_until="load")
                aba.evaluate("document.fonts.ready.then(() => true)")
                aba.wait_for_timeout(150)
                aba.screenshot(path=str(saida))
                v = hashlib.sha1(saida.read_bytes()).hexdigest()[:10]
                cache[chave] = m.group(2).rsplit("/og.png", 1)[0] + f"/og/{nome}.png?v={v}"
                print("cartão:", saida.relative_to(SITE))
            doc = doc[: m.start(2)] + cache[chave] + doc[m.end(2):]
            arq.write_text(doc, encoding="utf-8")
        nav.close()
    print(f"{len(cache)} cartões gerados.")


if __name__ == "__main__":
    main()
