---
title: Projects_deck Issue Management
description: m2slide 프로젝트 갤러리 이슈 추적
---

# Issue Management

* Issue HWM: 1
## 📋 상태 요약
- 신규 등록: nPTiR 스캐폴드 생성 완료

## 🌱 이슈후보

## 🚧 진행중

## 📕 중요

## 📙 일반

## 📗 선택

## ✅ 완료

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

## ⏸️ 보류

## 🚫 취소

## 📜 참고
