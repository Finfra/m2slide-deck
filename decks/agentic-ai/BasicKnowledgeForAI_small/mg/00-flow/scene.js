// scene.js — BasicKnowledgeForAI_small 덱 모션그래픽 00-flow (덱 전체 흐름) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s00-flow.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — BasicKnowledgeForAI_small 덱 mg 3개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 default_lec 색 체계 · 3:2 판형(1620×1080)
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

// 장면 ① — 덱 전체 흐름 (원고 근거: AGENDA.md 부제·부록1·부록2 + 01-markdown.md 장 제목 15개 + 02-linux.md 장 제목 4개)
var NAME = 'mg-00-flow', DUR = 15;
var TL = { card1: 1.0, intro0: 1.8, chip0: 3.4, chipStep: 0.35, editor: 6.9, arrow: 7.6, card2: 8.4, row0: 9.0, rowStep: 0.6, count: 11.6, foot: 12.4 };
var CY = 210, CHH = 740;
var C1X = X0, C1W = 860, C2W = CW - C1W - 100, C2X = X1 - C2W;
var INTRO = ['Markdown이란?', 'Markdown의 장-단점', 'Markdown Example'];
var CHIPS = ['Header', 'BlockQuote', '순서있는 목록', '순서없는 목록', '수평선', '링크', '강조', '코드·HTML 블록', '이미지·표'];
var LINUX = ['리눅스를 알아야 하는 이유', '윈도우에서 접속시', '명령어 및 유틸리티 리스트', '절대경로 이름과 상대경로 이름'];

function cardHead(ctx, x, y, w, label, title, color, tint) {
  pill(ctx, label, x + 40 + 70, y + 58, 140, 52, color, color === C.brand ? C.ink : '#FFFFFF', 28, 800);
  fit(ctx, title, x + 196, y + 59, 40, 800, C.ink, 'left', w - 226);
  ctx.fillStyle = tint;
  ctx.fillRect(x + 30, y + 108, w - 60, 4);
}
function bullet(ctx, s, x, y, w, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x + 10, y, 8, 0, Math.PI * 2); ctx.fill();
  fit(ctx, s, x + 34, y + 1, 34, 700, C.ink, 'left', w - 40);
}
function part1(ctx, T) {
  var p = es(T, TL.card1, TL.card1 + 0.7);
  if (p <= 0) return;
  var y = CY + (1 - p) * 50;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, C1X, y, C1W, CHH, {});
  cardHead(ctx, C1X, y, C1W, '부록1', 'MarkDown', C.brand, C.brand);
  ctx.restore();
  for (var i = 0; i < INTRO.length; i++) {
    var a = TL.intro0 + 0.5 * i, q = es(T, a, a + 0.5);
    if (q <= 0) continue;
    ctx.save(); ctx.globalAlpha = q;
    bullet(ctx, INTRO[i], C1X + 50 + (1 - q) * 20, y + 170 + i * 62, C1W - 100, C.brandInk);
    ctx.restore();
  }
  // 문법 칩 3×3
  var qh = es(T, TL.chip0 - 0.3, TL.chip0 + 0.2);
  if (qh > 0) {
    ctx.save(); ctx.globalAlpha = qh;
    txt(ctx, 'Markdown 문법', C1X + 50, y + 370, 30, 800, C.sub, 'left');
    ctx.restore();
  }
  var gx = C1X + 50, gy = y + 410, gw = (C1W - 100 - 2 * 20) / 3, gh = 64;
  for (var k = 0; k < CHIPS.length; k++) {
    var b = TL.chip0 + TL.chipStep * k, r = es(T, b, b + 0.4);
    if (r <= 0) continue;
    var cx = gx + (k % 3) * (gw + 20), cy = gy + Math.floor(k / 3) * (gh + 16);
    ctx.save(); ctx.globalAlpha = r;
    var s = lerp(0.8, 1, r);
    ctx.translate(cx + gw / 2, cy + gh / 2); ctx.scale(s, s);
    ctx.fillStyle = C.tint; rr(ctx, -gw / 2, -gh / 2, gw, gh, 14); ctx.fill();
    ctx.strokeStyle = C.brand; ctx.lineWidth = 2; ctx.stroke();
    fit(ctx, CHIPS[k], 0, 1, 28, 700, C.ink, 'center', gw - 24);
    ctx.restore();
  }
  var e = es(T, TL.editor, TL.editor + 0.5);
  if (e > 0) {
    ctx.save(); ctx.globalAlpha = e;
    bullet(ctx, 'MarkDown Editor', C1X + 50 + (1 - e) * 20, y + 680, C1W - 100, C.brandInk);
    ctx.restore();
  }
}
function part2(ctx, T) {
  var p = es(T, TL.card2, TL.card2 + 0.7);
  if (p <= 0) return;
  var y = CY + (1 - p) * 50;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, C2X, y, C2W, CHH, { stroke: C.blue, lw: 3 });
  cardHead(ctx, C2X, y, C2W, '부록2', '리눅스 사용 기초', C.blue, C.blueTint);
  ctx.restore();
  for (var i = 0; i < LINUX.length; i++) {
    var a = TL.row0 + TL.rowStep * i, q = es(T, a, a + 0.5);
    if (q <= 0) continue;
    var ry = y + 200 + i * 130;
    ctx.save(); ctx.globalAlpha = q;
    card(ctx, C2X + 36 + (1 - q) * 20, ry - 46, C2W - 72, 92, { fill: C.blueTint, stroke: C.blueTint, r: 14, shadow: 0 });
    txt(ctx, String(i + 1), C2X + 76, ry + 1, 34, 800, C.blue, 'center');
    fit(ctx, LINUX[i], C2X + 110, ry + 1, 30, 700, C.ink, 'left', C2W - 170);
    ctx.restore();
  }
}
function counts(ctx, T) {
  var p = es(T, TL.count, TL.count + 0.5);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  var s = lerp(1.4, 1, p);
  ctx.translate(C1X + C1W - 90, CY); ctx.scale(s, s);
  pill(ctx, '15장', 0, 0, 120, 52, C.ink, '#FFFFFF', 28, 800);
  ctx.restore();
  ctx.save(); ctx.globalAlpha = p;
  ctx.translate(C2X + C2W - 80, CY); ctx.scale(s, s);
  pill(ctx, '4장', 0, 0, 100, 52, C.blue, '#FFFFFF', 28, 800);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '기초 지식', '부록1 MarkDown → 부록2 리눅스 사용 기초', 0.2);
  part1(ctx, T);
  var ay = CY + CHH / 2;
  arrow(ctx, C1X + C1W + 20, ay, C2X - 20, ay, es(T, TL.arrow, TL.arrow + 0.7), C.brandInk, 8);
  part2(ctx, T);
  counts(ctx, T);
  footer(ctx, T, 'AI 활용을 위한 기초 지식', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
