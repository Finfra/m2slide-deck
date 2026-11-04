// 장면 ② — Code-First → Intent-First (원고 근거: 01-opening «패러다임 전환: Code-First → Intent-First» · «개발자 역할의 변화»)
var NAME = 'mg-01-paradigm', DUR = 17;
var TL = { lp: 0.8, l0: 1.2, run: 3.4, lap: 1.8, laps: 2, done: 7.2, rp: 8.0, r0: 8.4, rrun: 10.2, rlen: 1.6, ok: 11.9, role: 12.6, foot: 14.6 };
var NW = 360, NH = 74, NY0 = 290, NSTEP = 112;
var LX = 400, RX = 1220; // 두 열의 가운데
var LEFT = ['개발자 아이디어', '코드 작성', '실행', '디버깅', '완료'];
var RIGHT = ['개발자 의도', '자연어 설명', 'AI 코드 생성', '검토 및 수정', '완료'];
var LOOPX = LX + NW / 2 + 80;
function ny(i) { return NY0 + i * NSTEP; }
function loopPts() { // 코드 작성 → 실행 → 디버깅 → (수정 필요) → 코드 작성
  return [[LX, ny(1)], [LX, ny(2)], [LX, ny(3)], [LOOPX, ny(3)], [LOOPX, ny(1)], [LX + NW / 2, ny(1)]];
}
function column(ctx, T, cx, names, a0, hot, hotColor, hotTint) {
  for (var i = 0; i < names.length; i++) {
    var a = a0 + 0.35 * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var y = ny(i), h = hot.indexOf(i) >= 0;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, cx - NW / 2, y - NH / 2 + (1 - p) * 16, NW, NH, { fill: h ? hotTint : C.paper, stroke: h ? hotColor : C.line, lw: h ? 3 : 2, r: 16 });
    fit(ctx, names[i], cx, y + 1 + (1 - p) * 16, 32, 800, C.ink, 'center', NW - 40);
    ctx.restore();
    if (i > 0) arrow(ctx, cx, ny(i - 1) + NH / 2 + 4, cx, y - NH / 2 - 6, es(T, a - 0.15, a + 0.2), C.muted, 4);
  }
}
function leftLoop(ctx, T) {
  var p = es(T, TL.l0 + 1.6, TL.l0 + 2.2);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.setLineDash([12, 9]);
  ctx.beginPath(); ctx.moveTo(LX + NW / 2 + 6, ny(3)); ctx.lineTo(LOOPX, ny(3)); ctx.lineTo(LOOPX, ny(1)); ctx.lineTo(LX + NW / 2 + 22, ny(1)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = C.red; ctx.beginPath();
  ctx.moveTo(LX + NW / 2 + 6, ny(1)); ctx.lineTo(LX + NW / 2 + 28, ny(1) - 12); ctx.lineTo(LX + NW / 2 + 28, ny(1) + 12); ctx.closePath(); ctx.fill();
  pill(ctx, '수정 필요?', LOOPX, (ny(1) + ny(3)) / 2, 150, 46, C.redTint, C.red, 24, 800);
  ctx.restore();
  // 반복 점 — 두 바퀴 돌고 완료로
  if (T >= TL.run) {
    var u = (T - TL.run) / TL.lap, xy;
    if (u < TL.laps) xy = along(loopPts(), u - Math.floor(u));
    else xy = along([[LX, ny(1)], [LX, ny(2)], [LX, ny(3)], [LX, ny(4)]], seg(T, TL.run + TL.lap * TL.laps, TL.done));
    dot(ctx, xy[0], xy[1], 13, C.red);
    var n = Math.min(TL.laps, Math.floor(u) + 1);
    txt(ctx, '반복 ×' + n, LOOPX, ny(1) - 66, 26, 800, C.red, 'center');
  }
}
function rightRun(ctx, T) {
  if (T < TL.rrun) return;
  var xy = along([[RX, ny(0)], [RX, ny(4)]], seg(T, TL.rrun, TL.rrun + TL.rlen));
  dot(ctx, xy[0], xy[1], 13, C.green);
  stamp(ctx, RX + NW / 2 + 50, ny(4), 30, es(T, TL.ok, TL.ok + 0.5), C.green);
}
function panelHead(ctx, T, a, cx, s, color, tint) {
  var p = es(T, a, a + 0.5);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  pill(ctx, s, cx, 205, 380, 58, tint, color, 30, 800);
  ctx.restore();
}
function role(ctx, T) {
  var rows = [['코드 작성자', '의도 설계자'], ['디버깅 중심', '품질 검토 중심']];
  for (var i = 0; i < 2; i++) {
    var a = TL.role + 0.6 * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var y = 880 + i * 58;
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, rows[i][0], LX, y, 30, 700, C.sub, 'center');
    arrow(ctx, LX + 200, y, RX - 200, y, p, C.brand, 5);
    txt(ctx, rows[i][1], RX, y, 30, 800, C.ink, 'center');
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '1장', '패러다임 전환 — Code-First → Intent-First', 0.2);
  // 점은 카드 아래로 지나간다 — 카드 사이 화살표 구간에서만 보임
  leftLoop(ctx, T);
  rightRun(ctx, T);
  panelHead(ctx, T, TL.lp, LX, 'Code-First · 전통적 개발', C.red, C.redTint);
  column(ctx, T, LX, LEFT, TL.l0, [1, 3], C.red, C.redTint);
  panelHead(ctx, T, TL.rp, RX, 'Intent-First · AI 시대 개발', C.green, C.greenTint);
  column(ctx, T, RX, RIGHT, TL.r0, [2], C.green, C.greenTint);
  role(ctx, T);
  footer(ctx, T, '"무엇을" 만들지 설명하면 AI가 "어떻게" 구현', TL.foot);
}
