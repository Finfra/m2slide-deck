// 장면 ⑤ — nPTiR 5단계 (원고 근거: 01-part1 «nPTiR 5단계 흐름도» + 02-part2 «needs 단계» · «issue·Report 단계» · «nPTiR 사이클 1회 정리»)
var NAME = 'mg-04-nptir', DUR = 18;
var TL = { t0: 1.0, tstep: 0.4, folder: 3.4, s0: 4.2, sstep: 1.6, done: 11.8, out: 12.6, foot: 15.0 };
var TILES = [
  ['n', 'needs', '무엇이 필요한가', 'Issue.md 이슈후보'],
  ['P', 'Plan', '어떻게 할까', '_doc_work/plan/'],
  ['T', 'Task', '단계별 체크리스트', '_doc_work/tasks/'],
  ['i', 'issue', '진행 추적', 'Issue.md'],
  ['R', 'Report', '완료 회고', '_doc_work/report/'],
];
var TG = 28, TW = (CW - TG * 4) / 5, TY = 190, TH = 310;
var FX = X0, FY = 560, FW = 1000, FH = 380;
var OX = FX + FW + 40, OW = X1 - OX;
var FILES = [ // [폴더에 들어오는 단계, 경로, 꼬리]
  [0, 'Issue.md', ''],
  [1, '_doc_work/plan/{주제}_plan.md', ''],
  [2, '_doc_work/tasks/{주제}_task.md', ''],
  [4, '_doc_work/report/{주제}_issue{번호}_report.md', '(선택)'],
];
function stageAt(T) { return T < TL.s0 ? -1 : Math.min(4, Math.floor((T - TL.s0) / TL.sstep)); }
function tiles(ctx, T) {
  var cur = T < TL.done ? stageAt(T) : -1;
  for (var i = 0; i < 5; i++) {
    var a = TL.t0 + TL.tstep * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var x = X0 + i * (TW + TG), y = TY + (1 - p) * 30, on = i === cur, past = stageAt(T) >= i;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, y, TW, TH, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 5 : 2 });
    ctx.fillStyle = past ? C.brand : C.line;
    ctx.beginPath(); ctx.arc(x + TW / 2, y + 68, 44, 0, Math.PI * 2); ctx.fill();
    txt(ctx, TILES[i][0], x + TW / 2, y + 70, 52, 800, C.ink, 'center');
    fit(ctx, TILES[i][1], x + TW / 2, y + 150, 36, 800, C.ink, 'center', TW - 30);
    fit(ctx, TILES[i][2], x + TW / 2, y + 200, 27, 600, C.sub, 'center', TW - 30);
    ctx.fillStyle = C.blueTint; rr(ctx, x + 16, y + 238, TW - 32, 48, 12); ctx.fill();
    fit(ctx, TILES[i][3], x + TW / 2, y + 263, 22, 600, C.blue, 'center', TW - 52, MONO);
    ctx.restore();
    if (i < 4) arrow(ctx, x + TW + 3, TY + 68, x + TW + TG - 3, TY + 68, es(T, a + 0.3, a + 0.6), C.brandInk, 4);
  }
}
function folder(ctx, T) {
  var p = es(T, TL.folder, TL.folder + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, FX, FY, FW, FH, {});
  txt(ctx, '프로젝트 폴더', FX + 40, FY + 46, 30, 800, C.brandInk, 'left');
  var st = stageAt(T);
  for (var i = 0; i < FILES.length; i++) {
    var f = FILES[i], s = TL.s0 + TL.sstep * f[0], q = es(T, s + 0.2, s + 0.8);
    if (q <= 0) continue;
    var y = FY + 120 + i * 68;
    ctx.globalAlpha = p * q;
    doc(ctx, FX + 40 + (1 - q) * 30, y - 24, 38, 48, { rows: 0 });
    fit(ctx, f[1], FX + 100 + (1 - q) * 30, y, 26, 600, C.ink, 'left', FW - 300, MONO);
    if (f[2]) txt(ctx, f[2], FX + FW - 40, y, 26, 700, C.muted, 'right');
    if (i === 0) {
      // Issue.md 상태 칩 — 이슈후보 → 진행중 → 완료
      var lab = T >= TL.done ? '완료' : st >= 3 ? '진행중' : '이슈후보';
      var col = T >= TL.done ? C.green : st >= 3 ? C.brand : C.line;
      pill(ctx, lab, FX + 360, y, 150, 46, col, T >= TL.done ? '#FFFFFF' : C.ink, 26, 800);
    }
  }
  ctx.restore();
}
function outputs(ctx, T) {
  var p = es(T, TL.out, TL.out + 0.6);
  if (p <= 0) return;
  var L = ['plan', 'task', 'issue 항목', '(선택) report'];
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, OX, FY, OW, FH, { fill: C.greenTint, stroke: C.green, lw: 3 });
  txt(ctx, '산출물', OX + 36, FY + 46, 30, 800, C.green, 'left');
  for (var i = 0; i < L.length; i++) {
    var y = FY + 120 + i * 68;
    stamp(ctx, OX + 54, y, 20, es(T, TL.out + 0.3 + 0.25 * i, TL.out + 0.7 + 0.25 * i), C.green);
    fit(ctx, L[i], OX + 92, y, 30, 700, C.ink, 'left', OW - 120);
  }
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'nPTiR', '5단계 — 의도·과정·결과를 남김', 0.2);
  tiles(ctx, T);
  folder(ctx, T);
  outputs(ctx, T);
  footer(ctx, T, '의도·과정·결과가 한 폴더에 — 1주일 후에도 재현', TL.foot);
}
