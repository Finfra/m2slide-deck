// scene.js — Agentic Coding 강의 모션그래픽 00-flow (4시간 흐름) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s00-flow.js · 합성: node mg/_src/compose.js
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

// 장면 ① — 4시간 흐름 (원고 근거: 01-part1 «강의 목표·4시간 흐름 미리보기» + 장 표지 부제 + «Agentic Engineering이란?»)
var NAME = 'mg-00-flow', DUR = 15;
var TL = { bar1: 1.0, bar2: 3.0, rest: 3.0, goal0: 5.8, step: 1.2, stamp: 10.4, foot: 12.0 };
var BY = 250, BH = 104, B1 = CW * 1.5 / 4; // 시간 막대 — 1.5h : 2.5h 비례
var GOALS = [
  ['목표1', '바이브 코딩 vs', 'Agentic Coding 차이 이해'],
  ['목표2', 'Claude Code 하네스', '직접 셋업'],
  ['목표3', '미니 프로젝트로', '웹서비스 MVP 완성'],
];
var GY = 490, GH = 360, GGAP = 40, GW = (CW - GGAP * 2) / 3;
function bar(ctx, T) {
  var p1 = es(T, TL.bar1, TL.bar2), p2 = es(T, TL.bar2, TL.bar2 + 2.6);
  if (p1 > 0) {
    ctx.save();
    card(ctx, X0, BY, B1 * p1, BH, { fill: C.brand, stroke: C.brand, r: 18, shadow: 0 });
    ctx.globalAlpha = es(T, TL.bar1 + 1.2, TL.bar2);
    txt(ctx, 'Part1', X0 + 32, BY + 36, 34, 800, C.ink, 'left');
    fit(ctx, '이론·실습 1.5h', X0 + 32, BY + 76, 30, 700, C.ink, 'left', B1 - 60);
    ctx.globalAlpha = es(T, TL.bar1 + 1.4, TL.bar2 + 0.4);
    fit(ctx, '도입·환경·하네스·SCAR·nPTiR', X0 + B1 / 2, BY + BH + 44, 28, 600, C.sub, 'center', B1 - 20);
    ctx.restore();
  }
  if (p2 > 0) {
    var x2 = X0 + B1 + 12, w2 = CW - B1 - 12;
    ctx.save();
    card(ctx, x2, BY, w2 * p2, BH, { fill: C.blueTint, stroke: C.blue, lw: 3, r: 18, shadow: 0 });
    ctx.globalAlpha = es(T, TL.bar2 + 1.4, TL.bar2 + 2.4);
    txt(ctx, 'Part2', x2 + 32, BY + 36, 34, 800, C.blue, 'left');
    txt(ctx, '미니 프로젝트 2.5h', x2 + 32, BY + 76, 30, 700, C.blue, 'left');
    fit(ctx, '핸즈온 미니 프로젝트', x2 + w2 / 2, BY + BH + 44, 28, 600, C.sub, 'center', w2 - 20);
    ctx.restore();
  }
  // 휴식 표지 — 두 칸 경계 위로 내려옴
  var pr = es(T, TL.rest, TL.rest + 0.7);
  if (pr > 0) {
    var cx = X0 + B1 + 6, cy = BY - 40 - (1 - pr) * 24;
    ctx.save(); ctx.globalAlpha = pr;
    pill(ctx, '휴식', cx, cy, 120, 46, C.ink, '#FFFFFF', 26, 800);
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(cx - 10, cy + 22); ctx.lineTo(cx + 10, cy + 22); ctx.lineTo(cx, cy + 34); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
function goals(ctx, T) {
  for (var i = 0; i < GOALS.length; i++) {
    var a = TL.goal0 + TL.step * i, p = es(T, a, a + 0.7);
    if (p <= 0) continue;
    var x = X0 + i * (GW + GGAP), y = GY + (1 - p) * 50;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, y, GW, GH, {});
    pill(ctx, GOALS[i][0], x + 40 + 70, y + 64, 140, 54, C.brand, C.ink, 30, 800);
    fit(ctx, GOALS[i][1], x + 40, y + 170, 38, 700, C.sub, 'left', GW - 80);
    fit(ctx, GOALS[i][2], x + 40, y + 232, 40, 800, C.ink, 'left', GW - 80);
    ctx.restore();
    stamp(ctx, x + GW - 60, GY + GH - 58, 28, es(T, TL.stamp + 0.3 * i, TL.stamp + 0.3 * i + 0.4), C.green);
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '4시간', '이론 1.5h → 미니 프로젝트 2.5h', 0.2);
  bar(ctx, T);
  goals(ctx, T);
  footer(ctx, T, '도구 사용법이 아니라 엔지니어링 사고', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
