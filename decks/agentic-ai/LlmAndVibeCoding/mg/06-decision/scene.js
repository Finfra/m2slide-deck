// scene.js — LlmAndVibeCoding 강연 모션그래픽 06-decision (세대 선택 의사결정 트리) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s06-decision.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — LlmAndVibeCoding 덱 mg 7개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 default_lec 색 체계 · 3:2(1620×1080) 판형. 카드 점선(o.dash) 추가
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1620, H = 1080;
var X0 = 70, X1 = W - 70, CW = X1 - X0; // 본문 좌우 여백 70 — 본문 폭 1480
var C = {
  bg: '#FFFDF6', ink: '#222222', sub: '#4A4A44', muted: '#8A877A', line: '#E3DFD0', paper: '#FFFFFF',
  brand: '#F5C518', brandInk: '#7A6000', tint: '#FFF6D5',
  blue: '#0365C0', blueTint: '#EAF2FB', purple: '#6B3FA0', purpleTint: '#F1EAF8', red: '#C82506', redTint: '#FDECE8', green: '#1F7A4D', greenTint: '#E4F3EA',
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
  if (o.dash) ctx.setLineDash(o.dash);
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

// 선 위를 따라가는 점의 위치 — pts: [[x,y],…], u: 0~1 (길이 비례)
function along(pts, u) {
  var L = [], tot = 0, i;
  for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  var r = clamp(u, 0, 1) * tot;
  for (i = 0; i < L.length; i++) {
    if (r <= L[i] || i === L.length - 1) { var q = L[i] ? clamp(r / L[i], 0, 1) : 0; return [lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)]; }
    r -= L[i];
  }
  return pts[pts.length - 1];
}
function dot(ctx, x, y, r, color) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

