// scene.js — GenContentProd 강의 모션그래픽 05-p2p (Prompt-to-Publish 미니 프로젝트) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s05-p2p.js · 합성: node mg/_src/compose.js
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

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
