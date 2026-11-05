# graphify — 코드베이스를 Knowledge Graph로

* 저자: (원고에 미기재)
* 카테고리: agentic-ai (Agentic AI)
* 요약: Claude Code 유저를 위한 15분 입문
* 발행본: https://finfra.github.io/m2slide/graphify/
* 원고 이력: 이 저장소가 첫 버전 관리 (2026-09-28 이관)

## 빌드

```bash
# m2slide 저장소에서
./m2slide.sh /경로/m2slide-deck/decks/agentic-ai/graphify

# 이 저장소를 m2slide 안 Projects_deck/ 로 clone 했다면 덱 이름만으로 된다
./m2slide.sh graphify
```

빌드 결과는 `slide/index.html` (git 미추적, 로컬 생성).

## 구성

* `graphify.ppt.md` — 빌드 원고 (single mode, `---` 구분). 빌드는 `graphify.ppt.md` 를 `graphify.md` 보다 우선 선택
* `graphify.md` — 같은 내용에 레이아웃 지시(`#layout-*`)만 없는 원고 — 내용 수정 시 두 파일을 함께 고친다
* `img/` — 이미지 자산 (`./img/...` 로 참조)
* `mg/` — 모션그래픽 4장(16:9). `mg/_src/` 가 원본(`SCENARIO.md` · 공통 도구 · 장면), `node mg/_src/compose.js` 로 `mg/NN-*/scene.js` 생성
* `_config.yml` — theme·layout 등 m2slide 설정
* `Info.md` — 기획 메타 (청중·분량·빌드 옵션 등)

## 라이선스

저장소 기본값 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — [LICENSE.md](../../../LICENSE.md). 상업적 이용은 별도 허락(`finfra@gmail.com`).
