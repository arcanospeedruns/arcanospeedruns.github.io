"""Gera a versão em inglês do site (pasta en/) a partir das páginas em português.

Uso: python3 build_en.py /caminho/do/site
- Coloca o seletor PT-BR | EN no topo de cada página PT (se ainda não tiver).
- Cria en/<página> com os textos traduzidos e os caminhos de arquivos corrigidos.
Rode de novo sempre que mudar um texto em PT e atualize a tradução aqui.
"""
import os, re, sys, posixpath

SITE = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://arcanospeedruns.github.io/"

COMUM = [
    ('<html lang="pt-BR">', '<html lang="en">'),
    ('<nav aria-label="Páginas">', '<nav aria-label="Pages">'),
    ('>SOBRE</a>', '>ABOUT</a>'),
    ('>PORTFÓLIO</a>', '>PORTFOLIO</a>'),
    ('>CONTATO</a>', '>CONTACT</a>'),
    ('<meta property="og:locale" content="pt_BR">', '<meta property="og:locale" content="en_US">'),
]

PAGINAS = {
"index.html": [
    ('content="Portfólio de Carlos Gouveia: dados, front-end e design."', 'content="Portfolio of Carlos Gouveia: data, front-end and design."'),
    ('content="Analista de dados e designer. Python, SQL e dashboards, com experiência em pesquisa clínica, e identidade visual para marcas."',
     'content="Data analyst and designer. Python, SQL and dashboards, with experience in clinical research, and visual identity for brands."'),
    ('Analista de dados com experiência em pesquisa clínica e formação em design gráfico. Faço análise exploratória, tratamento e qualidade de dados com Python e entrego indicadores em dashboards. No design, crio identidades visuais e conteúdo para redes sociais. Estudo Ciência da Computação na PUC-SP.',
     'Data analyst with experience in clinical research and a background in graphic design. I do exploratory analysis, data cleaning and data quality in Python and deliver indicators in dashboards. In design, I create visual identities and social media content. Computer Science student at PUC-SP.'),
    ('<dt>Localização</dt><dd>São Paulo, SP</dd>', '<dt>Location</dt><dd>São Paulo, Brazil</dd>'),
    ('<dt>Área</dt><dd>Dados e design</dd>', '<dt>Field</dt><dd>Data and design</dd>'),
    ('<dt>Idiomas</dt><dd>Inglês fluente</dd>', '<dt>Languages</dt><dd>Fluent English</dd>'),
    ('<dt>Disponibilidade</dt><dd class="vivo">Vagas júnior, remoto ou híbrido</dd>', '<dt>Availability</dt><dd class="vivo">Junior roles, remote or hybrid</dd>'),
    ('>EXPERIÊNCIA EM DADOS E PRODUTO<', '>DATA AND PRODUCT EXPERIENCE<'),
    ('<strong>ANALISTA DE DADOS</strong>', '<strong>DATA ANALYST</strong>'),
    ('Cignamed, estágio em pesquisa clínica. Automatizei em Python a unificação de 3 bases com códigos diferentes (1.900 respondentes × 500 perguntas, cerca de 950 mil respostas): o que levou cerca de 2 meses agora leva uns 2 minutos. Na auditoria, corrigi mais de 200 duplicidades e centenas de inconsistências.',
     'Cignamed, clinical research internship. I automated in Python the merging of 3 databases with different codes (1,900 respondents × 500 questions, about 950K answers): what took about 2 months now takes around 2 minutes. In the audit, I fixed 200+ duplicates and hundreds of inconsistencies.'),
    ('>MAI – OUT 2026<', '>MAY – OCT 2026<'),
    ('<strong>ANALISTA DE PRODUTO E DADOS</strong>', '<strong>PRODUCT AND DATA ANALYST</strong>'),
    ('OrderHub, freelance. KPIs e relatórios usados pela liderança na fase alfa do produto, em metodologia ágil e com time internacional em inglês.',
     "OrderHub, freelance. KPIs and reports used by leadership in the product's alpha phase, under Agile practices and with an international team in English."),
    ('<strong>GERENTE DE PROJETOS</strong>', '<strong>PROJECT MANAGER</strong>'),
    ('BlazingBoost, freelance. Coordenei 2 equipes de 6 pessoas atendendo 30 clientes ao mesmo tempo, em operação internacional e com metodologia ágil.',
     'BlazingBoost, freelance. I coordinated 2 teams of 6 people serving 30 clients at the same time, in an international operation using Agile practices.'),
    ('>JAN – DEZ 2025<', '>JAN – DEC 2025<'),
    ('>EXPERIÊNCIA EM DESIGN E CONTEÚDO<', '>DESIGN AND CONTENT EXPERIENCE<'),
    ('Freelance, nicho de educação. Perfil de 500 para 1.000 seguidores até agora e alcance de cerca de 100 mil contas, com conteúdo e peças próprias.',
     'Freelance, education niche. Grew the profile from 500 to 1,000 followers so far, reaching about 100K accounts, with my own content and visuals.'),
    ('>OUT 2026 – HOJE<', '>OCT 2026 – PRESENT<'),
    ('<strong>DESIGNER GRÁFICO</strong>', '<strong>GRAPHIC DESIGNER</strong>'),
    ('Freelance. Identidade visual completa (logo, paleta e tipografia) para uma clínica de psicologia.',
     'Freelance. Complete visual identity (logo, palette and typography) for a psychology clinic.'),
    ('>DEZ 2024 – JAN 2025<', '>DEC 2024 – JAN 2025<'),
    ('Freelance. Gestão de uma conta no Twitter, do planejamento à publicação, com peças próprias.',
     'Freelance. Managed a Twitter account, from planning to publishing, with my own visuals.'),
    ('>VOLUNTARIADO<', '>VOLUNTEERING<'),
    ('<strong>ASSOCIADO</strong>', '<strong>MEMBER</strong>'),
    ('Confraria dos Miados e Latidos. Apoio no transporte e na adoção de cerca de 50 animais.',
     'Confraria dos Miados e Latidos, an animal welfare group. Helped with transport and adoption of about 50 animals.'),
    ('>JUN – AGO 2025<', '>JUN – AUG 2025<'),
    ('Centro Acadêmico Popular de Exatas – PUC-SP. Participei da produção do material gráfico distribuído na PUC e ajudei nas redes sociais, com divulgação de eventos.',
     'Centro Acadêmico Popular de Exatas, the sciences student union at PUC-SP. Helped produce the printed materials distributed at PUC and with social media, promoting events.'),
    ('>FORMAÇÃO<', '>EDUCATION<'),
    ('<strong>CIÊNCIA DA COMPUTAÇÃO</strong>', '<strong>COMPUTER SCIENCE</strong>'),
    ('PUC-SP. Bacharelado, conclusão prevista para dezembro de 2027.', "PUC-SP. Bachelor's degree, expected December 2027."),
    ('<strong>ANÁLISE E DESENVOLVIMENTO DE SISTEMAS</strong>', '<strong>SYSTEMS ANALYSIS AND DEVELOPMENT</strong>'),
    ('Universidade Anhembi Morumbi. Tecnólogo, concluído.', 'Anhembi Morumbi University. Technologist degree, completed.'),
    ('<strong>DESIGN GRÁFICO</strong>', '<strong>GRAPHIC DESIGN</strong>'),
    ('Etec Carlos de Campos. Técnico, concluído.', 'Etec Carlos de Campos. Technical diploma, completed.'),
    ('<strong>INGLÊS</strong>', '<strong>ENGLISH</strong>'),
    ('>COMPETÊNCIAS<', '>SKILLS<'),
    ('<strong>LINGUAGENS</strong>', '<strong>PROGRAMMING</strong>'),
    ('Python (pandas, openpyxl), SQL (PostgreSQL), JavaScript e C/C++.', 'Python (pandas, openpyxl), SQL (PostgreSQL), JavaScript and C/C++.'),
    ('<strong>ANÁLISE DE DADOS</strong>', '<strong>DATA ANALYSIS</strong>'),
    ('Análise exploratória, estatística descritiva, cruzamento de bases, qualidade e padronização de dados.',
     'Exploratory analysis, descriptive statistics, dataset cross-referencing, data quality and standardization.'),
    ('<strong>MODELAGEM</strong>', '<strong>DATA MODELING</strong>'),
    ('Chaves e granularidade, dicionários de dados e estrutura em camadas (bruto, tratado, analítico).',
     'Keys and granularity, data dictionaries and layered structure (raw, clean, analytical).'),
    ('<strong>FERRAMENTAS</strong>', '<strong>TOOLS</strong>'),
    ('Power BI, REDCap, Excel avançado, Git, Notion, HTML e CSS.', 'Power BI, REDCap, Advanced Excel, Git, Notion, HTML and CSS.'),
    ('<strong>DESIGN E CONTEÚDO</strong>', '<strong>DESIGN AND CONTENT</strong>'),
    ('Illustrator, InDesign, Photoshop, Figma, Canva e Meta Business Suite.', 'Illustrator, InDesign, Photoshop, Figma, Canva and Meta Business Suite.'),
    ('<h2 id="s-dados">PORTFÓLIO</h2>', '<h2 id="s-dados">PORTFOLIO</h2>'),
    ('<strong>PROJETOS</strong>', '<strong>PROJECTS</strong>'),
    ('Projetos de dados, produto e design, com o que foi feito, as ferramentas e o código de cada um.',
     'Data, product and design projects, with what was done, the tools and the code for each one.'),
    ('>VER PROJETOS<', '>SEE PROJECTS<'),
],
"portfolio.html": [
    ('<title>Portfólio | arcanospeedruns</title>', '<title>Portfolio | arcanospeedruns</title>'),
    ('content="Projetos de Carlos Gouveia."', 'content="Projects by Carlos Gouveia."'),
    ('content="Portfólio | Carlos Gouveia"', 'content="Portfolio | Carlos Gouveia"'),
    ('content="Projetos de dados, produto e design de Carlos Gouveia."', 'content="Data, product and design projects by Carlos Gouveia."'),
    ('<h1>PORTFÓLIO</h1>', '<h1>PORTFOLIO</h1>'),
    ('Projetos de dados, produto e design. Abra um cartão para ver o que foi feito, com quais ferramentas e onde ver mais.',
     'Data, product and design projects. Open a card to see what was done, with which tools and where to see more.'),
    ('aria-label="Projetos"', 'aria-label="Projects"'),
],
"contato.html": [
    ('<title>Contato | arcanospeedruns</title>', '<title>Contact me | arcanospeedruns</title>'),
    ('content="Contato de Carlos Gouveia."', 'content="Contact Carlos Gouveia."'),
    ('content="Contato | Carlos Gouveia"', 'content="Contact me | Carlos Gouveia"'),
    ('content="Aberto a vagas júnior em dados e design, remoto ou híbrido."', 'content="Open to junior roles in data and design, remote or hybrid."'),
    ('alt="Foto de Carlos Gouveia"', 'alt="Photo of Carlos Gouveia"'),
    ('<h1>CONTATO</h1>', '<h1>CONTACT ME</h1>'),
    ('Aberto a vagas júnior em dados e design, remoto ou híbrido. O jeito mais rápido de falar comigo é por e-mail.',
     'Open to junior roles in data and design, remote or hybrid. The fastest way to reach me is by e-mail.'),
    ('<span class="mono">Currículo</span><a href="curriculo.pdf">Baixar em PDF</a>', '<span class="mono">Résumé</span><a href="curriculo-en.pdf">Download PDF</a>'),
    ('<span class="mono">Cidade</span><span>São Paulo, SP</span>', '<span class="mono">City</span><span>São Paulo, Brazil</span>'),
],
"projetos/psique.html": [
    ('<title>Psiquê, identidade visual | arcanospeedruns</title>', '<title>Psiquê, visual identity | arcanospeedruns</title>'),
    ('content="Identidade visual para uma clínica de psicologia, por Carlos Gouveia. Logo, aplicações e manual de identidade."',
     'content="Visual identity for a psychology clinic, by Carlos Gouveia. Logo, applications and brand guidelines."'),
    ('content="Psiquê, identidade visual | Carlos Gouveia"', 'content="Psiquê, visual identity | Carlos Gouveia"'),
    ('content="Identidade visual para uma clínica de psicologia: logo, aplicações e manual de identidade."',
     'content="Visual identity for a psychology clinic: logo, applications and brand guidelines."'),
    ('>← VOLTAR AO PORTFÓLIO<', '>← BACK TO PORTFOLIO<'),
    ('<p class="papel">Identidade visual para uma clínica de psicologia: logo, aplicações e manual de identidade.</p>',
     '<p class="papel">Visual identity for a psychology clinic: logo, applications and brand guidelines.</p>'),
    ('<dt>Tipo</dt><dd>Identidade visual</dd>', '<dt>Type</dt><dd>Visual identity</dd>'),
    ('<dt>Papel</dt><dd>Designer gráfico</dd>', '<dt>Role</dt><dd>Graphic designer</dd>'),
    ('<dt>Entregas</dt><dd>Logo, aplicações e manual</dd>', '<dt>Deliverables</dt><dd>Logo, applications and guidelines</dd>'),
    ('<dt>Imagens</dt><dd>7</dd>', '<dt>Images</dt><dd>7</dd>'),
    ('Releitura conceitual de um trabalho de identidade visual que fiz para uma cliente, uma clínica de psicologia. Nome, logo e peças foram recriados para o portfólio e não são o material entregue à cliente.',
     'Conceptual reinterpretation of a visual identity project I did for a client, a psychology clinic. Name, logo and pieces were recreated for the portfolio and are not the material delivered to the client. The texts in the images are in Portuguese.'),
    ('<h2>MARCA</h2>', '<h2>BRAND</h2>'),
    ('alt="Prancha da marca Psiquê: símbolo de borboleta amarelo e nome em letras minúsculas sobre roxo, com a paleta de seis cores e as fontes Unbounded e Instrument Sans."',
     'alt="Psiquê brand board: yellow butterfly symbol and lowercase name on purple, with the six-color palette and the Unbounded and Instrument Sans typefaces."'),
    ('<strong>Conceito, cores e tipografia.</strong> Em grego, psyché quer dizer alma e também borboleta. Roxo e amarelo foram pedido da cliente.',
     '<strong>Concept, colors and typography.</strong> In Greek, psyché means both soul and butterfly. Purple and yellow were the client\'s request.'),
    ('alt="Prancha do logo: construção com quatro elipses e traços retos, ícone de app em vários tamanhos, versões sobre roxo, amarelo e branco e a assinatura horizontal."',
     'alt="Logo board: construction with four ellipses and straight strokes, app icon in several sizes, versions on purple, yellow and white, and the horizontal lockup."'),
    ('<strong>Logo e variações.</strong> Quatro elipses espelhadas e traço fino, pensado para funcionar como ícone de app.',
     '<strong>Logo and variations.</strong> Four mirrored ellipses and a thin stroke, designed to work as an app icon.'),
    ('<h2>APLICAÇÕES</h2>', '<h2>APPLICATIONS</h2>'),
    ('alt="Placa bandeira roxa da Psiquê presa na fachada, com a borboleta amarela, o nome e “clínica de psicologia”."',
     'alt="Purple Psiquê projecting sign on the storefront, with the yellow butterfly, the name and “clínica de psicologia” (psychology clinic)."'),
    ('<strong>Placa bandeira.</strong> Símbolo grande, nome e “clínica de psicologia”, para ser vista de quem vem pela calçada.',
     '<strong>Projecting sign.</strong> Large symbol, name and “clínica de psicologia”, visible to people walking down the sidewalk.'),
    ('alt="Folder da Psiquê em quatro posições: fechado, aberto por fora, meio aberto e aberto por dentro, com capa, público, explicação da terapia, como funciona, atendimento e contato."',
     'alt="Psiquê folder in four positions: closed, open on the outside, half open and open on the inside, with the cover, audience, what therapy is, how it works, schedule and contact."'),
    ('<strong>Folder.</strong> Formato DL com seis faces: capa, o que é a terapia, para quem é, como funciona, atendimento e contato.',
     '<strong>Folder.</strong> DL format with six panels: cover, what therapy is, who it is for, how it works, schedule and contact.'),
    ('alt="Celular mostrando o perfil da Psiquê no Instagram, com destaques nas cores da marca e a grade de posts."',
     'alt="Phone showing the Psiquê Instagram profile, with highlights in the brand colors and the post grid."'),
    ('<strong>Instagram.</strong> Perfil, destaques e grade alternando roxo, amarelo e lavanda.',
     '<strong>Instagram.</strong> Profile, highlights and a grid alternating purple, yellow and lavender.'),
    ('<h2>MANUAL DE IDENTIDADE</h2>', '<h2>BRAND GUIDELINES</h2>'),
    ('alt="Especificações: tabela de cores em HEX, RGB e CMYK, hierarquia tipográfica, redução mínima e versões em uma cor."',
     'alt="Specifications: color table in HEX, RGB and CMYK, type hierarchy, minimum size and one-color versions."'),
    ('<strong>Especificações.</strong> Cores para tela e impressão, hierarquia tipográfica, redução mínima e versões em uma cor.',
     '<strong>Specifications.</strong> Colors for screen and print, type hierarchy, minimum size and one-color versions.'),
    ('alt="Seis usos incorretos do logo: distorcido, girado, em cor fora da paleta, sem contraste, com sombra e com outra fonte."',
     'alt="Six incorrect uses of the logo: stretched, rotated, off-palette color, low contrast, with a shadow and with another typeface."'),
    ('<strong>Usos incorretos.</strong> O que não fazer com o símbolo e o nome.',
     '<strong>Incorrect uses.</strong> What not to do with the symbol and the name.'),
    ('>VER OUTROS PROJETOS<', '>SEE OTHER PROJECTS<'),
],
}

