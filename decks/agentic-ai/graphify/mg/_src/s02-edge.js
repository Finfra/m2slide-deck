// 장면 ③ — edge 신뢰도 (원고 근거: «핵심 개념: edge 신뢰도» + «graphify가 해결하는 문제»)
var NAME = 'mg-02-edge', DUR = 15;
var TL = { src: 1.0, arr: 1.8, dia: 2.2, lane0: 3.0, laneStep: 2.4, gauge: 6.2, hi: 9.8, foot: 12.0 };
var LANES = [
  { branch: '명시적 참조', name: 'EXTRACTED', note: '함수 호출, import 등', tag: '신뢰도 높음', color: C.green, tint: C.greenTint, dash: null, lw: 7 },
  { branch: '의미 추론', name: 'INFERRED', note: '문맥 기반 추론', tag: '', color: C.blue, tint: C.blueTint, dash: [16, 12], lw: 6 },
  { branch: '불명확', name: 'AMBIGUOUS', note: '', tag: '', color: C.muted, tint: C.paper, dash: [4, 14], lw: 5 },
];
var DX = 520, DY = 600, DR = 120;     // «추출 방식» 마름모
var LX = 780, LW2 = X1 - LX, LH = 210; // 줄 카드
function laneY(i) { return 340 + i * 260; }
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '핵심 개념', 'edge 신뢰도 — EXTRACTED · INFERRED · AMBIGUOUS', 0.2);
  // 코드/문서 아이콘
  var ps = es(T, TL.src, TL.src + 0.6);
  if (ps > 0) {
    doc(ctx, X0 + 20, DY - 110 + (1 - ps) * 20, 170, 210, { alpha: ps, rows: 6 });
    ctx.save(); ctx.globalAlpha = ps;
    txt(ctx, '코드/문서', X0 + 105, DY + 150, 30, 800, C.ink, 'center');
    ctx.restore();
  }
  arrow(ctx, X0 + 210, DY, DX - DR - 14, DY, es(T, TL.arr, TL.arr + 0.5), C.muted, 5);
  // 마름모
  var pd = es(T, TL.dia, TL.dia + 0.6);
  if (pd > 0) {
    ctx.save();
    ctx.globalAlpha = pd;
    ctx.translate(DX, DY); ctx.scale(lerp(0.6, 1, pd), lerp(0.6, 1, pd));
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(0, -DR); ctx.lineTo(DR, 0); ctx.lineTo(0, DR); ctx.lineTo(-DR, 0); ctx.closePath(); ctx.fill();
    txt(ctx, '추출', 0, -18, 30, 800, '#FFFFFF', 'center');
    txt(ctx, '방식', 0, 22, 30, 800, '#FFFFFF', 'center');
    ctx.restore();
  }
  var ph = es(T, TL.hi, TL.hi + 0.6);
  for (var i = 0; i < 3; i++) {
    var L = LANES[i], a = TL.lane0 + TL.laneStep * i, y = laneY(i);
    // 분기 화살표 — 마름모 오른쪽 꼭짓점에서 줄 카드로
    arrow(ctx, DX + DR + 8, DY + (i - 1) * 40, LX - 14, y, es(T, a, a + 0.5), L.color, 5);
    var pc = es(T, a + 0.3, a + 0.8);
    if (pc <= 0) continue;
    var hi = i < 2 ? ph : 0;
    card(ctx, LX + (1 - pc) * 30, y - LH / 2, LW2, LH, { alpha: pc, fill: L.tint, stroke: hi > 0 ? L.color : C.line, lw: 2 + 3 * hi, r: 20 });
    var x0 = LX + (1 - pc) * 30;
    ctx.save(); ctx.globalAlpha = pc;
    pill(ctx, L.branch, x0 + 130, y, 210, 56, C.paper, L.color, 27, 800);
    ctx.strokeStyle = L.color; ctx.lineWidth = 3;
    rr(ctx, x0 + 25, y - 28, 210, 56, 28); ctx.stroke();
    ctx.restore();
    // 노드 쌍 + 선 모양
    var n1 = x0 + 310, n2 = x0 + 560, pe = es(T, a + 0.7, a + 1.3);
    dline(ctx, n1, y, n2, y, pe, L.color, L.lw, L.dash);
    node(ctx, n1, y, 26, es(T, a + 0.5, a + 0.9), C.ink);
    node(ctx, n2, y, 26, es(T, a + 1.1, a + 1.5), C.ink);
    // 이름 · 설명
    var pn = es(T, a + 1.0, a + 1.5);
    if (pn <= 0) continue;
    ctx.save(); ctx.globalAlpha = pn;
    var tx = x0 + 640, tw = X1 - tx - 30;
    fit(ctx, L.name, tx, y - 42, 44, 800, L.color, 'left', tw, MONO);
    if (i < 2) fit(ctx, L.note, tx, y + 14, 29, 700, C.sub, 'left', tw);
    if (L.tag && i === 0) fit(ctx, L.tag, tx, y + 58, 27, 800, C.ink, 'left', tw);
    ctx.restore();
    // INFERRED — 신뢰도 막대 0 → 0.7
    if (i === 1) {
      var pg = es(T, TL.gauge, TL.gauge + 1.0), gy = y + 58, gx = tx + 196, gw = 120;
      if (pg > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, pg * 2);
        txt(ctx, 'avg confidence', tx, gy, 22, 700, C.blue, 'left', MONO);
        ctx.fillStyle = C.paper; rr(ctx, gx, gy - 12, gw, 24, 12); ctx.fill();
        ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = C.blue; rr(ctx, gx, gy - 12, Math.max(24, gw * 0.7 * pg), 24, 12); ctx.fill();
        txt(ctx, (0.7 * pg).toFixed(1), gx + gw + 14, gy, 28, 800, C.blue, 'left', MONO);
        ctx.restore();
      }
    }
  }
  footer(ctx, T, 'EXTRACTED + INFERRED edge로 숨겨진 연결 발견', TL.foot);
}