// 장면 ⑦ — 세대 선택 의사결정 트리 (원고 근거: 05-generation-comparison «의사결정 트리» / 04-vibecoding-generations «선택 가이드 (계속)» 두 가지 모두 사용)
var NAME = 'mg-06-decision', DUR = 18;
var TL = { n0: 1.0, nstep: 0.45, p0: 6.0, plen: 2.6, both: 14.0, foot: 15.4 };
// 마디 — kind: s(시작) q(질문) g1(1세대) g2(2세대) · sub: 결과 위 작은 글자
var N = {
  st: { x: 170, y: 560, w: 150, h: 84, kind: 's', t: '시작' },
  q1: { x: 450, y: 560, w: 230, h: 104, kind: 'q', t: '터미널', t2: '사용 익숙?' },
  r1: { x: 450, y: 830, w: 230, h: 104, kind: 'g1', t: '1세대 · Cursor 추천', sub: '' },
  q2: { x: 790, y: 560, w: 240, h: 104, kind: 'q', t: '여러 프로젝트', t2: '동시 관리?' },
  r2: { x: 790, y: 300, w: 240, h: 104, kind: 'g2', t: '2세대 · Claude Code', sub: '' },
  q3: { x: 1110, y: 560, w: 220, h: 104, kind: 'q', t: '주 작업', t2: '영역은?' },
  r3: { x: 1420, y: 330, w: 230, h: 104, kind: 'g1', t: '1세대 · Cursor', sub: '프론트엔드' },
  r4: { x: 1420, y: 560, w: 230, h: 104, kind: 'g2', t: '2세대 · Claude Code', sub: '백엔드/풀스택' },
  r5: { x: 1420, y: 790, w: 230, h: 104, kind: 'g2', t: '2세대 · Gemini CLI', sub: 'DevOps/인프라' },
};
var ORDER = ['st', 'q1', 'r1', 'q2', 'r2', 'q3', 'r3', 'r4', 'r5'];
var EDGES = [
  ['st', 'q1', ''], ['q1', 'r1', '아니오'], ['q1', 'q2', '예'], ['q2', 'r2', '예'], ['q2', 'q3', '아니오'],
  ['q3', 'r3', ''], ['q3', 'r4', ''], ['q3', 'r5', ''],
];
var PATHS = [['st', 'q1', 'r1'], ['st', 'q1', 'q2', 'r2'], ['st', 'q1', 'q2', 'q3', 'r5']];
function appear(id) { return TL.n0 + TL.nstep * ORDER.indexOf(id); }
// 두 마디 사이 — 상자 가장자리에서 가장자리로
function ends(a, b) {
  var A = N[a], B = N[b], dx = B.x - A.x, dy = B.y - A.y;
  function edge(M, sx, sy) {
    var kx = sx ? (M.w / 2 + 6) / Math.abs(sx) : 1e9, ky = sy ? (M.h / 2 + 6) / Math.abs(sy) : 1e9, k = Math.min(kx, ky);
    return [M.x + sx * k, M.y + sy * k];
  }
  return [edge(A, dx, dy), edge(B, -dx, -dy)];
}
function activeEdge(T, a, b) { // 지금 강조 중인 경로에서 이 선이 칠해진 정도
  for (var i = 0; i < PATHS.length; i++) {
    var s = TL.p0 + TL.plen * i, P = PATHS[i];
    if (T < s || T > s + TL.plen + 0.2 && i < PATHS.length - 1) continue;
    for (var k = 0; k + 1 < P.length; k++) {
      if (P[k] === a && P[k + 1] === b) return es(T, s + 0.45 * k, s + 0.45 * k + 0.4);
    }
  }
  return 0;
}
function activeNode(T, id) {
  for (var i = 0; i < PATHS.length; i++) {
    var s = TL.p0 + TL.plen * i, P = PATHS[i], k = P.indexOf(id);
    if (k < 0 || T < s || (T > s + TL.plen + 0.2 && i < PATHS.length - 1)) continue;
    return es(T, s + 0.45 * k, s + 0.45 * k + 0.3);
  }
  return 0;
}
function edges(ctx, T) {
  for (var i = 0; i < EDGES.length; i++) {
    var e = EDGES[i], p = es(T, appear(e[1]) - 0.25, appear(e[1]) + 0.2);
    if (p <= 0) continue;
    var q = ends(e[0], e[1]), h = activeEdge(T, e[0], e[1]);
    arrow(ctx, q[0][0], q[0][1], q[1][0], q[1][1], p, C.line, 5);
    if (h > 0) arrow(ctx, q[0][0], q[0][1], q[1][0], q[1][1], h, C.brandInk, 7);
    if (e[2] && p > 0.6) {
      var mx = (q[0][0] + q[1][0]) / 2, my = (q[0][1] + q[1][1]) / 2, horiz = Math.abs(q[1][0] - q[0][0]) > Math.abs(q[1][1] - q[0][1]);
      ctx.save(); ctx.globalAlpha = seg(p, 0.6, 1);
      pill(ctx, e[2], mx + (horiz ? 0 : 50), my + (horiz ? -40 : 0), e[2].length > 1 ? 76 : 48, 32, C.paper, C.sub, 21, 800);
      ctx.restore();
    }
  }
}
function node(ctx, T, id) {
  var M = N[id], p = es(T, appear(id), appear(id) + 0.5);
  if (p <= 0) return;
  var h = activeNode(T, id), fill = C.paper, stroke = C.line, color = C.ink;
  if (M.kind === 's') { fill = C.greenTint; stroke = C.green; }
  if (M.kind === 'q') { fill = C.paper; stroke = C.brand; }
  if (M.kind === 'g1') { fill = C.blueTint; stroke = C.blue; color = C.blue; }
  if (M.kind === 'g2') { fill = C.purpleTint; stroke = C.purple; color = C.purple; }
  var s = 1 + 0.06 * h;
  ctx.save(); ctx.globalAlpha = p;
  ctx.translate(M.x, M.y); ctx.scale(s, s);
  card(ctx, -M.w / 2, -M.h / 2, M.w, M.h, { fill: fill, stroke: h > 0.5 ? C.brandInk : stroke, lw: 3 + 2 * h, r: M.kind === 's' ? 42 : 18 });
  if (M.kind === 'q') {
    fit(ctx, M.t, 0, -18, 27, 800, C.ink, 'center', M.w - 24);
    fit(ctx, M.t2, 0, 20, 27, 800, C.ink, 'center', M.w - 24);
  } else if (M.sub) {
    fit(ctx, M.sub, 0, -20, 22, 700, C.sub, 'center', M.w - 24);
    fit(ctx, M.t, 0, 18, 27, 800, color, 'center', M.w - 24);
  } else {
    fit(ctx, M.t, 0, 1, M.kind === 's' ? 30 : 27, 800, color, 'center', M.w - 24);
  }
  ctx.restore();
}
function both(ctx, T) {
  var p = es(T, TL.both, TL.both + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, X0, 220 + (1 - p) * 12, 520, 150, { fill: C.tint, stroke: C.brand, lw: 3 });
  txt(ctx, '두 가지 모두 사용', X0 + 28, 266 + (1 - p) * 12, 30, 800, C.ink, 'left');
  fit(ctx, '풀스택 · 대규모 프로젝트 · 팀 협업', X0 + 28, 322 + (1 - p) * 12, 26, 700, C.sub, 'left', 464);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '5장', '세대 선택 — 의사결정 트리', 0.2);
  edges(ctx, T);
  for (var i = 0; i < ORDER.length; i++) node(ctx, T, ORDER[i]);
  both(ctx, T);
  footer(ctx, T, '터미널 익숙도 · 프로젝트 수 · 주 작업 영역으로 세대를 고른다', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
