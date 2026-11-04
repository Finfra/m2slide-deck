# GenContentProd mg 시나리오

* 대상: `markdown/01-opening.md` · `03-prompt-engineering.md` · `04-diffusion-visual.md` · `10-obsidian.md` · `11-pandoc.md` · `13-mini-project.md`
* 판형: 3:2 (`slide_ratio: "3:2"`) — 캔버스 1620×1080, 30fps, 끝 화면에서 멈춤
* 테마: `default_lec` 색 체계 (AgenticCoding mg 와 같은 상수) · 시스템 글꼴
* 원칙
    - 원고에 있는 문구·수치만 화면에 올림 — 새 주장 없음
    - `renderFrame(ctx, t)` 결정론 — `Math.random`·`Date`·`performance.now` 금지 (노이즈 무늬는 `hash01(i)` 고정 수열)
    - 글자 잘림 방지 — 칸 안 글자는 `fit()` 이 칸 폭에 맞춰 크기를 줄임
* 공통 틀: 머리(칩 + 제목, 0.2~0.8초) · 아래 한 줄(장면 끝 2~3초 전)

## 장 목록

| 장 | 폴더 | 위치(파일:절) | 한 줄 메시지 | 길이 |
| :-: | :-: | :-- | :-- | :-: |
| ① | `mg/00-flow` | 01-opening.md : «강의 목표» | Part1 도구 6장 → Part2 4장 — 목표 3개를 거쳐 출판 문서 1편 | 18초 |
| ② | `mg/01-patterns` | 03-prompt-engineering.md : «Q&A + 6대 패턴 정리» | 6대 패턴 한 줄씩 — 시작은 Role + Constraint + Format | 18초 |
| ③ | `mg/02-visual5` | 04-diffusion-visual.md : «AI 시각 자산 5종 비교» | 용도에 맞춰 5종 중 하나 — 표지는 Diffusion, 정형 도식은 Mermaid | 18초 |
| ④ | `mg/03-obsidian` | 10-obsidian.md : «Obsidian 정리 — Q&A·트러블슈팅» | 폴더 → 파일 → 연결 → 시각화 → 증강 | 18초 |
| ⑤ | `mg/04-pandoc` | 11-pandoc.md : «Pandoc 변환 파이프라인 — 단계별 흐름» | Markdown 1소스 → 명령 1줄 → 5종 출력 | 17초 |
| ⑥ | `mg/05-p2p` | 13-mini-project.md : «5단계 산출물 명세» | 체크포인트 6개 × 10분 — 60분 안에 출판까지 | 19초 |

## ① 00-flow — 1일차 흐름

* 근거: 01-opening «강의 목표» (목표 1~3) · AGENDA.md (01~10 장 제목) · 08-excalidraw-wrap «Part1 정리 + 휴식 안내» (Part2 예고) · 14-closing «클로징 — 1일차 정리» (오늘 가져갈 것)
* 화면 요소: Part1 띠(칩 6개: 01 6대 패턴 · 02 Diffusion·인포그래픽 · 03 Claude Design · 04 VSCode · 05 Markdown·Mermaid · 06 Excalidraw) · Part2 띠(칩 4개: 07 Obsidian · 08 Pandoc · 09 NotebookLM · 10 미니 프로젝트) · 끝의 «출판 가능한 문서 1편» 문서 아이콘 · 아래 목표 카드 3장(카드가 뜨면 해당 칩이 같은 색으로 켜짐)
* 시간표
    - 0.2 머리 «1일차 · 프롬프트에서 출판까지»
    - 1.0~3.1 Part1 칩 6개 0.35초 간격
    - 3.6~4.7 Part2 칩 4개 0.35초 간격
    - 5.4 오른쪽 끝 «출판 가능한 문서 1편» 문서 + 10 → 문서 화살표
    - 7.0 목표1 카드 → 칩 01 켜짐
    - 8.6 목표2 카드 → 칩 02·05·06 켜짐
    - 10.2 목표3 카드 → 칩 07·08·09 켜짐
    - 12.0 칩 10 테두리 강조 → 12.6 문서 ✓
    - 14.6 아래 한 줄 «오늘 가져갈 것: 출판 문서 1편 · 도구 10종 첫 경험 · Vault 1개»

## ② 01-patterns — 6대 패턴

