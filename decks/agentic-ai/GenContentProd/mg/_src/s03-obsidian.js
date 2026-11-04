// 장면 ④ — Obsidian 5단계 (원고 근거: 10 «Obsidian 정리» + «Vault 구조·관리» + «볼트 생성·노트 작성» + «[[링크]]·#태그 실습» + «Smart Connections» + «Obsidian 핵심 특징»)
var NAME = 'mg-03-obsidian', DUR = 18;
var TL = { s0: 1.0, sstep: 0.4, st0: 3.2, ststep: 2.4, foot: 15.2 };
var STEPS = [['폴더', 'Vault'], ['파일', 'Note'], ['연결', 'Link · Tag'], ['시각화', '그래프'], ['증강', '플러그인']];
var SG = 40, SW = (CW - SG * 4) / 5, SY = 182, SH = 100;
var VX = X0, VY = 330, VW = 760, VH = 620;
var GX = VX + VW + 40, GW = X1 - GX, GY = 330, GH = 300, PY = 660, PH = 290;
function stageAt(T) { return T < TL.st0 ? -1 : Math.min(4, Math.floor((T - TL.st0) / TL.ststep)); }
function stA(k) { return TL.st0 + TL.ststep * k; }
function strip(ctx, T) {
  var cur = stageAt(T);
  for (var i = 0; i < 5; i++) {
    var a = TL.s0 + TL.sstep * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var x = X0 + i * (SW + SG), on = i === cur && T < TL.foot, past = cur >= i;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, SY + (1 - p) * 20, SW, SH, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : past ? C.brandInk : C.line, lw: on ? 5 : 2, r: 16 });
    txt(ctx, String(i + 1), x + 34, SY + SH / 2, 30, 800, past ? C.brandInk : C.muted, 'center');
    fit(ctx, STEPS[i][0], x + 64, SY + 36, 32, 800, C.ink, 'left', SW - 80);
    fit(ctx, STEPS[i][1], x + 64, SY + 72, 24, 600, C.sub, 'left', SW - 80);
    ctx.restore();
    if (i < 4) arrow(ctx, x + SW + 6, SY + SH / 2, x + SW + SG - 6, SY + SH / 2, es(T, a + 0.3, a + 0.6), C.brandInk, 4);
  }
}
function folderIcon(ctx, x, y, color) {
  ctx.fillStyle = color;
  rr(ctx, x, y + 6, 46, 34, 6); ctx.fill();
  rr(ctx, x, y, 22, 14, 4); ctx.fill();
}
function vault(ctx, T) {
  var p = es(T, stA(0), stA(0) + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, VX, VY, VW, VH, {});
  folderIcon(ctx, VX + 36, VY + 34, C.brand);
  txt(ctx, 'lec-vault/', VX + 100, VY + 56, 34, 800, C.ink, 'left', MONO);
  txt(ctx, '1 Vault = 1 폴더', VX + VW - 36, VY + 56, 26, 700, C.muted, 'right');
  ctx.globalAlpha = p * es(T, stA(0) + 0.6, stA(0) + 1.1);
  folderIcon(ctx, VX + 76, VY + 104, C.line);
  txt(ctx, '.obsidian/', VX + 140, VY + 126, 28, 600, C.sub, 'left', MONO);
  txt(ctx, '설정 자동 생성', VX + VW - 36, VY + 126, 24, 600, C.muted, 'right');
  ctx.restore();
  // ② 노트 2개
  var N = ['welcome.md', 'prompt-engineering.md'];
  for (var i = 0; i < 2; i++) {
    var q = es(T, stA(1) + 0.5 * i, stA(1) + 0.5 * i + 0.6);
    if (q <= 0) continue;
    var y = VY + 188 + i * 74;
    ctx.save(); ctx.globalAlpha = q;
    doc(ctx, VX + 80 + (1 - q) * 20, y, 40, 52, { rows: 0 });
    txt(ctx, N[i], VX + 140 + (1 - q) * 20, y + 27, 28, 700, C.ink, 'left', MONO);
    ctx.restore();
  }
  // ③ welcome.md 본문 — 링크·태그
  var r = es(T, stA(2), stA(2) + 0.6);
  if (r > 0) {
    var bx = VX + 36, by = VY + 360, bw = VW - 72, bh = 220;
    ctx.save(); ctx.globalAlpha = r;
    ctx.fillStyle = C.bg; rr(ctx, bx, by, bw, bh, 14); ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
    txt(ctx, 'welcome.md', bx + 24, by + 34, 22, 700, C.muted, 'left', MONO);
    txt(ctx, '# 오늘 배운 것', bx + 24, by + 80, 28, 700, C.ink, 'left', MONO);
    ctx.globalAlpha = r * es(T, stA(2) + 0.5, stA(2) + 1.0);
    ctx.fillStyle = C.blueTint; rr(ctx, bx + 18, by + 106, 400, 46, 10); ctx.fill();
    txt(ctx, '[[prompt-engineering]]', bx + 30, by + 130, 26, 700, C.blue, 'left', MONO);
    ctx.globalAlpha = r * es(T, stA(2) + 1.0, stA(2) + 1.5);
    pill(ctx, '#lec', bx + 80, by + 186, 120, 44, C.tint, C.brandInk, 24, 800);
    pill(ctx, '#day1', bx + 220, by + 186, 130, 44, C.tint, C.brandInk, 24, 800);
    ctx.restore();
    // 링크 → 두 번째 노트 줄을 가리키는 표시 (글자를 피해 오른쪽으로 돌아감)
    var ny = VY + 188 + 74 + 27;
    polyArrow(ctx, [[bx + 412, by + 130], [VX + VW - 90, by + 130], [VX + VW - 90, ny], [VX + 600, ny]], es(T, stA(2) + 0.9, stA(2) + 1.5), C.blue, 3);
  }
}
function graph(ctx, T) {
  var p = es(T, stA(3), stA(3) + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, GX, GY, GW, GH, { fill: C.paper });
  txt(ctx, '그래프 뷰', GX + 32, GY + 42, 28, 800, C.brandInk, 'left');
  txt(ctx, '노드 2 · 엣지 1', GX + GW - 32, GY + 42, 24, 700, C.muted, 'right');
  var ax = GX + 170, ay = GY + 180, bx = GX + GW - 190, by = GY + 160;
  var e = es(T, stA(3) + 0.9, stA(3) + 1.5);
  if (e > 0) { ctx.strokeStyle = C.sub; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, bx, e), lerp(ay, by, e)); ctx.stroke(); }
  var n1 = es(T, stA(3) + 0.3, stA(3) + 0.7), n2 = es(T, stA(3) + 0.5, stA(3) + 0.9);
  ctx.fillStyle = C.brand;
  if (n1 > 0) { ctx.beginPath(); ctx.arc(ax, ay, 26 * n1, 0, Math.PI * 2); ctx.fill(); }
  if (n2 > 0) { ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(bx, by, 26 * n2, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = p * n2;
  txt(ctx, 'welcome', ax, ay + 56, 24, 700, C.ink, 'center', MONO);
  fit(ctx, 'prompt-engineering', bx, by + 56, 24, 700, C.ink, 'center', 300, MONO);
  ctx.restore();
}
function plugin(ctx, T) {
  var p = es(T, stA(4), stA(4) + 0.6);
  if (p <= 0) return;
  var L = ['유사 노트 자동 추천', 'Smart Chat — 출처 인용 답변'];
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, GX + (1 - p) * 30, PY, GW, PH, { fill: C.greenTint, stroke: C.green, lw: 3 });
  txt(ctx, 'Smart Connections', GX + 36, PY + 50, 34, 800, C.green, 'left');
  for (var i = 0; i < L.length; i++) {
    var y = PY + 130 + i * 74;
    stamp(ctx, GX + 56, y, 20, es(T, stA(4) + 0.5 + 0.4 * i, stA(4) + 0.9 + 0.4 * i), C.green);
    fit(ctx, L[i], GX + 92, y, 30, 700, C.ink, 'left', GW - 120);
  }
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'Part 2', 'Obsidian — 폴더에서 지식 베이스까지 5단계', 0.2);
  strip(ctx, T);
  vault(ctx, T);
  graph(ctx, T);
  plugin(ctx, T);
  footer(ctx, T, '노트는 로컬 .md 파일 — AI 도구에 그대로 입력', TL.foot);
}
