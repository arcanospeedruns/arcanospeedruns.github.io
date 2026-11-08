/* Galeria das páginas de projeto: miniaturas que abrem ampliadas.
   Cada <a> dentro de .pranchas vira um item. Sem JavaScript, o link
   continua abrindo a imagem sozinha. */
(() => {
  const itens = [...document.querySelectorAll(".pranchas figure")];
  if (!itens.length || typeof HTMLDialogElement !== "function") return;

  const en = document.documentElement.lang.startsWith("en");
  const T = en
    ? { caixa: "Enlarged image", real: "FULL SIZE", fechar: "CLOSE ✕", fecharAria: "Close", ant: "Previous image", prox: "Next image" }
    : { caixa: "Imagem ampliada", real: "TAMANHO REAL", fechar: "FECHAR ✕", fecharAria: "Fechar", ant: "Imagem anterior", prox: "Próxima imagem" };
  const caixa = document.createElement("dialog");
  caixa.className = "ampliada";
  caixa.setAttribute("aria-label", T.caixa);
  caixa.innerHTML = `
    <div class="ampliada-topo mono">
      <span class="ampliada-conta"></span>
      <div>
        <a class="ampliada-abrir" href="#" target="_blank" rel="noopener">${T.real}</a>
        <button type="button" class="ampliada-fechar" aria-label="${T.fecharAria}">${T.fechar}</button>
      </div>
    </div>
    <div class="ampliada-palco">
      <button type="button" class="ampliada-seta ant" aria-label="${T.ant}">←</button>
      <img alt="">
      <button type="button" class="ampliada-seta prox" aria-label="${T.prox}">→</button>
    </div>
    <p class="ampliada-legenda"></p>`;
  document.body.appendChild(caixa);

  const img = caixa.querySelector("img");
  const legenda = caixa.querySelector(".ampliada-legenda");
  const conta = caixa.querySelector(".ampliada-conta");
  const abrir = caixa.querySelector(".ampliada-abrir");
  let atual = 0;

  function mostrar(i) {
    atual = (i + itens.length) % itens.length;
    const fig = itens[atual];
    const link = fig.querySelector("a");
    const mini = fig.querySelector("img");
    img.src = link.getAttribute("href");
    img.alt = mini.alt;
    abrir.href = link.getAttribute("href");
    legenda.innerHTML = fig.querySelector("figcaption")?.innerHTML || "";
    conta.textContent = `${String(atual + 1).padStart(2, "0")} / ${String(itens.length).padStart(2, "0")}`;
  }

  itens.forEach((fig, i) => {
    fig.querySelector("a").addEventListener("click", (e) => {
      e.preventDefault();
      mostrar(i);
      caixa.showModal();
    });
  });

  caixa.querySelector(".ant").addEventListener("click", () => mostrar(atual - 1));
  caixa.querySelector(".prox").addEventListener("click", () => mostrar(atual + 1));
  caixa.querySelector(".ampliada-fechar").addEventListener("click", () => caixa.close());
  // clicar fora da imagem fecha
  caixa.addEventListener("click", (e) => {
    if (e.target === caixa || e.target.classList.contains("ampliada-palco")) caixa.close();
  });
  caixa.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") mostrar(atual - 1);
    if (e.key === "ArrowRight") mostrar(atual + 1);
  });
})();
