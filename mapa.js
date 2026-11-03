/* =========================================================
   Mapa de destinos.
   - Planetas com visual inspirado nos planetas reais, posicionados
     livremente (x, y e tam em dados.js).
   - Céu e planetas em WebGL (#ceu), desenhados uma vez (sem animação).
   - Arte radial em canvas 2D (#hud): molduras em volta de cada planeta,
     um emblema radial ao fundo e arcos graduados.
   ========================================================= */
(() => {
  const mapa = document.getElementById("mapa");
  const ceu = document.getElementById("ceu");
  const hud = document.getElementById("hud");
  if (!mapa || !ceu || !hud || typeof projetos === "undefined") return;

  const TIPOS = ["mercurio", "venus", "terra", "marte", "jupiter", "saturno", "urano", "netuno"];
  const ATM = {
    mercurio: [[0, 0, 0], 0], venus: [[1.0, 0.85, 0.55], 0.5], terra: [[0.35, 0.65, 1.0], 0.8],
    marte: [[1.0, 0.55, 0.4], 0.3], jupiter: [[1.0, 0.85, 0.65], 0.25], saturno: [[1.0, 0.9, 0.65], 0.25],
    urano: [[0.6, 0.95, 1.0], 0.55], netuno: [[0.35, 0.55, 1.0], 0.6],
  };
  const N = 4;
  const lista = projetos.slice(0, N);
  let selecionado = lista[0] ? lista[0].id : null;
  let L = null;

  // ---------- disposição ----------
  function dispor() {
    const w = mapa.clientWidth, h = mapa.clientHeight;
    L = { w, h, itens: lista.map((p) => ({ id: p.id, x: (p.x / 100) * w, y: (p.y / 100) * h, r: (p.tam * w) / 2, anel: p.planeta === "saturno" })) };
    lista.forEach((p, i) => {
      const b = botoes[p.id];
      if (!b) return;
      b.style.left = p.x + "%";
      b.style.top = p.y + "%";
      b.style.setProperty("--tam", Math.round(L.itens[i].r * 2) + "px");
    });
  }

  // ---------- arte radial ----------
  const g = hud.getContext("2d");
  const OSSO = (a) => `rgba(230,233,240,${a})`;
  const AMAR = (a) => `rgba(255,214,10,${a})`;

  function arco(x, y, r, a0, a1, cor, larg, tracos) {
    g.strokeStyle = cor;
    g.lineWidth = larg || 1;
    g.setLineDash(tracos || []);
    g.beginPath();
    g.arc(x, y, r, a0, a1);
    g.stroke();
    g.setLineDash([]);
  }

  function marcas(x, y, r, n, comp, cor, a0, a1) {
    g.strokeStyle = cor;
    g.lineWidth = 1;
    const ini = a0 ?? 0, fim = a1 ?? Math.PI * 2;
    for (let k = 0; k < n; k++) {
      const a = ini + ((fim - ini) * k) / n;
      g.beginPath();
      g.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
      g.lineTo(x + (r + comp) * Math.cos(a), y + (r + comp) * Math.sin(a));
      g.stroke();
    }
  }

  function no(x, y, r, a, tam, cor) {
    g.fillStyle = cor;
    g.beginPath();
    g.arc(x + r * Math.cos(a), y + r * Math.sin(a), tam, 0, Math.PI * 2);
    g.fill();
  }

  function desenharHud() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    hud.width = Math.round(L.w * dpr);
    hud.height = Math.round(L.h * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, L.w, L.h);
    const { w, h } = L;
    const M = Math.min(w, h);

    // emblema radial ao fundo, no centro do mapa
    const cx = w / 2, cy = h / 2;
    [0.18, 0.26, 0.42].forEach((f, i) => arco(cx, cy, M * f, 0, Math.PI * 2, OSSO(i === 2 ? 0.05 : 0.08), 1, i === 1 ? [1, 5] : []));
    g.strokeStyle = OSSO(0.05);
    for (let k = 0; k < 12; k++) {
      const a = (k * Math.PI) / 6;
      g.beginPath();
      g.moveTo(cx + M * 0.2 * Math.cos(a), cy + M * 0.2 * Math.sin(a));
      g.lineTo(cx + M * (k % 3 === 0 ? 0.5 : 0.4) * Math.cos(a), cy + M * (k % 3 === 0 ? 0.5 : 0.4) * Math.sin(a));
      g.stroke();
    }
    // estrela de quatro pontas, bem discreta
    g.fillStyle = OSSO(0.035);
    g.beginPath();
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 - Math.PI / 2;
      const rr = k % 2 === 0 ? M * 0.36 : M * 0.07;
      const px = cx + rr * Math.cos(a), py = cy + rr * Math.sin(a);
      k === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
    }
    g.closePath();
    g.fill();

    // arcos graduados saindo da borda de baixo
    const bx = w * 0.5, by = h * 1.32, br = h * 0.62;
    arco(bx, by, br, Math.PI * 1.18, Math.PI * 1.82, OSSO(0.16));
    arco(bx, by, br + 10, Math.PI * 1.2, Math.PI * 1.8, OSSO(0.08), 1, [2, 4]);
    marcas(bx, by, br - 7, 90, 7, OSSO(0.12), Math.PI * 1.18, Math.PI * 1.82);
    arco(bx, by, br - 30, Math.PI * 1.25, Math.PI * 1.75, OSSO(0.07));

    // moldura de cada planeta
    L.itens.forEach((it, i) => {
      const ativo = it.id === selecionado;
      const base = ativo ? AMAR : OSSO;
      const r = it.r * (it.anel ? 1.15 : 1);
      // anel fino logo depois da atmosfera
      arco(it.x, it.y, r * 1.28, 0, Math.PI * 2, base(ativo ? 0.75 : 0.22), ativo ? 1.4 : 1);
      // anel pontilhado com marcações
      arco(it.x, it.y, r * 1.5, 0, Math.PI * 2, base(ativo ? 0.45 : 0.14), 1, [1, 4]);
      marcas(it.x, it.y, r * 1.5, 48, 3, base(ativo ? 0.35 : 0.1));
      // arcos parciais (cada planeta com um giro diferente, para não ficarem iguais)
      const giro = i * 1.3 + 0.4;
      arco(it.x, it.y, r * 1.72, giro, giro + 1.1, base(ativo ? 0.85 : 0.3), 1.5);
      arco(it.x, it.y, r * 1.72, giro + Math.PI, giro + Math.PI + 0.45, base(ativo ? 0.6 : 0.2), 1.5);
      // nós sobre os anéis
      no(it.x, it.y, r * 1.28, giro + 2.2, 2.2, base(ativo ? 1 : 0.5));
      no(it.x, it.y, r * 1.72, giro + 1.1, 1.8, base(ativo ? 1 : 0.45));
      no(it.x, it.y, r * 1.5, giro + 4.0, 1.5, base(ativo ? 0.9 : 0.35));
      // cantos de mira no planeta selecionado
      if (ativo) {
        const c = r * 1.95, t = Math.max(6, r * 0.18);
        g.strokeStyle = AMAR(0.9);
        g.lineWidth = 1.5;
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
          g.beginPath();
          g.moveTo(it.x + sx * c, it.y + sy * (c - t));
          g.lineTo(it.x + sx * c, it.y + sy * c);
          g.lineTo(it.x + sx * (c - t), it.y + sy * c);
          g.stroke();
        });
      }
    });

    // moldura do quadro
    g.strokeStyle = OSSO(0.18);
    g.lineWidth = 1;
    const m = 12, t = 16;
    [[m, m, 1, 1], [w - m, m, -1, 1], [w - m, h - m, -1, -1], [m, h - m, 1, -1]].forEach(([x, y, sx, sy]) => {
      g.beginPath();
      g.moveTo(x, y + sy * t);
      g.lineTo(x, y);
      g.lineTo(x + sx * t, y);
      g.stroke();
    });
  }

  // ---------- céu e planetas (WebGL, desenhado uma vez) ----------
  const gl = ceu.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  const vert = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
  const frag = `
    precision highp float;
    uniform vec2 uRes;
    uniform vec2 uC[4];
    uniform float uR[4];
    uniform float uTipo[4];
    uniform vec3 uAtm[4];
    uniform float uForca[4];
    const float uT = 20.0;
    const vec3 LUZ = normalize(vec3(-0.6, 0.55, 0.6));

    float h1(float n){ return fract(sin(n) * 43758.5453); }
    float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n2(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(h2(i), h2(i+vec2(1,0)), u.x), mix(h2(i+vec2(0,1)), h2(i+vec2(1,1)), u.x), u.y); }
    float f2(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*n2(p); p = p*2.02 + 17.0; a *= 0.5; } return v; }
    float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.0-2.0*f); float n = i.x + i.y*57.0 + i.z*113.0;
      return mix(mix(mix(h1(n), h1(n+1.0), f.x), mix(h1(n+57.0), h1(n+58.0), f.x), f.y),
                 mix(mix(h1(n+113.0), h1(n+114.0), f.x), mix(h1(n+170.0), h1(n+171.0), f.x), f.y), f.z); }
    float f3(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*n3(p); p = p*2.03 + 11.0; a *= 0.5; } return v; }
    vec3 girarY(vec3 v, float a){ float c = cos(a), s = sin(a); return vec3(c*v.x + s*v.z, v.y, -s*v.x + c*v.z); }

    vec3 superficie(int i, vec3 s, float t, out float espec){
      espec = 0.0;
      if (i == 0) { // Mercúrio: cinza com crateras
        float c = f3(s*4.0);
        float cr = smoothstep(0.6, 0.7, f3(s*9.0 + 2.0));
        vec3 cor = mix(vec3(0.36, 0.34, 0.32), vec3(0.64, 0.61, 0.57), c);
        return cor * (1.0 - cr*0.35);
      }
      if (i == 1) { // Vênus: nuvens espessas amareladas
        float w = f3(s*vec3(2.0, 5.0, 2.0) + vec3(t*0.02, 0.0, 0.0));
        return mix(vec3(0.76, 0.62, 0.38), vec3(0.96, 0.89, 0.72), w);
      }
      if (i == 2) { // Terra: oceanos, continentes, gelo e nuvens
        float h = f3(s*2.3 + 1.0);
        float terra = smoothstep(0.5, 0.54, h);
        vec3 oceano = mix(vec3(0.02, 0.07, 0.2), vec3(0.04, 0.2, 0.42), f3(s*6.0));
        vec3 solo = mix(vec3(0.14, 0.3, 0.11), vec3(0.56, 0.46, 0.28), smoothstep(0.55, 0.7, h));
        vec3 cor = mix(oceano, solo, terra);
        float gelo = smoothstep(0.78, 0.86, abs(s.y) + 0.05*f3(s*8.0));
        cor = mix(cor, vec3(0.95), gelo);
        float nuvem = smoothstep(0.52, 0.76, f3(girarY(s, t*0.02)*3.2 + 7.0));
        cor = mix(cor, vec3(0.97), nuvem*0.85);
        espec = (1.0 - terra) * (1.0 - nuvem) * (1.0 - gelo);
        return cor;
      }
      if (i == 3) { // Marte: ferrugem, regiões escuras e calota polar
        float h = f3(s*2.8);
        vec3 cor = mix(vec3(0.42, 0.16, 0.08), vec3(0.84, 0.43, 0.22), smoothstep(0.35, 0.7, h));
        cor = mix(cor, vec3(0.28, 0.11, 0.06), smoothstep(0.6, 0.75, f3(s*5.0 + 3.0))*0.5);
        return mix(cor, vec3(0.95, 0.92, 0.9), smoothstep(0.86, 0.92, s.y));
      }
      if (i == 4) { // Júpiter: faixas e a Grande Mancha Vermelha
        float w = f3(s*vec3(2.5, 1.0, 2.5) + vec3(t*0.03, 0.0, 0.0));
        float faixa = sin(s.y*18.0 + w*4.0);
        vec3 cor = mix(vec3(0.6, 0.4, 0.26), vec3(0.94, 0.87, 0.75), smoothstep(-0.6, 0.6, faixa));
        cor = mix(cor, vec3(0.74, 0.54, 0.37), smoothstep(0.6, 0.9, sin(s.y*7.0 + 1.0))*0.4);
        float mancha = smoothstep(0.17, 0.1, length(vec2(s.x - 0.25, (s.y + 0.33)*2.2))) * step(0.0, s.z);
        return mix(cor, vec3(0.72, 0.3, 0.18), mancha*0.9);
      }
      if (i == 5) { // Saturno: faixas suaves douradas
        float w = f3(s*vec3(2.0, 1.0, 2.0));
        float faixa = sin(s.y*14.0 + w*2.5);
        return mix(vec3(0.72, 0.6, 0.4), vec3(0.94, 0.86, 0.67), smoothstep(-0.7, 0.7, faixa));
      }
      if (i == 6) { // Urano: ciano liso
        float faixa = sin(s.y*9.0 + f3(s*3.0)*1.5);
        return mix(vec3(0.52, 0.78, 0.82), vec3(0.7, 0.91, 0.93), smoothstep(-1.0, 1.0, faixa));
      }
      // Netuno: azul profundo com mancha escura
      float w = f3(s*vec3(2.5, 1.2, 2.5) + vec3(t*0.04, 0.0, 0.0));
      float faixa = sin(s.y*10.0 + w*3.0);
      vec3 cor = mix(vec3(0.1, 0.22, 0.6), vec3(0.3, 0.48, 0.88), smoothstep(-0.8, 0.8, faixa));
      float mancha = smoothstep(0.14, 0.08, length(vec2(s.x + 0.2, (s.y + 0.2)*2.0))) * step(0.0, s.z);
      return mix(cor, vec3(0.04, 0.09, 0.3), mancha*0.7);
    }


    void main(){
      vec2 px = gl_FragCoord.xy;
      vec2 uv = px / uRes.x;

      // fundo: azul-petróleo escuro, névoa suave e vinheta
      vec2 q = uv * 1.8;
      float w = f2(q + vec2(f2(q + 3.0), f2(q*1.3 + 7.0))*1.4);
      vec3 cor = mix(vec3(0.02, 0.035, 0.05), vec3(0.04, 0.09, 0.11), smoothstep(0.3, 0.85, w));
      cor += vec3(0.05, 0.03, 0.07) * smoothstep(0.6, 1.0, f2(q*0.9 + 11.0));
      vec2 c = gl_FragCoord.xy / uRes - 0.5;
      cor *= 1.0 - dot(c, c) * 1.1;
      vec2 cel = floor(px / 3.0);
      float e = h2(cel);
      if (e > 0.994) cor += vec3(0.8, 0.88, 1.0) * (e - 0.994) * 100.0;

      for (int i = 0; i < 4; i++) {
        float R = uR[i];
        if (R <= 0.0) continue;
        vec2 d = (px - uC[i]) / R;
        float l = length(d);
        if (l > 2.6) continue;
        int tipo = int(uTipo[i] + 0.5);

        if (l > 1.0 && uForca[i] > 0.0) {
          float lado = 0.3 + 0.7 * max(dot(normalize(d), normalize(LUZ.xy)), 0.0);
          cor += uAtm[i] * exp(-(l - 1.0) * 9.0) * lado * uForca[i] * 0.6;
        }

        vec2 ra = vec2(0.0);
        float rr = 0.0;
        bool anel = (tipo == 5);
        if (anel) {
          float ang = -0.4;
          ra = vec2(cos(ang)*d.x - sin(ang)*d.y, sin(ang)*d.x + cos(ang)*d.y);
          rr = length(vec2(ra.x, ra.y / 0.32));
          if (rr > 1.3 && rr < 2.25 && ra.y > 0.0 && l > 1.0) {
            float dens = (0.45 + 0.55*n2(vec2(rr*36.0, 0.0))) * smoothstep(1.3, 1.4, rr) * smoothstep(2.25, 2.1, rr)
                       * (1.0 - smoothstep(1.78, 1.82, rr) * smoothstep(1.9, 1.86, rr));
            cor = mix(cor, vec3(0.86, 0.8, 0.64) * (0.35 + 0.65*max(-ra.x*0.5 + 0.5, 0.2)), dens*0.8);
          }
        }

        if (l <= 1.0) {
          float z = sqrt(1.0 - l*l);
          vec3 n = vec3(d, z);
          vec3 s = girarY(n, float(i)*1.7 + 0.6);
          float espec;
          vec3 base = superficie(tipo, s, uT, espec);
          float luz = dot(n, LUZ);
          float dif = smoothstep(-0.15, 0.8, luz);
          vec3 lit = base * (0.035 + dif*1.05);
          vec3 refl = reflect(-LUZ, n);
          lit += vec3(1.0) * pow(max(refl.z, 0.0), 26.0) * espec * 0.55 * step(0.0, luz);
          lit *= mix(0.6, 1.0, z);
          lit += uAtm[i] * pow(1.0 - z, 3.0) * dif * uForca[i];
          cor = mix(cor, lit, smoothstep(1.0, 1.0 - 1.5/R, l));
        }

        if (anel && rr > 1.3 && rr < 2.25 && ra.y <= 0.0) {
          float dens = (0.45 + 0.55*n2(vec2(rr*36.0, 0.0))) * smoothstep(1.3, 1.4, rr) * smoothstep(2.25, 2.1, rr)
                     * (1.0 - smoothstep(1.78, 1.82, rr) * smoothstep(1.9, 1.86, rr));
          cor = mix(cor, vec3(0.86, 0.8, 0.64) * (0.35 + 0.65*max(-ra.x*0.5 + 0.5, 0.2)), dens*0.85);
        }
      }

      cor += (h2(px) - 0.5) / 160.0;
      gl_FragColor = vec4(cor, 1.0);
    }
  `;

  let desenharCeu = () => {};
  if (gl) {
    const sh = (tipo, src) => {
      const s = gl.createShader(tipo);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, vert), fs = sh(gl.FRAGMENT_SHADER, frag);
    const prog = gl.createProgram();
    if (vs && fs) { gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); }
    if (vs && fs && gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const U = (n) => gl.getUniformLocation(prog, n);
      const tipo = new Float32Array(N), atm = new Float32Array(N * 3), forca = new Float32Array(N);
      lista.forEach((p, i) => {
        tipo[i] = Math.max(0, TIPOS.indexOf(p.planeta));
        atm.set(ATM[p.planeta][0], i * 3);
        forca[i] = ATM[p.planeta][1];
      });
      gl.uniform1fv(U("uTipo"), tipo);
      gl.uniform3fv(U("uAtm"), atm);
      gl.uniform1fv(U("uForca"), forca);
      desenharCeu = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ceu.width = Math.round(L.w * dpr);
        ceu.height = Math.round(L.h * dpr);
        gl.viewport(0, 0, ceu.width, ceu.height);
        gl.uniform2f(U("uRes"), ceu.width, ceu.height);
        const c = new Float32Array(N * 2), r = new Float32Array(N);
        L.itens.forEach((it, i) => { c[i * 2] = it.x * dpr; c[i * 2 + 1] = ceu.height - it.y * dpr; r[i] = it.r * dpr; });
        gl.uniform2fv(U("uC"), c);
        gl.uniform1fv(U("uR"), r);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      mapa.classList.add("gl");
    }
  }

  function tudo() { dispor(); desenharHud(); desenharCeu(); }
  document.addEventListener("destino", () => {
    const b = Object.entries(botoes).find(([, el]) => el.getAttribute("aria-pressed") === "true");
    selecionado = b ? b[0] : selecionado;
    if (L) desenharHud();
  });
  tudo();
  let espera;
  window.addEventListener("resize", () => { clearTimeout(espera); espera = setTimeout(tudo, 120); });
  if (window.selecionarInicial) window.selecionarInicial();
})();
