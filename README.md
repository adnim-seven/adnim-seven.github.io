# AI Coding Recall (adnim-seven.github.io)

GitHub Pages(`main` 브랜치 루트 `/`)로 배포되는 AI Specialist 실습 코드 시험 대비 학습 사이트입니다.

## 디렉터리 구조

```text
/
├─ index.html                     # 전체 과목 홈
├─ package.json                   # 테스트 및 감사 스크립트 실행 설정
├─ assets/
│  ├─ css/
│  │  ├─ global-font.css          # 사이트 공통 폰트 (고정폭 Consolas 우선)
│  │  ├─ subject.css              # 5개 과목 홈 공통 스타일
│  │  ├─ subject-mobile.css       # 5개 과목 홈 모바일 반응형 스타일
│  │  ├─ full_code.css            # 전체 코드/오버뷰 공통 스타일
│  │  ├─ subjective-list.css      # 인라인 주관식 시험 목록 공통 스타일
│  │  ├─ subjective-test.css      # 28개 주관식 시험 화면 공통 스타일
│  │  ├─ inline-exam-*.css        # 인라인 주관식 시험 공통 스타일
│  │  └─ mock-exam.css            # 모의고사 1~5회 공통 스타일
│  └─ js/
│     ├─ subject-app.js           # 5개 과목 홈 공통 학습 엔진
│     ├─ subjective-test-app.js   # 28개 주관식 시험 공통 엔진
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
   ├─ run_all_tests.cjs           # 통합 단위 테스트 및 검증 실행기
   ├─ validate_site.cjs           # 전체 링크·태그 짝·JS 문법·과목 규칙 자동 검증
   ├─ audit_ui_ux.cjs             # 전체 UI/UX 및 기능 통일성 자동 감사기
   ├─ verify-exam-session.cjs     # 모의고사 1~5회 채점·복원 검증
   ├─ verify-mock-exams.cjs       # 모의고사 문항/파이썬 AST 검증
   ├─ build-mock-exams.cjs        # 모의고사 2~5회 생성 스크립트
   ├─ tests/                      # 기능별 유닛테스트 스위트
   │  ├─ test_scoring.cjs         # 정답 채점·정규화 단위 테스트
   │  ├─ test_state_machine.cjs   # 상태 머신 및 복습 주기 단위 테스트
   │  ├─ test_subject_app.cjs     # 과목 공통 엔진 통합 단위 테스트
   │  ├─ test_subjective_app.cjs  # 독립 주관식 시험 엔진 단위 테스트
   │  └─ test_mock_exam.cjs       # 모의고사 세션/채점 단위 테스트
   └─ llm_*.py                    # LLM 데이터 빌드 및 검증 스크립트
```

## 코드 수정 및 배포 전 테스트

```bash
# 1. 기능별 단위 테스트(Unit Tests) 및 무결성 검증 일괄 실행
npm test
# 또는
node tools/run_all_tests.cjs

# 2. UI/UX 및 기능 일관성 전수 감사
npm run audit
```
