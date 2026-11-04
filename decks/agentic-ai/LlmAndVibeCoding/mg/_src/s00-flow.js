// 장면 ① — 강연 흐름 8장 (원고 근거: AGENDA.md 목차 · 08-qa-closing «마무리»)
var NAME = 'mg-00-flow', DUR = 15;
var TL = { c0: 1.0, step: 0.65, gen: 7.4, ref: 9.0, goal: 10.4, foot: 12.0 };
var CH = [
  ['1', 'AI 코딩의 패러다임 전환', 'Code-First → Intent-First'],
  ['2', 'LLM 코딩 툴의 진화', '채팅 → IDE → CLI'],
  ['3', '바이브 코딩 개념과 철학', '채팅의 한계 · 바이브 코딩의 시작'],
  ['4', '바이브 코딩 세대 구분', '1세대 IDE · 2세대 CLI'],
  ['5', '세대별 비교 · 선택 가이드', '비교표 · 의사결정 트리'],
  ['6', '실전 사례', '세대별 활용법'],
  ['7', '도입 로드맵', '평가 → 시작 → 숙련 → 고급'],
  ['8', 'Q&A 및 클로징', '자주 묻는 질문 · 마무리'],
];
var CWD = 320, CHT = 190, CGAP = (CW - CWD * 4) / 3;
function pos(i) { // 뱀 모양 — 윗줄 1~4 왼→오, 아랫줄 5~8 오→왼
  var row = i < 4 ? 0 : 1, col = row === 0 ? i : 7 - i;
  return [X0 + col * (CWD + CGAP), row === 0 ? 260 : 620];
}
function chapter(ctx, T, i) {
  var a = TL.c0 + TL.step * i, p = es(T, a, a + 0.6);
  if (p <= 0) return;
  var xy = pos(i), x = xy[0], y = xy[1] + (1 - p) * 30, ref = i === 5 || i === 6;
  var g = (i === 1 || i === 3) ? es(T, TL.gen, TL.gen + 0.6) : 0;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, y, CWD, CHT, { fill: g > 0 ? C.tint : C.paper, stroke: g > 0 ? C.brand : (ref ? C.muted : C.line), lw: g > 0 ? 2 + 3 * g : 2, dash: ref ? [10, 8] : null });
  pill(ctx, CH[i][0], x + 44, y + 46, 52, 52, ref ? C.line : C.brand, C.ink, 28, 800);
  if (ref) {
    var pr = es(T, TL.ref, TL.ref + 0.5);
    if (pr > 0) { ctx.globalAlpha = p * pr; pill(ctx, '참고', x + CWD - 64, y + 46, 88, 40, C.line, C.sub, 22, 800); ctx.globalAlpha = p; }
  }
  fit(ctx, CH[i][1], x + 24, y + 108, 30, 800, C.ink, 'left', CWD - 48);
  fit(ctx, CH[i][2], x + 24, y + 152, 23, 600, C.sub, 'left', CWD - 48);
  ctx.restore();
}
function links(ctx, T) {
  for (var i = 0; i < 7; i++) {
    var a = TL.c0 + TL.step * (i + 1), p = es(T, a - 0.2, a + 0.3);
    if (p <= 0) continue;
    var s = pos(i), e = pos(i + 1), my;
    if (i === 3) { // 윗줄 끝 → 아랫줄 첫 칸 (아래로)
      arrow(ctx, s[0] + CWD / 2, s[1] + CHT + 12, e[0] + CWD / 2, e[1] - 14, p, C.muted, 5);
    } else if (i < 3) {
      my = s[1] + CHT / 2;
      arrow(ctx, s[0] + CWD + 8, my, e[0] - 10, my, p, C.muted, 5);
    } else {
      my = s[1] + CHT / 2;
      arrow(ctx, s[0] - 8, my, e[0] + CWD + 10, my, p, C.muted, 5);
    }
  }
}
function genBand(ctx, T) {
  var p = es(T, TL.gen, TL.gen + 0.8);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  var x = pos(1)[0], y = 498;
  pill(ctx, '0세대 채팅 → 1세대 IDE → 2세대 CLI', x + (pos(3)[0] + CWD - x) / 2, y, 620 * p + 40, 56, C.ink, '#FFFFFF', 27, 800);
  ctx.restore();
}
function goal(ctx, T) {
  var p = es(T, TL.goal, TL.goal + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  txt(ctx, '핵심: 올바른 도구 선택 · 점진적인 학습 · 지속적인 검증 · 팀과의 협력', W / 2, 890 + (1 - p) * 10, 28, 700, C.sub, 'center');
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '흐름', 'LLM 툴 진화와 바이브 코딩 — 8장 구성', 0.2);
  links(ctx, T);
  for (var i = 0; i < 8; i++) chapter(ctx, T, i);
  genBand(ctx, T);
  goal(ctx, T);
  footer(ctx, T, '바이브 코딩은 도구 사용법이 아니라 개발 방식의 근본적인 변화', TL.foot);
}
