// Abertura: a imagem troca sozinha entre os três trabalhos e abre o que está na tela.
// Cada projeto tem endereço próprio (#psique, #ruela, #twenty-one-pilots): o botão
// voltar do navegador fecha, e o link pode ser mandado direto para alguém.
// A classe "js" no <html> é posta no <head> (base.njk), antes de a página aparecer.
(function () {
  var ids = ["psique", "ruela", "twenty-one-pilots"];
  var slides = document.querySelectorAll(".slide");
  var nomes = document.querySelectorAll(".projetos a");
  var moldura = document.querySelector(".moldura");
  var rotulos = JSON.parse(moldura.getAttribute("data-rotulos"));
  var paineis = document.querySelectorAll(".projeto");
  var fundo = document.querySelectorAll(".abertura"); // o que fica atrás do painel
  var parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var atual = 0, timer = null, aberto = null, pausa = false, abertoAqui = false;
  var INTERVALO = 4500;

  // ---------- troca das imagens ----------
  function mostrar(i) {
    atual = i;
    slides.forEach(function (s, k) { s.classList.toggle("atual", k === i); });
    nomes.forEach(function (n, k) { n.classList.toggle("atual", k === i); });
    moldura.href = "#" + ids[i];
    moldura.setAttribute("aria-label", rotulos[i]);
  }
  function girar() {
    clearInterval(timer);
    if (parado) return;
    timer = setInterval(function () {
      if (!aberto && !pausa && !document.hidden) mostrar((atual + 1) % ids.length);
    }, INTERVALO);
  }
  // com o mouse ou o foco na imagem ou na lista, a troca para: quem clica abre o que está vendo
  [moldura, document.querySelector(".projetos")].forEach(function (el) {
    el.addEventListener("mouseenter", function () { pausa = true; });
    el.addEventListener("mouseleave", function () { pausa = false; girar(); });
    el.addEventListener("focusin", function () { pausa = true; });
    el.addEventListener("focusout", function () { pausa = false; girar(); });
  });
  nomes.forEach(function (n) {
    var i = Number(n.getAttribute("data-slide"));
    n.addEventListener("mouseenter", function () { mostrar(i); });
    n.addEventListener("focus", function () { mostrar(i); });
  });

  // ---------- área do projeto ----------
  function abrir(id) {
    var painel = document.getElementById(id);
    if (!painel || ids.indexOf(id) < 0) return fechar();
    paineis.forEach(function (p) {
      var este = p === painel;
      if (!este) { p.classList.remove("aberto", "montado"); }
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
    mostrar(ids.indexOf(id));
    var titulo = painel.querySelector("h2");
    if (titulo) titulo.focus({ preventScroll: true });
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
      var fim = function () { if (!era.classList.contains("aberto")) era.classList.remove("montado"); };
      parado ? fim() : setTimeout(fim, 650);
    }
  }
  function pelaUrl() {
    var id = location.hash.slice(1);
    if (id) abrir(id); else fechar();
  }
  // voltar à abertura: se o projeto foi aberto aqui, volta no histórico (o Voltar não reabre);
  // se a pessoa chegou pelo link direto, só limpa o endereço
  function voltar() {
    if (!aberto) return;
    if (abertoAqui) { abertoAqui = false; history.back(); }
    else { history.replaceState(null, "", location.pathname + location.search); fechar(); }
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href");
    if (href === "#") { e.preventDefault(); voltar(); return; }
    if (href && href.charAt(0) === "#" && ids.indexOf(href.slice(1)) >= 0) {
      e.preventDefault();
      if (aberto) history.replaceState(null, "", href); else { history.pushState(null, "", href); abertoAqui = true; }
      abrir(href.slice(1));
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && aberto) voltar();
  });
  window.addEventListener("popstate", function () { if (!location.hash) abertoAqui = false; pelaUrl(); });
  window.addEventListener("hashchange", pelaUrl);

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
