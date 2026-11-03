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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // um redemoinho: gira os pontos em volta de (cx, cy), forte no centro e sumindo para fora
  function girar(x, y, cx, cy, raio, forca) {
    const dx = x - cx, dy = y - cy;
    const k = Math.exp(-(dx * dx + dy * dy) / (raio * raio));
    const a = forca * k;
    const c = Math.cos(a), s = Math.sin(a);
    const inchar = 1 + 0.18 * k;
    return [cx + (dx * c - dy * s) * inchar, cy + (dx * s + dy * c) * inchar];
  }

  function deformar(x, y, t) {
    const m = Math.max(W, H);
    // ondas largas, como um tecido balançando
    const amp = m * 0.022;
    let px = x + amp * Math.sin(y / (m * 0.16) + t * 0.9) + amp * 0.6 * Math.sin((x + y) / (m * 0.23) - t * 0.6);
    let py = y + amp * Math.sin(x / (m * 0.19) - t * 0.75) + amp * 0.6 * Math.cos((x - y) / (m * 0.27) + t * 0.5);
    // dois redemoinhos que passeiam pela tela
    const c1x = W * (0.5 + 0.32 * Math.sin(t * 0.23)), c1y = H * (0.5 + 0.28 * Math.sin(t * 0.31 + 1.1));
    const c2x = W * (0.5 + 0.30 * Math.cos(t * 0.19 + 2.0)), c2y = H * (0.5 + 0.30 * Math.cos(t * 0.27));
    [px, py] = girar(px, py, c1x, c1y, m * 0.3, 0.9 * Math.sin(t * 0.4) + 0.5);
    [px, py] = girar(px, py, c2x, c2y, m * 0.24, -0.7 * Math.cos(t * 0.35) - 0.3);
    return [px, py];
  }

  function linha(x0, y0, x1, y1, t, n) {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      const [px, py] = deformar(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, t);
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }

  function desenhar(seg) {
    const t = seg * 0.32;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(170, 195, 235, 0.14)";
    ctx.lineWidth = 1;
    const passo = Math.max(44, Math.min(W, H) / 12);
    const margem = passo * 3;
    // um ponto a cada ~18 px deixa as curvas lisas
    const nV = Math.ceil((H + 2 * margem) / 18);
    const nH = Math.ceil((W + 2 * margem) / 18);
    for (let x = -margem; x <= W + margem; x += passo) linha(x, -margem, x, H + margem, t, nV);
    for (let y = -margem; y <= H + margem; y += passo) linha(-margem, y, W + margem, y, t, nH);
  }

  redimensionar();
  window.addEventListener("resize", () => { redimensionar(); desenhar(performance.now() / 1000); });

  if (reduzir) { desenhar(8); return; }
  let ultimo = 0;
  function quadro(ms) {
    requestAnimationFrame(quadro);
    if (ms - ultimo < 33) return; // ~30 quadros por segundo
    ultimo = ms;
    desenhar(ms / 1000);
  }
  // o navegador pausa sozinho quando a aba não está visível
  requestAnimationFrame(quadro);
})();
