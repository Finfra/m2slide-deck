// scene.js — Agentic Coding 강의 모션그래픽 01-concepts (4가지 개념) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s01-concepts.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — Agentic Coding 덱 mg 6개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: DesignRndAI mg/_src/common.js — 같은 default_lec 색 체계. 판형만 3:2(1620×1080)로 넓힘
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1620, H = 1080;
var X0 = 70, X1 = W - 70, CW = X1 - X0; // 본문 좌우 여백 70 — 본문 폭 1480
var C = {
  bg: '#FFFDF6', ink: '#222222', sub: '#4A4A44', muted: '#8A877A', line: '#E3DFD0', paper: '#FFFFFF',
  brand: '#F5C518', brandInk: '#7A6000', tint: '#FFF6D5',
  blue: '#0365C0', blueTint: '#EAF2FB', red: '#C82506', redTint: '#FDECE8', green: '#1F7A4D', greenTint: '#E4F3EA',
};
var KR = '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
var MONO = 'Menlo, "SF Mono", monospace';

// ── 수학 ──────────────────────────────────────────────────────────────────
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function seg(T, a, b) { return clamp((T - a) / (b - a), 0, 1); }
function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
function es(T, a, b) { return ease(seg(T, a, b)); }
function lerp(a, b, p) { return a + (b - a) * p; }
function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
function rgba(c, a) { var x = hex(c); return 'rgba(' + x[0] + ',' + x[1] + ',' + x[2] + ',' + a + ')'; }

// ── 도형 ──────────────────────────────────────────────────────────────────
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
// 카드 — o: {fill, stroke, lw, r, alpha, shadow}
function card(ctx, x, y, w, h, o) {
  o = o || {};
  ctx.save();
  ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha);
  if (o.shadow !== 0) {
    ctx.shadowColor = 'rgba(60,50,10,0.13)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 8;
  }
  ctx.fillStyle = o.fill || C.paper;
  rr(ctx, x, y, w, h, o.r == null ? 20 : o.r);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = o.stroke || C.line;
  ctx.lineWidth = o.lw || 2;
  ctx.stroke();
  ctx.restore();
}
// 글자 — size px, weight, color, align(left|center|right), 기준선 middle
function txt(ctx, s, x, y, size, weight, color, align, font) {
  ctx.font = weight + ' ' + size + 'px ' + (font || KR);
  ctx.fillStyle = color;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}
// 칸 폭 maxW 를 넘으면 글자 크기를 줄여 맞춘다 — 글꼴이 바뀌어도 잘리지 않게
function fit(ctx, s, x, y, size, weight, color, align, maxW, font) {
  ctx.font = weight + ' ' + size + 'px ' + (font || KR);
  var w = ctx.measureText(s).width;
  if (maxW && w > maxW) size = Math.floor(size * maxW / w);
  txt(ctx, s, x, y, size, weight, color, align, font);
}
function lines(ctx, arr, x, y, step, size, weight, color, align) {
  for (var i = 0; i < arr.length; i++) txt(ctx, arr[i], x, y + i * step, size, weight, color, align);
}
// 화살표 — 시작점에서 p(0~1) 만큼 그려진다
function arrow(ctx, x1, y1, x2, y2, p, color, lw) {
  if (p <= 0) return;
  var x = lerp(x1, x2, p), y = lerp(y1, y2, p), a = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw || 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke();
  if (p > 0.85) {
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 22 * Math.cos(a - 0.45), y2 - 22 * Math.sin(a - 0.45));
    ctx.lineTo(x2 - 22 * Math.cos(a + 0.45), y2 - 22 * Math.sin(a + 0.45));
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
// 검증 도장 — ✓ (색 원 + 체크)
function stamp(ctx, cx, cy, r, p, color) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 1.6);
  var s = lerp(1.5, 1, p);
  ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.42, 0); ctx.lineTo(-r * 0.1, r * 0.34); ctx.lineTo(r * 0.45, -r * 0.34); ctx.stroke();
  ctx.restore();
}
function crossmark(ctx, cx, cy, r, p, color) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 1.6);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - r * 0.36, cy - r * 0.36); ctx.lineTo(cx + r * 0.36, cy + r * 0.36);
  ctx.moveTo(cx + r * 0.36, cy - r * 0.36); ctx.lineTo(cx - r * 0.36, cy + r * 0.36); ctx.stroke();
  ctx.restore();
}
// 문서 아이콘 — 접힌 모서리 + 본문 줄
function doc(ctx, x, y, w, h, o) {
  o = o || {};
  var f = Math.min(w, h) * 0.22;
  ctx.save();
  ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha);
  ctx.shadowColor = 'rgba(60,50,10,0.13)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
  ctx.fillStyle = o.fill || C.paper;
  ctx.beginPath();
  ctx.moveTo(x + 10, y); ctx.lineTo(x + w - f, y); ctx.lineTo(x + w, y + f); ctx.lineTo(x + w, y + h - 10);
  ctx.arcTo(x + w, y + h, x + w - 10, y + h, 10); ctx.lineTo(x + 10, y + h); ctx.arcTo(x, y + h, x, y + h - 10, 10);
  ctx.lineTo(x, y + 10); ctx.arcTo(x, y, x + 10, y, 10); ctx.closePath(); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = o.stroke || C.line; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = C.line;
  ctx.beginPath(); ctx.moveTo(x + w - f, y); ctx.lineTo(x + w - f, y + f); ctx.lineTo(x + w, y + f); ctx.closePath(); ctx.fill();
  var n = o.rows == null ? 4 : o.rows;
  for (var i = 0; i < n; i++) ctx.fillRect(x + 18, y + f + 18 + i * 20, (w - 36) * (i === n - 1 ? 0.55 : 1), 7);
  ctx.restore();
}

