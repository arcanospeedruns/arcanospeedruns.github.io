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
EMAIL = "carlosgouveia.g@gmail.com"

CV = {
    "pt": {
        "arquivo": "src/curriculo.pdf",
        "lang": "pt-BR",
        "titulo": "Gestão de Produto · KPIs e Métricas · Levantamento de Requisitos · Metodologias Ágeis · Análise de Dados",
        "contato": ["São Paulo, SP", EMAIL, "linkedin.com/in/carloslnly", "arcanospeedruns.github.io"],
        "secoes": {"resumo": "Resumo", "exp": "Experiência", "comp": "Competências", "form": "Formação", "vol": "Voluntariado"},
        "resumo": (
            "Profissional com foco em gestão de produto e base técnica em dados e desenvolvimento. Experiência na definição de "
            "KPIs e métricas de produto, levantamento de requisitos com stakeholders, documentação de regras de negócio e "
            "coordenação de equipes em metodologia ágil, atuando em inglês com times e clientes internacionais. Uso dados para "
            "embasar e validar decisões, com prática em Python, SQL e dashboards. Cursando Ciência da Computação na PUC-SP, "
            "graduado em Análise e Desenvolvimento de Sistemas e técnico em Design Gráfico."
        ),
        "exp": [
            ("Social Media Manager", "Freelance, nicho de educação", "out/2026 – atual", [
                "Planejamento editorial e produção de conteúdo para atrair novos alunos a um curso técnico, com acompanhamento do desempenho das publicações para ajustar a estratégia.",
            ]),
            ("Analista de Dados (Estágio)", "Cignamed", "mai/2026 – out/2026", [
                "Unificação de três bases com códigos e nomenclaturas distintos (cerca de 950 mil respostas) em uma base única, via correspondência automática de colunas: um processo de cerca de 2 meses passou a levar 2 minutos.",
                "Estruturação de instrumentos de coleta no REDCap, com formulários e regras de validação para evitar inconsistências na origem.",
                "Auditoria de qualidade de dados: mais de 200 duplicidades e centenas de inconsistências identificadas e tratadas, com correções documentadas em log rastreável.",
                "Desenvolvimento de dashboards e aplicações web para visualização de indicadores e suporte à decisão da equipe de pesquisa.",
                "Documentação de dicionários de variáveis e templates de coleta, garantindo consistência entre fontes distintas.",
            ]),
            ("Gerente de Projetos", "BlazingBoost (freelance)", "jan/2025 – dez/2025", [
                "Coordenação de 2 equipes de 6 pessoas atendendo 30 clientes simultâneos em operação internacional, com metodologia ágil.",
                "Levantamento de requisitos junto a stakeholders e tradução em especificações executáveis para as equipes.",
                "Mapeamento e documentação de fluxos operacionais, regras de negócio e dependências entre etapas do processo.",
                "Acompanhamento de prazos e entregas, com comunicação e alinhamento contínuos em inglês com equipes e clientes.",
            ]),
            ("Analista de Produto e Dados", "OrderHub (freelance)", "mar/2025 – jul/2025", [
                "Definição de KPIs e métricas de acompanhamento do produto e da operação, com construção dos relatórios gerenciais usados pela liderança.",
                "Definição de regras de negócio e documentação funcional dos fluxos e das dependências entre etapas.",
                "Mapeamento das fontes e dos fluxos de informação: origem dos dados, regras de transformação e consumidores de cada saída.",
                "Acompanhamento de entregas, testes e validações, garantindo aderência dos resultados às regras definidas.",
                "Participação em reuniões de planejamento e refinamento com time internacional, em inglês.",
            ]),
        ],
        "comp": [
            ("Produto", "Definição de KPIs e métricas · Levantamento de requisitos · Regras de negócio e documentação funcional · Mapeamento de processos · Alinhamento com stakeholders"),
            ("Metodologias", "Scrum e práticas ágeis (planejamento, refinamento e acompanhamento de entregas)"),
            ("Dados", "Python (pandas) · SQL (PostgreSQL) · BigQuery · Power BI · Excel avançado · Análise exploratória"),
            ("Ferramentas", "Notion · Figma · REDCap · Git · HTML/CSS · Illustrator · Photoshop"),
            ("Idiomas", "Português (nativo) · Inglês (fluente, com atuação profissional junto a times internacionais)"),
        ],
        "form": [
            ("Bacharelado em Ciência da Computação", "PUC-SP", "conclusão prevista em 2027"),
            ("Tecnólogo em Análise e Desenvolvimento de Sistemas", "Universidade Anhembi Morumbi", "concluído"),
            ("Técnico em Design Gráfico", "Etec Carlos de Campos", "concluído"),
        ],
        "vol": [
            ("Voluntário", "Confraria dos Miados e Latidos", "jun/2025 – ago/2025", "Apoio no transporte e no processo de adoção de animais."),
            ("Community Manager", "CAPE PUC-SP (centro acadêmico)", "jan/2024 – jun/2024", "Produção de material gráfico e apoio na gestão das redes sociais."),
        ],
    },
    "en": {
        "arquivo": "src/curriculo-en.pdf",
        "lang": "en",
        "titulo": "Product Management · KPIs and Metrics · Requirements Gathering · Agile · Data Analysis",
        "contato": ["São Paulo, Brazil", EMAIL, "linkedin.com/in/carloslnly", "arcanospeedruns.github.io"],
        "secoes": {"resumo": "Summary", "exp": "Experience", "comp": "Skills", "form": "Education", "vol": "Volunteering"},
        "resumo": (
            "Product-focused professional with a technical background in data and software development. Experience defining "
            "product KPIs and metrics, gathering requirements with stakeholders, documenting business rules and coordinating "
            "agile teams, working in English with international teams and clients. I use data to support and validate "
            "decisions, with hands-on Python, SQL and dashboards. Computer Science student at PUC-SP, graduate in Systems "
            "Analysis and Development and graphic design technician."
        ),
        "exp": [
            ("Social Media Manager", "Freelance, education niche", "Oct 2026 – present", [
                "Content planning and production to attract new students to a technical course, tracking post performance to adjust the strategy.",
            ]),
            ("Data Analyst (Intern)", "Cignamed", "May 2026 – Oct 2026", [
                "Merged three databases with different codes and naming (about 950K answers) into a single dataset through automatic column matching: a process that took about 2 months now takes 2 minutes.",
                "Structured data collection instruments in REDCap, with forms and validation rules to prevent inconsistencies at the source.",
                "Data quality audit: 200+ duplicates and hundreds of inconsistencies identified and fixed, with corrections documented in a traceable log.",
                "Developed dashboards and web applications to visualize indicators and support the research team's decisions.",
                "Documented variable dictionaries and data collection templates, ensuring consistency across different sources.",
            ]),
            ("Project Manager", "BlazingBoost (freelance)", "Jan 2025 – Dec 2025", [
                "Coordinated 2 teams of 6 people serving 30 concurrent clients in an international operation, using agile practices.",
                "Gathered requirements from stakeholders and translated them into actionable specifications for the teams.",
                "Mapped and documented operational workflows, business rules and dependencies between process stages.",
                "Tracked deadlines and deliveries, with ongoing communication and alignment in English with teams and clients.",
            ]),
            ("Product and Data Analyst", "OrderHub (freelance)", "Mar 2025 – Jul 2025", [
                "Defined KPIs and tracking metrics for the product and the operation, building the management reports used by leadership.",
                "Defined business rules and wrote functional documentation of workflows and dependencies between stages.",
                "Mapped data sources and information flows: data origins, transformation rules and consumers of each output.",
                "Monitored deliveries, tests and validations, ensuring results matched the defined rules.",
                "Took part in planning and refinement meetings with an international team, in English.",
            ]),
        ],
        "comp": [
            ("Product", "KPI and metrics definition · Requirements gathering · Business rules and functional documentation · Process mapping · Stakeholder alignment"),
            ("Methods", "Scrum and agile practices (planning, refinement and delivery tracking)"),
            ("Data", "Python (pandas) · SQL (PostgreSQL) · BigQuery · Power BI · Advanced Excel · Exploratory analysis"),
            ("Tools", "Notion · Figma · REDCap · Git · HTML/CSS · Illustrator · Photoshop"),
            ("Languages", "Portuguese (native) · English (fluent, professional work with international teams)"),
        ],
        "form": [
            ("B.Sc. in Computer Science", "PUC-SP", "expected 2027"),
            ("Technologist Degree in Systems Analysis and Development", "Anhembi Morumbi University", "completed"),
            ("Technical Diploma in Graphic Design", "Etec Carlos de Campos", "completed"),
        ],
        "vol": [
            ("Volunteer", "Confraria dos Miados e Latidos", "Jun 2025 – Aug 2025", "Helped with animal transport and the adoption process."),
            ("Community Manager", "CAPE PUC-SP (student association)", "Jan 2024 – Jun 2024", "Produced graphic materials and helped manage social media."),
        ],
    },
}

