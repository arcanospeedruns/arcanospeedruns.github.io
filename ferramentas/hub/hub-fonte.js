// Hub de arcanospeedruns: leitura pública, só o dono publica.
// As regras de quem pode ler e escrever ficam no banco (supabase/hub.sql);
// este arquivo só monta a tela.
import { createClient } from "@supabase/supabase-js";

const $ = (s) => document.querySelector(s);
const cfg = window.HUB_CONFIG || {};
const BALDE = "fotos";
// a página em inglês (en/hub.html) usa os mesmos posts, com os textos fixos traduzidos
const EN = document.documentElement.lang.startsWith("en");
const T = (pt, en) => (EN ? en : pt);
const POR_PAGINA = 12;
const LADO_MAX = 2000; // px do lado maior depois de reduzir
const MAX_MB = 25; // limite por arquivo (igual ao do Supabase, em supabase/hub.sql)
const ehVideo = (caminho) => /\.(mp4|webm)$/i.test(caminho || "");

const msg = $("#msg");
const avisar = (t, el = msg) => { el.textContent = t || ""; };

// cliente: o de teste (quando existe) ou o Supabase de verdade
let db = window.HUB_CLIENTE || null;
if (!db && cfg.url && cfg.chave) {
  db = createClient(cfg.url, cfg.chave, { auth: { persistSession: true, autoRefreshToken: true } });
}

let dono = false;
let pagina = 0;
let acabou = false;
let atual = null; // post aberto

// ---------- utilidades ----------
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function inline(t) {
  return esc(t)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
}

