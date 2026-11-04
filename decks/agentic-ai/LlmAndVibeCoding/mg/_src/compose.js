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
  { src: 's00-flow.js', dir: '00-flow', title: '강연 흐름 8장' },
  { src: 's01-paradigm.js', dir: '01-paradigm', title: 'Code-First → Intent-First' },
  { src: 's02-evolution.js', dir: '02-evolution', title: 'LLM 코딩 툴 3세대' },
  { src: 's03-chatvibe.js', dir: '03-chatvibe', title: '채팅 방식 vs 바이브 코딩' },
  { src: 's04-principles.js', dir: '04-principles', title: '바이브 코딩 3원칙' },
  { src: 's05-generations.js', dir: '05-generations', title: '1세대 IDE vs 2세대 CLI' },
  { src: 's06-decision.js', dir: '06-decision', title: '세대 선택 의사결정 트리' },
];

for (const s of SCENES) {
  const body = fs.readFileSync(path.join(__dirname, s.src), 'utf8');
  const out = `// scene.js — LlmAndVibeCoding 강연 모션그래픽 ${s.dir} (${s.title}) — 생성 파일, 직접 고치지 않는다
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
