// scene.js — 영업·마케팅 AI 강의 모션그래픽 01-day1 (1일차 묻기) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s01-day1.js · 합성: node mg/_src/compose.js
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

// 장면 ② — 1일차 묻기 (원고 근거: 1-2 «1줄 프롬프트와 6요소 프롬프트» · «프롬프트 6요소 — 페르소나·맥락·예시·형식·톤·과제»
//          · 1-3 «맥락 카드 — 제품·고객·시장 각 5줄» · P1-2-1 «맥락 카드 없이 묻고 붙여서 다시 묻기»)
var NAME = 'mg-01-day1', DUR = 16;
var TL = { ask: 0.8, ans1: 1.8, miss: 3.6, six: 5.0, cardIn: 8.0, fly: 10.0, ans2: 11.4, stamp: 13.0, foot: 13.8 };
var SIX = ['페르소나', '맥락', '예시', '형식', '톤', '과제'];
var L = { x: 70, w: 600 }, R = { x: 740, w: 630 };
function chipPos(i) { return { x: R.x + (i % 2) * 320, y: 210 + Math.floor(i / 2) * 100 }; }
function drawAsk(ctx, T) {
  var p = es(T, TL.ask, TL.ask + 0.6);
  if (p <= 0) return;
  var full = es(T, TL.fly + 0.6, TL.fly + 1.2);
  ctx.save(); ctx.globalAlpha = p;
  bubble(ctx, L.x, 200, L.w, 120, { fill: full > 0 ? C.tint : C.paper, stroke: full > 0 ? C.brand : C.line, lw: full > 0 ? 4 : 2 });
  ctx.globalAlpha = p * (1 - full);
  txt(ctx, '«소개 메일 써 줘»', L.x + 40, 260, 40, 800, C.ink, 'left');
  ctx.globalAlpha = p * full;
  txt(ctx, '6요소 + 맥락 카드', L.x + 40, 244, 38, 800, C.ink, 'left');
  txt(ctx, '페르소나 · 맥락 · 예시 · 형식 · 톤 · 과제', L.x + 40, 290, 25, 600, C.brandInk, 'left');
  ctx.restore();
}
function drawAnswer(ctx, T) {
  var p = es(T, TL.ans1, TL.ans1 + 0.6);
  if (p <= 0) return;
  var sw = es(T, TL.ans2, TL.ans2 + 0.8);
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, L.x, 380, L.w, 470, {});
  txt(ctx, 'AI 의 답', L.x + 40, 428, 28, 700, C.muted, 'left');
  // 1줄 프롬프트의 답 — 누구에게나 보낼 수 있는 문장
  ctx.globalAlpha = p * (1 - sw);
  var G = ['안녕하세요, 귀사의 발전을 기원합니다.', '저희는 우수한 품질의 제품을…', '많은 관심 부탁드립니다.'];
  for (var i = 0; i < G.length; i++) txt(ctx, G[i], L.x + 40, 500 + i * 62, 30, 500, C.sub, 'left');
  var m = es(T, TL.miss, TL.miss + 0.6);
  if (m > 0) {
    ctx.globalAlpha = p * (1 - sw) * m;
    txt(ctx, '누구에게? 무엇을? 왜?', L.x + L.w / 2, 740, 36, 800, C.red, 'center');
    crossmark(ctx, L.x + L.w - 70, 428, 26, m, C.red);
  }
  // 6요소 + 맥락 카드의 답 — 우리 회사만 쓸 수 있는 문장
  ctx.globalAlpha = p * sw;
  var S = [['건설기계 제조사 구매팀께', '고객'], ['상담에서 들은 불만부터', '문제'], ['DG-DB 시리즈 사양 · 급유', '제품'], ['없는 것은 «카드에 없음»', '검증']];
  for (var k = 0; k < S.length; k++) {
    var q = es(T, TL.ans2 + 0.3 * k, TL.ans2 + 0.3 * k + 0.5), y = 494 + k * 78;
    ctx.globalAlpha = p * sw * q;
    card(ctx, L.x + 30, y - 30, L.w - 60, 62, { fill: C.tint, stroke: 'transparent', shadow: 0, r: 12 });
    txt(ctx, S[k][0], L.x + 54, y + 1, 30, 700, C.ink, 'left');
    txt(ctx, S[k][1], L.x + L.w - 54, y + 1, 24, 700, C.brandInk, 'right');
  }
  ctx.restore();
  stamp(ctx, L.x + L.w - 70, 428, 26, es(T, TL.stamp, TL.stamp + 0.5), C.green);
}
function drawSix(ctx, T) {
  var lbl = es(T, TL.six - 0.3, TL.six + 0.3);
  if (lbl > 0) { ctx.save(); ctx.globalAlpha = lbl; txt(ctx, '프롬프트 6요소', R.x, 178, 28, 700, C.muted, 'left'); ctx.restore(); }
  for (var i = 0; i < 6; i++) {
    var a = TL.six + 0.35 * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var c = chipPos(i), x = c.x, y = c.y, w = 300, h = 80;
    ctx.save();
    ctx.globalAlpha = p;
    var hot = (i === 1 && T >= TL.cardIn) || es(T, TL.fly + 0.12 * i, TL.fly + 0.12 * i + 0.3) > 0.5;
    card(ctx, x, y, w, h, { fill: hot ? C.brand : C.paper, stroke: C.brand, lw: 3, r: 18, shadow: 0 });
    ctx.fillStyle = hot ? C.paper : C.brand;
    ctx.beginPath(); ctx.arc(x + 42, y + h / 2, 22, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), x + 42, y + h / 2 + 1, 26, 800, C.ink, 'center');
    txt(ctx, SIX[i], x + 80, y + h / 2 + 1, 32, 800, C.ink, 'left');
    ctx.restore();
  }
}
function drawContext(ctx, T) {
  var p = es(T, TL.cardIn, TL.cardIn + 0.7);
  if (p <= 0) return;
  var x = R.x, y = 540, w = R.w, h = 310;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, y + (1 - p) * 30, w, h, { fill: C.paper, stroke: C.brand, lw: 3 });
  txt(ctx, '맥락 카드 — 각 5줄', x + 32, y + 46, 30, 800, C.brandInk, 'left');
  var COL = ['제품', '고객', '시장'];
  for (var c = 0; c < 3; c++) {
    var cx = x + 32 + c * 200;
    ctx.fillStyle = C.tint; rr(ctx, cx, y + 80, 176, 48, 12); ctx.fill();
    txt(ctx, COL[c], cx + 88, y + 105, 28, 800, C.ink, 'center');
    for (var k = 0; k < 5; k++) {
      var q = es(T, TL.cardIn + 0.4 + 0.1 * (c * 5 + k), TL.cardIn + 0.7 + 0.1 * (c * 5 + k));
      ctx.fillStyle = C.line;
      ctx.fillRect(cx + 8, y + 150 + k * 30, (160 - (k % 2) * 40) * q, 10);
    }
  }
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '1일차', '묻기 — 한 줄 질문이 고유한 답으로', 0.2);
  drawAsk(ctx, T);
  drawAnswer(ctx, T);
  drawSix(ctx, T);
  drawContext(ctx, T);
  arrow(ctx, R.x - 20, 300, L.x + L.w + 18, 270, es(T, TL.fly - 0.3, TL.fly + 0.3), C.brandInk, 5);
  footer(ctx, T, '맥락을 붙이면 답이 우리 회사 것이 됨', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
