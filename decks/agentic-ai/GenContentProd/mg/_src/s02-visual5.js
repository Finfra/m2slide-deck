// 장면 ③ — AI 시각 자산 5종 (원고 근거: 04 «AI 시각 자산 5종 비교» + «Diffusion 모델 개요» + 08 «Mermaid vs Excalidraw — 언제 무엇을»)
var NAME = 'mg-02-visual5', DUR = 18;
var TL = { ax: 1.0, astep: 0.25, u0: 2.4, ustep: 0.4, t0: 4.6, tstep: 0.4, m0: 7.0, mstep: 1.6, foot: 15.0 };
var AXES = ['자유도', '일관성', '수정 용이성', '텍스트 정확도'];
var USES = ['표지·삽화', '수치·플로우 시각화', '정밀 SVG·재사용', '정형 다이어그램 (코드 기반)', '발산·브레인스토밍'];
var TOOLS = [['Diffusion', '사진·일러스트'], ['인포그래픽', 'Napkin · Gamma'], ['Claude Design', 'SVG'], ['Mermaid', '다이어그램 — 텍스트 코드'], ['Excalidraw', '손그림']];
var RY0 = 300, RSTEP = 118, RH = 96;
var UX = X0, UW = 600, TX = 1000, TW = X1 - TX;
function rowY(i) { return RY0 + i * RSTEP; }
function axes(ctx, T) {
  var p0 = es(T, TL.ax, TL.ax + 0.4);
  if (p0 > 0) { ctx.save(); ctx.globalAlpha = p0; txt(ctx, '비교 4축', X0, 214, 30, 800, C.muted, 'left'); ctx.restore(); }
  var w = 250, g = 24, x0 = X0 + 170;
  for (var i = 0; i < AXES.length; i++) {
    var a = TL.ax + TL.astep * i, p = es(T, a, a + 0.4);
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    pill(ctx, AXES[i], x0 + i * (w + g) + w / 2, 214 + (1 - p) * 10, w, 54, C.blueTint, C.blue, 28, 800);
    ctx.restore();
  }
}
// 작은 그림 — 칸 (x,y,w,h), 켜짐 정도 on
function icon(ctx, k, x, y, w, h, T, on) {
  ctx.save();
  ctx.fillStyle = C.bg; rr(ctx, x, y, w, h, 10); ctx.fill();
  ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
  var i, j;
  if (k === 0) { // Diffusion — 노이즈가 단계적으로 걷혀 해·언덕 그림이 됨
    var d = es(T, TL.m0, TL.m0 + TL.mstep), cols = 10, rows = 6, cw = (w - 12) / cols, ch = (h - 12) / rows;
    for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) {
      var cx = i + 0.5, cy = j + 0.5;
      var sun = Math.hypot(cx - 7.2, cy - 1.8) < 1.3, hill = cy > 4.2 - Math.sin(cx * 0.6) * 0.8;
      var tgt = sun ? hex(C.brand) : hill ? hex(C.green) : hex(C.blueTint);
      var n = 120 + Math.floor(hash01(j * cols + i) * 120);
      var r = Math.round(lerp(n, tgt[0], d)), gg = Math.round(lerp(n, tgt[1], d)), b = Math.round(lerp(n, tgt[2], d));
      ctx.fillStyle = 'rgb(' + r + ',' + gg + ',' + b + ')';
      ctx.fillRect(x + 6 + i * cw, y + 6 + j * ch, cw - 1, ch - 1);
    }
  } else if (k === 1) { // 인포그래픽 — 막대
    var hs = [0.45, 0.8, 0.6, 0.95];
    for (i = 0; i < 4; i++) {
      var bh = (h - 20) * hs[i] * lerp(0.4, 1, on);
      ctx.fillStyle = i === 3 ? C.brand : C.blue;
      ctx.fillRect(x + 14 + i * (w - 28) / 4, y + h - 10 - bh, (w - 28) / 4 - 8, bh);
    }
  } else if (k === 2) { // Claude Design — SVG 경로와 조절점
    var P = [[0.1, 0.75], [0.35, 0.3], [0.6, 0.6], [0.9, 0.2]];
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath();
    for (i = 0; i < P.length; i++) { var px = x + P[i][0] * w, py = y + P[i][1] * h; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
    ctx.stroke();
    for (i = 0; i < P.length; i++) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + P[i][0] * w - 5, y + P[i][1] * h - 5, 10, 10); ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.strokeRect(x + P[i][0] * w - 5, y + P[i][1] * h - 5, 10, 10); }
  } else if (k === 3) { // Mermaid — 상자 → 상자
    ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    rr(ctx, x + 10, y + h / 2 - 16, 36, 32, 6); ctx.fill(); ctx.stroke();
    rr(ctx, x + w - 46, y + h / 2 - 16, 36, 32, 6); ctx.fill(); ctx.stroke();
    ctx.restore(); ctx.save();
    arrow(ctx, x + 50, y + h / 2, x + w - 50, y + h / 2, 1, C.ink, 3);
  } else { // Excalidraw — 손그림 사각형
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (var s = 0; s < 2; s++) {
      ctx.beginPath();
      for (i = 0; i <= 40; i++) {
        var u = i / 40, qx, qy, e = 3 * Math.sin(u * 23 + s * 2);
        if (u < 0.25) { qx = lerp(x + 14, x + w - 14, u * 4); qy = y + 14 + e; }
        else if (u < 0.5) { qx = x + w - 14 + e; qy = lerp(y + 14, y + h - 14, (u - 0.25) * 4); }
        else if (u < 0.75) { qx = lerp(x + w - 14, x + 14, (u - 0.5) * 4); qy = y + h - 14 + e; }
        else { qx = x + 14 + e; qy = lerp(y + h - 14, y + 14, (u - 0.75) * 4); }
        if (i) ctx.lineTo(qx, qy); else ctx.moveTo(qx, qy);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}
function rows(ctx, T) {
  for (var i = 0; i < 5; i++) {
    var y = rowY(i), m = TL.m0 + TL.mstep * i, on = es(T, m + 0.5, m + 0.9);
    var pu = es(T, TL.u0 + TL.ustep * i, TL.u0 + TL.ustep * i + 0.5);
    if (pu > 0) {
      ctx.save(); ctx.globalAlpha = pu;
      card(ctx, UX - (1 - pu) * 30, y, UW, RH, { fill: on > 0 ? C.tint : C.paper, stroke: on > 0 ? C.brand : C.line, lw: on > 0 ? 4 : 2 });
      fit(ctx, USES[i], UX + 36 - (1 - pu) * 30, y + RH / 2, 34, 800, C.ink, 'left', UW - 72);
      ctx.restore();
    }
    var pt = es(T, TL.t0 + TL.tstep * i, TL.t0 + TL.tstep * i + 0.5);
    if (pt > 0) {
      var x = TX + (1 - pt) * 30;
      ctx.save(); ctx.globalAlpha = pt;
      card(ctx, x, y, TW, RH, { fill: on > 0 ? C.tint : C.paper, stroke: on > 0 ? C.brand : C.line, lw: on > 0 ? 4 : 2 });
      icon(ctx, i, x + 14, y + 10, 128, RH - 20, T, on);
      fit(ctx, TOOLS[i][0], x + 164, y + 34, 32, 800, C.ink, 'left', TW - 190);
      fit(ctx, TOOLS[i][1], x + 164, y + 70, 24, 600, C.sub, 'left', TW - 190);
      ctx.restore();
    }
    arrow(ctx, UX + UW + 16, y + RH / 2, TX - 16, y + RH / 2, es(T, m, m + 0.6), C.brandInk, 5);
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'Part 1', 'AI 시각 자산 5종 — 용도에 맞춰 고르기', 0.2);
  axes(ctx, T);
  rows(ctx, T);
  footer(ctx, T, '본 강의는 5종 모두 1회 이상 직접 사용', TL.foot);
}
