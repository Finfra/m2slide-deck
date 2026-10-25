// 장면 ② — 1일차 묻기 (원고 근거: 1-2 «1줄 프롬프트와 6요소 프롬프트» · «프롬프트 6요소 — 페르소나·맥락·예시·형식·톤·과제»
//          · 1-3 «맥락 카드 — 제품·고객·시장 각 5줄» · P1-2-1 «맥락 카드 없이 묻고 붙여서 다시 묻기»)
var NAME = 'mg-01-day1', DUR = 16;
var TL = { ask: 0.8, ans1: 1.8, miss: 3.6, six: 5.0, cardIn: 8.0, fly: 10.0, ans2: 11.4, stamp: 13.0, foot: 13.8 };
var SIX = ['페르소나', '맥락', '예시', '형식', '톤', '과제'];
var L = { x: 70, w: 600 }, R = { x: 740, w: 630 };
function chipPos(i) { return { x: R.x + (i % 2) * 320, y: 210 + Math.floor(i / 2) * 100 }; }
function drawAsk(ctx, T) {
  var p = es(T, TL.ask, TL.ask + 0.6);
  if (p <= 0) return;
  var full = es(T, TL.fly + 0.6, TL.fly + 1.2);
  ctx.save(); ctx.globalAlpha = p;
  bubble(ctx, L.x, 200, L.w, 120, { fill: full > 0 ? C.tint : C.paper, stroke: full > 0 ? C.brand : C.line, lw: full > 0 ? 4 : 2 });
  ctx.globalAlpha = p * (1 - full);
  txt(ctx, '«소개 메일 써 줘»', L.x + 40, 260, 40, 800, C.ink, 'left');
  ctx.globalAlpha = p * full;
  txt(ctx, '6요소 + 맥락 카드', L.x + 40, 244, 38, 800, C.ink, 'left');
  txt(ctx, '페르소나 · 맥락 · 예시 · 형식 · 톤 · 과제', L.x + 40, 290, 25, 600, C.brandInk, 'left');
  ctx.restore();
}
function drawAnswer(ctx, T) {
  var p = es(T, TL.ans1, TL.ans1 + 0.6);
  if (p <= 0) return;
  var sw = es(T, TL.ans2, TL.ans2 + 0.8);
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, L.x, 380, L.w, 470, {});
  txt(ctx, 'AI 의 답', L.x + 40, 428, 28, 700, C.muted, 'left');
  // 1줄 프롬프트의 답 — 누구에게나 보낼 수 있는 문장
  ctx.globalAlpha = p * (1 - sw);
  var G = ['안녕하세요, 귀사의 발전을 기원합니다.', '저희는 우수한 품질의 제품을…', '많은 관심 부탁드립니다.'];
  for (var i = 0; i < G.length; i++) txt(ctx, G[i], L.x + 40, 500 + i * 62, 30, 500, C.sub, 'left');
  var m = es(T, TL.miss, TL.miss + 0.6);
  if (m > 0) {
    ctx.globalAlpha = p * (1 - sw) * m;
    txt(ctx, '누구에게? 무엇을? 왜?', L.x + L.w / 2, 740, 36, 800, C.red, 'center');
    crossmark(ctx, L.x + L.w - 70, 428, 26, m, C.red);
  }
  // 6요소 + 맥락 카드의 답 — 우리 회사만 쓸 수 있는 문장
  ctx.globalAlpha = p * sw;
  var S = [['건설기계 제조사 구매팀께', '고객'], ['상담에서 들은 불만부터', '문제'], ['DG-DB 시리즈 사양 · 급유', '제품'], ['없는 것은 «카드에 없음»', '검증']];
  for (var k = 0; k < S.length; k++) {
    var q = es(T, TL.ans2 + 0.3 * k, TL.ans2 + 0.3 * k + 0.5), y = 494 + k * 78;
    ctx.globalAlpha = p * sw * q;
    card(ctx, L.x + 30, y - 30, L.w - 60, 62, { fill: C.tint, stroke: 'transparent', shadow: 0, r: 12 });
    txt(ctx, S[k][0], L.x + 54, y + 1, 30, 700, C.ink, 'left');
    txt(ctx, S[k][1], L.x + L.w - 54, y + 1, 24, 700, C.brandInk, 'right');
  }
  ctx.restore();
  stamp(ctx, L.x + L.w - 70, 428, 26, es(T, TL.stamp, TL.stamp + 0.5), C.green);
}
function drawSix(ctx, T) {
  var lbl = es(T, TL.six - 0.3, TL.six + 0.3);
  if (lbl > 0) { ctx.save(); ctx.globalAlpha = lbl; txt(ctx, '프롬프트 6요소', R.x, 178, 28, 700, C.muted, 'left'); ctx.restore(); }
  for (var i = 0; i < 6; i++) {
    var a = TL.six + 0.35 * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var c = chipPos(i), x = c.x, y = c.y, w = 300, h = 80;
    ctx.save();
    ctx.globalAlpha = p;
    var hot = (i === 1 && T >= TL.cardIn) || es(T, TL.fly + 0.12 * i, TL.fly + 0.12 * i + 0.3) > 0.5;
    card(ctx, x, y, w, h, { fill: hot ? C.brand : C.paper, stroke: C.brand, lw: 3, r: 18, shadow: 0 });
    ctx.fillStyle = hot ? C.paper : C.brand;
    ctx.beginPath(); ctx.arc(x + 42, y + h / 2, 22, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), x + 42, y + h / 2 + 1, 26, 800, C.ink, 'center');
    txt(ctx, SIX[i], x + 80, y + h / 2 + 1, 32, 800, C.ink, 'left');
    ctx.restore();
  }
}
function drawContext(ctx, T) {
  var p = es(T, TL.cardIn, TL.cardIn + 0.7);
  if (p <= 0) return;
  var x = R.x, y = 540, w = R.w, h = 310;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, y + (1 - p) * 30, w, h, { fill: C.paper, stroke: C.brand, lw: 3 });
  txt(ctx, '맥락 카드 — 각 5줄', x + 32, y + 46, 30, 800, C.brandInk, 'left');
  var COL = ['제품', '고객', '시장'];
  for (var c = 0; c < 3; c++) {
    var cx = x + 32 + c * 200;
    ctx.fillStyle = C.tint; rr(ctx, cx, y + 80, 176, 48, 12); ctx.fill();
    txt(ctx, COL[c], cx + 88, y + 105, 28, 800, C.ink, 'center');
    for (var k = 0; k < 5; k++) {
      var q = es(T, TL.cardIn + 0.4 + 0.1 * (c * 5 + k), TL.cardIn + 0.7 + 0.1 * (c * 5 + k));
      ctx.fillStyle = C.line;
      ctx.fillRect(cx + 8, y + 150 + k * 30, (160 - (k % 2) * 40) * q, 10);
    }
  }
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '1일차', '묻기 — 한 줄 질문이 고유한 답으로', 0.2);
  drawAsk(ctx, T);
  drawAnswer(ctx, T);
  drawSix(ctx, T);
  drawContext(ctx, T);
  arrow(ctx, R.x - 20, 300, L.x + L.w + 18, 270, es(T, TL.fly - 0.3, TL.fly + 0.3), C.brandInk, 5);
  footer(ctx, T, '맥락을 붙이면 답이 우리 회사 것이 됨', TL.foot);
}
