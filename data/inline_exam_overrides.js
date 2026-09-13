/* 공식 출제범위 기준: 시계열 데이터 구성·학습·Metric, NGCF 구조·BPR·Top-K 평가 */
window.INLINE_EXAM_OVERRIDES = {
  "ts_practice.ipynb": {
    replacements: [
      { cell: 14, id: "data-ts-scale-fit", from: "scaler.fit_transform(train_data.values)" },
      { cell: 14, id: "data-ts-scale-test", from: "scaler.transform(test_data.values)" },
      { cell: 18, id: "data-ts-dataloader", from: "return torch.utils.data.DataLoader(dataset, batch_size, shuffle)" },
      { cell: 22, id: "data-ts-lstm", from: "self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)" },
      { cell: 24, id: "data-ts-mse", from: "loss = loss_fn(pred, batch_y)" },
      { cell: 28, id: "data-ts-rmse", from: "rmse = root_mean_squared_error(y_test, test_predictions)" },
      { cell: 30, id: "data-ts-conv-transpose", from: "x = x.transpose(1, 2)" }
    ],
    blanks: [
      { id: "data-ts-scale-fit", label: "★ 유력 · 학습 구간 MinMaxScaler 적합·변환", instruction: "변수 train_scaled에는 학습 데이터로 scaler를 fit한 뒤 0~1 범위로 변환한 결과를 넣으세요.", answer: "scaler.fit_transform(train_data.values)" },
      { id: "data-ts-scale-test", label: "★ 유력 · 테스트 구간 학습 기준 변환", instruction: "변수 test_scaled에는 학습 데이터에서 정한 scaler 기준으로 test 데이터를 변환한 결과를 넣으세요.", answer: "scaler.transform(test_data.values)" },
      { id: "data-ts-dataloader", label: "★ 유력 · TensorDataset을 DataLoader로 배치화", instruction: "dataset, batch_size, shuffle을 사용해 DataLoader를 반환하세요.", answer: "return torch.utils.data.DataLoader(dataset, batch_size, shuffle)" },
      { id: "data-ts-lstm", label: "★ 유력 · batch-first LSTM 레이어", instruction: "[B,T,input_size] 입력을 처리하는 LSTM을 선언하세요.", answer: "self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)" },
      { id: "data-ts-mse", label: "★ 유력 · 회귀 예측과 정답 MSE", instruction: "마지막 시점 예측과 batch 정답을 loss_fn으로 비교하세요.", answer: "loss = loss_fn(pred, batch_y)" },
      { id: "data-ts-rmse", label: "★ 유력 · RMSE 평가 계산", instruction: "실제 y_test와 마지막 시점 예측값으로 RMSE를 계산하세요.", answer: "rmse = root_mean_squared_error(y_test, test_predictions)" },
      { id: "data-ts-conv-transpose", label: "★ 유력 · Conv1d 입력 축 정렬", instruction: "[B,T,C] 시계열 Tensor를 Conv1d가 요구하는 [B,C,T]로 바꾸세요.", answer: "x = x.transpose(1, 2)" }
    ]
  },
  "RecSys_GCF_practice.ipynb": {
    replacements: [
      { cell: 10, id: "data-ngcf-item-offset", from: "dst.append(row['movieId'] + num_users)" },
      { cell: 17, id: "data-ngcf-topk", from: "topk_scores, topk_indices = torch.topk(scores, k=k)" },
      { cell: 17, id: "data-ngcf-ndcg", from: "ndcg_u = dcg / idcg if idcg > 0 else 0.0" }
    ],
    blanks: [
      { id: "data-ngcf-item-offset", label: "★ 유력 · User·item 통합 node index", instruction: "movie ID를 user node 구간 뒤의 item node ID로 바꾸어 edge destination에 넣으세요.", answer: "dst.append(row['movieId'] + num_users)" },
      { id: "data-ngcf-topk", label: "★ 유력 · 추천 Top-K 선택", instruction: "item score에서 상위 k score와 index를 함께 구하세요.", answer: "topk_scores, topk_indices = torch.topk(scores, k=k)" },
      { id: "data-ngcf-ndcg", label: "★ 유력 · NDCG 정규화", instruction: "DCG를 이상적 DCG로 정규화하고 0 분모를 방지하세요.", answer: "ndcg_u = dcg / idcg if idcg > 0 else 0.0" }
    ]
  }
};

(() => {
  const guides = {
    "blank-ts-train-pred": "모델 출력 [B,T,1]에서 각 배치의 마지막 시점과 유일한 feature 값을 선택해 pred [B]를 만드세요.",
    "blank-ts-rnn": "입력 [B,T,input_size]를 받도록 input_size, hidden_size, num_layers와 batch_first=True를 사용한 RNN을 선언하세요.",
    "blank-ts-forward": "RNN의 모든 시점 출력 out을 마지막 Linear layer에 넣어 [B,T,1] 예측을 반환하세요.",
    "blank-ngcf-norm": "각 edge의 src·dst degree를 사용해 1/sqrt(deg(src)·deg(dst)) 정규화 계수를 계산하세요.",
    "blank-ngcf-edge-dst": "src user feature와 src·dst interaction을 사용해 dst item이 받을 graph message를 계산하세요.",
    "blank-ngcf-concat": "초기 embedding과 모든 NGCF layer 출력을 마지막 feature 축으로 연결하세요."
  };
  const priority = {
    "ts_practice.ipynb": new Set(["blank-ts-train-pred", "blank-ts-rnn", "blank-ts-forward"]),
    "RecSys_GCF_practice.ipynb": new Set(["blank-ngcf-norm", "blank-ngcf-edge-dst", "blank-ngcf-concat"])
  };
  Object.entries(priority).forEach(([file, ids]) => {
    (window.INLINE_EXAM_MAP?.[file]?.blanks || []).forEach((blank) => {
      if (!blank.instruction && guides[blank.id]) blank.instruction = guides[blank.id];
      if (ids.has(blank.id) && !blank.label.startsWith("★")) blank.label = `★ 유력 · ${blank.label}`;
    });
  });
})();
