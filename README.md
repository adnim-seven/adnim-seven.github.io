# AI Coding Recall (adnim-seven.github.io)

GitHub Pages(`main` 브랜치 루트 `/`)로 배포되는 AI Specialist 실습 코드 시험 대비 학습 사이트입니다.

## 디렉터리 구조

```text
/
├─ index.html                     # 전체 과목 홈
├─ assets/
│  ├─ css/
│  │  ├─ global-font.css          # 사이트 공통 폰트
│  │  ├─ subject.css              # 5개 과목 홈 공통 스타일
│  │  ├─ subject-mobile.css       # 5개 과목 홈 모바일 반응형 스타일
│  │  ├─ full_code.css            # 전체 코드/오버뷰 공통 스타일
│  │  ├─ inline-exam-*.css        # 인라인 주관식 시험 공통 스타일
│  │  └─ mock-exam.css            # 모의고사 1~5회 공통 스타일
│  └─ js/
│     ├─ subject-app.js           # 5개 과목 홈 공통 학습 엔진
│     ├─ inline-exam-*.js         # 인라인 주관식 시험 공통 스크립트
│     └─ mock-exam-app.js         # 모의고사 1~5회 공통 엔진
├─ llm/ vision/ on-device/ rag/ data/
│  ├─ index.html                  # 과목 홈
│  ├─ subject.config.js           # 과목별 설정 (storageKey, pathLabel 등)
│  ├─ course_data.js              # 과목 챕터·문제·코드 셀 데이터
│  ├─ exam_overrides.js           # 주관식 문제 보강 데이터
│  ├─ inline_exam_data.js         # 인라인 시험 데이터
│  └─ inline-subjective/          # 노트북별 전체화면 주관식 시험 페이지
├─ mock-exam-1/ .. mock-exam-5/
│  ├─ index.html                  # 모의고사 화면
│  └─ questions.js                # 회차별 15문항 데이터
├─ downloads/                     # 요약 자료 PDF 다운로드 페이지
└─ tools/
   ├─ validate_site.cjs           # 전체 링크·태그 짝·JS 문법·과목 규칙 자동 검증
   ├─ verify-exam-session.cjs     # 모의고사 1~5회 채점·복원 검증
   ├─ verify-mock-exams.cjs       # 모의고사 문항/파이썬 AST 검증
   ├─ build-mock-exams.cjs        # 모의고사 2~5회 생성 스크립트
   └─ llm_*.py                    # LLM 데이터 빌드 및 검증 스크립트
```

## 배포 전 필수 검증

```bash
node tools/validate_site.cjs
node tools/verify-exam-session.cjs
node tools/verify-mock-exams.cjs
```
