/* ============================================================
   PROJETOS DO PORTFÓLIO
   Para adicionar ou editar um projeto, mexa só nesta lista.
   area: aparece no topo do cartão (Dados, Produto, Design...).
   capa: caminho de uma imagem 2:1 (ex.: 1200 × 600). Sem capa, o cartão
     mostra o nome curto em letras grandes sobre o fundo escolhido em "fundo".
   fundo: "dados", "produto" ou "dev" (só vale para cartões sem capa).
   status: "andamento", "concluido" ou "breve".
   ============================================================ */
const projetos = [
  {
    id: "datasus",
    area: "Dados", fundo: "dados",
    nome: "SAÚDE PÚBLICA EM DADOS",
    curto: "DATASUS",
    contexto: "Projeto pessoal com dados abertos do SUS: 107 milhões de internações pagas entre 2015 e 2023.",
    status: "concluido",
    resumo: "Análise dos microdados de internação do SIH/SUS no BigQuery: volume, custo e mortalidade por ano, diagnóstico e estado. A COVID foi só a 4ª causa de internação em volume, mas a mais cara do período, com R$ 10,7 bi.",
    feitos: [
      "Consultas em SQL sobre 107 milhões de internações no BigQuery, com cruzamento de CID-10 e população do IBGE",
      "Qualidade de dados: encontrei e contornei a UF vazia em toda a base, o CID principal dividido em duas colunas e meses duplicados em 2024",
      "Ranking de diagnósticos por volume e custo, evolução de 2015 a 2023 e comparação entre os 27 estados",
      "Dashboard com os principais achados",
    ],
    stack: ["BigQuery", "SQL", "Python", "pandas"],
    links: [{ texto: "REPOSITÓRIO NO GITHUB", url: "https://github.com/arcanospeedruns/datasus-analise" }],
  },
  {
    id: "unirota",
    area: "Produto", fundo: "produto",
    nome: "UNIROTA",
    curto: "UNIROTA",
    contexto: "App de carona universitária. Projeto de Gestão Ágil de Projetos na PUC-SP, em que atuei como UX Designer.",
    status: "andamento",
    resumo: "Sistema de caronas intermunicipais para a comunidade acadêmica, com acesso por e-mail institucional. Cuidei da experiência do usuário, dos fluxos à organização das telas, e acompanhei o desenvolvimento em equipe ágil.",
    feitos: [
      "Fluxos, hierarquia e estados definidos antes da alta fidelidade",
      "Equipe de cinco pessoas, com app em React Native e back-end no Supabase",
    ],
    stack: ["UX", "React Native", "Supabase"],
    links: [
      { texto: "REPOSITÓRIO DO APP", url: "https://github.com/jvpbicalho/app-carona-universitaria" },
    ],
  },
  {
    id: "voluntiva",
    area: "Desenvolvimento", fundo: "dev",
    nome: "VOLUNTIVA",
    curto: "VOLUNTIVA",
    contexto: "Projeto acadêmico em equipe de cinco pessoas na PUC-SP, unindo Projeto de Software, Redes e Banco de Dados.",
    status: "andamento",
    resumo: "Sistema de gestão de voluntários para ONGs: cadastro de ações sociais, inscrições, controle de presença e histórico de participação, sobre um banco de dados relacional.",
    feitos: [
      "Banco relacional para voluntários, ONGs, ações e inscrições",
      "Arquitetura cliente-servidor com API em Python",
      "Interface web em React",
    ],
    stack: ["PostgreSQL", "Python", "FastAPI", "React"],
    links: [{ texto: "REPOSITÓRIO NO GITHUB", url: "https://github.com/joaoggvianna/Voluntiva" }],
  },
  {
    id: "psique",
    area: "Design", capa: "projetos/psique/capa.webp",
    nome: "PSIQUÊ",
    curto: "PSIQUÊ",
    contexto: "Releitura conceitual de uma identidade visual que fiz para uma cliente, uma clínica de psicologia. Nome, logo e peças foram recriados para o portfólio.",
    status: "concluido",
    resumo: "Identidade visual completa para uma clínica de psicologia, em roxo e amarelo a pedido da cliente. O símbolo é uma borboleta de linhas finas e ovais, já que psyché em grego quer dizer alma e também borboleta.",
    feitos: [
      "Logo, versões de cor e ícone de app",
      "Aplicações em fachada, mural de vidro, take-ones e Instagram",
      "Manual de identidade com especificações e usos incorretos",
    ],
    stack: ["Identidade visual", "Tipografia", "Aplicações", "Manual de marca"],
    tituloStack: "Áreas",
    links: [{ texto: "VER AS PRANCHAS", url: "projetos/psique.html" }],
  },
];

