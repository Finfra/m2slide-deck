// 장면 ③ — LLM 코딩 툴 3세대 (원고 근거: 02-llm-tool-evolution «진화 타임라인» · «세대별 비교 요약»)
var NAME = 'mg-02-evolution', DUR = 18;
var TL = { c0: 1.0, cstep: 1.0, env: 4.6, ctx: 6.0, scope: 7.4, auto: 9.2, prod: 10.8, hi: 12.4, foot: 14.6 };
var GEN = [
  { g: '0세대', name: '채팅 기반', year: '2022-2023', tools: 'ChatGPT · Claude · Bard', env: '웹 브라우저', ctx: '대화 내용', scope: '코드 조각', auto: '없음', av: 0.0, prod: '낮음', color: C.muted },
  { g: '1세대', name: 'IDE 통합', year: '2023-2024', tools: 'Cursor · Cline · Windsurf', env: 'IDE 통합', ctx: '현재 파일', scope: '단일 파일', auto: '부분적', av: 0.5, prod: '중간', color: C.blue },
  { g: '2세대', name: 'CLI 기반', year: '2024-현재', tools: 'Claude Code · Gemini CLI · Codex CLI', env: 'CLI / 서버', ctx: '프로젝트 전체', scope: '멀티파일', auto: '전면적', av: 1.0, prod: '높음', color: C.brandInk },
];
var GW = 440, GGAP = (CW - GW * 3) / 2, GY = 190, GH = 760;
function gx(i) { return X0 + i * (GW + GGAP); }
function row(ctx, T, a, x, y, label, val, color) {
  var p = es(T, a, a + 0.5);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  txt(ctx, label, x + 28, y, 23, 700, C.muted, 'left');
  fit(ctx, val, x + GW - 28, y, 29, 800, color || C.ink, 'right', GW - 190);
  ctx.restore();
}
function scopeIcon(ctx, T, a, i, x, y) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  var cx = x + GW / 2;
  ctx.save(); ctx.globalAlpha = p;
  if (i === 0) { // 코드 조각 — 짧은 줄 세 개
    card(ctx, cx - 70, y, 140, 86, { r: 12 });
    ctx.fillStyle = C.muted;
    for (var k = 0; k < 3; k++) ctx.fillRect(cx - 48, y + 22 + k * 20, k === 1 ? 70 : 96, 7);
  } else if (i === 1) {
    doc(ctx, cx - 40, y - 6, 80, 98, { rows: 3 });
  } else { // 멀티파일 — 문서가 차례로 늘어남
    for (var j = 0; j < 4; j++) {
      var q = es(T, a + 0.15 * j, a + 0.15 * j + 0.4);
      if (q > 0) doc(ctx, cx - 150 + j * 76, y - 6 + (1 - q) * 20, 72, 92, { rows: 3, alpha: q });
    }
  }
  ctx.restore();
}
function gen(ctx, T, i) {
  var a = TL.c0 + TL.cstep * i, p = es(T, a, a + 0.6);
  if (p <= 0) return;
  var G = GEN[i], x = gx(i), hi = i === 2 ? es(T, TL.hi, TL.hi + 0.6) : 0;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, GY + (1 - p) * 30, GW, GH, { fill: hi > 0 ? C.tint : C.paper, stroke: hi > 0 ? C.brand : C.line, lw: 2 + 3 * hi });
  ctx.translate(0, (1 - p) * 30);
  pill(ctx, G.g, x + 80, GY + 50, 120, 50, G.color, '#FFFFFF', 26, 800);
  txt(ctx, G.year, x + GW - 28, GY + 50, 24, 700, C.muted, 'right');
  fit(ctx, G.name, x + 28, GY + 118, 42, 800, C.ink, 'left', GW - 56);
  fit(ctx, G.tools, x + 28, GY + 168, 23, 600, C.sub, 'left', GW - 56);
  ctx.fillStyle = C.line; ctx.fillRect(x + 28, GY + 205, GW - 56, 2);
  ctx.restore();
  row(ctx, T, TL.env + 0.25 * i, x, GY + 250, '환경', G.env);
  row(ctx, T, TL.ctx + 0.25 * i, x, GY + 315, '컨텍스트', G.ctx, i === 2 ? C.brandInk : C.ink);
  row(ctx, T, TL.scope + 0.25 * i, x, GY + 380, '작업 범위', G.scope);
  scopeIcon(ctx, T, TL.scope + 0.25 * i + 0.3, i, x, GY + 420);
  // 자동화 막대
  var pa = es(T, TL.auto + 0.25 * i, TL.auto + 0.25 * i + 0.5);
  if (pa > 0) {
    row(ctx, T, TL.auto + 0.25 * i, x, GY + 570, '자동화', G.auto);
    var bx = x + 28, bw = GW - 56, by = GY + 610, fill = es(T, TL.auto + 0.25 * i + 0.3, TL.auto + 0.25 * i + 1.2);
    ctx.save(); ctx.globalAlpha = pa;
    ctx.fillStyle = C.line; rr(ctx, bx, by, bw, 22, 11); ctx.fill();
    if (G.av > 0) { ctx.fillStyle = G.color; rr(ctx, bx, by, Math.max(22, bw * G.av * fill), 22, 11); ctx.fill(); }
    ctx.restore();
  }
  var pp = es(T, TL.prod + 0.3 * i, TL.prod + 0.3 * i + 0.5);
  if (pp > 0) {
    ctx.save(); ctx.globalAlpha = pp;
    txt(ctx, '생산성', x + 28, GY + 700, 23, 700, C.muted, 'left');
    pill(ctx, G.prod, x + GW - 98, GY + 700, 140, 52, i === 2 ? C.brand : C.line, C.ink, 27, 800);
    ctx.restore();
  }
}
function links(ctx, T) {
  for (var i = 0; i < 2; i++) {
    var a = TL.c0 + TL.cstep * (i + 1), p = es(T, a - 0.3, a + 0.2);
    var x1 = gx(i) + GW + 4, x2 = gx(i + 1) - 4;
    arrow(ctx, x1, GY + 118, x2, GY + 118, p, C.brand, 6);
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '2장', 'LLM 코딩 툴의 진화 — 채팅 → IDE → CLI', 0.2);
  for (var i = 0; i < 3; i++) gen(ctx, T, i);
  links(ctx, T);
  footer(ctx, T, '컨텍스트는 대화 → 파일 → 프로젝트 전체, 작업 범위는 코드 조각 → 멀티파일', TL.foot);
}
