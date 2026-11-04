// 장면 ④ — 채팅 방식 vs 바이브 코딩 (원고 근거: 03.1-chat-limitations «채팅 기반의 주요 한계» · «구체적 사례: React 컴포넌트» · «생산성 차이» / 03.2-vibecoding-start «구체적 사례: React 컴포넌트»)
var NAME = 'mg-03-chatvibe', DUR = 18;
var TL = { lp: 0.8, l0: 1.2, lstep: 0.55, lt: 6.4, rp: 7.2, r0: 7.8, rstep: 0.55, rt: 10.8, ok: 11.0, cmp: 12.4, foot: 14.6 };
var PW = 715, LPX = X0, RPX = X1 - PW, PY = 180, PH = 650;
var LEFT = [
  ['개발자', '"로그인 폼 컴포넌트 만들어줘"'],
  ['개발자', '코드 복사'],
  ['개발자', 'LoginForm.tsx 파일 생성'],
  ['개발자', '붙여넣기'],
  ['오류', 'useState import 안됨'],
  ['개발자', 'import 추가'],
  ['오류', '스타일 컴포넌트 충돌'],
  ['개발자', '다시 ChatGPT — styled-components로 수정'],
  ['', '반복…'],
];
var RIGHT = [
  ['개발자', '"로그인 폼 컴포넌트 만들어줘. 기존 스타일 따라서."'],
  ['AI', 'LoginForm.tsx 파일 생성'],
  ['AI', '필요한 import 자동 추가'],
  ['AI', '프로젝트의 styled-components 패턴 적용'],
  ['', '완료'],
];
var RH = 50, LY0 = PY + 112;
function rows(ctx, T, px, list, a0, step, rowH) {
  for (var i = 0; i < list.length; i++) {
    var a = a0 + step * i, p = es(T, a, a + 0.45);
    if (p <= 0) continue;
    var y = LY0 + i * rowH, who = list[i][0];
    ctx.save(); ctx.globalAlpha = p;
    var tx = px + 40 + (1 - p) * 20;
    if (who === '오류') { crossmark(ctx, tx + 50, y, 18, p, C.red); }
    else if (who === 'AI') pill(ctx, 'AI', tx + 50, y, 90, 36, C.green, '#FFFFFF', 22, 800);
    else if (who === '개발자') pill(ctx, '개발자', tx + 50, y, 90, 36, C.line, C.sub, 20, 800);
    var col = who === '오류' ? C.red : who === '' ? C.muted : C.ink;
    fit(ctx, list[i][1], tx + (who ? 116 : 10), y, 27, who === '' ? 800 : 600, col, 'left', PW - 190);
    if (list[i][1] === '완료') stamp(ctx, tx + 110, y, 22, es(T, TL.ok, TL.ok + 0.5), C.green);
    ctx.restore();
  }
}
function timeBar(ctx, T, px, a, b, frac, color, label, la) {
  var p = es(T, a, b);
  if (p <= 0) return;
  var bx = px + 40, by = PY + PH - 46, bw = (PW - 80) * frac * p;
  ctx.save();
  txt(ctx, '소요 시간', bx, by - 34, 22, 700, C.muted, 'left');
  ctx.fillStyle = C.line; rr(ctx, bx, by - 14, PW - 80, 28, 14); ctx.fill();
  ctx.fillStyle = color; rr(ctx, bx, by - 14, Math.max(28, bw), 28, 14); ctx.fill();
  ctx.globalAlpha = es(T, la, la + 0.5);
  txt(ctx, label, px + PW - 40, by - 34, 28, 800, color, 'right');
  ctx.restore();
}
function panel(ctx, T, a, px, title, color, tint) {
  var p = es(T, a, a + 0.5);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, px, PY, PW, PH, {});
  pill(ctx, title, px + 170, PY + 50, 280, 54, tint, color, 28, 800);
  ctx.restore();
}
function compare(ctx, T) {
  var p = es(T, TL.cmp, TL.cmp + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, X0 + 220, 852 + (1 - p) * 14, CW - 440, 90, { fill: C.tint, stroke: C.brand, lw: 3 });
  fit(ctx, '컴포넌트 생성  15분 → 3분  ·  5배', W / 2, 897 + (1 - p) * 14, 34, 800, C.ink, 'center', CW - 500);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '3장', '채팅 기반의 한계 → 바이브 코딩', 0.2);
  panel(ctx, T, TL.lp, LPX, 'ChatGPT 방식', C.red, C.redTint);
  rows(ctx, T, LPX, LEFT, TL.l0, TL.lstep, RH);
  timeBar(ctx, T, LPX, TL.l0, TL.lt, 1.0, C.red, '약 15-20분', TL.lt);
  panel(ctx, T, TL.rp, RPX, '바이브 코딩 방식', C.green, C.greenTint);
  rows(ctx, T, RPX, RIGHT, TL.r0, TL.rstep, 80);
  timeBar(ctx, T, RPX, TL.r0, TL.rt, 3 / 20, C.green, '약 2-3분', TL.rt);
  compare(ctx, T);
  footer(ctx, T, '복사-붙여넣기 반복 대신, AI가 개발 환경에서 직접 만들고 고친다', TL.foot);
}
