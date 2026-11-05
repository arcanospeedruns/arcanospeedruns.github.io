/* =========================================================
   Grade distorcida no fundo da página de portfólio.
   Uma malha de linhas que ondula como tecido: duas ondas largas
   atravessam a tela e dois redemoinhos passeiam devagar, torcendo
   as linhas em volta deles. Cada linha tem muitos pontos, então
   as dobras saem em curvas suaves.
   ========================================================= */
(() => {
  const canvas = document.getElementById("grade");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0;
  function redimensionar() {
    const dpr = Math.min(window.devicePixelRatio || 1, matchMedia("(hover: none), (pointer: coarse)").matches ? 1.5 : 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // no celular: um pouco menos de pontos por linha e 24 quadros por segundo
  const toque = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const DENS = toque ? 24 : 18;

  // valores que valem para o quadro inteiro (não para cada ponto)
  let m = 1, amp = 0, t = 0, c1x = 0, c1y = 0, r1 = 1, f1 = 0, c2x = 0, c2y = 0, r2 = 1, f2 = 0;
  function prepararQuadro(tt) {
    t = tt;
    m = Math.max(W, H);
    amp = m * 0.022;
    c1x = W * (0.5 + 0.32 * Math.sin(t * 0.23)); c1y = H * (0.5 + 0.28 * Math.sin(t * 0.31 + 1.1));
    c2x = W * (0.5 + 0.30 * Math.cos(t * 0.19 + 2.0)); c2y = H * (0.5 + 0.30 * Math.cos(t * 0.27));
    r1 = (m * 0.3) ** 2; f1 = 0.9 * Math.sin(t * 0.4) + 0.5;
    r2 = (m * 0.24) ** 2; f2 = -0.7 * Math.cos(t * 0.35) - 0.3;
  }

  // ondas largas, como um tecido balançando, e dois redemoinhos que passeiam pela tela
  // (cada redemoinho gira os pontos em volta do centro, forte no meio e sumindo para fora)
  let px = 0, py = 0;
  function deformar(x, y) {
    px = x + amp * Math.sin(y / (m * 0.16) + t * 0.9) + amp * 0.6 * Math.sin((x + y) / (m * 0.23) - t * 0.6);
    py = y + amp * Math.sin(x / (m * 0.19) - t * 0.75) + amp * 0.6 * Math.cos((x - y) / (m * 0.27) + t * 0.5);
    let dx = px - c1x, dy = py - c1y;
    let k = Math.exp(-(dx * dx + dy * dy) / r1), a = f1 * k, c = Math.cos(a), s = Math.sin(a), inc = 1 + 0.18 * k;
    px = c1x + (dx * c - dy * s) * inc; py = c1y + (dx * s + dy * c) * inc;
    dx = px - c2x; dy = py - c2y;
    k = Math.exp(-(dx * dx + dy * dy) / r2); a = f2 * k; c = Math.cos(a); s = Math.sin(a); inc = 1 + 0.18 * k;
    px = c2x + (dx * c - dy * s) * inc; py = c2y + (dx * s + dy * c) * inc;
  }

  function linha(x0, y0, x1, y1, n) {
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      deformar(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f);
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
  }

  function desenhar(seg) {
    prepararQuadro(seg * 0.32);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(170, 195, 235, 0.14)";
    ctx.lineWidth = 1;
    const passo = Math.max(44, Math.min(W, H) / 12);
    const margem = passo * 3;
    // um ponto a cada ~18 px deixa as curvas lisas; todas as linhas num traço só
    const nV = Math.ceil((H + 2 * margem) / DENS);
    const nH = Math.ceil((W + 2 * margem) / DENS);
    ctx.beginPath();
    for (let x = -margem; x <= W + margem; x += passo) linha(x, -margem, x, H + margem, nV);
    for (let y = -margem; y <= H + margem; y += passo) linha(-margem, y, W + margem, y, nH);
    ctx.stroke();
  }

  redimensionar();
  window.addEventListener("resize", () => { redimensionar(); desenhar(performance.now() / 1000); });

  if (reduzir) { desenhar(8); return; }
  let ultimo = 0;
  function quadro(ms) {
    requestAnimationFrame(quadro);
    if (ms - ultimo < (toque ? 41 : 33)) return; // ~30 quadros por segundo (24 no celular)
    ultimo = ms;
    desenhar(ms / 1000);
  }
  // o navegador pausa sozinho quando a aba não está visível
  requestAnimationFrame(quadro);
})();
