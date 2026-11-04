# AI Prompt Engineering으로 시작하는 AI기반 문서작성 실습

* 저자: 남중구 (핀프라)
* 카테고리: agentic-ai (Agentic AI)
* 요약: Prompt Engineering 기초부터 Prompt-to-Publish 파이프라인까지
* 발행본: https://finfra.github.io/m2slide/GenContentProd/
* 원고 이력: 2026-09-28 이전 이력은 [Finfra/m2slide](https://github.com/Finfra/m2slide) 저장소 `Projects/GenContentProd/` 에 있음

## 빌드

```bash
# m2slide 저장소에서
./m2slide.sh /경로/m2slide-deck/decks/agentic-ai/GenContentProd

# 이 저장소를 m2slide 안 Projects_deck/ 로 clone 했다면 덱 이름만으로 된다
./m2slide.sh GenContentProd
```

빌드 결과는 `slide/index.html` (git 미추적, 로컬 생성).

## 구성

* `markdown/` — 슬라이드 소스 (chapter mode — `AGENDA.md` + 챕터 `.md`)
* `img/` — 이미지 자산 (`./img/...` 로 참조)
* `mg/` — 모션그래픽 6장 (`#layout-_mg`, 3:2 · 1620×1080). `mg/_src/` 가 원본(`SCENARIO.md` · 공통 도구 · 장면), `node decks/agentic-ai/GenContentProd/mg/_src/compose.js` 로 `mg/NN-*/scene.js` 생성
* `_config.yml` — theme·layout 등 m2slide 설정
* `Info.md` — 기획 메타 (청중·분량·빌드 옵션 등)

## 라이선스

저장소 기본값 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — [LICENSE.md](../../../LICENSE.md). 상업적 이용은 별도 허락(`finfra@gmail.com`).
