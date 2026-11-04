// scene.js — GenContentProd 강의 모션그래픽 02-visual5 (AI 시각 자산 5종) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s02-visual5.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — GenContentProd 덱 mg 6개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 default_lec 색 체계 · 같은 판형 3:2(1620×1080)
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1620, H = 1080;
var X0 = 70, X1 = W - 70, CW = X1 - X0; // 본문 좌우 여백 70 — 본문 폭 1480
var C = {
  bg: '#FFFDF6', ink: '#222222', sub: '#4A4A44', muted: '#8A877A', line: '#E3DFD0', paper: '#FFFFFF',
  brand: '#F5C518', brandInk: '#7A6000', tint: '#FFF6D5',
  blue: '#0365C0', blueTint: '#EAF2FB', red: '#C82506', redTint: '#FDECE8', green: '#1F7A4D', greenTint: '#E4F3EA',
};
var KR = '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
var MONO = 'Menlo, "SF Mono", monospace';

// ── 수학 ──────────────────────────────────────────────────────────────────
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function seg(T, a, b) { return clamp((T - a) / (b - a), 0, 1); }
function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
function es(T, a, b) { return ease(seg(T, a, b)); }
function lerp(a, b, p) { return a + (b - a) * p; }
function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
function rgba(c, a) { var x = hex(c); return 'rgba(' + x[0] + ',' + x[1] + ',' + x[2] + ',' + a + ')'; }

// ── 도형 ──────────────────────────────────────────────────────────────────
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
// 카드 — o: {fill, stroke, lw, r, alpha, shadow}
function card(ctx, x, y, w, h, o) {
  o = o || {};
  ctx.save();
  ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha);
  if (o.shadow !== 0) {
    ctx.shadowColor = 'rgba(60,50,10,0.13)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 8;
  }
  ctx.fillStyle = o.fill || C.paper;
  rr(ctx, x, y, w, h, o.r == null ? 20 : o.r);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = o.stroke || C.line;
  ctx.lineWidth = o.lw || 2;
  ctx.stroke();
  ctx.restore();
}
// 글자 — size px, weight, color, align(left|center|right), 기준선 middle
function txt(ctx, s, x, y, size, weight, color, align, font) {
  ctx.font = weight + ' ' + size + 'px ' + (font || KR);
  ctx.fillStyle = color;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}
// 칸 폭 maxW 를 넘으면 글자 크기를 줄여 맞춘다 — 글꼴이 바뀌어도 잘리지 않게
function fit(ctx, s, x, y, size, weight, color, align, maxW, font) {
  ctx.font = weight + ' ' + size + 'px ' + (font || KR);
  var w = ctx.measureText(s).width;
  if (maxW && w > maxW) size = Math.floor(size * maxW / w);
  txt(ctx, s, x, y, size, weight, color, align, font);
}
function lines(ctx, arr, x, y, step, size, weight, color, align) {
  for (var i = 0; i < arr.length; i++) txt(ctx, arr[i], x, y + i * step, size, weight, color, align);
}
// 화살표 — 시작점에서 p(0~1) 만큼 그려진다
function arrow(ctx, x1, y1, x2, y2, p, color, lw) {
  if (p <= 0) return;
  var x = lerp(x1, x2, p), y = lerp(y1, y2, p), a = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw || 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke();
  if (p > 0.85) {
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 22 * Math.cos(a - 0.45), y2 - 22 * Math.sin(a - 0.45));
    ctx.lineTo(x2 - 22 * Math.cos(a + 0.45), y2 - 22 * Math.sin(a + 0.45));
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
// 검증 도장 — ✓ (색 원 + 체크)
function stamp(ctx, cx, cy, r, p, color) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 1.6);
  var s = lerp(1.5, 1, p);
  ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.42, 0); ctx.lineTo(-r * 0.1, r * 0.34); ctx.lineTo(r * 0.45, -r * 0.34); ctx.stroke();
  ctx.restore();
}
function crossmark(ctx, cx, cy, r, p, color) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 1.6);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - r * 0.36, cy - r * 0.36); ctx.lineTo(cx + r * 0.36, cy + r * 0.36);
  ctx.moveTo(cx + r * 0.36, cy - r * 0.36); ctx.lineTo(cx - r * 0.36, cy + r * 0.36); ctx.stroke();
  ctx.restore();
}
// 문서 아이콘 — 접힌 모서리 + 본문 줄
function doc(ctx, x, y, w, h, o) {
  o = o || {};
  var f = Math.min(w, h) * 0.22;
  ctx.save();
  ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha);
  ctx.shadowColor = 'rgba(60,50,10,0.13)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
  ctx.fillStyle = o.fill || C.paper;
  ctx.beginPath();
  ctx.moveTo(x + 10, y); ctx.lineTo(x + w - f, y); ctx.lineTo(x + w, y + f); ctx.lineTo(x + w, y + h - 10);
  ctx.arcTo(x + w, y + h, x + w - 10, y + h, 10); ctx.lineTo(x + 10, y + h); ctx.arcTo(x, y + h, x, y + h - 10, 10);
  ctx.lineTo(x, y + 10); ctx.arcTo(x, y, x + 10, y, 10); ctx.closePath(); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = o.stroke || C.line; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = C.line;
  ctx.beginPath(); ctx.moveTo(x + w - f, y); ctx.lineTo(x + w - f, y + f); ctx.lineTo(x + w, y + f); ctx.closePath(); ctx.fill();
  var n = o.rows == null ? 4 : o.rows;
  for (var i = 0; i < n; i++) ctx.fillRect(x + 18, y + f + 18 + i * 20, (w - 36) * (i === n - 1 ? 0.55 : 1), 7);
  ctx.restore();
}

