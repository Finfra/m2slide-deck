// 장면 ⑥ — 5일차 꾸미기 (원고 근거: 5-0 timeline «슬라이드·비주얼·사진·차트·영상» · 5-1 같은 아웃라인을 슬라이드 도구 3탭에
//          · P5-2-2 사진 10장 일괄 처리(크기 제각각 → 규격) · 5-4 수집결과.csv → 후보분석.xlsx 차트 · 5-5 한 줄 지시로 모션 그래픽)
var NAME = 'mg-05-day5', DUR = 16;
var TP = [1.6, 2.2, 2.8, 3.4], TA = [3.8, 6.2, 8.6, 11.0];  // 칸 등장 · 칸 동작 시각
var TL = { src: 0.6, slides: TA[0], photos: TA[1], chart: TA[2], video: TA[3], foot: 13.8 };
var PN = [
  { x: 70, y: 360, t: '슬라이드', s: '도구 3탭에 같은 아웃라인' },
  { x: 740, y: 360, t: '사진', s: '10장을 한 번에 규격화' },
  { x: 70, y: 660, t: '차트', s: 'CSV 를 엑셀 차트로' },
  { x: 740, y: 660, t: '영상', s: '한 줄 지시로 모션 그래픽' },
];
var PW = 630, PH = 270;
function frame(ctx, T, i) {
  var p = es(T, TP[i], TP[i] + 0.6);
  if (p <= 0) return 0;
  var on = T >= TA[i] && (i === 3 || T < TA[i + 1]);
  var P = PN[i];
  card(ctx, P.x, P.y + (1 - p) * 30, PW, PH, { alpha: p, fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 4 : 2 });
  ctx.save(); ctx.globalAlpha = p;
  txt(ctx, P.t, P.x + 32, P.y + 44, 34, 800, C.ink, 'left');
  txt(ctx, P.s, P.x + PW - 32, P.y + 44, 24, 600, C.brandInk, 'right');
  ctx.restore();
  return p;
}
function slides(ctx, T) {
  var P = PN[0], a = es(T, TA[0], TA[0] + 0.6);
  var TAB = ['Gamma', 'Notebook', 'ChatGPT'];
  for (var i = 0; i < 3; i++) {
    var q = es(T, TA[0] + 0.4 * i, TA[0] + 0.4 * i + 0.6), x = P.x + 40 + i * 196;
    if (q <= 0) continue;
    ctx.save(); ctx.globalAlpha = q;
    pill(ctx, TAB[i], x + 86, P.y + 104, 20, C.blueTint, C.blue, 14);
    card(ctx, x, P.y + 136, 172, 110 * q + 1, { fill: C.paper, shadow: 0, r: 8 });
    ctx.fillStyle = C.brand; ctx.fillRect(x + 12, P.y + 150, 100, 12);
    ctx.fillStyle = C.line; ctx.fillRect(x + 12, P.y + 176, 148, 8); ctx.fillRect(x + 12, P.y + 196, 120, 8); ctx.fillRect(x + 12, P.y + 216, 136, 8);
    ctx.restore();
  }
  return a;
}
function photos(ctx, T) {
  var P = PN[1], f = es(T, TA[1] + 0.8, TA[1] + 2.0);
  var SZ = [[70, 50], [46, 62], [80, 44], [54, 54], [66, 40], [40, 58], [74, 56], [50, 46], [60, 64], [44, 40]];
  for (var i = 0; i < 10; i++) {
    var q = es(T, TA[1] + 0.06 * i, TA[1] + 0.06 * i + 0.4);
    if (q <= 0) continue;
    var col = i % 5, row = Math.floor(i / 5);
    var cx = P.x + 90 + col * 112, cy = P.y + 130 + row * 84;
    var w = lerp(SZ[i][0], 84, f), h = lerp(SZ[i][1], 64, f), rot = lerp((i % 3 - 1) * 0.12, 0, f);
    ctx.save(); ctx.globalAlpha = q;
    ctx.translate(cx, cy); ctx.rotate(rot);
    ctx.fillStyle = f > 0.95 ? C.paper : '#EFEBDD'; ctx.strokeStyle = f > 0.95 ? C.brand : C.line; ctx.lineWidth = 3;
    rr(ctx, -w / 2, -h / 2, w, h, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = rgba(C.blue, 0.35); ctx.beginPath(); ctx.arc(0, 4, Math.min(w, h) * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
function chart(ctx, T) {
  var P = PN[2], a = es(T, TA[2], TA[2] + 0.5);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  pill(ctx, '수집결과.csv', P.x + 130, P.y + 170, 22, C.ink, C.paper, 16);
  ctx.restore();
  arrow(ctx, P.x + 236, P.y + 170, P.x + 290, P.y + 170, es(T, TA[2] + 0.4, TA[2] + 0.9), C.brandInk, 4);
  var V = [0.55, 0.9, 0.4, 0.72, 0.62];
  ctx.save();
  ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P.x + 310, P.y + 236); ctx.lineTo(P.x + 600, P.y + 236); ctx.stroke();
  for (var i = 0; i < 5; i++) {
    var g = es(T, TA[2] + 0.8 + 0.2 * i, TA[2] + 1.6 + 0.2 * i), h = 140 * V[i] * g;
    ctx.fillStyle = i === 1 ? C.brand : rgba(C.blue, 0.75);
    rr(ctx, P.x + 330 + i * 54, P.y + 236 - h, 36, h, 4); ctx.fill();
  }
  ctx.restore();
}
function video(ctx, T) {
  var P = PN[3], a = es(T, TA[3], TA[3] + 0.5);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, P.x + 40, P.y + 96, 250, 70, { fill: C.paper, shadow: 0, r: 14 });
  txt(ctx, '«모션 그래픽 만들어줘»', P.x + 165, P.y + 132, 22, 700, C.ink, 'center');
  ctx.restore();
  arrow(ctx, P.x + 300, P.y + 130, P.x + 350, P.y + 160, es(T, TA[3] + 0.4, TA[3] + 0.9), C.brandInk, 4);
  var v = es(T, TA[3] + 0.8, TA[3] + 1.3);
  if (v <= 0) return;
  ctx.save(); ctx.globalAlpha = v;
  var x = P.x + 360, y = P.y + 96, w = 230, h = 150;
  ctx.fillStyle = C.ink; rr(ctx, x, y, w, h, 12); ctx.fill();
  // 화면 안에서 움직이는 공 — 장면 시간의 함수(결정론)
  var k = seg(T, TA[3] + 1.0, DUR), bx = x + 30 + (w - 60) * (0.5 - 0.5 * Math.cos(k * Math.PI * 3)), by = y + h / 2 - 30 * Math.sin(k * Math.PI * 6);
  ctx.fillStyle = C.brand; ctx.beginPath(); ctx.arc(bx, by, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rgba('#FFFFFF', 0.35); ctx.fillRect(x + 16, y + h - 22, (w - 32), 6);
  ctx.fillStyle = C.brand; ctx.fillRect(x + 16, y + h - 22, (w - 32) * k, 6);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '5일차', '꾸미기 — 같은 제품을 슬라이드·사진·차트로', 0.2);
  var s = es(T, TL.src, TL.src + 0.6);
  if (s > 0) {
    ctx.save(); ctx.globalAlpha = s;
    card(ctx, 420, 196, 600, 120, { fill: C.paper, stroke: C.brand, lw: 4 });
    txt(ctx, '같은 제품 · 같은 아웃라인', 720, 240, 34, 800, C.ink, 'center');
    txt(ctx, 'DG-DB 시리즈(가상)', 720, 288, 26, 600, C.brandInk, 'center');
    ctx.restore();
  }
  for (var i = 0; i < 4; i++) {
    if (frame(ctx, T, i) > 0) {
      var P = PN[i], from = { x: i % 2 ? 1020 : 420, y: 316 };
      arrow(ctx, from.x, from.y, P.x + PW / 2, P.y - 6, es(T, TP[i] - 0.1, TP[i] + 0.4) * (i < 2 ? 1 : 0), C.line, 3);
    }
  }
  slides(ctx, T); photos(ctx, T); chart(ctx, T); video(ctx, T);
  footer(ctx, T, '도구마다 한계를 보고 고름', TL.foot);
}
