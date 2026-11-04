// scene.js — BasicKnowledgeForAI_small 덱 모션그래픽 01-markdown (간단한 기호로 쓰고 HTML 로 변환) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s01-markdown.js · 합성: node mg/_src/compose.js
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

// 장면 ② — 간단한 기호로 쓰고 HTML 로 변환 (원고 근거: 01-markdown «Markdown이란?» · «Markdown Example» · «순서있는 목록(번호)»)
var NAME = 'mg-01-markdown', DUR = 16;
var TL = { html: 1.0, md: 2.0, same: 2.8, cards: 3.6, auto: 10.8, pulse: 12.0, foot: 13.0 };
var SRC = [ // [글자, 시작, 길이]
  ['# 개요1', 4.2, 0.6],
  ['1. 첫째 항목', 5.2, 0.5],
  ['1. 둘째 항목', 5.8, 0.5],
  ['1. 셋째 항목', 6.4, 0.5],
  ['[finfra](https://finfra.com)', 7.4, 0.8],
  ['|id|name |', 8.4, 0.5],
  ['|--|-----|', 9.0, 0.5],
  ['|1 |aaa  |', 9.6, 0.5],
];
var KY = 370, KH = 580, KW = 640, SX = X0, RX = X1 - KW;
function done(i, T) { return es(T, SRC[i][1] + SRC[i][2], SRC[i][1] + SRC[i][2] + 0.4); }