// 둥근 알약 꼬리표 — 가운데 정렬 글자
function pill(ctx, s, cx, cy, w, h, fill, color, size, weight) {
  ctx.fillStyle = fill;
  rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fill();
  fit(ctx, s, cx, cy + 1, size, weight || 800, color, 'center', w - 24);
}

// ── 공통 틀: 머리(칩 + 제목) · 아래 한 줄 ────────────────────────────────────
function header(ctx, T, chip, title, a) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  pill(ctx, chip, X0 + 100, 93, 200, 62, C.brand, C.ink, 34, 800);
  fit(ctx, title, X0 + 228, 94 + (1 - p) * 10, 52, 800, C.ink, 'left', X1 - X0 - 228);
  ctx.fillStyle = C.brand;
  ctx.fillRect(X0, 148, CW * p, 6);
  ctx.restore();
}
function footer(ctx, T, s, a, color) {
  var p = es(T, a, a + 0.8);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  fit(ctx, s, W / 2, 1010 + (1 - p) * 12, 38, 700, color || C.brandInk, 'center', CW);
  ctx.restore();
}
function backdrop(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
}

// ── GenContentProd 추가 도구 ────────────────────────────────────────────────
// 결정론 의사난수 — 정수 i 에 대해 항상 같은 0~1 값 (Math.random 대신)
function hash01(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
// 꺾쇠 화살표 경로 — 점 배열을 따라 p(0~1) 만큼 그린다 (끝에 화살촉)
function polyArrow(ctx, pts, p, color, lw) {
  if (p <= 0) return;
  var L = [], tot = 0, i;
  for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  var want = tot * p;
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw || 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  var ex = pts[0][0], ey = pts[0][1], ang = 0;
  for (i = 1; i < pts.length && want > 0; i++) {
    var q = Math.min(1, want / L[i - 1]);
    ex = lerp(pts[i - 1][0], pts[i][0], q); ey = lerp(pts[i - 1][1], pts[i][1], q);
    ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
    ctx.lineTo(ex, ey); want -= L[i - 1];
  }
  ctx.stroke();
  if (p > 0.95) {
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 20 * Math.cos(ang - 0.45), ey - 20 * Math.sin(ang - 0.45));
    ctx.lineTo(ex - 20 * Math.cos(ang + 0.45), ey - 20 * Math.sin(ang + 0.45));
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

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

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