MARCA = re.compile(r'(<a class="marca" href="([^"]+)">ARCANOSPEEDRUNS</a>)')
CAMINHO = re.compile(r'\b(href|src)="([^"#][^"]*)"')
SCRIPT_IDIOMA = ('<script>document.querySelectorAll(".idioma a").forEach(a=>a.addEventListener("click",()=>{a.href=a.href.split("#")[0]+location.hash}))</script>')

def seletor(atual, outro_href, outro_lang):
    # ordem fixa PT-BR | EN; o idioma atual fica marcado com borda
    aria = "Idioma" if atual == "pt-BR" else "Language"
    pt = '<span aria-current="true">PT<span class="br">-BR</span></span>' if atual == "pt-BR" else \
         f'<a href="{outro_href}" hreflang="pt-BR" lang="pt-BR">PT<span class="br">-BR</span></a>'
    en = '<span aria-current="true">EN</span>' if atual == "en" else \
         f'<a href="{outro_href}" hreflang="en" lang="en">EN</a>'
    return f'<span class="idioma" aria-label="{aria}">{pt}{en}</span>'

def alternativos(p):
    url_pt = BASE + ("" if p == "index.html" else p)
    url_en = BASE + "en/" + ("" if p == "index.html" else p)
    return (f'  <link rel="alternate" hreflang="pt-BR" href="{url_pt}">\n'
            f'  <link rel="alternate" hreflang="en" href="{url_en}">\n'
            f'  <link rel="alternate" hreflang="x-default" href="{url_pt}">\n')

