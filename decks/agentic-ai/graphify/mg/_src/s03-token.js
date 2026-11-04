// 장면 ④ — 필요한 노드만 (원고 근거: «절대 하지 말 것» · «권장 탐색 패턴» · «path & explain 사용 예시» · «코드베이스 탐색 워크플로» · «graphify가 해결하는 문제»)
var NAME = 'mg-03-token', DUR = 17;
var TL = { left: 1.0, r0: 1.6, rStep: 0.8, meter: 3.4, meterEnd: 5.2, cross: 5.6, right: 6.4, cmd0: 6.8, cmdStep: 0.8, path0: 9.4, pathStep: 0.5, small: 12.0, ok: 13.0, foot: 14.4 };
var BAD = [['Read graphify-out/graph.json', '수백 KB — 절대 금지'], ['Read graphify-out/GRAPH_REPORT.md', '300+ 줄 — bash 발췌만']];
var CMDS = ['graphify query "X와 Y의 관계"', 'graphify path "Info.md" "slide/index.html"', 'graphify explain "개념명"'];
var PATH = ['Info.md', 'agenda-designer', 'AGENDA.md', 'generate-slides.js', 'slide/index.html'];
var LX = X0, LW = 820, RX = 980, RW = X1 - RX, PY = 190, PH = 750;
// 컨텍스트 창 막대 — v(0~) 만큼 참, 1 을 넘으면 넘침
function meter(ctx, x, y, w, v, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = C.paper; rr(ctx, x, y, w, 56, 14); ctx.fill();
  ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
  if (v > 0) { ctx.fillStyle = color; rr(ctx, x, y, Math.max(28, w * Math.min(v, 1.06)), 56, 14); ctx.fill(); }
  ctx.restore();
}
function left(ctx, T) {
  var p = es(T, TL.left, TL.left + 0.6);
  if (p <= 0) return;
  card(ctx, LX, PY, LW, PH, { alpha: p, fill: C.redTint, stroke: rgba(C.red, 0.35), r: 24 });
  ctx.save(); ctx.globalAlpha = p;
  txt(ctx, '절대 하지 말 것', LX + 40, PY + 60, 36, 800, C.red, 'left');
  ctx.restore();
  for (var i = 0; i < 2; i++) {
    var a = TL.r0 + TL.rStep * i, pr = es(T, a, a + 0.6), y = PY + 170 + i * 150;
    if (pr <= 0) continue;
    doc(ctx, LX + 40, y - 46, 70, 92, { alpha: pr, rows: 3 });
    ctx.save(); ctx.globalAlpha = pr;
    fit(ctx, BAD[i][0], LX + 134, y - 18, 28, 700, C.ink, 'left', LW - 170, MONO);
    fit(ctx, BAD[i][1], LX + 134, y + 26, 27, 800, C.red, 'left', LW - 170);
    ctx.restore();
  }
  // 컨텍스트 창 — 차오르다 넘침
  var pm = es(T, TL.meter - 0.3, TL.meter);
  if (pm > 0) {
    var v = 1.06 * es(T, TL.meter, TL.meterEnd), my = PY + 500;
    ctx.save(); ctx.globalAlpha = pm;
    txt(ctx, '컨텍스트 창', LX + 40, my - 36, 28, 700, C.sub, 'left');
    ctx.restore();
    meter(ctx, LX + 40, my, LW - 100, v, v > 0.8 ? C.red : C.brand, pm);
    var pw = es(T, TL.meterEnd - 0.3, TL.meterEnd + 0.3);
    if (pw > 0) { ctx.save(); ctx.globalAlpha = pw; txt(ctx, '컨텍스트 창 낭비 → LLM 정확도 저하', LX + 40, my + 110, 30, 800, C.red, 'left'); ctx.restore(); }
  }
  crossmark(ctx, LX + LW - 60, PY + 60, 34, es(T, TL.cross, TL.cross + 0.5), C.red);
}
function right(ctx, T) {
  var p = es(T, TL.right, TL.right + 0.6);
  if (p <= 0) return;
  card(ctx, RX, PY, RW, PH, { alpha: p, fill: C.greenTint, stroke: rgba(C.green, 0.35), r: 24 });
  ctx.save(); ctx.globalAlpha = p;
  txt(ctx, '권장 탐색 패턴', RX + 40, PY + 60, 36, 800, C.green, 'left');
  // 터미널 카드
  var tx = RX + 40, ty = PY + 110, tw = RW - 80, th = 210;
  ctx.fillStyle = C.ink; rr(ctx, tx, ty, tw, th, 16); ctx.fill();
  ctx.restore();
  for (var i = 0; i < 3; i++) {
    var a = TL.cmd0 + TL.cmdStep * i, pc = seg(T, a, a + 0.7);
    if (pc <= 0) continue;
    var s = CMDS[i].substr(0, Math.round(CMDS[i].length * pc));
    fit(ctx, '$ ' + s, tx + 30, ty + 48 + i * 58, 26, 600, i === 1 ? C.brand : '#FFFFFF', 'left', tw - 60, MONO);
  }
  // path 결과 — 세로 사슬
  var cx = RX + 40, cw = 400, ch = 54, cy0 = PY + 360, cstep = 76;
  var pcap = es(T, TL.path0 - 0.3, TL.path0);
  if (pcap > 0) { ctx.save(); ctx.globalAlpha = pcap; txt(ctx, 'path 결과', cx + cw + 30, cy0 + ch / 2, 26, 700, C.sub, 'left'); ctx.restore(); }
  for (var k = 0; k < PATH.length; k++) {
    var b = TL.path0 + TL.pathStep * k, pk = es(T, b, b + 0.4), y = cy0 + k * cstep;
    if (pk <= 0) continue;
    if (k > 0) arrow(ctx, cx + cw / 2, y - cstep + ch + 2, cx + cw / 2, y - 2, pk, C.green, 4);
    ctx.save(); ctx.globalAlpha = pk;
    ctx.fillStyle = C.paper; rr(ctx, cx, y, cw, ch, ch / 2); ctx.fill();
    ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.stroke();
    fit(ctx, PATH[k], cx + cw / 2, y + ch / 2 + 1, 25, 700, C.ink, 'center', cw - 40, MONO);
    ctx.restore();
  }
  // 오른쪽 컨텍스트 창 — 조금만
  var mx = cx + cw + 30, mw = RX + RW - 40 - mx, my = PY + 520;
  var pm = es(T, TL.small - 0.3, TL.small);
  if (pm > 0) {
    ctx.save(); ctx.globalAlpha = pm;
    txt(ctx, '컨텍스트 창', mx, my - 36, 28, 700, C.sub, 'left');
    ctx.restore();
    meter(ctx, mx, my, mw, 0.18 * es(T, TL.small, TL.small + 0.8), C.green, pm);
  }
  var po = es(T, TL.ok, TL.ok + 0.5);
  stamp(ctx, mx + 30, my + 130, 30, po, C.green);
  if (po > 0) { ctx.save(); ctx.globalAlpha = po; fit(ctx, '타겟 파일만 Read', mx + 76, my + 130, 30, 800, C.green, 'left', mw - 80); ctx.restore(); }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '토큰 절약', '전체 Read 대신 — 필요한 노드만', 0.2);
  left(ctx, T);
  right(ctx, T);
  footer(ctx, T, '질의 시 필요한 노드만 가져옴 → 토큰 최소화', TL.foot);
}
