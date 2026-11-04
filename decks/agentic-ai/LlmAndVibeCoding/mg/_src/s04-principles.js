// 장면 ⑤ — 바이브 코딩 3원칙 (원고 근거: 03-vibecoding-concept «바이브 코딩의 핵심 원칙» ×3 · «철학»)
var NAME = 'mg-04-principles', DUR = 18;
var TL = { c1: 1.0, how: 1.8, what: 2.6, bad: 3.6, good: 4.4, c2: 5.4, n0: 6.0, run: 7.8, lap: 2.4, laps: 2, cap2: 8.4, c3: 9.4, fold: 10.0, chk: 10.8, foot: 14.6 };
var KW = 460, KGAP = (CW - KW * 3) / 2, KY = 190, KH = 760;
function kx(i) { return X0 + i * (KW + KGAP); }
function head(ctx, T, i, a, en, ko) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return 0;
  var x = kx(i);
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, KY + (1 - p) * 30, KW, KH, {});
  pill(ctx, String(i + 1), x + 52, KY + 56, 56, 56, C.brand, C.ink, 30, 800);
  fit(ctx, en, x + 96, KY + 56, 32, 800, C.ink, 'left', KW - 120);
  txt(ctx, ko, x + 28, KY + 122, 25, 700, C.sub, 'left');
  ctx.fillStyle = C.line; ctx.fillRect(x + 28, KY + 158, KW - 56, 2);
  ctx.restore();
  return p;
}
function intent(ctx, T) {
  if (!head(ctx, T, 0, TL.c1, 'Intent-First', '의도 우선 프로그래밍')) return;
  var x = kx(0) + 28, w = KW - 56, p;
  p = es(T, TL.how, TL.how + 0.5);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, '전통적 개발', x, KY + 205, 22, 700, C.muted, 'left');
    fit(ctx, '"어떻게(How)" 구현할지 고민', x, KY + 245, 27, 700, C.sub, 'left', w);
    var s = es(T, TL.what, TL.what + 0.5);
    if (s > 0) { ctx.fillStyle = C.red; ctx.fillRect(x, KY + 244, Math.min(w, ctx.measureText('"어떻게(How)" 구현할지 고민').width) * s, 4); }
    ctx.restore();
  }
  p = es(T, TL.what, TL.what + 0.5);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, '바이브 코딩', x, KY + 305, 22, 700, C.muted, 'left');
    fit(ctx, '"무엇을(What)" 만들지만 설명', x, KY + 345, 29, 800, C.ink, 'left', w);
    ctx.restore();
  }
  p = es(T, TL.bad, TL.bad + 0.5);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, KY + 400, w, 130, { fill: C.redTint, stroke: C.red, shadow: 0, r: 14 });
    crossmark(ctx, x + 34, KY + 440, 18, p, C.red);
    fit(ctx, '"useState를 사용해서', x + 64, KY + 440, 25, 600, C.ink, 'left', w - 80, MONO);
    fit(ctx, ' counter 변수를 만들고..."', x + 64, KY + 488, 25, 600, C.ink, 'left', w - 80, MONO);
    ctx.restore();
  }
  p = es(T, TL.good, TL.good + 0.5);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, KY + 556, w, 130, { fill: C.greenTint, stroke: C.green, shadow: 0, r: 14 });
    stamp(ctx, x + 34, KY + 596, 18, p, C.green);
    fit(ctx, '"카운터 기능이 있는', x + 64, KY + 596, 27, 800, C.ink, 'left', w - 80);
    fit(ctx, ' 컴포넌트 만들어줘"', x + 64, KY + 644, 27, 800, C.ink, 'left', w - 80);
    ctx.restore();
  }
}
var LOOP = ['AI 코드 생성', '개발자 검토', '승인/수정', '다음 단계'];
function loopXY(k) { // 사각 고리의 네 모서리 — 위 왼, 위 오, 아래 오, 아래 왼
  var cx = kx(1) + KW / 2, cy = KY + 410, dx = 110, dy = 150;
  return [[cx - dx, cy - dy], [cx + dx, cy - dy], [cx + dx, cy + dy], [cx - dx, cy + dy]][k];
}
function human(ctx, T) {
  if (!head(ctx, T, 1, TL.c2, 'Human-in-the-Loop', '인간 검증 루프')) return;
  var k, p;
  // 고리 선 + 도는 점
  p = es(T, TL.n0, TL.n0 + 1.6);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    ctx.strokeStyle = C.line; ctx.lineWidth = 8;
    ctx.beginPath();
    for (k = 0; k < 5; k++) { var q = loopXY(k % 4); if (k === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]); }
    ctx.stroke();
    ctx.restore();
  }
  if (T >= TL.run) {
    var u = (T - TL.run) / TL.lap;
    u = u >= TL.laps ? 0 : u - Math.floor(u);
    var pts = [loopXY(0), loopXY(1), loopXY(2), loopXY(3), loopXY(0)];
    var d = along(pts, u);
    dot(ctx, d[0], d[1], 13, C.brandInk);
  }
  for (k = 0; k < 4; k++) {
    var a = TL.n0 + 0.4 * k;
    p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var xy = loopXY(k), dev = k === 1 || k === 2;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, xy[0] - 92, xy[1] - 38, 184, 76, { fill: dev ? C.tint : C.greenTint, stroke: dev ? C.brand : C.green, lw: 3, r: 14 });
    fit(ctx, LOOP[k], xy[0], xy[1] + 1, 25, 800, C.ink, 'center', 160);
    ctx.restore();
  }
  p = es(T, TL.cap2, TL.cap2 + 0.6);
  if (p > 0) {
    var x = kx(1) + 28;
    ctx.save(); ctx.globalAlpha = p;
    pill(ctx, 'AI', x + 40, KY + 640, 70, 40, C.green, '#FFFFFF', 22, 800);
    fit(ctx, '빠르게 구현', x + 90, KY + 640, 27, 700, C.ink, 'left', KW - 150);
    pill(ctx, '개발자', x + 40, KY + 694, 70, 40, C.brand, C.ink, 18, 800);
    fit(ctx, '품질 검증', x + 90, KY + 694, 27, 700, C.ink, 'left', KW - 150);
    ctx.restore();
  }
}
var CHK = ['기존 코드 스타일 학습', '파일 간 의존성 파악', '프로젝트 규칙 준수'];
function context(ctx, T) {
  if (!head(ctx, T, 2, TL.c3, 'Context-Aware', '컨텍스트 인식 개발')) return;
  var x = kx(2), cx = x + KW / 2, p = es(T, TL.fold, TL.fold + 0.6);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    // 프로젝트 폴더 + 문서들
    ctx.fillStyle = C.tint; ctx.strokeStyle = C.brand; ctx.lineWidth = 3;
    rr(ctx, cx - 170, KY + 210, 120, 40, 10); ctx.fill(); ctx.stroke();
    rr(ctx, cx - 170, KY + 230, 340, 190, 16); ctx.fill(); ctx.stroke();
    for (var j = 0; j < 4; j++) {
      var q = es(T, TL.fold + 0.2 + 0.15 * j, TL.fold + 0.6 + 0.15 * j);
      if (q > 0) doc(ctx, cx - 140 + j * 72, KY + 262 + (1 - q) * 14, 64, 84, { rows: 3, alpha: q });
    }
    fit(ctx, '프로젝트 전체를 이해', cx, KY + 386, 25, 800, C.brandInk, 'center', 300);
    ctx.restore();
  }
  for (var i = 0; i < 3; i++) {
    var a = TL.chk + 0.6 * i, pc = es(T, a, a + 0.5);
    if (pc <= 0) continue;
    var y = KY + 490 + i * 76;
    ctx.save(); ctx.globalAlpha = pc;
    stamp(ctx, x + 52, y, 20, pc, C.green);
    fit(ctx, CHK[i], x + 88, y, 28, 700, C.ink, 'left', KW - 116);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '3장', '바이브 코딩의 핵심 원칙 3가지', 0.2);
  intent(ctx, T);
  human(ctx, T);
  context(ctx, T);
  footer(ctx, T, '개발자는 창조자, AI는 실행자', TL.foot);
}
