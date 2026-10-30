// scene.js — fPM intro motion graphic 01-what [en] — generated file, do not edit by hand
// source: fPmIntro/mg/_src/TEXT.js(en) + common.js + s01-what.js · compose: node decks/app/fPmIntro/mg/_src/compose.js
(function (root) {
var LANG = 'en';
var L = {
  "chip": "fPM",
  "title": "Six daily pains, six features",
  "painHead": "Pain of Claude Code alone",
  "featHead": "How fPM fixes it",
  "pains": [
    [
      "Results evaporate",
      "Hard to re-find tables and structure"
    ],
    [
      "Long tasks go dark",
      "No progress until it finishes"
    ],
    [
      "Window fatigue",
      "Terminal, browser, editor, repeat"
    ],
    [
      "Project switching",
      "Memorize dozens of paths, cd"
    ],
    [
      "Manual dependencies",
      "Finish A before B — every time"
    ],
    [
      "Remote servers",
      "Memorize each server's login"
    ]
  ],
  "feats": [
    [
      "hub render",
      "..show turns an answer into HTML"
    ],
    [
      "..board",
      "SSE pushes live progress"
    ],
    [
      "VSCode integration",
      "Tab / session jump · /fpm-*"
    ],
    [
      "cdf family",
      "Move by one number or name"
    ],
    [
      "pm-do · depends",
      "Delegate prerequisites, auto order"
    ],
    [
      "sshf",
      "Connect by number or name"
    ]
  ],
  "scar": "SCAR — Skill · Command · Agent · Rule",
  "scarSub": "common -g · macOS -m · web -w  →  spreads to every project",
  "foot": "Each pain is the reason a feature exists"
};

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

function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function seg(T, a, b) { return clamp((T - a) / (b - a), 0, 1); }
function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
function es(T, a, b) { return ease(seg(T, a, b)); }
function lerp(a, b, p) { return a + (b - a) * p; }
function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
function rgba(c, a) { var x = hex(c); return 'rgba(' + x[0] + ',' + x[1] + ',' + x[2] + ',' + a + ')'; }
function typed(s, T, a, cps) { return s.substr(0, Math.floor(clamp((T - a) * cps, 0, s.length))); }

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
function bar(ctx, x, y, w, h, color) {
  ctx.fillStyle = color || C.line;
  rr(ctx, x, y - h / 2, w, h, h / 2);
  ctx.fill();
}
function pill(ctx, s, x, y, size, fill, ink, align, font) {
  var w = tw(ctx, s, size, 700, font) + size * 1.2, h = size * 1.7;
  var x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.fillStyle = fill;
  rr(ctx, x0, y - h / 2, w, h, h / 2);
  ctx.fill();
  txt(ctx, s, x0 + w / 2, y + 1, size, 700, ink, 'center', 0, font);
  return w;
}
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

var NAME = 'mg-01-what', DUR = 15;
var TL = { pain: 0.8, map: 4.6, scar: 11.0, foot: 12.6 };
var ROW = { y: 240, step: 104, h: 88 };
var PX = 110, PW = 700, FX = 1010, FW = 800;
function painCard(ctx, T, i) {
  var a = TL.pain + 0.5 * i, p = es(T, a, a + 0.5);
  if (p <= 0) return;
  var m = es(T, TL.map + 1.1 * i, TL.map + 1.1 * i + 0.6), y = ROW.y + i * ROW.step;
  ctx.save();
  ctx.globalAlpha = p * (1 - 0.45 * m);
  card(ctx, PX - (1 - p) * 40, y, PW, ROW.h, { fill: C.paper, stroke: m > 0.5 ? C.line : C.red, lw: 3, shadow: 0, r: 16 });
  ctx.fillStyle = m > 0.5 ? C.muted : C.red;
  ctx.beginPath(); ctx.arc(PX + 40 - (1 - p) * 40, y + ROW.h / 2, 12, 0, Math.PI * 2); ctx.fill();
  txt(ctx, L.pains[i][0], PX + 74, y + 30, 32, 800, C.ink, 'left', PW - 100);
  txt(ctx, L.pains[i][1], PX + 74, y + 64, 24, 500, C.sub, 'left', PW - 100);
  ctx.restore();
}
function featCard(ctx, T, i) {
  var a = TL.map + 1.1 * i, y = ROW.y + i * ROW.step;
  arrow(ctx, PX + PW + 20, y + ROW.h / 2, FX - 20, y + ROW.h / 2, es(T, a, a + 0.5), C.brand, 6);
  var p = es(T, a + 0.3, a + 0.8);
  if (p <= 0) return;
  var on = T < a + 1.1 && T < TL.scar ? 1 : 0;
  ctx.save();
  ctx.globalAlpha = p;
  card(ctx, FX + (1 - p) * 40, y, FW, ROW.h, { fill: on ? C.tint : C.paper, stroke: C.brand, lw: on ? 4 : 2, shadow: on ? 1 : 0, r: 16 });
  ctx.fillStyle = C.brand;
  rr(ctx, FX + (1 - p) * 40, y, 14, ROW.h, 7); ctx.fill();
  txt(ctx, L.feats[i][0], FX + 44, y + 30, 32, 800, C.brandInk, 'left', FW - 70);
  txt(ctx, L.feats[i][1], FX + 44, y + 64, 24, 500, C.sub, 'left', FW - 70);
  ctx.restore();
}
function heads(ctx, T) {
  var p = es(T, 0.5, 1.0);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, L.painHead, PX, 204, 28, 800, C.red, 'left', PW);
    ctx.restore();
  }
  var q = es(T, TL.map, TL.map + 0.5);
  if (q > 0) {
    ctx.save(); ctx.globalAlpha = q;
    txt(ctx, L.featHead, FX, 204, 28, 800, C.brand, 'left', FW);
    ctx.restore();
  }
}
function scarBand(ctx, T) {
  var p = es(T, TL.scar, TL.scar + 0.7);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  var y = 878 + (1 - p) * 20;
  card(ctx, PX, y, FX + FW - PX, 80, { fill: C.ink, stroke: C.ink, shadow: 0, r: 16 });
  txt(ctx, L.scar, PX + 40, y + 40, 32, 800, '#FFFFFF', 'left', 760);
  txt(ctx, L.scarSub, FX + FW - 40, y + 40, 26, 600, '#C9D6EA', 'right', 820);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, L.chip, L.title, 0.2);
  heads(ctx, T);
  for (var i = 0; i < 6; i++) { painCard(ctx, T, i); featCard(ctx, T, i); }
  scarBand(ctx, T);
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
