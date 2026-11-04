---
title: 항성의 진화 — 탄생에서 죽음까지
subtitle: 질량이 가르는 별의 운명
author: ""
date: 2026-07-07
type: ppt
theme: default
theme_default_layout: contents
markmap_depth: 2
---

## 밤하늘의 별빛, 그 안에 담긴 시간

* 우리가 보는 별빛은 **수백~수천 년 전에 출발한 빛** — 별을 본다는 건 과거를 보는 것
* 별도 사람처럼 **태어나고, 살고, 죽는다**
* **오늘의 질문**: 무엇이 별의 수명과 최후를 결정하는가? → 핵심 열쇠는 **질량**

```p5
let t = 0;
p.setup = function() {
  p.createCanvas(el.clientWidth, el.clientHeight, p.WEBGL);
  p.noStroke();
};
p.draw = function() {
  p.background(6, 8, 20);
  p.ambientLight(45);
  p.pointLight(255, 220, 150, 0, 0, 400);
  const R = Math.min(p.width, p.height) * 0.28;
  p.push();
  p.rotateY(t);
  p.rotateX(t * 0.35);
  p.emissiveMaterial(255, 140, 30);
  p.sphere(R, 40, 30);
  p.pop();
  t += 0.006;
};
```

---

#layout-_mg

## 별의 일생 — 성운에서 최후까지, 질량이 가르는 두 갈래

```mg
src: mg/00-lifecycle
```

---

## 별의 탄생: 성운에서 원시별로

* 별은 우주를 떠도는 거대한 **가스·먼지 구름(성운)**에서 시작됨
* 구름 일부가 **중력**으로 뭉치면 밀도가 높아지고 중심이 뜨거워짐
* 수축한 뜨거운 덩어리 = **원시별(protostar)**

::: htmlart process
* 성운
  - 가스·먼지 구름
* 중력 수축
  - 밀도 상승·가열
* 원시별
  - 빛나기 직전
:::

> 중력이 물질을 끌어모아 '불씨'를 지필 준비를 하는 단계

---

## 원시별에서 주계열성으로

* 원시별 중심 온도가 **약 1000만 K**에 도달하면 **수소 핵융합 점화**
* 바깥으로 미는 **복사압**과 안으로 당기는 **중력**이 균형을 이룸
* 이 안정 상태의 별이 **주계열성** — 우리 태양도 지금 이 단계(약 46억 년째)

::: htmlart process
* 온도 상승
  - 중심 약 1000만 K
* 수소 점화
  - 핵융합 시작
* 힘의 균형
  - 복사압 = 중력
* 주계열성
  - 안정 상태
:::

---

#layout-_mg

## 점화 — 수소 점화와 힘의 균형

```mg
src: mg/01-ignition
```

---

## 주계열성: 별의 청년기

* 별이 일생의 **약 90%**를 보내는 가장 길고 안정된 시기
* 핵에서 **수소 → 헬륨** 융합이 꾸준히 진행
* **질량이 클수록 더 뜨겁고 밝지만, 연료를 빨리 태워 수명은 짧다**

| 질량 | 색·온도 | 수명(대략) |
| :--- | :--- | :--- |
| 태양의 0.5배 | 붉고 차가움 | 수천억 년 |
| 태양급(1배) | 노랑 | 약 100억 년 |
| 태양의 10배 | 푸르고 뜨거움 | 수천만 년 |

---

#layout-_mg

## 질량과 수명 — 질량이 클수록 밝고, 수명은 짧다

```mg
src: mg/02-mass-life
```

---

## 수소 핵융합 — 별의 에너지원

* 수소 원자핵 4개가 합쳐져 헬륨 1개가 되며 **막대한 에너지** 방출
* 태양 중심(**약 1400만 K**)은 매초 **620만 톤**의 수소를 융합
* "질량 손실이 곧 에너지" — 아인슈타인의 **E=mc²**가 별 속에서 실현됨