* 근거: 03 «Q&A + 6대 패턴 정리» (한 줄 정리·실무 권장) · «Zero-shot» · «Few-shot» (예시 2~3쌍) · «Chain of Thought» (단계별로 생각해라) · «Role Prompting» (당신은 ○○ 전문가다) · «Constraint·Format» (길이·구조·금지어, Role + Constraint + Format 조합 권장) · «Self-Consistency·Self-Refine» (다수결 / 되돌아보기)
* 화면 요소: 3×2 카드 6장(번호 · 패턴 이름 · 한 줄 정리 · 형태 힌트) · 아래 «시작 조합» 띠 (Role + Constraint + Format) · 덧붙임 칩 2개(+ CoT 어려운 작업 / + Few-shot 양식 일관성)
* 시간표
    - 0.2 머리
    - 1.0~5.0 카드 6장 0.8초 간격 (이름 → 한 줄 정리 → 힌트)
    - 7.0 Role·Constraint·Format 카드 테두리 노랗게, 나머지 흐려짐
    - 7.6~9.4 세 이름이 카드에서 아래 띠로 날아와 «Role + Constraint + Format» 이 됨
    - 10.4 띠 왼쪽 «시작» 꼬리표
    - 11.6 «+ CoT — 어려운 작업» 칩 (CoT 카드 다시 켜짐)
    - 12.8 «+ Few-shot — 양식 일관성» 칩 (Few-shot 카드 다시 켜짐)
    - 15.0 아래 한 줄 «시작은 Role + Constraint + Format 3종 조합으로 충분»

## ③ 02-visual5 — AI 시각 자산 5종

* 근거: 04 «AI 시각 자산 5종 비교» (5종 · 비교 4축 · 빠른 선택 가이드) · «Diffusion 모델 개요» (노이즈 → 단계적으로 노이즈 제거) · 08 «Mermaid vs Excalidraw — 언제 무엇을» (정형·코드 기반 / 발산·손그림)
* 화면 요소: 위 비교 4축 칩(자유도 · 일관성 · 수정 용이성 · 텍스트 정확도) · 왼쪽 용도 5줄 · 오른쪽 도구 카드 5장(작은 그림: 노이즈가 걷히는 격자 / 막대 / SVG 꺾은선 / 상자-화살표 / 손그림 구불선) · 용도 → 도구 화살표
* 시간표
    - 0.2 머리
    - 1.0 비교 4축 칩 4개 (0.25초 간격)
    - 2.4~4.0 왼쪽 용도 5줄 0.4초 간격
    - 4.6~6.2 오른쪽 도구 카드 5장 0.4초 간격
    - 7.0 / 8.6 / 10.2 / 11.8 / 13.4 용도 → 도구 화살표가 하나씩 그어지고 짝이 노랗게 켜짐 (Diffusion 격자는 7.0~8.6 동안 노이즈가 걷힘)
    - 15.0 모든 짝 켜짐 · 아래 한 줄 «본 강의는 5종 모두 1회 이상 직접 사용»

## ④ 03-obsidian — Obsidian 5단계

* 근거: 10 «Obsidian 정리» (폴더(Vault) → 파일(Note) → 연결(Link·Tag) → 시각화(그래프) → 증강(플러그인)) · «Vault 구조·관리» (`.obsidian/` 자동 생성) · «볼트 생성·노트 작성» (welcome · prompt-engineering) · «[[링크]]·#태그 실습» (#lec #day1, 노드 2개·엣지 1개) · «Smart Connections» (유사 노트 추천 · 출처 인용) · «Obsidian 핵심 특징» (로컬 우선 · AI 친화 포맷)
* 화면 요소: 위 5단계 칩 + 진행 커서 · 왼쪽 볼트 판(`lec-vault/` · `.obsidian/` · 노트 2개 · 링크·태그 줄) · 오른쪽 위 그래프 뷰(노드 2 · 엣지 1) · 오른쪽 아래 플러그인 카드(Smart Connections)
* 시간표
    - 0.2 머리
    - 1.0~2.6 단계 칩 5개 0.4초 간격
    - 3.2 ① 폴더 — 볼트 판 + `lec-vault/` + `.obsidian/` 줄
    - 5.6 ② 파일 — `welcome.md` · `prompt-engineering.md` 줄
    - 8.0 ③ 연결 — `[[prompt-engineering]]` · `#lec` `#day1`
    - 10.4 ④ 시각화 — 그래프 뷰 노드 2개 → 엣지 1개
    - 12.8 ⑤ 증강 — Smart Connections 카드 (유사 노트 추천 · 출처 인용 Q&A)
    - 15.2 아래 한 줄 «노트는 로컬 .md 파일 — AI 도구에 그대로 입력»

