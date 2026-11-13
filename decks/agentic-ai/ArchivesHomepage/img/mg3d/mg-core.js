/* mg-core.js — ArchivesHomepage 3D 모션그래픽 런타임 (three r159 UMD · classic script)
 *
 * 장면 = scenes/<이름>.js 가 MG3D.register(name, def) 로 등록한다.
 *   def = { DUR, title, punch: [[글자, 색], …], punchAt, build(api), frame(t, api) }
 *   build 는 한 번 — 물체·라벨을 만든다. frame 은 매 프레임 — t 만으로 모든 상태를 정한다.
 *
 * 결정론: 화면은 t 만의 함수다. Math.random·Date 금지 — 난수는 api.U.rng(시드).
 *   라벨은 프레임마다 투명도 0 으로 초기화된다 → frame 에서 set 한 라벨만 보인다.
 *
 * 재생 규칙 (덱 iframe 연동)
 *   ?t=<초>               그 시점에 고정 (검증·stills)
 *   navigator.webdriver    decktape PDF — 메시지 무시, 끝 프레임만
 *   iframe 안              끝 프레임으로 대기 → 'slide:start'(Reveal) 재생 · 'slide:stop' 처음 프레임으로 정지
 *   단독(top-level)        자동 재생, 끝에서 멈춤 — 클릭하면 처음부터
 */
