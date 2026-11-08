/* ============================================================
   PORTFOLIO PROJECTS, ENGLISH VERSION (used by en/portfolio.html)
   Same ids and order as dados.js. Paths are relative to the /en/ folder,
   so images start with "../". The repositories themselves stay in Portuguese.
   ============================================================ */
window.projetosEN = [
  {
    id: "cignamed",
    area: "Product", capa: "../projetos/cignamed/capa-en.webp",
    nome: "THREE DATABASES, ONE STUDY",
    curto: "CIGNAMED",
    contexto: "Product case study from my internship at Cignamed: three clinical study databases, each with a different questionnaire, merged into one.",
    status: "concluido",
    resumo: "I was brought into the internship to solve one problem: merge three databases with different questionnaires, which no script could match because the questions were written differently. I studied the material, standardized the questions, merged everything with pandas and moved future data collection to REDCap. Merging went from about 2 months to 2 minutes.",
    feitos: [
      "Problem diagnosis: badly written, non-standard questions were blocking an automatic merge",
      "Standardized the questions across the three databases and merged them with pandas, keeping the questions that existed in only one database",
      "Data quality audit: 200+ duplicates and hundreds of inconsistencies fixed, with a log of every correction",
      "REDCap forms with validation rules, so future interviews arrive already in the standard",
    ],
    stack: ["Python", "pandas", "Excel", "REDCap"],
    links: [{ texto: "SEE THE CASE STUDY", url: "projetos/cignamed.html" }],
  },
  {
    id: "datasus",
    area: "Data", capa: "../projetos/datasus/capa-en.webp",
    nome: "PUBLIC HEALTH IN DATA",
    curto: "DATASUS",
    contexto: "Personal project with open data from SUS, Brazil's free public health system: 107 million hospital admissions funded by SUS between 2015 and 2023.",
    status: "concluido",
    resumo: "Analysis of SIH/SUS hospital admission microdata in BigQuery: volume, cost and mortality by year, diagnosis and state. COVID was only the 4th cause of admission by volume, but the most expensive of the period, at R$ 10.7 billion.",
    feitos: [
      "SQL queries over 107 million admissions in BigQuery, joined with ICD-10 codes and IBGE population data",
      "Data quality: found and worked around an empty state column across the whole table, the main diagnosis split into two columns and duplicated months in 2024",
      "Ranking of diagnoses by volume and cost, trends from 2015 to 2023 and a comparison of the 27 states",
      "Four-page Power BI dashboard, with DAX measures and data loaded through Power Query straight from GitHub",
    ],
    stack: ["BigQuery", "SQL", "Python", "pandas", "Power BI"],
    links: [
      { texto: "SEE THE PROJECT", url: "projetos/datasus.html" },
      { texto: "GITHUB REPOSITORY (PT)", url: "https://github.com/arcanospeedruns/datasus-analise" },
    ],
  },
  {
    id: "psique",
    area: "Design", capa: "../projetos/psique/capa.webp",
    nome: "PSIQUÊ",
    curto: "PSIQUÊ",
    contexto: "Conceptual reinterpretation of a visual identity I made for a client, a psychology clinic. Name, logo and pieces were recreated for the portfolio.",
    status: "concluido",
    resumo: "Complete visual identity for a psychology clinic, in purple and yellow at the client's request. The symbol is a butterfly drawn with thin lines and ovals, since psyché in Greek means both soul and butterfly.",
    feitos: [
      "Logomark and color versions",
      "Applications on a projecting sign, a folder and Instagram",
      "Brand guidelines with specifications and incorrect uses",
    ],
    stack: [],
    ferramentas: ["Illustrator", "Photoshop", "InDesign"],
    links: [{ texto: "SEE THE BOARDS", url: "projetos/psique.html" }],
  },
];
