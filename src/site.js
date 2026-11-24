// Abertura: a imagem troca sozinha entre os três trabalhos e abre o que está na tela.
// Cada projeto tem endereço próprio (#psique, #ruela, #twenty-one-pilots): o botão
// voltar do navegador fecha, e o link pode ser mandado direto para alguém.
(function () {
  var raiz = document.documentElement;
  raiz.classList.add("js");

  var ids = ["psique", "ruela", "twenty-one-pilots"];
  var slides = document.querySelectorAll(".slide");
  var nomes = document.querySelectorAll(".projetos a");
  var moldura = document.querySelector(".moldura");
  var rotulos = JSON.parse(moldura.getAttribute("data-rotulos"));
  var paineis = document.querySelectorAll(".projeto");
  var parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var atual = 0, timer = null, aberto = null, origem = null;

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
    timer = setInterval(function () { if (!aberto) mostrar((atual + 1) % ids.length); }, 2600);
  }

  nomes.forEach(function (n) {
    var i = Number(n.getAttribute("data-slide"));
    n.addEventListener("mouseenter", function () { mostrar(i); girar(); });
    n.addEventListener("focus", function () { mostrar(i); girar(); });
  });

  function abrir(id) {
    var painel = document.getElementById(id);
    if (!painel || ids.indexOf(id) < 0) return fechar();
    if (!aberto) origem = document.activeElement;
    paineis.forEach(function (p) { p.classList.toggle("aberto", p === painel); p.inert = p !== painel; });
    painel.scrollTop = 0;
    aberto = painel;
    document.body.classList.add("travado");
    mostrar(ids.indexOf(id));
    var titulo = painel.querySelector("h2");
    if (titulo) titulo.focus({ preventScroll: true });
  }
  function fechar() {
    paineis.forEach(function (p) { p.classList.remove("aberto"); p.inert = true; });
    document.body.classList.remove("travado");
    if (aberto && origem) origem.focus({ preventScroll: true });
    aberto = null;
  }
  function pelaUrl() {
    var id = location.hash.slice(1);
    if (id) abrir(id); else fechar();
  }

  // "Fechar" e o nome no rodapé voltam para a abertura sem deixar # no endereço
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href="#"]');
    if (!a) return;
    e.preventDefault();
    history.pushState(null, "", location.pathname + location.search);
    fechar();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && aberto) {
      history.pushState(null, "", location.pathname + location.search);
      fechar();
    }
  });
  window.addEventListener("hashchange", pelaUrl);
  window.addEventListener("popstate", pelaUrl);

  paineis.forEach(function (p) { p.inert = true; });
  mostrar(0);
  girar();
  pelaUrl();
})();
