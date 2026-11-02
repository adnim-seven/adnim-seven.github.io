# 10월 실제 기출 복원

사용자가 실제 출제된 부분만 추려 제공한 10월 복기를 원본 노트북 문맥에 배치한 연습 페이지다. 공식 시험지나 빈칸 UI·문항 수·배점의 정확한 재현은 아니다.

- LLM 3묶음 / 11칸: DPO 토큰화·마스킹, MHA 축 변환·결합, GPT 임베딩·Dropout.
- RAG 2묶음 / 25칸: MCP Client·ToolSpec·도구·리소스, Agent·Context·비동기 query. import는 제공.
- Data 1묶음 / 6칸: NCF 임베딩·MLP·concat.
- Vision 2묶음 / 9칸: train/test transform, ResNet conv1 교체.
- On-device 2묶음 / 10칸: CNN 출력 양자화, LLM 의사 양자화.

합계 10묶음·61칸. 복기 문서에 후보라고 적혔던 구현 부분도 사용자가 실제 출제 부분임을 추가 확인했다. maxpool·fc 등 확인되지 않은 주변 코드는 문제로 추가하지 않는다. 사용자가 import는 출제되지 않았다고 정정하여, import 세 줄은 제공 코드로 남기고 문제에서 제외했다. 기존 MCP 구현 답안의 저장 ID를 보존하므로 첫 묶음 빈칸은 D부터 시작한다.

## 사용

index.html을 브라우저로 열거나 사이트 홈의 ‘10월 실제 기출 복원’ 링크를 사용한다. 파일 직접 열기를 지원하며 외부 라이브러리 다운로드나 API 호출이 없다.

빈칸 위 목적을 보고 입력한 다음 Ctrl+Enter 또는 문제별 채점 버튼을 사용한다. 빈 답안은 채점하지 않으며, 채점한 칸 아래에 정답과 해설이 나온다. 입력 변경 시 이전 판정은 무효가 된다. 모든 칸을 채점한 묶음은 완성 코드 보기를 제공한다.

브라우저별 답안·결과·오답 횟수는 `ai-specialist-october-recall-v1`에 저장한다. ‘새로 풀기’는 오답 이력을 보존한다. ‘답안·오답 이력 내보내기’로 JSON 백업이 가능하다. 자동 판정은 코드를 실행하지 않는 보수적인 표현 비교이며, 같은 기능의 다른 표현은 직접 인정할 수 있다.

## 원본 및 생성

questions.js에는 원본 경로·1부터 시작하는 셀 번호·원본 SHA-256·클래스/함수 범위를 기록한다. DPO 원본의 선택 응답 두 빈칸은 사용자 복기의 정답으로 완성했다. 서버 주소는 외부 환경 변수 `MCP_SERVER_URL`로 대체했으며 문제로 만들지 않는다. 원본 노트북은 수정하지 않는다.

사이트 루트에서:

```sh
node tools/build-october-recall.cjs
node tools/tests/test_october_recall.cjs
node tools/verify-october-browser.cjs
npm test
```
