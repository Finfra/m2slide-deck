// 장면 ③ — Agentic Coding 의 흐름 (원고 근거: 01-part1 «Agentic Coding의 흐름» + 02-part2 «코드 생성 단계 — Claude Code 자율 실행 흐름»)
var NAME = 'mg-02-loop', DUR = 18;
var TL = { node0: 1.0, nstep: 0.4, run: 3.4, lap: 5.0, laps: 2, center: 4.0, ok: 8.6, once: 9.4, loop: 10.6, safe: 12.0, foot: 15.0 };
var CX = 470, CY = 600, R = 260, NW = 270, NH = 100;
var NODES = [
  ['사용자 의도', ''], ['Plan', ''], ['Tool 실행', 'Bash · Edit · Read'], ['검증', ''], ['결과 보고', ''],
];
var PX = 950, PW = X1 - PX; // 오른쪽 판
function nodeAng(i) { return (-90 + 72 * i) * Math.PI / 180; }
// 점의 각도(도, -90 에서 시작해 시계 방향) — 끝나면 사용자 의도 위에서 멈춤
function dotDeg(T) { return -90 + 360 * TL.laps * clamp((T - TL.run) / (TL.lap * TL.laps), 0, 1); }
function ring(ctx, T) {
  var p = es(T, TL.node0, TL.node0 + TL.nstep * 5 + 0.4);
  if (p <= 0) return;
  ctx.save();
  ctx.strokeStyle = C.line; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(CX, CY, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); ctx.stroke();
  // 시계 방향 화살촉 — 마디 사이 가운데
  ctx.fillStyle = C.muted;
  for (var i = 0; i < 5; i++) {
    var a = nodeAng(i) + 36 * Math.PI / 180;
    if ((a + Math.PI / 2) / (Math.PI * 2) > p) continue;
    var x = CX + R * Math.cos(a), y = CY + R * Math.sin(a), t = a + Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(x + 16 * Math.cos(t), y + 16 * Math.sin(t));
    ctx.lineTo(x - 12 * Math.cos(t) + 14 * Math.cos(a), y - 12 * Math.sin(t) + 14 * Math.sin(a));
    ctx.lineTo(x - 12 * Math.cos(t) - 14 * Math.cos(a), y - 12 * Math.sin(t) - 14 * Math.sin(a));
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // 고리를 도는 점 — 마디 카드 아래로 지나감
  if (T >= TL.run) {
    var r = dotDeg(T) * Math.PI / 180;
    ctx.save();
    ctx.fillStyle = C.brandInk;
    ctx.beginPath(); ctx.arc(CX + R * Math.cos(r), CY + R * Math.sin(r), 14, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
function nodes(ctx, T) {
  var running = T >= TL.run && T < TL.run + TL.lap * TL.laps + 0.3;
  var d = ((dotDeg(T) + 90) % 360 + 360) % 360;
  for (var i = 0; i < 5; i++) {
    var a = TL.node0 + TL.nstep * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var ang = nodeAng(i), x = CX + R * Math.cos(ang), y = CY + R * Math.sin(ang);
    var nd = Math.abs(d - 72 * i); nd = Math.min(nd, 360 - nd);
    var on = running && nd < 22 ? 1 : 0;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x - NW / 2, y - NH / 2, NW, NH, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 5 : 2 });
    if (NODES[i][1]) {
      fit(ctx, NODES[i][0], x, y - 18, 34, 800, C.ink, 'center', NW - 30);
      fit(ctx, NODES[i][1], x, y + 24, 24, 600, C.sub, 'center', NW - 30, MONO);
    } else {
      fit(ctx, NODES[i][0], x, y + 1, 36, 800, C.ink, 'center', NW - 30);
    }
    ctx.restore();
  }
}
function center(ctx, T) {
  var p = es(T, TL.center, TL.center + 0.6);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, '1턴', CX, CY - 34, 34, 700, C.muted, 'center');
    txt(ctx, '5~30초', CX, CY + 22, 54, 800, C.ink, 'center');
    ctx.restore();
  }
  // 검토·승인 — 결과 보고 → 사용자 의도 구간
  var q = es(T, TL.ok, TL.ok + 0.6);
  if (q > 0) {
    var a = 230 * Math.PI / 180, x = CX + 350 * Math.cos(a), y = CY + 350 * Math.sin(a) + (1 - q) * 14;
    ctx.save(); ctx.globalAlpha = q;
    pill(ctx, '검토·승인', x, y, 160, 48, C.ink, '#FFFFFF', 26, 800);
    ctx.restore();
  }
}
function panel(ctx, T) {
  var p1 = es(T, TL.once, TL.once + 0.6), p2 = es(T, TL.loop, TL.loop + 0.6), p3 = es(T, TL.safe, TL.safe + 0.6);
  if (p1 > 0) {
    ctx.save(); ctx.globalAlpha = p1;
    card(ctx, PX + (1 - p1) * 40, 250, PW, 160, {});
    txt(ctx, '단발 프롬프트', PX + 36, 306, 36, 800, C.sub, 'left');
    fit(ctx, '단발 요청 — 재사용 어려움', PX + 36, 362, 28, 600, C.muted, 'left', PW - 72);
    ctx.restore();
  }
  if (p2 > 0) {
    ctx.save(); ctx.globalAlpha = p2;
    card(ctx, PX + (1 - p2) * 40, 440, PW, 160, { fill: C.tint, stroke: C.brand, lw: 4 });
    txt(ctx, '자율 반복 루프', PX + 36, 496, 36, 800, C.ink, 'left');
    fit(ctx, 'tasks 를 1번씩 — Plan · 실행 · 검증', PX + 36, 552, 28, 600, C.sub, 'left', PW - 72);
    ctx.restore();
  }
  if (p3 > 0) {
    ctx.save(); ctx.globalAlpha = p3;
    card(ctx, PX + (1 - p3) * 40, 630, PW, 230, { fill: C.greenTint, stroke: C.green, lw: 3 });
    txt(ctx, '안전망', PX + 36, 684, 34, 800, C.green, 'left');
    fit(ctx, 'git status 자주 확인', PX + 36, 746, 28, 600, C.ink, 'left', PW - 72, MONO);
    fit(ctx, '망가지면 git reset --hard', PX + 36, 800, 28, 600, C.ink, 'left', PW - 72, MONO);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'Part 1', 'Agentic Coding — 한 턴의 흐름', 0.2);
  ring(ctx, T);
  nodes(ctx, T);
  center(ctx, T);
  panel(ctx, T);
  footer(ctx, T, '자율 실행 ≠ 무인 실행 — 매 task 후 검토·승인', TL.foot);
}
