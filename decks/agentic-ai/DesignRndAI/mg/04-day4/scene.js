// scene.js — 설계·R&D AI 강의 모션그래픽 04-day4 (4일차 쓰기) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s04-day4.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — 7개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1440, H = 1080;
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

// ── 공통 틀: 머리(일차 칩 + 제목) · 아래 한 줄 ───────────────────────────────
function header(ctx, T, chip, title, a) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.fillStyle = C.brand;
  rr(ctx, 70, 62, 178, 62, 31);
  ctx.fill();
  txt(ctx, chip, 159, 93, 34, 800, C.ink, 'center');
  txt(ctx, title, 276, 94 + (1 - p) * 10, 52, 800, C.ink, 'left');
  ctx.fillStyle = C.brand;
  ctx.fillRect(70, 148, 1300 * p, 6);
  ctx.restore();
}
function footer(ctx, T, s, a, color) {
  var p = es(T, a, a + 0.8);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  txt(ctx, s, 720, 1010 + (1 - p) * 12, 38, 700, color || C.brandInk, 'center');
  ctx.restore();
}
function backdrop(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
}

// 장면 ⑤ — 4일차 쓰기 (원고 근거: 4-0 «하루가 직렬로 이어짐»·«검증 원칙 — 숫자는 전부 대조함»)
var NAME = 'mg-04-day4', DUR = 17;
var TL = { data: 0.8, e1: 2.4, e2: 3.2, n1: 3.0, n2: 3.8, e3: 6.0, n3: 6.4, e4: 7.6, e5: 8.4, n4: 8.0, band: 11.0, stamp: 13.0, foot: 14.6 };
var N = {
  data: { x: 70, y: 400, w: 270, h: 170, t: ['3일차 정제 데이터', '+ 그래프 2종'], tag: '' },
  rep:  { x: 470, y: 230, w: 360, h: 170, t: ['4-1 기술 보고서', '5부 구조 초안'], tag: '' },
  cert: { x: 470, y: 580, w: 360, h: 170, t: ['4-2 시험 성적서', '규격·측정·판정'], tag: '' },
  abs:  { x: 960, y: 230, w: 410, h: 170, t: ['4-3 영문 초록', '번역 아닌 재작성'], tag: '' },
  deck: { x: 960, y: 580, w: 410, h: 170, t: ['4-4 발표 덱', '아웃라인 먼저'], tag: '' },
};
function node(ctx, T, n, a, big) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  var y = n.y + (1 - p) * 24;
  card(ctx, n.x, y, n.w, n.h, { fill: big ? C.brand : C.paper, stroke: big ? C.brandInk : C.line, lw: big ? 3 : 2 });
  txt(ctx, n.t[0], n.x + n.w / 2, y + 62, 34, 800, C.ink, 'center');
  txt(ctx, n.t[1], n.x + n.w / 2, y + 114, 29, 500, big ? C.ink : C.muted, 'center');
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '4일차', '쓰기 — 한 데이터에서 네 문서로', 0.2);
  node(ctx, T, N.data, TL.data, true);
  arrow(ctx, 345, 450, 462, 345, es(T, TL.e1, TL.e1 + 0.7), C.brandInk, 5);
  arrow(ctx, 345, 520, 462, 640, es(T, TL.e2, TL.e2 + 0.7), C.brandInk, 5);
  node(ctx, T, N.rep, TL.n1);
  node(ctx, T, N.cert, TL.n2);
  arrow(ctx, 835, 300, 950, 300, es(T, TL.e3, TL.e3 + 0.6), C.brandInk, 5);
  node(ctx, T, N.abs, TL.n3);
  arrow(ctx, 835, 360, 950, 620, es(T, TL.e4, TL.e4 + 0.8), C.brandInk, 5);
  arrow(ctx, 1165, 405, 1165, 570, es(T, TL.e5, TL.e5 + 0.7), C.brandInk, 5);
  node(ctx, T, N.deck, TL.n4);
  // 가운데 허브 표시
  var ph = es(T, TL.e4 + 1.0, TL.e4 + 1.6);
  if (ph > 0) {
    ctx.save(); ctx.globalAlpha = ph;
    ctx.fillStyle = C.tint; rr(ctx, 540, 195, 220, 40, 20); ctx.fill();
    txt(ctx, '가운데 허브', 650, 216, 26, 800, C.brandInk, 'center');
    ctx.restore();
  }
  // 표본 vs 전수
  var pb = es(T, TL.band, TL.band + 0.8);
  if (pb > 0) {
    ctx.save(); ctx.globalAlpha = pb;
    card(ctx, 70, 810, 600, 130, { fill: C.paper });
    txt(ctx, '앞선 사흘 — 표본', 370, 850, 36, 800, C.sub, 'center');
    txt(ctx, '3행만 열어 보면 됨', 370, 904, 30, 500, C.muted, 'center');
    arrow(ctx, 690, 875, 750, 875, 1, C.brandInk, 5);
    card(ctx, 770, 810, 600, 130, { fill: C.tint, stroke: C.brandInk, lw: 4 });
    txt(ctx, '4일차 — 전수 대조', 1070, 850, 36, 800, C.ink, 'center');
    txt(ctx, '숫자는 사람이 넣음', 1070, 904, 30, 700, C.brandInk, 'center');
    ctx.restore();
  }
  var ns = [N.rep, N.cert, N.abs, N.deck];
  for (var i = 0; i < 4; i++) stamp(ctx, ns[i].x + ns[i].w - 30, ns[i].y + 30, 22, es(T, TL.stamp + 0.35 * i, TL.stamp + 0.35 * i + 0.4), C.green);
  footer(ctx, T, '보고서·성적서의 숫자는 하나가 틀려도 못 씀', TL.foot, C.red);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
