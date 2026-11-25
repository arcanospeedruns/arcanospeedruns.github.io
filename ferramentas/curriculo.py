"""Gera os currículos em PDF (src/curriculo.pdf e src/curriculo-en.pdf).

Uso:
    pip install playwright && python -m playwright install chromium
    python3 ferramentas/curriculo.py

Para mudar o texto, edite o dicionário CV abaixo e rode de novo.
"""
from pathlib import Path
from html import escape
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
def fonte(arq):
    """As mesmas fontes do site, embutidas (a página do currículo não tem endereço para buscar arquivos)."""
    return "data:font/woff2;base64," + __import__("base64").b64encode((RAIZ / "src" / "fonts" / arq).read_bytes()).decode()
EMAIL = "arcanospeedruns@gmail.com"
CHROME = __import__("os").environ.get("CHROME")  # opcional: caminho de um Chrome já instalado

CV = {
    "pt": {
        "arquivo": "src/curriculo.pdf",
        "lang": "pt-BR",
        "titulo": "Product Designer · UI/UX",
        "contato": ["São Paulo, SP", EMAIL, "linkedin.com/in/carloslnly", "carlosgouveia.is-a.dev"],
        "secoes": {"resumo": "Resumo", "proj": "Projetos", "exp": "Experiência", "comp": "Competências", "form": "Formação", "vol": "Voluntariado"},
        "resumo": (
            "Product designer com base em design gráfico, desenvolvimento e dados. Desenho fluxos e interfaces do problema à "
            "tela, com protótipos navegáveis. Experiência com levantamento de requisitos, "
            "documentação de produto e times internacionais em inglês. Cursando Ciência da Computação na PUC-SP, graduado em "
            "Análise e Desenvolvimento de Sistemas e técnico em Design Gráfico."
        ),
        "proj": [
            ("App Psiquê", "conceito de app de agendamento", "Fluxo de 5 passos para marcar a primeira sessão de terapia em menos de 1 minuto, 6 telas e protótipo navegável. Decisões: mostrar o próximo horário livre já na lista e pedir cadastro só na confirmação.", [("ver o caso", "https://carlosgouveia.is-a.dev/#psique-app"), ("protótipo", "https://carlosgouveia.is-a.dev/prototipo/")]),
            ("Psiquê", "identidade visual", "Marca, manual e aplicações para uma clínica de psicologia, releitura de um trabalho para cliente."),
            ("Ruela Discos", "identidade de selo musical fictício", "Marca, sistema de capas numeradas, cartaz e post de lançamento."),
            ("twenty one pilots", "redesign acadêmico, não oficial", "Sistema de marca para um disco fictício: manual, papelaria, marketing e brindes."),
        ],
        "exp": [
            ("Social Media Manager", "Freelance, nicho de educação", "out/2026 – atual", [
                "Planejo o calendário editorial e crio peças para atrair alunos a um curso técnico, ajustando a estratégia pelo desempenho das publicações.",
            ]),
            ("Analista de Dados (Estágio)", "Cignamed", "mai/2026 – out/2026", [
                "Desenhei e desenvolvi dashboards e aplicações web que a equipe de pesquisa usava para acompanhar indicadores e tomar decisões.",
                "Desenhei formulários de coleta no REDCap, com regras de validação para evitar erros na origem.",
                "Unifiquei três bases com nomenclaturas distintas (cerca de 950 mil respostas): um processo de cerca de 2 meses passou a levar 2 minutos.",
                "Fiz a auditoria de qualidade: tratei mais de 200 duplicidades e centenas de inconsistências, com correções documentadas.",
            ]),
            ("Gerente de Projetos", "BlazingBoost (freelance)", "jan/2025 – dez/2025", [
                "Coordenei 2 equipes de 6 pessoas atendendo 30 clientes simultâneos, com práticas ágeis e comunicação em inglês.",
                "Levantei requisitos com stakeholders e transformei fluxos operacionais em especificações para as equipes.",
            ]),
            ("Analista de Produto e Dados", "OrderHub (freelance)", "mar/2025 – jul/2025", [
                "Defini KPIs do produto e da operação e construí os relatórios usados pela liderança.",
                "Escrevi a documentação funcional de fluxos, regras de negócio e dependências, e acompanhei testes e validações.",
                "Participei do planejamento e do refinamento com time internacional, em inglês.",
            ]),
            ("Designer Gráfico", "Freelance", "projetos pontuais", [
                "Criei identidades visuais e peças gráficas para clientes, entre elas a identidade de uma clínica de psicologia.",
            ]),
        ],
        "comp": [
            ("Design", "Fluxos e jornadas · Wireframes e protótipos · Interfaces mobile e web · Identidade visual · Tipografia e layout · Acessibilidade"),
            ("Ferramentas", "Figma · Illustrator · Photoshop · HTML/CSS · Git · Notion"),
            ("Produto e dados", "Requisitos e regras de negócio · KPIs e métricas · Python (pandas) · SQL · Power BI · Scrum"),
            ("Idiomas", "Português (nativo) · Inglês (fluente, com atuação profissional junto a times internacionais)"),
        ],
        "form": [
            ("Bacharelado em Ciência da Computação", "PUC-SP", "conclusão prevista em 2027"),
            ("Tecnólogo em Análise e Desenvolvimento de Sistemas", "Universidade Anhembi Morumbi", "concluído"),
            ("Técnico em Design Gráfico", "Etec Carlos de Campos", "concluído"),
        ],
        "vol": [
            ("Community Manager", "CAPE PUC-SP (centro acadêmico)", "jan/2024 – jun/2024", "Produção de material gráfico e apoio na gestão das redes sociais."),
            ("Voluntário", "Confraria dos Miados e Latidos", "jun/2025 – ago/2025", "Apoio no transporte e no processo de adoção de animais."),
        ],
    },
    "en": {
        "arquivo": "src/curriculo-en.pdf",
        "lang": "en",
        "titulo": "Product Designer · UI/UX",
        "contato": ["São Paulo, Brazil", EMAIL, "linkedin.com/in/carloslnly", "carlosgouveia.is-a.dev"],
        "secoes": {"resumo": "Summary", "proj": "Projects", "exp": "Experience", "comp": "Skills", "form": "Education", "vol": "Volunteering"},
        "resumo": (
            "Product designer with a background in graphic design, software development and data. I design flows and "
            "interfaces from problem to screen, with clickable prototypes. Experience with "
            "requirements gathering, product documentation and international teams in English. Computer Science student at "
            "PUC-SP; holds a technologist degree in Systems Analysis and Development and a technical diploma in graphic design."
        ),
        "proj": [
            ("Psiquê app", "booking app concept", "A 5-step flow to book a first therapy session in under a minute, 6 screens and a clickable prototype. Decisions: show the next free slot right in the list and ask for sign-up only at confirmation.", [("case study", "https://carlosgouveia.is-a.dev/en/#psique-app"), ("prototype", "https://carlosgouveia.is-a.dev/prototipo/")]),
            ("Psiquê", "visual identity", "Logo, guidelines and collateral for a psychology clinic, reworking a project made for a client."),
            ("Ruela Discos", "identity for a fictional record label", "Logo, a numbered cover system, party poster and release post."),
            ("twenty one pilots", "academic, unofficial redesign", "Brand system for a fictional album: guidelines, stationery, marketing and merch."),
        ],
        "exp": [
            ("Social Media Manager", "Freelance, education niche", "Oct 2026 – present", [
                "Plan content and design posts to attract students to a technical course, adjusting the strategy based on post performance.",
            ]),
            ("Data Analyst (Intern)", "Cignamed", "May 2026 – Oct 2026", [
                "Designed and built dashboards and web apps the research team used to track indicators and make decisions.",
                "Designed data collection forms in REDCap, with validation rules to prevent errors at the source.",
                "Merged three databases with different naming (about 950K answers): a process that took about 2 months now takes 2 minutes.",
                "Data quality audit: 200+ duplicates and hundreds of inconsistencies fixed, with documented corrections.",
            ]),
            ("Project Manager", "BlazingBoost (freelance)", "Jan 2025 – Dec 2025", [
                "Coordinated 2 teams of 6 people serving 30 concurrent clients, with agile practices and communication in English.",
                "Gathered requirements from stakeholders and mapped operational flows into specifications for the teams.",
            ]),
            ("Product and Data Analyst", "OrderHub (freelance)", "Mar 2025 – Jul 2025", [
                "Defined product and operations KPIs and built the reports used by leadership.",
                "Wrote functional documentation of flows, business rules and dependencies, and followed up on testing and validation.",
                "Took part in planning and refinement with an international team, in English.",
            ]),
            ("Graphic Designer", "Freelance", "occasional projects", [
                "Created visual identities and graphic pieces for clients, including the identity for a psychology clinic.",
            ]),
        ],
        "comp": [
            ("Design", "Flows and journeys · Wireframes and prototypes · Mobile and web interfaces · Visual identity · Typography and layout · Accessibility"),
            ("Tools", "Figma · Illustrator · Photoshop · HTML/CSS · Git · Notion"),
            ("Product and data", "Requirements and business rules · KPIs and metrics · Python (pandas) · SQL · Power BI · Scrum"),
            ("Languages", "Portuguese (native) · English (fluent, professional work with international teams)"),
        ],
        "form": [
            ("B.Sc. in Computer Science", "PUC-SP", "expected 2027"),
            ("Technologist Degree in Systems Analysis and Development", "Anhembi Morumbi University", "completed"),
            ("Technical Diploma in Graphic Design", "Etec Carlos de Campos", "completed"),
        ],
        "vol": [
            ("Community Manager", "CAPE PUC-SP (student association)", "Jan 2024 – Jun 2024", "Produced graphic materials and helped manage social media."),
            ("Volunteer", "Confraria dos Miados e Latidos", "Jun 2025 – Aug 2025", "Helped with animal transport and the adoption process."),
        ],
    },
}