```p5
let protons = [], flash = 0;
function reset() {
  protons = [];
  for (let i = 0; i < 4; i++) {
    protons.push({ a: p.TWO_PI * i / 4, r: Math.min(p.width, p.height) * 0.38, sp: 0.02 + i * 0.004 });
  }
}
p.setup = function() {
  p.createCanvas(el.clientWidth, el.clientHeight);
  p.textAlign(p.CENTER, p.CENTER);
  reset();
};
p.draw = function() {
  const cx = p.width / 2, cy = p.height / 2, D = Math.min(p.width, p.height);
  p.background(10, 12, 30);
  p.noStroke();
  p.fill(255, 160, 40, 40); p.ellipse(cx, cy, D * 0.42);
  p.fill(255, 200, 90, 90); p.ellipse(cx, cy, D * 0.16);
  let allClose = true;
  for (const pr of protons) {
    pr.r -= 0.7; pr.a += pr.sp;
    if (pr.r > 16) allClose = false;
    const x = cx + Math.cos(pr.a) * pr.r, y = cy + Math.sin(pr.a) * pr.r;
    p.fill(120, 190, 255); p.ellipse(x, y, 20, 20);
    p.fill(255); p.textSize(12); p.text('p', x, y);
  }
  if (allClose && flash <= 0) flash = 32;
  if (flash > 0) {
    p.fill(255, 240, 180, flash * 6);
    p.ellipse(cx, cy, (34 - flash) * 10);
    flash--;
    p.fill(80, 230, 170); p.ellipse(cx, cy, 30, 30);
    p.fill(15); p.textSize(13); p.text('He', cx, cy);
    if (flash === 0) reset();
  }
};
```

---

## HR도란 무엇인가

* **HR도(헤르츠스프룽-러셀 도표)** = 별의 '지도'이자 **진화 경로도**
* 가로축 **표면 온도**(오른쪽=차가움), 세로축 **밝기(광도)**(위=밝음)
* 별을 찍으면 진화 단계별로 특정 위치에 모임 — 아래는 대화형 HR도

```p5
let stars = [];
function col(tx) {
  return p.color(p.map(tx, 0, 1, 130, 255), p.map(tx, 0, 1, 175, 120), p.map(tx, 0, 1, 255, 60));
}
p.setup = function() {
  p.createCanvas(el.clientWidth, el.clientHeight);
  for (let i = 0; i < 60; i++) { let tx = p.random(0.05, 0.95); stars.push({ x: tx, y: tx + p.random(-0.05, 0.05), g: 'MS' }); }
  for (let i = 0; i < 12; i++) stars.push({ x: p.random(0.65, 0.95), y: p.random(0.06, 0.3), g: 'RG' });
  for (let i = 0; i < 12; i++) stars.push({ x: p.random(0.1, 0.4), y: p.random(0.7, 0.92), g: 'WD' });
};
p.draw = function() {
  p.background(12, 14, 32);
  const m = 46, W = p.width - m * 2, H = p.height - m * 2;
  p.stroke(120); p.strokeWeight(1);
  p.line(m, m, m, m + H); p.line(m, m + H, m + W, m + H);
  p.noStroke(); p.fill(185); p.textSize(12); p.textAlign(p.CENTER);
  p.text('← 뜨거움    표면 온도    차가움 →', m + W / 2, m + H + 28);
  p.push(); p.translate(m - 30, m + H / 2); p.rotate(-p.HALF_PI); p.text('어두움 ← 광도 → 밝음', 0, 0); p.pop();
  for (const s of stars) {
    const px = m + s.x * W, py = m + s.y * H;
    const tw = 1 + 0.4 * Math.sin(p.frameCount * 0.05 + s.x * 20);
    p.fill(col(s.x));
    const r = (s.g === 'RG' ? 12 : s.g === 'WD' ? 5 : 7) * tw;
    p.ellipse(px, py, r, r);
  }
  p.textSize(13);
  p.fill(120, 200, 255); p.text('주계열', m + W * 0.5, m + H * 0.5);
  p.fill(255, 120, 90); p.text('적색거성', m + W * 0.8, m + H * 0.16);
  p.fill(200, 220, 255); p.text('백색왜성', m + W * 0.25, m + H * 0.86);
};
```

