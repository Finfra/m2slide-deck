// 장면 ⑥ — 5일차 남기기 (원고 근거: 5-0 «5일차의 네 주제»·«AI 초안의 법적 위치»)
var NAME = 'mg-05-day5', DUR = 17;
var TL = { c0: 1.0, step: 1.3, rule: 7.4, foot: 14.4 };
var CARDS = [
  { t: '명세서 초안', l: ['발명 설명을 배경·과제·', '해결수단·청구항으로 펼침'], tag: '변리사 검토 필수', tc: 'red' },
  { t: '표준 모니터링', l: ['개정 이력을 읽고 구판·신판', '차이를 뽑아 영향을 표로 냄'], tag: '', tc: '' },
  { t: '회의록 정리', l: ['결정·과제·미결을 갈라', '담당자·기한 표로 만듦'], tag: '', tc: '' },
  { t: '문서 구조화', l: ['1~4일차 산출물을', 'Obsidian 볼트 하나로 묶음'], tag: '→ 6일차 지식베이스의 소스', tc: 'blue' },
];
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '5일차', '남기기 — 네 주제, 하나의 규칙', 0.2);
  for (var i = 0; i < 4; i++) {
    var a = TL.c0 + TL.step * i, p = es(T, a, a + 0.7);
    if (p <= 0) continue;
    var x = 70 + (i % 2) * 670, y = 195 + Math.floor(i / 2) * 255 + (1 - p) * 30, K = CARDS[i];
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, y, 630, 240, {});
    ctx.fillStyle = C.brand; ctx.beginPath(); ctx.arc(x + 54, y + 56, 30, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), x + 54, y + 57, 36, 800, C.ink, 'center');
    txt(ctx, K.t, x + 104, y + 56, 42, 800, C.ink, 'left');
    lines(ctx, K.l, x + 40, y + 118, 40, 31, 500, C.sub, 'left');
    if (K.tag) {
      var col = K.tc === 'red' ? C.red : C.blue, bg = K.tc === 'red' ? C.redTint : C.blueTint;
      ctx.font = '700 26px ' + KR; var w = ctx.measureText(K.tag).width + 36;
      ctx.fillStyle = bg; rr(ctx, x + 40, y + 188, w, 42, 21); ctx.fill();
      txt(ctx, K.tag, x + 58, y + 210, 26, 700, col, 'left');
    }
    ctx.restore();
  }
  // 공통 규칙 3단
  var R = ['사람이 틀을 채움', 'AI 가 칸으로 펼침', '원문과 대조'];
  for (var j = 0; j < 3; j++) {
    var a2 = TL.rule + 0.9 * j, p2 = es(T, a2, a2 + 0.6);
    if (p2 <= 0) continue;
    var rx = 70 + j * 460, last = j === 2;
    ctx.save(); ctx.globalAlpha = p2;
    card(ctx, rx, 760, 400, 130, { fill: last ? C.brand : C.paper, stroke: last ? C.brandInk : C.line, lw: last ? 4 : 2 });
    txt(ctx, String(j + 1), rx + 48, 825, 44, 800, last ? C.ink : C.brandInk, 'center');
    txt(ctx, R[j], rx + 95, 825, 33, 800, C.ink, 'left');
    ctx.restore();
    if (j < 2) arrow(ctx, rx + 406, 825, rx + 454, 825, es(T, a2 + 0.4, a2 + 0.9), C.brandInk, 4);
  }
  var pt = es(T, TL.rule - 0.6, TL.rule);
  if (pt > 0) { ctx.save(); ctx.globalAlpha = pt; txt(ctx, '네 주제의 공통 구조', 720, 730, 30, 700, C.muted, 'center'); ctx.restore(); }
  footer(ctx, T, '밖으로 나가는 문서에 AI 문장을 검증 없이 싣지 않음', TL.foot);
}