CSS = """
@font-face { font-family: C; src: url('F400') format('woff2'); }
@font-face { font-family: C; font-weight: 700; src: url('F500') format('woff2'); }
@page { size: A4; margin: 13mm 15mm 11mm; }
* { box-sizing: border-box; }
/* sem ligaduras: "fl" e "fi" viram um caractere só e o leitor automático de currículos não acha a palavra */
body { margin: 0; font-family: C, sans-serif; font-size: 9pt; line-height: 1.28; color: #222; font-variant-ligatures: none; font-feature-settings: "liga" 0, "clig" 0; }
h1 { margin: 0; font-size: 21pt; color: #1f3864; line-height: 1.1; }
.titulo { margin: 2pt 0 0; font-size: 10.5pt; color: #2e5597; }
.contato { margin: 3pt 0 0; font-size: 9pt; color: #444; }
.contato a { color: inherit; text-decoration: none; }
h2 { margin: 10pt 0 4pt; padding-bottom: 2pt; border-bottom: 1.2pt solid #1f3864;
     font-size: 9.5pt; text-transform: uppercase; color: #1f3864; }
p { margin: 0; }
.item { margin-top: 5pt; break-inside: avoid; }
.item:first-of-type { margin-top: 0; }
.cab b { color: #111; }
.sep { color: #888; padding: 0 3pt; }
.quando { color: #666; padding-left: 5pt; }
.links a { color: #2e5597; }
ul { margin: 2pt 0 0; padding-left: 13pt; }
li { margin: 1pt 0; }
.comp p { margin: 1.5pt 0; }
.form p { margin: 2.5pt 0; }
"""