// 둥근 알약 꼬리표 — 가운데 정렬 글자
function pill(ctx, s, cx, cy, w, h, fill, color, size, weight) {
  ctx.fillStyle = fill;
  rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fill();
  fit(ctx, s, cx, cy + 1, size, weight || 800, color, 'center', w - 24);
}

// ── 공통 틀: 머리(칩 + 제목) · 아래 한 줄 ────────────────────────────────────
function header(ctx, T, chip, title, a) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  pill(ctx, chip, X0 + 100, 93, 200, 62, C.brand, C.ink, 34, 800);
  fit(ctx, title, X0 + 228, 94 + (1 - p) * 10, 52, 800, C.ink, 'left', X1 - X0 - 228);
  ctx.fillStyle = C.brand;
  ctx.fillRect(X0, 148, CW * p, 6);
  ctx.restore();
}
function footer(ctx, T, s, a, color) {
  var p = es(T, a, a + 0.8);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  fit(ctx, s, W / 2, 1010 + (1 - p) * 12, 38, 700, color || C.brandInk, 'center', CW);
  ctx.restore();
}
function backdrop(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
}

// 장면 ② — 4가지 개념 (원고 근거: 01-part1 «바이브 코딩이란?» ~ «Agentic Engineering이란?» + «4가지 개념 한눈에 비교표»)
var NAME = 'mg-01-concepts', DUR = 17;
var TL = { st0: 1.0, step: 1.8, axis: 8.6, absorb: 10.0, intro: 11.6, grad: 12.4, foot: 14.2 };
var STEPS = [
  ['바이브 코딩', '자연어 대화로 즉흥 개발', '휘발성 · 1회용 코드'],
  ['프롬프트 엔지니어링', '단발 요청을 정교화', '단발성 · 재사용 어려움'],
  ['하네스', '도구 + 규칙 + 맥락 + 후크', '반복 · 재현 가능한 작업 환경'],
  ['Agentic Engineering', '격리 · 재현성 · 검증 · 문서화', '장기 유지보수 · 확장'],
];
var SW = 350, SGAP = (CW - SW * 4) / 3, SB = 850; // 계단 바닥
function stepX(i) { return X0 + i * (SW + SGAP); }
function stepY(i) { return 600 - i * 100; }
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'Part 1', '4가지 개념 — 입문에서 졸업까지', 0.2);
  for (var i = 0; i < 4; i++) {
    var a = TL.st0 + TL.step * i, p = es(T, a, a + 0.8);
    if (p <= 0) continue;
    var x = stepX(i), top = stepY(i), h = (SB - top) * p, y = SB - h, last = i === 3;
    var hi = last ? es(T, TL.grad, TL.grad + 0.6) : 0;
    card(ctx, x, y, SW, h, { fill: last ? C.tint : C.paper, stroke: hi > 0 ? C.brand : C.line, lw: 2 + 3 * hi });
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, SW, h); ctx.clip();
    ctx.fillStyle = C.brand; ctx.fillRect(x + 24, y + 26, 54, 8);
    fit(ctx, STEPS[i][0], x + 24, y + 74, 36, 800, C.ink, 'left', SW - 48);
    ctx.globalAlpha = es(T, a + 0.6, a + 1.1);
    fit(ctx, STEPS[i][1], x + 24, y + 134, 27, 600, C.sub, 'left', SW - 48);
    ctx.globalAlpha = es(T, a + 1.0, a + 1.5);
    fit(ctx, STEPS[i][2], x + 24, y + 182, 27, 800, last || i === 2 ? C.green : C.red, 'left', SW - 48);
    ctx.restore();
  }
  // 아래 축 — 1회용 → 지속 가능
  var pa = es(T, TL.axis, TL.axis + 1.2);
  arrow(ctx, X0 + 10, 900, X1 - 10, 900, pa, C.muted, 5);
  if (pa > 0) {
    ctx.save(); ctx.globalAlpha = pa;
    txt(ctx, '1회용', X0 + 10, 940, 28, 700, C.red, 'left');
    txt(ctx, '지속 가능', X1 - 10, 940, 28, 700, C.green, 'right');
    ctx.restore();
  }
  // 프롬프트 → Skill·Rule 흡수 — 2칸 위에서 3칸 위로 곡선 화살표
  var pb = es(T, TL.absorb, TL.absorb + 1.0);
  if (pb > 0) {
    var sx = stepX(1) + SW * 0.62, sy = stepY(1) - 14, ex = stepX(2) + SW * 0.38, ey = stepY(2) - 14;
    var mx = (sx + ex) / 2, my = Math.min(sy, ey) - 90;
    ctx.save();
    ctx.strokeStyle = C.blue; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy);
    var n = 24, k;
    for (k = 1; k <= Math.round(n * pb); k++) {
      var u = k / n, qx = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * mx + u * u * ex, qy = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * my + u * u * ey;
      ctx.lineTo(qx, qy);
    }
    ctx.stroke();
    if (pb > 0.9) {
      ctx.fillStyle = C.blue; ctx.beginPath();
      ctx.moveTo(ex, ey + 4); ctx.lineTo(ex - 20, ey - 16); ctx.lineTo(ex + 4, ey - 22); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = es(T, TL.absorb + 0.5, TL.absorb + 1.1);
    pill(ctx, '프롬프트 → Skill·Rule 에 흡수', mx, my - 30, 380, 48, C.blueTint, C.blue, 26, 800);
    ctx.restore();
  }
  // 입문 · 졸업 표지
  var pi = es(T, TL.intro, TL.intro + 0.6), pg = es(T, TL.grad, TL.grad + 0.6);
  if (pi > 0) { ctx.save(); ctx.globalAlpha = pi; pill(ctx, '입문', stepX(1) + 70, stepY(1) - 40, 110, 46, C.ink, '#FFFFFF', 26, 800); ctx.restore(); }
  if (pg > 0) {
    var fx = stepX(3) + SW - 60, fy = stepY(3) - 14;
    ctx.save(); ctx.globalAlpha = pg;
    ctx.fillStyle = C.ink; ctx.fillRect(fx - 3, fy - 110 * pg, 6, 110 * pg);
    ctx.fillStyle = C.brand; ctx.beginPath();
    ctx.moveTo(fx + 3, fy - 110 * pg); ctx.lineTo(fx + 3 - 110, fy - 110 * pg + 2); ctx.lineTo(fx + 3 - 110, fy - 110 * pg + 50); ctx.lineTo(fx + 3, fy - 110 * pg + 52); ctx.closePath(); ctx.fill();
    txt(ctx, '졸업', fx - 52, fy - 110 * pg + 27, 26, 800, C.ink, 'center');
    ctx.restore();
  }
  footer(ctx, T, '프롬프트 엔지니어링은 입문, Agentic Engineering은 졸업', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