// texto simples com um pouco de marcação; tudo é escapado antes
function formatar(texto) {
  return String(texto || "")
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((bloco) => bloco.trim())
    .filter(Boolean)
    .map((bloco) => {
      const linhas = bloco.split("\n");
      if (/^##\s/.test(bloco)) return `<h3>${inline(bloco.replace(/^##\s+/, ""))}</h3>`;
      if (linhas.every((l) => /^>\s?/.test(l))) return `<blockquote>${linhas.map((l) => inline(l.replace(/^>\s?/, ""))).join("<br>")}</blockquote>`;
      if (linhas.every((l) => /^[-*]\s/.test(l))) return `<ul>${linhas.map((l) => `<li>${inline(l.replace(/^[-*]\s+/, ""))}</li>`).join("")}</ul>`;
      return `<p>${linhas.map(inline).join("<br>")}</p>`;
    })
    .join("");
}

const textoPuro = (t) => String(t || "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/^\s*(#+|>|[-*])\s+/gm, "").replace(/[*_`]+/g, "").replace(/\s+/g, " ").trim();
const resumo = (t, n = 220) => { const p = textoPuro(t); return p.length > n ? p.slice(0, n).replace(/\s+\S*$/, "") + "…" : p; };

const fmtData = new Intl.DateTimeFormat(EN ? "en-GB" : "pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const data = (iso) => {
  const partes = Object.fromEntries(fmtData.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${partes.day} ${partes.month.replace(".", "")} ${partes.year}`.toUpperCase();
};

const urlFoto = (caminho) => db.storage.from(BALDE).getPublicUrl(caminho).data.publicUrl;

// foto, GIF ou vídeo curto (mp4/webm, que toca em loop e sem som, como um GIF)
function midia(src, ehVid, extra = "") {
  return ehVid
    ? `<video src="${esc(src)}" autoplay loop muted playsinline preload="metadata" ${extra}></video>`
    : `<img src="${esc(src)}" ${extra}>`;
}

function slugDe(titulo) {
  const base = titulo.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "post";
  return `${base}-${Date.now().toString(36).slice(-5)}`;
}

const idNovo = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

// reduz a foto no navegador antes de enviar.
// GIF e WebP vão como estão (para não perder a animação); vídeo curto também.
async function prepararFoto(arquivo) {
  if (arquivo.size > MAX_MB * 1024 * 1024) throw new Error(T(`"${arquivo.name}" tem mais de ${MAX_MB} MB. Use um arquivo menor.`, `"${arquivo.name}" is larger than ${MAX_MB} MB. Use a smaller file.`));
  if (arquivo.type === "video/mp4" || arquivo.type === "video/webm") {
    const v = document.createElement("video");
    v.preload = "metadata"; v.muted = true; v.src = URL.createObjectURL(arquivo);
    await new Promise((ok, erro) => { v.onloadedmetadata = ok; v.onerror = () => erro(new Error(T(`não deu para ler o vídeo "${arquivo.name}"`, `could not read the video "${arquivo.name}"`))); });
    URL.revokeObjectURL(v.src);
    return { blob: arquivo, tipo: arquivo.type, ext: arquivo.type === "video/mp4" ? "mp4" : "webm", w: v.videoWidth, h: v.videoHeight };
  }
  if (arquivo.type === "image/gif" || arquivo.type === "image/webp") {
    const bmp = await createImageBitmap(arquivo);
    const r = { blob: arquivo, tipo: arquivo.type, ext: arquivo.type === "image/gif" ? "gif" : "webp", w: bmp.width, h: bmp.height };
    bmp.close?.();
    return r;
  }
  const bmp = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  const k = Math.min(1, LADO_MAX / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
  const tela = document.createElement("canvas");
  tela.width = w; tela.height = h;
  tela.getContext("2d").drawImage(bmp, 0, 0, w, h);
  bmp.close?.();
  const blob = await new Promise((ok, erro) => tela.toBlob((b) => (b ? ok(b) : erro(new Error("não deu para converter a foto"))), "image/jpeg", 0.86));
  return { blob, tipo: "image/jpeg", ext: "jpg", w, h };
}

// ---------- sessão ----------
async function lerSessao() {
  const { data: d } = await db.auth.getSession();
  aplicarSessao(d.session);
}

function aplicarSessao(sessao) {
  dono = !!sessao;
  $("#barra-dono").hidden = !dono;
  $("#link-entrar").hidden = dono;
}

// ---------- lista ----------
let total = 0;

function itemFeed(p, n) {
  const li = document.createElement("li");
  li.className = "ficha-post" + (p.publicado ? "" : " rascunho");
  const capa = p.fotos?.[0];
  const titulo = p.titulo || T("Sem título", "Untitled");
  li.innerHTML = `
    <a href="#/p/${encodeURIComponent(p.slug)}">
      <div class="ficha-post-img${capa ? "" : " sem-foto"}">${capa
        ? midia(urlFoto(capa.caminho), ehVideo(capa.caminho), `alt="" loading="lazy" width="${capa.w || ""}" height="${capa.h || ""}"`)
        : `<span aria-hidden="true">${esc(textoPuro(titulo).charAt(0).toUpperCase() || "·")}</span>`}</div>
      <div class="ficha-post-txt">
        <p class="ficha-post-meta"><b>${String(n).padStart(2, "0")}</b> · ${data(p.criado_em)}</p>
        ${p.publicado ? "" : `<p class="ficha-post-meta"><span class="tag">${T("RASCUNHO", "DRAFT")}</span></p>`}
        <h3>${esc(titulo)}</h3>
        ${p.texto ? `<p class="ficha-post-resumo">${esc(resumo(p.texto, 160))}</p>` : ""}
      </div>
    </a>`;
  return li;
}

// os títulos dos últimos posts correm no letreiro
function enfeitarDestaque(posts) {
  const titulos = posts.filter((p) => p.publicado).slice(0, 5).map((p) => (p.titulo || "").toUpperCase());
  const letreiro = $("#letreiro");
  if (letreiro && titulos.length) letreiro.textContent = "ÚLTIMOS POSTS · " + titulos.join(" · ") + " · ";
}

async function carregarLista(reiniciar) {
  if (reiniciar) { pagina = 0; acabou = false; $("#feed").innerHTML = ""; }
  if (acabou) return;
  avisar(T("Carregando…", "Loading…"));
  const de = pagina * POR_PAGINA;
  const { data: posts, error, count } = await db.from("posts")
    .select("id,slug,titulo,texto,fotos,publicado,criado_em", { count: "exact" })
    .order("criado_em", { ascending: false })
    .range(de, de + POR_PAGINA - 1);
  if (error) { avisar(T("Não deu para carregar os posts. Tente de novo em instantes.", "Couldn’t load the posts. Try again in a moment.")); console.error(error); return; }
  avisar("");
  if (typeof count === "number") total = count;
  posts.forEach((p, i) => $("#feed").append(itemFeed(p, Math.max(1, (total || posts.length) - de - i))));
  if (pagina === 0) enfeitarDestaque(posts);
  pagina++;
  acabou = posts.length < POR_PAGINA;
  $("#mais").hidden = acabou;
  $("#vazio").hidden = $("#feed").children.length > 0;
  $("#contagem").textContent = total ? `${String(total).padStart(2, "0")} POST${total > 1 ? "S" : ""}` : "";
}

// ---------- leitura ----------
async function abrirPost(slug) {
  avisar(T("Carregando…", "Loading…"));
  const { data: p, error } = await db.from("posts")
    .select("id,slug,titulo,texto,fotos,publicado,criado_em,editado_em")
    .eq("slug", slug).maybeSingle();
  if (error || !p) {
    avisar(error ? T("Não deu para abrir este post.", "Couldn’t open this post.") : T("Post não encontrado.", "Post not found."));
    $("#leitura").hidden = true;
    return;
  }
  avisar("");
  atual = p;
  $("#l-data").textContent = data(p.criado_em) + (p.publicado ? "" : " · RASCUNHO");
  $("#l-titulo").textContent = p.titulo || "Sem título";
  $("#l-texto").innerHTML = formatar(p.texto);
  const ul = $("#l-fotos");
  ul.innerHTML = "";
  (p.fotos || []).forEach((f, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${esc(urlFoto(f.caminho))}" data-i="${i}">${midia(urlFoto(f.caminho), ehVideo(f.caminho), `alt="${esc(p.titulo)}, ${T("foto", "photo")} ${i + 1}" loading="lazy" width="${f.w || ""}" height="${f.h || ""}"`)}</a>`;
    ul.append(li);
  });
  ul.classList.toggle("uma", (p.fotos || []).length === 1);
  $("#l-acoes").hidden = !dono;
  $("#l-apagar").textContent = T("APAGAR", "DELETE");
  delete $("#l-apagar").dataset.certeza;
  $("#leitura").hidden = false;
  document.title = `${p.titulo || "Post"} | Hub | Carlos Gouveia`;
  window.scrollTo(0, 0);
}

// ---------- rotas ----------
async function rota() {
  if (!db) {
    $("#lista").hidden = true; $("#leitura").hidden = true;
    avisar(T("O hub ainda não foi ligado ao banco. Volte em breve.", "The hub isn’t connected yet. Come back soon."));
    return;
  }
  const h = location.hash.replace(/^#\/?/, "");
  if (h === "entrar") {
    if (!dono) abrirDialogo($("#entrar"));
    history.replaceState(null, "", "#/");
  }
  const m = h.match(/^p\/(.+)$/);
  if (m) {
    $("#lista").hidden = true;
    await abrirPost(decodeURIComponent(m[1]));
  } else {
    $("#leitura").hidden = true;
    $("#lista").hidden = false;
    document.title = "Hub | Carlos Gouveia";
    atual = null;
    if (!$("#feed").children.length) await carregarLista(true);
  }
}

// ---------- diálogos ----------
function abrirDialogo(d) { if (!d.open) d.showModal(); }
document.querySelectorAll("[data-fechar]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));

$("#form-entrar").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = $("#msg-entrar");
  avisar(T("Entrando…", "Signing in…"), out);
  const { data: d, error } = await db.auth.signInWithPassword({ email: $("#e-email").value.trim(), password: $("#e-senha").value });
  if (error) { avisar(T("E-mail ou senha não conferem.", "E-mail or password is incorrect."), out); return; }
  avisar("", out);
  $("#e-senha").value = "";
  $("#entrar").close();
  aplicarSessao(d.session);
  await recarregar();
});

$("#sair").addEventListener("click", async () => {
  await db.auth.signOut();
  aplicarSessao(null);
  await recarregar();
});

async function recarregar() {
  $("#feed").innerHTML = "";
  await rota();
}

// ---------- editor ----------
// cada foto do editor: { caminho, w, h } já salva, ou { arquivo, previa } nova
let fotosEd = [];
let editando = null;
let salvando = false;

function desenharPrevia() {
  const ul = $("#previa");
  ul.innerHTML = "";
  fotosEd.forEach((f, i) => {
    const li = document.createElement("li");
    const src = f.previa || urlFoto(f.caminho);
    const vid = f.arquivo ? f.arquivo.type.startsWith("video/") : ehVideo(f.caminho);
    li.innerHTML = `${midia(src, vid, `alt="${T("Foto", "Photo")} ${i + 1}"`)}
      <div class="mono">
        <button type="button" data-acao="esq" ${i === 0 ? "disabled" : ""} aria-label="Mover para a esquerda">←</button>
        <button type="button" data-acao="tirar" aria-label="Tirar foto ${i + 1}">TIRAR</button>
        <button type="button" data-acao="dir" ${i === fotosEd.length - 1 ? "disabled" : ""} aria-label="Mover para a direita">→</button>
      </div>`;
    li.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      const a = b.dataset.acao;
      if (a === "tirar") { const [x] = fotosEd.splice(i, 1); if (x.previa) URL.revokeObjectURL(x.previa); }
      if (a === "esq") [fotosEd[i - 1], fotosEd[i]] = [fotosEd[i], fotosEd[i - 1]];
      if (a === "dir") [fotosEd[i + 1], fotosEd[i]] = [fotosEd[i], fotosEd[i + 1]];
      desenharPrevia();
    }));
    ul.append(li);
  });
}

