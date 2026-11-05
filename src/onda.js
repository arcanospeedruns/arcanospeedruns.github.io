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

  // data-tela-cheia: a onda ocupa a tela toda (página de contato), com mais linhas
  const cheia = canvas.hasAttribute("data-tela-cheia");
  const LINHAS = cheia ? (toque ? 52 : 44) : (toque ? 32 : 24);
  // cor dos pontos vem do CSS (--onda-cor: "r,g,b"), padrão preto
  const corPonto = (getComputedStyle(document.body).getPropertyValue("--onda-cor") || "0,0,0").trim() || "0,0,0";
  let W = 0, H = 0, dpr = 1, COLS = 100;

  function redimensionar() {
    dpr = Math.min(window.devicePixelRatio || 1, toque ? 1.5 : 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    COLS = Math.max(56, Math.min(160, Math.round(W / (toque ? 6 : 10))));
    if (typeof prepararColunas === "function") prepararColunas();
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
  let ultimoQuadro = 0;
  // no celular e na tela cheia, 30 quadros por segundo bastam para a onda e poupam bateria
  const INTERVALO = toque || cheia ? 32 : 0;

  // tudo que não muda entre quadros é calculado uma vez só (por linha e por coluna)
  const subida = cheia ? 0.95 : 0.58;
  const linhas = [];
  for (let j = LINHAS - 1; j >= 0; j--) {
    const z = (j / (LINHAS - 1)) * 1.3 - 0.3;
    const zc = Math.max(0, z);
    const alfa = 0.9 - zc * 0.62;
    linhas.push({
      z, zc,
      escala: toque ? 1.75 - zc * 0.95 : 1.32 - zc * 0.57,
      tam: 2.3 - zc * 1.4,
      cor: `rgba(${corPonto},${alfa})`,
      corCrista: `rgba(${corPonto},${Math.min(1, alfa + 0.15)})`,
      // sin(a + b) = sin a·cos b + cos a·sin b: a parte de cada linha (b) é fixa
      sb1: Math.sin(z * 2.2), cb1: Math.cos(z * 2.2),
      sb2: Math.sin(z * 4.1), cb2: Math.cos(z * 4.1),
      sb3: Math.sin(-z * 1.5), cb3: Math.cos(-z * 1.5),
      rip: 1 - z * 0.5,
      sx: null,
    });
  }
  let xw = new Float32Array(0), s1 = xw, c1 = xw, s2 = xw, c2 = xw, s3 = xw, c3 = xw, rp = xw;

  function prepararColunas() {
    xw = new Float32Array(COLS);
    s1 = new Float32Array(COLS); c1 = new Float32Array(COLS);
    s2 = new Float32Array(COLS); c2 = new Float32Array(COLS);
    s3 = new Float32Array(COLS); c3 = new Float32Array(COLS);
    rp = new Float32Array(COLS);
    for (let i = 0; i < COLS; i++) xw[i] = (i / (COLS - 1)) * 2 - 1;
    for (const L of linhas) {
      L.sx = new Float32Array(COLS);
      for (let i = 0; i < COLS; i++) L.sx[i] = W / 2 + xw[i] * (W / 2) * L.escala;
    }
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

    // parte de cada coluna neste quadro
    const e = energia, kr = e * (toque ? 0.55 : 0.85), k2 = 0.22 * (0.5 + e), ganho = 0.3 + e * 0.85;
    for (let i = 0; i < COLS; i++) {
      const x = xw[i];
      const a1 = x * 3.1 + fase, a2 = x * 7.3 - fase * 1.4, a3 = x * 1.3 + fase * 0.6;
      s1[i] = Math.sin(a1); c1[i] = Math.cos(a1);
      s2[i] = Math.sin(a2); c2[i] = Math.cos(a2);
      s3[i] = Math.sin(a3); c3[i] = Math.cos(a3);
      // ondulação que nasce na posição do cursor
      const d = x - mxSuave;
      rp[i] = Math.exp((-d * d) / 0.06) * Math.cos(d * 13 - t * 6) * kr;
    }

    ctx.clearRect(0, 0, W, H);

    for (const L of linhas) {
      const z = L.z, zc = L.zc;
      const base = z >= 0 ? H * (0.97 - Math.pow(z, 0.85) * subida) : H * (0.97 - z * 0.75);
      const amp = (cheia ? H * 0.08 : H * 0.2) * (1 - zc * 0.55) * ganho;
      const s = L.tam, sc = s * 1.25, sx = L.sx;
      // pontos comuns num desenho só, cristas em outro
      ctx.beginPath();
      let cristas = null;
      for (let i = 0; i < COLS; i++) {
        const x = sx[i];
        if (x < -4 || x > W + 4) continue;
        const h =
          (s1[i] * L.cb1 + c1[i] * L.sb1) * 0.55 +
          (s2[i] * L.cb2 + c2[i] * L.sb2) * k2 +
          (s3[i] * L.cb3 + c3[i] * L.sb3) * 0.3 +
          rp[i] * L.rip;
        const y = base - h * amp;
        if (h * ganho > 0.45) (cristas || (cristas = [])).push(x, y);
        else ctx.rect(x - s / 2, y - s / 2, s, s);
      }
      ctx.fillStyle = L.cor;
      ctx.fill();
      if (cristas) {
        ctx.beginPath();
        for (let k = 0; k < cristas.length; k += 2) ctx.rect(cristas[k] - sc / 2, cristas[k + 1] - sc / 2, sc, sc);
        ctx.fillStyle = L.corCrista;
        ctx.fill();
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
  const seguir = (agora) => {
    if (!visivel) { rodando = false; return; }
    if (INTERVALO && agora - ultimoQuadro < INTERVALO) { requestAnimationFrame(seguir); return; }
    ultimoQuadro = agora;
    quadro(agora);
  };
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel && !rodando) { rodando = true; antes = performance.now(); requestAnimationFrame(seguir); }
    }).observe(canvas);
  }
  visivelOuNao = seguir;
  requestAnimationFrame(seguir);
})();
