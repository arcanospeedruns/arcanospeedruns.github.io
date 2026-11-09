/* Gaveta de detalhes do portfólio.
   Os cartões e o conteúdo de cada projeto já vêm prontos no HTML (gerados a partir
   de src/_data/projetos.cjs); aqui só abrimos e fechamos a gaveta. */
const grade = document.getElementById("projetos");
const gaveta = document.querySelector(".gaveta");

function abrir(id) {
  const modelo = id && document.getElementById("detalhe-" + id);
  if (!modelo) return;
  gaveta.replaceChildren(modelo.content.cloneNode(true));
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
