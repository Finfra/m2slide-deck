// scene.js — fPM 소개 모션그래픽 06-start (시작하기) [en] — 생성 파일, 직접 고치지 않는다
// 원본: fPmIntro/mg/_src/TEXT.js(en) + common.js + s06-start.js · 합성: node decks/app/fPmIntro/mg/_src/compose.js
(function (root) {
var LANG = 'en';
var L = {
  "chip": "start",
  "title": "From one-line install to first hands-on",
  "cmd": "curl -fsSL https://raw.githubusercontent.com/Finfra/fpm/main/sh/bootstrap.sh | sh",
  "checks": [
    "Clone",
    "Configure",
    "Install plugin"
  ],
  "noClone": "No git clone first — the bootstrap does it all",
  "steps": [
    [
      "Install",
      "One-line bootstrap"
    ],
    [
      "First hub render",
      "..show in a project folder"
    ],
    [
      "Jump projects",
      "cdf list → jump by number"
    ],
    [
      "Long task",
      "Watch it with ..board"
    ],
    [
      "Remote reach",
      "Connect with sshf"
    ]
  ],
  "maint": "Maintain",
  "chips": [
    "fpm update",
    "fpm upgrade",
    "fpm version",
    "fpm uninstall"
  ],
  "foot": "Pick one thing you saw today and apply it now"
};
// common.js — 6개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 결정론: 난수·시계 API 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.
// 캔버스 1920×1080 — 덱 _config.yml 에 slide_ratio 미지정 → m2slide 기본 16:9
// compose.js 가 이 파일 앞에 LANG('ko'|'en') 과 문구 L 을 주입한다.

var W = 1920, H = 1080;
var C = {
  bg: '#F7F9FC', ink: '#1C2430', sub: '#4A5566', muted: '#8892A0', line: '#DCE3EC', paper: '#FFFFFF',
  brand: '#2563EB', brandInk: '#1E40AF', tint: '#EAF1FE',
  red: '#C8341E', redTint: '#FDECE8', green: '#1F7A4D', greenTint: '#E4F3EA',
  term: '#1E2430', termInk: '#E6EDF3', termDim: '#7D8794', amber: '#E0A526',
};
var KR = LANG === 'ko'
  ? '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif'
  : '"Helvetica Neue", Arial, "Noto Sans", sans-serif';
var MONO = 'Menlo, "SF Mono", "DejaVu Sans Mono", monospace';

// ── 수학 ──────────────────────────────────────────────────────────────────
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function seg(T, a, b) { return clamp((T - a) / (b - a), 0, 1); }
function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
function es(T, a, b) { return ease(seg(T, a, b)); }
function lerp(a, b, p) { return a + (b - a) * p; }
function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
function rgba(c, a) { var x = hex(c); return 'rgba(' + x[0] + ',' + x[1] + ',' + x[2] + ',' + a + ')'; }
// 타이핑 — a 부터 초당 cps 글자씩 드러난 앞부분
function typed(s, T, a, cps) { return s.substr(0, Math.floor(clamp((T - a) * cps, 0, s.length))); }

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
  ctx.globalAlpha *= (o.alpha == null ? 1 : o.alpha);
  if (o.shadow !== 0) {
    ctx.shadowColor = 'rgba(20,40,80,0.12)';
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
// maxW 를 주면 넘칠 때 글자 크기를 줄여 맞춘다 (ko·en 길이 차이 흡수)
function txt(ctx, s, x, y, size, weight, color, align, maxW, font) {
  var f = font || KR;
  ctx.font = weight + ' ' + size + 'px ' + f;
  if (maxW) {
    var m = ctx.measureText(s).width;
    if (m > maxW) { size = Math.max(12, Math.floor(size * maxW / m)); ctx.font = weight + ' ' + size + 'px ' + f; }
  }
  ctx.fillStyle = color;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}
function tw(ctx, s, size, weight, font) {
  ctx.font = weight + ' ' + size + 'px ' + (font || KR);
  return ctx.measureText(s).width;
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
  ctx.globalAlpha *= Math.min(1, p * 1.6);
  var s = lerp(1.5, 1, p);
  ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.42, 0); ctx.lineTo(-r * 0.1, r * 0.34); ctx.lineTo(r * 0.45, -r * 0.34); ctx.stroke();
  ctx.restore();
}
// 자리표시 막대 — 원고에 없는 예시 데이터 대신
function bar(ctx, x, y, w, h, color) {
  ctx.fillStyle = color || C.line;
  rr(ctx, x, y - h / 2, w, h, h / 2);
  ctx.fill();
}
// 알약 — 글자 폭에 맞춘 둥근 칩. 너비를 돌려준다
function pill(ctx, s, x, y, size, fill, ink, align, font) {
  var w = tw(ctx, s, size, 700, font) + size * 1.2, h = size * 1.7;
  var x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.fillStyle = fill;
  rr(ctx, x0, y - h / 2, w, h, h / 2);
  ctx.fill();
  txt(ctx, s, x0 + w / 2, y + 1, size, 700, ink, 'center', 0, font);
  return w;
}
// 창 틀 — 어두운 터미널(dark) 또는 밝은 브라우저. 제목 표시줄 높이 52
function win(ctx, x, y, w, h, title, dark, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  card(ctx, x, y, w, h, { fill: dark ? C.term : C.paper, stroke: dark ? C.term : C.line, r: 16 });
  ctx.fillStyle = dark ? '#2B3342' : '#EEF2F7';
  rr(ctx, x, y, w, 52, 16); ctx.fill();
  ctx.fillRect(x, y + 36, w, 16);
  var dots = ['#FF5F57', '#FEBC2E', '#28C840'];
  for (var i = 0; i < 3; i++) { ctx.fillStyle = dots[i]; ctx.beginPath(); ctx.arc(x + 30 + i * 26, y + 26, 8, 0, Math.PI * 2); ctx.fill(); }
  txt(ctx, title, x + w / 2, y + 27, 24, 700, dark ? C.termDim : C.sub, 'center', w - 220);
  ctx.restore();
}
// 프롬프트 줄 — 앞 글자는 기본색, 트리거(..show 등)는 강조색. 커서는 T 로 깜빡임
function promptLine(ctx, T, x, y, head, trig, a, cps, size, color, accent, maxW) {
  var full = head + trig, s = typed(full, T, a, cps);
  if (T < a) return;
  var h = s.substr(0, Math.min(s.length, head.length)), g = s.length > head.length ? s.substr(head.length) : '';
  var fit = 1, fullW = tw(ctx, '> ' + full, size, 600, MONO);
  if (maxW && fullW > maxW) fit = maxW / fullW;
  var sz = Math.floor(size * fit);
  txt(ctx, '> ' + h, x, y, sz, 600, color, 'left', 0, MONO);
  var hw = tw(ctx, '> ' + h, sz, 600, MONO);
  if (g) txt(ctx, g, x + hw, y, sz, 800, accent, 'left', 0, MONO);
  var cw = tw(ctx, '> ' + s, sz, 600, MONO);
  if (s.length < full.length || Math.floor(T * 2) % 2 === 0) { ctx.fillStyle = color; ctx.fillRect(x + cw + 4, y - sz * 0.55, sz * 0.5, sz * 1.1); }
}

// ── 공통 틀: 머리(칩 + 제목) · 아래 한 줄 ──────────────────────────────────
function header(ctx, T, chip, title, a) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  var cw = Math.max(150, tw(ctx, chip, 34, 800) + 56);
  ctx.fillStyle = C.brand;
  rr(ctx, 70, 58, cw, 64, 32);
  ctx.fill();
  txt(ctx, chip, 70 + cw / 2, 91, 34, 800, '#FFFFFF', 'center');
  txt(ctx, title, 70 + cw + 30, 92 + (1 - p) * 10, 52, 800, C.ink, 'left', W - 70 - (70 + cw + 30));
  ctx.fillStyle = C.brand;
  ctx.fillRect(70, 146, (W - 140) * p, 6);
  ctx.restore();
}
function footer(ctx, T, s, a, color) {
  var p = es(T, a, a + 0.8);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  txt(ctx, s, W / 2, 1012 + (1 - p) * 12, 40, 800, color || C.brandInk, 'center', W - 200);
  ctx.restore();
}
function backdrop(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
}

// 장면 ⑥ — 시작하기 (원고 근거: 06 «원라인 설치» · «셀프업데이트 커맨드» · «첫 실습 — 지금 해보기»)
var NAME = 'mg-06-start', DUR = 15;
var TL = { cmd: 0.6, checks: 3.2, noClone: 4.6, path: 5.4, step: 1.1, maint: 11.6, foot: 13.0 };
var TM = { x: 80, y: 186, w: 1760, h: 230 };
var SW = 312, SG = 50, SY = 480, SH = 210;
function install(ctx, T) {
  var a = es(T, TL.cmd - 0.4, TL.cmd);
  win(ctx, TM.x, TM.y, TM.w, TM.h, 'sh', true, a);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  var x = TM.x + 36;
  promptLine(ctx, T < TL.checks ? T : TL.checks, x, TM.y + 100, L.cmd, '', TL.cmd, 40, 26, C.termInk, C.termInk, TM.w - 80);
  var cx = x;
  for (var i = 0; i < 3; i++) {
    var p = es(T, TL.checks + 0.5 * i, TL.checks + 0.5 * i + 0.4);
    if (p <= 0) continue;
    ctx.globalAlpha = a * p;
    cx += pill(ctx, '✓ ' + L.checks[i], cx, TM.y + 172, 26, '#244A36', '#7EE2A8', 'left') + 18;
  }
  var q = es(T, TL.noClone, TL.noClone + 0.5);
  if (q > 0) { ctx.globalAlpha = a * q; txt(ctx, L.noClone, TM.x + TM.w - 40, TM.y + 172, 26, 700, C.termDim, 'right', TM.w - (cx - TM.x) - 60); }
  ctx.restore();
}
function path(ctx, T) {
  var cur = Math.floor((T - TL.path) / TL.step);
  var lp = es(T, TL.path - 0.4, TL.path + TL.step * 4 + 0.6);
  // 단계를 잇는 선과 이동 표지
  if (lp > 0) {
    var y = SY + SH + 40, x1 = TM.x + SW / 2, x2 = TM.x + 4 * (SW + SG) + SW / 2;
    ctx.strokeStyle = C.line; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    ctx.strokeStyle = C.brand; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(lerp(x1, x2, lp), y); ctx.stroke();
    ctx.fillStyle = C.brand; ctx.beginPath(); ctx.arc(lerp(x1, x2, lp), y, 16, 0, Math.PI * 2); ctx.fill();
  }
  for (var i = 0; i < 5; i++) {
    var a = TL.path - 0.6 + 0.12 * i, p = es(T, a, a + 0.5), x = TM.x + i * (SW + SG);
    if (p <= 0) continue;
    var on = i === cur && T < TL.maint, past = T >= TL.path + TL.step * i;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, SY - (on ? 12 : 0), SW, SH, { fill: on ? C.tint : C.paper, stroke: past ? C.brand : C.line, lw: on ? 4 : 2, shadow: on ? 1 : 0, r: 20 });
    var yy = SY - (on ? 12 : 0);
    ctx.fillStyle = past ? C.brand : C.line; ctx.beginPath(); ctx.arc(x + 50, yy + 54, 28, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), x + 50, yy + 55, 30, 800, '#FFFFFF', 'center');
    txt(ctx, L.steps[i][0], x + 30, yy + 120, 32, 800, C.ink, 'left', SW - 60);
    txt(ctx, L.steps[i][1], x + 30, yy + 166, 23, 600, C.sub, 'left', SW - 50);
    if (i < 4) arrow(ctx, x + SW + 8, SY + SH / 2, x + SW + SG - 8, SY + SH / 2, p, C.muted, 3);
    ctx.restore();
  }
}
function maint(ctx, T) {
  var p = es(T, TL.maint, TL.maint + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  var y = 858, x = TM.x;
  x += pill(ctx, L.maint, x, y, 28, C.ink, '#FFFFFF', 'left') + 24;
  for (var i = 0; i < 4; i++) {
    var q = es(T, TL.maint + 0.2 + 0.15 * i, TL.maint + 0.6 + 0.15 * i);
    ctx.globalAlpha = p * q;
    x += pill(ctx, L.chips[i], x, y, 28, C.tint, C.brandInk, 'left', MONO) + 18;
  }
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, L.chip, L.title, 0.2);
  install(ctx, T);
  path(ctx, T);
  maint(ctx, T);
  footer(ctx, T, L.foot, TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
