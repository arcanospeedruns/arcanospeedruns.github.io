/* ============================================================
   PROJETOS DO PORTFÓLIO
   Para adicionar ou editar um projeto, mexa só nesta lista.
   planeta: o visual do planeta. Opções: "mercurio", "venus", "terra",
     "marte", "jupiter", "saturno", "urano", "netuno".
   x e y: posição no mapa, em % (0 a 100). tam: tamanho, em fração da largura.
   status: "andamento", "concluido" ou "breve".
   ============================================================ */
const projetos = [
  {
    id: "datasus",
    planeta: "saturno", x: 50, y: 52, tam: 0.17,
    nome: "SAÚDE PÚBLICA EM DADOS",
    rotulo: "DATASUS",
    contexto: "Projeto pessoal com dados abertos do SUS. Em preparação.",
    status: "breve",
    resumo: "Análise de dados públicos do DataSUS, da coleta ao dashboard, com consultas em BigQuery e tratamento em Python.",
    feitos: [
      "Coleta e organização dos dados abertos no BigQuery",
      "Limpeza e análise exploratória em Python",
      "Dashboard com os principais achados",
    ],
    stack: ["BigQuery", "SQL", "Python", "Pandas", "Power BI"],
    links: [{ texto: "REPOSITÓRIO EM BREVE" }],
  },
  {
    id: "unirota",
    planeta: "terra", x: 21, y: 30, tam: 0.1,
    nome: "UNIROTA",
    rotulo: "UNIROTA",
    contexto: "App de carona universitária. Projeto de Gestão Ágil de Projetos na PUC-SP, em que atuei como UX Designer.",
    status: "andamento",
    resumo: "Sistema de caronas intermunicipais para a comunidade acadêmica, com acesso por e-mail institucional. Fiz os wireframes do app e acompanhei o desenvolvimento em equipe ágil.",
    feitos: [
      "Wireframes navegáveis de 41 telas, organizados pelos 10 épicos do backlog",
      "Fluxos, hierarquia e estados definidos antes da alta fidelidade",
      "Equipe de cinco pessoas, com app em React Native e back-end no Supabase",
    ],
    stack: ["UX", "Wireframes", "HTML", "React Native", "Supabase"],
    links: [
      { texto: "WIREFRAMES NO GITHUB", url: "https://github.com/arcanospeedruns/UniRota" },
      { texto: "REPOSITÓRIO DO APP", url: "https://github.com/jvpbicalho/app-carona-universitaria" },
    ],
  },
  {
    id: "voluntiva",
    planeta: "marte", x: 77, y: 74, tam: 0.085,
    nome: "VOLUNTIVA",
    rotulo: "VOLUNTIVA",
    contexto: "Projeto acadêmico em grupo na PUC-SP, unindo Projeto de Software, Redes e Banco de Dados.",
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
    planeta: "venus", x: 79, y: 27, tam: 0.09,
    nome: "PSIQUÊ",
    rotulo: "PSIQUÊ",
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
   Daqui pra baixo é o funcionamento dos botões e do painel.
   O desenho do mapa fica em mapa.js.
   ============================================================ */

const nomesPlanetas = {
  mercurio: "Mercúrio", venus: "Vênus", terra: "Terra", marte: "Marte",
  jupiter: "Júpiter", saturno: "Saturno", urano: "Urano", netuno: "Netuno",
};
const textoStatus = { andamento: "Em andamento", concluido: "Concluído", breve: "Em breve" };

const mapa = document.getElementById("mapa");
const painel = document.getElementById("painel");
const botoes = {};

projetos.forEach((p) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "destino" + (p.status === "breve" ? " bloqueado" : "");
  b.dataset.planeta = p.planeta;
  b.setAttribute("aria-pressed", "false");
  b.setAttribute("aria-label", `${p.nome}, em ${nomesPlanetas[p.planeta]}, ${textoStatus[p.status]}`);
  b.innerHTML = `<span class="corpo" aria-hidden="true"></span><span class="rotulo">${p.rotulo}</span>`;
  b.addEventListener("click", () => selecionar(p.id, true));
  mapa.appendChild(b);
  botoes[p.id] = b;
});

function selecionar(id, mudarHash) {
  const p = projetos.find((q) => q.id === id) || projetos[0];
  Object.entries(botoes).forEach(([k, b]) => b.setAttribute("aria-pressed", String(k === p.id)));

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

  painel.innerHTML = `
    <div class="painel-topo mono"><span>Destino ${indice} de ${projetos.length}</span><span>${nomesPlanetas[p.planeta]}</span></div>
    <div class="painel-corpo">
      <span class="status mono ${p.status}">${textoStatus[p.status]}</span>
      <h2>${p.nome}</h2>
      <p class="contexto">${p.contexto}</p>
      <p class="resumo">${p.resumo}</p>
      ${feitos}
      ${stack}
    </div>
    ${links}`;

  // avisa o mapa para destacar a órbita do planeta escolhido
  document.dispatchEvent(new CustomEvent("destino", { detail: { planeta: p.planeta } }));

  if (mudarHash) {
    history.replaceState(null, "", "#" + p.id);
    if (window.matchMedia("(max-width: 900px)").matches) {
      painel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

window.addEventListener("hashchange", () => selecionar(location.hash.slice(1), false));
// a primeira seleção acontece em mapa.js, depois que o mapa é montado
window.selecionarInicial = () => selecionar(location.hash.slice(1) || "unirota", false);
