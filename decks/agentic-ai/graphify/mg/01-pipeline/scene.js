// scene.js — graphify 덱 모션그래픽 01-pipeline (입력 → 그래프 → 3대 산출물) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s01-pipeline.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — graphify 덱 mg 4개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 default_lec 색 체계. 판형만 16:9(1920×1080)
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1920, H = 1080;
var X0 = 80, X1 = W - 80, CW = X1 - X0; // 본문 좌우 여백 80 — 본문 폭 1760
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
// 선분 — 시작점에서 p(0~1) 만큼 그려진다. dash: [길이, 간격] (없으면 실선)
function dline(ctx, x1, y1, x2, y2, p, color, lw, dash) {
  if (p <= 0) return;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = lw || 4; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, p), lerp(y1, y2, p)); ctx.stroke();
  ctx.restore();
}
// 그래프 노드 — 채운 원 + 흰 테두리, p 로 튀어나옴
function node(ctx, cx, cy, r, p, fill) {
  if (p <= 0) return;
  var s = p < 1 ? lerp(0.2, 1, p) + Math.sin(p * Math.PI) * 0.18 : 1;
  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 1.5);
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.arc(cx, cy, r * s, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}

// 장면 ② — 입력 → 그래프 → 3대 산출물 (원고 근거: «정의 & 산출물» + «첫 빌드 흐름»)
var NAME = 'mg-01-pipeline', DUR = 18;
var TL = { in0: 1.0, inStep: 0.5, feed: 2.6, n0: 3.6, nStep: 0.15, e0: 6.0, eDur: 2.4, legend: 7.2, comm: 9.0, out0: 11.0, outStep: 0.8, foot: 14.6 };
var INPUTS = [['코드 파일', '임의 폴더'], ['마크다운 문서', '코드·문서 전체'], ['GitHub repo URL', 'repo clone 후 빌드']];
var OUTPUTS = [['graph.html', '인터랙티브 시각화', '사람용'], ['graph.json', 'GraphRAG 백엔드용', 'CLI 경유만'], ['GRAPH_REPORT.md', '자연어 보고서', '섹션별 발췌']];
var IX = X0, IW = 360, IH = 170, PX = 540, PY = 200, PW = 840, PH = 740, OX = X1 - 360, OW = 360;
function rowY(i) { return 330 + i * 240; }
// 노드 — [x, y, 커뮤니티] · 고정 좌표 (결정론)
var NODES = [
  [700, 410, 0], [800, 350, 0], [860, 460, 0], [740, 530, 0], [640, 500, 0],
  [1110, 390, 1], [1230, 450, 1], [1180, 550, 1], [1060, 500, 1], [1260, 340, 1],
  [940, 720, 2], [1050, 690, 2], [1100, 800, 2], [980, 840, 2], [870, 800, 2],
];
// 엣지 — [a, b, INFERRED 여부]
var EDGES = [
  [0, 1, 0], [1, 2, 0], [2, 3, 0], [3, 4, 0], [4, 0, 0], [0, 3, 0],
  [5, 6, 0], [6, 7, 0], [7, 8, 0], [8, 5, 0], [5, 9, 0], [6, 9, 0],
  [10, 11, 0], [11, 12, 0], [12, 13, 0], [13, 14, 0], [14, 10, 0], [10, 13, 0],
  [2, 8, 1], [3, 10, 1], [7, 11, 1], [4, 14, 1],
];
var COMM = [C.blue, C.green, C.brandInk];
var COMM_T = [C.blueTint, C.greenTint, C.tint];
var CENTER = [[750, 450], [1170, 450], [985, 770]];
function panel(ctx, T) {
  var pp = es(T, TL.feed, TL.feed + 0.8);
  if (pp <= 0) return;
  card(ctx, PX, PY, PW, PH, { alpha: pp, r: 24 });
  // 단계 표지 — 노드·엣지 추출 → 커뮤니티 디텍션
  var s1 = es(T, TL.n0, TL.n0 + 0.5), s2 = es(T, TL.comm, TL.comm + 0.6);
  ctx.save();
  if (s1 > 0 && s2 < 1) { ctx.globalAlpha = s1 * (1 - s2); pill(ctx, '① 노드·엣지 추출', PX + PW / 2, PY + 44, 330, 52, C.ink, '#FFFFFF', 27, 800); }
  if (s2 > 0) { ctx.globalAlpha = s2; pill(ctx, '② 커뮤니티 디텍션', PX + PW / 2, PY + 44, 330, 52, C.brand, C.ink, 27, 800); }
  ctx.restore();
  // 커뮤니티 묶음 원
  var pc = es(T, TL.comm, TL.comm + 1.4);
  for (var c = 0; c < 3 && pc > 0; c++) {
    ctx.save();
    ctx.globalAlpha = 0.9 * pc;
    ctx.fillStyle = COMM_T[c];
    ctx.strokeStyle = rgba(COMM[c], 0.5); ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.arc(CENTER[c][0], CENTER[c][1], 150 * pc, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // 엣지 — 실선(EXTRACTED) 먼저, 점선(INFERRED) 나중
  var solid = 0, dashed = 0, k;
  for (k = 0; k < EDGES.length; k++) if (EDGES[k][2]) dashed++; else solid++;
  var si = 0, di = 0;
  for (k = 0; k < EDGES.length; k++) {
    var e = EDGES[k], a = NODES[e[0]], b = NODES[e[1]], st, pe;
    if (!e[2]) { st = TL.e0 + (TL.eDur * 0.6) * si / solid; si++; }
    else { st = TL.e0 + TL.eDur * 0.6 + (TL.eDur * 0.4) * di / dashed; di++; }
    pe = es(T, st, st + 0.5);
    dline(ctx, a[0], a[1], b[0], b[1], pe, e[2] ? C.muted : C.sub, e[2] ? 4 : 5, e[2] ? [10, 10] : null);
  }
  // 노드
  for (k = 0; k < NODES.length; k++) {
    var n = NODES[k], st2 = TL.n0 + TL.nStep * k, pn = es(T, st2, st2 + 0.4);
    node(ctx, n[0], n[1], 22, pn, pc > 0.3 ? COMM[n[2]] : C.ink);
  }
  // 범례
  var pl = es(T, TL.legend, TL.legend + 0.6);
  if (pl > 0) {
    ctx.save(); ctx.globalAlpha = pl;
    var ly = PY + PH - 84;
    dline(ctx, PX + 36, ly, PX + 96, ly, 1, C.sub, 5);
    txt(ctx, 'EXTRACTED', PX + 110, ly, 24, 800, C.sub, 'left', MONO);
    dline(ctx, PX + 36, ly + 40, PX + 96, ly + 40, 1, C.muted, 4, [10, 10]);
    txt(ctx, 'INFERRED', PX + 110, ly + 40, 24, 800, C.muted, 'left', MONO);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'graphify', '폴더 하나 → knowledge graph → 3대 산출물', 0.2);
  var i, y, p;
  // 입력 카드 + 판으로 들어가는 화살표
  for (i = 0; i < 3; i++) {
    p = es(T, TL.in0 + TL.inStep * i, TL.in0 + TL.inStep * i + 0.6);
    if (p <= 0) continue;
    y = rowY(i);
    card(ctx, IX - (1 - p) * 30, y - IH / 2, IW, IH, { alpha: p, r: 18 });
    doc(ctx, IX + 26 - (1 - p) * 30, y - 52, 82, 104, { alpha: p, rows: 3 });
    ctx.save(); ctx.globalAlpha = p;
    fit(ctx, INPUTS[i][0], IX + 130 - (1 - p) * 30, y - 18, 32, 800, C.ink, 'left', IW - 150);
    fit(ctx, INPUTS[i][1], IX + 130 - (1 - p) * 30, y + 28, 24, 600, C.muted, 'left', IW - 150, MONO);
    ctx.restore();
    var pa = es(T, TL.feed + 0.2 * i, TL.feed + 0.2 * i + 0.7);
    arrow(ctx, IX + IW + 14, y, PX - 14, lerp(y, PY + PH / 2, 0.5), pa, C.muted, 5);
  }
  panel(ctx, T);
  // 산출물 카드
  for (i = 0; i < 3; i++) {
    var a = TL.out0 + TL.outStep * i;
    y = rowY(i);
    arrow(ctx, PX + PW + 14, lerp(y, PY + PH / 2, 0.5), OX - 14, y, es(T, a, a + 0.5), C.brandInk, 5);
    p = es(T, a + 0.3, a + 0.9);
    if (p <= 0) continue;
    card(ctx, OX + (1 - p) * 30, y - IH / 2, OW, IH, { alpha: p, fill: C.tint, stroke: C.brand, lw: 3, r: 18 });
    ctx.save(); ctx.globalAlpha = p;
    fit(ctx, OUTPUTS[i][0], OX + 28 + (1 - p) * 30, y - 40, 30, 800, C.ink, 'left', OW - 56, MONO);
    fit(ctx, OUTPUTS[i][1], OX + 28 + (1 - p) * 30, y + 6, 27, 700, C.sub, 'left', OW - 56);
    fit(ctx, OUTPUTS[i][2], OX + 28 + (1 - p) * 30, y + 48, 24, 600, C.brandInk, 'left', OW - 56);
    ctx.restore();
  }
  footer(ctx, T, '최초 빌드만 토큰 소비 → 이후 graphify update . (AST-only, 무비용)', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
