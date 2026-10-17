// 장면 ① — 6일 과정의 흐름 (원고 근거: 1일차 «1-0. 여는 절 — 6일 강의 흐름»)
var NAME = 'mg-00-flow', DUR = 14;
var TL = { row0: 1.0, step: 1.5, stamp: 10.4, foot: 11.8 };
var ROWS = [
  ['1일차', '읽기', '사양서·매뉴얼·표준을 요약해 표로 뽑음'],
  ['2일차', '보기', '도면을 이미지로 올려 부품·치수·기호를 읽힘'],
  ['3일차', '찾기', '특허·논문·표준을 검색해 여러 자료를 묶어 물음'],
  ['4일차', '쓰기', '기술 보고서·시험 성적서·영문 초록을 초안으로 받음'],
  ['5일차', '남기기', '명세서 초안을 쓰고 표준 개정을 추적함'],
  ['6일차', '쌓기', '사내 문서를 지식베이스로 묶고 검증을 표준화함'],
];
var RY0 = 200, RSTEP = 128, RH = 108;
function rowY(i) { return RY0 + i * RSTEP; }
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '6일 과정', '읽기에서 쌓기까지', 0.2);
  // 일차를 잇는 세로 선 — 다음 줄이 나타나는 동안 자란다
  for (var i = 0; i < ROWS.length - 1; i++) {
    var a = TL.row0 + TL.step * i + 0.9, p = es(T, a, a + 0.6);
    if (p > 0) { ctx.fillStyle = C.brand; ctx.fillRect(139, rowY(i) + RH - 6, 6, (RSTEP - RH + 12 + 0) * p + (RH * 0.0)); }
  }
  for (var r = 0; r < ROWS.length; r++) {
    var s = TL.row0 + TL.step * r, p2 = es(T, s, s + 0.7);
    if (p2 <= 0) continue;
    var y = rowY(r), dx = (1 - p2) * -60;
    ctx.save();
    ctx.globalAlpha = p2;
    card(ctx, 70 + dx, y, 1300, RH, { fill: C.paper });
    ctx.fillStyle = C.brand;
    rr(ctx, 92 + dx, y + 25, 96, 58, 29); ctx.fill();
    txt(ctx, ROWS[r][0], 140 + dx, y + 55, 30, 800, C.ink, 'center');
    txt(ctx, ROWS[r][1], 230 + dx, y + 54, 56, 800, C.ink, 'left');
    txt(ctx, ROWS[r][2], 480 + dx, y + 56, 31, 500, C.sub, 'left');
    ctx.restore();
    stamp(ctx, 1326, y + RH / 2, 24, es(T, TL.stamp + 0.25 * r, TL.stamp + 0.25 * r + 0.4), C.green);
  }
  footer(ctx, T, '검증을 붙임 · 순서를 바꿈', TL.foot);
}
