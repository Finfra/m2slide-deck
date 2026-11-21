---
title: Projects_deck Issue Management
description: m2slide 프로젝트 갤러리 이슈 추적
---

# Issue Management

* Issue HWM: 3
## 📋 상태 요약
- 신규 등록: nPTiR 스캐폴드 생성 완료

# 🌱 이슈후보

# 🚧 진행중

# 📕 중요

# 📙 일반

## Issue3: CLAUDE.md L1 아이덴티티 frontmatter 신설 — prj·identity·not·outcome·handles (/route 판정 불가 해소) (등록: 2026-11-22, 출처: fbot-architect-req14 · prj40#Req14 · fbotreq-1795274946-77855126)
* 목적: `CLAUDE.md` 에 L1 아이덴티티 frontmatter 가 없어 `___pm/Identity.md` 42a 행이 전부 «⚠️ 미기재»이고, `/route` 가 이 prj 를 이름(E4)으로만 잡는다. prj40#Req14 구조 영향 분석(prj40 `_doc_work/report/req14-structure-impact_2026.11.22.md` «prj42a»)에서 심각도 중으로 판정됐다
* 상세:
    - 스키마 정본: prj6 `~/_git/___oracle/_doc_arch/project-identity-scheme.md` · 선례: prj41 `~/_git/__all/videoMaker/CLAUDE.md` 1~15행(`prj`·`identity`·`not`·`outcome`·`handles` + 스키마 주석)
    - 값은 이 repo 의 사실(README·LICENSE·`decks/` 구성·Request 이력 — 공개 덱 갤러리 `Finfra/m2slide-deck`, m2slide(prj42) 가 만든 덱의 고객 정보 제거판을 모아 GitHub Pages 로 공개)에서만 쓴다. 근거가 없는 필드는 추측으로 채우지 않고 비운다(«틀린 값은 빈 값보다 나쁘다»)
    - prj42(도구)·prj42a(덱 보관·공개) 경계가 `not:` 에 드러나야 한다 — 변환기·테마 결함은 prj42
* 구현 명세:
    - `CLAUDE.md` 맨 앞에 frontmatter(`---` … `---`) 추가, 기존 본문 2줄 유지
    - 검증: `___pm` Identity 생성기(있으면) 또는 `/route` 로 42a 가 identity·handles 로 잡히는지 확인 · YAML 파싱 OK(`python3 -c "import yaml…"`)

# 📗 선택

# ✅ 완료

## Issue2: GitHub Pages 갤러리 사이트 신설 — finfra.github.io/m2slide-deck + m2slide 사이트와 상호 링크 (등록: 2026-10-19, 해결: 2026-10-19, commit: e677a35) ✅
* 목적: m2slide-deck 에 웹 페이지가 없어 DesignRndAI 등 덱을 브라우저로 열 수 없었다. m2slide 본체 사이트(finfra.github.io/m2slide)처럼 갤러리를 두고 두 사이트를 서로 링크로 잇는다
* 상세:
    - `docs/index.html` 갤러리(11덱·카테고리 3구역) — 이 사이트에서 호스팅하는 덱은 `/<덱>/`, m2slide 사이트에 발행된 이전 덱은 그쪽 주소, 웹 미발행 덱은 원고(GitHub)만
    - `.github/workflows/pages.yml` — `docs/` + 추적된 `decks/*/*/slide/` 를 `_site/<덱>/` 으로 합쳐 배포. repo Pages `build_type=workflow` 로 활성화
    - m2slide 쪽(5d81346, main): `docs/index.html` 헤더 «📦 덱 갤러리» 버튼 + DesignRndAI 카드(m2slide-deck 사이트로 연결)
* 결과: ego-browser 확인 — 갤러리 11카드·«← m2slide 본체 사이트» 링크, DesignRndAI 목차(index)·1일차(93장·mg 캔버스 4·깨진 이미지 0), m2slide 사이트 헤더·카드 링크 동작

## Issue1: 라이선스 프로파일 B 적용 — repo 기본 CC BY-NC-SA 4.0 신설, 덱별 오버라이드 허용 (등록: 2026-09-27, 해결: 2026-09-27, commit: 126aa13) ✅
* 목적: 규정이 "덱별 README 에 명시" 뿐이라 repo 기본값이 없다(무표기 = All rights reserved). 덱 콘텐츠는 비상업만 무료로 두어 남이 유료 강의 재료로 쓰는 것을 막는다
* 상세:
    - `LICENSE.md` 신설: 덱 콘텐츠 기본 CC BY-NC-SA 4.0(https://creativecommons.org/licenses/by-nc-sa/4.0/) · 빌드 스크립트·템플릿 코드 MIT · 덱 README 의 명시가 우선
    - README 라이선스 절 + `_template/README.md` 라이선스 자리에 기본값 안내
    - 기존 `decks/misc/RamyeonCooking`(CC BY 4.0)은 그대로 둔다 — 덱별 오버라이드 실례
    - 정본 `/Users/nowage/_git/___oracle/_doc_arch/license-profiles.md` §4 row 42a · 템플릿 `/Users/nowage/_git/___oracle/data/template/license/README.md`(자리표 값 표 포함 — `{{N}}`=250 · `{{LICENSOR}}`=`Finfra Co., Ltd. (https://finfra.kr)` · `{{CONTACT}}`=finfra@gmail.com)
* 구현 명세:
    - 검증: `LICENSE.md`·README 절·`_template/README.md` 안내 존재
    - 금지: `git push`(사용자가 push)
    - 커밋 후 ✅ 이동 + hash 기록 (이 Issue.md 는 다른 세션과 공유 — 자기 블록만 스테이징)
* 결과: `LICENSE.md` 신설(덱 콘텐츠 CC BY-NC-SA 4.0 · 코드 MIT · 덱 README 우선 · 상업 이용 문의처) · README 라이선스 절 · `_template/README.md` 기본값 안내 — commit 126aa13

# ⏸️ 보류

# 🚫 취소

# 📜 참고
