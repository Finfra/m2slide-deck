# graphify mg 시나리오

* 대상: `graphify.md` (single mode, `#` 장 · `##` 슬라이드)
* 판형: 16:9 (`_config.yml` 에 `slide_ratio` 없음 → 기본값) — 캔버스 1920×1080, 30fps, 끝 화면에서 멈춤
* 테마: `default_lec` 색 체계 (AgenticCoding mg 와 같은 상수) · 시스템 글꼴
* 원칙
    - 원고에 있는 문구·수치만 화면에 올림 — 새 주장 없음
    - `renderFrame(ctx, t)` 결정론 — `Math.random`·`Date`·`performance.now` 금지
    - 글자 잘림 방지 — 칸 안 글자는 `fit()` 이 칸 폭에 맞춰 크기를 줄임
* 공통 틀: 머리(칩 + 제목, 0.2~0.8초) · 아래 한 줄(장면 끝 2~3초 전)

## 장 목록

| 장 | 폴더 | 위치(파일:절) | 한 줄 메시지 | 길이 |
| :-: | :-: | :-- | :-- | :-: |
| ① | `mg/00-flow` | graphify.md : «# 들어가며 — 왜 graphify인가» 첫 장 («## 대규모 코드베이스의 문제» 앞) | 문제에서 실전 워크플로까지 9개 장 — 한 번 빌드한 그래프로 필요한 노드만 질의 | 14초 |
| ② | `mg/01-pipeline` | graphify.md : «## 정의 & 산출물» 뒤 | 폴더·repo·URL → 노드·엣지 추출 → 커뮤니티 디텍션 → 3대 산출물 | 18초 |
| ③ | `mg/02-edge` | graphify.md : «## 핵심 개념: edge 신뢰도» 뒤 | 명시적 참조는 EXTRACTED, 의미 추론은 INFERRED(0.7), 불명확은 AMBIGUOUS | 15초 |
| ④ | `mg/03-token` | graphify.md : «## 권장 탐색 패턴» 뒤 | graph.json·GRAPH_REPORT.md 직접 Read 대신 query/path/explain 으로 필요한 노드만 | 17초 |

## ① 00-flow — 덱 전체 흐름

* 근거: graphify.md 장 제목 9개(«들어가며» ~ «정리 & 다음 단계») · 각 장 첫 슬라이드 요점 · «graphify가 해결하는 문제» (사전 분석 → knowledge graph 캐시, 질의 시 필요한 노드만)
* 화면 요소: 가로 선 위 정거장 9개(번호 원) · 정거장마다 장 이름 + 한 줄 요점(위·아래 번갈아) · 선을 따라 달리는 점 · 토큰 절약·CLI 실전 정거장 강조
* 시간표
    - 0.2 머리 «15분 입문 — 문제에서 실전 워크플로까지»
    - 1.0~8.6 선이 왼쪽에서 오른쪽으로 그어지고 점이 따라감 — 정거장 1~9 가 0.9초 간격으로 나타남 (원 → 장 이름 → 요점)
    - 9.4 정거장 5·6 (토큰 절약 · CLI 실전) 노란 테두리 강조 + 아래 «핵심» 표지
    - 11.0 아래 한 줄 «한 번 빌드한 그래프에서 필요한 노드만 질의»

## ② 01-pipeline — 입력 → 그래프 → 3대 산출물

* 근거: «정의 & 산출물» (입력: 코드 파일·마크다운 문서·GitHub repo URL / 노드·엣지 추출 EXTRACTED + INFERRED / 커뮤니티 디텍션 / graph.html·graph.json·GRAPH_REPORT.md) · «첫 빌드 흐름» (최초 빌드만 토큰 소비 → 이후 `graphify update .` AST-only, 무비용)
* 화면 요소: 왼쪽 입력 카드 3장 · 가운데 그래프 판(노드 15개 · 실선 EXTRACTED · 점선 INFERRED) · 판 위 단계 표지 · 커뮤니티 3개 색 묶음 · 오른쪽 산출물 카드 3장(이름 · 용도)
* 시간표
    - 0.2 머리
    - 1.0 / 1.5 / 2.0 입력 카드 3장
    - 2.6~3.6 입력 → 판 화살표
    - 3.6~5.9 노드 15개가 0.15초 간격으로 나타남 · 단계 표지 «노드·엣지 추출»
    - 6.0~8.4 엣지가 그어짐 (실선 먼저, 점선 나중) · 7.2 범례 EXTRACTED / INFERRED
    - 9.0~10.4 단계 표지 «커뮤니티 디텍션» · 노드가 3색으로 물들고 묶음 원이 퍼짐
    - 11.0 / 11.8 / 12.6 판 → 산출물 화살표 + 카드 (graph.html 시각화 / graph.json GraphRAG / GRAPH_REPORT.md 자연어 보고서)
    - 14.6 아래 한 줄 «최초 빌드만 토큰 소비 → 이후 graphify update . (AST-only, 무비용)»

