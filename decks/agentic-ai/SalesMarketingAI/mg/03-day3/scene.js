// scene.js — 영업·마케팅 AI 강의 모션그래픽 03-day3 (3일차 제안하기) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s03-day3.js · 합성: node mg/_src/compose.js
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

// 장면 ④ — 3일차 제안하기 (원고 근거: 3-0 timeline «뽑기·쓰기·입히기·답하기·줄이기»
//          · 받는 파일 → 만드는 파일: 상담 메모 3건 → 페인포인트표.md → 제안서.md → 제안서.docx
//          · P3-0-1 규칙 «레퍼런스·가격·납기 숫자는 지어내지 말고 [담당자 입력]» · 고객 한솔건기(가상))
var NAME = 'mg-03-day3', DUR = 18;
var TS = [1.6, 4.4, 7.2, 10.0, 12.8];  // 다섯 단계 시작 시각
var TL = { bar: 0.6, s1: TS[0], s2: TS[1], s3: TS[2], s4: TS[3], s5: TS[4], foot: 15.8 };
var ST = [['뽑기', '페인포인트표'], ['쓰기', '제안서 초안'], ['입히기', '.docx 양식'], ['답하기', '견적 메일'], ['줄이기', '한 장 요약']];
var P = { x: 70, y: 380, w: 1300, h: 540 };
function cur(T) { var c = -1; for (var i = 0; i < 5; i++) if (T >= TS[i]) c = i; return c; }
function vis(T, i) {
  var a = es(T, TS[i], TS[i] + 0.6);
  return i < 4 ? a * (1 - es(T, TS[i + 1] - 0.4, TS[i + 1] + 0.1)) : a;
}
function bar(ctx, T) {
  var c = cur(T);
  for (var i = 0; i < 5; i++) {
    var a = TL.bar + 0.2 * i, p = es(T, a, a + 0.5), x = 70 + i * 265;
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    var on = i === c, done = i < c;
    card(ctx, x, 196, 240, 130, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 4 : 2, shadow: on ? 1 : 0 });
    txt(ctx, ST[i][0], x + 120, 244, 36, 800, done ? C.muted : C.ink, 'center');
    txt(ctx, ST[i][1], x + 120, 294, 24, 600, on ? C.brandInk : C.muted, 'center');
    ctx.restore();
    if (done) stamp(ctx, x + 214, 220, 16, 1, C.green);
    if (i < 4) arrow(ctx, x + 243, 261, x + 263, 261, p, C.line, 4);
  }
}
function panel(ctx, a) { card(ctx, P.x, P.y, P.w, P.h, { alpha: a }); }
function s1(ctx, T) {
  var a = vis(T, 0); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; panel(ctx, 1);
  for (var i = 0; i < 3; i++) {
    doc(ctx, 110 + i * 70, 440 + i * 26, 190, 250, { rows: 6 });
  }
  txt(ctx, '상담 메모 3건', 255, 790, 30, 700, C.ink, 'center');
  arrow(ctx, 470, 580, 560, 580, es(T, TS[0] + 0.6, TS[0] + 1.2), C.brandInk, 5);
  var R = [['페인포인트', '근거'], ['납기가 두 번 밀림', '메모 1'], ['견적 회신이 사흘 넘음', '메모 2'], ['양식 요청 — 다음 주', '메모 3']];
  for (var k = 0; k < R.length; k++) {
    var q = es(T, TS[0] + 0.9 + 0.35 * k, TS[0] + 1.3 + 0.35 * k), y = 460 + k * 92;
    ctx.globalAlpha = a * q;
    if (k === 0) { ctx.fillStyle = C.brand; rr(ctx, 590, y - 34, 740, 68, 12); ctx.fill(); }
    else { ctx.fillStyle = C.line; ctx.fillRect(600, y + 44, 720, 2); }
    txt(ctx, R[k][0], 620, y, 31, k === 0 ? 800 : 700, C.ink, 'left');
    txt(ctx, R[k][1], 1300, y, 28, 700, k === 0 ? C.ink : C.blue, 'right');
  }
  ctx.restore();
}
function s2(ctx, T) {
  var a = vis(T, 1); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; panel(ctx, 1);
  txt(ctx, '제안서.md', 110, 432, 30, 800, C.brandInk, 'left');
  var R = [['배경', '납기·회신 지연이 반복됨', 0], ['솔루션', '차별점 — 표의 근거에서 이음', 0], ['레퍼런스', '[담당자 입력]', 1], ['가격', '[담당자 입력]', 1]];
  for (var k = 0; k < R.length; k++) {
    var q = es(T, TS[1] + 0.4 + 0.4 * k, TS[1] + 0.9 + 0.4 * k), y = 510 + k * 96;
    ctx.globalAlpha = a * q;
    card(ctx, 110, y - 38, 1220, 78, { fill: R[k][2] ? C.redTint : C.tint, stroke: 'transparent', shadow: 0, r: 14 });
    txt(ctx, R[k][0], 140, y + 1, 32, 800, C.ink, 'left');
    txt(ctx, R[k][1], 380, y + 1, 31, R[k][2] ? 800 : 600, R[k][2] ? C.red : C.sub, 'left');
  }
  ctx.globalAlpha = a * es(T, TS[1] + 2.0, TS[1] + 2.5);
  txt(ctx, '숫자는 지어내지 않음', 1300, 432, 28, 800, C.red, 'right');
  ctx.restore();
}
function s3(ctx, T) {
  var a = vis(T, 2); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; panel(ctx, 1);
  doc(ctx, 160, 450, 260, 340, { rows: 9 });
  txt(ctx, '제안서.md', 290, 830, 30, 700, C.ink, 'center');
  var m = es(T, TS[2] + 0.5, TS[2] + 1.3);
  arrow(ctx, 460, 620, 560, 620, m, C.brandInk, 5);
  pill(ctx, 'pandoc', 680, 620, 32, C.ink, C.paper, 30);
  arrow(ctx, 800, 620, 900, 620, es(T, TS[2] + 1.1, TS[2] + 1.7), C.brandInk, 5);
  var d = es(T, TS[2] + 1.4, TS[2] + 2.0);
  ctx.globalAlpha = a * d;
  doc(ctx, 950, 450, 260, 340, { rows: 7 });
  ctx.fillStyle = C.blue; ctx.fillRect(952, 452 + 56, 256, 40);
  txt(ctx, '회사 양식', 1080, 528, 24, 800, C.paper, 'center');
  txt(ctx, '제안서.docx', 1080, 830, 30, 800, C.blue, 'center');
  ctx.restore();
}
function s4(ctx, T) {
  var a = vis(T, 3); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; panel(ctx, 1);
  var M = [['정중하게', ['한솔건기 구매팀 담당자님께', '견적 회신이 늦어 송구합니다.', '양식은 다음 주에 보내 드립니다.']],
           ['간결하게', ['견적 회신드립니다.', '양식 — 다음 주 송부', '납기 — [담당자 입력]']]];
  for (var i = 0; i < 2; i++) {
    var q = es(T, TS[3] + 0.3 + 0.6 * i, TS[3] + 0.9 + 0.6 * i), x = 110 + i * 620;
    ctx.globalAlpha = a * q;
    card(ctx, x, 420 + (1 - q) * 30, 580, 460, { fill: C.paper, stroke: C.brand, lw: 3 });
    pill(ctx, '어조 ' + (i + 1) + ' — ' + M[i][0], x + 180, 476, 26, C.tint, C.brandInk, 22);
    lines(ctx, M[i][1], x + 40, 580, 76, 30, 600, C.ink, 'left');
  }
  ctx.restore();
}
function s5(ctx, T) {
  var a = vis(T, 4); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; panel(ctx, 1);
  var w = lerp(1100, 560, es(T, TS[4] + 0.4, TS[4] + 1.4)), x = 720 - w / 2;
  card(ctx, x, 420, w, 460, { fill: C.paper, stroke: C.brand, lw: 4 });
  ctx.fillStyle = C.brand; rr(ctx, x + 20, 440, w - 40, 70, 14); ctx.fill();
  txt(ctx, '한 장 요약', 720, 476, 34, 800, C.ink, 'center');
  var K = ['문제 — 납기·회신 지연', '제안 — 차별점 한 줄', '다음 — 견적 양식 송부'];
  for (var k = 0; k < 3; k++) {
    var q = es(T, TS[4] + 1.2 + 0.4 * k, TS[4] + 1.6 + 0.4 * k);
    ctx.globalAlpha = a * q;
    txt(ctx, K[k], 720, 580 + k * 90, 32, 700, C.ink, 'center');
  }
  ctx.globalAlpha = a * es(T, TS[4] + 2.4, TS[4] + 2.9);
  txt(ctx, '의사결정자가 1분에 읽음', 720, 846, 28, 800, C.brandInk, 'center');
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '3일차', '제안하기 — 상담 메모가 제안서 한 벌로', 0.2);
  bar(ctx, T);
  s1(ctx, T); s2(ctx, T); s3(ctx, T); s4(ctx, T); s5(ctx, T);
  footer(ctx, T, '근거가 있는 문장만 제안서에 들어감', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
