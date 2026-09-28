---
name: Info
description: graphify 프로젝트 기획 메타
date: 2026-05-19
---

# 주제

graphify: 코드베이스·문서를 knowledge graph로 변환하고 시각화·탐색하는 CLI 도구

# 청중

Claude Code 유저 (코드베이스 탐색·문서 분석 경험 있음, knowledge graph 전문 지식 불필요)

# 분량

15 분

# 발표 스타일

강의

# 학습 목표

* graphify가 무엇인지, 왜 필요한지 이해
* 코드베이스·문서를 knowledge graph로 변환하는 방법 습득
* graphify query·path·explain CLI 명령어 실전 활용

# 참고자료 후보

* obsidian
* 토큰 절약
* knowledge graph
* graphify CLI

# 데드라인

미정

# 빌드 옵션

* mode: single              # 15분 분량 → single 모드 자동 판정 (duration < 30분)
* theme: default_lec        # theme/default_lec/ 디렉토리
* theme_default_layout: contents
* cover_enabled: true       # 첫 슬라이드 cover 자동 주입
* cover_layout: _cover      # cover_enabled=true일 때 적용
* markmap_depth: 2          # TOC 마인드맵 초기 펼침 깊이

# 미디어 계획

* media_mermaid: true       # mermaid 다이어그램
* media_excalidraw: true    # excalidraw 다이어그램
* media_infographic: true   # HTML infographic
* media_demo_video: false   # 시연 영상 삽입 (수동 녹화)
* image_style: 밝은 톤 (배경 흰색·아이보리·페일 블루 계열, 카드 파스텔, 텍스트는 짙은 회색·네이비). 다크 배경 금지.

# 산출물 계획

* output_html: true         # Reveal.js HTML 슬라이드 (단계 8)
* output_epub: false        # EPUB 전자책 동시 생성 (단계 8)
* output_subs_txt: true     # 자막용 .txt (단계 9, md2subs) — tts_txt 의존성으로 자동 활성
* output_tts_txt: true      # TTS 합성용 .tts.txt (단계 9, txt2tts — output_subs_txt 전제)

# TTS 텍스트 규칙

`.tts.txt` 콘텐츠 정책. 상세 설계는 [`_doc_arch/info.md`](../_doc_arch/info.md) "TTS 텍스트 규칙" 절 참조.

* narration_policy:
    - image:
    - table:
    - code:
    - diagram:
    - url:
* extra_narration:
* exclude:
