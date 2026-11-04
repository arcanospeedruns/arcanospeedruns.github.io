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
    contexto: "Personal project with open data from SUS, Brazil's public health system: 107 million paid hospital admissions between 2015 and 2023.",
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
      { texto: "GITHUB REPOSITORY (PT)", url: "https://github.com/arcanospeedruns/datasus-analise" },
      { texto: "POWER BI DASHBOARD (PDF, PT)", url: "https://github.com/arcanospeedruns/datasus-analise/blob/main/powerbi/internacoes-sus.pdf" },
    ],
  },
  {
    id: "unirota",
    area: "Product", fundo: "produto",
    nome: "UNIROTA",
    curto: "UNIROTA",
    contexto: "University carpooling app. Agile Project Management course project at PUC-SP, where I worked as UX Designer.",
    status: "andamento",
    resumo: "Intercity carpooling system for the academic community, with sign-in through institutional e-mail. I handled the user experience, from flows to screen structure, and followed development in an agile team.",
    feitos: [
      "Flows, hierarchy and states defined before high fidelity",
      "Five-person team, with the app in React Native and the back end in Supabase",
    ],
    stack: ["UX", "React Native", "Supabase"],
    links: [
      { texto: "APP REPOSITORY (PT)", url: "https://github.com/jvpbicalho/app-carona-universitaria" },
    ],
  },
  {
    id: "voluntiva",
    area: "Development", fundo: "dev",
    nome: "VOLUNTIVA",
    curto: "VOLUNTIVA",
    contexto: "Five-person academic team project at PUC-SP, combining Software Design, Networks and Databases.",
    status: "andamento",
    resumo: "Volunteer management system for NGOs: social actions, sign-ups, attendance tracking and participation history, on top of a relational database.",
    feitos: [
      "Relational database for volunteers, NGOs, actions and sign-ups",
      "Client-server architecture with a Python API",
      "Web interface in React",
    ],
    stack: ["PostgreSQL", "Python", "FastAPI", "React"],
    links: [{ texto: "GITHUB REPOSITORY (PT)", url: "https://github.com/joaoggvianna/Voluntiva" }],
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
      "Applications on the storefront, glass wall, take-one leaflets and Instagram",
      "Brand guidelines with specifications and incorrect uses",
    ],
    stack: ["Visual identity", "Typography", "Applications", "Brand guidelines"],
    tituloStack: "Areas",
    links: [{ texto: "SEE THE BOARDS", url: "projetos/psique.html" }],
  },
];