function abrirEditor(post) {
  editando = post || null;
  fotosEd.forEach((f) => f.previa && URL.revokeObjectURL(f.previa));
  fotosEd = (post?.fotos || []).map((f) => ({ ...f }));
  $("#editor-titulo").textContent = post ? T("EDITAR POST", "EDIT POST") : T("NOVO POST", "NEW POST");
  $("#p-titulo").value = post?.titulo || "";
  $("#p-texto").value = post?.texto || "";
  $("#p-publicado").checked = post ? post.publicado : true;
  $("#p-fotos").value = "";
  avisar("", $("#msg-editor"));
  desenharPrevia();
  abrirDialogo($("#editor"));
  $("#p-titulo").focus();
}

$("#p-fotos").addEventListener("change", (e) => {
  for (const arquivo of e.target.files) {
    if (!arquivo.type.startsWith("image/") && arquivo.type !== "video/mp4" && arquivo.type !== "video/webm") continue;
    fotosEd.push({ arquivo, previa: URL.createObjectURL(arquivo) });
  }
  e.target.value = "";
  desenharPrevia();
});

$("#editor").addEventListener("cancel", (e) => { if (salvando) e.preventDefault(); });

$("#form-post").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (salvando) return;
  const out = $("#msg-editor");
  const titulo = $("#p-titulo").value.trim();
  if (!titulo) { avisar(T("Dê um título ao post.", "Give the post a title."), out); return; }
  salvando = true;
  $("#salvar").disabled = true;
  const pasta = editando?.id || idNovo();
  const enviadas = [];
  try {
    const fotos = [];
    let n = 0;
    const novas = fotosEd.filter((f) => f.arquivo).length;
    for (const f of fotosEd) {
      if (!f.arquivo) { fotos.push({ caminho: f.caminho, w: f.w, h: f.h }); continue; }
      n++;
      avisar(T(`Enviando foto ${n} de ${novas}…`, `Uploading photo ${n} of ${novas}…`), out);
      const p = await prepararFoto(f.arquivo);
      const caminho = `${pasta}/${idNovo()}.${p.ext}`;
      const { error } = await db.storage.from(BALDE).upload(caminho, p.blob, { contentType: p.tipo, cacheControl: "31536000", upsert: false });
      if (error) throw error;
      enviadas.push(caminho);
      fotos.push({ caminho, w: p.w, h: p.h });
    }
    avisar(T("Salvando…", "Saving…"), out);
    const dados = { titulo, texto: $("#p-texto").value.replace(/\s+$/, ""), fotos, publicado: $("#p-publicado").checked };
    let salvo;
    if (editando) {
      const { data: d, error } = await db.from("posts").update(dados).eq("id", editando.id).select().single();
      if (error) throw error;
      salvo = d;
      // fotos que saíram do post saem também do armazenamento
      const ficaram = new Set(fotos.map((f) => f.caminho));
      const sairam = (editando.fotos || []).map((f) => f.caminho).filter((c) => !ficaram.has(c));
      if (sairam.length) await db.storage.from(BALDE).remove(sairam);
    } else {
      const { data: d, error } = await db.from("posts").insert({ id: pasta, slug: slugDe(titulo), ...dados }).select().single();
      if (error) throw error;
      salvo = d;
    }
    fotosEd.forEach((f) => f.previa && URL.revokeObjectURL(f.previa));
    fotosEd = [];
    salvando = false;
    $("#editor").close();
    $("#feed").innerHTML = "";
    const alvo = `#/p/${encodeURIComponent(salvo.slug)}`;
    if (location.hash === alvo) await rota(); else location.hash = alvo;
  } catch (erro) {
    console.error(erro);
    if (enviadas.length) await db.storage.from(BALDE).remove(enviadas).catch(() => {});
    avisar(T("Não deu para salvar: ", "Couldn’t save: ") + (erro.message || T("erro desconhecido", "unknown error")), out);
  } finally {
    salvando = false;
    $("#salvar").disabled = false;
  }
});

