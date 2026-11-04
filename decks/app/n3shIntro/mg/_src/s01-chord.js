// 장면 ② — 동시타 + 모디파이어 층 (원고 근거: n3shIntro.ppt.md «자모 2개 → 완성형 한 글자»(img/curriculum-4-content.svg) · «얼마나 줄어드나» 표 · «모아치기 + 모디파이어 층»(img/curriculum-5-content.svg))
var NAME = 'mg-01-chord', DUR = 18;
var TL = { panels: 0.8, chord: 2.0, seq0: 2.0, seqStep: 0.6, out: 4.4, verdict: 5.4, order: 7.0, mod0: 8.6, modStep: 1.0, hangul: 12.2, foot: 14.2 };
var PY = 190, PH = 400, PW = (CW - 40) / 2, LX = X0, RX = X0 + PW + 40; // 위 두 칸
var BY = 640, BH = 320, OW = 600, MX = X0 + OW + 40, MW = CW - OW - 40;  // 아래 두 칸
var SEQ = ['ㅇ', 'ㅡ', 'ㄹ', '␣'];
var MODS = [['무수식', '.'], ['⇧', '?'], ['⇧⌘', '!']];
function outBox(ctx, cx, cy, s, p, color) {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, cx - 120, cy - 44 + (1 - p) * 14, 240, 88, { fill: C.tint, stroke: color, lw: 3, r: 16, shadow: 0 });
  txt(ctx, s, cx, cy + (1 - p) * 14, 46, 800, C.ink, 'center');
  ctx.restore();
}
function panels(ctx, T) {
  var p = es(T, TL.panels, TL.panels + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, LX, PY, PW, PH, { stroke: C.brand, lw: 3 });
  card(ctx, RX, PY, PW, PH, {});
  pill(ctx, 'n3sh — 동시타', LX + 40 + 130, PY + 54, 260, 54, C.brand, C.ink, 28, 800);
  pill(ctx, '일반 타건 — 순차 입력', RX + 40 + 170, PY + 54, 340, 54, C.line, C.sub, 28, 800);
  ctx.restore();
  // 왼쪽: j + h 를 한 번에
  var kc = es(T, TL.chord, TL.chord + 0.35), lc = LX + PW / 2, ky = PY + 196;
  keycap(ctx, 'j', lc - 90, ky, 120, kc, C.brand, MONO);
  keycap(ctx, 'h', lc + 90, ky, 120, kc, C.brand, MONO);
  if (kc > 0) { ctx.save(); ctx.globalAlpha = kc; txt(ctx, '+', lc, ky + 6, 40, 800, C.muted, 'center'); ctx.restore(); }
  var po = es(T, TL.out - 1.4, TL.out - 0.9);
  outBox(ctx, lc, PY + 334, '을␣', po, C.brand);
  if (po > 0) { ctx.save(); ctx.globalAlpha = po; txt(ctx, '동시에 1번', LX + PW - 40, PY + 334, 32, 800, C.green, 'right'); ctx.restore(); }
  // 오른쪽: ㅇ → ㅡ → ㄹ → ␣ 한 타씩
  var rc = RX + PW / 2;
  for (var i = 0; i < SEQ.length; i++) {
    var a = TL.seq0 + TL.seqStep * i;
    keycap(ctx, SEQ[i], rc - 210 + i * 140, ky, 110, es(T, a, a + 0.25), C.line);
    if (T >= a) { ctx.save(); ctx.globalAlpha = es(T, a, a + 0.2); txt(ctx, (i + 1) + '타', rc - 210 + i * 140, ky - 86, 26, 800, C.red, 'center'); ctx.restore(); }
  }
  var pr = es(T, TL.out, TL.out + 0.5);
  outBox(ctx, rc, PY + 334, '을␣', pr, C.line);
  if (pr > 0) { ctx.save(); ctx.globalAlpha = pr; txt(ctx, '4타', RX + PW - 40, PY + 334, 32, 800, C.red, 'right'); ctx.restore(); }
  // 판정 — 두 칸 경계 위
  var pv = es(T, TL.verdict, TL.verdict + 0.6);
  if (pv > 0) {
    ctx.save(); ctx.globalAlpha = pv;
    var s = lerp(1.2, 1, pv); ctx.translate(W / 2, PY + PH + 2); ctx.scale(s, s);
    pill(ctx, '같은 결과 · 절반 타수', 0, 0, 400, 60, C.ink, '#FFFFFF', 30, 800);
    ctx.restore();
  }
}
function order(ctx, T) {
  var p = es(T, TL.order, TL.order + 0.6);
  if (p <= 0) return;
  var y = BY + (1 - p) * 40;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, X0, y, OW, BH, {});
  txt(ctx, '모아치기 — 순서 무관', X0 + 40, y + 52, 34, 800, C.ink, 'left');
  fit(ctx, 'j + h  =  h + j', X0 + OW / 2, y + 150, 60, 800, C.blue, 'center', OW - 80, MONO);
  ctx.globalAlpha = p * es(T, TL.order + 0.6, TL.order + 1.1);
  txt(ctx, '어느 쪽이 먼저든 같은 글자', X0 + OW / 2, y + 220, 28, 600, C.sub, 'center');
  ctx.globalAlpha = p * es(T, TL.hangul, TL.hangul + 0.6);
  pill(ctx, '한글 입력 상태에서만 발동', X0 + OW / 2, y + 274, 420, 50, C.greenTint, C.green, 26, 800);
  ctx.restore();
}
function mods(ctx, T) {
  var p = es(T, TL.mod0 - 0.6, TL.mod0);
  if (p <= 0) return;
  var y = BY + (1 - p) * 40;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, MX, y, MW, BH, {});
  txt(ctx, '모디파이어 층 — 같은 두 키, 다른 글자', MX + 40, y + 52, 34, 800, C.ink, 'left');
  fit(ctx, 'ex) 어미 끝 문장부호', MX + MW - 40, y + 52, 26, 600, C.muted, 'right', 300);
  ctx.restore();
  var TW = (MW - 80 - 2 * 30) / 3;
  for (var i = 0; i < MODS.length; i++) {
    var a = TL.mod0 + TL.modStep * i, q = es(T, a, a + 0.5);
    if (q <= 0) continue;
    var tx = MX + 40 + i * (TW + 30), ty = y + 100;
    ctx.save(); ctx.globalAlpha = q;
    card(ctx, tx, ty + (1 - q) * 20, TW, 190, { fill: i === 0 ? C.paper : C.blueTint, stroke: i === 0 ? C.line : C.blue, lw: 2, r: 16, shadow: 0 });
    fit(ctx, MODS[i][0] + ' + 두 키', tx + TW / 2, ty + 56, 32, 800, i === 0 ? C.sub : C.blue, 'center', TW - 30);
    arrow(ctx, tx + TW / 2, ty + 86, tx + TW / 2, ty + 122, es(T, a + 0.2, a + 0.5), C.muted, 4);
    txt(ctx, MODS[i][1], tx + TW / 2, ty + 156, 56, 800, C.ink, 'center', MONO);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '원리', '자모 2개를 동시에 → 완성형 한 글자', 0.2);
  panels(ctx, T);
  order(ctx, T);
  mods(ctx, T);
  footer(ctx, T, '단어 확장기가 아니라 속기다', TL.foot);
}