CSS = """
@font-face { font-family: C; src: url('file:///usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf'); }
@font-face { font-family: C; font-weight: 700; src: url('file:///usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf'); }
@font-face { font-family: C; font-style: italic; src: url('file:///usr/share/fonts/truetype/crosextra/Carlito-Italic.ttf'); }
@page { size: A4; margin: 13mm 15mm 11mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: C, Carlito, Calibri, sans-serif; font-size: 9.4pt; line-height: 1.26; color: #222; }
h1 { margin: 0; font-size: 21pt; color: #1f3864; line-height: 1.1; }
.titulo { margin: 2pt 0 0; font-size: 10.5pt; color: #2e5597; }
.contato { margin: 3pt 0 0; font-size: 9pt; color: #444; }
.contato a { color: inherit; text-decoration: none; }
h2 { margin: 10pt 0 4pt; padding-bottom: 2pt; border-bottom: 1.2pt solid #1f3864;
     font-size: 9.5pt; letter-spacing: 0.14em; text-transform: uppercase; color: #1f3864; }
p { margin: 0; }
.item { margin-top: 5pt; break-inside: avoid; }
.item:first-of-type { margin-top: 0; }
.cab b { color: #111; }
.sep { color: #888; padding: 0 3pt; }
.quando { font-style: italic; color: #666; padding-left: 5pt; }
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
    h = [f'<!doctype html><html lang="{c["lang"]}"><head><meta charset="utf-8"><title>Carlos Gouveia</title><style>{CSS}</style></head><body>']
    h.append('<h1>Carlos Gouveia</h1>')
    h.append(f'<p class="titulo">{e(c["titulo"])}</p>')
    h.append(f'<p class="contato">{"<span class=sep>·</span>".join(contato)}</p>')
    h.append(f'<h2>{s["resumo"]}</h2><p>{e(c["resumo"])}</p>')
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
        nav = p.chromium.launch()
        pg = nav.new_page()
        for c in CV.values():
            pg.set_content(montar(c), wait_until="load")
            pg.pdf(path=str(RAIZ / c["arquivo"]), format="A4", prefer_css_page_size=True)
            print("gerado:", c["arquivo"])
        nav.close()
