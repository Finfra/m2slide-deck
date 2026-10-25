// scene.js — 영업·마케팅 AI 강의 모션그래픽 06-day6 (6일차 넓히기) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s06-day6.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — 영업·마케팅 6일 덱 mg 7개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: DesignRndAI(설계·R&D 덱) mg/_src/common.js — 같은 default_lec 색 체계(lec-tokens.css)라 상수를 그대로 쓴다
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1440, H = 1080;
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
  ctx.globalAlpha = ctx.globalAlpha * (o.alpha == null ? 1 : o.alpha);  // 바깥 페이드와 곱함
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
  ctx.globalAlpha = ctx.globalAlpha * (o.alpha == null ? 1 : o.alpha);
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

// ── 공통 틀: 머리(일차 칩 + 제목) · 아래 한 줄 ───────────────────────────────
function header(ctx, T, chip, title, a) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.fillStyle = C.brand;
  rr(ctx, 70, 62, 178, 62, 31);
  ctx.fill();
  txt(ctx, chip, 159, 93, 34, 800, C.ink, 'center');
  txt(ctx, title, 276, 94 + (1 - p) * 10, 52, 800, C.ink, 'left');
  ctx.fillStyle = C.brand;
  ctx.fillRect(70, 148, 1300 * p, 6);
  ctx.restore();
}
function footer(ctx, T, s, a, color) {
  var p = es(T, a, a + 0.8);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  txt(ctx, s, 720, 1010 + (1 - p) * 12, 38, 700, color || C.brandInk, 'center');
  ctx.restore();
}
function backdrop(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
}

// ── 영업·마케팅 덱 추가 도구 ────────────────────────────────────────────────
// 알약 라벨 — 가운데 정렬, 폭은 글자에 맞춰 잰다
function pill(ctx, s, cx, cy, size, fill, color, padX) {
  ctx.font = '800 ' + size + 'px ' + KR;
  var w = ctx.measureText(s).width + (padX == null ? 36 : padX) * 2, h = size * 1.75;
  ctx.fillStyle = fill;
  rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fill();
  txt(ctx, s, cx, cy + 1, size, 800, color, 'center');
  return w;
}
// 말풍선 — 아래 꼬리
function bubble(ctx, x, y, w, h, o) {
  o = o || {};
  card(ctx, x, y, w, h, { fill: o.fill || C.paper, stroke: o.stroke || C.line, lw: o.lw || 2, alpha: o.alpha, r: 24 });
  ctx.save();
  ctx.globalAlpha = ctx.globalAlpha * (o.alpha == null ? 1 : o.alpha);
  ctx.fillStyle = o.fill || C.paper;
  ctx.strokeStyle = o.stroke || C.line; ctx.lineWidth = o.lw || 2;
  var tx = o.tail == null ? x + 60 : o.tail;
  ctx.beginPath(); ctx.moveTo(tx, y + h - 2); ctx.lineTo(tx + 10, y + h + 28); ctx.lineTo(tx + 36, y + h - 2); ctx.closePath();
  ctx.fill();
  ctx.beginPath(); ctx.moveTo(tx, y + h); ctx.lineTo(tx + 10, y + h + 28); ctx.lineTo(tx + 36, y + h); ctx.stroke();
  ctx.restore();
}
// 브라우저 창 — 주소창 + 본문 영역(콜백)
function browser(ctx, x, y, w, h, url, alpha) {
  card(ctx, x, y, w, h, { fill: C.paper, alpha: alpha, r: 16 });
  ctx.save();
  ctx.globalAlpha = ctx.globalAlpha * (alpha == null ? 1 : alpha);
  ctx.fillStyle = '#F1EEE3';
  rr(ctx, x + 2, y + 2, w - 4, 54, 14); ctx.fill();
  var dots = ['#E5533C', '#F5C518', '#3E8E41'];
  for (var i = 0; i < 3; i++) { ctx.fillStyle = dots[i]; ctx.beginPath(); ctx.arc(x + 30 + i * 26, y + 29, 8, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = C.paper; rr(ctx, x + 120, y + 12, w - 150, 34, 17); ctx.fill();
  if (url) txt(ctx, url, x + 166, y + 30, 22, 600, C.sub, 'left', MONO);
  ctx.restore();
}

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

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
