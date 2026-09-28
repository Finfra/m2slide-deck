---
name: Info
description: StellarEvolution 프로젝트 기획 메타
date: 2026-07-07
---

# 주제

항성(별)의 진화 과정 — 탄생부터 죽음까지의 생애 주기와 질량에 따른 운명 분기

# 청중

고등학생~대학 교양 수준. 기초 물리(중력·에너지)를 알고 있으며 HR도·핵융합 등 개념을 새로 도입해도 따라올 수 있는 학습자

# 분량

15 분

# 스타일

발표

# 학습 목표

* 별이 성운 → 원시별 → 주계열성으로 탄생하는 과정을 이해한다
* 별의 질량이 그 수명과 최종 운명을 결정한다는 원리를 파악한다
* 주계열·적색거성·초신성 등 진화 단계별 특징을 구분한다
* HR도(헤르츠스프룽-러셀 도표)로 별의 진화 경로를 읽을 수 있다
* 별 내부 핵융합이 우주의 무거운 원소를 만든다(항성 핵합성)는 것을 이해한다

# 참고자료 후보

* 항성 진화 stellar evolution
* HR도 Hertzsprung-Russell diagram
* 핵융합 항성 nuclear fusion star
* 초신성 supernova
* 백색왜성 중성자별 블랙홀 white dwarf neutron star black hole
* 항성 핵합성 stellar nucleosynthesis

# 데드라인

TBD

# 빌드 옵션

* mode: single             # 15분 + 목표 5개 → single 판정
* theme: default
* theme_default_layout: contents
* cover_enabled: true
* cover_layout: _cover
* markmap_depth: 2

# 미디어 계획

* media_mermaid: true       # 진화 흐름·질량 분기 다이어그램
* media_excalidraw: false
* media_infographic: false
* media_demo_video: false
* design_mood: 다크 테마, 우주·별 감성, 딥블루~퍼플 톤
* image_style: minimal astronomical illustration, deep space blue tone

# 산출물 계획

* output_html: true
* output_epub: false
* output_subs_txt: false
* output_tts_txt: false

# TTS 텍스트 규칙

`.tts.txt` 콘텐츠 정책. 상세 설계는 [`_doc_arch/info.md`](../_doc_arch/info.md) "TTS 텍스트 규칙" 절 참조.

(현재 output_tts_txt: false — TTS 산출물 미생성. 추후 영상화 시 활성화)
