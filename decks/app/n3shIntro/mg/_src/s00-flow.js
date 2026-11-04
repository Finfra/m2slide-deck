// 장면 ① — n3sh 한눈에 (원고 근거: n3shIntro.ppt.md 장 제목 4개 «n3sh 란 무엇인가»·«작동 원리»·«학습 커리큘럼»·«설치와 생태계» + «정리 — n3sh 한 장 요약»)
var NAME = 'mg-00-flow', DUR = 15;
var TL = { card0: 1.0, step: 1.8, stamp: 9.0, foot: 11.2 };
var CARDS = [
  ['1 무엇', 'n3sh 란 무엇인가', ['자모 2개 →', '완성형 한 글자'], ['254 규칙', '조사·어미는 뒤 공백까지']],
  ['2 원리', '작동 원리', ['모아치기 +', '모디파이어 층'], ['세벌식 390 배열 전제', 'macOS + Karabiner-Elements']],
  ['3 학습', '학습 커리큘럼', ['예비 +', '6단계 드릴'], ['2단계(조사·어미)까지만', '익혀도 이득']],
  ['4 설치', '설치와 생태계', ['3분 설치'], ['pqrs 카탈로그 import', 'md 정본 → JSON 생성']],
];
var GAP = 64, CWD = (CW - GAP * 3) / 4, CY = 230, CH = 640;
function cardX(i) { return X0 + i * (CWD + GAP); }
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'n3sh', '무엇 → 원리 → 학습 → 설치', 0.2);
  for (var i = 0; i < CARDS.length; i++) {
    var a = TL.card0 + TL.step * i, p = es(T, a, a + 0.7);
    if (p <= 0) continue;
    var x = cardX(i), y = CY + (1 - p) * 50, c = CARDS[i];
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, y, CWD, CH, {});
    pill(ctx, c[0], x + 40 + 85, y + 66, 170, 58, C.brand, C.ink, 32, 800);
    fit(ctx, c[1], x + 40, y + 150, 30, 700, C.muted, 'left', CWD - 80);
    ctx.fillStyle = C.line; ctx.fillRect(x + 40, y + 190, CWD - 80, 3);
    ctx.globalAlpha = p * es(T, a + 0.5, a + 1.0);
    for (var k = 0; k < c[2].length; k++) fit(ctx, c[2][k], x + 40, y + 260 + k * 62, 48, 800, C.ink, 'left', CWD - 80);
    ctx.globalAlpha = p * es(T, a + 0.9, a + 1.4);
    for (k = 0; k < c[3].length; k++) fit(ctx, c[3][k], x + 40, y + 430 + k * 50, 29, 600, C.sub, 'left', CWD - 80);
    ctx.restore();
    // 다음 장으로 넘어가는 화살표 — 칸 사이 틈
    if (i < CARDS.length - 1) arrow(ctx, x + CWD + 10, CY + CH / 2, x + CWD + GAP - 10, CY + CH / 2, es(T, a + 1.2, a + 1.7), C.brandInk, 6);
    stamp(ctx, x + CWD - 64, CY + CH - 64, 30, es(T, TL.stamp + 0.3 * i, TL.stamp + 0.3 * i + 0.4), C.green);
  }
  footer(ctx, T, 'pqrs 카탈로그 import → 2단계까지 드릴 → 몸에 붙는 만큼 확장', TL.foot);
}
