// 장면 ⑤ — 대화 한 개 vs 기능별 세션 (원고 근거: «대화 한 개 vs 기능별 세션 분리» + «VS Code 정리» 세션을 나눔)
var NAME = 'vscode-md-git-05-session', DUR = 14;
var TL = { left: 0.8, m0: 1.3, mStep: 0.45, tangle: 4.6, lost: 6.2, right: 7.0, f0: 7.6, fStep: 0.3, ok: 10.2, foot: 11.4 };
var FEAT = [['①', C.blue, C.blueTint], ['②', C.purple, C.purpleTint], ['③', C.green, C.greenTint]];
var MSG = [0, 1, 0, 2, 1, 2, 0]; // 지시 순서 — 기능 번호
var PY = 200, PH = 840, PW = 680, LX = X0, RX = X1 - PW;
var LBX = LX + 60, LBW = 400, LBH = 62, LBY = 290, LSTEP = 80;
var CGAP = 20, CWID = (PW - 40 - CGAP * 2) / 3, RBH = 70, RSTEP = 92, RBY = 390;
function panel(ctx, x, title, sub, p, color) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  card(ctx, x, PY + (1 - p) * 30, PW, PH, { fill: C.panel, stroke: C.line, r: 24, shadow: 0 });
  txt(ctx, title, x + 40, PY + 50, 40, 800, color, 'left');
  txt(ctx, sub, x + PW - 40, PY + 50, 28, 700, C.muted, 'right');
  ctx.restore();
}
function bubble(ctx, x, y, w, h, f, s, alpha) {
  var F = FEAT[f];
  ctx.save();
  ctx.globalAlpha = alpha;
  card(ctx, x, y, w, h, { fill: F[2], stroke: F[1], lw: 3, r: 14, shadow: 0 });
  fit(ctx, s, x + w / 2, y + h / 2, 28, 700, F[1], 'center', w - 24);
  ctx.restore();
}
function order(i) { var n = 0; for (var j = 0; j < i; j++) if (MSG[j] === MSG[i]) n++; return n; }
function left(ctx, T) {
  panel(ctx, LX, '대화 한 개', '한 줄기', es(T, TL.left, TL.left + 0.5), C.red);
  // 꼬인 선 — 같은 기능 지시끼리 잇는다
  var pt = es(T, TL.tangle, TL.tangle + 1.2);
  if (pt > 0) {
    for (var i = 0; i < MSG.length; i++) {
      for (var j = i + 1; j < MSG.length; j++) {
        if (MSG[j] !== MSG[i]) continue;
        var y1 = LBY + i * LSTEP + LBH / 2, y2 = LBY + j * LSTEP + LBH / 2, xr = LBX + LBW;
        var bulge = 40 + MSG[i] * 50;
        ctx.save();
        ctx.strokeStyle = rgba(FEAT[MSG[i]][1], 0.8); ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(xr, y1);
        var u = pt, xm = xr + bulge * 2.2;
        ctx.bezierCurveTo(xm, lerp(y1, y2, 0.15 * u), xr + bulge * 0.4, lerp(y1, y2, 0.6 * u), xr, lerp(y1, y2, u));
        ctx.stroke();
        ctx.restore();
        break;
      }
    }
    ctx.save(); ctx.globalAlpha = pt;
    txt(ctx, '맥락이 뒤엉킴', LX + 40, 890, 34, 800, C.red, 'left');
    ctx.restore();
  }
  var pl = es(T, TL.lost, TL.lost + 0.6);
  for (var k = 0; k < MSG.length; k++) {
    var a = TL.m0 + TL.mStep * k, p = es(T, a, a + 0.4);
    if (p <= 0) continue;
    var al = p * (k === 0 ? lerp(1, 0.25, pl) : 1);
    bubble(ctx, LBX - (1 - p) * 30, LBY + k * LSTEP, LBW, LBH, MSG[k], '기능 ' + FEAT[MSG[k]][0] + ' 지시 ' + (order(k) + 1), al);
  }
  if (pl > 0) {
    crossmark(ctx, LBX - 28, LBY + LBH / 2, 22, pl, C.red);
    ctx.save(); ctx.globalAlpha = pl;
    fit(ctx, '앞의 지시를 AI 가 놓침', LX + 40, 950, 34, 800, C.red, 'left', PW - 80);
    ctx.restore();
  }
}
function right(ctx, T) {
  var pr = es(T, TL.right, TL.right + 0.5);
  panel(ctx, RX, '기능별 세션', '나눠서', pr, C.green);
  if (pr <= 0) return;
  ctx.save(); ctx.globalAlpha = pr;
  for (var c = 0; c < 3; c++) {
    var cx = RX + 20 + c * (CWID + CGAP);
    ctx.strokeStyle = rgba(FEAT[c][1], 0.45); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    rr(ctx, cx, 290, CWID, 420, 16); ctx.stroke();
    ctx.setLineDash([]);
    fit(ctx, '세션 ' + FEAT[c][0], cx + CWID / 2, 336, 30, 800, FEAT[c][1], 'center', CWID - 16);
  }
  ctx.restore();
  // 지시가 왼쪽에서 제 칸으로 들어간다
  for (var k = 0; k < MSG.length; k++) {
    var a = TL.f0 + TL.fStep * k, p = es(T, a, a + 0.7);
    if (p <= 0) continue;
    var f = MSG[k], n = order(k);
    var tx = RX + 20 + f * (CWID + CGAP) + 10, ty = RBY + n * RSTEP;
    var sx = LBX + LBW - CWID, sy = LBY + k * LSTEP;
    bubble(ctx, lerp(sx, tx, p), lerp(sy, ty, p), CWID - 20, RBH, f, '지시 ' + (n + 1), Math.min(1, p * 2));
  }
  for (var c2 = 0; c2 < 3; c2++) {
    var ps = es(T, TL.ok + 0.25 * c2, TL.ok + 0.25 * c2 + 0.4);
    stamp(ctx, RX + 20 + c2 * (CWID + CGAP) + CWID / 2, 770, 32, ps, C.green);
  }
  var pk = es(T, TL.ok, TL.ok + 0.6);
  if (pk > 0) {
    ctx.save(); ctx.globalAlpha = pk;
    txt(ctx, '각자 맥락이 깨끗함', RX + 40, 890, 34, 800, C.green, 'left');
    fit(ctx, '무엇을 시켰는지 추적됨', RX + 40, 950, 34, 800, C.green, 'left', PW - 80);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '세션', '대화 한 개 vs 기능별 세션', 0.2);
  left(ctx, T);
  right(ctx, T);
  footer(ctx, T, '기능마다 세션을 따로 엶 — 각자 맥락이 깨끗함', TL.foot);
}
