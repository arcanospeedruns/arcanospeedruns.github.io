/* =========================================================
   Landing: duas carpas em ASCII nadando livremente sobre o branco.
   Cada carpa é uma corrente de juntas que segue a cabeça; o corpo
   ondula da cabeça para a cauda. A cada quadro o corpo é "carimbado"
   numa grade de caracteres e desenhado com uma fonte mono.
   ========================================================= */
(() => {
  const tela = document.getElementById("carpas");
  if (!tela) return;
  const ctx = tela.getContext("2d");
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FONTE = '"Departure", ui-monospace, monospace';

  // ---------- grade de caracteres ----------
  let W = 0, H = 0, fs = 13, cw = 8, chh = 14, cols = 0, rows = 0, escala = 600;
  let prio, prof, quem, sA, uA, tipo;

  function medir() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    tela.width = Math.round(W * dpr); tela.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fs = W < 700 ? 10 : 13;
    cw = fs * 0.6364; chh = fs * 1.1;
    cols = Math.ceil(W / cw); rows = Math.ceil(H / chh);
    const n = cols * rows;
    prio = new Int8Array(n); prof = new Float32Array(n); quem = new Uint8Array(n);
    sA = new Float32Array(n); uA = new Float32Array(n); tipo = new Uint8Array(n);
    escala = Math.min(W, H * 1.3);
    for (const p of peixes) p.ajustar();
  }

  // ---------- as carpas ----------
  // manchas no espaço do corpo: s = 0 (cabeça) a 1 (cauda), u = -1 a 1 (de um lado ao outro)
  const PADROES = [
    { // kohaku: branca com manchas vermelhas
      base: "#9a948a", mancha: "#d8381c", nadadeira: "#c6c0b6",
      manchas: [[0.09, 0, 0.075, 0.9], [0.33, 0.25, 0.11, 0.8], [0.55, -0.25, 0.09, 0.85], [0.75, 0.3, 0.06, 0.7]],
      outra: null, outrasManchas: [],
    },
    { // showa: laranja com manchas pretas e testa branca
      base: "#ee7a12", mancha: "#1b1b1e", nadadeira: "#f4ae62",
      manchas: [[0.2, -0.45, 0.07, 0.6], [0.42, 0.4, 0.1, 0.65], [0.64, -0.3, 0.08, 0.75]],
      outra: "#9a948a", outrasManchas: [[0.04, 0, 0.05, 1]],
    },
  ];
  const OLHO = "#111";

  class Carpa {
    constructor(id, fx, fy, ang, fase) {
      this.id = id; this.fx = fx; this.fy = fy; this.ang = ang; this.fase = fase;
      this.N = 22; this.j = [];
      this.pad = PADROES[id];
    }
    ajustar() {
      this.L = Math.max(160, Math.min(460, escala * (W < 700 ? 0.62 : 0.46)));
      this.Wd = this.L * 0.135; // meia largura máxima do corpo
      this.seg = this.L / (this.N - 1);
      this.v = this.L * 0.16; // px por segundo
      if (!this.j.length) {
        const x = W * this.fx, y = H * this.fy;
        for (let i = 0; i < this.N; i++) this.j.push({ x: x - Math.cos(this.ang) * this.seg * i, y: y - Math.sin(this.ang) * this.seg * i });
      } else {
        for (const p of this.j) { p.x = Math.min(Math.max(p.x, 0), W); p.y = Math.min(Math.max(p.y, 0), H); }
      }
    }
    passo(dt, t, outra) {
      const h = this.j[0];
      // vagueia: a vontade de virar muda devagar
      let giro = 0.55 * Math.sin(t * 0.29 + this.fase) + 0.35 * Math.sin(t * 0.71 + this.fase * 2.3);
      // perto da borda, volta para o meio
      const m = Math.min(this.L * 0.45, W * 0.12, H * 0.12);
      const fora = Math.max(m - h.x, h.x - (W - m), m - h.y, h.y - (H - m), 0);
      if (fora > 0) giro += difAng(this.ang, Math.atan2(H / 2 - h.y, W / 2 - h.x)) * Math.min(1, fora / m) * 2.2;
      // se afastou demais da outra, chega mais perto (carpas nadam em dupla)
      const dx = outra.j[0].x - h.x, dy = outra.j[0].y - h.y, d = Math.hypot(dx, dy);
      if (d > escala * 0.55) giro += difAng(this.ang, Math.atan2(dy, dx)) * 0.5;
      // e não fica em cima dela
      else if (d < this.L * 0.7) giro -= difAng(this.ang, Math.atan2(dy, dx)) * 0.8 * (1 - d / (this.L * 0.7));
      this.ang += Math.max(-1.6, Math.min(1.6, giro)) * dt;
      const v = this.v * (0.85 + 0.25 * Math.sin(t * 0.5 + this.fase));
      h.x += Math.cos(this.ang) * v * dt;
      h.y += Math.sin(this.ang) * v * dt;
      // as juntas seguem a da frente
      for (let i = 1; i < this.N; i++) {
        const a = this.j[i - 1], b = this.j[i];
        const ex = b.x - a.x, ey = b.y - a.y, e = Math.hypot(ex, ey) || 1;
        b.x = a.x + (ex / e) * this.seg; b.y = a.y + (ey / e) * this.seg;
      }
    }
  }
  const difAng = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };

  const peixes = [new Carpa(0, 0.28, 0.38, 0.3, 0), new Carpa(1, 0.72, 0.62, Math.PI + 0.3, 2.1)];

  // ---------- carimbo na grade ----------
  // prioridade: olho > corpo > nadadeira; a segunda carpa passa por cima da primeira
  function carimbar(px, py, r, P, id, s, nx, ny, t) {
    const x0 = Math.max(0, Math.floor((px - r) / cw)), x1 = Math.min(cols - 1, Math.floor((px + r) / cw));
    const y0 = Math.max(0, Math.floor((py - r) / chh)), y1 = Math.min(rows - 1, Math.floor((py + r) / chh));
    const r2 = r * r;
    for (let cy = y0; cy <= y1; cy++) {
      const ddy = (cy + 0.5) * chh - py;
      for (let cx = x0; cx <= x1; cx++) {
        const ddx = (cx + 0.5) * cw - px;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 > r2) continue;
        const k = cy * cols + cx, dp = 1 - Math.sqrt(d2) / r;
        if (P > prio[k] || (P === prio[k] && dp > prof[k])) {
          prio[k] = P; prof[k] = dp; quem[k] = id; sA[k] = s; tipo[k] = t;
          uA[k] = (ddx * nx + ddy * ny) / r;
        }
      }
    }
  }

  function perfil(s) {
    if (s < 0.1) return 0.62 + 0.38 * Math.sqrt(s / 0.1);
    if (s < 0.38) return 1;
    return 1 - 0.74 * Math.pow((s - 0.38) / 0.62, 1.3);
  }

  function leque(ox, oy, dirX, dirY, abertura, comp, raio, P, id, garfo) {
    const passo = Math.min(cw, chh) * 0.55;
    const n = Math.max(5, Math.round(abertura / 0.07));
    for (let a = 0; a <= n; a++) {
      const ang = -abertura / 2 + (abertura * a) / n;
      const c = Math.cos(ang), sn = Math.sin(ang);
      const dx = dirX * c - dirY * sn, dy = dirX * sn + dirY * c;
      const borda = Math.abs(ang) / (abertura / 2);
      const L = comp * (garfo ? 0.62 + 0.5 * Math.pow(borda, 1.6) : 1 - 0.35 * borda * borda);
      for (let q = 0; q <= L; q += passo) {
        const f = q / L;
        carimbar(ox + dx * q, oy + dy * q, raio * (1 - f * 0.55), P, id, f, -dy, dx, 2);
      }
    }
  }

  function desenharCarpa(p, t) {
    const N = p.N, j = p.j, id = p.id, Pc = 6 + id, Pn = 2 + id;
    const onda = t * 5.2 + p.fase;
    // espinha com ondulação lateral, mais forte perto da cauda
    const ex = [], ey = [], tx = [], ty = [];
    for (let i = 0; i < N; i++) {
      const a = j[Math.max(0, i - 1)], b = j[Math.min(N - 1, i + 1)];
      let dx = a.x - b.x, dy = a.y - b.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const lat = p.Wd * 0.55 * Math.sin(i * 0.42 - onda) * Math.pow(i / (N - 1), 1.5);
      ex.push(j[i].x - dy * lat); ey.push(j[i].y + dx * lat); tx.push(dx); ty.push(dy);
    }
    // corpo: muitos círculos ao longo da espinha
    const M = Math.ceil(p.L / (Math.min(cw, chh) * 0.5));
    for (let k = 0; k <= M; k++) {
      const s = k / M, f = s * (N - 1), i = Math.min(N - 2, Math.floor(f)), w = f - i;
      const x = ex[i] + (ex[i + 1] - ex[i]) * w, y = ey[i] + (ey[i + 1] - ey[i]) * w;
      const dx = tx[i], dy = ty[i];
      carimbar(x, y, p.Wd * perfil(s), Pc, id, s, -dy, dx, 1);
    }
    // nadadeiras peitorais (batem devagar) e pélvicas
    const bate = 0.25 * Math.sin(t * 2.4 + p.fase);
    for (const [s, comp, abre] of [[0.2, p.Wd * 1.35, 0.7], [0.55, p.Wd * 0.8, 0.5]]) {
      const i = Math.round(s * (N - 1)), dx = tx[i], dy = ty[i];
      for (const lado of [-1, 1]) {
        const ang = Math.atan2(dy, dx) + lado * (2.25 + bate); // para trás e para fora
        const ox = ex[i] - dy * lado * p.Wd * perfil(s) * 0.8, oy = ey[i] + dx * lado * p.Wd * perfil(s) * 0.8;
        leque(ox, oy, Math.cos(ang), Math.sin(ang), abre, comp, p.Wd * 0.45, Pn, id, false);
      }
    }
    // cauda em leque, com o garfo no meio
    const k = N - 1;
    const balanço = 0.35 * Math.sin((N - 1) * 0.42 - onda - 0.6);
    const ac = Math.atan2(-ty[k], -tx[k]) + balanço;
    leque(ex[k], ey[k], Math.cos(ac), Math.sin(ac), 0.85, p.L * 0.24, p.Wd * 0.5, Pn, id, true);
    // olhos
    const io = Math.round(0.05 * (N - 1)), dx = tx[io], dy = ty[io], wo = p.Wd * perfil(0.05) * 0.62;
    for (const lado of [-1, 1]) {
      const cx = Math.floor((ex[io] - dy * lado * wo) / cw), cy = Math.floor((ey[io] + dx * lado * wo) / chh);
      if (cx >= 0 && cy >= 0 && cx < cols && cy < rows) { const q = cy * cols + cx; prio[q] = 20; tipo[q] = 3; quem[q] = id; }
    }
  }

  // ---------- ondinhas na água ----------
  const ondas = [];
  let proxOnda = 0.8;
  function desenharOndas(t) {
    if (t > proxOnda) {
      const p = peixes[Math.floor(Math.random() * 2)], q = p.j[Math.random() < 0.5 ? 0 : p.N - 1];
      ondas.push({ x: q.x, y: q.y, t0: t });
      proxOnda = t + 0.9 + Math.random() * 1.2;
    }
    ctx.fillStyle = "#8fb3c6";
    for (let i = ondas.length - 1; i >= 0; i--) {
      const o = ondas[i], idade = t - o.t0, vida = 3;
      if (idade > vida) { ondas.splice(i, 1); continue; }
      const r = 6 + idade * escala * 0.05;
      ctx.globalAlpha = 0.75 * (1 - idade / vida);
      const n = Math.max(10, Math.round((2 * Math.PI * r) / (cw * 1.6)));
      for (let a = 0; a < n; a++) {
        const ang = (a / n) * Math.PI * 2;
        const cx = Math.floor((o.x + Math.cos(ang) * r) / cw), cy = Math.floor((o.y + Math.sin(ang) * r * 0.8) / chh);
        if (cx < 0 || cy < 0 || cx >= cols || cy >= rows || prio[cy * cols + cx]) continue;
        ctx.fillText(idade < 1 ? "~" : "·", cx * cw, cy * chh);
      }
    }
    ctx.globalAlpha = 1;
  }

  // ---------- cor e caractere de cada célula ----------
  const RAMPA = ":=+*##%%";
  function corDe(k) {
    const p = PADROES[quem[k]];
    if (tipo[k] === 3) return OLHO;
    if (tipo[k] === 2) return p.nadadeira;
    const s = sA[k], u = uA[k];
    for (const [ms, mu, rs, ru] of p.outrasManchas) if (((s - ms) / rs) ** 2 + ((u - mu) / ru) ** 2 < 1) return p.outra;
    for (const [ms, mu, rs, ru] of p.manchas) if (((s - ms) / rs) ** 2 + ((u - mu) / ru) ** 2 < 1) return p.mancha;
    return p.base;
  }
  function letraDe(k) {
    if (tipo[k] === 3) return "@";
    const d = prof[k];
    if (tipo[k] === 2) return sA[k] > 0.75 ? ":" : sA[k] > 0.4 ? "=" : "+";
    return RAMPA[Math.min(RAMPA.length - 1, Math.floor(Math.pow(d, 0.5) * RAMPA.length))];
  }

  // ---------- quadro ----------
  const baldes = new Map();
  function quadro(t) {
    prio.fill(0); prof.fill(0);
    for (const p of peixes) desenharCarpa(p, t);
    ctx.clearRect(0, 0, W, H);
    ctx.font = `${fs}px ${FONTE}`;
    ctx.textBaseline = "top";
    desenharOndas(t);
    for (const b of baldes.values()) b.length = 0;
    for (let k = 0; k < prio.length; k++) {
      if (!prio[k]) continue;
      const c = corDe(k);
      let b = baldes.get(c); if (!b) baldes.set(c, (b = []));
      b.push(k);
    }
    for (const [c, b] of baldes) {
      ctx.fillStyle = c;
      for (const k of b) ctx.fillText(letraDe(k), (k % cols) * cw, Math.floor(k / cols) * chh);
    }
  }

  // ---------- início ----------
  medir();
  let resize = 0;
  addEventListener("resize", () => { clearTimeout(resize); resize = setTimeout(() => { medir(); if (reduzir) quadro(T); }, 100); });

  // simula alguns segundos antes de mostrar, para as carpas já aparecerem curvadas
  let T = 0;
  for (let i = 0; i < 90; i++) { T += 1 / 30; peixes[0].passo(1 / 30, T, peixes[1]); peixes[1].passo(1 / 30, T, peixes[0]); }

  const comecar = () => {
    if (reduzir) { quadro(T); return; }
    let antes = performance.now(), ultimo = 0;
    const laço = (agora) => {
      requestAnimationFrame(laço);
      if (agora - ultimo < 32) return; // ~30 quadros por segundo
      ultimo = agora;
      const dt = Math.min(0.05, (agora - antes) / 1000); antes = agora;
      T += dt;
      peixes[0].passo(dt, T, peixes[1]); peixes[1].passo(dt, T, peixes[0]);
      quadro(T);
    };
    requestAnimationFrame(laço);
  };
  // espera a fonte mono para os caracteres saírem certos
  (document.fonts ? document.fonts.load(`13px ${FONTE}`).catch(() => {}) : Promise.resolve()).then(comecar);
})();
