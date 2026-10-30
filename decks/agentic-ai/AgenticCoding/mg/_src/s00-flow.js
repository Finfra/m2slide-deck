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
