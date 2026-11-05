/* ============================================================
   PORTFOLIO PROJECTS, ENGLISH VERSION (used by en/portfolio.html)
   Same ids and order as dados.js. Paths are relative to the /en/ folder,
   so images start with "../". The repositories themselves stay in Portuguese.
   ============================================================ */
window.projetosEN = [
  {
    id: "datasus",
    area: "Data", capa: "../projetos/datasus/capa.webp",
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
      "Logo, color versions and app icon",
      "Applications on a projecting sign, a folder and Instagram",
      "Brand guidelines with specifications and incorrect uses",
    ],
    stack: ["Visual identity", "Typography", "Applications", "Brand guidelines"],
    tituloStack: "Areas",
    links: [{ texto: "SEE THE BOARDS", url: "projetos/psique.html" }],
  },
];
