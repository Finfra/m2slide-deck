// 장면 ⑥ — Part2 미니 프로젝트 흐름 (원고 근거: 02-part2 «Part2 시작» · «미니 프로젝트 목표·산출물» · «MVP 개발 3단계 흐름» · «nPTiR 사이클 복습 + 이번 섹션 시나리오» · «(시연) Plan 자동 생성 + 검토»)
var NAME = 'mg-05-project', DUR = 18;
var TL = { chip0: 1.0, cstep: 0.4, left: 3.4, d0: 4.0, dstep: 0.8, prod: 6.6, bad: 8.0, mid: 9.2, r0: 10.0, rstep: 0.8, res: 12.6, review: 13.6, foot: 15.0 };
var CHIPS = ['셋팅', '1단계 MVP', '(선택) Superpowers', '2단계 기능 개선', '코드 리뷰'];
var CG = 30, CHW = (CW - CG * 4) / 5, CY = 190, CH = 84;
var PY = 330, PH = 570, LW = 620, LX = X0, RX = X1 - LW;
var DOCS = [['PRD.md', '무엇을·왜'], ['tasks.md', '어떻게·언제'], ['코드', 'tasks 1번씩 실행']];
var CHAIN = ['docker-compose.yml → MySQL', 'Node mysql2 연동', '조회수 API + 인기 문서 라우트'];
function curChip(T) { return T < TL.left ? 0 : T < TL.mid ? 1 : T < TL.review ? 3 : 4; }
function chips(ctx, T) {
  var cur = curChip(T);
  for (var i = 0; i < 5; i++) {
    var a = TL.chip0 + TL.cstep * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var x = X0 + i * (CHW + CG), on = i === cur, opt = i === 2;
    ctx.save(); ctx.globalAlpha = p;
    if (opt) ctx.setLineDash([10, 8]);
    card(ctx, x, CY, CHW, CH, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : opt ? C.muted : C.line, lw: on ? 5 : 2, shadow: on ? 1 : 0 });
    ctx.setLineDash([]);
    fit(ctx, CHIPS[i], x + CHW / 2, CY + CH / 2 + 1, 30, 800, opt ? C.muted : C.ink, 'center', CHW - 30);
    ctx.restore();
    if (i < 4) arrow(ctx, x + CHW + 4, CY + CH / 2, x + CHW + CG - 2, CY + CH / 2, es(T, a + 0.3, a + 0.6), C.brandInk, 4);
  }
}
function leftPanel(ctx, T) {
  var p = es(T, TL.left, TL.left + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, LX, PY, LW, PH, {});
  txt(ctx, '1단계 MVP', LX + 36, PY + 50, 38, 800, C.ink, 'left');
  txt(ctx, 'Node.js만 사용', LX + LW - 36, PY + 52, 26, 600, C.muted, 'right');
  for (var i = 0; i < 3; i++) {
    var a = TL.d0 + TL.dstep * i, q = es(T, a, a + 0.5), cx = LX + 110 + i * 200;
    if (q <= 0) continue;
    ctx.globalAlpha = p * q;
    doc(ctx, cx - 55, PY + 100 + (1 - q) * 20, 110, 136, { rows: 4 });
    fit(ctx, DOCS[i][0], cx, PY + 270, 30, 800, C.ink, 'center', 180);
    fit(ctx, DOCS[i][1], cx, PY + 308, 24, 600, C.sub, 'center', 180);
    ctx.globalAlpha = p;
    if (i < 2) arrow(ctx, cx + 66, PY + 168, cx + 134, PY + 168, es(T, a + 0.4, a + 0.8), C.brandInk, 4);
  }
  var pr = es(T, TL.prod, TL.prod + 0.6);
  if (pr > 0) {
    ctx.globalAlpha = p * pr;
    card(ctx, LX + 30, PY + 350, LW - 60, 76, { fill: C.tint, stroke: 'transparent', shadow: 0, r: 14 });
    fit(ctx, 'Node 서버 + MD 렌더러 + 파일 목록 UI', LX + LW / 2, PY + 389, 30, 700, C.ink, 'center', LW - 100);
  }
  var pb = es(T, TL.bad, TL.bad + 0.6);
  ctx.globalAlpha = p;
  crossmark(ctx, LX + 70, PY + 500, 28, pb, C.red);
  if (pb > 0) {
    ctx.globalAlpha = p * pb;
    fit(ctx, '재시작 시 데이터 소실', LX + 116, PY + 501, 32, 800, C.red, 'left', LW - 150);
  }
  ctx.restore();
}
function middle(ctx, T) {
  var q = es(T, TL.mid, TL.mid + 0.8);
  if (q <= 0) return;
  var y = PY + 500, x1 = LX + LW + 20, x2 = RX - 20;
  arrow(ctx, x1, y, x2, y, q, C.red, 6);
  ctx.save(); ctx.globalAlpha = q;
  fit(ctx, '영속 저장소(DB)', (x1 + x2) / 2, y - 44, 26, 800, C.red, 'center', x2 - x1);
  fit(ctx, '필요', (x1 + x2) / 2, y + 40, 26, 800, C.red, 'center', x2 - x1);
  ctx.restore();
}
function rightPanel(ctx, T) {
  var p = es(T, TL.mid + 0.4, TL.mid + 1.0);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, RX, PY, LW, PH, { fill: C.blueTint, stroke: C.blue, lw: 3 });
  txt(ctx, '2단계 기능 개선', RX + 36, PY + 50, 38, 800, C.blue, 'left');
  txt(ctx, 'DB + Docker', RX + LW - 36, PY + 52, 26, 600, C.blue, 'right');
  for (var i = 0; i < 3; i++) {
    var a = TL.r0 + TL.rstep * i, q = es(T, a, a + 0.5), y = PY + 110 + i * 104;
    if (q <= 0) continue;
    ctx.globalAlpha = p * q;
    card(ctx, RX + 30 + (1 - q) * 30, y, LW - 60, 76, { r: 14, shadow: 0 });
    fit(ctx, CHAIN[i], RX + LW / 2, y + 39, 28, 700, C.ink, 'center', LW - 110, i === 0 ? MONO : KR);
    ctx.globalAlpha = p;
    if (i < 2) arrow(ctx, RX + LW / 2, y + 80, RX + LW / 2, y + 102, es(T, a + 0.5, a + 0.8), C.blue, 4);
  }
  var pr = es(T, TL.res, TL.res + 0.6);
  if (pr > 0) {
    ctx.globalAlpha = p * pr;
    card(ctx, RX + 30, PY + 450, LW - 60, 84, { fill: C.greenTint, stroke: C.green, lw: 3, r: 14, shadow: 0 });
    fit(ctx, '조회수 추적 + 인기 문서 TOP 3', RX + 70, PY + 493, 30, 800, C.green, 'left', LW - 200);
  }
  ctx.restore();
  stamp(ctx, RX + LW - 80, PY + 492, 26, es(T, TL.res + 0.4, TL.res + 0.9), C.green);
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'Part 2', 'MD 파일 뷰어 — MVP에서 기능 개선까지', 0.2);
  chips(ctx, T);
  leftPanel(ctx, T);
  middle(ctx, T);
  rightPanel(ctx, T);
  footer(ctx, T, '가져갈 것: 작동하는 코드 + nPTiR 사이클 1회 + Docker 첫 체험', TL.foot);
}
