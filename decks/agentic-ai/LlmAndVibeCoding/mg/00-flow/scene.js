// scene.js — LlmAndVibeCoding 강연 모션그래픽 00-flow (강연 흐름 8장) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s00-flow.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — LlmAndVibeCoding 덱 mg 7개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 default_lec 색 체계 · 3:2(1620×1080) 판형. 카드 점선(o.dash) 추가
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1620, H = 1080;
var X0 = 70, X1 = W - 70, CW = X1 - X0; // 본문 좌우 여백 70 — 본문 폭 1480
var C = {
  bg: '#FFFDF6', ink: '#222222', sub: '#4A4A44', muted: '#8A877A', line: '#E3DFD0', paper: '#FFFFFF',
  brand: '#F5C518', brandInk: '#7A6000', tint: '#FFF6D5',
  blue: '#0365C0', blueTint: '#EAF2FB', purple: '#6B3FA0', purpleTint: '#F1EAF8', red: '#C82506', redTint: '#FDECE8', green: '#1F7A4D', greenTint: '#E4F3EA',
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
  if (o.dash) ctx.setLineDash(o.dash);
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

// 선 위를 따라가는 점의 위치 — pts: [[x,y],…], u: 0~1 (길이 비례)
function along(pts, u) {
  var L = [], tot = 0, i;
  for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  var r = clamp(u, 0, 1) * tot;
  for (i = 0; i < L.length; i++) {
    if (r <= L[i] || i === L.length - 1) { var q = L[i] ? clamp(r / L[i], 0, 1) : 0; return [lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)]; }
    r -= L[i];
  }
  return pts[pts.length - 1];
}
function dot(ctx, x, y, r, color) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

// 장면 ① — 강연 흐름 8장 (원고 근거: AGENDA.md 목차 · 08-qa-closing «마무리»)
var NAME = 'mg-00-flow', DUR = 15;
var TL = { c0: 1.0, step: 0.65, gen: 7.4, ref: 9.0, goal: 10.4, foot: 12.0 };
var CH = [
  ['1', 'AI 코딩의 패러다임 전환', 'Code-First → Intent-First'],
  ['2', 'LLM 코딩 툴의 진화', '채팅 → IDE → CLI'],
  ['3', '바이브 코딩 개념과 철학', '채팅의 한계 · 바이브 코딩의 시작'],
  ['4', '바이브 코딩 세대 구분', '1세대 IDE · 2세대 CLI'],
  ['5', '세대별 비교 · 선택 가이드', '비교표 · 의사결정 트리'],
  ['6', '실전 사례', '세대별 활용법'],
  ['7', '도입 로드맵', '평가 → 시작 → 숙련 → 고급'],
  ['8', 'Q&A 및 클로징', '자주 묻는 질문 · 마무리'],
];
var CWD = 320, CHT = 190, CGAP = (CW - CWD * 4) / 3;
function pos(i) { // 뱀 모양 — 윗줄 1~4 왼→오, 아랫줄 5~8 오→왼
  var row = i < 4 ? 0 : 1, col = row === 0 ? i : 7 - i;
  return [X0 + col * (CWD + CGAP), row === 0 ? 260 : 620];
}
function chapter(ctx, T, i) {
  var a = TL.c0 + TL.step * i, p = es(T, a, a + 0.6);
  if (p <= 0) return;
  var xy = pos(i), x = xy[0], y = xy[1] + (1 - p) * 30, ref = i === 5 || i === 6;
  var g = (i === 1 || i === 3) ? es(T, TL.gen, TL.gen + 0.6) : 0;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, y, CWD, CHT, { fill: g > 0 ? C.tint : C.paper, stroke: g > 0 ? C.brand : (ref ? C.muted : C.line), lw: g > 0 ? 2 + 3 * g : 2, dash: ref ? [10, 8] : null });
  pill(ctx, CH[i][0], x + 44, y + 46, 52, 52, ref ? C.line : C.brand, C.ink, 28, 800);
  if (ref) {
    var pr = es(T, TL.ref, TL.ref + 0.5);
    if (pr > 0) { ctx.globalAlpha = p * pr; pill(ctx, '참고', x + CWD - 64, y + 46, 88, 40, C.line, C.sub, 22, 800); ctx.globalAlpha = p; }
  }
  fit(ctx, CH[i][1], x + 24, y + 108, 30, 800, C.ink, 'left', CWD - 48);
  fit(ctx, CH[i][2], x + 24, y + 152, 23, 600, C.sub, 'left', CWD - 48);
  ctx.restore();
}
function links(ctx, T) {
  for (var i = 0; i < 7; i++) {
    var a = TL.c0 + TL.step * (i + 1), p = es(T, a - 0.2, a + 0.3);
    if (p <= 0) continue;
    var s = pos(i), e = pos(i + 1), my;
    if (i === 3) { // 윗줄 끝 → 아랫줄 첫 칸 (아래로)
      arrow(ctx, s[0] + CWD / 2, s[1] + CHT + 12, e[0] + CWD / 2, e[1] - 14, p, C.muted, 5);
    } else if (i < 3) {
      my = s[1] + CHT / 2;
      arrow(ctx, s[0] + CWD + 8, my, e[0] - 10, my, p, C.muted, 5);
    } else {
      my = s[1] + CHT / 2;
      arrow(ctx, s[0] - 8, my, e[0] + CWD + 10, my, p, C.muted, 5);
    }
  }
}
function genBand(ctx, T) {
  var p = es(T, TL.gen, TL.gen + 0.8);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  var x = pos(1)[0], y = 498;
  pill(ctx, '0세대 채팅 → 1세대 IDE → 2세대 CLI', x + (pos(3)[0] + CWD - x) / 2, y, 620 * p + 40, 56, C.ink, '#FFFFFF', 27, 800);
  ctx.restore();
}
function goal(ctx, T) {
  var p = es(T, TL.goal, TL.goal + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  txt(ctx, '핵심: 올바른 도구 선택 · 점진적인 학습 · 지속적인 검증 · 팀과의 협력', W / 2, 890 + (1 - p) * 10, 28, 700, C.sub, 'center');
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '흐름', 'LLM 툴 진화와 바이브 코딩 — 8장 구성', 0.2);
  links(ctx, T);
  for (var i = 0; i < 8; i++) chapter(ctx, T, i);
  genBand(ctx, T);
  goal(ctx, T);
  footer(ctx, T, '바이브 코딩은 도구 사용법이 아니라 개발 방식의 근본적인 변화', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