---

## HR도로 읽는 별의 위치

* **주계열** — 왼쪽 위(뜨겁고 밝음)에서 오른쪽 아래로 이어지는 **대각선 띠**
* **적색거성** — 오른쪽 위: 차갑지만 거대해서 매우 밝음
* **백색왜성** — 왼쪽 아래: 뜨겁지만 작아서 어두움
* 별은 일생 동안 이 지도 위를 **이동** — 현재 위치만 봐도 **나이와 운명을 짐작**

---

## 질량이 운명을 가른다

* 별의 최후는 태어날 때의 **질량 하나**로 거의 결정됨
* 기준선: **태양 질량의 약 8배**

::: htmlart hierarchy
* 주계열성 (수소 소진)
  - 8배 미만 · 저·중질량
    - 적색거성
    - 백색왜성
  - 8배 이상 · 고질량
    - 초거성 · 초신성
    - 중성자별 / 블랙홀
:::

> "The evolutionary processes of stars depend upon their initial mass." — NASA Chandra

---

## 저·중질량 별의 최후: 적색거성

* 핵의 **수소가 고갈**되면 균형이 무너져 바깥층이 크게 부풀어 **적색거성**으로 팽창
* 헬륨을 융합해 **탄소·산소** 생성 — 겉은 붉고 차갑지만 부피가 커 매우 밝음
* 태양이 적색거성이 되면 **수성·금성 궤도까지** 삼킴 (좌: 현재 태양 · 우: 적색거성)

```p5
let t = 0;
p.setup = function() {
  p.createCanvas(el.clientWidth, el.clientHeight, p.WEBGL);
  p.noStroke();
};
p.draw = function() {
  p.background(6, 8, 20);
  p.ambientLight(50);
  p.pointLight(255, 230, 180, -200, -200, 400);
  const s = Math.min(p.width, p.height);
  p.push();
  p.translate(-s * 0.30, 0, 0);
  p.rotateY(t);
  p.emissiveMaterial(255, 210, 80);
  p.sphere(s * 0.05, 24, 18);
  p.pop();
  const rg = s * 0.26 * (1 + 0.04 * Math.sin(t * 2.2));
  p.push();
  p.translate(s * 0.12, 0, 0);
  p.rotateY(-t * 0.5);
  p.emissiveMaterial(225, 70, 40);
  p.sphere(rg, 40, 30);
  p.pop();
  t += 0.01;
};
```

---

## 행성상성운과 백색왜성

* 적색거성의 **바깥층이 우주로 방출** → **행성상성운(planetary nebula)**
* 남은 뜨거운 핵 = **백색왜성** — 더 이상 핵융합 없이 서서히 식어감
* **극한의 밀도**: 지구만 한 크기에 태양 질량이 담김. 태양의 최종 운명

::: htmlart process
* 적색거성
  - 외피 팽창
* 외피 방출
  - 행성상성운
* 백색왜성
  - 뜨거운 잔핵
* 냉각
  - 서서히 식음
:::

---

## 고질량 별의 최후: 초거성에서 초신성으로

* 태양 질량 **8배 이상**의 별은 헬륨 → 탄소 → … → **철(Fe)**까지 차례로 융합
* **철은 융합해도 에너지가 나오지 않음** → 중심이 순식간에 붕괴
* **초신성(supernova) 대폭발** — 한 별이 **은하 전체보다 밝게** 빛나는 순간