def com_seletor(html, sel):
    if 'class="idioma"' in html:
        html = re.sub(r'<div class="topo-esq">(<a class="marca"[^>]*>ARCANOSPEEDRUNS</a>)<span class="idioma".*?</span></div>(?=)', r'\1', html)
    return MARCA.sub(lambda m: f'<div class="topo-esq">{m.group(1)}{sel}</div>', html, count=1)

def com_extras_cabeca(html, p):
    html = re.sub(r'  <link rel="alternate" hreflang="[^"]+" href="[^"]+">\n', '', html)
    i = html.index('  <link rel="icon"')
    html = html[:i] + alternativos(p) + html[i:]
    html = re.sub(r"[ \t]*" + re.escape(SCRIPT_IDIOMA) + r"\n", "", html)
    return html.replace("</body>", "  " + SCRIPT_IDIOMA + "\n</body>", 1)

for p, trocas in PAGINAS.items():
    prof = p.count("/")
    caminho_pt = os.path.join(SITE, p)
    pt = open(caminho_pt, encoding="utf-8").read()

    # 1. página em português ganha o seletor
    pt = com_seletor(pt, seletor("pt-BR", "../" * prof + "en/" + p, "en"))
    pt = com_extras_cabeca(pt, p)
    open(caminho_pt, "w", encoding="utf-8").write(pt)

    # 2. versão em inglês
    en = pt
    for a, b in COMUM + trocas:
        if a not in en:
            raise SystemExit(f"[{p}] texto não encontrado, atualize a tradução: {a[:70]}")
        en = en.replace(a, b)
    en = en.replace(f'<meta property="og:url" content="{BASE}{"" if p == "index.html" else p}">',
                    f'<meta property="og:url" content="{BASE}en/{"" if p == "index.html" else p}">')
    if p == "portfolio.html":
        v = re.search(r'dados\.js(\?v=\d+)?"', en)
        sufixo = v.group(1) or "" if v else ""
        en = re.sub(r'(\s*)<script src="dados\.js', lambda m: f'{m.group(1)}<script src="dados-en.js{sufixo}"></script>{m.group(1)}<script src="dados.js', en, count=1)

    # caminhos de arquivos (css, js, imagens, pdf) passam a apontar para fora de en/
    dir_pt = posixpath.dirname(p)
    dir_en = posixpath.dirname("en/" + p)
    def corrige(m):
        attr, val = m.group(1), m.group(2)
        if re.match(r"^(https?:|mailto:|data:)", val):
            return m.group(0)
        limpo = val.split("?")[0]
        if limpo.endswith(".html") or limpo.endswith("/"):
            return m.group(0)  # links entre páginas continuam dentro de en/
        resto = val[len(limpo):]
        destino = posixpath.normpath(posixpath.join(dir_pt, limpo))
        return f'{attr}="{posixpath.relpath(destino, dir_en)}{resto}"'
    en = CAMINHO.sub(corrige, en)
    # o seletor do inglês aponta de volta para a página em português
    en = com_seletor(en, seletor("en", "../" * (prof + 1) + p, "pt-BR"))

    destino = os.path.join(SITE, "en", p)
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    open(destino, "w", encoding="utf-8").write(en)
    print("ok", p, "->", "en/" + p)