$("#novo").addEventListener("click", () => abrirEditor(null));
$("#l-editar").addEventListener("click", () => atual && abrirEditor(atual));

$("#l-apagar").addEventListener("click", async (e) => {
  const b = e.currentTarget;
  if (!atual) return;
  if (!b.dataset.certeza) { b.dataset.certeza = "1"; b.textContent = T("CLIQUE DE NOVO PARA APAGAR", "CLICK AGAIN TO DELETE"); return; }
  b.disabled = true;
  const caminhos = (atual.fotos || []).map((f) => f.caminho);
  const { error } = await db.from("posts").delete().eq("id", atual.id);
  b.disabled = false;
  if (error) { avisar(T("Não deu para apagar o post.", "Couldn’t delete the post.")); console.error(error); return; }
  if (caminhos.length) await db.storage.from(BALDE).remove(caminhos);
  $("#feed").innerHTML = "";
  location.hash = "#/";
});

// ---------- foto ampliada ----------
const caixa = $("#foto");
let fotoI = 0;
function mostrarFoto(i) {
  const fs = atual?.fotos || [];
  if (!fs.length) return;
  fotoI = (i + fs.length) % fs.length;
  const f = fs[fotoI], vid = ehVideo(f.caminho), img = $("#foto-img"), video = $("#foto-video");
  img.hidden = vid; video.hidden = !vid;
  if (vid) { img.removeAttribute("src"); video.src = urlFoto(f.caminho); video.play?.().catch(() => {}); }
  else { video.pause(); video.removeAttribute("src"); img.src = urlFoto(f.caminho); img.alt = `${atual.titulo}, ${T("foto", "photo")} ${fotoI + 1}`; }
  $("#foto-conta").textContent = `${fotoI + 1} / ${fs.length}`;
  $("#foto-ant").hidden = $("#foto-prox").hidden = fs.length < 2;
}
$("#l-fotos").addEventListener("click", (e) => {
  const a = e.target.closest("a[data-i]");
  if (!a) return;
  e.preventDefault();
  mostrarFoto(+a.dataset.i);
  caixa.showModal();
});
$("#foto-fechar").addEventListener("click", () => caixa.close());
caixa.addEventListener("close", () => $("#foto-video").pause());
$("#foto-ant").addEventListener("click", () => mostrarFoto(fotoI - 1));
$("#foto-prox").addEventListener("click", () => mostrarFoto(fotoI + 1));
caixa.addEventListener("click", (e) => { if (e.target === caixa || e.target.classList.contains("ampliada-palco")) caixa.close(); });
caixa.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") mostrarFoto(fotoI - 1);
  if (e.key === "ArrowRight") mostrarFoto(fotoI + 1);
});

// ---------- início ----------
$("#mais").addEventListener("click", () => carregarLista(false));
window.addEventListener("hashchange", rota);
(async () => {
  if (db) {
    await lerSessao();
    db.auth.onAuthStateChange((_ev, sessao) => aplicarSessao(sessao));
  }
  await rota();
})();
