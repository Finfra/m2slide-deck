// 장면 ④ — 실시간 대시보드 ..board · SSE (원고 근거: 03 4단계 process · «진행률·경과·체크리스트» · «hub vs ..board»)
var NAME = 'mg-04-board', DUR = 16;
var TL = { steps: 0.6, cmd: 1.0, start: 2.4, run: 2.8, end: 12.0, notice: 12.4, foot: 14.0 };
var TW = { x: 80, y: 300, w: 640, h: 600 }, DB = { x: 1080, y: 300, w: 760, h: 600 };
var MARKS = [100, 500, 1000];
function count(T) { return Math.round(1000 * seg(T, TL.run, TL.end)); }
function stepIndex(T) { return T < TL.run ? 0 : T < TL.run + 1.4 ? 1 : T < TL.end ? 2 : 3; }
function steps(ctx, T) {
  var cur = stepIndex(T), sw = 400, gap = 40, x0 = (W - (4 * sw + 3 * gap)) / 2;
  for (var i = 0; i < 4; i++) {
    var a = TL.steps + 0.15 * i, p = es(T, a, a + 0.5), x = x0 + i * (sw + gap);
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    var on = i === cur, past = i < cur;
    card(ctx, x, 186, sw, 80, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 4 : 2, shadow: on ? 1 : 0, r: 40 });
    ctx.fillStyle = on || past ? C.brand : C.line; ctx.beginPath(); ctx.arc(x + 42, 226, 22, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), x + 42, 227, 26, 800, '#FFFFFF', 'center');
    txt(ctx, L.steps[i], x + 78, 226, 28, 700, C.ink, 'left', sw - 100);
    if (i < 3) arrow(ctx, x + sw + 6, 226, x + sw + gap - 6, 226, p, C.muted, 3);
    ctx.restore();
  }
}
function term(ctx, T) {
  var a = es(T, TL.cmd - 0.4, TL.cmd);
  win(ctx, TW.x, TW.y, TW.w, TW.h, L.term, true, a);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  var x = TW.x + 32, mw = TW.w - 64;
  if (T < TL.start) promptLine(ctx, T, x, TW.y + 100, L.cmd, '', TL.cmd, 24, 28, C.termInk, C.termInk, mw);
  else txt(ctx, '> ' + L.cmd, x, TW.y + 100, 28, 600, C.termInk, 'left', mw, MONO);
  var s = es(T, TL.start, TL.start + 0.4);
  if (s > 0) { ctx.globalAlpha = a * s; txt(ctx, '▶ ' + L.started, x, TW.y + 150, 26, 700, '#5FD08E', 'left', mw); }
  // runner 로그 — 줄 수는 T 의 함수, 최근 8줄만 보인다
  var n = Math.floor(clamp((Math.min(T, TL.end) - TL.run) * 4, 0, 999));
  for (var k = 0; k < 8; k++) {
    var idx = n - 8 + k;
    if (idx < 0) continue;
    var y = TW.y + 210 + k * 44;
    ctx.globalAlpha = a * (0.45 + 0.07 * k);
    txt(ctx, '#' + (idx + 1), x, y, 22, 600, C.termDim, 'left', 0, MONO);
    bar(ctx, x + 90, y, 120 + ((idx * 53) % 260), 12, '#3A4456');
  }
  ctx.restore();
}
function sse(ctx, T) {
  var a = es(T, TL.run, TL.run + 0.4) * (1 - es(T, TL.end + 0.2, TL.end + 0.8));
  if (a <= 0) return;
  var x1 = TW.x + TW.w + 30, x2 = DB.x - 30, y = DB.y + 300;
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.setLineDash([8, 10]);
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); ctx.setLineDash([]);
  for (var k = 0; k < 5; k++) {
    var f = ((T - TL.run) * 0.8 + k / 5) % 1;
    ctx.fillStyle = rgba(C.brand, 0.3 + 0.7 * Math.sin(f * Math.PI));
    ctx.beginPath(); ctx.arc(lerp(x1, x2, f), y, 11, 0, Math.PI * 2); ctx.fill();
  }
  txt(ctx, L.sse, (x1 + x2) / 2, y - 48, 28, 800, C.brandInk, 'center', x2 - x1);
  ctx.restore();
}
function mmss(s) { var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r; }
function dashboard(ctx, T) {
  var a = es(T, TL.cmd, TL.cmd + 0.6);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, DB.x, DB.y, DB.w, DB.h, { r: 18 });
  var x = DB.x + 44, w = DB.w - 88, n = count(T), done = T >= TL.end;
  txt(ctx, L.card, x, DB.y + 56, 34, 800, C.ink, 'left', w - 220);
  if (T >= TL.run) pill(ctx, done ? L.done : L.running, DB.x + DB.w - 44, DB.y + 56, 26, done ? C.green : C.amber, '#FFFFFF', 'right');
  // 진행 수치
  txt(ctx, L.prog, x, DB.y + 130, 26, 700, C.sub, 'left', w / 2);
  txt(ctx, n + ' / 1000', x, DB.y + 186, 60, 800, C.ink, 'left', w / 2, MONO);
  var el = Math.floor(clamp(T - TL.run, 0, TL.end - TL.run) * 60);
  txt(ctx, L.elapsed, x + w, DB.y + 130, 26, 700, C.sub, 'right', w / 2);
  txt(ctx, mmss(el), x + w, DB.y + 186, 60, 800, C.ink, 'right', w / 2, MONO);
  ctx.fillStyle = C.line; rr(ctx, x, DB.y + 240, w, 26, 13); ctx.fill();
  if (n > 0) { ctx.fillStyle = done ? C.green : C.brand; rr(ctx, x, DB.y + 240, Math.max(26, w * n / 1000), 26, 13); ctx.fill(); }
  // 완료 조건 체크리스트 100 → 500 → 1000
  txt(ctx, L.check, x, DB.y + 316, 26, 700, C.sub, 'left', w);
  for (var i = 0; i < 3; i++) {
    var cx = x + i * (w / 3), y = DB.y + 380, hit = n >= MARKS[i];
    card(ctx, cx, y - 34, w / 3 - 20, 68, { fill: hit ? C.greenTint : C.paper, stroke: hit ? C.green : C.line, shadow: 0, r: 14 });
    txt(ctx, String(MARKS[i]), cx + 30, y + 1, 32, 800, hit ? C.green : C.muted, 'left', 0, MONO);
    if (hit) { var t0 = TL.run + (TL.end - TL.run) * MARKS[i] / 1000; stamp(ctx, cx + w / 3 - 64, y, 22, es(T, t0, t0 + 0.4), C.green); }
  }
  // 완료 알림
  var q = es(T, TL.notice, TL.notice + 0.6);
  if (q > 0) {
    ctx.globalAlpha = a * q;
    card(ctx, x, DB.y + 470 + (1 - q) * 20, w, 86, { fill: C.green, stroke: C.green, r: 16 });
    txt(ctx, L.notice, x + w / 2, DB.y + 514 + (1 - q) * 20, 28, 800, '#FFFFFF', 'center', w - 40);
  }
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, L.chip, L.title, 0.2);
  steps(ctx, T);
  term(ctx, T);
  sse(ctx, T);
  dashboard(ctx, T);
  footer(ctx, T, L.foot, TL.foot);
}
