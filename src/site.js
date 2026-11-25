// Abertura: a imagem troca sozinha entre as quatro imagens e abre o projeto que está na tela.
// Cada projeto tem endereço próprio (#psique, #ruela, #twenty-one-pilots); a Psiquê tem duas abas,
// #psique (app) e #psique-identidade, e o antigo #psique-app continua abrindo o app.
// O botão voltar do navegador fecha, e o link pode ser mandado direto para alguém.
// A classe "js" no <html> é posta no <head> (base.njk), antes de a página aparecer.
(function () {
  var ids = ["psique", "psique-identidade", "ruela", "twenty-one-pilots"]; // uma por imagem da abertura
  // endereço -> [painel, aba]
  var ROTAS = { "psique": ["psique", "aba-app"], "psique-app": ["psique", "aba-app"], "psique-identidade": ["psique", "aba-identidade"], "ruela": ["ruela"], "twenty-one-pilots": ["twenty-one-pilots"] };
  var slides = document.querySelectorAll(".slide");
  var nomes = document.querySelectorAll(".projetos a");
  var moldura = document.querySelector(".moldura");
  var rotulos = JSON.parse(moldura.getAttribute("data-rotulos"));
  var paineis = document.querySelectorAll(".projeto");
  var fundo = document.querySelectorAll(".abertura"); // o que fica atrás do painel
  var parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var atual = 0, timer = null, aberto = null, pausa = false, visivel = true, trocas = 0;
  var INTERVALO = 4500;

  // ---------- troca das imagens ----------
  // as imagens 2 a 4 só baixam depois que a página terminou de carregar
  // e só se a imagem estiver na tela (no celular ela fica abaixo do nome)
  var pronto = false;
  function carregarSlides() {
    if (!pronto || !visivel) return;
    document.querySelectorAll(".slide img[data-srcset]").forEach(function (img) {
      img.srcset = img.getAttribute("data-srcset");
      img.removeAttribute("data-srcset");
    });
  }
  function aoCarregar() { pronto = true; carregarSlides(); }
  if (document.readyState === "complete") setTimeout(aoCarregar, 0);
  else window.addEventListener("load", aoCarregar);

  function mostrar(i) {
    atual = i;
    slides.forEach(function (s, k) { s.classList.toggle("atual", k === i); });
    nomes.forEach(function (n) { n.classList.toggle("atual", ROTAS[ids[i]][0] === n.getAttribute("href").slice(1)); });
    moldura.href = "#" + ids[i];
    moldura.setAttribute("aria-label", rotulos[i]);
  }
  // dá uma volta pelos quatro projetos e para no primeiro; só gira com a imagem na tela
  function girar() {
    clearInterval(timer);
    if (parado || trocas >= ids.length) return;
    timer = setInterval(function () {
      if (aberto || pausa || !visivel || document.hidden) return;
      trocas++;
      mostrar((atual + 1) % ids.length);
      if (trocas >= ids.length) clearInterval(timer);
    }, INTERVALO);
  }
  if ("IntersectionObserver" in window) {
    visivel = false;
    new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; carregarSlides(); }, { threshold: 0.5 }).observe(moldura);
  }
  // com o mouse na imagem ou na lista, ou o foco de teclado nelas, a troca para
  [moldura, document.querySelector(".projetos")].forEach(function (el) {
    el.addEventListener("mouseenter", function () { pausa = true; });
    el.addEventListener("mouseleave", function () { pausa = false; });
    el.addEventListener("focusin", function (e) { pausa = e.target.matches(":focus-visible"); });
    el.addEventListener("focusout", function () { pausa = false; });
  });
  nomes.forEach(function (n) {
    var i = Number(n.getAttribute("data-slide"));
    n.addEventListener("mouseenter", function () { mostrar(i); });
    n.addEventListener("focus", function () { mostrar(i); });
  });

  // ---------- área do projeto ----------
  function focarTitulo(painel) {
    var titulo = painel.querySelector("h2");
    if (titulo) titulo.focus({ preventScroll: true });
  }
  // ---------- abas (Psiquê) ----------
  function escolherAba(aba, focar) {
    var lista = aba.parentNode;
    lista.querySelectorAll('[role="tab"]').forEach(function (t) {
      var esta = t === aba;
      t.setAttribute("aria-selected", String(esta));
      t.tabIndex = esta ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !esta;
    });
    if (focar) aba.focus();
  }
  document.querySelectorAll('[role="tab"]').forEach(function (aba) {
    aba.addEventListener("click", function () {
      escolherAba(aba);
      history.replaceState(history.state, "", "#" + aba.getAttribute("data-hash"));
      mostrar(ids.indexOf(aba.getAttribute("data-hash")));
    });
    aba.addEventListener("keydown", function (e) {
      var todas = Array.prototype.slice.call(aba.parentNode.querySelectorAll('[role="tab"]'));
      var k = todas.indexOf(aba), alvo = null;
      if (e.key === "ArrowRight") alvo = todas[(k + 1) % todas.length];
      if (e.key === "ArrowLeft") alvo = todas[(k - 1 + todas.length) % todas.length];
      if (e.key === "Home") alvo = todas[0];
      if (e.key === "End") alvo = todas[todas.length - 1];
      if (alvo) { e.preventDefault(); alvo.click(); alvo.focus(); }
    });
  });

  function abrir(rota) {
    var r = ROTAS[rota], painel = r && document.getElementById(r[0]);
    if (!painel) return fechar();
    if (r[1]) escolherAba(document.getElementById(r[1]));
    var i = ids.indexOf(rota); mostrar(i < 0 ? 0 : i);
    if (aberto === painel) return;
    paineis.forEach(function (p) {
      var este = p === painel;
      if (!este) { p.classList.remove("aberto", "montado", "rolou"); }
      p.inert = !este;
    });
    fundo.forEach(function (el) { el.inert = true; });
    // "montado" tira o display:none (as imagens só baixam agora); "aberto" faz subir
    painel.classList.add("montado");
    painel.scrollTop = 0;
    void painel.offsetHeight;
    painel.classList.add("aberto");
    aberto = painel;
    document.body.classList.add("travado");
    focarTitulo(painel);
  }
  function fechar() {
    var era = aberto;
    paineis.forEach(function (p) { p.classList.remove("aberto"); p.inert = true; });
    fundo.forEach(function (el) { el.inert = false; });
    document.body.classList.remove("travado");
    aberto = null;
    if (era) {
      var link = document.querySelector('.projetos a[href="#' + era.id + '"]');
      if (link) link.focus({ preventScroll: true });
      var fim = function () { if (!era.classList.contains("aberto")) era.classList.remove("montado", "rolou"); };
      parado ? fim() : setTimeout(fim, 650);
    }
  }
  function pelaUrl() {
    var id = location.hash.slice(1);
    if (id) abrir(id); else fechar();
  }
  // voltar à abertura: se esta entrada do histórico foi criada pelo site, volta nele
  // (o Voltar do navegador não reabre o projeto); se a pessoa chegou pelo link, só limpa o endereço
  function voltar() {
    if (!aberto) return;
    if (history.state && history.state.site) history.back();
    else { history.replaceState(null, "", location.pathname + location.search); fechar(); }
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // nova aba etc.
    var a = e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href");
    if (href === "#") { e.preventDefault(); voltar(); return; }
    if (href && href.charAt(0) === "#" && ROTAS[href.slice(1)]) {
      e.preventDefault();
      if (aberto) history.replaceState(history.state, "", href);
      else history.pushState({ site: true }, "", href);
      abrir(href.slice(1));
    }
  });
  document.addEventListener("keydown", function (e) {
    if (!aberto) return;
    if (e.key === "Escape") { voltar(); return; }
    // o Tab circula dentro do projeto aberto: Fechar, Próximo, Fechar...
    if (e.key === "Tab") {
      var focaveis = aberto.querySelectorAll("a[href], button:not([disabled])");
      if (!focaveis.length) return;
      var primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
      var ativo = document.activeElement;
      var noMeio = aberto.contains(ativo) && ativo !== primeiro && ativo !== ultimo && ativo.tagName !== "H2";
      if (noMeio) return;
      e.preventDefault();
      if (e.shiftKey) (ativo === ultimo ? (focaveis[focaveis.length - 2] || primeiro) : ultimo).focus();
      else (ativo === primeiro ? (focaveis[1] || ultimo) : primeiro).focus();
    }
  });
  window.addEventListener("popstate", pelaUrl);
  window.addEventListener("hashchange", pelaUrl);
  // link direto: o navegador foca o alvo do endereço depois do script; o foco volta para o título
  window.addEventListener("load", function () {
    setTimeout(function () { if (aberto && !aberto.contains(document.activeElement) || (aberto && document.activeElement === aberto)) focarTitulo(aberto); }, 50);
  });

  paineis.forEach(function (p) {
    p.inert = true;
    p.setAttribute("role", "dialog");
    p.setAttribute("aria-modal", "true");
    p.addEventListener("scroll", function () { p.classList.toggle("rolou", p.scrollTop > 240); }, { passive: true });
  });
  mostrar(0);
  girar();
  pelaUrl();
})();