## ⑤ 04-pandoc — Pandoc 출판 파이프라인

* 근거: 11 «Pandoc 변환 파이프라인 — 단계별 흐름» (입력·처리·출력 5종) · «Pandoc 핵심 개요» (Markdown 한 번 작성) · «설치 확인 + CLI 기본 문법» (`pandoc {입력} -o {출력} [옵션]`, 확장자로 포맷 자동 판단) · «Pandoc는 역으로 변환 가능?» (PDF 만 LaTeX·wkhtmltopdf) · «Pandoc 정리» (출력별 강점, 1소스 N채널)
* 화면 요소: 왼쪽 `welcome.md` 문서(Frontmatter + 본문) · 가운데 터미널 카드(명령이 한 글자씩 입력) · 오른쪽 출력 카드 5장(DOCX · PDF · PPTX · HTML · RevealJS + 강점 한 줄) · PDF 카드 «조판 엔진 필요» 꼬리표
* 시간표
    - 0.2 머리
    - 1.0 입력 문서 · 1.6 Frontmatter 줄 강조
    - 2.6 터미널 카드 → 3.0~5.4 `pandoc welcome.md -o welcome.docx` 입력
    - 5.8 입력 → 터미널 화살표
    - 6.6~9.0 출력 카드 5장 0.6초 간격 + 터미널 → 카드 갈래 화살표 (명령 끝 확장자가 docx → pdf → pptx → html 로 바뀜, RevealJS 는 `--to=revealjs`)
    - 10.2 PDF 카드 «조판 엔진 필요» 꼬리표 (원고: PDF 만 LaTeX·wkhtmltopdf 별도 의존)
    - 11.4 출력 카드마다 ✓ (0.25초 간격)
    - 14.0 아래 한 줄 «한 번 작성 → 다중 출판 (1소스 N채널)»

## ⑥ 05-p2p — Prompt-to-Publish 미니 프로젝트

* 근거: 13 «미니 프로젝트 개요» (60분, 체크포인트 6개 × 약 10분, 산출물 DOCX 또는 PDF) · «5단계 산출물 명세» (단계별 산출물, ④ 또는 ⑤ 생략 가능) · «진행 중 도움 요청» (⑥ 출판 완성은 필수) · 14 «강사 총평» («60분 안에 출판까지»)
* 화면 요소: 위 60분 시간 막대(6칸 · 0/10/…/60분 눈금 · 재생 머리) · 칸 아래 단계 이름 · 오른쪽 조립되는 문서(제목줄 → 본문 줄 → 이미지 → 다이어그램 → 링크·태그 → DOCX·PDF 도장) · 왼쪽 아래 현재 단계 산출물 카드 · ④·⑤ «생략 가능» 점선 꼬리표
* 시간표
    - 0.2 머리
    - 1.0 시간 막대 틀 + 눈금
    - 2.0~14.0 재생 머리가 0 → 60분 (단계마다 2초) — 지나는 칸이 노랗게 차고, 산출물 카드 문구가 바뀌고, 문서에 조각이 붙음
    - 9.6 ④·⑤ 칸 위 «시간 초과 시 생략 가능» 꼬리표
    - 14.2 문서에 «DOCX · PDF» 도장 + ✓
    - 15.0 «⑥ 출판 완성은 필수» 꼬리표
    - 16.2 아래 한 줄 «60분 안에 프롬프트에서 출판까지»

## 원고 삽입

* 형식: AgenticCoding `01-part1.md` 34행 부근과 같음 — `---` 다음 `#layout-_mg` 장 + 제목 + ` ```mg ` 펜스 `src: mg/NN-*`
* 위치: 각 근거 장 바로 뒤
* 이 덱은 장 제목이 `##` (`#` 은 챕터 제목) 이므로 mg 장 제목도 `##`
