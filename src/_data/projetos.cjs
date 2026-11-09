/* ============================================================
   PROJETOS DO PORTFÓLIO (português e inglês no mesmo lugar)
   Para adicionar ou editar um projeto, mexa só nesta lista. Os cartões e os
   detalhes são montados na hora de gerar o site (portfolio.njk); o dados.js
   só abre e fecha a gaveta.

   Texto que muda com o idioma: { pt: "...", en: "..." }. Texto igual nos dois
   (nomes próprios, ferramentas, links externos): escreva uma vez só.
   area: aparece no topo do cartão (Dados, Produto, Design...).
   capa: imagem 2:1 (ex.: 1200 × 600), caminho a partir da raiz do site. Sem capa,
     o cartão mostra o nome curto em letras grandes sobre o fundo escolhido em "fundo".
   fundo: "dados", "produto" ou "dev" (só vale para cartões sem capa).
   status: "andamento", "concluido" ou "breve".
   feitos: destaques (ou etapas previstas, se o status for "breve").
   links: url relativa ("projetos/x.html") abre a página no mesmo idioma.
   ============================================================ */
const projetos = [
  {
    id: "cignamed",
    area: { pt: "Produto", en: "Product" },
    capa: { pt: "/projetos/cignamed/capa.webp", en: "/projetos/cignamed/capa-en.webp" },
    nome: { pt: "TRÊS BASES, UM ESTUDO", en: "THREE DATABASES, ONE STUDY" },
    curto: "CIGNAMED",
    contexto: {
      pt: "Estudo de caso de produto do estágio na Cignamed: três bases de um estudo clínico, cada uma com um questionário diferente, unificadas em uma só.",
      en: "Product case study from my internship at Cignamed: three clinical study databases, each with a different questionnaire, merged into one.",
    },
    status: "concluido",
    resumo: {
      pt: "Fui chamado para o estágio para resolver um problema: unificar três bases com questionários diferentes, que nenhum script conseguia casar porque as perguntas estavam escritas de jeitos diferentes. Estudei o material, padronizei as perguntas, unifiquei com pandas e levei as próximas coletas para o REDCap. A junção passou de cerca de 2 meses para 2 minutos.",
      en: "I was brought into the internship to solve one problem: merge three databases with different questionnaires, which no script could match because the questions were written differently. I studied the material, standardized the questions, merged everything with pandas and moved future data collection to REDCap. Merging went from about 2 months to 2 minutes.",
    },
    feitos: {
      pt: [
        "Diagnóstico do problema: perguntas mal escritas e fora do padrão impediam a junção automática",
        "Padronização das perguntas nas três bases e unificação com pandas, sem descartar as perguntas que só existiam em uma base",
        "Auditoria de qualidade: mais de 200 duplicidades e centenas de inconsistências corrigidas, com log das correções",
        "Formulários no REDCap com regras de validação, para as próximas entrevistas já chegarem no padrão",
      ],
      en: [
        "Problem diagnosis: badly written, non-standard questions were blocking an automatic merge",
        "Standardized the questions across the three databases and merged them with pandas, keeping the questions that existed in only one database",
        "Data quality audit: 200+ duplicates and hundreds of inconsistencies fixed, with a log of every correction",
        "REDCap forms with validation rules, so future interviews arrive already in the standard",
      ],
    },
    stack: ["Python", "pandas", "Excel", "REDCap"],
    links: [
      { texto: { pt: "VER O ESTUDO DE CASO", en: "SEE THE CASE STUDY" }, url: "projetos/cignamed.html" },
    ],
  },
  {
    id: "datasus",
    area: { pt: "Dados", en: "Data" },
    capa: { pt: "/projetos/datasus/capa.webp", en: "/projetos/datasus/capa-en.webp" },
    nome: { pt: "SAÚDE PÚBLICA EM DADOS", en: "PUBLIC HEALTH IN DATA" },
    curto: "DATASUS",
    contexto: {
      pt: "Projeto pessoal com dados abertos do SUS: 107 milhões de internações financiadas pelo SUS entre 2015 e 2023.",
      en: "Personal project with open data from SUS, Brazil's free public health system: 107 million hospital admissions funded by SUS between 2015 and 2023.",
    },
    status: "concluido",
    resumo: {
      pt: "Análise dos microdados de internação do SIH/SUS no BigQuery: volume, custo e mortalidade por ano, diagnóstico e estado. A COVID foi só a 4ª causa de internação em volume, mas a mais cara do período, com R$ 10,7 bi.",
      en: "Analysis of SIH/SUS hospital admission microdata in BigQuery: volume, cost and mortality by year, diagnosis and state. COVID was only the 4th cause of admission by volume, but the most expensive of the period, at R$ 10.7 billion.",
    },
    feitos: {
      pt: [
        "Consultas em SQL sobre 107 milhões de internações no BigQuery, com cruzamento de CID-10 e população do IBGE",
        "Qualidade de dados: encontrei e contornei a UF vazia em toda a base, o CID principal dividido em duas colunas e meses duplicados em 2024",
        "Ranking de diagnósticos por volume e custo, evolução de 2015 a 2023 e comparação entre os 27 estados",
        "Dashboard em Power BI com quatro páginas, medidas em DAX e dados carregados pelo Power Query direto do GitHub",
      ],
      en: [
        "SQL queries over 107 million admissions in BigQuery, joined with ICD-10 codes and IBGE population data",
        "Data quality: found and worked around an empty state column across the whole table, the main diagnosis split into two columns and duplicated months in 2024",
        "Ranking of diagnoses by volume and cost, trends from 2015 to 2023 and a comparison of the 27 states",
        "Four-page Power BI dashboard, with DAX measures and data loaded through Power Query straight from GitHub",
      ],
    },
    stack: ["BigQuery", "SQL", "Python", "pandas", "Power BI"],
    links: [
      { texto: { pt: "VER O PROJETO", en: "SEE THE PROJECT" }, url: "projetos/datasus.html" },
      { texto: { pt: "REPOSITÓRIO NO GITHUB", en: "GITHUB REPOSITORY (PT)" }, url: "https://github.com/arcanospeedruns/datasus-analise" },
    ],
  },
  {
    id: "psique",
    area: "Design",
    capa: "/projetos/psique/capa.webp",
    nome: "PSIQUÊ",
    curto: "PSIQUÊ",
    contexto: {
      pt: "Releitura conceitual de uma identidade visual que fiz para uma cliente, uma clínica de psicologia. Nome, logo e peças foram recriados para o portfólio.",
      en: "Conceptual reinterpretation of a visual identity I made for a client, a psychology clinic. Name, logo and pieces were recreated for the portfolio.",
    },
    status: "concluido",
    resumo: {
      pt: "Identidade visual completa para uma clínica de psicologia, em roxo e amarelo a pedido da cliente. O símbolo é uma borboleta de linhas finas e ovais, já que psyché em grego quer dizer alma e também borboleta.",
      en: "Complete visual identity for a psychology clinic, in purple and yellow at the client's request. The symbol is a butterfly drawn with thin lines and ovals, since psyché in Greek means both soul and butterfly.",
    },
    feitos: {
      pt: [
        "Logomarca e versões de cor",
        "Aplicações em placa, folder e Instagram",
        "Manual de identidade com especificações e usos incorretos",
      ],
      en: [
        "Logomark and color versions",
        "Applications on a projecting sign, a folder and Instagram",
        "Brand guidelines with specifications and incorrect uses",
      ],
    },
    stack: [],
    ferramentas: ["Illustrator", "Photoshop", "InDesign"],
    links: [
      { texto: { pt: "VER AS PRANCHAS", en: "SEE THE BOARDS" }, url: "projetos/psique.html" },
    ],
  },
];

// entrega { pt: [...], en: [...] } com cada campo já no idioma certo
const noIdioma = (valor, idioma) => {
  if (Array.isArray(valor)) return valor.map((v) => noIdioma(v, idioma));
  if (valor && typeof valor === "object") {
    if ("pt" in valor && "en" in valor) return valor[idioma];
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, noIdioma(v, idioma)]));
  }
  return valor;
};
module.exports = { pt: noIdioma(projetos, "pt"), en: noIdioma(projetos, "en") };