## ③ 02-edge — edge 신뢰도

* 근거: «핵심 개념: edge 신뢰도» (추출 방식 분기 — 명시적 참조 → EXTRACTED · 의미 추론 → INFERRED · 불명확 → AMBIGUOUS / EXTRACTED 신뢰도 높음(함수 호출, import 등) / INFERRED 문맥 기반 추론 avg confidence 0.7) · «graphify가 해결하는 문제» (EXTRACTED + INFERRED edge로 숨겨진 연결 발견)
* 화면 요소: 왼쪽 «코드/문서» 문서 아이콘 · «추출 방식» 마름모 · 오른쪽 3줄(분기 꼬리표 · 노드 두 개 사이 선 모양 · 이름 · 설명) · INFERRED 줄의 신뢰도 막대 0 → 0.7
* 시간표
    - 0.2 머리
    - 1.0 «코드/문서» 아이콘 → 1.8 화살표 → 2.2 «추출 방식» 마름모
    - 3.0 EXTRACTED 줄 — 분기 화살표 → «명시적 참조» → 노드 쌍 실선 → «함수 호출, import 등 · 신뢰도 높음»
    - 5.2 INFERRED 줄 — «의미 추론» → 점선 → «문맥 기반 추론» · 6.2~7.2 신뢰도 막대 0 → 0.7
    - 7.8 AMBIGUOUS 줄 — «불명확» → 흐린 점선
    - 9.8 EXTRACTED·INFERRED 줄 테두리 강조
    - 12.0 아래 한 줄 «EXTRACTED + INFERRED edge로 숨겨진 연결 발견»

## ④ 03-token — 필요한 노드만

* 근거: «절대 하지 말 것» (`Read graphify-out/graph.json` 수백 KB 절대 금지 · `GRAPH_REPORT.md` 300+ 줄 bash 발췌만 허용) · «대규모 코드베이스의 문제» (컨텍스트 창 낭비) · «권장 탐색 패턴» (query / path / explain) · «path & explain 사용 예시» (Info.md → agenda-designer → AGENDA.md → generate-slides.js → slide/index.html) · «코드베이스 탐색 워크플로» (타겟 파일만 Read) · «graphify가 해결하는 문제» (필요한 노드만 → 토큰 최소화)
* 화면 요소: 왼쪽 ❌ 판(Read 두 줄 · 크기 꼬리표 · 컨텍스트 창 막대가 넘쳐 빨개짐 · ✗) · 오른쪽 ✅ 판(터미널 카드에 명령 3줄 타자 · path 결과 5마디 세로 사슬 · 컨텍스트 창 막대 조금만 · ✓ «타겟 파일만 Read»)
* 시간표
    - 0.2 머리
    - 1.0 ❌ 판 → 1.6 / 2.4 Read 두 줄 + 꼬리표
    - 3.4~5.2 컨텍스트 창 막대가 차오르고 넘침 → 빨간색 «컨텍스트 창 낭비» · 5.6 ✗
    - 6.4 ✅ 판 · 터미널 카드 → 6.8 / 7.6 / 8.4 명령 3줄 타자
    - 9.4~11.4 path 사슬 5마디가 0.5초 간격으로 켜짐
    - 12.0~12.8 오른쪽 컨텍스트 창 막대 조금만 (초록) · 13.0 ✓ «타겟 파일만 Read»
    - 14.4 아래 한 줄 «질의 시 필요한 노드만 가져옴 → 토큰 최소화»