def e(s):
    return escape(s)


def montar(c):
    contato = []
    for x in c["contato"]:
        if "@" in x:
            contato.append(f'<a href="mailto:{e(x)}">{e(x)}</a>')
        elif "." in x and " " not in x:
            contato.append(f'<a href="https://{e(x)}">{e(x)}</a>')
        else:
            contato.append(e(x))
    s = c["secoes"]
    h = [f'<!doctype html><html lang="{c["lang"]}"><head><meta charset="utf-8"><title>Carlos Gouveia</title><style>{CSS.replace("F400", fonte("switzer-400.woff2")).replace("F500", fonte("switzer-500.woff2"))}</style></head><body>']
    h.append('<h1>Carlos Gouveia</h1>')
    h.append(f'<p class="titulo">{e(c["titulo"])}</p>')
    h.append(f'<p class="contato">{"<span class=sep>·</span>".join(contato)}</p>')
    h.append(f'<h2>{s["resumo"]}</h2><p>{e(c["resumo"])}</p>')
    h.append(f'<h2>{s["proj"]}</h2><div class="form">')
    for proj in c["proj"]:
        a, b, d = proj[:3]
        links = proj[3] if len(proj) > 3 else []
        extra = "".join(f'<span class="sep">·</span><a href="{e(u)}">{e(t)}</a>' for t, u in links)
        nome = f'<a href="{e(links[0][1])}" style="color:inherit;text-decoration:none">{e(a)}</a>' if links else e(a)
        h.append(f'<p class="links"><b>{nome}</b><span class="sep">|</span>{e(b)}. {e(d)}{extra}</p>')
    h.append('</div>')
    h.append(f'<h2>{s["exp"]}</h2>')
    for cargo, onde, quando, itens in c["exp"]:
        h.append(f'<div class="item"><p class="cab"><b>{e(cargo)}</b><span class="sep">|</span>{e(onde)}<span class="quando">{e(quando)}</span></p><ul>')
        h += [f'<li>{e(i)}</li>' for i in itens]
        h.append('</ul></div>')
    h.append(f'<h2>{s["comp"]}</h2><div class="comp">')
    h += [f'<p><b>{e(k)}:</b> {e(v)}</p>' for k, v in c["comp"]]
    h.append(f'</div><h2>{s["form"]}</h2><div class="form">')
    h += [f'<p class="cab"><b>{e(a)}</b><span class="sep">|</span>{e(b)}<span class="quando">{e(q)}</span></p>' for a, b, q in c["form"]]
    h.append(f'</div><h2>{s["vol"]}</h2><div class="form">')
    h += [f'<p class="cab"><b>{e(a)}</b><span class="sep">|</span>{e(b)}<span class="quando">{e(q)}</span><br>{e(d)}</p>' for a, b, q, d in c["vol"]]
    h.append('</div></body></html>')
    return "".join(h)


if __name__ == "__main__":
    with sync_playwright() as p:
        nav = p.chromium.launch(**({"executable_path": CHROME} if CHROME else {}))
        pg = nav.new_page()
        for c in CV.values():
            pg.set_content(montar(c), wait_until="load")
            pg.evaluate("document.fonts.ready.then(() => true)")
            pg.pdf(path=str(RAIZ / c["arquivo"]), format="A4", prefer_css_page_size=True)
            print("gerado:", c["arquivo"])
        nav.close()
