// 장면 ⑤ — 다중 프로젝트 cdf · pm-do 위임 (원고 근거: 05 «번호 → 경로 레지스트리» · «cdf» · «cdf 다중 인덱스» / 05.1 «depends 의존성 체인» · «순차 vs 병렬»)
var NAME = 'mg-05-multi', DUR = 17;
var TL = { reg: 0.6, c1: 2.0, moved: 3.0, c2: 4.0, split: 5.4, pm: 7.0, dele: 7.8, work: 8.4, back: 9.8, main: 10.8, mode: 12.0, foot: 15.0 };
var RG = { x: 80, y: 190, w: 820, h: 300 }, TM = { x: 80, y: 520, w: 820, h: 390 };
var PM = { x: 980, y: 190, w: 860, h: 520 };
var NUMS = ['11', '12', '13'];
function registry(ctx, T) {
  var a = es(T, TL.reg, TL.reg + 0.6);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, RG.x, RG.y, RG.w, RG.h, { r: 18 });
  txt(ctx, L.reg, RG.x + 36, RG.y + 46, 30, 800, C.brandInk, 'left', RG.w - 72);
  txt(ctx, L.regCols[0], RG.x + 60, RG.y + 100, 24, 700, C.muted, 'left', 120);
  txt(ctx, L.regCols[1], RG.x + 220, RG.y + 100, 24, 700, C.muted, 'left', 300);
  var one = es(T, TL.c1 + 0.8, TL.c1 + 1.1) * (1 - es(T, TL.c2, TL.c2 + 0.3)), all = es(T, TL.c2 + 1.0, TL.c2 + 1.3);
  for (var i = 0; i < 3; i++) {
    var y = RG.y + 154 + i * 50, h = i === 0 ? Math.max(one, all) : all;
    if (h > 0) { ctx.fillStyle = rgba(C.brand, 0.18 * h); rr(ctx, RG.x + 24, y - 22, RG.w - 48, 44, 10); ctx.fill(); }
    txt(ctx, NUMS[i], RG.x + 60, y, 30, 800, C.ink, 'left', 0, MONO);
    txt(ctx, L.projects[i], RG.x + 220, y, 28, 700, C.ink, 'left', 300);
    bar(ctx, RG.x + 470, y, 220 - 40 * i, 14, C.line);
  }
  ctx.restore();
}
function terminal(ctx, T) {
  var a = es(T, TL.reg + 0.3, TL.reg + 0.9);
  var sp = es(T, TL.split, TL.split + 0.6);
  win(ctx, TM.x, TM.y, TM.w, TM.h, sp > 0.5 ? L.split : L.term, true, a);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  var x = TM.x + 32, mw = TM.w - 64;
  var single = 1 - sp;
  if (single > 0) {
    ctx.globalAlpha = a * single;
    var t1 = T < TL.c2 ? T : TL.c2 - 0.01;
    if (T < TL.c2) {
      promptLine(ctx, t1, x, TM.y + 110, L.cmd1, '', TL.c1, 8, 30, C.termInk, C.termInk, mw);
      var m = es(T, TL.moved, TL.moved + 0.3);
      if (m > 0) { ctx.globalAlpha = a * single * m; txt(ctx, '~/' + L.projects[0] + ' $', x, TM.y + 170, 30, 700, '#5FD08E', 'left', mw, MONO); }
    } else {
      promptLine(ctx, T, x, TM.y + 110, L.cmd2, '', TL.c2, 10, 30, C.termInk, C.termInk, mw);
    }
  }
  if (sp > 0) {
    var ph = (TM.h - 52) / 3;
    for (var i = 0; i < 3; i++) {
      var y = TM.y + 52 + i * ph;
      ctx.globalAlpha = a * es(T, TL.split + 0.15 * i, TL.split + 0.15 * i + 0.4);
      if (i > 0) { ctx.fillStyle = '#4A5568'; ctx.fillRect(TM.x, y, TM.w, 3); }
      txt(ctx, NUMS[i], x, y + ph / 2, 24, 700, C.termDim, 'left', 0, MONO);
      txt(ctx, '~/' + L.projects[i] + ' $', x + 60, y + ph / 2, 28, 700, '#5FD08E', 'left', mw - 60, MONO);
    }
  }
  ctx.restore();
}
function node(ctx, x, y, w, h, title, sub, color, fill) {
  card(ctx, x, y, w, h, { fill: fill, stroke: color, lw: 3, r: 18 });
  txt(ctx, title, x + w / 2, y + 50, 32, 800, C.ink, 'center', w - 40);
  if (sub) pill(ctx, sub, x + w / 2, y + 104, 24, color, '#FFFFFF', 'center');
}
function pmPanel(ctx, T) {
  var a = es(T, TL.pm, TL.pm + 0.6);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, PM.x, PM.y, PM.w, PM.h, { r: 18 });
  txt(ctx, L.pm, PM.x + 36, PM.y + 46, 30, 800, C.brandInk, 'left', PM.w - 72);
  var B = { x: PM.x + 40, y: PM.y + 100, w: 280, h: 150 }, A = { x: PM.x + PM.w - 320, y: PM.y + 100, w: 280, h: 150 };
  node(ctx, B.x, B.y, B.w, B.h, L.issue, L.dep, C.red, C.redTint);
  var w = es(T, TL.dele + 0.5, TL.dele + 0.9);
  ctx.globalAlpha = a * (0.35 + 0.65 * w);
  node(ctx, A.x, A.y, A.w, A.h, L.projA, '', C.brand, C.tint);
  // A 작업 진행 고리
  var r = es(T, TL.work, TL.back - 0.1);
  if (T >= TL.back) stamp(ctx, A.x + A.w / 2, A.y + 106, 26, es(T, TL.back - 0.1, TL.back + 0.3), C.green);
  else if (r > 0) {
    var cx = A.x + A.w / 2, cy = A.y + 106;
    ctx.strokeStyle = C.line; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.brand; ctx.beginPath(); ctx.arc(cx, cy, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); ctx.stroke();
  }
  ctx.globalAlpha = a;
  // 위임 → / ← commit hash
  var y1 = B.y + 50, y2 = B.y + 110, gx = (B.x + B.w + A.x) / 2, gw = A.x - B.x - B.w - 24;
  var d = es(T, TL.dele, TL.dele + 0.6);
  arrow(ctx, B.x + B.w + 14, y1, A.x - 14, y1, d, C.brand, 6);
  if (d > 0.6) txt(ctx, 'pm-do ' + L.delegate, gx, y1 - 26, 24, 800, C.brandInk, 'center', gw);
  var bk = es(T, TL.back, TL.back + 0.6);
  arrow(ctx, A.x - 14, y2, B.x + B.w + 14, y2, bk, C.green, 6);
  // 회수 문구는 화살표 아래 — 노드 밑 빈 띠까지 넓게 쓴다
  if (bk > 0.6) txt(ctx, L.commit, gx, B.y + B.h + 30, 24, 700, C.green, 'center', 2 * (gx - B.x - B.w / 2) - 40);
  // 본 작업 진행
  var mn = es(T, TL.main, TL.main + 0.5);
  if (mn > 0) {
    ctx.globalAlpha = a * mn;
    arrow(ctx, B.x + B.w / 2, B.y + B.h + 10, B.x + B.w / 2, B.y + B.h + 70, mn, C.green, 6);
    card(ctx, B.x, B.y + B.h + 80, PM.w - 80, 90, { fill: C.greenTint, stroke: C.green, lw: 3, shadow: 0, r: 16 });
    txt(ctx, L.main, B.x + 36, B.y + B.h + 125, 32, 800, C.green, 'left', PM.w - 220);
    stamp(ctx, B.x + PM.w - 140, B.y + B.h + 125, 28, es(T, TL.main + 0.3, TL.main + 0.7), C.green);
  }
  ctx.restore();
}
function dot(ctx, x, y, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill(); }
function modes(ctx, T) {
  var y = 740, h = 170, w = 410;
  var p = es(T, TL.mode, TL.mode + 0.6);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, PM.x, y, w, h, { r: 16, shadow: 0 });
    txt(ctx, L.seq, PM.x + 28, y + 36, 28, 800, C.ink, 'left', w - 56);
    txt(ctx, L.seqSub, PM.x + 28, y + 74, 20, 600, C.sub, 'left', w - 56);
    var sx = PM.x + 80;
    dot(ctx, sx, y + 128, C.brand); arrow(ctx, sx + 26, y + 128, sx + 120, y + 128, es(T, TL.mode + 0.4, TL.mode + 0.9), C.muted, 4);
    dot(ctx, sx + 146, y + 128, C.brand); arrow(ctx, sx + 172, y + 128, sx + 266, y + 128, es(T, TL.mode + 0.9, TL.mode + 1.4), C.muted, 4);
    dot(ctx, sx + 292, y + 128, C.green);
    ctx.restore();
  }
  var q = es(T, TL.mode + 0.6, TL.mode + 1.2);
  if (q > 0) {
    var x = PM.x + PM.w - w;
    ctx.save(); ctx.globalAlpha = q;
    card(ctx, x, y, w, h, { r: 16, shadow: 0 });
    txt(ctx, L.par, x + 28, y + 36, 28, 800, C.ink, 'left', w - 56);
    txt(ctx, L.parSub, x + 28, y + 74, 20, 600, C.sub, 'left', w - 56);
    var ox = x + 80, oy = y + 128;
    dot(ctx, ox, oy, C.brand);
    for (var k = 0; k < 3; k++) {
      var tx = ox + 220, ty = oy - 30 + k * 30;
      ctx.strokeStyle = C.muted; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ox + 20, oy); ctx.lineTo(lerp(ox + 20, tx - 12, es(T, TL.mode + 1.0, TL.mode + 1.5)), lerp(oy, ty, es(T, TL.mode + 1.0, TL.mode + 1.5))); ctx.stroke();
      ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(tx, ty, 10, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, L.chip, L.title, 0.2);
  registry(ctx, T);
  terminal(ctx, T);
  pmPanel(ctx, T);
  modes(ctx, T);
  footer(ctx, T, L.foot, TL.foot);
}