/* ============================================================
   Daqui pra baixo é o funcionamento dos cartões e dos detalhes.
   ============================================================ */

const textoStatus = { andamento: "Em andamento", concluido: "Concluído", breve: "Em breve" };
const grade = document.getElementById("projetos");

const capaHTML = (p) => p.capa
  ? `<span class="capa"><img src="${p.capa}" alt="" width="1200" height="600" loading="lazy"></span>`
  : `<span class="capa fundo-${p.fundo || "dados"}" aria-hidden="true"><span class="sigla">${p.curto}</span></span>`;

grade.innerHTML = projetos.map((p) => `
  <li>
    <a class="cartao" href="#${p.id}" data-id="${p.id}">
      ${capaHTML(p)}
      <span class="cartao-info">
        <span class="cartao-meta mono"><span>${p.area}</span><span class="st-${p.status}">${textoStatus[p.status]}</span></span>
        <span class="cartao-nome">${p.nome}</span>
        <span class="cartao-texto">${p.contexto}</span>
        <span class="cartao-mais mono">VER DETALHES →</span>
      </span>
    </a>
  </li>`).join("");

/* detalhes: abrem por cima, como uma gaveta */
const gaveta = document.createElement("dialog");
gaveta.className = "gaveta painel";
gaveta.setAttribute("aria-label", "Detalhes do projeto");
document.body.appendChild(gaveta);

function abrir(id) {
  const p = projetos.find((q) => q.id === id);
  if (!p) return;
  const indice = projetos.indexOf(p) + 1;
  const feitos = p.feitos.length
    ? `<h3 class="mono">${p.status === "breve" ? "Etapas previstas" : "Destaques"}</h3><ul class="feitos">${p.feitos.map((f) => `<li>${f}</li>`).join("")}</ul>`
    : "";
  const stack = p.stack.length
    ? `<h3 class="mono">${p.tituloStack || "Ferramentas"}</h3><ul class="stack mono">${p.stack.map((s) => `<li>${s}</li>`).join("")}</ul>`
    : "";
  const links = p.links.length
    ? `<div class="painel-links">${p.links.map((l) => (l.url ? `<a href="${l.url}"${l.url.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${l.texto}</a>` : `<span>${l.texto}</span>`)).join("")}</div>`
    : "";

  gaveta.innerHTML = `
    <div class="painel-topo mono"><span>Projeto ${indice} de ${projetos.length} · ${p.area}</span><button type="button" class="gaveta-fechar">FECHAR ✕</button></div>
    ${p.capa ? `<img class="gaveta-capa" src="${p.capa}" alt="">` : ""}
    <div class="painel-corpo">
      <span class="status mono ${p.status}">${textoStatus[p.status]}</span>
      <h2>${p.nome}</h2>
      <p class="contexto">${p.contexto}</p>
      <p class="resumo">${p.resumo}</p>
      ${feitos}
      ${stack}
    </div>
    ${links}`;
  gaveta.querySelector(".gaveta-fechar").addEventListener("click", fechar);
  if (!gaveta.open) gaveta.showModal();
  gaveta.scrollTop = 0;
}

function fechar() {
  if (gaveta.open) gaveta.close();
}

gaveta.addEventListener("close", () => {
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
});
// clicar fora da gaveta fecha
gaveta.addEventListener("click", (e) => { if (e.target === gaveta) fechar(); });

grade.addEventListener("click", (e) => {
  const a = e.target.closest(".cartao");
  if (!a) return;
  e.preventDefault();
  history.replaceState(null, "", "#" + a.dataset.id);
  abrir(a.dataset.id);
});

// link direto, ex.: portfolio.html#psique
if (location.hash) abrir(location.hash.slice(1));
window.addEventListener("hashchange", () => abrir(location.hash.slice(1)));
