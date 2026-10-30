#!/usr/bin/env node
// compose.js — TEXT.js + common.js + 장면 원본(sNN-*.js) 을 장면 폴더의 자급 scene.js 로 합성한다.
// SCAR motion-direct 는 scene.js 한 파일만 읽으므로 공유 파일을 참조하지 않고 전문을 싣는다.
// 한 번에 두 덱을 만든다: fPmIntro/mg/NN-*/scene.js (TEXT.ko) · fPmIntro_en/mg/NN-*/scene.js (TEXT.en)
// 원본을 고치면 다시 돌린다:  node decks/app/fPmIntro/mg/_src/compose.js
// 틀: DesignRndAI(설계·R&D 덱) mg/_src/compose.js 와 같은 계약 + 문구 표 분리
'use strict';
const fs = require('fs');
const path = require('path');

const TEXT = require('./TEXT.js');
const APP = path.resolve(__dirname, '..', '..', '..');
const OUT = { ko: path.join(APP, 'fPmIntro', 'mg'), en: path.join(APP, 'fPmIntro_en', 'mg') };
const COMMON = fs.readFileSync(path.join(__dirname, 'common.js'), 'utf8');
const SCENES = [
  { key: 's01', src: 's01-what.js', dir: '01-what', title: 'fPM 이 무엇인가' },
  { key: 's02', src: 's02-vs.js', dir: '02-vs', title: 'Claude Code 단독 vs fPM' },
  { key: 's03', src: 's03-hub.js', dir: '03-hub', title: 'hub 모드' },
  { key: 's04', src: 's04-board.js', dir: '04-board', title: '실시간 대시보드' },
  { key: 's05', src: 's05-multi.js', dir: '05-multi', title: '다중 프로젝트 · pm-do' },
  { key: 's06', src: 's06-start.js', dir: '06-start', title: '시작하기' },
];
// 결정론 위반 · 공개 금지 문자열
const NONDET = /Math\.random|\bDate\b|performance\.now/;
const PRIVATE = /\bprj\s*\d|~\/_|\/Users\/|\.local\b|ghp_|github_pat_|sk-ant-/i;

function fail(msg) { console.error('❌ ' + msg); process.exit(1); }

// ko·en 문구 표의 모양(키·배열 길이·타입)이 같은지 검사
function shape(a, b, where) {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) fail(`TEXT 배열 길이 불일치: ${where}`);
    a.forEach((v, i) => shape(v, b[i], `${where}[${i}]`));
  } else if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object') fail(`TEXT 타입 불일치: ${where}`);
    const ka = Object.keys(a).sort().join(','), kb = Object.keys(b).sort().join(',');
    if (ka !== kb) fail(`TEXT 키 불일치: ${where} — ko{${ka}} en{${kb}}`);
    for (const k of Object.keys(a)) shape(a[k], b[k], `${where}.${k}`);
  } else if (typeof a !== typeof b) fail(`TEXT 타입 불일치: ${where}`);
}
shape(TEXT.ko, TEXT.en, 'TEXT');

if (NONDET.test(COMMON)) fail('common.js 에 비결정 API');
for (const lang of Object.keys(OUT)) {
  for (const s of SCENES) {
    const body = fs.readFileSync(path.join(__dirname, s.src), 'utf8');
    if (NONDET.test(body)) fail(`${s.src} 에 비결정 API`);
    if (!TEXT[lang][s.key]) fail(`TEXT.${lang}.${s.key} 없음`);
    const out = `// scene.js — fPM 소개 모션그래픽 ${s.dir} (${s.title}) [${lang}] — 생성 파일, 직접 고치지 않는다
// 원본: fPmIntro/mg/_src/TEXT.js(${lang}) + common.js + ${s.src} · 합성: node decks/app/fPmIntro/mg/_src/compose.js
(function (root) {
var LANG = '${lang}';
var L = ${JSON.stringify(TEXT[lang][s.key], null, 2)};
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
    if (PRIVATE.test(out)) fail(`${lang}/${s.dir} 에 공개 금지 문자열: ${out.match(PRIVATE)[0]}`);
    fs.mkdirSync(path.join(OUT[lang], s.dir), { recursive: true });
    fs.writeFileSync(path.join(OUT[lang], s.dir, 'scene.js'), out);
    console.log(`✅ ${path.relative(APP, path.join(OUT[lang], s.dir, 'scene.js'))}`);
  }
}
