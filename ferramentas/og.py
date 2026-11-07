"""Gera as imagens de compartilhamento (og:image) de cada página do site gerado.

Roda no GitHub Actions depois do Eleventy, a cada publicação:
    python3 ferramentas/og.py _site

Para cada página que usa a imagem padrão (/og.png), desenha um cartão 1200x630
no visual do site, com o título daquela página, salva em _site/og/<página>.png
e troca o og:image da página por esse arquivo com ?v=<hash>. Como o endereço
muda quando a imagem muda, Discord, WhatsApp e LinkedIn buscam a versão nova.
O hub ganha um cartão próprio, no prata do hub.
Páginas com imagem própria (projetos do portfólio) ficam como estão.

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
GATO = re.search(r'<svg class="marca-gato".*?</svg>', (RAIZ_REPO / "src/_includes/topo.njk").read_text(), re.S).group(0)

TEXTOS = {
    "pt-BR": {"vaga": "ABERTO A VAGAS DE PRODUTO", "areas": "PRODUTO · DADOS · DESIGN", "cidade": "SÃO PAULO, BRASIL",
              "hub": "TEXTOS E FOTOS · SÃO PAULO"},
    "en": {"vaga": "OPEN TO PRODUCT ROLES", "areas": "PRODUCT · DATA · DESIGN", "cidade": "SÃO PAULO, BRAZIL",
           "hub": "POSTS AND PHOTOS · SÃO PAULO"},
}

def fonte(arquivo):
    """Fonte embutida no cartão (a página do cartão não tem endereço, então não carrega arquivos)."""
    return "data:font/woff2;base64," + base64.b64encode((FONTES / arquivo).read_bytes()).decode()


BASE = f"""
@font-face{{font-family:Tanker;src:url({fonte('tanker.woff2')}) format("woff2")}}
@font-face{{font-family:Departure;src:url({fonte('departure-mono.woff2')}) format("woff2")}}
@font-face{{font-family:Michroma;src:url({fonte('michroma.woff2')}) format("woff2")}}
*{{box-sizing:border-box}}html,body{{margin:0}}
body{{width:1200px;height:630px;overflow:hidden;position:relative}}
.gato{{width:84px;height:84px;background:#ffd60a;border-radius:22%;display:grid;place-items:center;flex:none}}
.gato svg{{height:56px;width:auto;color:#000}}
.mono{{font-family:Departure;letter-spacing:.08em}}
"""


def cartao_site(titulo, t):
    """Cartão no alumínio do site. Na página principal o título é o nome; nas outras, o nome da página."""
    eh_nome = titulo == "CARLOS GOUVEIA"
    grande = "CARLOS<br>GOUVEIA" if eh_nome else html.escape(titulo)
    tamanho = 160 if eh_nome else (190 if len(titulo) <= 9 else 150)
    linha_nome = "" if eh_nome else '<div class="nome mono">CARLOS GOUVEIA</div>'
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE}
body{{background:#c4c7c9;color:#000;padding:56px 72px 48px;display:flex;flex-direction:column}}
.pontos{{position:absolute;inset:0;z-index:-1;background-image:radial-gradient(rgba(0,0,0,.22) 1.2px,transparent 1.4px);background-size:18px 18px;
  -webkit-mask-image:linear-gradient(180deg,transparent 50%,#000 100%);mask-image:linear-gradient(180deg,transparent 50%,#000 100%)}}
.topo{{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:24px}}
.vaga{{background:#ffd60a;padding:10px 16px 8px;font-size:22px}}
.meio{{flex:1;display:flex;flex-direction:column;justify-content:center;gap:22px}}
.nome{{font-size:26px;letter-spacing:.3em}}
h1{{margin:0;font-family:Tanker;font-weight:400;font-size:{tamanho}px;line-height:.86;margin-left:-6px}}
.base{{display:flex;justify-content:space-between;align-items:baseline;font-size:24px;letter-spacing:.14em}}
.cidade{{font-size:20px;color:#2b2f33}}
</style></head><body><div class="pontos"></div>
<div class="topo"><div class="gato">{GATO}</div><span class="mono vaga">{t['vaga']}</span></div>
<div class="meio">{linha_nome}<h1>{grande}</h1></div>
<div class="base mono"><span>{t['areas']}</span><span class="cidade">{t['cidade']}</span></div>
</body></html>"""


def cartao_hub(t):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE}
body{{background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,rgba(0,0,0,0) 1px 3px),radial-gradient(120% 80% at 50% 0%,#34393f 0%,#24282d 55%,#1b1e22 100%)}}
.chapa{{position:absolute;left:70px;right:70px;top:150px;bottom:110px;border:2px solid #0c0e11;border-radius:22px;
  background:radial-gradient(110% 70% at 88% 0%,rgba(255,255,255,.85),rgba(255,255,255,0) 55%),repeating-linear-gradient(90deg,rgba(255,255,255,.7) 0 1px,rgba(70,80,95,.13) 1px 2px,rgba(255,255,255,0) 2px 3px),linear-gradient(180deg,#f1f3f5 0%,#d4d9df 14%,#c1c7cf 44%,#b2b9c2 50%,#cbd1d8 56%,#e2e6ea 84%,#c2c8d0 100%);
  box-shadow:inset 0 2px 0 #fff,inset 0 -3px 0 rgba(0,0,0,.25),0 8px 0 rgba(0,0,0,.45);padding:56px 60px;display:flex;flex-direction:column;justify-content:center;gap:26px}}
h1{{margin:0;font-family:Michroma;font-weight:400;font-size:110px;letter-spacing:.32em;color:#0a1b33;line-height:1}}
.sub{{font-family:Departure;font-size:30px;letter-spacing:.3em;color:#17345c}}
.risco{{height:10px;background:repeating-linear-gradient(180deg,#3c4a5c 0 1px,transparent 1px 3px);opacity:.6}}
.gato{{position:absolute;left:70px;top:46px;width:76px;height:76px}} .gato svg{{height:50px}}
.nome{{position:absolute;right:72px;top:72px;font-family:Departure;font-size:22px;letter-spacing:.3em;color:#c9d2dc}}
</style></head><body>
<div class="gato">{GATO}</div><div class="nome">CARLOS GOUVEIA</div>
<div class="chapa"><h1>HUB</h1><div class="risco"></div><div class="sub">{t['hub']}</div></div>
</body></html>"""


def titulo_da_pagina(doc):
    """'Contato | Carlos Gouveia' -> 'CONTATO'; 'Carlos Gouveia | arcanospeedruns' -> 'CARLOS GOUVEIA'."""
    m = re.search(r'<meta property="og:title" content="([^"]*)"', doc)
    partes = [x.strip() for x in html.unescape(m.group(1) if m else "Carlos Gouveia").split("|")]
    t = next((x for x in partes if x.lower() != "arcanospeedruns"), "Carlos Gouveia")
    return "SOBRE MIM" if t.lower() in ("sobre", "sobre mim") else t.upper()


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
            eh_hub = arq.name == "hub.html"
            chave = ("hub", lang) if eh_hub else ("site", lang, titulo_da_pagina(doc))
            if chave not in cache:
                sem_acento = lambda x: unicodedata.normalize("NFD", str(x)).encode("ascii", "ignore").decode()
                nome = "-".join(re.sub(r"[^a-z0-9]+", "-", sem_acento(x).lower()).strip("-") for x in chave)
                saida = SITE / "og" / f"{nome}.png"
                saida.parent.mkdir(exist_ok=True)
                aba.set_content(cartao_hub(t) if eh_hub else cartao_site(chave[2], t), wait_until="load")
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
