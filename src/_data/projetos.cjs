/* ============================================================
   PROJETOS DO PORTFÓLIO (português e inglês no mesmo lugar)
   Para adicionar ou editar um projeto, mexa só nesta lista. Os cartões são
   montados na hora de gerar o site (portfolio.njk) e cada um leva direto
   para a página do projeto.

   Texto que muda com o idioma: { pt: "...", en: "..." }. Texto igual nos dois
   (nomes próprios, ferramentas): escreva uma vez só.
   area: aparece no topo do cartão (Dados, Produto, Design...).
   capa: imagem 2:1 (ex.: 1200 × 600), caminho a partir da raiz do site. Sem capa,
     o cartão mostra o nome curto em letras grandes sobre o fundo escolhido em "fundo".
   fundo: "dados", "produto" ou "dev" (só vale para cartões sem capa).
   status: "andamento", "concluido" ou "breve".
   contexto: frase do cartão.
   stack: ferramentas, mostradas como etiquetas no cartão.
   pagina: página do projeto, relativa ao portfólio ("projetos/x.html"); abre no
     mesmo idioma. Sem página (projeto "breve"), o cartão não é clicável.
   ============================================================ */
const projetos = [
  {
    id: "cignamed",
    area: { pt: "Produto", en: "Product" },
    capa: { pt: "/projetos/cignamed/capa.webp", en: "/projetos/cignamed/capa-en.webp" },
    nome: { pt: "TRÊS BASES, UM ESTUDO", en: "THREE DATABASES, ONE STUDY" },
    curto: "CIGNAMED",
    contexto: {
      pt: "Estudo de caso de produto do estágio na Cignamed: três bases de um estudo clínico, cada uma com um questionário diferente, unificadas em uma só. A junção passou de cerca de 2 meses para 2 minutos.",
      en: "Product case study from my internship at Cignamed: three clinical study databases, each with a different questionnaire, merged into one. Merging went from about 2 months to 2 minutes.",
    },
    status: "concluido",
    stack: ["Python", "pandas", "Excel", "REDCap"],
    pagina: "projetos/cignamed.html",
  },
  {
    id: "datasus",
    area: { pt: "Dados", en: "Data" },
    capa: { pt: "/projetos/datasus/capa.webp", en: "/projetos/datasus/capa-en.webp" },
    nome: { pt: "SAÚDE PÚBLICA EM DADOS", en: "PUBLIC HEALTH IN DATA" },
    curto: "DATASUS",
    contexto: {
      pt: "Projeto pessoal com dados abertos do SUS: 107 milhões de internações financiadas pelo SUS entre 2015 e 2023, analisadas por volume, custo e mortalidade.",
      en: "Personal project with open data from SUS, Brazil's free public health system: 107 million hospital admissions funded by SUS between 2015 and 2023, analyzed by volume, cost and mortality.",
    },
    status: "concluido",
    stack: ["BigQuery", "SQL", "Python", "pandas", "Power BI"],
    pagina: "projetos/datasus.html",
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
    stack: ["Illustrator", "Photoshop", "InDesign"],
    pagina: "projetos/psique.html",
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
