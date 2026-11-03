# 11/17 시험 대비 학습 일정표

11/4~13 전체 핵심 1회독, 11/14~16 기출·오답 풀이, 11/17 시험 전 확인을 날짜별로 표시한다. 하루 150~180분, 기본 실습 31개 범위를 담는다. 이는 완독·모든 모델 학습 실행 계획이 아니라 구현 핵심 압축 1회독이다.

완료 체크는 `ai-specialist-study-plan-2026-11-17-v1`에 저장한다. 기기 간 자동 동기화되지 않는다. 초기화는 이 키의 일정 체크만 비우며, 시험 답안·오답 이력은 보존한다. 체크는 학습자가 직접 표시하는 것이며 시험 성적이 아니다.

`plan-data.js`는 Vault의 `NOV17_STUDY_CURRICULUM.md`, `NOV17_REVIEW_SCHEDULE.md`에서 생성한다. 날짜별 범위·목표·복습을 바꾸면 문서부터 수정한 뒤 재생성한다. 원본 notebook 경로는 제목·출처 확인용이며 웹에서 로컬 파일을 열지는 않는다. 과목 페이지에서 대응 챕터를 선택한다. 10월 기출은 실제 복원, 기존 모의 1회 링크는 보조 예상·변형으로 구분한다.

사이트 루트에서:

```sh
node tools/build-study-plan.cjs
node tools/tests/test_study_plan.cjs
node tools/verify-study-plan-browser.cjs
npm test
```

공개 배포 후에는 `STUDY_PLAN_BASE=https://adnim-seven.github.io`를 환경 변수로 전달해 같은 브라우저 검증을 공개 페이지에 실행할 수 있다. 브라우저 검증은 격리된 새 프로필에서 수행하므로 실제 사용자 완료 체크를 변경하지 않는다.
