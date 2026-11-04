// 장면 ① — 덱 전체 흐름 (원고 근거: graphify.md 장 제목 9개 + 각 장 첫 슬라이드 요점 + «graphify가 해결하는 문제»)
var NAME = 'mg-00-flow', DUR = 14;
var TL = { line0: 1.0, step: 0.9, key: 9.4, foot: 11.0 };
var STOPS = [
  ['왜 graphify인가', '토큰 폭탄 · 의존성 미로'],
  ['graphify란', '정의 · 3대 산출물 · edge'],
  ['다른 도구와의 관계', 'Obsidian · llmwiki'],
  ['설치 & 첫 빌드', 'pipx install graphifyy'],
  ['토큰 절약', '직접 Read 금지 · 발췌만'],
  ['CLI 실전', 'query / path / explain'],
  ['graphify + llmwiki', '같은 저장소, 두 계층'],
  ['실전 워크플로', '빌드 → 질의 → 타겟 Read'],
  ['정리 & 다음 단계', '/graphify . 바로 적용'],
];
var LW = 330, LH = 112, LY = 580, SX0 = X0 + LW / 2, SDX = (CW - LW) / 8;
function stopX(i) { return SX0 + i * SDX; }
function stopT(i) { return TL.line0 + 0.2 + TL.step * i; }
// 선 끝(점 위치) — 정거장이 나타나는 시각에 맞춰 이동, 마지막 정거장에서 멈춤
function headX(T) {
  var u = clamp((T - TL.line0 - 0.2) / (TL.step * 8), 0, 1);
  return lerp(SX0 - 60, stopX(8), es(T, TL.line0, TL.line0 + 0.2) > 0 ? u : 0);
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '흐름', '15분 입문 — 문제에서 실전 워크플로까지', 0.2);
  // 가로 선 + 달리는 점
  var p0 = es(T, TL.line0, TL.line0 + 0.3);
  if (p0 > 0) {
    var hx = headX(T);
    ctx.save();
    ctx.globalAlpha = p0;
    ctx.strokeStyle = C.line; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(SX0 - 60, LY); ctx.lineTo(stopX(8) + 60, LY); ctx.stroke();
    ctx.strokeStyle = C.brand;
    ctx.beginPath(); ctx.moveTo(SX0 - 60, LY); ctx.lineTo(hx, LY); ctx.stroke();
    ctx.fillStyle = C.brandInk;
    ctx.beginPath(); ctx.arc(hx, LY, 13, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  var pk = es(T, TL.key, TL.key + 0.6);
  for (var i = 0; i < 9; i++) {
    var a = stopT(i), p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var x = stopX(i), up = i % 2 === 0, key = i === 4 || i === 5;
    var cy = up ? LY - 150 : LY + 150, cardY = cy - LH / 2;
    var hi = key ? pk : 0;
    // 정거장 원
    ctx.save();
    ctx.globalAlpha = p;
    ctx.fillStyle = hi > 0 ? C.brand : C.ink;
    ctx.beginPath(); ctx.arc(x, LY, lerp(10, 30, p), 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), x, LY + 1, 28, 800, hi > 0 ? C.ink : '#FFFFFF', 'center');
    // 원과 카드 잇는 짧은 선
    var pl = es(T, a + 0.2, a + 0.5);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 3;
    ctx.beginPath();
    if (up) { ctx.moveTo(x, LY - 34); ctx.lineTo(x, LY - 34 - (LY - 34 - (cardY + LH)) * pl); }
    else { ctx.moveTo(x, LY + 34); ctx.lineTo(x, LY + 34 + (cardY - LY - 34) * pl); }
    ctx.stroke();
    ctx.restore();
    // 장 카드
    var pc = es(T, a + 0.3, a + 0.8);
    if (pc <= 0) continue;
    var off = (1 - pc) * (up ? 16 : -16);
    card(ctx, x - LW / 2, cardY + off, LW, LH, { alpha: pc, fill: hi > 0 ? C.tint : C.paper, stroke: hi > 0 ? C.brand : C.line, lw: 2 + 3 * hi, r: 16 });
    ctx.save();
    ctx.globalAlpha = pc;
    fit(ctx, STOPS[i][0], x, cardY + off + 38, 32, 800, C.ink, 'center', LW - 36);
    ctx.globalAlpha = es(T, a + 0.6, a + 1.0);
    fit(ctx, STOPS[i][1], x, cardY + off + 80, 25, 600, C.sub, 'center', LW - 36);
    ctx.restore();
  }
  // «핵심» 표지 — 5·6 정거장 사이 아래(선 바로 밑)
  if (pk > 0) {
    var kx = (stopX(4) + stopX(5)) / 2;
    ctx.save(); ctx.globalAlpha = pk;
    pill(ctx, '핵심', kx, LY + 52 + (1 - pk) * 10, 100, 44, C.brandInk, '#FFFFFF', 24, 800);
    ctx.restore();
  }
  footer(ctx, T, '한 번 빌드한 그래프에서 필요한 노드만 질의', TL.foot);
}
