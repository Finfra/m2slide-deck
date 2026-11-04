#!/usr/bin/env node
// compose.js — common.js + 장면 원본(sNN-*.js) 을 장면 폴더의 자급 scene.js 로 합성한다.
// SCAR motion-direct 는 scene.js 한 파일만 읽으므로 공유 파일을 참조하지 않고 전문을 싣는다.
// 원본을 고치면 다시 돌린다:  node mg/_src/compose.js
'use strict';
const fs = require('fs');
const path = require('path');

const MG = path.resolve(__dirname, '..');
const COMMON = fs.readFileSync(path.join(__dirname, 'common.js'), 'utf8');
const SCENES = [
  { src: 's00-flow.js', dir: '00-flow', title: '전체 흐름' },
  { src: 's01-principles.js', dir: '01-principles', title: '실패하지 않는 3원칙' },
];

for (const s of SCENES) {
  const body = fs.readFileSync(path.join(__dirname, s.src), 'utf8');
  const out = `// scene.js — RamyeonCooking 덱 모션그래픽 ${s.dir} (${s.title}) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/${s.src} · 합성: node mg/_src/compose.js
(function (root) {
${COMMON}
${body}
root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
`;
  fs.mkdirSync(path.join(MG, s.dir), { recursive: true });
  fs.writeFileSync(path.join(MG, s.dir, 'scene.js'), out);
  console.log(`✅ mg/${s.dir}/scene.js`);
}
