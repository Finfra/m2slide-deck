// scene.js — BasicKnowledgeForAI_small 덱 모션그래픽 02-path (절대경로와 상대경로) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s02-path.js · 합성: node mg/_src/compose.js
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

// 장면 ③ — 절대경로와 상대경로 (원고 근거: 02-linux «절대경로 이름과 상대경로 이름»)
var NAME = 'mg-02-path', DUR = 16;
var TL = { n0: 1.0, n1: 1.6, n2: 2.2, absCard: 3.0, absHome: 3.6, absEtc: 4.6, cur: 6.0, relCard: 6.8, rel: 7.4, up: 9.0, cmd0: 10.6, cmdStep: 0.2, foot: 13.0 };
var NW = 180, NH = 80;
var N = { root: [X0 + 450, 300, '/'], home: [X0 + 260, 520, 'home'], etc: [X0 + 640, 520, 'etc'], xx: [X0 + 260, 780, 'xx'] };
var PX = X0 + 880, PW = X1 - PX;
var CMDS = ['cd', 'pwd', 'ls', 'mkdir', 'cp', 'mv'];

function node(ctx, n, p, o) {
  if (p <= 0) return;
  o = o || {};
  ctx.save(); ctx.globalAlpha = p;
  var s = lerp(0.85, 1, p);
  ctx.translate(n[0], n[1]); ctx.scale(s, s);
  card(ctx, -NW / 2, -NH / 2, NW, NH, { fill: o.fill || C.paper, stroke: o.stroke || C.line, lw: o.lw || 2, r: 16 });
  txt(ctx, n[2], 0, 2, 40, 800, o.color || C.ink, 'center', MONO);
  ctx.restore();
}
function edge(ctx, a, b, p, color, lw) {
  if (p <= 0) return;
  var x1 = a[0], y1 = a[1] + NH / 2, x2 = b[0], y2 = b[1] - NH / 2;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, p), lerp(y1, y2, p)); ctx.stroke();
  ctx.restore();
}
function tag(ctx, s, cx, cy, w, p, fill, color, font) {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  ctx.translate(cx, cy + (1 - p) * 12);
  ctx.fillStyle = fill; rr(ctx, -w / 2, -25, w, 50, 25); ctx.fill();
  fit(ctx, s, 0, 1, 28, 800, color, 'center', w - 24, font);
  ctx.restore();
}
function tree(ctx, T) {
  var p1 = es(T, TL.n1, TL.n1 + 0.6), p2 = es(T, TL.n2, TL.n2 + 0.6);
  edge(ctx, N.root, N.home, p1, C.line, 5);
  edge(ctx, N.root, N.etc, p1, C.line, 5);
  edge(ctx, N.home, N.xx, p2, C.line, 5);
  // 절대경로 — / 에서 출발하는 파란 길
  edge(ctx, N.root, N.home, es(T, TL.absHome, TL.absHome + 0.8), C.blue, 9);
  edge(ctx, N.root, N.etc, es(T, TL.absEtc, TL.absEtc + 0.8), C.blue, 9);
  var cur = es(T, TL.cur, TL.cur + 0.5);
  node(ctx, N.root, es(T, TL.n0, TL.n0 + 0.6), { stroke: T > TL.absHome ? C.blue : C.line, lw: 3, color: T > TL.absHome ? C.blue : C.ink });
  node(ctx, N.home, p1, cur > 0 ? { fill: C.greenTint, stroke: C.green, lw: 4 } : {});
  node(ctx, N.etc, p1, {});
  node(ctx, N.xx, p2, {});
  tag(ctx, '/home', N.home[0] - 175, N.home[1], 130, es(T, TL.absHome + 0.6, TL.absHome + 1.1), C.blue, '#FFFFFF', MONO);
  tag(ctx, '/etc', N.etc[0], N.etc[1] + 80, 120, es(T, TL.absEtc + 0.6, TL.absEtc + 1.1), C.blue, '#FFFFFF', MONO);
  tag(ctx, '현재 폴더 .', N.home[0] - 150, 430, 200, cur, C.green, '#FFFFFF');
  // 상대경로 — 현재 폴더(home) 에서 아래로
  var r = es(T, TL.rel, TL.rel + 0.8);
  arrow(ctx, N.home[0] + 40, N.home[1] + NH / 2 + 10, N.home[0] + 40, N.xx[1] - NH / 2 - 10, r, C.green, 7);
  tag(ctx, 'cd ./xx == cd xx', N.home[0] + 250, 690, 300, es(T, TL.rel + 0.6, TL.rel + 1.1), C.greenTint, C.green, MONO);
  // .. — 상위 폴더로
  var u = es(T, TL.up, TL.up + 0.8);
  arrow(ctx, N.home[0] - 40, N.home[1] - NH / 2 - 10, N.root[0] - NW / 2 - 10, N.root[1] + 10, u, C.red, 7);
  tag(ctx, '.. 상위 폴더', N.root[0] - 280, N.root[1] - 10, 220, es(T, TL.up + 0.6, TL.up + 1.1), C.redTint, C.red);
}
function panel(ctx, T) {
  var p = es(T, TL.absCard, TL.absCard + 0.6);
  if (p > 0) {
    var y = 200 + (1 - p) * 30;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, PX, y, PW, 220, { stroke: C.blue, lw: 3 });
    txt(ctx, '절대경로 이름', PX + 36, y + 52, 38, 800, C.blue, 'left');
    fit(ctx, ': /로 시작', PX + 36, y + 116, 34, 700, C.ink, 'left', PW - 72);
    fit(ctx, 'ex) /home, /etc', PX + 36, y + 172, 32, 700, C.sub, 'left', PW - 72, MONO);
    ctx.restore();
  }
  p = es(T, TL.relCard, TL.relCard + 0.6);
  if (p > 0) {
    var y2 = 450 + (1 - p) * 30;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, PX, y2, PW, 300, { stroke: C.green, lw: 3 });
    txt(ctx, '상대경로 이름', PX + 36, y2 + 52, 38, 800, C.green, 'left');
    fit(ctx, ': 현재 폴더를 기준', PX + 36, y2 + 116, 34, 700, C.ink, 'left', PW - 72);
    ctx.globalAlpha = p * es(T, TL.rel, TL.rel + 0.6);
    fit(ctx, '"." 현재 폴더 — cd ./xx == cd xx', PX + 36, y2 + 180, 30, 700, C.sub, 'left', PW - 72);
    ctx.globalAlpha = p * es(T, TL.up, TL.up + 0.6);
    fit(ctx, '".." 상위 폴더', PX + 36, y2 + 240, 30, 700, C.sub, 'left', PW - 72);
    ctx.restore();
  }
  var h = es(T, TL.cmd0 - 0.3, TL.cmd0 + 0.2);
  if (h > 0) {
    ctx.save(); ctx.globalAlpha = h;
    txt(ctx, '관련 명령어', PX + 4, 800, 30, 800, C.sub, 'left');
    ctx.restore();
  }
  var gw = (PW - 5 * 12) / 6;
  for (var i = 0; i < CMDS.length; i++) {
    var a = TL.cmd0 + TL.cmdStep * i, q = es(T, a, a + 0.4);
    if (q <= 0) continue;
    ctx.save(); ctx.globalAlpha = q;
    ctx.translate(PX + i * (gw + 12) + gw / 2, 870 + (1 - q) * 20);
    ctx.fillStyle = C.ink; rr(ctx, -gw / 2, -30, gw, 60, 14); ctx.fill();
    fit(ctx, CMDS[i], 0, 1, 30, 800, C.brand, 'center', gw - 14, MONO);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '경로', '절대경로는 /로 시작, 상대경로는 현재 폴더 기준', 0.2);
  tree(ctx, T);
  panel(ctx, T);
  footer(ctx, T, '절대경로는 /로 시작 · 상대경로는 현재 폴더를 기준', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
