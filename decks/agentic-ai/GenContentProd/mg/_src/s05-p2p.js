// 장면 ⑥ — Prompt-to-Publish 미니 프로젝트 (원고 근거: 13 «미니 프로젝트 개요» + «5단계 산출물 명세» + «진행 중 도움 요청» + 14 «강사 총평»)
var NAME = 'mg-05-p2p', DUR = 19;
var TL = { bar: 1.0, run0: 2.0, run1: 14.0, skip: 9.6, done: 14.2, must: 15.0, foot: 16.2 };
var STEPS = [
  ['①', '주제 선정', '주제 1줄', 'ex) “재택근무 효율화 팁 5선”'],
  ['②', 'Markdown 초안', '~500자', 'Frontmatter + 본문 + 목록'],
  ['③', 'Diffusion 이미지', '이미지 1~2장', '표지·일러스트'],
  ['④', 'Mermaid·Excalidraw', '다이어그램 1~2장', 'Mermaid 또는 Excalidraw'],
  ['⑤', 'Obsidian 정리', '노트 1개 + 백링크 1건', '태그 2개'],
  ['⑥', 'Pandoc 출력', '최종 파일 1개', 'DOCX 또는 PDF'],
];
var BY = 214, BH = 84, SEG = CW / 6;
var LX = X0, LY = 450, LW = 780, LH = 490;
var DX = LX + LW + 80, DY = 440, DW = X1 - DX - 40, DH = 510;
function prog(T) { return seg(T, TL.run0, TL.run1); } // 0~1 = 0~60분
function stageAt(T) { return T < TL.run0 ? -1 : Math.min(5, Math.floor(prog(T) * 6)); }
function stIn(k) { return TL.run0 + (TL.run1 - TL.run0) * (k + 0.5) / 6; } // 단계 k 의 조각이 문서에 붙는 시각
function bar(ctx, T) {
  var p = es(T, TL.bar, TL.bar + 0.6);
  if (p <= 0) return;
  var pr = prog(T), cur = stageAt(T);
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, X0, BY, CW, BH, { fill: C.paper, r: 16, shadow: 0 });
  // 채움
  if (pr > 0) { ctx.save(); rr(ctx, X0, BY, CW, BH, 16); ctx.clip(); ctx.fillStyle = C.tint; ctx.fillRect(X0, BY, CW * pr, BH); ctx.restore(); }
  for (var i = 0; i < 6; i++) {
    var x = X0 + SEG * i, on = i === cur && T < TL.done;
    if (i) { ctx.fillStyle = C.line; ctx.fillRect(x - 1, BY + 10, 2, BH - 20); }
    if (on) { ctx.strokeStyle = C.brand; ctx.lineWidth = 5; rr(ctx, x + 4, BY + 4, SEG - 8, BH - 8, 12); ctx.stroke(); }
    txt(ctx, STEPS[i][0], x + SEG / 2, BY + BH / 2 + 2, 40, 800, cur >= i ? C.brandInk : C.muted, 'center');
    fit(ctx, STEPS[i][1], x + SEG / 2, BY + BH + 36, 26, 700, cur >= i ? C.ink : C.muted, 'center', SEG - 16);
    txt(ctx, (i * 10) + '분', x, BY - 24, 22, 700, C.muted, i ? 'center' : 'left');
  }
  txt(ctx, '60분', X1, BY - 24, 22, 700, C.muted, 'right');
  ctx.restore();
  if (T >= TL.run0) {
    var hx = X0 + CW * pr;
    ctx.save();
    ctx.fillStyle = C.ink; ctx.fillRect(hx - 2, BY - 8, 4, BH + 16);
    ctx.beginPath(); ctx.moveTo(hx - 10, BY - 12); ctx.lineTo(hx + 10, BY - 12); ctx.lineTo(hx, BY); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // ④·⑤ 생략 가능 · ⑥ 필수
  var q = es(T, TL.skip, TL.skip + 0.5);
  if (q > 0) {
    var sx = X0 + SEG * 3 + 10, sw = SEG * 2 - 20, sy = BY + BH + 74;
    ctx.save(); ctx.globalAlpha = q;
    ctx.setLineDash([10, 8]); ctx.strokeStyle = C.muted; ctx.lineWidth = 3;
    rr(ctx, sx, sy - 22, sw, 44, 22); ctx.stroke(); ctx.setLineDash([]);
    fit(ctx, '시간 초과 시 ④ 또는 ⑤ 생략 가능', sx + sw / 2, sy, 22, 700, C.sub, 'center', sw - 24);
    ctx.restore();
  }
  var m = es(T, TL.must, TL.must + 0.5);
  if (m > 0) { ctx.save(); ctx.globalAlpha = m; pill(ctx, '⑥ 출판 완성은 필수', X0 + SEG * 5 + SEG / 2, BY + BH + 74, SEG - 20, 44, C.red, '#FFFFFF', 22, 800); ctx.restore(); }
}
function current(ctx, T) {
  var p = es(T, TL.run0, TL.run0 + 0.5);
  if (p <= 0) return;
  var k = stageAt(T), s = STEPS[k];
  var local = (prog(T) * 6) - k, f = T >= TL.run1 ? 1 : es(local, 0, 0.18);
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, LX, LY, LW, LH, {});
  txt(ctx, '체크포인트 ' + (k + 1) + ' / 6', LX + 40, LY + 54, 28, 800, C.muted, 'left');
  txt(ctx, '약 10분', LX + LW - 40, LY + 54, 28, 700, C.muted, 'right');
  ctx.globalAlpha = p * f;
  txt(ctx, s[0], LX + 40, LY + 170 + (1 - f) * 16, 96, 800, C.brandInk, 'left');
  fit(ctx, s[1], LX + 200, LY + 170 + (1 - f) * 16, 52, 800, C.ink, 'left', LW - 240);
  ctx.fillStyle = C.line; ctx.fillRect(LX + 40, LY + 250, LW - 80, 3);
  txt(ctx, '산출물', LX + 40, LY + 300, 28, 800, C.brandInk, 'left');
  fit(ctx, s[2], LX + 40, LY + 362, 40, 800, C.ink, 'left', LW - 80);
  fit(ctx, s[3], LX + 40, LY + 424, 30, 600, C.sub, 'left', LW - 80);
  ctx.restore();
}
function assembled(ctx, T) {
  var p = es(T, TL.run0, TL.run0 + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  doc(ctx, DX, DY, DW, DH, { rows: 0 });
  ctx.restore();
  var x = DX + 34, w = DW - 68, a;
  // ① 제목줄
  a = es(T, stIn(0), stIn(0) + 0.5);
  if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.ink; ctx.fillRect(x, DY + 60, w * 0.7 * a, 18); ctx.restore(); }
  // ② 본문 줄
  a = es(T, stIn(1), stIn(1) + 0.6);
  if (a > 0) { ctx.save(); ctx.fillStyle = C.line; for (var i = 0; i < 4; i++) ctx.fillRect(x, DY + 130 + i * 22, w * (i === 3 ? 0.5 : 1) * clamp(a * 4 - i, 0, 1), 9); ctx.restore(); }
  // ③ 이미지
  a = es(T, stIn(2), stIn(2) + 0.5);
  if (a > 0) {
    var iy = DY + 228, ih = 110, iw = w * 0.48;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = C.blueTint; rr(ctx, x, iy, iw, ih, 10); ctx.fill();
    ctx.fillStyle = C.brand; ctx.beginPath(); ctx.arc(x + iw * 0.72, iy + 38, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.green; ctx.beginPath(); ctx.moveTo(x, iy + ih); ctx.lineTo(x + iw * 0.35, iy + 50); ctx.lineTo(x + iw * 0.7, iy + ih); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // ④ 다이어그램
  a = es(T, stIn(3), stIn(3) + 0.5);
  if (a > 0) {
    var gx = x + w * 0.55, gy = DY + 228, gw = w * 0.45;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    for (var j = 0; j < 3; j++) { rr(ctx, gx + 6, gy + j * 42, gw - 12, 30, 6); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = C.ink;
    for (j = 0; j < 2; j++) { ctx.beginPath(); ctx.moveTo(gx + gw / 2 - 7, gy + 32 + j * 42); ctx.lineTo(gx + gw / 2 + 7, gy + 32 + j * 42); ctx.lineTo(gx + gw / 2, gy + 41 + j * 42); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  // ⑤ 링크·태그
  a = es(T, stIn(4), stIn(4) + 0.5);
  if (a > 0) {
    ctx.save(); ctx.globalAlpha = a;
    pill(ctx, '[[링크]]', x + 80, DY + 392, 160, 40, C.blueTint, C.blue, 22, 800);
    pill(ctx, '#lec', x + 220, DY + 392, 100, 40, C.tint, C.brandInk, 22, 800);
    pill(ctx, '#주제', x + 340, DY + 392, 110, 40, C.tint, C.brandInk, 22, 800);
    ctx.restore();
  }
  // ⑥ DOCX·PDF
  a = es(T, TL.done, TL.done + 0.5);
  if (a > 0) {
    ctx.save(); ctx.globalAlpha = a;
    pill(ctx, 'DOCX · PDF', x + 120, DY + 462 + (1 - a) * 12, 220, 52, C.green, '#FFFFFF', 26, 800);
    ctx.restore();
  }
  stamp(ctx, DX + DW - 60, DY + DH - 56, 30, es(T, TL.done + 0.4, TL.done + 0.8), C.green);
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '60분', 'Prompt-to-Publish — 체크포인트 6개 × 10분', 0.2);
  bar(ctx, T);
  current(ctx, T);
  assembled(ctx, T);
  footer(ctx, T, '60분 안에 프롬프트에서 출판까지', TL.foot);
}
