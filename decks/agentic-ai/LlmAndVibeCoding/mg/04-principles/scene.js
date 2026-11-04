// scene.js — LlmAndVibeCoding 강연 모션그래픽 04-principles (바이브 코딩 3원칙) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s04-principles.js · 합성: node mg/_src/compose.js
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

// 장면 ⑤ — 바이브 코딩 3원칙 (원고 근거: 03-vibecoding-concept «바이브 코딩의 핵심 원칙» ×3 · «철학»)
var NAME = 'mg-04-principles', DUR = 18;
var TL = { c1: 1.0, how: 1.8, what: 2.6, bad: 3.6, good: 4.4, c2: 5.4, n0: 6.0, run: 7.8, lap: 2.4, laps: 2, cap2: 8.4, c3: 9.4, fold: 10.0, chk: 10.8, foot: 14.6 };
var KW = 460, KGAP = (CW - KW * 3) / 2, KY = 190, KH = 760;
function kx(i) { return X0 + i * (KW + KGAP); }
function head(ctx, T, i, a, en, ko) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return 0;
  var x = kx(i);
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, KY + (1 - p) * 30, KW, KH, {});
  pill(ctx, String(i + 1), x + 52, KY + 56, 56, 56, C.brand, C.ink, 30, 800);
  fit(ctx, en, x + 96, KY + 56, 32, 800, C.ink, 'left', KW - 120);
  txt(ctx, ko, x + 28, KY + 122, 25, 700, C.sub, 'left');
  ctx.fillStyle = C.line; ctx.fillRect(x + 28, KY + 158, KW - 56, 2);
  ctx.restore();
  return p;
}
function intent(ctx, T) {
  if (!head(ctx, T, 0, TL.c1, 'Intent-First', '의도 우선 프로그래밍')) return;
  var x = kx(0) + 28, w = KW - 56, p;
  p = es(T, TL.how, TL.how + 0.5);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, '전통적 개발', x, KY + 205, 22, 700, C.muted, 'left');
    fit(ctx, '"어떻게(How)" 구현할지 고민', x, KY + 245, 27, 700, C.sub, 'left', w);
    var s = es(T, TL.what, TL.what + 0.5);
    if (s > 0) { ctx.fillStyle = C.red; ctx.fillRect(x, KY + 244, Math.min(w, ctx.measureText('"어떻게(How)" 구현할지 고민').width) * s, 4); }
    ctx.restore();
  }
  p = es(T, TL.what, TL.what + 0.5);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, '바이브 코딩', x, KY + 305, 22, 700, C.muted, 'left');
    fit(ctx, '"무엇을(What)" 만들지만 설명', x, KY + 345, 29, 800, C.ink, 'left', w);
    ctx.restore();
  }
  p = es(T, TL.bad, TL.bad + 0.5);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, KY + 400, w, 130, { fill: C.redTint, stroke: C.red, shadow: 0, r: 14 });
    crossmark(ctx, x + 34, KY + 440, 18, p, C.red);
    fit(ctx, '"useState를 사용해서', x + 64, KY + 440, 25, 600, C.ink, 'left', w - 80, MONO);
    fit(ctx, ' counter 변수를 만들고..."', x + 64, KY + 488, 25, 600, C.ink, 'left', w - 80, MONO);
    ctx.restore();
  }
  p = es(T, TL.good, TL.good + 0.5);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, KY + 556, w, 130, { fill: C.greenTint, stroke: C.green, shadow: 0, r: 14 });
    stamp(ctx, x + 34, KY + 596, 18, p, C.green);
    fit(ctx, '"카운터 기능이 있는', x + 64, KY + 596, 27, 800, C.ink, 'left', w - 80);
    fit(ctx, ' 컴포넌트 만들어줘"', x + 64, KY + 644, 27, 800, C.ink, 'left', w - 80);
    ctx.restore();
  }
}
var LOOP = ['AI 코드 생성', '개발자 검토', '승인/수정', '다음 단계'];
function loopXY(k) { // 사각 고리의 네 모서리 — 위 왼, 위 오, 아래 오, 아래 왼
  var cx = kx(1) + KW / 2, cy = KY + 410, dx = 110, dy = 150;
  return [[cx - dx, cy - dy], [cx + dx, cy - dy], [cx + dx, cy + dy], [cx - dx, cy + dy]][k];
}
function human(ctx, T) {
  if (!head(ctx, T, 1, TL.c2, 'Human-in-the-Loop', '인간 검증 루프')) return;
  var k, p;
  // 고리 선 + 도는 점
  p = es(T, TL.n0, TL.n0 + 1.6);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    ctx.strokeStyle = C.line; ctx.lineWidth = 8;
    ctx.beginPath();
    for (k = 0; k < 5; k++) { var q = loopXY(k % 4); if (k === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]); }
    ctx.stroke();
    ctx.restore();
  }
  if (T >= TL.run) {
    var u = (T - TL.run) / TL.lap;
    u = u >= TL.laps ? 0 : u - Math.floor(u);
    var pts = [loopXY(0), loopXY(1), loopXY(2), loopXY(3), loopXY(0)];
    var d = along(pts, u);
    dot(ctx, d[0], d[1], 13, C.brandInk);
  }
  for (k = 0; k < 4; k++) {
    var a = TL.n0 + 0.4 * k;
    p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var xy = loopXY(k), dev = k === 1 || k === 2;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, xy[0] - 92, xy[1] - 38, 184, 76, { fill: dev ? C.tint : C.greenTint, stroke: dev ? C.brand : C.green, lw: 3, r: 14 });
    fit(ctx, LOOP[k], xy[0], xy[1] + 1, 25, 800, C.ink, 'center', 160);
    ctx.restore();
  }
  p = es(T, TL.cap2, TL.cap2 + 0.6);
  if (p > 0) {
    var x = kx(1) + 28;
    ctx.save(); ctx.globalAlpha = p;
    pill(ctx, 'AI', x + 40, KY + 640, 70, 40, C.green, '#FFFFFF', 22, 800);
    fit(ctx, '빠르게 구현', x + 90, KY + 640, 27, 700, C.ink, 'left', KW - 150);
    pill(ctx, '개발자', x + 40, KY + 694, 70, 40, C.brand, C.ink, 18, 800);
    fit(ctx, '품질 검증', x + 90, KY + 694, 27, 700, C.ink, 'left', KW - 150);
    ctx.restore();
  }
}
var CHK = ['기존 코드 스타일 학습', '파일 간 의존성 파악', '프로젝트 규칙 준수'];
function context(ctx, T) {
  if (!head(ctx, T, 2, TL.c3, 'Context-Aware', '컨텍스트 인식 개발')) return;
  var x = kx(2), cx = x + KW / 2, p = es(T, TL.fold, TL.fold + 0.6);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    // 프로젝트 폴더 + 문서들
    ctx.fillStyle = C.tint; ctx.strokeStyle = C.brand; ctx.lineWidth = 3;
    rr(ctx, cx - 170, KY + 210, 120, 40, 10); ctx.fill(); ctx.stroke();
    rr(ctx, cx - 170, KY + 230, 340, 190, 16); ctx.fill(); ctx.stroke();
    for (var j = 0; j < 4; j++) {
      var q = es(T, TL.fold + 0.2 + 0.15 * j, TL.fold + 0.6 + 0.15 * j);
      if (q > 0) doc(ctx, cx - 140 + j * 72, KY + 262 + (1 - q) * 14, 64, 84, { rows: 3, alpha: q });
    }
    fit(ctx, '프로젝트 전체를 이해', cx, KY + 386, 25, 800, C.brandInk, 'center', 300);
    ctx.restore();
  }
  for (var i = 0; i < 3; i++) {
    var a = TL.chk + 0.6 * i, pc = es(T, a, a + 0.5);
    if (pc <= 0) continue;
    var y = KY + 490 + i * 76;
    ctx.save(); ctx.globalAlpha = pc;
    stamp(ctx, x + 52, y, 20, pc, C.green);
    fit(ctx, CHK[i], x + 88, y, 28, 700, C.ink, 'left', KW - 116);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '3장', '바이브 코딩의 핵심 원칙 3가지', 0.2);
  intent(ctx, T);
  human(ctx, T);
  context(ctx, T);
  footer(ctx, T, '개발자는 창조자, AI는 실행자', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
