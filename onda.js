/* =========================================================
   Onda de pontos no fundo do topo da página (atrás do texto).
   Desktop: ela ganha energia conforme o mouse se move, e uma
   ondulação nasce na posição horizontal do cursor.
   Celular: ela se mexe sozinha o tempo todo.
   ========================================================= */
(() => {
  const canvas = document.getElementById("onda");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toque = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  const LINHAS = toque ? 32 : 24;
  // cor dos pontos vem do CSS (--onda-cor: "r,g,b"), padrão preto
  const corPonto = (getComputedStyle(document.body).getPropertyValue("--onda-cor") || "0,0,0").trim() || "0,0,0";
  let W = 0, H = 0, dpr = 1, COLS = 100;

  function redimensionar() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    COLS = Math.max(56, Math.min(160, Math.round(W / (toque ? 6 : 10))));
  }

  // estado do cursor
  let mx = 0;             // posição do cursor, de -1 (esquerda) a 1 (direita)
  let mxSuave = 0;
  let energia = toque ? 0.6 : 0.12;
  let ultimoX = null, ultimoT = 0;

  if (!toque && !reduzir) {
    window.addEventListener("pointermove", (e) => {
      const agora = performance.now();
      if (ultimoX !== null) {
        const dt = Math.max(agora - ultimoT, 8);
        const vel = Math.abs(e.clientX - ultimoX) / dt + Math.abs(e.movementY || 0) / dt * 0.5;
        energia = Math.min(1.3, energia + vel * 0.06);
      }
      ultimoX = e.clientX;
      ultimoT = agora;
      mx = (e.clientX / window.innerWidth) * 2 - 1;
    }, { passive: true });
  }

  let fase = 0;
  let visivelOuNao = (a) => quadro(a);
  let antes = performance.now();

  function altura(xw, z, t, e, cx) {
    let h =
      Math.sin(xw * 3.1 + fase + z * 2.2) * 0.55 +
      Math.sin(xw * 7.3 - fase * 1.4 + z * 4.1) * 0.22 * (0.5 + e) +
      Math.sin(xw * 1.3 + fase * 0.6 - z * 1.5) * 0.3;
    // ondulação que nasce na posição do cursor
    const d = xw - cx;
    h += Math.exp((-d * d) / 0.06) * Math.cos(d * 13 - t * 6) * e * (toque ? 0.55 : 0.85) * (1 - z * 0.5);
    return h * (0.3 + e * 0.85);
  }

  function quadro(agora) {
    const dt = Math.min((agora - antes) / 1000, 0.05);
    antes = agora;
    const t = agora / 1000;

    if (toque) {
      // no celular: movimento constante, com a ondulação passeando
      energia = 0.55 + 0.2 * Math.sin(t * 0.7);
      mx = Math.sin(t * 0.35) * 0.75;
    } else {
      energia += (0.1 - energia) * Math.min(1, dt * 1.6); // perde energia quando o mouse para
    }
    mxSuave += (mx - mxSuave) * Math.min(1, dt * 6);
    fase += dt * (0.25 + energia * 2.6);

    ctx.clearRect(0, 0, W, H);

    for (let j = LINHAS - 1; j >= 0; j--) {
      // z vai de 1 (fundo) até um pouco abaixo de 0, para a frente passar da borda e não deixar buracos
      const z = (j / (LINHAS - 1)) * 1.3 - 0.3;
      const zc = Math.max(0, z);
      const escala = toque ? 1.75 - zc * 0.95 : 1.32 - zc * 0.57; // a frente é mais larga que a tela
      const base = z >= 0 ? H * (0.97 - Math.pow(z, 0.85) * 0.58) : H * (0.97 - z * 0.75);
      const amp = H * 0.2 * (1 - zc * 0.55);
      const tam = 2.3 - zc * 1.4;
      const alfa = 0.9 - zc * 0.62;

      for (let i = 0; i < COLS; i++) {
        const xw = (i / (COLS - 1)) * 2 - 1;
        const h = altura(xw, z, t, energia, mxSuave);
        const sx = W / 2 + xw * (W / 2) * escala;
        if (sx < -4 || sx > W + 4) continue;
        const sy = base - h * amp;
        const crista = h > 0.45;
        ctx.fillStyle = `rgba(${corPonto},${crista ? Math.min(1, alfa + 0.15) : alfa})`;
        const s = crista ? tam * 1.25 : tam;
        ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
      }

    }

    if (!reduzir) requestAnimationFrame(visivelOuNao);
  }

  redimensionar();
  // acompanha o tamanho do topo (muda com a largura da tela e quando as fontes carregam)
  if ("ResizeObserver" in window) new ResizeObserver(() => { redimensionar(); if (reduzir) quadro(performance.now()); }).observe(canvas);
  else window.addEventListener("resize", redimensionar);

  if (reduzir) { energia = 0.4; quadro(performance.now()); return; }

  // só anima enquanto o topo está visível na tela
  let visivel = true, rodando = true;
  const seguir = (agora) => { if (!visivel) { rodando = false; return; } quadro(agora); };
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel && !rodando) { rodando = true; antes = performance.now(); requestAnimationFrame(seguir); }
    }).observe(canvas);
  }
  visivelOuNao = seguir;
  requestAnimationFrame(seguir);
})();
