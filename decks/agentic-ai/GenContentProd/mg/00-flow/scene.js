// scene.js — GenContentProd 강의 모션그래픽 00-flow (1일차 흐름) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s00-flow.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — GenContentProd 덱 mg 6개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 default_lec 색 체계 · 같은 판형 3:2(1620×1080)
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

// ── GenContentProd 추가 도구 ────────────────────────────────────────────────
// 결정론 의사난수 — 정수 i 에 대해 항상 같은 0~1 값 (Math.random 대신)
function hash01(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
// 꺾쇠 화살표 경로 — 점 배열을 따라 p(0~1) 만큼 그린다 (끝에 화살촉)
function polyArrow(ctx, pts, p, color, lw) {
  if (p <= 0) return;
  var L = [], tot = 0, i;
  for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  var want = tot * p;
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw || 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  var ex = pts[0][0], ey = pts[0][1], ang = 0;
  for (i = 1; i < pts.length && want > 0; i++) {
    var q = Math.min(1, want / L[i - 1]);
    ex = lerp(pts[i - 1][0], pts[i][0], q); ey = lerp(pts[i - 1][1], pts[i][1], q);
    ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
    ctx.lineTo(ex, ey); want -= L[i - 1];
  }
  ctx.stroke();
  if (p > 0.95) {
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 20 * Math.cos(ang - 0.45), ey - 20 * Math.sin(ang - 0.45));
    ctx.lineTo(ex - 20 * Math.cos(ang + 0.45), ey - 20 * Math.sin(ang + 0.45));
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// 장면 ① — 1일차 흐름 (원고 근거: 01-opening «강의 목표» + AGENDA.md + 08 «Part1 정리 + 휴식 안내» + 14 «클로징 — 1일차 정리»)
var NAME = 'mg-00-flow', DUR = 18;
var TL = { p1: 1.0, p2: 3.6, step: 0.35, doc: 5.4, g0: 7.0, gstep: 1.6, mini: 12.0, ok: 12.6, foot: 14.6 };
var LX = X0, LW = 150, RX = X0 + 170, RW = X1 - RX, GAP = 14, CHW = (RW - GAP * 5) / 6, CHH = 128;
var Y1 = 196, Y2 = 362;
var P1 = [['01', '6대 패턴', ''], ['02', 'Diffusion', '인포그래픽'], ['03', 'Claude', 'Design'], ['04', 'VSCode', ''], ['05', 'Markdown', 'Mermaid'], ['06', 'Excalidraw', '']];
var P2 = [['07', 'Obsidian', ''], ['08', 'Pandoc', ''], ['09', 'NotebookLM', ''], ['10', '미니', '프로젝트']];
var GOALS = [
  ['목표 1', '프롬프트 엔지니어링 6대 패턴', 'LLM 출력 품질을 제어', C.brand, C.tint, C.brandInk],
  ['목표 2', 'Diffusion·Mermaid·Excalidraw', '시각 자산 직접 생산', C.blue, C.blueTint, C.blue],
  ['목표 3', 'Obsidian·Pandoc·NotebookLM', '프롬프트에서 출판까지', C.green, C.greenTint, C.green],
];
var OWN = { p1: [0, 1, -1, -1, 1, 1], p2: [2, 2, 2, -1] }; // 칩이 켜질 목표 번호 (-1 은 없음)
var GY = 560, GH = 330, GG = 40, GW = (CW - GG * 2) / 3;
function chip(ctx, T, c, x, y, a, own, hot) {
  var p = es(T, a, a + 0.5);
  if (p <= 0) return;
  var g = own >= 0 ? GOALS[own] : null, lit = g ? es(T, TL.g0 + TL.gstep * own + 0.4, TL.g0 + TL.gstep * own + 0.9) : 0;
  ctx.save(); ctx.globalAlpha = p;
  var st = hot ? C.brandInk : lit > 0 ? g[3] : C.line;
  card(ctx, x, y + (1 - p) * 24, CHW, CHH, { fill: lit > 0 ? g[4] : C.paper, stroke: st, lw: hot ? 5 : lit > 0 ? 3 : 2, r: 16 });
  var yy = y + (1 - p) * 24;
  txt(ctx, c[0], x + 18, yy + 30, 22, 800, lit > 0 ? g[5] : C.muted, 'left', MONO);
  if (c[2]) {
    fit(ctx, c[1], x + CHW / 2, yy + 70, 28, 800, C.ink, 'center', CHW - 24);
    fit(ctx, c[2], x + CHW / 2, yy + 104, 28, 800, C.ink, 'center', CHW - 24);
  } else {
    fit(ctx, c[1], x + CHW / 2, yy + 84, 30, 800, C.ink, 'center', CHW - 24);
  }
  ctx.restore();
}
function lanes(ctx, T) {
  var a1 = es(T, TL.p1, TL.p1 + 0.5), a2 = es(T, TL.p2, TL.p2 + 0.5);
  if (a1 > 0) { ctx.save(); ctx.globalAlpha = a1; pill(ctx, 'Part1', LX + LW / 2, Y1 + CHH / 2, LW, 64, C.brand, C.ink, 32, 800); ctx.restore(); }
  if (a2 > 0) { ctx.save(); ctx.globalAlpha = a2; pill(ctx, 'Part2', LX + LW / 2, Y2 + CHH / 2, LW, 64, C.blue, '#FFFFFF', 32, 800); ctx.restore(); }
  for (var i = 0; i < P1.length; i++) chip(ctx, T, P1[i], RX + i * (CHW + GAP), Y1, TL.p1 + TL.step * i, OWN.p1[i], false);
  for (var j = 0; j < P2.length; j++) chip(ctx, T, P2[j], RX + j * (CHW + GAP), Y2, TL.p2 + TL.step * j, OWN.p2[j], j === 3 && T >= TL.mini);
  // 10 미니 프로젝트 → 출판 문서
  var x10 = RX + 3 * (CHW + GAP) + CHW, dx = RX + 4 * (CHW + GAP) + 60;
  arrow(ctx, x10 + 8, Y2 + CHH / 2, dx - 14, Y2 + CHH / 2, es(T, TL.doc, TL.doc + 0.6), C.brandInk, 5);
  var pd = es(T, TL.doc + 0.4, TL.doc + 1.0);
  if (pd > 0) {
    ctx.save(); ctx.globalAlpha = pd;
    doc(ctx, dx, Y2 - 6 + (1 - pd) * 20, 104, 136, { rows: 4 });
    fit(ctx, '출판 가능한 문서 1편', dx + 124, Y2 + 44, 30, 800, C.ink, 'left', X1 - dx - 124);
    fit(ctx, 'DOCX 또는 PDF', dx + 124, Y2 + 90, 26, 600, C.sub, 'left', X1 - dx - 124);
    ctx.restore();
  }
  stamp(ctx, dx + 96, Y2 + 120, 26, es(T, TL.ok, TL.ok + 0.4), C.green);
}
function goals(ctx, T) {
  for (var i = 0; i < GOALS.length; i++) {
    var g = GOALS[i], a = TL.g0 + TL.gstep * i, p = es(T, a, a + 0.6);
    if (p <= 0) continue;
    var x = X0 + i * (GW + GG), y = GY + (1 - p) * 40;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, y, GW, GH, { fill: C.paper, stroke: g[3], lw: 3 });
    ctx.fillStyle = g[3]; rr(ctx, x, y, GW, 14, 7); ctx.fill();
    pill(ctx, g[0], x + 40 + 70, y + 76, 140, 54, g[4], g[5], 28, 800);
    fit(ctx, g[1], x + 40, y + 170, 32, 700, C.sub, 'left', GW - 80);
    fit(ctx, g[2], x + 40, y + 236, 38, 800, C.ink, 'left', GW - 80);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '1일차', '프롬프트에서 출판까지 — Part1 → Part2', 0.2);
  lanes(ctx, T);
  goals(ctx, T);
  footer(ctx, T, '오늘 가져갈 것: 출판 문서 1편 · 도구 10종 첫 경험 · Vault 1개', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
