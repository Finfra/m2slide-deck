// 장면 ② — 실패하지 않는 3원칙 (원고 근거: RamyeonCooking.md «실패하지 않는 3원칙» + «1단계·물 끓이기» + «2단계·스프 먼저» + «3단계·면과 시간»)
var NAME = 'mg-01-principles', DUR = 17;
var TL = { c1: 1.0, water: 1.6, waterEnd: 3.6, c2: 4.6, soup: 5.2, noodle: 6.4, c3: 8.0, timer: 8.6, timerEnd: 11.4, stamp: 12.4, foot: 13.6 };
var GAP = 50, GW = (CW - GAP * 2) / 3, GY = 200, GH = 720;
function gx(i) { return X0 + i * (GW + GAP); }
function frame(ctx, T, i, a, num, name, big, sub) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return -1;
  var x = gx(i), y = GY + (1 - p) * 50;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, y, GW, GH, {});
  pill(ctx, num, x + 40 + 50, y + 60, 100, 52, C.brand, C.ink, 30, 800);
  fit(ctx, name, x + 160, y + 62, 40, 800, C.ink, 'left', GW - 200);
  fit(ctx, big, x + GW / 2, y + 560, 64, 800, C.brandInk, 'center', GW - 60);
  fit(ctx, sub, x + GW / 2, y + 640, 32, 600, C.sub, 'center', GW - 60);
  ctx.restore();
  return p;
}
// 냄비 — 바닥 (cx, by), 폭 w, 높이 h. 물 높이 fill(0~1)
function pot(ctx, cx, by, w, h, fill) {
  var x = cx - w / 2, y = by - h;
  ctx.save();
  if (fill > 0) {
    ctx.fillStyle = rgba(C.blue, 0.35);
    ctx.fillRect(x + 6, by - h * fill, w - 12, h * fill - 6);
  }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, by); ctx.lineTo(x + w, by); ctx.lineTo(x + w, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 50, y + 26); ctx.lineTo(x, y + 26); ctx.moveTo(x + w, y + 26); ctx.lineTo(x + w + 50, y + 26); ctx.stroke();
  ctx.restore();
}
function water(ctx, T) {
  var pf = frame(ctx, T, 0, TL.c1, '01', '물의 양', '550ml', '국물 농도의 기준');
  if (pf < 0) return;
  var cx = gx(0) + GW / 2, by = GY + 440, f = es(T, TL.water, TL.waterEnd);
  ctx.save(); ctx.globalAlpha = pf;
  pot(ctx, cx, by, 300, 240, f * 0.8);
  // 기준선 — 80% 높이
  var my = by - 240 * 0.8;
  ctx.setLineDash([12, 10]); ctx.strokeStyle = C.red; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx - 150, my); ctx.lineTo(cx + 150, my); ctx.stroke(); ctx.setLineDash([]);
  txt(ctx, Math.round(550 * f) + 'ml', cx, by - 100, 46, 800, C.blue, 'center');
  ctx.restore();
}
function order(ctx, T) {
  var pf = frame(ctx, T, 1, TL.c2, '02', '투입 순서', '스프 먼저', '면이 더 쫄깃');
  if (pf < 0) return;
  var cx = gx(1) + GW / 2, by = GY + 440;
  ctx.save(); ctx.globalAlpha = pf;
  pot(ctx, cx, by, 300, 240, 0.8);
  ctx.restore();
  // 스프 → 면 순서로 위에서 냄비로 떨어짐
  var items = [['① 스프', TL.soup, C.red, -60], ['② 면', TL.noodle, C.brand, 60]];
  for (var k = 0; k < items.length; k++) {
    var p = es(T, items[k][1], items[k][1] + 0.9);
    if (p <= 0) continue;
    var y = lerp(GY + 130, by - 120 - k * 70, p);
    ctx.save(); ctx.globalAlpha = pf * Math.min(1, p * 3);
    pill(ctx, items[k][0], cx + items[k][3], y, 160, 60, items[k][2], k === 0 ? '#FFFFFF' : C.ink, 32, 800);
    ctx.restore();
  }
}
function timer(ctx, T) {
  var pf = frame(ctx, T, 2, TL.c3, '03', '시간 엄수', '4분 30초', '타이머 필수');
  if (pf < 0) return;
  var cx = gx(2) + GW / 2, cy = GY + 300, r = 140, f = seg(T, TL.timer, TL.timerEnd);
  var sec = Math.round(270 * f), ang = (sec / 300) * Math.PI * 2; // 한 바퀴 = 5분 (원고 표의 마지막 시점)
  ctx.save(); ctx.globalAlpha = pf;
  ctx.strokeStyle = C.line; ctx.lineWidth = 22;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  if (sec > 0) {
    ctx.strokeStyle = C.brand; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + ang); ctx.stroke();
  }
  // 2분 눈금 — 중간 젓기
  var a2 = -Math.PI / 2 + (120 / 300) * Math.PI * 2;
  ctx.fillStyle = C.sub;
  ctx.beginPath(); ctx.arc(cx + Math.cos(a2) * (r + 34), cy + Math.sin(a2) * (r + 34), 7, 0, Math.PI * 2); ctx.fill();
  txt(ctx, '2분 젓기', cx + Math.cos(a2) * (r + 34) + 18, cy + Math.sin(a2) * (r + 34) + 2, 24, 600, C.sub, 'left');
  var mm = Math.floor(sec / 60), ss = sec % 60;
  txt(ctx, mm + ':' + (ss < 10 ? '0' : '') + ss, cx, cy, 64, 800, C.ink, 'center', MONO);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '3원칙', '물의 양 · 투입 순서 · 시간 엄수', 0.2);
  water(ctx, T);
  order(ctx, T);
  timer(ctx, T);
  for (var i = 0; i < 3; i++) stamp(ctx, gx(i) + GW - 56, GY + 60, 30, es(T, TL.stamp + 0.3 * i, TL.stamp + 0.3 * i + 0.4), C.green);
  footer(ctx, T, '이 셋만 지키면 언제나 같은 맛', TL.foot);
}