(function (root) {
  'use strict';

  var W = 1920, H = 1280;
  var C = {
    bg: '#FFFFFF', ink: '#0F172A', muted: '#64748B', line: '#CBD5E1', panel: '#F1F5F9',
    blue: '#2563EB', sky: '#DBEAFE', green: '#16A34A', mint: '#DCFCE7', red: '#DC2626',
    accent: '#D49B00', gold: '#FBBF24', navy: '#1E3A8A', white: '#FFFFFF',
  };
  var FONT = '"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
  var MONO = 'Menlo, Consolas, "Noto Sans KR", monospace';

  // ── 수학 ──────────────────────────────────────────────────────────────────
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function back(p) {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    var c = 1.70158;
    return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
  }
  function es(t, a, b) { return ease(seg(t, a, b)); }
  function eb(t, a, b) { return back(seg(t, a, b)); }
  function lerp(a, b, p) { return a + (b - a) * p; }
  function rng(seed) {            // mulberry32 — 같은 시드면 같은 수열
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var x = s;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  function bump(t, a, b) { var p = seg(t, a, b); return Math.sin(p * Math.PI); } // 0→1→0
  var U = { clamp: clamp, seg: seg, ease: ease, back: back, es: es, eb: eb, lerp: lerp, rng: rng, bump: bump };

  // ── 등록부 ────────────────────────────────────────────────────────────────
  var registry = {};
  var MG3D = root.MG3D = {
    W: W, H: H, C: C, FONT: FONT, U: U,
    register: function (name, def) { registry[name] = def; },
  };

  // ── DOM ───────────────────────────────────────────────────────────────────
  var stage, canvas, ov, titleEl, punchEl, fbEl;
  var scale = 1;
  function grabDom() {
    stage = document.getElementById('stage');
    canvas = document.getElementById('gl');
    ov = document.getElementById('ov');
    titleEl = document.getElementById('mg-title');
    punchEl = document.getElementById('mg-punch');
    fbEl = document.getElementById('mg-fallback');
  }
  function layoutStage() {
    var vw = window.innerWidth || W, vh = window.innerHeight || H;
    scale = Math.min(vw / W, vh / H);
    var sw = Math.round(W * scale), sh = Math.round(H * scale);
    stage.style.width = sw + 'px';
    stage.style.height = sh + 'px';
    stage.style.left = Math.round((vw - sw) / 2) + 'px';
    stage.style.top = Math.round((vh - sh) / 2) + 'px';
    ov.style.transform = 'scale(' + scale + ')';
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(sw, sh, false);
    }
  }

  function fail(msg) {
    if (!stage) grabDom();
    if (fbEl) {
      fbEl.textContent = msg || '3D 를 표시할 수 없음';
      fbEl.style.display = 'block';
    }
  }
  MG3D.fail = fail;

  // ── three 공통 ────────────────────────────────────────────────────────────
  var THREE = root.THREE;
  var renderer = null, scene = null, camera = null;
  var labels = [];
  var def = null, api = null, DUR = 10;

  function initGL() {
    THREE = root.THREE;
    if (!THREE) return false;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    } catch (e) {
      renderer = null;
      return false;
    }
    if (!renderer.getContext()) return false;
    renderer.setClearColor(0xFFFFFF, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);
    scene.fog = new THREE.Fog(0xFFFFFF, 34, 80);
    camera = new THREE.PerspectiveCamera(32, W / H, 0.5, 200);

    var hemi = new THREE.HemisphereLight(0xFFFFFF, 0xD7E0EA, 2.1);
    scene.add(hemi);
    var dir = new THREE.DirectionalLight(0xFFFFFF, 2.3);
    dir.position.set(-9, 20, 14);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    var sc = dir.shadow.camera;
    sc.left = -18; sc.right = 18; sc.top = 18; sc.bottom = -18; sc.near = 1; sc.far = 70;
    dir.shadow.bias = -0.0006;
    dir.shadow.radius = 5;
    scene.add(dir);
    var fill = new THREE.DirectionalLight(0xFFFFFF, 0.7);
    fill.position.set(10, 8, -6);
    scene.add(fill);

    var ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: 0.10 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    var grid = new THREE.GridHelper(240, 240, 0xE2E8F0, 0xEDF1F6);
    grid.position.y = 0.002;
    grid.material.transparent = true;
    grid.material.opacity = 0.85;
    scene.add(grid);
    layoutStage();
    return true;
  }

  // ── 재질·도형 ─────────────────────────────────────────────────────────────
  function col(c) { return new THREE.Color(c); }
  function mat(color, o) {
    o = o || {};
    var m = new THREE.MeshStandardMaterial({
      color: col(color),
      roughness: o.rough != null ? o.rough : 0.55,
      metalness: o.metal || 0,
      transparent: !!o.transparent || (o.opacity != null && o.opacity < 1),
      opacity: o.opacity != null ? o.opacity : 1,
      emissive: col(o.emissive || '#000000'),
      emissiveIntensity: o.ei != null ? o.ei : 1,
      side: o.side || THREE.FrontSide,
    });
    if (o.depthWrite === false) m.depthWrite = false;
    return m;
  }
  function basic(color, o) {
    o = o || {};
    // opaque: 불투명 판(다른 판이 겹쳐 얹히는 바탕) — 투명 정렬 순서에 따라 바탕이 지워지는 것을 막음
    var m = new THREE.MeshBasicMaterial({ color: col(color), transparent: !o.opaque, opacity: o.opacity != null ? o.opacity : 1 });
    if (o.map) { m.map = o.map; m.color = col('#FFFFFF'); }
    if (o.depthWrite === false) m.depthWrite = false;
    if (o.side) m.side = o.side;
    return m;
  }
  function mesh(geo, material, o) {
    var m = new THREE.Mesh(geo, material);
    m.castShadow = !(o && o.noShadow);
    m.receiveShadow = !!(o && o.receive);
    return m;
  }
  function rrShape(w, h, r) {
    var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    r = Math.min(r, w / 2, h / 2);
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  // 둥근 판 — 앞면이 +z, 두께 d 를 z 가운데로
  function slab(w, h, d, r, material, o) {
    var g = new THREE.ExtrudeGeometry(rrShape(w, h, r), { depth: d, bevelEnabled: false, curveSegments: 8 });
    g.translate(0, 0, -d / 2);
    return mesh(g, material, o);
  }
  function box(w, h, d, material, o) { return mesh(new THREE.BoxGeometry(w, h, d), material, o); }
  // 바닥이 y=0 인 상자 (높이 스케일용)
  function footBox(w, h, d, material, o) {
    var g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, h / 2, 0);
    return mesh(g, material, o);
  }
  function v3(p) { return p && p.isVector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]); }
  // 등장 — p(0..1) 만큼 크기, 0 이면 숨김
  function pop(o, p, base) {
    base = base == null ? 1 : base;
    o.visible = p > 0.001;
    var s = base * Math.max(p, 0.001);
    o.scale.set(s, s, s);
  }

  // ── 캔버스 텍스처 ─────────────────────────────────────────────────────────
  function canvasTex(w, h, draw) {
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    var g = cv.getContext('2d');
    draw(g, w, h);
    var tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }
  function rr2d(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  // 한빛기록관 미니 홈페이지 (세로형 = 휴대폰, 가로형 = 카드)
  var texCache = {};
  function pageTex(portrait) {
    var key = portrait ? 'pageP' : 'pageL';
    if (texCache[key]) return texCache[key];
    var w = 600, h = portrait ? 1080 : 760;
    texCache[key] = canvasTex(w, h, function (g) {
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h);
      var hh = portrait ? 230 : 190;
      g.fillStyle = C.navy; g.fillRect(0, 0, w, hh);
      g.fillStyle = '#FFFFFF'; g.font = '800 64px ' + FONT; g.textAlign = 'left'; g.textBaseline = 'middle';
      g.fillText('한빛기록관', 40, hh * 0.42);
      g.fillStyle = 'rgba(255,255,255,.55)'; rr2d(g, 40, hh * 0.68, w * 0.55, 18, 9); g.fill();
      var top = hh + 34;
      var cards = portrait ? 3 : 3;
      for (var i = 0; i < cards; i++) {
        var cx, cy, cw, ch;
        if (portrait) { cx = 40; cy = top + i * 150; cw = w - 80; ch = 128; }
        else { cw = (w - 80 - 40) / 3; ch = 220; cx = 40 + i * (cw + 20); cy = top; }
        g.fillStyle = '#EFF6FF'; rr2d(g, cx, cy, cw, ch, 18); g.fill();
        g.fillStyle = [C.blue, C.accent, C.green][i];
        g.beginPath(); g.arc(cx + (portrait ? 64 : cw / 2), cy + (portrait ? ch / 2 : 70), 30, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#CBD5E1';
        if (portrait) { rr2d(g, cx + 120, cy + 40, cw - 170, 16, 8); g.fill(); rr2d(g, cx + 120, cy + 72, cw - 240, 14, 7); g.fill(); }
        else { rr2d(g, cx + 20, cy + 130, cw - 40, 14, 7); g.fill(); rr2d(g, cx + 20, cy + 160, cw - 70, 12, 6); g.fill(); }
      }
      var gy = portrait ? top + 3 * 150 + 20 : top + 250;
      g.fillStyle = C.ink; g.font = '800 44px ' + FONT; g.fillText('방명록', 40, gy + 26);
      g.strokeStyle = '#94A3B8'; g.lineWidth = 4; rr2d(g, 40, gy + 64, w - 230, 60, 12); g.stroke();
      g.fillStyle = C.blue; rr2d(g, w - 170, gy + 64, 130, 60, 12); g.fill();
      var lines = portrait ? 4 : 2;
      for (var k = 0; k < lines; k++) {
        g.fillStyle = '#E2E8F0'; rr2d(g, 40, gy + 150 + k * 44, w - 80 - (k % 2) * 120, 20, 10); g.fill();
      }
    });
    return texCache[key];
  }
  function editorTex() {
    if (texCache.editor) return texCache.editor;
    var r = rng(7);
    texCache.editor = canvasTex(1024, 620, function (g, w, h) {
      g.fillStyle = '#0F172A'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#1E293B'; g.fillRect(0, 0, 110, h);
      for (var i = 0; i < 6; i++) { g.fillStyle = '#334155'; rr2d(g, 28, 40 + i * 70, 54, 40, 8); g.fill(); }
      var colors = ['#60A5FA', '#FBBF24', '#4ADE80', '#94A3B8', '#F472B6', '#94A3B8'];
      for (var l = 0; l < 13; l++) {
        var indent = (l % 4 === 0) ? 0 : (l % 4 === 3 ? 2 : 1);
        var x = 150 + indent * 34, len = 120 + r() * 360;
        g.fillStyle = colors[l % colors.length];
        rr2d(g, x, 36 + l * 42, len * 0.45, 18, 9); g.fill();
        g.fillStyle = '#64748B';
        rr2d(g, x + len * 0.45 + 14, 36 + l * 42, len * 0.4, 18, 9); g.fill();
      }
      g.fillStyle = '#111827'; g.fillRect(w * 0.68, 0, w * 0.32, h);
      g.fillStyle = '#E5E7EB'; rr2d(g, w * 0.70, 40, w * 0.26, 70, 14); g.fill();
      g.fillStyle = '#93C5FD'; rr2d(g, w * 0.75, 130, w * 0.21, 110, 14); g.fill();
      g.fillStyle = '#E5E7EB'; rr2d(g, w * 0.70, 260, w * 0.24, 90, 14); g.fill();
      g.fillStyle = '#1F2937'; rr2d(g, w * 0.70, h - 90, w * 0.28, 60, 14); g.fill();
    });
    return texCache.editor;
  }
  function glowTex(color) {
    var key = 'glow' + color;
    if (texCache[key]) return texCache[key];
    texCache[key] = canvasTex(256, 256, function (g) {
      var c = col(color);
      var rgb = Math.round(c.r * 255) + ',' + Math.round(c.g * 255) + ',' + Math.round(c.b * 255);
      // CanvasTexture 는 sRGB — Color 는 선형이므로 hex 를 직접 쓴다
      var hx = color.replace('#', '');
      rgb = parseInt(hx.substr(0, 2), 16) + ',' + parseInt(hx.substr(2, 2), 16) + ',' + parseInt(hx.substr(4, 2), 16);
      var gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, 'rgba(' + rgb + ',0.45)');
      gr.addColorStop(0.4, 'rgba(' + rgb + ',0.14)');
      gr.addColorStop(1, 'rgba(' + rgb + ',0)');
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    });
    return texCache[key];
  }
  function glow(color, size) {
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(color), transparent: true, depthWrite: false }));
    sp.scale.set(size, size, 1);
    return sp;
  }

  // ── 조립 부품 ─────────────────────────────────────────────────────────────
  var make = {
    // 모니터 — 화면 중심 높이 2.1, 앞면 +z
    monitor: function () {
      var g = new THREE.Group();
      var dark = mat(C.ink, { rough: 0.4 });
      var base = slab(1.6, 0.9, 0.1, 0.2, mat('#94A3B8'));
      base.rotation.x = -Math.PI / 2; base.position.set(0, 0.05, 0);
      var stand = box(0.32, 1.2, 0.26, mat('#94A3B8'));
      stand.position.set(0, 0.65, -0.12);
      var frame = slab(3.7, 2.3, 0.16, 0.14, dark);
      frame.position.set(0, 2.15, 0);
      var screen = mesh(new THREE.PlaneGeometry(3.46, 2.08), basic('#FFFFFF', { map: editorTex(), opaque: true }), { noShadow: true });
      screen.position.set(0, 2.15, 0.1);
      var kb = slab(2.6, 0.75, 0.08, 0.12, mat('#E2E8F0'));
      kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.045, 1.05);
      g.add(base, stand, frame, screen, kb);
      return { group: g, screen: screen };
    },
    // 휴대폰 — 세운 판, 화면은 빈 화면 위에 홈페이지가 투명도로 겹침
    phone: function () {
      var g = new THREE.Group();
      var body = slab(0.98, 1.9, 0.12, 0.16, mat(C.ink, { rough: 0.35 }));
      body.position.y = 0.95;
      var blank = mesh(new THREE.PlaneGeometry(0.86, 1.7), basic('#E2E8F0', { opaque: true }), { noShadow: true });
      blank.position.set(0, 0.95, 0.075);
      var pageM = basic('#FFFFFF', { map: pageTex(true), opacity: 0 });
      var page = mesh(new THREE.PlaneGeometry(0.86, 1.7), pageM, { noShadow: true });
      page.position.set(0, 0.95, 0.085);
      var hiM = basic(C.green, { opacity: 0 });
      var hi = mesh(new THREE.PlaneGeometry(0.7, 0.07), hiM, { noShadow: true });
      hi.position.set(0, 0.42, 0.095);
      g.add(body, blank, page, hi);
      return { group: g, pageMat: pageM, hiMat: hiM };
    },
    // 지구본 — 위·경도 선 + 빛나는 점
    globe: function (r, seed, nodes) {
      var g = new THREE.Group(), spin = new THREE.Group();
      g.add(spin);
      var core = mesh(new THREE.SphereGeometry(r, 48, 32), mat('#E0ECFF', { rough: 0.85 }));
      spin.add(core);
      var lm = new THREE.LineBasicMaterial({ color: col(C.blue), transparent: true, opacity: 0.45 });
      var i, k, pts;
      for (i = -2; i <= 2; i++) {        // 위도 선
        var la = i * Math.PI / 7, rr = r * 1.004 * Math.cos(la), yy = r * 1.004 * Math.sin(la);
        pts = [];
        for (k = 0; k <= 64; k++) { var a = k / 64 * Math.PI * 2; pts.push(new THREE.Vector3(rr * Math.cos(a), yy, rr * Math.sin(a))); }
        spin.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lm));
      }
      for (i = 0; i < 6; i++) {          // 경도 선
        var lo = i * Math.PI / 6;
        pts = [];
        for (k = 0; k <= 64; k++) {
          var b = k / 64 * Math.PI * 2;
          pts.push(new THREE.Vector3(r * 1.004 * Math.cos(b) * Math.cos(lo), r * 1.004 * Math.sin(b), r * 1.004 * Math.cos(b) * Math.sin(lo)));
        }
        spin.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lm));
      }
      var rnd = rng(seed || 3), list = [];
      var nm = basic(C.accent), offM = basic('#93C5FD');
      for (i = 0; i < (nodes || 24); i++) {
        var u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u);
        var p = new THREE.Vector3(r * 1.02 * s * Math.cos(th), r * 1.02 * u * 0.85, r * 1.02 * s * Math.sin(th));
        var dot = mesh(new THREE.SphereGeometry(r * 0.055, 12, 8), offM, { noShadow: true });
        dot.position.copy(p);
        var on = mesh(new THREE.SphereGeometry(r * 0.065, 12, 8), nm, { noShadow: true });
        on.position.copy(p);
        var gl = glow(C.accent, r * 0.32);
        gl.position.copy(p);
        spin.add(dot, on, gl);
        list.push({ off: dot, on: on, glow: gl, order: rnd() });
      }
      list.sort(function (a, b2) { return a.order - b2.order; });
      return {
        group: g, spin: spin, nodes: list,
        light: function (p) {             // p: 0..1 — 켜진 점 비율
          for (var j = 0; j < list.length; j++) {
            var lit = clamp(p * list.length - j, 0, 1);
            list[j].on.visible = lit > 0;
            list[j].on.scale.setScalar(0.4 + 0.6 * lit);
            list[j].glow.visible = lit > 0;
            list[j].glow.material.opacity = lit;
          }
        },
      };
    },
    // DB 원통 — 원판 n 장, 아래부터 쌓임
    db: function (r, n, color) {
      var g = new THREE.Group(), discs = [];
      var m1 = mat(color || C.green, { rough: 0.45 }), m2 = mat('#BBF7D0', { rough: 0.5 });
      var step = 0.46;
      for (var i = 0; i < n; i++) {
        var d = new THREE.Group();
        var body = mesh(new THREE.CylinderGeometry(r, r, 0.36, 56), m1);
        body.position.y = 0.18;
        var band = mesh(new THREE.CylinderGeometry(r * 1.003, r * 1.003, 0.05, 56), m2, { noShadow: true });
        band.position.y = 0.33;
        d.add(body, band);
        d.position.y = i * step;
        g.add(d);
        discs.push(d);
      }
      return {
        group: g, discs: discs, step: step,
        fill: function (k, pop) {         // k: 보이는 원판 수(실수 — 소수부는 떨어지는 중)
          for (var j = 0; j < discs.length; j++) {
            var a = clamp(k - j, 0, 1);
            discs[j].visible = a > 0;
            discs[j].position.y = j * step + (1 - back(a)) * 1.6;
            discs[j].scale.setScalar(a > 0 ? 0.9 + 0.1 * a : 1);
          }
        },
        top: function (k) { return Math.max(0, Math.ceil(k)) * step; },
      };
    },
    // 사람 실루엣
    person: function (color) {
      var g = new THREE.Group(), m = mat(color || C.blue, { rough: 0.5 });
      var body = mesh(new THREE.CapsuleGeometry(0.55, 1.0, 8, 20), m);
      body.position.y = 1.1;
      var head = mesh(new THREE.SphereGeometry(0.44, 32, 20), m);
      head.position.y = 2.42;
      g.add(body, head);
      return g;
    },
    // 폴더 — 세운 판, 앞면 +z
    folder: function () {
      var g = new THREE.Group();
      var backM = mat(C.accent, { rough: 0.5 }), frontM = mat(C.gold, { rough: 0.5 });
      var bk = slab(2.4, 1.7, 0.16, 0.12, backM); bk.position.set(0, 0.85, -0.12);
      var tab = slab(0.95, 0.5, 0.16, 0.1, backM); tab.position.set(-0.7, 1.75, -0.12);
      var paperM = mat('#FFFFFF', { rough: 0.7 });
      var p1 = box(2.0, 1.5, 0.03, paperM); p1.position.set(0.05, 1.0, 0.0); p1.rotation.z = -0.04;
      var p2 = box(2.0, 1.5, 0.03, paperM); p2.position.set(-0.05, 1.05, 0.03); p2.rotation.z = 0.05;
      var fr = slab(2.4, 1.35, 0.14, 0.12, frontM); fr.position.set(0, 0.68, 0.14);
      g.add(bk, tab, p1, p2, fr);
      return g;
    },
    // 열쇠
    key: function (color) {
      var g = new THREE.Group(), m = mat(color || C.accent, { rough: 0.35, metal: 0.2 });
      var ring = mesh(new THREE.TorusGeometry(0.26, 0.08, 12, 32), m);
      var shaft = box(0.85, 0.12, 0.1, m); shaft.position.x = 0.68;
      var t1 = box(0.1, 0.22, 0.1, m); t1.position.set(0.95, -0.14, 0);
      var t2 = box(0.1, 0.16, 0.1, m); t2.position.set(0.78, -0.11, 0);
      g.add(ring, shaft, t1, t2);
      return g;
    },
    // 자물쇠
    padlock: function (color) {
      var g = new THREE.Group(), m = mat(color || C.accent, { rough: 0.4, metal: 0.15 });
      var body = slab(0.9, 0.72, 0.32, 0.12, m);
      var sh = mesh(new THREE.TorusGeometry(0.28, 0.07, 12, 32, Math.PI), mat('#94A3B8', { rough: 0.3, metal: 0.4 }));
      sh.position.y = 0.36;
      var hole = mesh(new THREE.CircleGeometry(0.08, 20), basic(C.ink), { noShadow: true });
      hole.position.set(0, 0.02, 0.165);
      g.add(body, sh, hole);
      return g;
    },
    // 방명록 카드 (이름 · 한 줄)
    card: function (color) {
      var key = 'card' + (color || C.blue);
      if (!texCache[key]) {
        texCache[key] = canvasTex(320, 200, function (g, w, h) {
          g.fillStyle = '#FFFFFF'; rr2d(g, 4, 4, w - 8, h - 8, 22); g.fill();
          g.strokeStyle = color || C.blue; g.lineWidth = 8; rr2d(g, 6, 6, w - 12, h - 12, 20); g.stroke();
          g.fillStyle = color || C.blue; rr2d(g, 34, 46, 110, 30, 15); g.fill();
          g.fillStyle = '#CBD5E1'; rr2d(g, 34, 104, 250, 24, 12); g.fill(); rr2d(g, 34, 142, 190, 22, 11); g.fill();
        });
      }
      var m = basic('#FFFFFF', { map: texCache[key], side: THREE.DoubleSide });
      return mesh(new THREE.PlaneGeometry(1.1, 0.7), m, { noShadow: true });
    },
    // 글자 판 — 텍스처에 큰 글자 (장면 속 사물에 붙는 글자)
    textPlate: function (text, o) {
      o = o || {};
      var w = o.w || 640, h = o.h || 240, bg = o.bg || C.accent, fg = o.fg || '#FFFFFF';
      var tex = canvasTex(w, h, function (g) {
        g.fillStyle = bg; rr2d(g, 0, 0, w, h, o.r != null ? o.r : 40); g.fill();
        g.fillStyle = fg; g.font = '800 ' + (o.size || 110) + 'px ' + FONT;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(text, w / 2, h / 2 + 6);
      });
      var m = basic('#FFFFFF', { map: tex, side: THREE.DoubleSide });
      return mesh(new THREE.PlaneGeometry(o.pw || 2.4, (o.pw || 2.4) * h / w), m, { noShadow: true });
    },
  };

  // ── 호(arc) — 점선 구슬 ───────────────────────────────────────────────────
  function arc(a, b, h, o) {
    o = o || {};
    var A = v3(a), B = v3(b), M = A.clone().add(B).multiplyScalar(0.5);
    M.y += h;
    var curve = new THREE.QuadraticBezierCurve3(A, M, B);
    var n = o.n || 22, grp = new THREE.Group(), dots = [];
    var geo = new THREE.SphereGeometry(o.r || 0.075, 10, 8);
    var m = basic(o.color || C.blue, { opacity: 1 });
    for (var i = 0; i < n; i++) {
      var d = new THREE.Mesh(geo, m);
      d.position.copy(curve.getPoint((i + 0.5) / n));
      grp.add(d);
      dots.push(d);
    }
    scene.add(grp);
    return {
      curve: curve, group: grp, mat: m,
      // from..to 구간만 보이게 (0..1) — 그리기·지우기 모두 이것으로
      set: function (to, alpha, from) {
        from = from || 0;
        var vis = (alpha == null ? 1 : alpha) > 0.001;
        for (var j = 0; j < n; j++) { var u = (j + 0.5) / n; dots[j].visible = vis && u <= to && u >= from; }
        m.opacity = alpha == null ? 1 : alpha;
      },
      at: function (u) { return curve.getPoint(clamp(u, 0, 1)); },
    };
  }

  // ── HTML 라벨 (3D 점에 붙는 선명한 글자) ─────────────────────────────────
  var ANCH = {
    b: [-50, -100, '50% 100%'], t: [-50, 0, '50% 0%'], c: [-50, -50, '50% 50%'],
    l: [0, -50, '0% 50%'], r: [-100, -50, '100% 50%'],
    bl: [0, -100, '0% 100%'], br: [-100, -100, '100% 100%'],
    tl: [0, 0, '0% 0%'], tr: [-100, 0, '100% 0%'],
  };
  function Label(html, o) {
    o = o || {};
    var el = document.createElement('div');
    el.className = 'lbl ' + (o.cls || 'tag');
    if (o.color) el.style.setProperty('--c', o.color);
    if (o.size) el.style.fontSize = o.size + 'px';
    el.innerHTML = html;
    ov.appendChild(el);
    this.el = el;
    this.anchor = ANCH[o.anchor || 'b'];
    el.style.transformOrigin = this.anchor[2];
    this.dx = o.dx || 0;
    this.dy = o.dy || 0;
    this.p = new THREE.Vector3();
    this.a = 0;
    this.s = 1;
    this.screen = !!o.screen;   // true 면 p 를 화면 좌표(1920×1280)로
  }
  Label.prototype.set = function (pos, a, s) {
    if (pos) { if (pos.isVector3) this.p.copy(pos); else this.p.set(pos[0], pos[1], pos[2] || 0); }
    this.a = a == null ? 1 : a;
    this.s = s == null ? 1 : s;
    return this;
  };
  Label.prototype.html = function (h) { if (this._h !== h) { this.el.innerHTML = h; this._h = h; } return this; };
  var tmpV = null;
  function placeLabel(l) {
    if (l.a <= 0.002) { l.el.style.display = 'none'; return; }
    var x, y;
    if (l.screen) { x = l.p.x; y = l.p.y; }
    else {
      tmpV.copy(l.p).project(camera);
      if (tmpV.z > 1) { l.el.style.display = 'none'; return; }
      x = (tmpV.x + 1) / 2 * W;
      y = (1 - tmpV.y) / 2 * H;
    }
    x += l.dx; y += l.dy;
    l.el.style.display = 'block';
    l.el.style.opacity = String(clamp(l.a, 0, 1));
    l.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(' +
      l.anchor[0] + '%,' + l.anchor[1] + '%) scale(' + l.s.toFixed(3) + ')';
  }

  // ── 카메라 ────────────────────────────────────────────────────────────────
  function orbit(target, r, azDeg, elDeg) {
    var az = azDeg * Math.PI / 180, el = elDeg * Math.PI / 180;
    camera.position.set(
      target[0] + r * Math.cos(el) * Math.sin(az),
      target[1] + r * Math.sin(el),
      target[2] + r * Math.cos(el) * Math.cos(az));
    camera.lookAt(target[0], target[1], target[2]);
  }

  // ── 제목 · 한 줄 결론 (HTML 오버레이) ─────────────────────────────────────
  function setupOverlay() {
    titleEl.innerHTML = (def.title || '') + '<span class="bar"></span>';
    var parts = def.punch || [];
    var html = '';
    for (var i = 0; i < parts.length; i++) {
      html += '<span style="color:' + (parts[i][1] || C.ink) + '">' + parts[i][0] + '</span>';
    }
    punchEl.innerHTML = '<span class="pill">' + html + '</span>';
  }
  function drawOverlay(t) {
    var a = seg(t, 0.05, 0.45), s = lerp(1.25, 1, back(seg(t, 0.05, 0.8)));
    titleEl.style.opacity = String(a);
    titleEl.style.transform = 'scale(' + s.toFixed(3) + ')';
    var bar = titleEl.querySelector('.bar');
    if (bar) bar.style.width = Math.round(360 * es(t, 0.5, 1.1)) + 'px';
    var pa = es(t, def.punchAt, def.punchAt + 0.7);
    punchEl.style.opacity = String(pa);
    punchEl.style.transform = 'translateY(' + ((1 - pa) * 26).toFixed(1) + 'px)';
  }

  // ── 프레임 ────────────────────────────────────────────────────────────────
  var curT = 0;
  function renderAt(t) {
    t = clamp(t, 0, DUR);
    curT = t;
    drawOverlay(t);
    if (!renderer) return;
    for (var i = 0; i < labels.length; i++) labels[i].a = 0;
    def.frame(t, api);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    for (var j = 0; j < labels.length; j++) placeLabel(labels[j]);
  }
  MG3D.renderAt = function (t) { renderAt(t); };

  // 검증 — ?t= 고정 시 라벨이 가장자리(40px)에 닿거나 서로·제목·결론과 겹치면 콘솔에 남김
  function boxOf(el) {
    var r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return { l: (r.left - s.left) / scale, t: (r.top - s.top) / scale, r: (r.right - s.left) / scale, b: (r.bottom - s.top) / scale };
  }
  function hit(a, b) { return a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b; }
  function auditLayout() {
    var vis = [], i, j, M = 40;
    for (i = 0; i < labels.length; i++) {
      if (labels[i].el.style.display === 'none' || labels[i].a < 0.5) continue;
      vis.push({ name: labels[i].el.textContent, box: boxOf(labels[i].el) });
    }
    if (parseFloat(titleEl.style.opacity) > 0.5) vis.push({ name: '[제목]', box: boxOf(titleEl), fixed: true });
    if (parseFloat(punchEl.style.opacity) > 0.5) vis.push({ name: '[결론]', box: boxOf(punchEl.querySelector('.pill')), fixed: true });
    var bad = 0;
    for (i = 0; i < vis.length; i++) {
      var b = vis[i].box;
      if (!vis[i].fixed && (b.l < M || b.t < M || b.r > W - M || b.b > H - M)) {
        console.warn('MG3D-EDGE ' + vis[i].name + ' ' + [b.l, b.t, b.r, b.b].map(Math.round).join(','));
        bad++;
      }
      for (j = i + 1; j < vis.length; j++) {
        if (hit(vis[i].box, vis[j].box)) { console.warn('MG3D-OVERLAP ' + vis[i].name + ' × ' + vis[j].name); bad++; }
      }
    }
    console.warn('MG3D-AUDIT t=' + curT + ' labels=' + vis.length + ' issues=' + bad);
  }

  // 덱(Reveal)의 'slide:start'/'slide:stop' — 장면 스크립트 로드 전에 와도 잃지 않게 core 로드 시점에 받는다
  var earlyMsg = null, onMsg = null;
  window.addEventListener('message', function (e) {
    var d = e && e.data;
    if (d !== 'slide:start' && d !== 'slide:stop') return;
    if (onMsg) onMsg(d); else earlyMsg = d;
  });

  var playing = false, t0 = null, raf = 0;
  function tick(ts) {
    if (!playing) return;
    if (t0 === null) t0 = ts;
    var t = (ts - t0) / 1000;
    renderAt(Math.min(t, DUR));
    if (t >= DUR) { playing = false; return; }
    raf = requestAnimationFrame(tick);
  }
  function play() {
    playing = true;
    t0 = null;
    cancelAnimationFrame(raf);
    renderAt(0);
    raf = requestAnimationFrame(tick);
  }
  function stopAt(t) {
    playing = false;
    cancelAnimationFrame(raf);
    renderAt(t);
  }
  MG3D.play = play;

  // ── 부팅 ──────────────────────────────────────────────────────────────────
  function loadFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var want = ['800 40px "Noto Sans KR"', '700 40px "Noto Sans KR"', '800 40px "Malgun Gothic"', '800 40px "Apple SD Gothic Neo"'];
    var all = Promise.all(want.map(function (f) { return document.fonts.load(f, '한빛기록관').catch(function () { return []; }); }));
    var timeout = new Promise(function (res) { setTimeout(res, 1500); });
    return Promise.race([all, timeout]).then(function () { return document.fonts.ready; });
  }

  MG3D.boot = function (name) {
    grabDom();
    def = registry[name];
    if (!def) { fail('장면 없음: ' + name); return; }
    DUR = def.DUR || 10;
    if (def.punchAt == null) def.punchAt = DUR - 2;
    setupOverlay();
    layoutStage();
    window.addEventListener('resize', function () { layoutStage(); renderAt(curT); });

    var q = location.search;
    var mt = q.match(/[?&]t=([0-9.]+)/);
    var seekT = mt ? parseFloat(mt[1]) : null;
    var inFrame = false;
    try { inFrame = window.parent !== window; } catch (e) { inFrame = true; }
    var webdriver = !!navigator.webdriver;
    var pending = earlyMsg; // 준비 전에 온 메시지
    var ready = false;
    onMsg = function (d) {
      if (seekT !== null || webdriver) return;
      if (!ready) { pending = d; return; }
      if (d === 'slide:start') play();
      else stopAt(0);
    };

    loadFonts().then(function () {
      if (!initGL()) {
        fail('3D 를 표시할 수 없음');
        drawOverlay(DUR);
        return;
      }
      tmpV = new THREE.Vector3();
      api = {
        THREE: THREE, scene: scene, camera: camera, renderer: renderer,
        C: C, U: U, FONT: FONT, MONO: MONO, W: W, H: H,
        mat: mat, basic: basic, mesh: mesh, box: box, footBox: footBox, slab: slab, v3: v3, pop: pop,
        canvasTex: canvasTex, rr2d: rr2d, glow: glow, make: make, pageTex: pageTex,
        arc: arc, orbit: orbit,
        label: function (html, o) { var l = new Label(html, o); labels.push(l); return l; },
      };
      def.build(api);
      ready = true;
      if (seekT !== null) { stopAt(seekT); auditLayout(); return; }
      if (webdriver) { stopAt(DUR); return; }
      if (inFrame) {
        if (pending === 'slide:start') play();
        else stopAt(DUR);
        return;
      }
      play();
      document.addEventListener('click', play);
    });
  };
})(window);
