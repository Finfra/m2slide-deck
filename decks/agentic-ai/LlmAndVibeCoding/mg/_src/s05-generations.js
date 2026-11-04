// 장면 ⑥ — 바이브 코딩 1세대 IDE vs 2세대 CLI (원고 근거: 04-vibecoding-generations «세대 구분의 기준» · «세대별 핵심 차이» · «하이브리드 활용» / 04.1 «1세대: 단점» / 04.2 «2세대: 장점»)
var NAME = 'mg-05-generations', DUR = 17;
var TL = { pl: 1.0, pr: 1.8, r0: 3.0, rstep: 0.9, par: 8.8, hyb: 11.2, foot: 13.6 };
var PW = 560, LPX = X0, RPX = X1 - PW, MX = W / 2, PY = 180;
var ROWS = [
  ['실행 환경', 'IDE 내부', '터미널'],
  ['인터페이스', 'GUI', 'CLI'],
  ['메모리 사용', '높음 (8GB+)', '낮음 (<1GB)'],
  ['병렬 작업', '제한적', '무제한'],
  ['실행 위치', '로컬', '서버/클라우드'],
  ['자동화', '제한적', '완전 자동화'],
  ['진입 장벽', '낮음', '중간'],
];
var RY0 = 490, RSTEP = 62;
function ideIcon(ctx, x, y, w, h) {
  card(ctx, x, y, w, h, { r: 12, shadow: 0, stroke: C.blue, lw: 3 });
  ctx.fillStyle = C.blueTint; ctx.fillRect(x + 2, y + 2, w - 4, 24);
  ctx.fillStyle = C.blue;
  for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x + 18 + k * 18, y + 14, 5, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = C.line; ctx.fillRect(x + 10, y + 36, 40, h - 46); // 파일 탐색기
  ctx.fillStyle = C.muted;
  for (k = 0; k < 4; k++) ctx.fillRect(x + 62, y + 44 + k * 22, (w - 150) * (k % 2 ? 0.6 : 0.9), 7);
  ctx.fillStyle = C.blueTint; ctx.fillRect(x + w - 74, y + 36, 64, h - 46); // 채팅 패널
}
function termIcon(ctx, x, y, w, h, alpha) {
  ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.fillStyle = '#26241F'; rr(ctx, x, y, w, h, 12); ctx.fill();
  fit(ctx, '$ claude', x + 16, y + 28, 20, 700, C.brand, 'left', w - 28, MONO);
  fit(ctx, '> 테스트 코드도 작성해줘', x + 16, y + 60, 16, 600, '#E8E4D6', 'left', w - 28);
  txt(ctx, '✓ npm test', x + 16, y + 90, 17, 600, '#8FD3A8', 'left', MONO);
  ctx.restore();
}
function panel(ctx, T, a, left) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  var x = left ? LPX : RPX, color = left ? C.blue : C.purple;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, PY + (1 - p) * 30, PW, 230, { stroke: color, lw: 3 });
  ctx.translate(0, (1 - p) * 30);
  if (left) ideIcon(ctx, x + 26, PY + 52, 220, 140); else termIcon(ctx, x + 26, PY + 62, 200, 120);
  pill(ctx, left ? '1세대' : '2세대', x + 330, PY + 66, 120, 48, color, '#FFFFFF', 26, 800);
  fit(ctx, left ? 'IDE 기반' : 'CLI 기반', x + 272, PY + 124, 40, 800, C.ink, 'left', PW - 296);
  fit(ctx, left ? 'Cursor · Cline · Windsurf · Continue' : 'Claude Code · Gemini CLI · Codex CLI', x + 272, PY + 176, 21, 600, C.sub, 'left', PW - 296);
  ctx.restore();
}
function rows(ctx, T) {
  for (var i = 0; i < ROWS.length; i++) {
    var a = TL.r0 + TL.rstep * i * 0.75, p = es(T, a, a + 0.4), pl = es(T, a + 0.25, a + 0.65), pr = es(T, a + 0.45, a + 0.85);
    if (p <= 0) continue;
    var y = RY0 + i * RSTEP;
    ctx.save();
    ctx.globalAlpha = p;
    if (i % 2 === 0) { ctx.fillStyle = 'rgba(227,223,208,0.35)'; rr(ctx, X0, y - RSTEP / 2 + 4, CW, RSTEP - 8, 12); ctx.fill(); }
    txt(ctx, ROWS[i][0], MX, y, 26, 700, C.muted, 'center');
    ctx.globalAlpha = pl;
    fit(ctx, ROWS[i][1], LPX + PW / 2, y, 30, 800, C.blue, 'center', PW - 40);
    ctx.globalAlpha = pr;
    fit(ctx, ROWS[i][2], RPX + PW / 2, y, 30, 800, C.purple, 'center', PW - 40);
    ctx.restore();
  }
}
// 병렬 작업 — 2세대 패널에 터미널이 겹겹이 늘어남
function parallel(ctx, T) {
  var p = es(T, TL.par, TL.par + 0.5);
  if (p <= 0) return;
  for (var k = 1; k <= 3; k++) {
    var q = es(T, TL.par + 0.3 * k, TL.par + 0.3 * k + 0.4);
    if (q > 0) termIcon(ctx, RPX + 26 + k * 10, PY + 62 - k * 10, 200, 120, q);
  }
  ctx.save(); ctx.globalAlpha = p;
  pill(ctx, '여러 터미널에서 동시 작업', RPX + PW / 2, PY + 256, 330, 42, C.purpleTint, C.purple, 22, 800);
  pill(ctx, '한 번에 하나의 프로젝트', LPX + PW / 2, PY + 256, 310, 42, C.blueTint, C.blue, 22, 800);
  ctx.restore();
}
function hybrid(ctx, T) {
  var p = es(T, TL.hyb, TL.hyb + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, X0 + 120, 905 + (1 - p) * 12, CW - 240, 64, { fill: C.tint, stroke: C.brand, lw: 3, r: 32 });
  fit(ctx, '하이브리드 — 1세대로 UI 컴포넌트 · 2세대로 빌드 설정과 배포 자동화', W / 2, 937 + (1 - p) * 12, 27, 800, C.ink, 'center', CW - 300);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '4장', '바이브 코딩 세대 구분 — IDE vs CLI', 0.2);
  panel(ctx, T, TL.pl, true);
  panel(ctx, T, TL.pr, false);
  parallel(ctx, T);
  rows(ctx, T);
  hybrid(ctx, T);
  footer(ctx, T, '실행 환경과 작업 방식이 세대를 가른다', TL.foot);
}
