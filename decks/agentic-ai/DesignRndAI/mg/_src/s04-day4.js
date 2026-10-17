// 장면 ⑤ — 4일차 쓰기 (원고 근거: 4-0 «하루가 직렬로 이어짐»·«검증 원칙 — 숫자는 전부 대조함»)
var NAME = 'mg-04-day4', DUR = 17;
var TL = { data: 0.8, e1: 2.4, e2: 3.2, n1: 3.0, n2: 3.8, e3: 6.0, n3: 6.4, e4: 7.6, e5: 8.4, n4: 8.0, band: 11.0, stamp: 13.0, foot: 14.6 };
var N = {
  data: { x: 70, y: 400, w: 270, h: 170, t: ['3일차 정제 데이터', '+ 그래프 2종'], tag: '' },
  rep:  { x: 470, y: 230, w: 360, h: 170, t: ['4-1 기술 보고서', '5부 구조 초안'], tag: '' },
  cert: { x: 470, y: 580, w: 360, h: 170, t: ['4-2 시험 성적서', '규격·측정·판정'], tag: '' },
  abs:  { x: 960, y: 230, w: 410, h: 170, t: ['4-3 영문 초록', '번역 아닌 재작성'], tag: '' },
  deck: { x: 960, y: 580, w: 410, h: 170, t: ['4-4 발표 덱', '아웃라인 먼저'], tag: '' },
};
function node(ctx, T, n, a, big) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  var y = n.y + (1 - p) * 24;
  card(ctx, n.x, y, n.w, n.h, { fill: big ? C.brand : C.paper, stroke: big ? C.brandInk : C.line, lw: big ? 3 : 2 });
  txt(ctx, n.t[0], n.x + n.w / 2, y + 62, 34, 800, C.ink, 'center');
  txt(ctx, n.t[1], n.x + n.w / 2, y + 114, 29, 500, big ? C.ink : C.muted, 'center');
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '4일차', '쓰기 — 한 데이터에서 네 문서로', 0.2);
  node(ctx, T, N.data, TL.data, true);
  arrow(ctx, 345, 450, 462, 345, es(T, TL.e1, TL.e1 + 0.7), C.brandInk, 5);
  arrow(ctx, 345, 520, 462, 640, es(T, TL.e2, TL.e2 + 0.7), C.brandInk, 5);
  node(ctx, T, N.rep, TL.n1);
  node(ctx, T, N.cert, TL.n2);
  arrow(ctx, 835, 300, 950, 300, es(T, TL.e3, TL.e3 + 0.6), C.brandInk, 5);
  node(ctx, T, N.abs, TL.n3);
  arrow(ctx, 835, 360, 950, 620, es(T, TL.e4, TL.e4 + 0.8), C.brandInk, 5);
  arrow(ctx, 1165, 405, 1165, 570, es(T, TL.e5, TL.e5 + 0.7), C.brandInk, 5);
  node(ctx, T, N.deck, TL.n4);
  // 가운데 허브 표시
  var ph = es(T, TL.e4 + 1.0, TL.e4 + 1.6);
  if (ph > 0) {
    ctx.save(); ctx.globalAlpha = ph;
    ctx.fillStyle = C.tint; rr(ctx, 540, 195, 220, 40, 20); ctx.fill();
    txt(ctx, '가운데 허브', 650, 216, 26, 800, C.brandInk, 'center');
    ctx.restore();
  }
  // 표본 vs 전수
  var pb = es(T, TL.band, TL.band + 0.8);
  if (pb > 0) {
    ctx.save(); ctx.globalAlpha = pb;
    card(ctx, 70, 810, 600, 130, { fill: C.paper });
    txt(ctx, '앞선 사흘 — 표본', 370, 850, 36, 800, C.sub, 'center');
    txt(ctx, '3행만 열어 보면 됨', 370, 904, 30, 500, C.muted, 'center');
    arrow(ctx, 690, 875, 750, 875, 1, C.brandInk, 5);
    card(ctx, 770, 810, 600, 130, { fill: C.tint, stroke: C.brandInk, lw: 4 });
    txt(ctx, '4일차 — 전수 대조', 1070, 850, 36, 800, C.ink, 'center');
    txt(ctx, '숫자는 사람이 넣음', 1070, 904, 30, 700, C.brandInk, 'center');
    ctx.restore();
  }
  var ns = [N.rep, N.cert, N.abs, N.deck];
  for (var i = 0; i < 4; i++) stamp(ctx, ns[i].x + ns[i].w - 30, ns[i].y + 30, 22, es(T, TL.stamp + 0.35 * i, TL.stamp + 0.35 * i + 0.4), C.green);
  footer(ctx, T, '보고서·성적서의 숫자는 하나가 틀려도 못 씀', TL.foot, C.red);
}
