"""Gera as imagens de compartilhamento de cada projeto e do protótipo (1200x630).

LinkedIn e WhatsApp ignoram o #, então um link /#ruela mostraria o cartão da página inicial.
Por isso cada projeto tem um endereço curto (/p/ruela/) com imagem própria, gerada aqui:
    python3 ferramentas/og_projetos.py
Saída em src/compartilhar/<projeto>-<idioma>.jpg e src/og-prototipo.jpg (vão para o repositório).
"""
import base64
import os
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
SRC = RAIZ / "src"

def dados(arq, tipo):
    return f"data:{tipo};base64," + base64.b64encode((SRC / arq).read_bytes()).decode()

PROJETOS = [
    # (slug, nome pt, nome en, linha pt, linha en, imagem, fundo da imagem, ajuste)
    ("psique-app", "App Psiquê", "Psiquê app", "Conceito de app de agendamento", "Booking app concept", "projetos/psique-app/abertura-1200.webp", "#3b2c6b", "cover"),
    ("psique", "Psiquê", "Psiquê", "Identidade visual", "Visual identity", "projetos/psique/mockup-placa-1200.webp", "#000", "cover"),
    ("ruela", "Ruela Discos", "Ruela Discos", "Identidade de selo musical", "Record label identity", "projetos/ruela/capa-ultimo-onibus-800.webp", "#0d0d0d", "capa"),
    ("twenty-one-pilots", "twenty one pilots", "twenty one pilots", "Redesign acadêmico de marca", "Academic brand redesign", "projetos/twenty-one-pilots/capa-800.webp", "#2e0f45", "capa"),
]

def cartao(nome, linha, img, fundo, ajuste, assinatura):
    estilo_img = "width:100%;height:100%;object-fit:cover" if ajuste == "cover" else "height:76%;width:auto"
    # a palavra mais longa precisa caber nos 416px da coluna
    tam = min(104, int(416 / (max(len(w) for w in nome.split()) * 0.74)))
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Satoshi;font-weight:900;src:url({dados('fonts/satoshi-900.woff2','font/woff2')})}}
@font-face{{font-family:Switzer;font-weight:500;src:url({dados('fonts/switzer-500.woff2','font/woff2')})}}
*{{box-sizing:border-box}}html,body{{margin:0}}
body{{width:1200px;height:630px;overflow:hidden;display:grid;grid-template-columns:520px 1fr;background:#e6e7e8;color:#000;font-family:Switzer}}
.texto{{padding:56px 48px 52px 56px;display:flex;flex-direction:column;justify-content:space-between}}
h1{{margin:0;font-family:Satoshi;font-weight:900;font-size:{tam}px;line-height:.92;text-transform:uppercase}}
p{{margin:16px 0 0;font-size:30px;font-weight:500;line-height:1.2}}
.base{{border-top:2px solid #000;padding-top:18px;font-size:24px;font-weight:500}}
.img{{background:{fundo};display:flex;align-items:center;justify-content:center;overflow:hidden}}
img{{display:block;{estilo_img}}}
</style></head><body>
<div class="texto"><div><h1>{nome}</h1><p>{linha}</p></div><div class="base">{assinatura}</div></div>
<div class="img"><img src="{dados(img,'image/webp')}"></div>
</body></html>"""

def main():
    exe = os.environ.get("CHROME")
    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
        aba = nav.new_page(viewport={"width": 1200, "height": 630})
        def foto(html, saida):
            aba.set_content(html, wait_until="load")
            aba.evaluate("document.fonts.ready.then(() => true)")
            aba.wait_for_timeout(150)
            aba.screenshot(path=str(saida), type="jpeg", quality=86)
            print(saida.relative_to(RAIZ))
        for slug, npt, nen, lpt, len_, img, fundo, ajuste in PROJETOS:
            foto(cartao(npt, lpt, img, fundo, ajuste, "Carlos Gouveia, product designer"), SRC / "compartilhar" / f"{slug}-pt.jpg")
            foto(cartao(nen, len_, img, fundo, ajuste, "Carlos Gouveia, product designer"), SRC / "compartilhar" / f"{slug}-en.jpg")
        foto(cartao("Protótipo", "App Psiquê: marcar a primeira sessão de terapia", "projetos/psique-app/tela-1-inicio.webp", "#e8e2f4", "capa", "Carlos Gouveia, product designer"), SRC / "og-prototipo.jpg")
        nav.close()

if __name__ == "__main__":
    main()
