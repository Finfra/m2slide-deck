// 장면 ⑥ — 시작하기 (원고 근거: 06 «원라인 설치» · «셀프업데이트 커맨드» · «첫 실습 — 지금 해보기»)
var NAME = 'mg-06-start', DUR = 15;
var TL = { cmd: 0.6, checks: 3.2, noClone: 4.6, path: 5.4, step: 1.1, maint: 11.6, foot: 13.0 };
var TM = { x: 80, y: 186, w: 1760, h: 230 };
var SW = 312, SG = 50, SY = 480, SH = 210;
function install(ctx, T) {
  var a = es(T, TL.cmd - 0.4, TL.cmd);
  win(ctx, TM.x, TM.y, TM.w, TM.h, 'sh', true, a);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  var x = TM.x + 36;
  promptLine(ctx, T < TL.checks ? T : TL.checks, x, TM.y + 100, L.cmd, '', TL.cmd, 40, 26, C.termInk, C.termInk, TM.w - 80);
  var cx = x;
  for (var i = 0; i < 3; i++) {
    var p = es(T, TL.checks + 0.5 * i, TL.checks + 0.5 * i + 0.4);
    if (p <= 0) continue;
    ctx.globalAlpha = a * p;
    cx += pill(ctx, '✓ ' + L.checks[i], cx, TM.y + 172, 26, '#244A36', '#7EE2A8', 'left') + 18;
  }
  var q = es(T, TL.noClone, TL.noClone + 0.5);
  if (q > 0) { ctx.globalAlpha = a * q; txt(ctx, L.noClone, TM.x + TM.w - 40, TM.y + 172, 26, 700, C.termDim, 'right', TM.w - (cx - TM.x) - 60); }
  ctx.restore();
}
function path(ctx, T) {
  var cur = Math.floor((T - TL.path) / TL.step);
  var lp = es(T, TL.path - 0.4, TL.path + TL.step * 4 + 0.6);
  // 단계를 잇는 선과 이동 표지
  if (lp > 0) {
    var y = SY + SH + 40, x1 = TM.x + SW / 2, x2 = TM.x + 4 * (SW + SG) + SW / 2;
    ctx.strokeStyle = C.line; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    ctx.strokeStyle = C.brand; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(lerp(x1, x2, lp), y); ctx.stroke();
    ctx.fillStyle = C.brand; ctx.beginPath(); ctx.arc(lerp(x1, x2, lp), y, 16, 0, Math.PI * 2); ctx.fill();
  }
  for (var i = 0; i < 5; i++) {
    var a = TL.path - 0.6 + 0.12 * i, p = es(T, a, a + 0.5), x = TM.x + i * (SW + SG);
    if (p <= 0) continue;
    var on = i === cur && T < TL.maint, past = T >= TL.path + TL.step * i;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, SY - (on ? 12 : 0), SW, SH, { fill: on ? C.tint : C.paper, stroke: past ? C.brand : C.line, lw: on ? 4 : 2, shadow: on ? 1 : 0, r: 20 });
    var yy = SY - (on ? 12 : 0);
    ctx.fillStyle = past ? C.brand : C.line; ctx.beginPath(); ctx.arc(x + 50, yy + 54, 28, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), x + 50, yy + 55, 30, 800, '#FFFFFF', 'center');
    txt(ctx, L.steps[i][0], x + 30, yy + 120, 32, 800, C.ink, 'left', SW - 60);
    txt(ctx, L.steps[i][1], x + 30, yy + 166, 23, 600, C.sub, 'left', SW - 50);
    if (i < 4) arrow(ctx, x + SW + 8, SY + SH / 2, x + SW + SG - 8, SY + SH / 2, p, C.muted, 3);
    ctx.restore();
  }
}
function maint(ctx, T) {
  var p = es(T, TL.maint, TL.maint + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  var y = 858, x = TM.x;
  x += pill(ctx, L.maint, x, y, 28, C.ink, '#FFFFFF', 'left') + 24;
  for (var i = 0; i < 4; i++) {
    var q = es(T, TL.maint + 0.2 + 0.15 * i, TL.maint + 0.6 + 0.15 * i);
    ctx.globalAlpha = p * q;
    x += pill(ctx, L.chips[i], x, y, 28, C.tint, C.brandInk, 'left', MONO) + 18;
  }
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, L.chip, L.title, 0.2);
  install(ctx, T);
  path(ctx, T);
  maint(ctx, T);
  footer(ctx, T, L.foot, TL.foot);
}
