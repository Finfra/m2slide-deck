// scene.js — 영업·마케팅 AI 강의 모션그래픽 04-day4 (4일차 알리기) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s04-day4.js · 합성: node mg/_src/compose.js
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

// 장면 ⑤ — 4일차 알리기 (원고 근거: 4-0 «3일차 제안서의 차별점이 4일차 소재가 됨» · 4-1 사양표 → 홈페이지 시안
//          · «배포 주소는 공개로 바꾸면 누구나 열 수 있음 — 기본 비공개, 공개 전환은 사람이 정함»
//          · 4-3 «링크드인 — 믿고 문의하게 · 인스타그램 — 기억에 남게» · 4-5 공개 표 → directory.csv(5일차로))
var NAME = 'mg-04-day4', DUR = 17;
var TL = { line: 0.7, site: 2.0, hero: 2.6, url: 5.4, pub: 7.0, sns: 8.8, csv: 12.0, foot: 14.4 };
var B = { x: 70, y: 300, w: 740, h: 560 };
function lock(ctx, x, y, open, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 4;
  ctx.beginPath();
  if (open) ctx.arc(x + 4, y - 10, 9, Math.PI, Math.PI * 1.9);
  else ctx.arc(x, y - 10, 9, Math.PI, 0);
  ctx.stroke();
  rr(ctx, x - 13, y - 8, 26, 22, 4); ctx.fill();
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '4일차', '알리기 — 차별점 한 줄이 홈페이지와 SNS 로', 0.2);
  // 3일차에서 받은 차별점 한 줄
  var l = es(T, TL.line, TL.line + 0.6);
  if (l > 0) {
    ctx.save(); ctx.globalAlpha = l;
    txt(ctx, '3일차에서 받음', 70, 222, 26, 700, C.muted, 'left');
    card(ctx, 270, 186, 1100, 74, { fill: C.tint, stroke: C.brand, lw: 3, r: 37, shadow: 0 });
    txt(ctx, '차별점 — 납기 사전 통보 · 소량 주문', 820, 224, 32, 800, C.ink, 'center');
    ctx.restore();
  }
  // 홈페이지 시안 — 브라우저
  var s = es(T, TL.site, TL.site + 0.7);
  if (s > 0) {
    var pub = es(T, TL.pub, TL.pub + 0.6), u = es(T, TL.url, TL.url + 0.6);
    browser(ctx, B.x, B.y + (1 - s) * 30, B.w, B.h, u > 0 ? 'dg-db.netlify.app' : 'index.html', s);
    ctx.save(); ctx.globalAlpha = s;
    var h = es(T, TL.hero, TL.hero + 0.8);
    ctx.fillStyle = rgba(C.brand, 0.9 * h); rr(ctx, B.x + 30, B.y + 80, B.w - 60, 200, 14); ctx.fill();
    ctx.globalAlpha = s * h;
    txt(ctx, 'DG-DB 시리즈', B.x + 60, B.y + 150, 46, 800, C.ink, 'left');
    txt(ctx, '납기 사전 통보 · 소량 주문', B.x + 60, B.y + 214, 30, 700, C.brandInk, 'left');
    for (var k = 0; k < 3; k++) {
      var q = es(T, TL.hero + 0.6 + 0.3 * k, TL.hero + 1.0 + 0.3 * k);
      ctx.globalAlpha = s * q;
      card(ctx, B.x + 30 + k * 230, B.y + 310, 210, 150, { fill: C.paper, shadow: 0, r: 12 });
      ctx.fillStyle = C.line;
      ctx.fillRect(B.x + 54 + k * 230, B.y + 344, 120, 14);
      ctx.fillRect(B.x + 54 + k * 230, B.y + 380, 160, 10);
      ctx.fillRect(B.x + 54 + k * 230, B.y + 408, 140, 10);
    }
    ctx.globalAlpha = s * u;
    lock(ctx, B.x + 146, B.y + 31, pub > 0.5, pub > 0.5 ? C.green : C.red);
    ctx.globalAlpha = s * u;
    var lab = pub > 0.5 ? '공개 — 누구나 열 수 있음' : '기본 비공개';
    pill(ctx, lab, B.x + B.w / 2, B.y + B.h - 46, 26, pub > 0.5 ? C.greenTint : C.redTint, pub > 0.5 ? C.green : C.red, 22);
    ctx.globalAlpha = s * es(T, TL.pub - 0.6, TL.pub) * (1 - es(T, TL.sns, TL.sns + 0.6));
    txt(ctx, '공개 전환은 사람이 정함', B.x + B.w / 2, B.y + B.h + 44, 28, 800, C.red, 'center');
    ctx.restore();
  }
  // SNS 두 채널 — 같은 소식, 다른 톤
  var SN = [['링크드인', '믿고 문의하게', '사전 통보 방식과 사양을 정리해 소개함'], ['인스타그램', '기억에 남게', '한 장 사진 + 짧은 한 줄']];
  for (var i = 0; i < 2; i++) {
    var p = es(T, TL.sns + 0.7 * i, TL.sns + 0.7 * i + 0.6), y = 300 + i * 290;
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, 860 + (1 - p) * 40, y, 510, 260, { fill: C.paper, stroke: C.brand, lw: 3 });
    txt(ctx, SN[i][0], 896, y + 50, 34, 800, C.ink, 'left');
    pill(ctx, SN[i][1], 1240, y + 50, 24, C.tint, C.brandInk, 18);
    txt(ctx, SN[i][2], 896, y + 120, 26, 600, C.sub, 'left');
    ctx.fillStyle = C.blueTint; rr(ctx, 896, y + 162, 440, 60, 12); ctx.fill();
    txt(ctx, '🔗 dg-db.netlify.app', 920, y + 193, 24, 700, C.blue, 'left', MONO);
    ctx.restore();
    arrow(ctx, B.x + B.w + 6, B.y + 60 + i * 30, 852, y + 130, es(T, TL.sns + 0.7 * i - 0.2, TL.sns + 0.7 * i + 0.4), C.brandInk, 4);
  }
  // 4-5 공개 표 → CSV → 5일차
  var c = es(T, TL.csv, TL.csv + 0.6);
  if (c > 0) {
    ctx.save(); ctx.globalAlpha = c;
    txt(ctx, '4-5 공개 표 모으기', 860, 930, 28, 700, C.muted, 'left');
    pill(ctx, 'directory.csv', 1180, 930, 28, C.ink, C.paper, 24);
    ctx.restore();
    arrow(ctx, 1300, 930, 1366, 930, es(T, TL.csv + 0.5, TL.csv + 1.0), C.brandInk, 5);
  }
  footer(ctx, T, '홈페이지에 못 올릴 내용이면 배포도 하지 않음', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
