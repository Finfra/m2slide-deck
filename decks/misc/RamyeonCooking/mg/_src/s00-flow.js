// 장면 ① — 전체 흐름 (원고 근거: RamyeonCooking.md «전체 흐름» htmlart process 6단계 + 요약 두 줄)
var NAME = 'mg-00-flow', DUR = 15;
var TL = { step0: 1.0, step: 1.1, run: 8.0, runEnd: 11.0, foot: 12.0 };
var STEPS = [
  ['물', '물 550ml 끓이기'],
  ['스프', '스프 먼저 투입'],
  ['면', '면 투입·타이머 시작'],
  ['시간', '4분 30초 가열'],
  ['고명', '계란·고명 추가'],
  ['완성', '불 끄고 담기'],
];
var N = STEPS.length, GAP = 46, SW = (CW - GAP * (N - 1)) / N, SY = 330, SH = 360;
function sx(i) { return X0 + i * (SW + GAP); }
function steps(ctx, T) {
  // 진행 표시 — 8.0~11.0 동안 1번 칸부터 6번 칸까지 차례로 노랗게 채워짐
  var run = seg(T, TL.run, TL.runEnd) * N;
  for (var i = 0; i < N; i++) {
    var a = TL.step0 + TL.step * i, p = es(T, a, a + 0.6);
    if (p <= 0) continue;
    var x = sx(i), y = SY + (1 - p) * 40, lit = clamp(run - i, 0, 1);
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, y, SW, SH, { fill: lit > 0.5 ? C.tint : C.paper, stroke: lit > 0.5 ? C.brand : C.line, lw: lit > 0.5 ? 4 : 2 });
    ctx.fillStyle = lit > 0 ? C.brand : C.line;
    ctx.beginPath(); ctx.arc(x + SW / 2, y + 78, 44, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), x + SW / 2, y + 80, 44, 800, C.ink, 'center');
    fit(ctx, STEPS[i][0], x + SW / 2, y + 190, 54, 800, C.ink, 'center', SW - 30);
    fit(ctx, STEPS[i][1], x + SW / 2, y + 280, 28, 600, C.sub, 'center', SW - 30);
    ctx.restore();
    if (i < N - 1) {
      var ap = es(T, a + 0.5, a + 1.0);
      arrow(ctx, x + SW + 6, SY + SH / 2, x + SW + GAP - 6, SY + SH / 2, ap, C.brandInk, 5);
    }
  }
  // 진행 막대 — 칸 아래
  var pr = es(T, TL.run, TL.runEnd);
  if (pr > 0) {
    var by = SY + SH + 70;
    ctx.fillStyle = C.line; rr(ctx, X0, by, CW, 18, 9); ctx.fill();
    ctx.fillStyle = C.brand; rr(ctx, X0, by, CW * pr, 18, 9); ctx.fill();
    ctx.save(); ctx.globalAlpha = es(T, TL.run, TL.run + 0.5);
    txt(ctx, '순서대로', X0, by + 60, 30, 700, C.brandInk, 'left');
    ctx.restore();
  }
  stamp(ctx, sx(N - 1) + SW - 34, SY + 34, 30, es(T, TL.runEnd, TL.runEnd + 0.4), C.green);
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '전체 흐름', '물 → 스프 → 면 → 시간 → 고명 → 완성', 0.2);
  steps(ctx, T);
  footer(ctx, T, '각 단계의 순서가 맛을 좌우함', TL.foot);
}
