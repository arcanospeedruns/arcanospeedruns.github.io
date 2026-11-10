/* Mapa do emprego: saldo do Novo CAGED por estado e município.
   Dados: /empregos-dados.json (ferramentas/empregos.py) e /empregos-mapa.json (malha simplificada).
   Este arquivo vira src/empregos.js no build (npm run mapa). */
import { geoIdentity, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const UFS = { 11: ["RO", "Rondônia"], 12: ["AC", "Acre"], 13: ["AM", "Amazonas"], 14: ["RR", "Roraima"], 15: ["PA", "Pará"], 16: ["AP", "Amapá"], 17: ["TO", "Tocantins"],
  21: ["MA", "Maranhão"], 22: ["PI", "Piauí"], 23: ["CE", "Ceará"], 24: ["RN", "Rio Grande do Norte"], 25: ["PB", "Paraíba"], 26: ["PE", "Pernambuco"], 27: ["AL", "Alagoas"], 28: ["SE", "Sergipe"], 29: ["BA", "Bahia"],
  31: ["MG", "Minas Gerais"], 32: ["ES", "Espírito Santo"], 33: ["RJ", "Rio de Janeiro"], 35: ["SP", "São Paulo"],
  41: ["PR", "Paraná"], 42: ["SC", "Santa Catarina"], 43: ["RS", "Rio Grande do Sul"],
  50: ["MS", "Mato Grosso do Sul"], 51: ["MT", "Mato Grosso"], 52: ["GO", "Goiás"], 53: ["DF", "Distrito Federal"] };
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MES3 = MESES.map((m) => m.slice(0, 3));
// uma escala só, do branco (mais vagas fechadas) ao azul-escuro (mais vagas criadas)
const ESCALA = ["#ffffff", "#edf3fa", "#d9e6f5", "#c0d6ee", "#9cc0e6", "#6ea3d8", "#3f80c4", "#1f5aa0", "#0b2f66"];
const COR_SEM = "#d5d5d5";

const $ = (s) => document.querySelector(s);
const num = (n) => Math.abs(n).toLocaleString("pt-BR");
const sinal = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + num(n);
const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const est = { nivel: "uf", foco: "", mes: 0, setor: -1, sel: null, aba: "cria" };
let dados, nomes = {}, valMun = new Map(), valUf = new Map(), brasil, caixaBrasil, caixaUf = {}, vb, anim;

// ---------- contas ----------
function calcular() {
  valMun = new Map(); valUf = new Map(); brasil = { s: 0, a: 0, d: 0 };
  const m0 = est.mes ? est.mes - 1 : 0, m1 = est.mes ? est.mes : dados.meses;
  for (const cod in dados.mun) {
    const r = dados.mun[cod]; let s = 0, a = 0, d = 0;
    for (let m = m0; m < m1; m++) {
      if (est.setor < 0) { for (const x of r.s[m]) s += x; a += r.a[m]; d += r.d[m]; }
      else s += r.s[m][est.setor];
    }
    const v = { s, a, d }; valMun.set(cod, v);
    brasil.s += s; brasil.a += a; brasil.d += d;
    const u = cod.slice(0, 2); if (!UFS[u]) continue;
    const t = valUf.get(u) || { s: 0, a: 0, d: 0 }; t.s += s; t.a += a; t.d += d; valUf.set(u, t);
  }
}
function limites() {
  const mun = est.nivel === "mun" || est.foco;
  if (mun) return est.mes ? [50, 500, 5000] : [100, 1000, 10000];
  return est.mes ? [1000, 5000, 20000] : [5000, 20000, 50000];
}
function cor(v, lim) {
  if (v == null) return COR_SEM;
  if (v === 0) return ESCALA[4];
  const a = Math.abs(v), i = a > lim[2] ? 4 : a > lim[1] ? 3 : a > lim[0] ? 2 : 1;
  return ESCALA[4 + (v > 0 ? i : -i)];
}

// ---------- mapa ----------
function montar(topo) {
  const mun = feature(topo, topo.objects.mun), uf = feature(topo, topo.objects.uf);
  const L = 1000, A = 1000;
  // a malha já vem projetada (Mercator); aqui só encaixa na área do desenho
  const proj = geoIdentity().reflectY(true).fitExtent([[10, 10], [L - 10, A - 10]], uf);
  const caminho = geoPath(proj);
  caixaBrasil = [0, 0, L, A];
  const grupos = {};
  for (const f of mun.features) {
    const p = f.properties; nomes[p.cod] = p.name;
    if (!f.geometry) continue;
    (grupos[p.uf] = grupos[p.uf] || []).push(`<path data-c="${p.cod}" d="${caminho(f)}"/>`);
  }
  let hm = "", hu = "";
  for (const u in grupos) hm += `<g data-u="${u}" hidden>${grupos[u].join("")}</g>`;
  for (const f of uf.features) {
    const u = f.properties.uf, b = caminho.bounds(f);
    caixaUf[u] = b; hu += `<path data-u="${u}" d="${caminho(f)}"/>`;
  }
  $("#g-mun").innerHTML = hm; $("#g-uf").innerHTML = hu;
  vb = caixaBrasil.slice(); aplicarVb();
}
function aplicarVb() { $("#mapa").setAttribute("viewBox", vb.map((x) => x.toFixed(1)).join(" ")); }
function irPara(alvo) {
  cancelAnimationFrame(anim);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { vb = alvo.slice(); aplicarVb(); return; }
  const de = vb.slice(), t0 = performance.now(), dur = 450;
  const passo = (t) => {
    const k = Math.min(1, (t - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    vb = de.map((x, i) => x + (alvo[i] - x) * e); aplicarVb();
    if (k < 1) anim = requestAnimationFrame(passo);
  };
  anim = requestAnimationFrame(passo);
}
function caixaDe(u) {
  const b = caixaUf[u], w = b[1][0] - b[0][0], h = b[1][1] - b[0][1], lado = Math.max(w, h) * 1.12;
  return [b[0][0] - (lado - w) / 2, b[0][1] - (lado - h) / 2, lado, lado];
}
function pintar() {
  const lim = limites(), munVisivel = est.nivel === "mun" || est.foco;
  const svg = $("#mapa");
  svg.dataset.modo = est.foco ? "foco" : est.nivel;
  for (const g of $("#g-mun").children) {
    const mostra = munVisivel && (!est.foco || g.dataset.u === est.foco);
    g.toggleAttribute("hidden", !mostra);
    if (mostra) for (const p of g.children) { const v = valMun.get(p.dataset.c); p.setAttribute("fill", cor(v ? v.s : null, lim)); }
  }
  for (const p of $("#g-uf").children) {
    const v = valUf.get(p.dataset.u);
    p.setAttribute("fill", munVisivel ? "none" : cor(v ? v.s : null, lim));
    p.classList.toggle("apagado", !!est.foco && p.dataset.u !== est.foco);
  }
  for (const p of svg.querySelectorAll(".sel")) p.classList.remove("sel");
  if (est.sel) { const p = svg.querySelector(est.sel.tipo === "mun" ? `#g-mun [data-c="${est.sel.cod}"]` : `#g-uf [data-u="${est.sel.cod}"]`); if (p) { p.classList.add("sel"); if (est.sel.tipo === "mun") p.parentNode.appendChild(p); } }
  // legenda
  const f = (n) => n.toLocaleString("pt-BR");
  const rot = [`mais de ${f(lim[2])}`, `${f(lim[1] + 1)} a ${f(lim[2])}`, `${f(lim[0] + 1)} a ${f(lim[1])}`, `1 a ${f(lim[0])}`];
  let h = "";
  for (let i = 4; i >= 1; i--) h += `<li><i style="background:${ESCALA[4 + i]}"></i>+ ${rot[4 - i]}</li>`;
  h += `<li><i style="background:${ESCALA[4]}"></i>zero</li>`;
  for (let i = 1; i <= 4; i++) h += `<li><i style="background:${ESCALA[4 - i]}"></i>− ${rot[4 - i]}</li>`;
  $("#legenda").innerHTML = h;
}

// ---------- painel ----------
function periodoTxt() { return est.mes ? `${MESES[est.mes - 1]} de ${dados.ano}` : `janeiro a ${MESES[dados.meses - 1]} de ${dados.ano}`; }
function escopo() {
  const linhas = [];
  if (est.foco || est.nivel === "mun") {
    for (const [cod, v] of valMun) { const u = cod.slice(0, 2); if (!nomes[cod] || (est.foco && u !== est.foco)) continue; linhas.push({ tipo: "mun", cod, nome: nomes[cod], uf: UFS[u][0], v }); }
  } else for (const [u, v] of valUf) linhas.push({ tipo: "uf", cod: u, nome: UFS[u][1], uf: UFS[u][0], v });
  return linhas;
}
function painel() {
  const tot = est.foco ? valUf.get(est.foco) : brasil;
  $("#onde").textContent = est.foco ? UFS[est.foco][1] : "Brasil";
  $("#quando").textContent = periodoTxt() + (est.setor >= 0 ? " · " + dados.setores[est.setor].toLowerCase() : "");
  const g = $("#total"); g.textContent = sinal(tot.s); g.dataset.sinal = tot.s < 0 ? "neg" : "pos";
  $("#adm-desl").hidden = est.setor >= 0;
  $("#adm").textContent = num(tot.a); $("#desl").textContent = num(tot.d);

  const linhas = escopo().filter((l) => (est.aba === "cria" ? l.v.s > 0 : l.v.s < 0)).sort((a, b) => (est.aba === "cria" ? b.v.s - a.v.s : a.v.s - b.v.s)).slice(0, 10);
  const max = linhas.length ? Math.abs(linhas[0].v.s) : 1;
  $("#rank-titulo").textContent = (est.foco || est.nivel === "mun" ? "Municípios" : "Estados") + (est.aba === "cria" ? " que mais criaram vagas" : " que mais fecharam vagas");
  $("#rank").innerHTML = linhas.length ? linhas.map((l, i) => `<li><button type="button" data-tipo="${l.tipo}" data-cod="${l.cod}"${est.sel && est.sel.cod === l.cod ? ' aria-current="true"' : ""}>
      <span class="pos">${i + 1}</span><span class="nome">${esc(l.nome)}${l.tipo === "mun" ? ` <small>${l.uf}</small>` : ""}</span><span class="valor">${sinal(l.v.s)}</span>
      <span class="barra" aria-hidden="true"><i style="width:${(Math.abs(l.v.s) / max * 100).toFixed(1)}%" data-sinal="${l.v.s < 0 ? "neg" : "pos"}"></i></span></button></li>`).join("")
    : `<li class="nada">Nenhum ${est.foco || est.nivel === "mun" ? "município" : "estado"} com saldo ${est.aba === "cria" ? "positivo" : "negativo"} neste recorte.</li>`;
  detalhe();
}
function detalhe() {
  const cx = $("#detalhe");
  if (!est.sel) { cx.hidden = true; return; }
  const { tipo, cod } = est.sel, v = tipo === "mun" ? valMun.get(cod) : valUf.get(cod);
  if (!v) { cx.hidden = true; return; }
  cx.hidden = false;
  const u = cod.slice(0, 2);
  $("#d-nome").textContent = tipo === "mun" ? `${nomes[cod]} (${UFS[u][0]})` : UFS[cod][1];
  const s = $("#d-saldo"); s.textContent = sinal(v.s); s.dataset.sinal = v.s < 0 ? "neg" : "pos";
  $("#d-extra").textContent = est.setor < 0 ? `${num(v.a)} admissões · ${num(v.d)} desligamentos` : dados.setores[est.setor];
  // mês a mês
  const serie = [];
  for (let m = 0; m < dados.meses; m++) {
    let x = 0;
    for (const c in dados.mun) { if (tipo === "mun" ? c !== cod : c.slice(0, 2) !== cod) continue; const r = dados.mun[c].s[m]; x += est.setor < 0 ? r.reduce((a, b) => a + b, 0) : r[est.setor]; }
    serie.push(x);
  }
  const mx = Math.max(1, ...serie.map(Math.abs));
  $("#d-meses").innerHTML = serie.map((x, m) => `<li${est.mes === m + 1 ? ' class="atual"' : ""}><span class="col" title="${MESES[m]}: ${sinal(x)}"><i data-sinal="${x < 0 ? "neg" : "pos"}" style="height:${(Math.abs(x) / mx * 100).toFixed(1)}%"></i></span><span class="m">${MES3[m]}</span><span class="n">${sinal(x)}</span></li>`).join("");
  $("#d-abrir").hidden = !(tipo === "uf" && !est.foco);
}
function tudo() { calcular(); pintar(); painel(); controles(); }
function controles() {
  $("#local").value = est.foco;
  for (const b of document.querySelectorAll("[data-nivel]")) { const on = (est.foco ? "mun" : est.nivel) === b.dataset.nivel; b.setAttribute("aria-pressed", on); b.disabled = !!est.foco && b.dataset.nivel === "uf"; }
  for (const b of document.querySelectorAll("[data-aba]")) b.setAttribute("aria-pressed", est.aba === b.dataset.aba);
  $("#voltar").hidden = !est.foco;
}
function focar(u) { est.foco = u; if (est.sel && (est.sel.tipo === "uf" || est.sel.cod.slice(0, 2) !== u)) est.sel = null; irPara(u ? caixaDe(u) : caixaBrasil); tudo(); }
function selecionar(tipo, cod) { est.sel = { tipo, cod }; pintar(); painel(); }

// ---------- eventos ----------
function ligar() {
  const svg = $("#mapa"), dica = $("#dica");
  const alvo = (e) => { const p = e.target.closest("path"); if (!p) return null; return p.dataset.c ? { tipo: "mun", cod: p.dataset.c } : { tipo: "uf", cod: p.dataset.u }; };
  svg.addEventListener("pointermove", (e) => {
    const a = e.pointerType === "mouse" ? alvo(e) : null;
    if (!a) { dica.hidden = true; return; }
    const v = a.tipo === "mun" ? valMun.get(a.cod) : valUf.get(a.cod);
    dica.innerHTML = `<b>${esc(a.tipo === "mun" ? nomes[a.cod] + " (" + UFS[a.cod.slice(0, 2)][0] + ")" : UFS[a.cod][1])}</b><span data-sinal="${v && v.s < 0 ? "neg" : "pos"}">${v ? sinal(v.s) : "sem dados"}</span>`;
    dica.hidden = false;
    const r = $("#palco").getBoundingClientRect();
    dica.style.left = Math.min(e.clientX - r.left + 14, r.width - dica.offsetWidth - 4) + "px";
    dica.style.top = Math.max(4, e.clientY - r.top - dica.offsetHeight - 10) + "px";
  });
  svg.addEventListener("pointerleave", () => { dica.hidden = true; });
  svg.addEventListener("click", (e) => {
    const a = alvo(e); if (!a) return;
    if (a.tipo === "uf" && !est.foco && est.nivel === "uf") { est.sel = a; focar(a.cod); return; }
    if (a.tipo === "uf") return;
    selecionar(a.tipo, a.cod);
    if (innerWidth < 900) $("#detalhe").scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
  $("#local").addEventListener("change", (e) => focar(e.target.value));
  $("#voltar").addEventListener("click", () => focar(""));
  $("#mes").addEventListener("change", (e) => { est.mes = +e.target.value; tudo(); });
  $("#setor").addEventListener("change", (e) => { est.setor = +e.target.value; tudo(); });
  for (const b of document.querySelectorAll("[data-nivel]")) b.addEventListener("click", () => { est.nivel = b.dataset.nivel; est.sel = null; tudo(); });
  for (const b of document.querySelectorAll("[data-aba]")) b.addEventListener("click", () => { est.aba = b.dataset.aba; painel(); controles(); });
  $("#rank").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.tipo === "mun" && !est.foco && est.nivel === "uf") est.nivel = "mun";
    selecionar(b.dataset.tipo, b.dataset.cod); controles();
  });
  $("#d-abrir").addEventListener("click", () => { if (est.sel) focar(est.sel.cod); });
  $("#d-fechar").addEventListener("click", () => { est.sel = null; pintar(); painel(); });
  // busca de município
  const busca = $("#busca"), lista = $("#achados");
  const indice = Object.keys(nomes).map((c) => ({ c, n: nomes[c], k: semAcento(nomes[c]) }));
  busca.addEventListener("input", () => {
    const q = semAcento(busca.value.trim());
    if (q.length < 2) { lista.hidden = true; return; }
    const a = indice.filter((x) => x.k.startsWith(q)).concat(indice.filter((x) => !x.k.startsWith(q) && x.k.includes(q))).slice(0, 8);
    lista.innerHTML = a.length ? a.map((x) => `<li><button type="button" data-cod="${x.c}">${esc(x.n)} <small>${UFS[x.c.slice(0, 2)][0]}</small></button></li>`).join("") : `<li class="nada">Nenhum município encontrado.</li>`;
    lista.hidden = false;
  });
  lista.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const cod = b.dataset.cod; lista.hidden = true; busca.value = "";
    est.sel = { tipo: "mun", cod }; focar(cod.slice(0, 2));
  });
}

async function iniciar() {
  try {
    const [d, t] = await Promise.all([fetch("/empregos-dados.json").then((r) => r.json()), fetch("/empregos-mapa.json").then((r) => r.json())]);
    dados = d; montar(t);
    $("#local").innerHTML = `<option value="">Brasil</option>` + Object.keys(UFS).sort((a, b) => UFS[a][1].localeCompare(UFS[b][1], "pt-BR")).map((u) => `<option value="${u}">${UFS[u][1]}</option>`).join("");
    $("#mes").innerHTML = `<option value="0">Acumulado, jan a ${MES3[d.meses - 1]}</option>` + MESES.slice(0, d.meses).map((m, i) => `<option value="${i + 1}">${m[0].toUpperCase() + m.slice(1)}</option>`).join("");
    $("#setor").innerHTML = `<option value="-1">Todos os setores</option>` + d.setores.slice(0, 5).map((s, i) => `<option value="${i}">${s}</option>`).join("");
    ligar(); tudo();
    $("#carregando").hidden = true;
  } catch (e) {
    $("#carregando").textContent = "Não foi possível carregar os dados do mapa. Recarregue a página.";
    console.error(e);
  }
}
iniciar();
