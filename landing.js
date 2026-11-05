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
  let prio, prof, quem, sA, uA, tipo, pedra = null;

  function medir() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    tela.width = Math.round(W * dpr); tela.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fs = W < 700 ? 9 : 13;
    cw = fs * 0.6364; chh = fs * 1.1;
    cols = Math.ceil(W / cw); rows = Math.ceil(H / chh);
    const n = cols * rows;
    prio = new Int8Array(n); prof = new Float32Array(n); quem = new Uint8Array(n);
    sA = new Float32Array(n); uA = new Float32Array(n); tipo = new Uint8Array(n);
    escala = Math.min(W, H * 1.3);
    // os botões viram uma pedra no lago: as carpas contornam
    const nav = document.querySelector(".landing-nav");
    if (nav) { const r = nav.getBoundingClientRect(); pedra = { x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }; }
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
      this.giro = 0;      // velocidade de giro atual (rad/s), com inércia
      this.fase2 = fase;  // fase da batida da cauda
      this.amp = 0.5;     // força da ondulação do corpo
    }
    ajustar() {
      // no celular as carpas ficam menores, para caberem as duas sem trombar
      this.L = W < 700 ? Math.max(110, Math.min(170, W * 0.36)) : Math.max(180, Math.min(420, escala * 0.4));
      this.Wd = this.L * 0.155; // meia largura máxima do corpo
      this.seg = this.L / (this.N - 1);
      this.v = this.v || this.L * 0.14;
      if (!this.j.length) {
        const x = W * this.fx, y = H * this.fy;
        for (let i = 0; i < this.N; i++) this.j.push({ x: x - Math.cos(this.ang) * this.seg * i, y: y - Math.sin(this.ang) * this.seg * i });
      } else {
        for (const p of this.j) { p.x = Math.min(Math.max(p.x, 0), W); p.y = Math.min(Math.max(p.y, 0), H); }
      }
    }
    passo(dt, t, outra) {
      const h = this.j[0], L = this.L;
      const cx = Math.cos(this.ang), cy = Math.sin(this.ang);
      // 1. vagueia: a vontade de virar muda devagar
      let alvo = 0.45 * Math.sin(t * 0.23 + this.fase) + 0.3 * Math.sin(t * 0.59 + this.fase * 2.3);
      // 2. olha um pouco à frente; se esse ponto sai da tela, vira para longe da parede
      //    (contornando a borda, em vez de todas voltarem para o mesmo centro)
      const m = Math.min(L * 0.6, W * 0.16, H * 0.16);
      const fx = h.x + cx * L * 0.7, fy = h.y + cy * L * 0.7;
      const px = (fx < m ? 1 : 0) - (fx > W - m ? 1 : 0), py = (fy < m * 1.6 ? 1 : 0) - (fy > H - m ? 1 : 0);
      let fora = Math.max(m - fx, fx - (W - m), m * 1.6 - fy, fy - (H - m), 0);
      if (fora > 0) {
        // vira para dentro e um pouco na direção do meio, para não ficar rente à borda
        const mx = W / 2 - h.x, my = H * 0.55 - h.y, md = Math.hypot(mx, my) || 1;
        let dA = difAng(this.ang, Math.atan2(py + (my / md) * 0.7, px + (mx / md) * 0.7));
        // indo reto contra a parede: mantém o lado para onde já estava virando (senão fica indecisa)
        if (Math.abs(dA) > 2.3) dA = (this.giro >= 0 ? 1 : -1) * Math.abs(dA);
        alvo += dA * Math.min(3, 1 + (fora / m) * 2);
      }
      // 2b. contorna os botões
      if (pedra) {
        const folga = this.Wd * 1.6;
        const gx = h.x + cx * L * 0.55, gy = h.y + cy * L * 0.55;
        if (gx > pedra.x0 - folga && gx < pedra.x1 + folga && gy > pedra.y0 - folga && gy < pedra.y1 + folga) {
          const rx = (pedra.x0 + pedra.x1) / 2, ry = (pedra.y0 + pedra.y1) / 2;
          let dA = difAng(this.ang, Math.atan2(gy - ry, gx - rx));
          if (Math.abs(dA) > 2.3) dA = (this.giro >= 0 ? 1 : -1) * Math.abs(dA);
          alvo += dA * 1.6;
          fora = Math.max(fora, 1);
        }
      }
      // 3. desvia do corpo da outra antes de encostar: olha onde vai estar daqui a pouco
      const raio = (L + outra.L) * 0.55;
      let perto = Infinity, desvio = 0;
      for (const ahead of [0.2, 0.6]) {
        const ox = h.x + cx * L * ahead, oy = h.y + cy * L * ahead;
        for (let i = 0; i < outra.N; i += 2) {
          const q = outra.j[i];
          const dx = q.x - ox, dy = q.y - oy, d = Math.hypot(dx, dy);
          if (d < perto) perto = d;
          if (d < raio) {
            const lado = (cx * dy - cy * dx) / (d || 1); // > 0: o pedaço da outra está de um lado, < 0 do outro
            // quase de frente: as duas viram sempre para o mesmo lado (como no trânsito)
            const sinal = Math.abs(lado) < 0.25 ? 1 : Math.sign(lado);
            desvio -= sinal * Math.pow(1 - d / raio, 1.5) * 2.4;
          }
        }
      }
      alvo += Math.max(-3, Math.min(3, desvio)) * (fora > 0 ? 0.4 : 1); // a parede tem prioridade
      // 4. longe demais da outra: aproxima um pouco (carpas costumam nadar em dupla)
      const hx = outra.j[0].x - h.x, hy = outra.j[0].y - h.y;
      if (Math.hypot(hx, hy) > Math.max(L * 2.4, escala * 0.5)) alvo += difAng(this.ang, Math.atan2(hy, hx)) * 0.35;
      // o giro tem inércia: muda aos poucos
      const urgente = desvio !== 0 || fora > 0;
      alvo = Math.max(-2.2, Math.min(2.2, alvo));
      this.giro += (alvo - this.giro) * Math.min(1, dt * (urgente ? 4 : 2));
      this.ang += this.giro * dt;

      // velocidade: impulsos de cauda seguidos de deslize, e mais devagar perto da outra
      const impulso = Math.pow(0.5 + 0.5 * Math.sin(t * 0.42 + this.fase * 1.7), 3);
      let vAlvo = L * (0.09 + 0.2 * impulso);
      if (perto < raio * 0.6) vAlvo *= 0.7;
      this.v += (vAlvo - this.v) * Math.min(1, dt * 1.2);
      // a cauda bate mais rápido e mais forte quando acelera
      this.fase2 += dt * (2.2 + 26 * (this.v / L));
      this.amp += ((0.32 + 1.6 * (this.v / L)) - this.amp) * Math.min(1, dt * 2);

      h.x += Math.cos(this.ang) * this.v * dt;
      h.y += Math.sin(this.ang) * this.v * dt;
      // as juntas seguem a da frente
      for (let i = 1; i < this.N; i++) {
        const a = this.j[i - 1], b = this.j[i];
        const ex = b.x - a.x, ey = b.y - a.y, e = Math.hypot(ex, ey) || 1;
        b.x = a.x + (ex / e) * this.seg; b.y = a.y + (ey / e) * this.seg;
      }
    }
  }
  const difAng = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };

  // se mesmo assim os corpos se encostarem, afasta os dois de leve (sem atravessar um ao outro)
  function separar() {
    const [A, B] = peixes, min = (A.Wd + B.Wd) * 1.05;
    for (let it = 0; it < 2; it++) {
      for (const a of A.j) for (const b of B.j) {
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
        if (d >= min || d === 0) continue;
        const k = (min - d) / d * 0.5;
        a.x -= dx * k; a.y -= dy * k; b.x += dx * k; b.y += dy * k;
      }
      for (const p of peixes) for (let i = 1; i < p.N; i++) {
        const a = p.j[i - 1], b = p.j[i];
        const ex = b.x - a.x, ey = b.y - a.y, e = Math.hypot(ex, ey) || 1;
        b.x = a.x + (ex / e) * p.seg; b.y = a.y + (ey / e) * p.seg;
      }
    }
  }
  function nadar(dt, t) { peixes[0].passo(dt, t, peixes[1]); peixes[1].passo(dt, t, peixes[0]); separar(); }

  const peixes = [new Carpa(0, 0.3, 0.35, 0.2, 0), new Carpa(1, 0.7, 0.68, Math.PI + 0.2, 2.1)];

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
    return 1 - 0.72 * Math.pow((s - 0.38) / 0.62, 1.6);
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
    const onda = p.fase2;
    // espinha com ondulação lateral, mais forte perto da cauda
    const ex = [], ey = [], tx = [], ty = [];
    for (let i = 0; i < N; i++) {
      const a = j[Math.max(0, i - 1)], b = j[Math.min(N - 1, i + 1)];
      let dx = a.x - b.x, dy = a.y - b.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const lat = p.Wd * p.amp * Math.sin(i * 0.38 - onda) * Math.pow(i / (N - 1), 1.6);
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
    // abrem mais no deslize e se fecham no impulso; do lado de dentro da curva abrem mais
    const bate = 0.18 * Math.sin(t * 2 + p.fase) - (p.v / p.L - 0.15) * 1.5;
    for (const [s, comp, abre] of [[0.2, p.Wd * 1.35, 0.7], [0.55, p.Wd * 0.8, 0.5]]) {
      const i = Math.round(s * (N - 1)), dx = tx[i], dy = ty[i];
      for (const lado of [-1, 1]) {
        const ang = Math.atan2(dy, dx) + lado * (2.3 + bate + lado * p.giro * 0.25); // para trás e para fora
        const ox = ex[i] - dy * lado * p.Wd * perfil(s) * 0.8, oy = ey[i] + dx * lado * p.Wd * perfil(s) * 0.8;
        leque(ox, oy, Math.cos(ang), Math.sin(ang), abre, comp, p.Wd * 0.45, Pn, id, false);
      }
    }
    // cauda em leque, com o garfo no meio
    const k = N - 1;
    const balanço = 0.55 * p.amp * Math.sin((N - 1) * 0.38 - onda - 0.6);
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
    // junta em cada linha os caracteres vizinhos da mesma cor num texto só (bem menos chamadas de desenho)
    for (const b of baldes.values()) b.length = 0;
    for (let cy = 0; cy < rows; cy++) {
      let cx = 0;
      while (cx < cols) {
        const k = cy * cols + cx;
        if (!prio[k]) { cx++; continue; }
        const c = corDe(k);
        let txt = letraDe(k), fim = cx + 1;
        while (fim < cols) {
          const k2 = cy * cols + fim;
          if (!prio[k2] || corDe(k2) !== c) break;
          txt += letraDe(k2); fim++;
        }
        let bal = baldes.get(c); if (!bal) baldes.set(c, (bal = []));
        bal.push(txt, cx * cw, cy * chh);
        cx = fim;
      }
    }
    for (const [c, bal] of baldes) {
      ctx.fillStyle = c;
      for (let i = 0; i < bal.length; i += 3) ctx.fillText(bal[i], bal[i + 1], bal[i + 2]);
    }
  }

  // ---------- início ----------
  medir();
  let resize = 0;
  addEventListener("resize", () => { clearTimeout(resize); resize = setTimeout(() => { medir(); if (reduzir) quadro(T); }, 100); });

  // simula alguns segundos antes de mostrar, para as carpas já aparecerem curvadas
  let T = 0;
  for (let i = 0; i < 150; i++) { T += 1 / 30; nadar(1 / 30, T); }

  // computador: o máximo da tela; celular: ~30 quadros por segundo, para poupar bateria
  const INTERVALO = matchMedia("(hover: none), (pointer: coarse)").matches ? 32 : 0;
  // para testes: landing.html?debug simula sem desenhar e mede a menor distância entre as carpas
  if (location.search.includes("debug")) window.__simular = (seg) => {
    let tt = 0, toques = 0, menor = Infinity, fora = 0;
    for (let i = 0; i < seg * 30; i++) {
      tt += 1 / 30;
      nadar(1 / 30, tt);
      let m = Infinity;
      for (const a of peixes[0].j) for (const b of peixes[1].j) m = Math.min(m, Math.hypot(a.x - b.x, a.y - b.y));
      menor = Math.min(menor, m);
      if (m < (peixes[0].Wd + peixes[1].Wd) * 0.9) toques++;
      for (const p of peixes) if (p.j[0].x < -20 || p.j[0].x > W + 20 || p.j[0].y < -20 || p.j[0].y > H + 20) fora++;
    }
    return { quadros: seg * 30, toques, menor: Math.round(menor), fora, L: Math.round(peixes[0].L) };
  };
  if (location.search.includes("debug")) window.__tempo = () => {
    const r = {};
    let a = performance.now(); for (let i = 0; i < 60; i++) nadar(1 / 60, 10 + i / 60); r.nadar = (performance.now() - a) / 60;
    a = performance.now(); for (let i = 0; i < 60; i++) { prio.fill(0); prof.fill(0); for (const p of peixes) desenharCarpa(p, 10); } r.carimbo = (performance.now() - a) / 60;
    a = performance.now(); for (let i = 0; i < 60; i++) quadro(10 + i / 60); r.quadro = (performance.now() - a) / 60;
    return r;
  };
  const comecar = () => {
    if (reduzir) { quadro(T); return; }
    let antes = performance.now(), ultimo = 0;
    const laço = (agora) => {
      requestAnimationFrame(laço);
      if (agora - ultimo < INTERVALO) return;
      ultimo = agora;
      const dt = Math.min(0.05, (agora - antes) / 1000); antes = agora;
      T += dt;
      nadar(dt, T);
      quadro(T);
    };
    requestAnimationFrame(laço);
  };
  // espera a fonte mono para os caracteres saírem certos
  (document.fonts ? document.fonts.load(`13px ${FONTE}`).catch(() => {}) : Promise.resolve()).then(comecar);
})();
