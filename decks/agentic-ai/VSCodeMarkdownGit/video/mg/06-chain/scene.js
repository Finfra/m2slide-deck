// scene.js — VS Code·Markdown·Git 특강 모션그래픽 06-chain (요구사항 → 설계 → 이슈 → 변경) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s06-chain.js · 합성: node mg/_src/compose.js · 4:3 1600×1200
(function (root) {
// common.js — VSCodeMarkdownGit 덱 추가 mg(04~06) 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 판형은 4:3(1600×1200), 색은 이 덱의 기존 mg(01~03)와 같은 밝은 체계
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1600, H = 1200;
var X0 = 80, X1 = W - 80, CW = X1 - X0; // 본문 좌우 여백 80 — 본문 폭 1440
var C = {
  bg: '#FFFFFF', ink: '#0F172A', sub: '#334155', muted: '#64748B', line: '#CBD5E1', paper: '#FFFFFF', panel: '#F1F5F9',
  brand: '#F5C518', brandInk: '#8A6400', tint: '#FFF6D5',
  blue: '#2563EB', blueTint: '#EAF1FD', red: '#DC2626', redTint: '#FDECEC', green: '#16A34A', greenTint: '#E6F6EC',
  purple: '#7C3AED', purpleTint: '#F1EAFD',
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
    ctx.shadowColor = 'rgba(15,23,42,0.12)';
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
  ctx.shadowColor = 'rgba(15,23,42,0.12)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
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
  fit(ctx, s, W / 2, 1120 + (1 - p) * 12, 42, 800, color || C.brandInk, 'center', CW);
  ctx.restore();
}
function backdrop(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
}

// 장면 ⑥ — 기준 문서 사슬 (원고 근거: «요구사항 → 설계 → 이슈 → 변경» + «코드를 읽고 쓴 설계 문서의 함정» + «작업 하나 = 이슈 하나»)
var NAME = 'vscode-md-git-06-chain', DUR = 13;
var TL = { n0: 1.0, nStep: 0.8, first: 4.4, basis: 5.2, work: 6.2, sp0: 6.9, spStep: 0.3, back: 7.9, md: 9.0, foot: 10.4 };
var NODES = [ // [제목, 아래 글, 색, 바탕]
  ['요구사항', '요구사항.md', C.blue, C.blueTint],
  ['설계', '설계.md', C.purple, C.purpleTint],
  ['이슈', '작업의 기록', C.brandInk, C.tint],
  ['변경', '저장 지점', C.green, C.greenTint],
];
var NY = 320, NH = 230, NW = 280, NGAP = (CW - NW * 4) / 3;
var WY = 740, SPX = [920, 1060, 1200], SPR = 30;
function nx(i) { return X0 + i * (NW + NGAP); }
function nodes(ctx, T) {
  for (var i = 0; i < NODES.length; i++) {
    var a = TL.n0 + TL.nStep * i, p = es(T, a, a + 0.6);
    if (i > 0) arrow(ctx, nx(i - 1) + NW + 12, NY + NH / 2, nx(i) - 12, NY + NH / 2, es(T, a - 0.3, a + 0.1), C.muted, 5);
    if (p <= 0) continue;
    var N = NODES[i], x = nx(i), y = NY + (1 - p) * 40;
    var hi = i === 2 ? es(T, TL.basis, TL.basis + 0.5) : 0;
    ctx.save();
    ctx.globalAlpha = p;
    card(ctx, x, y, NW, NH, { fill: N[3], stroke: N[2], lw: 3 + hi * 3 });
    doc(ctx, x + NW / 2 - 40, y + 24, 80, 96, { stroke: N[2], rows: 3 });
    fit(ctx, N[0], x + NW / 2, y + 160, 44, 800, C.ink, 'center', NW - 30);
    fit(ctx, N[1], x + NW / 2, y + 202, 26, 600, N[2], 'center', NW - 30);
    ctx.restore();
  }
}
function flags(ctx, T) {
  var pf = es(T, TL.first, TL.first + 0.6);
  if (pf > 0) {
    ctx.save(); ctx.globalAlpha = pf;
    var cx = nx(0) + NW / 2, cy = NY - 56 - (1 - pf) * 20;
    pill(ctx, '먼저 — 코드보다', cx, cy, 300, 58, C.ink, '#FFFFFF', 28, 800);
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(cx - 12, cy + 28); ctx.lineTo(cx + 12, cy + 28); ctx.lineTo(cx, cy + 42); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  var pb = es(T, TL.basis, TL.basis + 0.6);
  if (pb > 0) {
    ctx.save(); ctx.globalAlpha = pb;
    var gx = nx(2) - NGAP / 2;
    pill(ctx, '근거', gx, NY + NH / 2 - 50, 96, 46, C.purple, '#FFFFFF', 24, 800);
    ctx.restore();
  }
}
function work(ctx, T) {
  var pw = es(T, TL.work, TL.work + 0.6);
  if (pw <= 0) return;
  var ix = nx(2) + NW / 2, iy = NY + NH;
  ctx.save(); ctx.globalAlpha = pw;
  pill(ctx, '작업 하나 = 이슈 하나', X0 + 200, WY, 400, 66, C.tint, C.brandInk, 32, 800);
  ctx.restore();
  // 이슈 → 작업
  arrow(ctx, ix - 60, iy + 14, 700, WY - 44, pw, C.brandInk, 4);
  var pk = es(T, TL.work + 0.3, TL.work + 0.8);
  if (pk > 0) {
    ctx.save(); ctx.globalAlpha = pk;
    card(ctx, 620, WY - 40, 180, 80, { fill: C.paper, stroke: C.brandInk, lw: 3, r: 16, shadow: 0 });
    txt(ctx, '작업', 710, WY, 34, 800, C.ink, 'center');
    ctx.restore();
  }
  for (var s = 0; s < SPX.length; s++) {
    var a = TL.sp0 + TL.spStep * s, p = es(T, a, a + 0.35);
    var px0 = s === 0 ? 800 : SPX[s - 1] + SPR;
    arrow(ctx, px0 + 8, WY, SPX[s] - SPR - 8, WY, p, C.muted, 4);
    if (p <= 0) continue;
    ctx.save();
    ctx.globalAlpha = p;
    ctx.fillStyle = C.green;
    ctx.beginPath(); ctx.arc(SPX[s], WY, SPR * lerp(0.4, 1, p), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  var ps = es(T, TL.sp0 + 0.6, TL.sp0 + 1.2);
  if (ps > 0) {
    ctx.save(); ctx.globalAlpha = ps;
    txt(ctx, '저장 지점', SPX[1], WY + 62, 28, 700, C.green, 'center');
    ctx.restore();
  }
  // 저장 지점 → 이슈에 이어 둠 (되돌아오는 곡선)
  var pr = es(T, TL.back, TL.back + 0.8);
  if (pr > 0) {
    var x0 = SPX[2] + SPR + 6, y0 = WY, x3 = ix + 60, y3 = iy + 14;
    ctx.save();
    ctx.strokeStyle = C.brandInk; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
    ctx.beginPath();
    var N = 24;
    for (var k = 0; k <= N * pr; k++) {
      var u = k / N, v = 1 - u;
      var bx = v * v * v * x0 + 3 * v * v * u * (x0 + 160) + 3 * v * u * u * (x3 + 240) + u * u * u * x3;
      var by = v * v * v * y0 + 3 * v * v * u * y0 + 3 * v * u * u * (y3 + 60) + u * u * u * y3;
      if (k === 0) ctx.moveTo(bx, by); else ctx.lineTo(bx, by);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = es(T, TL.back + 0.5, TL.back + 1.0);
    txt(ctx, '이슈에 이어 둠', 1410, 590, 30, 800, C.brandInk, 'center');
    ctx.restore();
  }
}
function bracket(ctx, T) {
  var p = es(T, TL.md, TL.md + 0.8);
  if (p <= 0) return;
  var y = 900, xa = X0, xb = X1, xm = W / 2;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(lerp(xm, xa, p), y - 24); ctx.lineTo(lerp(xm, xa, p), y);
  ctx.lineTo(lerp(xm, xb, p), y); ctx.lineTo(lerp(xm, xb, p), y - 24);
  ctx.moveTo(xm, y); ctx.lineTo(xm, y + 20);
  ctx.stroke();
  pill(ctx, '모두 Markdown 으로 남음', xm, y + 62, 520, 70, C.ink, '#FFFFFF', 34, 800);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '사슬', '요구사항 → 설계 → 이슈 → 변경', 0.2);
  nodes(ctx, T);
  flags(ctx, T);
  work(ctx, T);
  bracket(ctx, T);
  footer(ctx, T, '기준 문서가 있어야 이슈가 근거를 가짐', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
