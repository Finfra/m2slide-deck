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
