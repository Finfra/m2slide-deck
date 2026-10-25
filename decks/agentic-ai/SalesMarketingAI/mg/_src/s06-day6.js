// 장면 ⑦ — 6일차 넓히기 (원고 근거: 6-0 process «번역·표 정리·근거 제안·규칙 자동화·과제 카드»
//          · 받는 파일 → 만드는 파일: 번역/ → 카탈로그_영문.md · CRM.xlsx → CRM_정리.xlsx · 후보분석.xlsx → 원페이지제안.md
//          · 리드워크플로.json → 결과 표 5행(A·B·C 등급, AI 노드 없음) · 6-6 과제 카드)
// ⚠️ 확인 질문(A 등급 수 · 999/1000 경계)의 답은 그리지 않는다 — 등급 이름만 보인다
var NAME = 'mg-06-day6', DUR = 17;
var TR = [0.8, 3.4, 6.0, 8.6];  // 네 줄 시작 시각
var TL = { r1: TR[0], r2: TR[1], r3: TR[2], r4: TR[3], card: 11.4, foot: 14.2 };
var ROWS = [
  ['번역', '카탈로그 · 메일', '번역', '영문 카탈로그'],
  ['표 정리', 'CRM.xlsx', '정리', '전환율 표'],
  ['근거 제안', '후보분석.xlsx', '근거', '원페이지 제안'],
  ['규칙 자동화', '테스트 리드 5건', 'n8n 규칙', 'A · B · C'],
];
var RY0 = 210, RSTEP = 182, NH = 112;
var X = [70, 412, 690], NW = [280, 220, 300];
function node(ctx, x, y, w, h, title, sub, o) {
  card(ctx, x, y, w, h, o);
  ctx.save(); ctx.globalAlpha = (o && o.alpha != null) ? o.alpha : 1;
  if (sub) { txt(ctx, title, x + w / 2, y + 40, 26, 700, C.muted, 'center'); txt(ctx, sub, x + w / 2, y + 78, 30, 800, C.ink, 'center'); }
  else txt(ctx, title, x + w / 2, y + h / 2 + 1, 30, 800, C.ink, 'center');
  ctx.restore();
}
function grades(ctx, x, y, w, p) {
  var G = ['A', 'B', 'C'], F = [C.green, C.blue, C.muted];
  for (var i = 0; i < 3; i++) {
    var q = clamp(p * 3 - i, 0, 1);
    if (q <= 0) continue;
    ctx.save(); ctx.globalAlpha = q;
    ctx.fillStyle = F[i]; ctx.beginPath(); ctx.arc(x + w / 2 - 80 + i * 80, y + NH / 2, 30, 0, Math.PI * 2); ctx.fill();
    txt(ctx, G[i], x + w / 2 - 80 + i * 80, y + NH / 2 + 2, 32, 800, '#FFFFFF', 'center');
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '6일차', '넓히기 — 번역 · 표 · 워크플로로', 0.2);
  for (var r = 0; r < ROWS.length; r++) {
    var s = TR[r], y = RY0 + r * RSTEP;
    var a = es(T, s, s + 0.5), b = es(T, s + 0.7, s + 1.2), c = es(T, s + 1.4, s + 1.9);
    if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha = a;
    pill(ctx, (r + 1) + '. ' + ROWS[r][0], X[0] + 100, y - 8, 22, C.brand, C.ink, 16);
    ctx.restore();
    node(ctx, X[0], y + 14, NW[0], NH, '받는 것', ROWS[r][1], { alpha: a, fill: C.paper });
    arrow(ctx, X[0] + NW[0] + 8, y + 14 + NH / 2, X[1] - 10, y + 14 + NH / 2, b, C.brandInk, 5);
    if (b > 0) node(ctx, X[1], y + 14, NW[1], NH, ROWS[r][2], null, { alpha: b, fill: C.tint, stroke: C.brand, lw: 3, r: 56, shadow: 0 });
    arrow(ctx, X[1] + NW[1] + 8, y + 14 + NH / 2, X[2] - 10, y + 14 + NH / 2, c, C.brandInk, 5);
    if (c > 0) {
      if (r === 3) {
        card(ctx, X[2], y + 14, NW[2], NH, { alpha: c, fill: C.paper });
        grades(ctx, X[2], y + 14, NW[2], es(T, s + 1.6, s + 2.4));
      } else node(ctx, X[2], y + 14, NW[2], NH, '만드는 것', ROWS[r][3], { alpha: c, fill: C.paper, stroke: C.brand, lw: 3 });
    }
    // 모든 결과물이 과제 카드로 모인다
    arrow(ctx, X[2] + NW[2] + 8, y + 14 + NH / 2, 1086, 560 + (r - 1.5) * 40, es(T, TL.card - 0.6 + 0.15 * r, TL.card + 0.1 + 0.15 * r), C.brand, 4);
  }
  var k = es(T, TL.card, TL.card + 0.7);
  if (k > 0) {
    ctx.save(); ctx.globalAlpha = k;
    var cy = 400 + (1 - k) * 30;
    card(ctx, 1100, cy, 270, 320, { fill: C.paper, stroke: C.brand, lw: 4 });
    ctx.fillStyle = C.brand; rr(ctx, 1116, cy + 16, 238, 64, 14); ctx.fill();
    txt(ctx, '과제 카드', 1235, cy + 48, 32, 800, C.ink, 'center');
    var K = ['업무 · 입력', '프롬프트 · 규칙', '검증 기준 · 수단'];
    for (var i = 0; i < 3; i++) {
      var q = es(T, TL.card + 0.6 + 0.35 * i, TL.card + 1.0 + 0.35 * i);
      ctx.globalAlpha = k * q;
      ctx.fillStyle = C.line; ctx.fillRect(1130, cy + 118 + i * 66, 210, 2);
      txt(ctx, K[i], 1140, cy + 146 + i * 66, 26, 700, C.sub, 'left');
    }
    ctx.restore();
  }
  footer(ctx, T, '6일의 결과물을 내 업무 한 장으로 가져감', TL.foot);
}
