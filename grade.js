/* =========================================================
   Grade distorcida no fundo da página de portfólio.
   Uma malha de linhas que se torce e incha em volta de um ponto
   que passeia bem devagar (um ciclo completo leva vários minutos).
   As linhas têm poucos pontos, o que deixa as dobras "facetadas".
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

  // distorce um ponto (x, y) da grade: gira e empurra para fora perto do centro móvel
  function deformar(x, y, t) {
    const m = Math.max(W, H);
    const cx = W * (0.5 + 0.18 * Math.sin(t * 0.21));
    const cy = H * (0.5 + 0.14 * Math.sin(t * 0.17 + 1.3));
    const dx = x - cx, dy = y - cy;
    const r2 = (dx * dx + dy * dy) / (m * m);
    const k = Math.exp(-r2 / 0.22);                 // influência: forte no centro, some nas bordas
    const giro = (0.75 + 0.25 * Math.sin(t * 0.13)) * k;
    const inchar = 1 + 0.28 * k;
    const c = Math.cos(giro), s = Math.sin(giro);
    return [cx + (dx * c - dy * s) * inchar, cy + (dx * s + dy * c) * inchar];
  }

  function desenhar(seg) {
    const t = seg * 0.12; // bem devagar
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(170, 195, 235, 0.13)";
    ctx.lineWidth = 1;
    const passo = Math.max(48, Math.min(W, H) / 11);
    const margem = passo * 3;
    const pontos = 9; // poucos pontos por linha: dobras retas, como numa grade facetada

    // linhas verticais
    for (let x = -margem; x <= W + margem; x += passo) {
      ctx.beginPath();
      for (let i = 0; i <= pontos; i++) {
        const y = -margem + ((H + 2 * margem) * i) / pontos;
        const [px, py] = deformar(x, y, t);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    }
    // linhas horizontais
    for (let y = -margem; y <= H + margem; y += passo) {
      ctx.beginPath();
      for (let i = 0; i <= pontos; i++) {
        const x = -margem + ((W + 2 * margem) * i) / pontos;
        const [px, py] = deformar(x, y, t);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    }
  }

  redimensionar();
  window.addEventListener("resize", () => { redimensionar(); desenhar(performance.now() / 1000); });

  if (reduzir) { desenhar(8); return; }
  let ultimo = 0;
  function quadro(ms) {
    requestAnimationFrame(quadro);
    if (ms - ultimo < 50) return; // 20 quadros por segundo bastam para um movimento tão lento
    ultimo = ms;
    desenhar(ms / 1000);
  }
  requestAnimationFrame(quadro);
})();
