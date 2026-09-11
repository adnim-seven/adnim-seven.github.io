(() => {
  "use strict";
  const course = window.LLM_COURSE;
  const chapter = course.chapters.find((item) => item.file === "ts_practice.ipynb");
  if (!chapter) return;
  chapter.notebook_goal = "시계열 window를 Tensor로 구성하고 RNN·LSTM·Conv1D와 encoder-decoder를 학습·평가하는 전체 흐름을 구현한다.";
  chapter.summary = "누수 없는 scaling, sequence/target 구성, recurrent 모델의 shape, 학습 루프, RMSE·MAPE, 다중 시점 autoregressive 예측을 코드로 연결합니다.";
  chapter.capability = "[batch, time, feature] Tensor의 축을 추적하며 시계열 모델 구성·loss 학습·평가·다중 step 생성을 정확히 구현할 수 있다.";
  chapter.overview = {title:"가격 시계열이 예측값과 평가 지표가 되는 과정",subtitle:"과거 window를 float Tensor로 묶고 sequence 모델의 마지막 시점 또는 decoder 출력을 정답과 비교한다.",steps:[
    {label:"분할·Scaling",code:"train.fit_transform / test.transform",flow:"raw values → [N,1] scaled"},
    {label:"Window Tensor",code:"past 50 → next value/10 values",flow:"[N,T,1] + labels"},
    {label:"Sequence Model",code:"RNN/LSTM/Conv1D",flow:"[B,T,1] → [B,T,1]"},
    {label:"학습",code:"zero_grad → loss → backward → step",flow:"prediction + target → weights"},
    {label:"평가",code:"RMSE / MAPE",flow:"y_true,y_pred → scalar metrics"}
  ],rules:[
    "Scaler는 train에서만 fit하고 test에는 transform만 적용해 평가 정보 누출을 막는다.",
    "batch_first=True이면 입력·출력 축은 [B,T,F]이며 단일 다음 값은 [:,-1,0]에서 고른다.",
    "모델·입력·정답 Tensor는 같은 device에 있어야 loss와 backward가 실행된다.",
    "gradient는 매 batch 누적되므로 backward 전에 zero_grad가 필요하다.",
    "Encoder hidden state를 Decoder에 넘기고 이전 출력값을 다음 입력으로 사용하면 여러 시점을 생성한다."
  ]};
  chapter.key_points = [
    {title:"Window 데이터",purpose:"과거 sequence_length개를 입력, 바로 다음 값 또는 target_len개를 정답으로 만듭니다.",code:"X=data[i:i+T]\ny=data[i+T]  # one-step\ny=data[i+T:i+T+H]  # multi-step",flow:"[T,1] → scalar or [H,1]",watch:"입력 끝과 target 시작 index가 i+T로 정확히 이어져야 합니다."},
    {title:"RNN 출력",purpose:"각 recurrent layer의 모든 시점 hidden output을 Linear로 예측값에 투영합니다.",code:"out,_ = self.rnn(x)\nreturn self.fc(out)",flow:"[B,T,input] → [B,T,H] → [B,T,1]",watch:"단일 예측 loss에는 마지막 시점만 선택합니다."},
    {title:"학습 루프",purpose:"prediction과 target의 MSE gradient로 모델 파라미터를 갱신합니다.",code:"zero_grad(); loss.backward(); optimizer.step()",flow:"scalar loss → gradients → updated weights",watch:"zero_grad를 step 뒤가 아니라 새 backward 전에 수행합니다."},
    {title:"Encoder-Decoder",purpose:"과거 sequence를 hidden state로 압축하고 미래 값을 한 step씩 생성합니다.",code:"h=encoder(source)\nfor t: out,h=decoder(input,h); input=out",flow:"source [B,T,1] → h → outputs [B,H,1]",watch:"Decoder Linear 출력 차원은 다음 입력 feature 차원과 같아야 합니다."}
  ];
  chapter.theory_guide = [
    {title:"시계열 누수",concept:"평가 구간의 최솟값·최댓값을 scaling 학습에 사용하면 미래 정보를 미리 본 것이 됩니다.",flow:"train fit_transform; test transform",code_signal:"scaler.fit은 train에 한 번만 등장합니다.",exam_clue:"test_scaled 줄에는 fit이 없어야 합니다."},
    {title:"Recurrent shape",concept:"batch_first=True인 RNN은 [B,T,F]를 받고 모든 시점의 hidden output [B,T,H]와 마지막 hidden state를 반환합니다.",flow:"x → (out,h)",code_signal:"out은 Linear 입력, h는 encoder-decoder 전달값으로 사용됩니다.",exam_clue:"_로 버리는 값이 out인지 h인지 모델 목적에 따라 다릅니다."},
    {title:"Conv1D 축",concept:"Conv1d는 [B,C,L]을 요구하므로 시계열 [B,T,F]의 time과 feature 축을 전치해 채널=feature로 맞춥니다.",flow:"[B,T,F] → [B,F,T] → Conv1d → [B,H,T-1] → [B,T-1,H]",code_signal:"forward의 transpose(1,2)가 in_channels=input_size를 설명합니다.",exam_clue:"Linear 입력은 Conv1d의 out_channels인 hidden_size입니다."},
    {title:"평가 Metric",concept:"RMSE는 큰 오차에 민감하고 원래 target 단위의 오차를, MAPE는 실제값 대비 상대 오차를 나타냅니다.",flow:"y_true and y_pred → scalar",code_signal:"sklearn metric 인자 순서는 정답, 예측입니다.",exam_clue:"test_predictions를 첫 번째 인자에 넣지 않습니다."}
  ];
  const cells={
    "exam-data1-window":`features.append(data_seq[i:i + sequence_length])
labels.append(data_seq[i + sequence_length, 0])
features, labels = np.array(features), np.array(labels)
features = torch.tensor(features, dtype=torch.float32)
labels = torch.tensor(labels, dtype=torch.float32)`,
    "exam-data1-train":`batch_x, batch_y = batch_x.to(device), batch_y.to(device)
pred = model(batch_x)[:, -1, 0]
loss = loss_fn(pred, batch_y)
optimizer.zero_grad()
loss.backward()
optimizer.step()`,
    "exam-data1-eval":`test_x, test_y = test_x.to(device), test_y.to(device)
test_pred = model(test_x)[:, -1, 0]
test_loss = loss_fn(test_pred, test_y)`,
    "exam-data1-metric":`rmse = root_mean_squared_error(y_test, test_predictions)
mape = mean_absolute_percentage_error(y_test, test_predictions)`,
    "exam-data1-conv":`self.conv1d = nn.Conv1d(in_channels=input_size, out_channels=hidden_size, kernel_size=2, stride=1)
self.fc = nn.Linear(hidden_size, 1)`,
    "exam-data1-rnn":`self.rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)
self.fc = nn.Linear(hidden_size, 1)
out, _ = self.rnn(x)
return self.fc(out)`,
    "exam-data1-encoder":`self.rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)
_, h = self.rnn(x)
return h`,
    "exam-data1-decoder":`self.rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)
self.fc = nn.Linear(hidden_size, input_size)
out, h = self.rnn(x, h)
out = self.fc(out)
return out, h`,
    "exam-data1-loop":`h = self.encoder(source)
input = source[:, -1, :].unsqueeze(1)
for t in range(target_len):
    out, h = self.decoder(input, h)
    input = out`
  };Object.entries(cells).forEach(([id,source])=>course.cells[id]={source});
  const base={subject:"Data",chapterId:chapter.id,chapterNumber:chapter.number,chapterTitle:chapter.title,file:chapter.file,occurrence:0,isSourceBlank:true,source_type:"practice TODO와 solution 정답 검증"};
  const make=d=>({...base,accepted_answers:[d.answer],...d});
  chapter.subjective=[
    make({id:"exam-data01-01",topic:"시계열 Window Tensor",difficulty:"2 · 데이터 구성",sourceId:"exam-data1-window",prompt:"과거 window와 다음 값을 feature/label로 구성하고 float32 Tensor로 변환하는 다섯 줄을 작성하세요.",answer:cells["exam-data1-window"],problem_context:`for i in range(len(data_seq) - sequence_length):
    features.append(data_seq[????:????])
    labels.append(data_seq[????, ????])
features, labels = ????, ????
features = torch.tensor(????, dtype=????)
labels = torch.tensor(????, dtype=????)`,explanation:"입력은 i부터 i+sequence_length 직전까지, 정답은 바로 다음 시점 i+sequence_length의 첫 feature입니다. 리스트를 NumPy 배열로 바꾼 뒤 모델 연산을 위해 둘 다 float32 Tensor로 만듭니다.",tensor_flow:"scaled [N,1] → lists → NumPy arrays → X [N-T,T,1], y [N-T] float32",code_signal:"주석 sequence_length와 출력 shape [956,50,1]/[956]이 slice와 label index를 결정합니다.",retry:"작은 T=3 예제로 입력 [0:3]의 정답 index가 3인지 확인하세요."}),
    make({id:"exam-data01-02",topic:"Training Step",difficulty:"3 · 전체 학습 연결",sourceId:"exam-data1-train",prompt:"batch를 device로 옮기고 마지막 시점 예측의 MSE gradient로 파라미터를 갱신하는 여섯 줄을 작성하세요.",answer:cells["exam-data1-train"],problem_context:`# model output: [B,T,1], target: [B]
batch_x, batch_y = ????, ????
pred = model(batch_x)[????, ????, ????]
loss = loss_fn(????, ???? )
optimizer.????()
loss.????()
optimizer.????()`,explanation:"입력·정답을 같은 device로 옮기고 [B,T,1]에서 마지막 시점의 scalar [B]를 선택해 target과 MSE를 계산합니다. 이전 gradient를 지운 뒤 backward와 step을 실행합니다.",tensor_flow:"[B,T,1] → model [B,T,1] → [:,-1,0] [B] → loss scalar → gradients",code_signal:"문제 주석에 출력 shape과 마지막 timestep index가 명시되고 optimizer 학습 표준 순서가 이어집니다.",retry:"각 줄 뒤 shape를 쓰고 zero_grad→backward→step 순서를 다시 확인하세요."}),
    make({id:"exam-data01-03",topic:"Evaluation Step",difficulty:"2 · 평가 연결",sourceId:"exam-data1-eval",prompt:"no_grad 안에서 평가 batch를 이동하고 마지막 시점 예측과 test loss를 계산하는 세 줄을 작성하세요.",answer:cells["exam-data1-eval"],problem_context:`with torch.no_grad():
    for test_x, test_y in test_loader:
        test_x, test_y = ????, ????
        test_pred = model(test_x)[????, ????, ????]
        test_loss = loss_fn(????, ????)`,explanation:"평가도 device와 shape 조건은 학습과 같지만 gradient 초기화·backward·step은 없습니다. 마지막 시점 [B]를 test_y와 비교합니다.",tensor_flow:"test [B,T,1] → prediction [B] → MSE scalar",code_signal:"model.eval과 no_grad가 이미 있어 빈칸에는 forward와 loss만 남습니다.",retry:"학습 step과 비교해 평가에서 제거되는 세 연산을 말해 보세요."}),
    make({id:"exam-data01-04",topic:"RMSE·MAPE",difficulty:"1 · Metric 입력",sourceId:"exam-data1-metric",prompt:"CPU NumPy 정답과 예측으로 RMSE와 MAPE를 계산하는 두 줄을 작성하세요.",answer:cells["exam-data1-metric"],problem_context:`test_predictions = test_predictions.cpu().numpy()
y_test = y_test.cpu().numpy()
rmse = root_mean_squared_error(????, ???? )
mape = mean_absolute_percentage_error(????, ???? )`,explanation:"sklearn metric은 y_true를 먼저, y_pred를 두 번째로 받습니다. 두 값 모두 CPU NumPy 배열로 변환돼 있습니다.",tensor_flow:"y_test/test_predictions [N] → two scalar metrics",code_signal:"함수 parameter 관례와 변수명 y_test/test_predictions가 순서를 알려줍니다.",retry:"정답(true)과 예측(pred)을 먼저 표시한 후 두 함수에 같은 순서로 넣으세요."}),
    make({id:"exam-data01-05",topic:"Conv1D Model",difficulty:"2 · Layer 구성",sourceId:"exam-data1-conv",prompt:"전치된 [B,input_size,T]를 hidden channel로 변환하고 각 시점을 scalar로 출력하는 두 layer를 작성하세요.",answer:cells["exam-data1-conv"],problem_context:`self.conv1d = nn.Conv1d(
    in_channels=????, out_channels=????,
    kernel_size=2, stride=1
)
self.fc = nn.Linear(????, 1)`,explanation:"transpose 뒤 feature 수가 Conv1d channel이므로 in_channels=input_size입니다. Conv 출력 channel hidden_size가 다시 마지막 축이 된 후 Linear 입력이 됩니다.",tensor_flow:"[B,T,input] → [B,input,T] → [B,hidden,T-1] → [B,T-1,hidden] → [B,T-1,1]",code_signal:"forward의 두 transpose와 constructor 인자 input_size/hidden_size가 채널을 결정합니다.",retry:"각 transpose 뒤 축 순서를 적고 Linear 직전 마지막 축을 확인하세요."}),
    make({id:"exam-data01-06",topic:"RNNModel",difficulty:"3 · 함수 단위 구현",sourceId:"exam-data1-rnn",prompt:"batch-first RNN과 scalar head를 만들고 모든 시점 출력을 Linear에 전달하는 핵심 네 줄을 작성하세요.",answer:cells["exam-data1-rnn"],problem_context:`class RNNModel(nn.Module):
  def __init__(self, input_size, hidden_size, num_layers):
      super(RNNModel, self).__init__()
      self.rnn = nn.RNN(????, ????, ????, batch_first=????)
      self.fc = nn.Linear(????, 1)

  def forward(self, x):
      out, _ = self.rnn(????)
      return self.fc(????)`,explanation:"RNN은 input_size→hidden_size 표현을 각 시점에 만들고 fc가 hidden_size를 1개 예측값으로 투영합니다. hidden state는 여기서 사용하지 않아 _로 버립니다.",tensor_flow:"x [B,T,input] → out [B,T,H] → [B,T,1]",code_signal:"학습 코드가 model(batch_x)[:, -1,0]을 사용하므로 forward는 전체 시점 출력을 반환해야 합니다.",retry:"RNN 출력 두 값 중 fc에 들어갈 Tensor와 그 마지막 차원을 확인하세요."}),
    make({id:"exam-data01-07",topic:"Encoder Hidden State",difficulty:"2 · 상태 전달",sourceId:"exam-data1-encoder",prompt:"Encoder에서 batch-first RNN을 구성하고 마지막 hidden state만 반환하는 세 줄을 작성하세요.",answer:cells["exam-data1-encoder"],problem_context:`self.rnn = nn.RNN(????, ????, ????, batch_first=True)

def forward(self, x):
    ????, h = self.rnn(????)
    return ????`,explanation:"Encoder의 목적은 전체 시점 출력보다 과거를 요약한 hidden state를 Decoder에 전달하는 것입니다. 따라서 out을 _로 버리고 h를 반환합니다.",tensor_flow:"source [B,T,input] → h [layers,B,H]",code_signal:"RNNRNN.forward의 h=self.encoder(source)가 encoder 반환 타입을 지시합니다.",retry:"RNN의 (out,h) 중 다음 Decoder 호출 인자로 쓰이는 것을 고르세요."}),
    make({id:"exam-data01-08",topic:"Decoder Step",difficulty:"3 · 상태·출력",sourceId:"exam-data1-decoder",prompt:"이전 값과 hidden state를 받아 한 시점의 다음 값을 만들고 갱신된 상태와 함께 반환하는 다섯 줄을 작성하세요.",answer:cells["exam-data1-decoder"],problem_context:`self.rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)
self.fc = nn.Linear(????, ???? )

def forward(self, x, h):
    out, h = self.rnn(????, ???? )
    out = self.fc(????)
    return ????, ????`,explanation:"Decoder RNN 출력 hidden_size를 다음 입력과 같은 input_size로 투영해야 autoregressive loop에서 input=out이 가능합니다. 갱신된 h도 다음 step으로 넘깁니다.",tensor_flow:"x [B,1,input] + h → out [B,1,H] → value [B,1,input] + new h",code_signal:"loop의 input=out 때문에 fc 출력 차원이 input_size여야 합니다.",retry:"현재 step 값과 다음 step 상태 두 반환값을 구분하세요."}),
    make({id:"exam-data01-09",topic:"Autoregressive Forecast",difficulty:"3 · 반복 생성",sourceId:"exam-data1-loop",prompt:"Encoder 상태와 source 마지막 값을 시작점으로 target_len개 미래 값을 순차 생성하는 핵심 다섯 줄을 작성하세요.",answer:cells["exam-data1-loop"],problem_context:`h = self.????(source)
input = source[:, ????, :].????(1)
for t in range(????):
    out, h = self.????(input, h)
    predictions.append(out.squeeze(1))
    input = ????`,explanation:"Encoder가 만든 h와 관측된 마지막 값을 첫 Decoder 입력으로 사용합니다. 각 예측 out을 저장하고 그대로 다음 입력으로 재사용해 target_len만큼 생성합니다.",tensor_flow:"source [B,T,F] → h + input [B,1,F] → target_len outputs → [B,H,F]",code_signal:"Decoder가 out,h를 반환하고 predictions를 마지막에 stack하므로 loop의 feedback 연결을 알 수 있습니다.",retry:"첫 입력, 한 step 출력 저장, 다음 입력 갱신 세 역할을 확인하세요."})
  ];
  chapter.mcq=[
    {id:"exam-data01-m1",source_question_id:"exam-data01-02",topic:"마지막 시점",prompt:"model(batch_x) shape이 [B,T,1]이고 target이 [B]일 때 loss용 예측은?",answer_index:3,explanation:"시간축 마지막과 feature 0을 선택합니다.",choices:[{text:"model(batch_x)[:,0,0]",why:"첫 시점을 고릅니다."},{text:"model(batch_x)[-1]",why:"마지막 batch를 고릅니다."},{text:"model(batch_x)[:,:,0]",why:"[B,T]라 target [B]와 다릅니다."},{text:"model(batch_x)[:,-1,0]",why:"batch별 마지막 시점 scalar입니다."},{text:"model(batch_x).mean()",why:"batch 전체 scalar가 됩니다."}]},
    {id:"exam-data01-m2",source_question_id:"exam-data01-02",topic:"학습 순서",prompt:"loss 계산 후 올바른 갱신 순서는?",answer_index:1,explanation:"이전 gradient를 지우고 새 gradient를 계산한 뒤 step합니다.",choices:[{text:"step→backward→zero_grad",why:"gradient 생성 전 갱신합니다."},{text:"zero_grad→backward→step",why:"표준 학습 순서입니다."},{text:"backward→zero_grad→step",why:"방금 계산한 gradient를 지웁니다."},{text:"zero_grad→step→backward",why:"step 시 gradient가 없습니다."},{text:"backward만",why:"파라미터가 갱신되지 않습니다."}]},
    {id:"exam-data01-m3",source_question_id:"exam-data01-05",topic:"Conv1D 축",prompt:"x.transpose(1,2) 뒤 Conv1d의 in_channels는?",answer_index:0,explanation:"원래 마지막 feature 축이 channel 축으로 이동합니다.",choices:[{text:"input_size",why:"[B,input_size,T]의 채널 수입니다."},{text:"sequence_length",why:"Conv1d의 길이 축입니다."},{text:"hidden_size",why:"출력 채널입니다."},{text:"batch_size",why:"batch 축은 channel이 아닙니다."},{text:"1 고정",why:"다변량 입력에서는 input_size가 1이 아닐 수 있습니다."}]},
    {id:"exam-data01-m4",source_question_id:"exam-data01-08",topic:"Decoder Head",prompt:"Decoder의 예측을 다음 step 입력으로 재사용하려면 fc 출력 차원은?",answer_index:4,explanation:"다음 RNN 입력 feature 수와 같아야 합니다.",choices:[{text:"hidden_size",why:"RNN hidden 출력과 같지만 다음 input feature와 다를 수 있습니다."},{text:"num_layers",why:"layer 수는 feature 차원이 아닙니다."},{text:"target_len",why:"시간 step 수입니다."},{text:"batch_size",why:"출력 feature와 무관합니다."},{text:"input_size",why:"input=out feedback의 shape이 맞습니다."}]},
    {id:"exam-data01-m5",source_question_id:"exam-data01-04",topic:"Metric 인자",prompt:"sklearn RMSE 호출의 인자 순서는?",answer_index:2,explanation:"정답 y_true, 예측 y_pred 순서입니다.",choices:[{text:"prediction만",why:"비교 대상이 없습니다."},{text:"test_predictions,y_test",why:"일반 관례와 반대입니다."},{text:"y_test,test_predictions",why:"정답과 예측 순서가 맞습니다."},{text:"model,X_test",why:"Tensor 모델 입력이 metric 인자가 아닙니다."},{text:"loss,y_test",why:"batch loss를 평가 배열과 비교하지 않습니다."}]}
  ];chapter.questionCount=chapter.subjective.length;chapter.exam_design={version:2,style:"practice TODO·solution 검증형",difficulty:["데이터·Metric","Tensor 축","모델·학습 독립 구현"],excluded:["ticker·날짜","출력 수치 암기","경로"]};
})();
