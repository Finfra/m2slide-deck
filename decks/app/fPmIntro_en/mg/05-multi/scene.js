// scene.js — fPM intro motion graphic 05-multi [en] — generated file, do not edit by hand
// source: fPmIntro/mg/_src/TEXT.js(en) + common.js + s05-multi.js · compose: node decks/app/fPmIntro/mg/_src/compose.js
(function (root) {
var LANG = 'en';
var L = {
  "chip": "cdf",
  "title": "Point by number, let depends handle order",
  "reg": "Number → path registry",
  "regCols": [
    "No.",
    "Project"
  ],
  "projects": [
    "Project A",
    "Project B",
    "Project C"
  ],
  "term": "Terminal",
  "cmd1": "cdf 11",
  "cmd2": "cdf 11 12 13",
  "split": "iTerm2 split panes",
  "pm": "pm-do — cross-project delegation",
  "issue": "Issue in B",
  "dep": "depends: A",
  "projA": "Work in A",
  "delegate": "delegate",
  "commit": "Collect completion commit hash",
  "main": "Main work proceeds",
  "seq": "Sequential",
  "seqSub": "Has depends — after the prerequisite",
  "par": "Parallel fan-out",
  "parSub": "Independent — delegate at once, collect all",
  "foot": "No more memorized paths or hand-kept order"
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

var NAME = 'mg-05-multi', DUR = 17;
var TL = { reg: 0.6, c1: 2.0, moved: 3.0, c2: 4.0, split: 5.4, pm: 7.0, dele: 7.8, work: 8.4, back: 9.8, main: 10.8, mode: 12.0, foot: 15.0 };
var RG = { x: 80, y: 190, w: 820, h: 300 }, TM = { x: 80, y: 520, w: 820, h: 390 };
var PM = { x: 980, y: 190, w: 860, h: 520 };
var NUMS = ['11', '12', '13'];
function registry(ctx, T) {
  var a = es(T, TL.reg, TL.reg + 0.6);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, RG.x, RG.y, RG.w, RG.h, { r: 18 });
  txt(ctx, L.reg, RG.x + 36, RG.y + 46, 30, 800, C.brandInk, 'left', RG.w - 72);
  txt(ctx, L.regCols[0], RG.x + 60, RG.y + 100, 24, 700, C.muted, 'left', 120);
  txt(ctx, L.regCols[1], RG.x + 220, RG.y + 100, 24, 700, C.muted, 'left', 300);
  var one = es(T, TL.c1 + 0.8, TL.c1 + 1.1) * (1 - es(T, TL.c2, TL.c2 + 0.3)), all = es(T, TL.c2 + 1.0, TL.c2 + 1.3);
  for (var i = 0; i < 3; i++) {
    var y = RG.y + 154 + i * 50, h = i === 0 ? Math.max(one, all) : all;
    if (h > 0) { ctx.fillStyle = rgba(C.brand, 0.18 * h); rr(ctx, RG.x + 24, y - 22, RG.w - 48, 44, 10); ctx.fill(); }
    txt(ctx, NUMS[i], RG.x + 60, y, 30, 800, C.ink, 'left', 0, MONO);
    txt(ctx, L.projects[i], RG.x + 220, y, 28, 700, C.ink, 'left', 300);
    bar(ctx, RG.x + 470, y, 220 - 40 * i, 14, C.line);
  }
  ctx.restore();
}
function terminal(ctx, T) {
  var a = es(T, TL.reg + 0.3, TL.reg + 0.9);
  var sp = es(T, TL.split, TL.split + 0.6);
  win(ctx, TM.x, TM.y, TM.w, TM.h, sp > 0.5 ? L.split : L.term, true, a);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  var x = TM.x + 32, mw = TM.w - 64;
  var single = 1 - sp;
  if (single > 0) {
    ctx.globalAlpha = a * single;
    var t1 = T < TL.c2 ? T : TL.c2 - 0.01;
    if (T < TL.c2) {
      promptLine(ctx, t1, x, TM.y + 110, L.cmd1, '', TL.c1, 8, 30, C.termInk, C.termInk, mw);
      var m = es(T, TL.moved, TL.moved + 0.3);
      if (m > 0) { ctx.globalAlpha = a * single * m; txt(ctx, '~/' + L.projects[0] + ' $', x, TM.y + 170, 30, 700, '#5FD08E', 'left', mw, MONO); }
    } else {
      promptLine(ctx, T, x, TM.y + 110, L.cmd2, '', TL.c2, 10, 30, C.termInk, C.termInk, mw);
    }
  }
  if (sp > 0) {
    var ph = (TM.h - 52) / 3;
    for (var i = 0; i < 3; i++) {
      var y = TM.y + 52 + i * ph;
      ctx.globalAlpha = a * es(T, TL.split + 0.15 * i, TL.split + 0.15 * i + 0.4);
      if (i > 0) { ctx.fillStyle = '#4A5568'; ctx.fillRect(TM.x, y, TM.w, 3); }
      txt(ctx, NUMS[i], x, y + ph / 2, 24, 700, C.termDim, 'left', 0, MONO);
      txt(ctx, '~/' + L.projects[i] + ' $', x + 60, y + ph / 2, 28, 700, '#5FD08E', 'left', mw - 60, MONO);
    }
  }
  ctx.restore();
}
function node(ctx, x, y, w, h, title, sub, color, fill) {
  card(ctx, x, y, w, h, { fill: fill, stroke: color, lw: 3, r: 18 });
  txt(ctx, title, x + w / 2, y + 50, 32, 800, C.ink, 'center', w - 40);
  if (sub) pill(ctx, sub, x + w / 2, y + 104, 24, color, '#FFFFFF', 'center');
}
function pmPanel(ctx, T) {
  var a = es(T, TL.pm, TL.pm + 0.6);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, PM.x, PM.y, PM.w, PM.h, { r: 18 });
  txt(ctx, L.pm, PM.x + 36, PM.y + 46, 30, 800, C.brandInk, 'left', PM.w - 72);
  var B = { x: PM.x + 40, y: PM.y + 100, w: 280, h: 150 }, A = { x: PM.x + PM.w - 320, y: PM.y + 100, w: 280, h: 150 };
  node(ctx, B.x, B.y, B.w, B.h, L.issue, L.dep, C.red, C.redTint);
  var w = es(T, TL.dele + 0.5, TL.dele + 0.9);
  ctx.globalAlpha = a * (0.35 + 0.65 * w);
  node(ctx, A.x, A.y, A.w, A.h, L.projA, '', C.brand, C.tint);
  var r = es(T, TL.work, TL.back - 0.1);
  if (T >= TL.back) stamp(ctx, A.x + A.w / 2, A.y + 106, 26, es(T, TL.back - 0.1, TL.back + 0.3), C.green);
  else if (r > 0) {
    var cx = A.x + A.w / 2, cy = A.y + 106;
    ctx.strokeStyle = C.line; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.brand; ctx.beginPath(); ctx.arc(cx, cy, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); ctx.stroke();
  }
  ctx.globalAlpha = a;
  var y1 = B.y + 50, y2 = B.y + 110, gx = (B.x + B.w + A.x) / 2, gw = A.x - B.x - B.w - 24;
  var d = es(T, TL.dele, TL.dele + 0.6);
  arrow(ctx, B.x + B.w + 14, y1, A.x - 14, y1, d, C.brand, 6);
  if (d > 0.6) txt(ctx, 'pm-do ' + L.delegate, gx, y1 - 26, 24, 800, C.brandInk, 'center', gw);
  var bk = es(T, TL.back, TL.back + 0.6);
  arrow(ctx, A.x - 14, y2, B.x + B.w + 14, y2, bk, C.green, 6);
  if (bk > 0.6) txt(ctx, L.commit, gx, B.y + B.h + 30, 24, 700, C.green, 'center', 2 * (gx - B.x - B.w / 2) - 40);
  var mn = es(T, TL.main, TL.main + 0.5);
  if (mn > 0) {
    ctx.globalAlpha = a * mn;
    arrow(ctx, B.x + B.w / 2, B.y + B.h + 10, B.x + B.w / 2, B.y + B.h + 70, mn, C.green, 6);
    card(ctx, B.x, B.y + B.h + 80, PM.w - 80, 90, { fill: C.greenTint, stroke: C.green, lw: 3, shadow: 0, r: 16 });
    txt(ctx, L.main, B.x + 36, B.y + B.h + 125, 32, 800, C.green, 'left', PM.w - 220);
    stamp(ctx, B.x + PM.w - 140, B.y + B.h + 125, 28, es(T, TL.main + 0.3, TL.main + 0.7), C.green);
  }
  ctx.restore();
}
function dot(ctx, x, y, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill(); }
function modes(ctx, T) {
  var y = 740, h = 170, w = 410;
  var p = es(T, TL.mode, TL.mode + 0.6);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, PM.x, y, w, h, { r: 16, shadow: 0 });
    txt(ctx, L.seq, PM.x + 28, y + 36, 28, 800, C.ink, 'left', w - 56);
    txt(ctx, L.seqSub, PM.x + 28, y + 74, 20, 600, C.sub, 'left', w - 56);
    var sx = PM.x + 80;
    dot(ctx, sx, y + 128, C.brand); arrow(ctx, sx + 26, y + 128, sx + 120, y + 128, es(T, TL.mode + 0.4, TL.mode + 0.9), C.muted, 4);
    dot(ctx, sx + 146, y + 128, C.brand); arrow(ctx, sx + 172, y + 128, sx + 266, y + 128, es(T, TL.mode + 0.9, TL.mode + 1.4), C.muted, 4);
    dot(ctx, sx + 292, y + 128, C.green);
    ctx.restore();
  }
  var q = es(T, TL.mode + 0.6, TL.mode + 1.2);
  if (q > 0) {
    var x = PM.x + PM.w - w;
    ctx.save(); ctx.globalAlpha = q;
    card(ctx, x, y, w, h, { r: 16, shadow: 0 });
    txt(ctx, L.par, x + 28, y + 36, 28, 800, C.ink, 'left', w - 56);
    txt(ctx, L.parSub, x + 28, y + 74, 20, 600, C.sub, 'left', w - 56);
    var ox = x + 80, oy = y + 128;
    dot(ctx, ox, oy, C.brand);
    for (var k = 0; k < 3; k++) {
      var tx = ox + 220, ty = oy - 30 + k * 30;
      ctx.strokeStyle = C.muted; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ox + 20, oy); ctx.lineTo(lerp(ox + 20, tx - 12, es(T, TL.mode + 1.0, TL.mode + 1.5)), lerp(oy, ty, es(T, TL.mode + 1.0, TL.mode + 1.5))); ctx.stroke();
      ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(tx, ty, 10, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, L.chip, L.title, 0.2);
  registry(ctx, T);
  terminal(ctx, T);
  pmPanel(ctx, T);
  modes(ctx, T);
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