```p5
let phase = 0, tmr = 0, parts = [], R = 0;
p.setup = function() {
  p.createCanvas(el.clientWidth, el.clientHeight);
  R = Math.min(p.width, p.height) * 0.16;
};
p.draw = function() {
  const cx = p.width / 2, cy = p.height / 2;
  p.background(8, 10, 26, 60);
  p.noStroke();
  tmr++;
  if (phase === 0) {
    const rr = R * (1 + 0.12 * Math.sin(p.frameCount * 0.15));
    p.fill(255, 180, 60); p.ellipse(cx, cy, rr * 2);
    if (tmr > 120) { phase = 1; tmr = 0; }
  } else if (phase === 1) {
    const rr = p.map(tmr, 0, 30, R, 6, true);
    p.fill(180, 200, 255); p.ellipse(cx, cy, rr * 2);
    if (tmr > 30) {
      phase = 2; tmr = 0; parts = [];
      for (let i = 0; i < 160; i++) { const a = p.random(p.TWO_PI), sp = p.random(3, 10); parts.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 255 }); }
    }
  } else {
    p.fill(255, 240, 200, 120); p.ellipse(cx, cy, p.map(tmr, 0, 20, 20, p.width, true));
    for (const q of parts) {
      q.x += q.vx; q.y += q.vy; q.life -= 3;
      p.fill(255, p.random(120, 220), 60, q.life); p.ellipse(q.x, q.y, 5, 5);
    }
    if (tmr > 90) { phase = 0; tmr = 0; }
  }
};
```

---

## 초신성 이후: 중성자별과 블랙홀

* 초신성 폭발 후 남는 핵의 운명도 **질량**이 결정

| 초기 질량 | 최종 잔해 | 특징 |
| :--- | :--- | :--- |
| 태양 8배 미만 | 백색왜성 | 지구 크기 |
| 태양 8~20배 | 중성자별 | 도시 크기, 태양보다 무거움 |
| 태양 20배 이상 | 블랙홀 | 빛조차 탈출 못 함 |

> 중성자별 **한 찻숟가락 = 수십억 톤** — 맨해튼 섬 크기에 태양보다 무거운 질량을 압축 (NASA · Kurzgesagt)

---

#layout-_mg

## 초기 질량 → 최종 잔해

```mg
src: mg/03-remnant
```

---

## 항성 핵합성 — 우리는 별의 후손이다

* 빅뱅 직후 우주엔 **수소·헬륨**뿐 — 탄소·산소·철은 **별 속 핵융합·초신성**에서 생성
* 별이 죽으며 이 원소를 우주로 되돌려주고, 그 물질이 **새 별·행성·생명**을 만듦
* 우리 몸의 탄소·산소·철도 모두 옛 별의 잔해 — *We are star dust*

::: htmlart cycle
* 성운
  - 수소·헬륨
* 별 탄생
  - 핵융합 점화
* 무거운 원소 생성
  - 탄소·산소·철
* 초신성 방출
  - 우주로 환원
:::

---

## 정리: 별의 일생, 질량이 쓰는 각본

* 모든 갈림길의 열쇠는 **초기 질량** 하나
* 저·중질량 → 적색거성 → **백색왜성** (조용한 최후)
* 고질량 → 초신성 → **중성자별 / 블랙홀** (격렬한 최후)
* 별의 죽음이 곧 **다음 세대와 생명의 씨앗**

::: htmlart process
* 성운
* 원시별
* 주계열
* 최후
  - 질량이 결정
:::

---

## :fa-clock: 태양의 일생 타임라인

* 태양 질량 별의 생애를 **시간 순 타임라인**으로 정리

::: htmlart timeline
* 0년 — 성운 수축
  - 가스·먼지 구름이 중력으로 뭉치며 원시별 형성 시작
* 5000만 년 — 주계열 진입
  - 중심 온도 1000만 K 도달, 수소 핵융합 점화로 안정 상태 돌입
* 100억 년 — 적색거성 팽창
  - 중심 수소 고갈, 외피가 크게 부풀어 지구 궤도 부근까지 확장
* 121억 년 — 행성상성운 방출
  - 바깥층을 우주로 날려 보내며 화려한 가스 껍질 형성
* 122억 년 — 백색왜성 잔해
  - 지구 크기로 압축된 뜨거운 핵만 남아 서서히 식어감
:::

---

## 질문과 나눔

* 별의 일생에서 **가장 인상 깊었던 단계**는?
* 우리 태양의 미래(적색거성 → 백색왜성)에 대한 궁금증
* HR도로 실제 별을 읽어보고 싶다면?
* **감사합니다** 🌟
