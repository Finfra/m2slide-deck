// 장면 ① — 6일 과정 전체 (원고 근거: 1일차 «1-0. 여는 절 — 6일 강의 흐름과 초기 설정» timeline
//          + Agenda_forHuman «6일 흐름» 의 산출물 계보: 맥락 카드 → 브리핑 → 제안서 → 홈페이지·CSV → 시각물·차트 → 영문·CRM)
var NAME = 'mg-00-flow', DUR = 14;
var TL = { row0: 0.9, step: 1.3, glow: 9.4, foot: 11.4 };
var ROWS = [
  ['1일차', '묻기', '6요소와 맥락 카드로 AI 에게 제대로 물음', '맥락 카드'],
  ['2일차', '조사하기', '출처를 달아 시장·고객·경쟁사를 조사함', '사전 브리핑'],
  ['3일차', '제안하기', '상담 메모에서 제안서와 견적 메일을 만듦', '제안서 · 메일'],
  ['4일차', '알리기', '제품 소개를 홈페이지와 SNS 글로 배포함', '홈페이지 · CSV'],
  ['5일차', '꾸미기', '슬라이드·사진·차트를 도구별 한계를 보고 고름', '슬라이드 · 차트'],
  ['6일차', '넓히기', '영문 응대와 CRM 으로 해외영업·리드를 돌림', '영문 · CRM'],
];
var RY0 = 196, RSTEP = 128, RH = 108, AX = 1046, AW = 300;
function rowY(i) { return RY0 + i * RSTEP; }
function rowT(i) { return TL.row0 + TL.step * i; }
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '6일 과정', '묻기에서 넓히기까지', 0.2);
  for (var r = 0; r < ROWS.length; r++) {
    var s = rowT(r), p = es(T, s, s + 0.7);
    if (p <= 0) continue;
    var y = rowY(r), dx = (1 - p) * -60;
    ctx.save();
    ctx.globalAlpha = p;
    card(ctx, 70 + dx, y, 1300, RH, { fill: C.paper });
    ctx.fillStyle = C.brand;
    rr(ctx, 92 + dx, y + 25, 100, 58, 29); ctx.fill();
    txt(ctx, ROWS[r][0], 142 + dx, y + 55, 29, 800, C.ink, 'center');
    txt(ctx, ROWS[r][1], 222 + dx, y + 38, 44, 800, C.ink, 'left');
    txt(ctx, ROWS[r][2], 222 + dx, y + 81, 27, 500, C.sub, 'left');
    ctx.restore();
    // 그날 손에 남는 것 — 오른쪽 칩. 마지막에 모두 한 번 빛난다
    var q = es(T, s + 0.5, s + 1.0);
    if (q > 0) {
      var g = es(T, TL.glow + 0.18 * r, TL.glow + 0.18 * r + 0.4) * (1 - es(T, TL.glow + 0.18 * r + 0.6, TL.glow + 0.18 * r + 1.2));
      ctx.save();
      ctx.globalAlpha = q;
      card(ctx, AX, y + 22, AW, 64, { fill: g > 0 ? C.brand : C.tint, stroke: C.brand, lw: 3, r: 32, shadow: 0 });
      txt(ctx, ROWS[r][3], AX + AW / 2, y + 55, 28, 800, C.brandInk, 'center');
      ctx.restore();
    }
    // 앞 날의 결과물이 다음 날 재료로 — 칩 사이 화살표
    if (r > 0) arrow(ctx, AX + AW / 2, rowY(r - 1) + 90, AX + AW / 2, y + 18, es(T, s + 0.3, s + 0.8), C.brandInk, 5);
  }
  var lb = es(T, TL.row0 + 0.5, TL.row0 + 1.0);
  if (lb > 0) { ctx.save(); ctx.globalAlpha = lb; txt(ctx, '손에 남는 것', AX + AW / 2, 176, 24, 700, C.muted, 'center'); ctx.restore(); }
  footer(ctx, T, '앞 날의 결과물이 다음 날의 재료가 됨', TL.foot);
}
