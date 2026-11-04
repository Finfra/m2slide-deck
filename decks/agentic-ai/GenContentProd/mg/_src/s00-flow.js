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
