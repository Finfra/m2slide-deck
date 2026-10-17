// scene.js — 설계·R&D AI 강의 모션그래픽 01-day1 (1일차 읽기) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s01-day1.js · 합성: node mg/_src/compose.js
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

// 장면 ② — 1일차 읽기 (원고 근거: 1-3 «사양서 PDF 자동 요약과 핵심 사양 추출» 1~3단계 + 검증 P1-3)
var NAME = 'mg-01-day1', DUR = 17;
var TL = { s1: 1.0, p1: 1.6, s2: 5.4, p2: 6.0, s3: 9.4, p3: 10.0, stamp: 14.2, foot: 15.0 };
var STEPS = ['목차·구조', '필요한 절 요약', '사양 표로 고정'];
var P = { x: 430, y: 380, w: 940, h: 520 };
function stepsBar(ctx, T) {
  var cur = T < TL.s2 ? 0 : T < TL.s3 ? 1 : 2;
  for (var i = 0; i < 3; i++) {
    var a = TL.s1 + 0.3 * i, p = es(T, a, a + 0.5), x = 430 + i * 320;
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    var on = (i === cur && T < TL.stamp) ? 1 : 0;
    card(ctx, x, 208, 300, 120, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 4 : 2, shadow: on ? 1 : 0 });
    ctx.fillStyle = on ? C.brand : C.line; ctx.beginPath(); ctx.arc(x + 44, 268, 24, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), x + 44, 269, 30, 800, C.ink, 'center');
    txt(ctx, STEPS[i], x + 84, 268, 29, 700, C.ink, 'left');
    ctx.restore();
  }
}
function drawDoc1(ctx, T) {
  var p = es(T, 0.6, 1.4);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  doc(ctx, 80, 380, 270, 400, { rows: 9 });
  txt(ctx, '사양서 PDF', 215, 830, 34, 700, C.ink, 'center');
  txt(ctx, '58쪽', 215, 872, 30, 500, C.muted, 'center');
  ctx.restore();
  var q = es(T, TL.p1, TL.p1 + 0.8);
  arrow(ctx, 370, 570, 420, 570, q, C.brandInk, 5);
}
function panelToc(ctx, T) {
  var a = es(T, TL.p1, TL.p1 + 0.6) * (1 - es(T, TL.s2 - 0.4, TL.s2 + 0.2));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, P.x, P.y, P.w, P.h, {});
  txt(ctx, '목차 — 3단계까지, 쪽 범위와 함께', P.x + 40, P.y + 48, 32, 700, C.brandInk, 'left');
  var rowsT = [['2.1 구조', '9', 0], ['2.2 건식 마모 메커니즘', '9', 0], ['2.3 물성', '11', 1], ['2.4 화학적 특성', '12', 0], ['3.1 설계 요소', '14', 0], ['3.3 허용하중 한계', '15', 1], ['3.4 미끄럼 속도', '15', 0]];
  for (var i = 0; i < rowsT.length; i++) {
    var y = P.y + 100 + i * 56, hl = rowsT[i][2] ? es(T, 3.0 + 0.7 * (i > 3 ? 1 : 0), 3.7 + 0.7 * (i > 3 ? 1 : 0)) : 0;
    if (hl > 0) { ctx.fillStyle = rgba(C.brand, 0.55 * hl); rr(ctx, P.x + 24, y - 24, P.w - 48, 50, 10); ctx.fill(); }
    txt(ctx, rowsT[i][0], P.x + 48, y, 30, rowsT[i][2] ? 800 : 500, rowsT[i][2] ? C.ink : C.sub, 'left');
    txt(ctx, rowsT[i][1] + '쪽', P.x + P.w - 48, y, 30, 600, C.muted, 'right');
  }
  txt(ctx, '58쪽 중 읽을 절은 2~3개', P.x + P.w / 2, P.y + P.h - 26, 28, 700, C.brandInk, 'center');
  ctx.restore();
}
function panelSummary(ctx, T) {
  var a = es(T, TL.p2, TL.p2 + 0.6) * (1 - es(T, TL.s3 - 0.4, TL.s3 + 0.2));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, P.x, P.y, P.w, P.h, {});
  txt(ctx, '2.3 물성 · 3.3 허용하중 한계 — 항목 — 값 — 조건', P.x + 40, P.y + 48, 30, 700, C.brandInk, 'left');
  var L = [['최대하중', '250 N/mm²', '정하중'], ['최대하중', '140 N/mm²', '동하중']];
  for (var i = 0; i < 2; i++) {
    var p = es(T, TL.p2 + 0.5 + 0.7 * i, TL.p2 + 1.1 + 0.7 * i), y = P.y + 150 + i * 100;
    if (p <= 0) continue;
    ctx.globalAlpha = a * p;
    card(ctx, P.x + 40 + (1 - p) * 40, y - 38, P.w - 80, 80, { fill: C.tint, stroke: 'transparent', shadow: 0, r: 14 });
    txt(ctx, L[i][0], P.x + 70, y + 2, 34, 700, C.ink, 'left');
    txt(ctx, L[i][1], P.x + 330, y + 2, 34, 800, C.ink, 'left');
    if (L[i][2]) txt(ctx, L[i][2], P.x + P.w - 70, y + 2, 32, 700, C.blue, 'right');
  }
  var n = es(T, TL.p2 + 3.2, TL.p2 + 3.8);
  ctx.globalAlpha = a * n;
  txt(ctx, '조건이 빠지면 뒤에서 되살릴 수 없음', P.x + P.w / 2, P.y + P.h - 70, 32, 700, C.red, 'center');
  ctx.restore();
}
function panelTable(ctx, T) {
  var a = es(T, TL.p3, TL.p3 + 0.6);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, P.x, P.y, P.w, P.h, {});
  var cx = [P.x + 40, P.x + 380, P.x + 780];
  ctx.fillStyle = C.brand; rr(ctx, P.x + 20, P.y + 22, P.w - 40, 66, 14); ctx.fill();
  txt(ctx, '항목', cx[0], P.y + 56, 34, 800, C.ink, 'left');
  txt(ctx, '값', cx[1], P.y + 56, 34, 800, C.ink, 'left');
  txt(ctx, '근거 쪽수', cx[2], P.y + 56, 34, 800, C.ink, 'left');
  var R = [['허용하중 (정하중)', '250 N/mm²', '11쪽'], ['허용하중 (동하중)', '140 N/mm²', '11쪽'], ['동작 온도 범위', '−200 ~ +280 °C', '11쪽']];
  for (var i = 0; i < 3; i++) {
    var p = es(T, TL.p3 + 0.6 + 0.8 * i, TL.p3 + 1.2 + 0.8 * i), y = P.y + 150 + i * 98;
    ctx.globalAlpha = a * p;
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P.x + 30, y + 44); ctx.lineTo(P.x + P.w - 30, y + 44); ctx.stroke();
    txt(ctx, R[i][0], cx[0], y, 32, 700, C.ink, 'left');
    txt(ctx, R[i][1], cx[1], y, 32, 800, C.ink, 'left');
    txt(ctx, R[i][2], cx[2], y, 32, 600, C.sub, 'left');
    stamp(ctx, P.x + P.w - 60, y, 22, es(T, TL.stamp + 0.4 * i, TL.stamp + 0.8 * i), C.green);
  }
  ctx.globalAlpha = a * es(T, TL.p3 + 3.4, TL.p3 + 4.0);
  txt(ctx, '원문에 없는 항목은 «원문에 없음» · 환산하지 않음', P.x + P.w / 2, P.y + P.h - 44, 32, 700, C.brandInk, 'center');
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '1일차', '읽기 — 사양서 한 권이 표 한 장으로', 0.2);
  drawDoc1(ctx, T);
  stepsBar(ctx, T);
  panelToc(ctx, T); panelSummary(ctx, T); panelTable(ctx, T);
  footer(ctx, T, '표의 수치는 원문과 대조함', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
