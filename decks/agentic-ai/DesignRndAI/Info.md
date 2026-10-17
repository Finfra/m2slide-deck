---
name: Info
description: "[설계·R&D] AI 활용 도면·기술문서 분석·지식화 — 6일 24시간 과정"
date: 2026-09-19
purpose:
  primary: lecture
  secondary: []
---

# 주제

설계·R&D 담당자가 **도면·사양서·표준·특허를 AI 로 읽고 표로 고정하고 검증하는** 6일 24시간 과정.

# 청중

**제조기업 설계·R&D 실무자.** 건설기계용 미끄럼 베어링(부시)·핀 설계·R&D 를 예시 도메인으로 쓴다. 전제 지식은 기계설계 실무이고 **코딩 경험은 없다.**

* 🔴 **수강생은 코드를 쓰지 않는다.** AI 가 생성한 코드를 **실행·검증**하는 것은 범위에 포함된다
* 🔴 **자사 도면·사양서는 쓰지 않는다** — 보안 + 개인 구글 계정 사용
* 계정은 둘뿐 — 지급 ChatGPT(Pro), 각자의 개인 구글

# 분량

**1,440 분** (6일 × 240분)

# 스타일

**강의** — 3인칭 · `~함`/`~임` 줄임체 · 금지어 여러분·오늘·Let's

# 학습 목표

* 사양서·매뉴얼·표준 조항을 **항목·값·근거 쪽수** 3열 표로 고정한다
* 도면을 비전 LLM 으로 읽히고 **치수·공차·기호**를 대조한다
* 특허·논문·표준을 검색해 여러 자료를 **묶어 묻는다**
* 기술 보고서·시험 성적서·영문 초록을 **초안으로 받는다**
* 사내 문서를 **지식베이스로 묶고** 검증을 표준화한다

# 일차 구성

| 일차  | 주제                             | 모션그래픽(mg) |
| :---- | :------------------------------- | :------------- |
| 1일차 | 사양서·매뉴얼·표준 요약          | `mg/00-flow`(전체 흐름) · `mg/01-day1` |
| 2일차 | 도면 해석·OCR                    | `mg/02-day2`   |
| 3일차 | 특허·논문·시험 데이터            | `mg/03-day3`   |
| 4일차 | 보고서·성적서·영문·발표          | `mg/04-day4`   |
| 5일차 | 명세서·표준 추적·회의록·Obsidian | `mg/05-day5`   |
| 6일차 | RAG                              | `mg/06-day6`   |

* mg 는 일차 챕터 슬라이드 바로 뒤, 첫 절(`N-0.`) 앞에 한 장씩 둔다. 1일차에는 6일 전체 흐름 장이 하나 더 있다
* mg 장면은 `mg/_src/` 의 공통 도구 + 장면 원본을 `node mg/_src/compose.js` 로 합쳐 `mg/NN-*/scene.js` 를 만든다(생성물은 직접 고치지 않음)

# 🔴 재사용 판정 기준

아래를 어기면 **자산이 있어도 못 쓴다.**

| 기준   | 내용                                                                                      |
| :----- | :---------------------------------------------------------------------------------------- |
| 노코딩 | 수강생이 **코드를 쓰지 않는다**. AI 생성 코드의 **실행·검증**은 OK. 문법 학습·직접 코딩 ❌ |
| 계정   | 지급 **ChatGPT(Pro)** + **개인 구글** 둘뿐. **Claude 실습 자료 ❌**                        |
| 도메인 | 건설기계용 **미끄럼 베어링(부시)·핀**. 타 업종 예시는 가치가 낮다                         |
| 보안   | **자사 도면·사양서 ❌** — 공개 자료·가상 데이터만                                          |

# 참고자료 후보

* 부시·핀 데이터시트 · 틸트 버킷 매뉴얼 · ISO 3547 · KIPRIS Plus OpenAPI

# 빌드 옵션

* mode: chapter
* theme: default_lec
* theme_default_layout: contents
* slide_ratio: "4:3"
* cover_enabled: true
* toc_card_mode: false
* markmap_depth: 2
* chapter_markmap_depth: 2

> 실제 적용값은 [_config.yml](_config.yml) 이 정본이다. 본 절은 기획 의도 기록이다.

# 미디어 계획

* media_infographic: true   # htmlart — 일차당 37~43 블록
* media_mermaid: true       # flowchart(LR)·quadrant·mindmap·sequence
* media_chart: true         # Chart.js · d3 — 수치·개념도. 글꼴 크기를 JSON 에 명시한다
* media_motion_graphic: true # mg 7장 — 캔버스 장면, 비결정 API 금지
* media_demo_video: false
* design_mood: 밝은 라이트 테마. 노란 브러시 강조선(default_lec 기본)
* image_style: 실제 화면 캡처 위주. 일러스트 생성 없음

# 산출물 계획

* output_html: true
* output_epub: false
* output_subs_txt: false
* output_tts_txt: false