function compare(ctx, T) {
  var rows = [['HTML', '<html><h1>hi</h1></html>', TL.html, C.sub], ['Markdown', '# hi', TL.md, C.brandInk]];
  for (var i = 0; i < rows.length; i++) {
    var p = es(T, rows[i][2], rows[i][2] + 0.6);
    if (p <= 0) continue;
    var y = 215 + i * 78;
    ctx.save(); ctx.globalAlpha = p;
    pill(ctx, rows[i][0], X0 + 90, y, 180, 54, i ? C.brand : C.line, C.ink, 28, 800);
    txt(ctx, rows[i][1], X0 + 210 + (1 - p) * 20, y + 1, 38, 700, rows[i][3], 'left', MONO);
    ctx.restore();
  }
  var q = es(T, TL.same, TL.same + 0.6);
  if (q > 0) {
    ctx.save(); ctx.globalAlpha = q;
    ctx.strokeStyle = C.brandInk; ctx.lineWidth = 4; ctx.lineCap = 'round';
    var bx = X0 + 870;
    ctx.beginPath(); ctx.moveTo(bx, 195); ctx.lineTo(bx + 24, 195); ctx.lineTo(bx + 24, 313); ctx.lineTo(bx, 313); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + 24, 254); ctx.lineTo(bx + 50, 254); ctx.stroke();
    pill(ctx, '같은 제목 hi', bx + 50 + 130, 254, 260, 58, C.tint, C.brandInk, 30, 800);
    ctx.restore();
  }
}
function frames(ctx, T) {
  var p = es(T, TL.cards, TL.cards + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, SX, KY, KW, KH, { fill: '#2B2B28', stroke: '#2B2B28' });
  card(ctx, RX, KY, KW, KH, {});
  txt(ctx, '소스 (.md)', SX + 32, KY + 40, 26, 800, C.brand, 'left');
  txt(ctx, '렌더 결과', RX + 32, KY + 40, 26, 800, C.muted, 'left');
  ctx.restore();
  // 변환 화살표 — 끝 무렵 맥동
  var a = es(T, TL.cards + 0.3, TL.cards + 1.0);
  var cy = KY + KH / 2, pulse = T > TL.pulse ? 1 + 0.08 * Math.sin((T - TL.pulse) * 6) * (1 - seg(T, TL.pulse + 2, TL.pulse + 3)) : 1;
  arrow(ctx, SX + KW + 24, cy, RX - 24, cy, a, C.brandInk, 8 * pulse);
  if (a > 0.9) {
    ctx.save(); ctx.translate((SX + KW + RX) / 2, cy - 50); ctx.scale(pulse, pulse);
    pill(ctx, '변환', 0, 0, 110, 48, C.brand, C.ink, 26, 800);
    ctx.restore();
  }
}
function source(ctx, T) {
  for (var i = 0; i < SRC.length; i++) {
    var s = SRC[i][0], a = SRC[i][1], d = SRC[i][2];
    if (T < a) continue;
    var n = Math.floor(s.length * seg(T, a, a + d) + 1e-6), y = KY + 100 + i * 60, x = SX + 40;
    var shown = s.substr(0, n);
    if (i >= 1 && i <= 3 && T > TL.auto) { // 자동 번호 강조 — 소스의 «1.»
      ctx.save(); ctx.globalAlpha = es(T, TL.auto, TL.auto + 0.5);
      ctx.fillStyle = rgba(C.brand, 0.45); rr(ctx, x - 6, y - 22, 46, 44, 8); ctx.fill();
      ctx.restore();
    }
    ctx.font = '700 30px ' + MONO;
    var w = ctx.measureText(shown).width, maxW = KW - 80;
    var size = w > maxW ? Math.floor(30 * maxW / w) : 30;
    txt(ctx, shown, x, y, size, 700, '#F4F1E6', 'left', MONO);
    if (n < s.length && Math.floor(T * 4) % 2 === 0) { // 커서 — T 로만 깜빡임
      ctx.font = '700 ' + size + 'px ' + MONO;
      ctx.fillStyle = C.brand; ctx.fillRect(x + ctx.measureText(shown).width + 2, y - 16, 14, 32);
    }
  }
}
function render(ctx, T) {
  var x = RX + 40, p;
  p = done(0, T);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, '개요1', x, KY + 110, 48, 800, C.ink, 'left');
    ctx.fillStyle = C.line; ctx.fillRect(x, KY + 146, (KW - 80) * p, 3);
    ctx.restore();
  }
  var items = ['첫째 항목', '둘째 항목', '셋째 항목'];
  for (var i = 0; i < 3; i++) {
    p = done(i + 1, T);
    if (p <= 0) continue;
    var y = KY + 200 + i * 56;
    ctx.save(); ctx.globalAlpha = p;
    if (T > TL.auto) {
      ctx.save(); ctx.globalAlpha = es(T, TL.auto, TL.auto + 0.5);
      ctx.fillStyle = rgba(C.brand, 0.45); rr(ctx, x + 4, y - 22, 40, 44, 8); ctx.fill();
      ctx.restore();
    }
    txt(ctx, (i + 1) + '.', x + 10, y, 32, 800, C.ink, 'left');
    txt(ctx, items[i], x + 56 + (1 - p) * 16, y, 32, 600, C.ink, 'left');
    ctx.restore();
  }
  var q = es(T, TL.auto + 0.3, TL.auto + 0.9);
  if (q > 0) {
    ctx.save(); ctx.globalAlpha = q;
    pill(ctx, '자동으로 1부터 차례대로', RX + KW - 175, KY + 256, 310, 50, C.ink, '#FFFFFF', 24, 800);
    ctx.restore();
  }
  p = done(4, T);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, 'finfra', x, KY + 390, 34, 700, C.blue, 'left');
    ctx.font = '700 34px ' + KR;
    ctx.fillStyle = C.blue; ctx.fillRect(x, KY + 410, ctx.measureText('finfra').width, 3);
    ctx.restore();
  }
  // 표 — 구분선 줄까지 들어오면 머리, 마지막 줄에서 행
  var ty = KY + 450, cw = [120, 220], rh = 52;
  p = done(6, T);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    ctx.fillStyle = C.tint; ctx.fillRect(x, ty, cw[0] + cw[1], rh);
    ctx.strokeStyle = C.line; ctx.lineWidth = 2;
    ctx.strokeRect(x, ty, cw[0], rh); ctx.strokeRect(x + cw[0], ty, cw[1], rh);
    txt(ctx, 'id', x + 20, ty + rh / 2, 28, 800, C.ink, 'left');
    txt(ctx, 'name', x + cw[0] + 20, ty + rh / 2, 28, 800, C.ink, 'left');
    ctx.restore();
  }
  p = done(7, T);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    ctx.strokeStyle = C.line; ctx.lineWidth = 2;
    ctx.strokeRect(x, ty + rh, cw[0], rh); ctx.strokeRect(x + cw[0], ty + rh, cw[1], rh);
    txt(ctx, '1', x + 20, ty + rh * 1.5, 28, 600, C.ink, 'left');
    txt(ctx, 'aaa', x + cw[0] + 20, ty + rh * 1.5, 28, 600, C.ink, 'left');
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'Markdown', '간단한 기호로 쓰고 HTML로 변환', 0.2);
  compare(ctx, T);
  frames(ctx, T);
  if (T >= TL.cards) { source(ctx, T); render(ctx, T); }
  footer(ctx, T, '특수기호와 문자 — 매우 간단한 구조의 문법', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
