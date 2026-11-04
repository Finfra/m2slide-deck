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
