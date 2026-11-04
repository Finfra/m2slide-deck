// 장면 ④ — 초기 질량과 최종 잔해 (원고 근거: «초신성 이후: 중성자별과 블랙홀» 표·인용 + «고질량 별의 최후: 초거성에서 초신성으로»)
var NAME = 'mg-03-remnant', DUR = 17;
var TL = { axis: 1.0, start: 2.8, m1a: 4.6, m1b: 5.6, spoon: 7.0, m2a: 8.8, m2b: 9.8, sum: 11.4, foot: 14.0 };
var AX0 = 170, AX1 = 1750, AY = 830, MMIN = 0.5, MMAX = 40;
var M0 = 1, M1 = 12, M2 = 30; // 표시기가 머무는 자리 (구간 안쪽 아무 곳 — 화면에 수치로 쓰지 않음)
var ZONES = [
  { a: MMIN, b: 8, name: '백색왜성', size: '지구 크기', mass: '초기 질량 태양 8배 미만', col: '#E8F0FF' },
  { a: 8, b: 20, name: '중성자별', size: '도시 크기, 태양보다 무거움', mass: '초기 질량 태양 8~20배', col: '#6FB4FF' },
  { a: 20, b: MMAX, name: '블랙홀', size: '빛조차 탈출 못 함', mass: '초기 질량 태양 20배 이상', col: '#A98BFF' },
];
var PCX = 560, PCY = 470; // 잔해 그림 가운데
function mx(m) { return AX0 + (Math.log(m) - Math.log(MMIN)) / (Math.log(MMAX) - Math.log(MMIN)) * (AX1 - AX0); }
function logLerp(a, b, p) { return Math.exp(lerp(Math.log(a), Math.log(b), p)); }
function mass(T) {
  if (T < TL.m1a) return M0;
  if (T < TL.m2a) return logLerp(M0, M1, seg(T, TL.m1a, TL.m1b));
  return logLerp(M1, M2, seg(T, TL.m2a, TL.m2b));
}
// 경계(8배·20배)를 넘는 시각 — 로그 선형 보간이므로 바로 계산된다
var TX8 = TL.m1a + (TL.m1b - TL.m1a) * Math.log(8 / M0) / Math.log(M1 / M0);
var TX20 = TL.m2a + (TL.m2b - TL.m2a) * Math.log(20 / M1) / Math.log(M2 / M1);
function stage(T) { return T < TX8 ? 0 : T < TX20 ? 1 : 2; }
function axis(ctx, T) {
  var p = es(T, TL.axis, TL.axis + 1.4);
  if (p <= 0) return;
  ctx.save();
  // 구간 띠
  for (var i = 0; i < ZONES.length; i++) {
    var z = ZONES[i], x0 = mx(z.a), x1 = mx(z.b), on = stage(T) === i && T >= TL.start;
    ctx.globalAlpha = p * (on ? 0.5 : 0.22);
    ctx.fillStyle = z.col;
    ctx.fillRect(x0, AY - 40, (x1 - x0) * p, 80);
  }
  ctx.globalAlpha = 1;
  arrow(ctx, AX0, AY + 40, AX1 + 30, AY + 40, p, C.sub, 4);
  var ticks = [[1, '1'], [8, '8'], [20, '20']];
  for (var k = 0; k < ticks.length; k++) {
    var pt = es(T, TL.axis + 0.6 + 0.2 * k, TL.axis + 1.0 + 0.2 * k);
    if (pt <= 0) continue;
    var x = mx(ticks[k][0]);
    ctx.globalAlpha = pt;
    ctx.fillStyle = C.sub; ctx.fillRect(x - 2, AY + 28, 4, 24);
    txt(ctx, ticks[k][1], x, AY + 80, 30, 800, C.ink, 'center');
  }
  ctx.globalAlpha = es(T, TL.axis + 1.0, TL.axis + 1.6);
  txt(ctx, '초기 질량 (태양 질량의 배수)', AX1 + 30, AY + 124, 24, 700, C.muted, 'right');
  // 요약 — 띠마다 이름
  var ps = es(T, TL.sum, TL.sum + 0.8);
  if (ps > 0) {
    for (var j = 0; j < ZONES.length; j++) {
      ctx.globalAlpha = ps;
      fit(ctx, ZONES[j].name, (mx(ZONES[j].a) + mx(ZONES[j].b)) / 2, AY + 1, 30, 800, C.ink, 'center', mx(ZONES[j].b) - mx(ZONES[j].a) - 20);
    }
  }
  ctx.restore();
}
function marker(ctx, T) {
  var p = es(T, TL.start, TL.start + 0.5) * (1 - es(T, TL.sum, TL.sum + 0.6)); // 요약 때는 물러남
  if (p <= 0) return;
  var x = mx(mass(T)), y = AY - 58;
  ctx.save(); ctx.globalAlpha = p;
  ctx.fillStyle = C.brand;
  ctx.beginPath(); ctx.moveTo(x, y + 14); ctx.lineTo(x - 16, y - 12); ctx.lineTo(x + 16, y - 12); ctx.closePath(); ctx.fill();
  ctx.fillRect(x - 2, y + 10, 4, 88);
  ctx.restore();
}
function remnant(ctx, T) {
  var p = es(T, TL.start, TL.start + 0.6);
  if (p <= 0) return;
  var s = stage(T), tc = s === 0 ? TL.start : s === 1 ? TX8 : TX20;
  var q = es(T, tc + 0.15, tc + 0.8); // 새 잔해 나타남
  ctx.save(); ctx.globalAlpha = p * (s === 0 ? 1 : q);
  if (s === 0) {
    glowStar(ctx, PCX, PCY, 34, '#E8F0FF', 0.7);
  } else if (s === 1) {
    // 중성자별 — 작은 푸른 점 + 도는 빛줄기
    var a = T * 2.4;
    ctx.save();
    ctx.translate(PCX, PCY); ctx.rotate(a);
    var g = ctx.createLinearGradient(0, -220, 0, 220);
    g.addColorStop(0, rgba('#6FB4FF', 0)); g.addColorStop(0.5, rgba('#BFE0FF', 0.75)); g.addColorStop(1, rgba('#6FB4FF', 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-34, -220); ctx.lineTo(34, -220); ctx.lineTo(6, 0);
    ctx.lineTo(34, 220); ctx.lineTo(-34, 220); ctx.closePath(); ctx.fill();
    ctx.restore();
    glowStar(ctx, PCX, PCY, 20, '#8CC4FF', 1);
  } else {
    // 블랙홀 — 밝은 고리 + 검은 원
    ctx.save();
    ctx.translate(PCX, PCY);
    ctx.rotate(-0.25);
    for (var k = 0; k < 3; k++) {
      ctx.strokeStyle = rgba(k === 1 ? '#FFC24A' : '#FF7A3A', 0.55 - k * 0.12);
      ctx.lineWidth = 16 - k * 4;
      ctx.beginPath(); ctx.ellipse(0, 0, 200 + k * 18, 56 + k * 6, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    var gr = ctx.createRadialGradient(PCX, PCY, 80, PCX, PCY, 130);
    gr.addColorStop(0, rgba('#A98BFF', 0.5)); gr.addColorStop(1, rgba('#A98BFF', 0));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(PCX, PCY, 130, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(PCX, PCY, 88, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // 초신성 섬광 — 경계를 넘을 때
  var flashes = [TX8, TX20];
  for (var i = 0; i < flashes.length; i++) {
    var f = seg(T, flashes[i] - 0.1, flashes[i] + 0.9);
    if (f <= 0 || f >= 1) continue;
    ctx.save();
    var gf = ctx.createRadialGradient(PCX, PCY, 0, PCX, PCY, 60 + f * 380);
    gf.addColorStop(0, rgba('#FFF4D0', 0.95 * (1 - f))); gf.addColorStop(1, rgba('#FFB04A', 0));
    ctx.fillStyle = gf; ctx.beginPath(); ctx.arc(PCX, PCY, 60 + f * 380, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = Math.sin(f * Math.PI);
    pill(ctx, '초신성', PCX, PCY - 250, 170, 54, C.brand, '#1A1400', 28, 800);
    ctx.restore();
  }
}
function info(ctx, T) {
  var p = es(T, TL.start, TL.start + 0.6);
  if (p <= 0) return;
  var s = stage(T), tc = s === 0 ? TL.start : s === 1 ? TX8 : TX20;
  var q = es(T, tc + 0.15, tc + 0.8), z = ZONES[s];
  var x = 1040, y = 260, w = X1 - x, h = 300;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, y, w, h, { fill: C.paper, stroke: rgba(z.col, 0.4 + 0.5 * q), lw: 4 });
  ctx.globalAlpha = p * q;
  txt(ctx, '최종 잔해', x + 44, y + 56, 26, 700, C.muted, 'left');
  fit(ctx, z.name, x + 44, y + 128, 64, 800, z.col, 'left', w - 88);
  fit(ctx, z.size, x + 44, y + 204, 34, 700, C.ink, 'left', w - 88);
  fit(ctx, z.mass, x + 44, y + 256, 26, 600, C.sub, 'left', w - 88);
  ctx.restore();
  var ps = es(T, TL.spoon, TL.spoon + 0.6);
  if (ps > 0) {
    ctx.save(); ctx.globalAlpha = ps;
    pill(ctx, '중성자별 한 찻숟가락 = 수십억 톤', x + w / 2, y + h + 70, w, 64, C.blueTint, C.blue, 30, 800);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx, T);
  header(ctx, T, '최후', '초기 질량 → 초신성 이후 남는 잔해', 0.2);
  remnant(ctx, T);
  info(ctx, T);
  axis(ctx, T);
  marker(ctx, T);
  footer(ctx, T, '초신성 이후 남는 핵의 운명도 질량이 결정', TL.foot);
}
