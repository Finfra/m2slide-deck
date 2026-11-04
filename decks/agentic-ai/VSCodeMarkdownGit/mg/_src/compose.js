#!/usr/bin/env node
// compose.js — common.js + 장면 원본(sNN-*.js) 을 장면 폴더의 자급 scene.js 로 합성한다.
// SCAR motion-direct 는 scene.js 한 파일만 읽으므로 공유 파일을 참조하지 않고 전문을 싣는다.
// 대상은 추가분 04~06 뿐 — 기존 01-vscode·02-markdown·03-git 은 따로 만든 파일이라 건드리지 않는다.
// 원본을 고치면 다시 돌린다:  node decks/agentic-ai/VSCodeMarkdownGit/mg/_src/compose.js
'use strict';
const fs = require('fs');
const path = require('path');

const MG = path.resolve(__dirname, '..');
const COMMON = fs.readFileSync(path.join(__dirname, 'common.js'), 'utf8');
const SCENES = [
  { src: 's04-flow.js', dir: '04-flow', title: '세 질문 → 세 도구 → 하나의 습관' },
  { src: 's05-session.js', dir: '05-session', title: '대화 한 개 vs 기능별 세션' },
  { src: 's06-chain.js', dir: '06-chain', title: '요구사항 → 설계 → 이슈 → 변경' },
];

for (const s of SCENES) {
  const body = fs.readFileSync(path.join(__dirname, s.src), 'utf8');
  const out = `// scene.js — VS Code·Markdown·Git 특강 모션그래픽 ${s.dir} (${s.title}) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/${s.src} · 합성: node mg/_src/compose.js · 4:3 1600×1200
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
