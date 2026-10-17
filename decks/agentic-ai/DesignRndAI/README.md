# 설계·R&D 생성형 AI 활용 — 도면·기술문서 분석·지식화

* 저자: 남중구 (핀프라)
* 카테고리: agentic-ai
* 요약: 설계·R&D 실무자가 도면·사양서·표준·특허를 AI 로 읽고 표로 고정하고 검증하는 6일 24시간 강의 덱. 읽기·보기·찾기·쓰기·남기기·쌓기 순서이며, 일차마다 핵심을 보여 주는 모션그래픽(mg) 장과 전체 흐름 장이 있다. 코드를 쓰지 않는 노코딩 과정이다.

## 빌드

```bash
# m2slide 저장소에서
./m2slide.sh /경로/m2slide-deck/decks/agentic-ai/DesignRndAI
```

빌드 결과는 `slide/index.html` (git 미추적, 로컬 생성). EPUB 은 `--epub` 옵션.

## 구성

* `markdown/` — 슬라이드 소스 (`AGENDA.md` + `01-day1.md` ~ `06-day6.md`)
* `img/` — 이미지 자산 (`./img/...` 로 참조)
* `css/` — 이 덱의 토큰 CSS (`lec-tokens.css`). `_config.yml` 의 `font_import` 가 m2slide 루트 기준 경로로 가리킴
* `mg/` — 모션그래픽 7장. `mg/_src/` 가 원본(공통 도구 + 장면), `node mg/_src/compose.js` 로 `mg/NN-*/scene.js` 생성
* `_config.yml` — theme(`default_lec`)·4:3·layout 등 m2slide 설정
* `Info.md` — 기획 메모(주제·청중·학습 목표·재사용 기준)

## 라이선스

저장소 기본값 CC BY-NC-SA 4.0 — [LICENSE.md](../../../LICENSE.md).
