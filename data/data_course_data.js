(() => {
  const line = (text, highlight = false) => ({ text, highlight });
  const cell = (cell_number, problem, answer, marked) => ({
    cell_number,
    blank_count: marked.length,
    problem_lines: problem.map((text, i) => line(text, marked.includes(i))),
    answer_lines: answer.map((text, i) => line(text, marked.includes(i))),
  });

  const trainP = [
    "def train(model, train_loader, test_loader):",
    "  loss_fn = nn.MSELoss(reduction='mean')",
    "  optimizer = optim.Adam(model.parameters(), lr=1e-3)",
    "  for epoch in range(10):",
    "    model.train()",
    "    for batch_x, batch_y in train_loader:",
    "      # (1) Move input and target tensors to the device (e.g., GPU)",
    "      batch_x, batch_y = ????",
    "      # (2) Select the prediction at the last timestep and feature 0",
    "      pred = ????",
    "      # (3) Compare prediction and target",
    "      loss = ????",
    "      # (4) Clear old gradients",
    "      optimizer.????",
    "      # (5) Compute gradients",
    "      loss.????",
    "      # (6) Update parameters",
    "      optimizer.????",
    "",
    "    model.eval()",
    "    with torch.no_grad():",
    "      for test_x, test_y in test_loader:",
    "        # TODO: evaluation uses the same tensor flow without updates",
    "        test_x, test_y = ????",
    "        test_pred = ????",
    "        test_loss = ????",
  ];
  const trainA = [
    "def train(model, train_loader, test_loader):",
    "  loss_fn = nn.MSELoss(reduction='mean')",
    "  optimizer = optim.Adam(model.parameters(), lr=1e-3)",
    "  for epoch in range(10):",
    "    model.train()",
    "    for batch_x, batch_y in train_loader:",
    "      # (1) Move input and target tensors to the device (e.g., GPU)",
    "      batch_x, batch_y = batch_x.to(device), batch_y.to(device)",
    "      # (2) Select the prediction at the last timestep and feature 0",
    "      pred = model(batch_x)[:, -1, 0]",
    "      # (3) Compare prediction and target",
    "      loss = loss_fn(pred, batch_y)",
    "      # (4) Clear old gradients",
    "      optimizer.zero_grad()",
    "      # (5) Compute gradients",
    "      loss.backward()",
    "      # (6) Update parameters",
    "      optimizer.step()",
    "",
    "    model.eval()",
    "    with torch.no_grad():",
    "      for test_x, test_y in test_loader:",
    "        # TODO: evaluation uses the same tensor flow without updates",
    "        test_x, test_y = test_x.to(device), test_y.to(device)",
    "        test_pred = model(test_x)[:, -1, 0]",
    "        test_loss = loss_fn(test_pred, test_y)",
  ];

  const metricP = [
    "def test(model, X_test, y_test):",
    "  model.eval()",
    "  with torch.no_grad():",
    "    X_test = X_test.to(device)",
    "    y_hat = model(X_test)",
    "    test_predictions = y_hat[:, -1, 0]",
    "  test_predictions = test_predictions.cpu().numpy()",
    "  y_test = y_test.cpu().numpy()",
    "  rmse = root_mean_squared_error(????, ????) # TODO",
    "  mape = mean_absolute_percentage_error(????, ????) # TODO",
    "  return rmse, mape",
  ];
  const metricA = metricP.map((x, i) => i === 8 ? "  rmse = root_mean_squared_error(y_test, test_predictions) # TODO" : i === 9 ? "  mape = mean_absolute_percentage_error(y_test, test_predictions) # TODO" : x);

  const convP = [
    "class Conv1DModel(nn.Module):",
    "  def __init__(self, input_size, hidden_size):",
    "    super(Conv1DModel, self).__init__()",
    "    # TODO",
    "    self.conv1d = nn.Conv1d(in_channels=????, out_channels=????, kernel_size=2, stride=1)",
    "    self.fc = nn.Linear(????, 1)",
    "  def forward(self, x):",
    "    x = x.transpose(1, 2)",
    "    x = self.conv1d(x)",
    "    x = x.transpose(1, 2)",
    "    return self.fc(x)",
  ];
  const convA = convP.map((x, i) => i === 4 ? "    self.conv1d = nn.Conv1d(in_channels=input_size, out_channels=hidden_size, kernel_size=2, stride=1)" : i === 5 ? "    self.fc = nn.Linear(hidden_size, 1)" : x);

  const rnnP = [
    "class RNNModel(nn.Module):",
    "  def __init__(self, input_size, hidden_size, num_layers):",
    "      super(RNNModel, self).__init__()",
    "      # TODO",
    "      self.rnn = nn.RNN(????, ????, ????, batch_first=True)",
    "      self.fc = nn.Linear(????, 1)",
    "  def forward(self, x):",
    "      # TODO",
    "      ????",
    "      ????",
  ];
  const rnnA = rnnP.map((x, i) => i === 4 ? "      self.rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)" : i === 5 ? "      self.fc = nn.Linear(hidden_size, 1)" : i === 8 ? "      out, _ = self.rnn(x)" : i === 9 ? "      return self.fc(out)" : x);

  const seqP = [
    "class EncoderRNN(nn.Module):",
    "  def __init__(self, input_size, hidden_size, num_layers):",
    "    # TODO",
    "    super(EncoderRNN, self).__init__()",
    "    self.rnn = nn.RNN(????, ????, ????, batch_first=True)",
    "  def forward(self, x):",
    "    # TODO",
    "    ????, h = self.rnn(x)",
    "    return ????",
    "",
    "class DecoderRNN(nn.Module):",
    "  def __init__(self, input_size, hidden_size, num_layers):",
    "    # TODO",
    "    super(DecoderRNN, self).__init__()",
    "    self.rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)",
    "    self.fc = nn.Linear(????, ????)",
    "  def forward(self, x, h):",
    "    # TODO",
    "    out, h = self.rnn(????, ????)",
    "    out = self.fc(????)",
    "    return ????, ????",
  ];
  const seqA = seqP.map((x, i) => ({4:"    self.rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)",7:"    _, h = self.rnn(x)",8:"    return h",15:"    self.fc = nn.Linear(hidden_size, input_size)",18:"    out, h = self.rnn(x, h)",19:"    out = self.fc(out)",20:"    return out, h"}[i] || x));

  const S = (id, answer, topic, prompt, accepted=[answer]) => ({id,sourceId:id,occurrence:0,answer,accepted_answers:accepted,topic,prompt,isSourceBlank:true});
  window.LLM_COURSE = {
    subject: "3. Data",
    sample_mode: false,
    cells: {
      "ts-q1":{source:"batch_x.to(device), batch_y.to(device)"}, "ts-q2":{source:"model(batch_x)[:, -1, 0]"},
      "ts-q3":{source:"loss_fn(pred, batch_y)"}, "ts-q4":{source:"optimizer.zero_grad()"}, "ts-q5":{source:"loss.backward()"}, "ts-q6":{source:"optimizer.step()"},
      "ts-q7":{source:"y_test, test_predictions"}, "ts-q8":{source:"input_size, hidden_size"}, "ts-q9":{source:"hidden_size"},
      "ts-q10":{source:"input_size, hidden_size, num_layers"}, "ts-q11":{source:"out, _ = self.rnn(x)"}, "ts-q12":{source:"return self.fc(out)"},
      "ts-q13":{source:"_, h = self.rnn(x)"}, "ts-q14":{source:"return h"}, "ts-q15":{source:"hidden_size, input_size"}, "ts-q16":{source:"out, h = self.rnn(x, h)"}
    },
    chapters: [{
      id:"data-ts-01", number:"01", title:"Time Series Forecasting", file:"ts_practice.ipynb",
      capability:"시계열 window를 Tensor로 구성하고 LSTM·Conv1D·RNN·Encoder–Decoder를 학습·평가하는 코드를 구현할 수 있다.",
      summary:"[N,50,1] 입력이 순환·합성곱 모델을 거쳐 시점별 [N,T,1] 예측이 되고, 마지막 시점 또는 10개 미래 시점을 정답과 비교해 학습합니다.",
      notebook_goal:"Google 주가 시계열을 window Tensor로 만들고 여러 sequence model로 단일·다중 시점 예측을 구현한다.",
      key_points:[
        {title:"Window 데이터",purpose:"과거 50개 값을 입력, 다음 값을 label로 구성합니다.",code:"features.append(data[i:i+50])\nlabels.append(data[i+50, 0])",flow:"[time,1] → [N,50,1] + [N]",watch:"시계열은 시간 순서를 유지해 train/test를 나눕니다."},
        {title:"학습 루프",purpose:"예측과 정답의 MSE gradient로 모델 파라미터를 갱신합니다.",code:"zero_grad → forward → loss → backward → step",flow:"[B,50,1] → [B,50,1] → [B] → scalar loss",watch:"평가에서는 no_grad를 쓰고 step을 호출하지 않습니다."},
        {title:"Conv1D와 RNN",purpose:"시간축의 국소 패턴 또는 hidden state의 순차 정보를 학습합니다.",code:"transpose → Conv1d → transpose\nRNN(..., batch_first=True)",flow:"Conv1d: [B,T,C] ↔ [B,C,T]",watch:"Conv1d의 채널 축과 RNN의 feature 축을 구분합니다."},
        {title:"Encoder–Decoder",purpose:"Encoder의 마지막 hidden state를 Decoder에 전달해 미래 10개 값을 순차 생성합니다.",code:"h=encoder(source)\nout,h=decoder(input,h)",flow:"[B,50,1] → h → [B,10,1]",watch:"Decoder Linear는 hidden_size를 input_size로 되돌립니다."},
        {title:"회귀 평가",purpose:"예측 오차의 절대 크기와 상대 비율을 RMSE·MAPE로 확인합니다.",code:"metric(y_test, test_predictions)",flow:"prediction,target → scalar metric",watch:"sklearn metric은 정답을 첫 번째 인자로 받습니다."}
      ],
      theory_guide:[
        {title:"1. 시계열 Tensor",concept:"batch_first=True인 순환층 입력은 [batch, time, feature]입니다.",flow:"[B,50,1] → RNN/LSTM → [B,50,H]",code_signal:"마지막 시점은 [:,-1,:]로 선택합니다.",exam_clue:"-1은 마지막 시간, 0은 하나뿐인 출력 feature입니다."},
        {title:"2. 학습 순서",concept:"이전 gradient를 지우고 loss를 역전파한 뒤 optimizer가 가중치를 갱신합니다.",flow:"zero_grad → forward → loss → backward → step",code_signal:"train()에는 backward/step, eval()+no_grad()에는 둘 다 없습니다.",exam_clue:"순서를 통째로 기억하세요."},
        {title:"3. Conv1D 축",concept:"PyTorch Conv1d는 [B,C,L], 현재 데이터는 [B,T,C]이므로 두 축을 바꿉니다.",flow:"[B,T,C] → [B,C,T] → Conv1d → [B,H,T-1]",code_signal:"conv 전후 transpose(1,2)가 한 쌍입니다.",exam_clue:"in_channels=input_size, out_channels=hidden_size입니다."},
        {title:"4. Hidden state 전달",concept:"Encoder 출력 전체보다 마지막 hidden state h가 과거 문맥을 압축해 Decoder 초기 상태가 됩니다.",flow:"source → h → autoregressive outputs",code_signal:"Encoder는 _,h 중 h만 반환합니다.",exam_clue:"Decoder는 (out,h)를 모두 다음 계산에 사용합니다."}
      ],
      full_code_cells:[cell(1,trainP,trainA,[7,9,11,13,15,17,23,24,25]),cell(2,metricP,metricA,[8,9]),cell(3,convP,convA,[4,5]),cell(4,rnnP,rnnA,[4,5,8,9]),cell(5,seqP,seqA,[4,7,8,15,18,19,20])],
      subjective:[
        S("ts-q1","batch_x.to(device), batch_y.to(device)","Device","batch_x와 batch_y를 device로 옮기는 우변을 쓰세요."),
        S("ts-q2","model(batch_x)[:, -1, 0]","Tensor indexing","마지막 시점의 단일 예측을 선택하는 표현을 쓰세요."),
        S("ts-q3","loss_fn(pred, batch_y)","Loss","예측과 정답으로 loss를 계산하는 호출을 쓰세요."),
        S("ts-q4","zero_grad()","Gradient 초기화","optimizer 뒤에 붙는 이전 gradient 제거 호출을 쓰세요.",["zero_grad()","optimizer.zero_grad()"]),
        S("ts-q5","backward()","역전파","loss 뒤에 붙는 gradient 계산 호출을 쓰세요.",["backward()","loss.backward()"]),
        S("ts-q6","step()","파라미터 갱신","optimizer 뒤에 붙는 파라미터 갱신 호출을 쓰세요.",["step()","optimizer.step()"]),
        S("ts-q7","y_test, test_predictions","Metric","sklearn 회귀 metric의 두 인자를 순서대로 쓰세요."),
        S("ts-q8","input_size, hidden_size","Conv1D","Conv1d의 in_channels와 out_channels 값을 쓰세요."),
        S("ts-q9","hidden_size","Linear","Conv1D 출력 뒤 Linear의 in_features를 쓰세요."),
        S("ts-q10","input_size, hidden_size, num_layers","RNN 구성","nn.RNN의 앞 세 인자를 쓰세요."),
        S("ts-q11","out, _ = self.rnn(x)","RNN forward","RNN 출력 sequence를 받고 hidden state는 버리는 한 줄을 쓰세요."),
        S("ts-q12","return self.fc(out)","RNN output","RNN 출력 전체에 fc를 적용해 반환하는 한 줄을 쓰세요."),
        S("ts-q13","_, h = self.rnn(x)","Encoder","Encoder에서 hidden state를 추출하는 한 줄을 쓰세요."),
        S("ts-q14","return h","Encoder","Encoder가 Decoder에 전달할 값을 반환하세요."),
        S("ts-q15","hidden_size, input_size","Decoder projection","Decoder Linear의 in/out features를 순서대로 쓰세요."),
        S("ts-q16","out, h = self.rnn(x, h)","Decoder","입력과 이전 hidden state로 RNN을 호출하는 한 줄을 쓰세요.")
      ],
      mcq:[
        {id:"ts-m1",source_question_id:"ts-q2",topic:"마지막 시점 예측",prompt:"model(batch_x)가 [B,T,1]일 때 정답 [B]와 비교할 예측은?",answer_index:2,explanation:"시간축 마지막(-1), feature 0을 고르면 [B]가 됩니다.",choices:[{text:"model(batch_x)[0]",why:"첫 배치를 선택합니다."},{text:"model(batch_x)[:,0,0]",why:"첫 시점을 선택합니다."},{text:"model(batch_x)[:,-1,0]",why:"정답: 각 배치의 마지막 시점입니다."},{text:"model(batch_x)[-1]",why:"마지막 배치를 선택합니다."},{text:"model(batch_x).mean()",why:"배치까지 scalar로 줄입니다."}]},
        {id:"ts-m2",source_question_id:"ts-q4",topic:"학습 순서",prompt:"loss 계산 후 올바른 순서는?",answer_index:1,explanation:"기존 gradient를 지우고 새 gradient를 계산한 뒤 갱신합니다.",choices:[{text:"step → backward → zero_grad",why:"역순입니다."},{text:"zero_grad → backward → step",why:"정답입니다."},{text:"backward → no_grad → step",why:"no_grad는 평가용입니다."},{text:"eval → backward → train",why:"mode 순서가 잘못됐습니다."},{text:"step → zero_grad → backward",why:"gradient 전에 갱신합니다."}]},
        {id:"ts-m3",source_question_id:"ts-q8",topic:"Conv1D 입력",prompt:"[B,T,input_size]를 transpose 후 Conv1d에 넣을 때 채널 설정은?",answer_index:0,explanation:"입력 feature가 채널이 되고 hidden_size개의 특징을 만듭니다.",choices:[{text:"input_size → hidden_size",why:"정답입니다."},{text:"hidden_size → input_size",why:"방향이 반대입니다."},{text:"T → hidden_size",why:"T는 sequence length입니다."},{text:"1 → T",why:"시간축은 채널 수가 아닙니다."},{text:"batch_size → hidden_size",why:"배치축은 채널이 아닙니다."}]},
        {id:"ts-m4",source_question_id:"ts-q13",topic:"Encoder–Decoder",prompt:"Encoder가 Decoder 초기 상태로 전달해야 하는 값은?",answer_index:3,explanation:"마지막 hidden state가 입력 sequence 문맥을 전달합니다.",choices:[{text:"loss",why:"학습 scalar입니다."},{text:"optimizer",why:"파라미터 갱신 객체입니다."},{text:"원본 source",why:"Decoder 초기 hidden state가 아닙니다."},{text:"hidden state h",why:"정답입니다."},{text:"RMSE",why:"평가 지표입니다."}]},
        {id:"ts-m5",source_question_id:"ts-q7",topic:"평가 Metric",prompt:"sklearn의 root_mean_squared_error 인자 순서는?",answer_index:4,explanation:"sklearn metric은 y_true, y_pred 순서입니다.",choices:[{text:"model, X_test",why:"Tensor 예측 전입니다."},{text:"pred, loss",why:"loss는 정답이 아닙니다."},{text:"X_test, y_test",why:"입력과 정답 조합입니다."},{text:"y_pred, model",why:"model 객체는 metric 인자가 아닙니다."},{text:"y_test, test_predictions",why:"정답입니다."}]}
      ]
    }]
  };
})();
