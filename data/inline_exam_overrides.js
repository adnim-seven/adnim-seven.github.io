/* 공식 출제범위 기준: 시계열 데이터 구성·학습·Metric, NGCF 구조·BPR·Top-K 평가 */
window.INLINE_EXAM_OVERRIDES = {
  "ts_practice.ipynb": {
    replacements: [
      { cell: 14, id: "data-ts-scale-fit", from: "train_scaled = scaler.fit_transform(train_data.values)" },
      { cell: 18, id: "data-ts-dataloader", from: "return torch.utils.data.DataLoader(dataset, batch_size, shuffle)" },
      { cell: 22, id: "data-ts-lstm", from: "self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)" },
      { cell: 24, id: "data-ts-last-output", from: "pred = model(batch_x)[:, -1, 0]" },
      { cell: 24, id: "data-ts-mse", from: "loss = loss_fn(pred, batch_y)" },
      { cell: 24, id: "data-ts-update", from: "optimizer.zero_grad()\n      loss.backward()\n      optimizer.step()" },
      { cell: 28, id: "data-ts-rmse", from: "rmse = root_mean_squared_error(y_test, test_predictions)" },
      { cell: 30, id: "data-ts-conv-transpose", from: "x = x.transpose(1, 2)" }
    ],
    blanks: [
      { id: "data-ts-scale-fit", label: "★ 유력 · 학습 구간 MinMaxScaler 적합·변환", instruction: "학습 데이터로 scaler를 fit한 뒤 0~1 범위로 변환하세요.", answer: "train_scaled = scaler.fit_transform(train_data.values)" },
      { id: "data-ts-dataloader", label: "★ 유력 · TensorDataset을 DataLoader로 배치화", instruction: "dataset, batch_size, shuffle을 사용해 DataLoader를 반환하세요.", answer: "return torch.utils.data.DataLoader(dataset, batch_size, shuffle)" },
      { id: "data-ts-lstm", label: "★ 유력 · batch-first LSTM 레이어", instruction: "[B,T,input_size] 입력을 처리하는 LSTM을 선언하세요.", answer: "self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)" },
      { id: "data-ts-last-output", label: "★ 유력 · 마지막 시점 예측값 선택", instruction: "[B,T,1] 모델 출력에서 각 배치의 마지막 시점 스칼라를 선택하세요.", answer: "pred = model(batch_x)[:, -1, 0]" },
      { id: "data-ts-mse", label: "★ 유력 · 회귀 예측과 정답 MSE", instruction: "마지막 시점 예측과 batch 정답을 loss_fn으로 비교하세요.", answer: "loss = loss_fn(pred, batch_y)" },
      { id: "data-ts-update", label: "★ 유력 · 표준 학습 갱신 순서", instruction: "이전 gradient를 지우고, loss를 역전파한 뒤 optimizer를 갱신하는 세 줄을 작성하세요.", answer: "optimizer.zero_grad()\n      loss.backward()\n      optimizer.step()" },
      { id: "data-ts-rmse", label: "★ 유력 · RMSE 평가 계산", instruction: "실제 y_test와 마지막 시점 예측값으로 RMSE를 계산하세요.", answer: "rmse = root_mean_squared_error(y_test, test_predictions)" },
      { id: "data-ts-conv-transpose", label: "★ 유력 · Conv1d 입력 축 정렬", instruction: "[B,T,C] 시계열 Tensor를 Conv1d가 요구하는 [B,C,T]로 바꾸세요.", answer: "x = x.transpose(1, 2)" }
    ]
  },
  "RecSys_GCF_practice.ipynb": {
    replacements: [
      { cell: 10, id: "data-ngcf-item-offset", from: "dst.append(row['movieId'] + num_users)" },
      { cell: 14, id: "data-ngcf-norm", from: "norm = 1.0/torch.sqrt(deg[src]*deg[dst])" },
      { cell: 14, id: "data-ngcf-dst-message", from: "edge_messages_for_dst = self.W1(src_feat) + self.W2(src_feat*dst_feat)" },
      { cell: 15, id: "data-ngcf-concat", from: "final_features = torch.concat(layer_outputs,dim=-1)" },
      { cell: 17, id: "data-ngcf-topk", from: "topk_scores, topk_indices = torch.topk(scores, k=k)" },
      { cell: 17, id: "data-ngcf-ndcg", from: "ndcg_u = dcg / idcg if idcg > 0 else 0.0" }
    ],
    blanks: [
      { id: "data-ngcf-item-offset", label: "★ 유력 · User·item 통합 node index", instruction: "movie ID를 user node 구간 뒤의 item node ID로 바꾸어 edge destination에 넣으세요.", answer: "dst.append(row['movieId'] + num_users)" },
      { id: "data-ngcf-norm", label: "★ 유력 · 양 끝 degree 정규화", instruction: "각 edge의 src·dst degree에 대칭 정규화를 적용하세요.", answer: "norm = 1.0/torch.sqrt(deg[src]*deg[dst])" },
      { id: "data-ngcf-dst-message", label: "★ 유력 · User→item graph message", instruction: "src user feature와 src·dst interaction으로 item이 받을 message를 계산하세요.", answer: "edge_messages_for_dst = self.W1(src_feat) + self.W2(src_feat*dst_feat)" },
      { id: "data-ngcf-concat", label: "★ 유력 · Layer별 NGCF 표현 결합", instruction: "초기 embedding과 각 layer 출력을 feature 축으로 연결하세요.", answer: "final_features = torch.concat(layer_outputs,dim=-1)" },
      { id: "data-ngcf-topk", label: "★ 유력 · 추천 Top-K 선택", instruction: "item score에서 상위 k score와 index를 함께 구하세요.", answer: "topk_scores, topk_indices = torch.topk(scores, k=k)" },
      { id: "data-ngcf-ndcg", label: "★ 유력 · NDCG 정규화", instruction: "DCG를 이상적 DCG로 정규화하고 0 분모를 방지하세요.", answer: "ndcg_u = dcg / idcg if idcg > 0 else 0.0" }
    ]
  }
};

(() => {
  const guides = {
    "blank-ts-window": "현재 i부터 sequence_length개 과거 값을 잘라 하나의 입력 window를 만드세요. 다음 줄 label은 i+sequence_length 시점입니다.",
    "blank-ts-rnn": "입력 [B,T,input_size]를 받도록 input_size, hidden_size, num_layers와 batch_first=True를 사용한 RNN을 선언하세요.",
    "blank-ts-forward": "RNN의 모든 시점 출력 out을 마지막 Linear layer에 넣어 [B,T,1] 예측을 반환하세요.",
    "blank-ngcf-message": "src user가 받을 item 이웃 메시지를 W1(dst feature)와 W2(dst·src interaction)의 합으로 만드세요.",
    "blank-ngcf-embedding": "user와 item이 하나의 node 번호 공간을 공유하도록 (num_users + num_items)개 embedding을 생성하세요.",
    "blank-ngcf-bpr": "positive score가 negative score보다 커지도록 -mean(logsigmoid(pos-neg)) BPR loss를 계산하세요."
  };
  const priority = {
    "ts_practice.ipynb": new Set(["blank-ts-window", "blank-ts-rnn", "blank-ts-forward"]),
    "RecSys_GCF_practice.ipynb": new Set(["blank-ngcf-message", "blank-ngcf-embedding", "blank-ngcf-bpr"])
  };
  Object.entries(priority).forEach(([file, ids]) => {
    (window.INLINE_EXAM_MAP?.[file]?.blanks || []).forEach((blank) => {
      if (!blank.instruction && guides[blank.id]) blank.instruction = guides[blank.id];
      if (ids.has(blank.id) && !blank.label.startsWith("★")) blank.label = `★ 유력 · ${blank.label}`;
    });
  });
})();
