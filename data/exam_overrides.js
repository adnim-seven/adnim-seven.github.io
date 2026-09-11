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

(() => {
  "use strict";
  const course = window.LLM_COURSE;
  const chapter = course.chapters.find((item) => item.file === "RecSys_GCF_practice.ipynb");
  if (!chapter) return;
  chapter.notebook_goal = "MovieLens 사용자–아이템 그래프에서 NGCF 메시지 전달, BPR 학습, Top-K 평가를 코드로 구현한다.";
  chapter.summary = "edge_index의 양방향 메시지를 degree로 정규화해 node별로 집계하고, 여러 layer 표현을 연결한 embedding으로 positive item의 점수를 negative item보다 높게 학습합니다.";
  chapter.capability = "주어진 edge와 embedding shape를 근거로 NGCF layer·BPR loss·negative sampling·Top-K metric의 핵심 코드를 독립적으로 완성할 수 있다.";
  chapter.overview = {title:"상호작용 기록이 Top-K 추천 결과가 되는 과정",subtitle:"사용자와 아이템을 한 그래프에 배치한 뒤 정규화된 이웃 메시지를 모으고 pairwise ranking loss로 embedding을 학습한다.",steps:[
    {label:"그래프 구성",code:"(user, movie + num_users)",flow:"ratings → edge_index [2,E]"},
    {label:"메시지 전달",code:"W1(neighbor)+W2(self*neighbor)",flow:"[E,D] → normalized messages"},
    {label:"Node 집계",code:"index_add_ + self message",flow:"edge messages → [V,D]"},
    {label:"표현 결합",code:"concat(H0,...,HL, dim=-1)",flow:"[V,D0+...+DL]"},
    {label:"학습·평가",code:"BPR / Recall·Precision·NDCG@K",flow:"rank scores → loss and metrics"}
  ],rules:[
    "아이템 node 번호는 movieId에 num_users를 더하고, item embedding을 조회할 때는 다시 num_users를 뺀다.",
    "edge norm [E]은 unsqueeze(1)로 [E,1]이 되어야 message [E,D]에 edge별로 곱해진다.",
    "src가 받을 메시지는 dst feature에서, dst가 받을 메시지는 src feature에서 시작한다.",
    "index_add_의 index는 메시지를 보내는 node가 아니라 받는 목적 node다.",
    "BPR은 positive score와 negative score의 차이를 크게 만드는 pairwise loss다."
  ]};
  chapter.key_points = [
    {title:"Node 번호 공간",purpose:"user와 item을 겹치지 않는 하나의 node 축에 배치합니다.",code:"dst.append(movieId + num_users)",flow:"user [0,U) + item [U,U+I)",watch:"학습 batch에서 item index를 뽑을 때 offset을 제거합니다."},
    {title:"정규화 메시지",purpose:"연결이 많은 node의 영향이 과도해지지 않게 양 끝 degree를 함께 보정합니다.",code:"norm=1/sqrt(deg[src]*deg[dst])",flow:"[E] → [E,1] × [E,D]",watch:"sqrt와 reciprocal의 순서를 지킵니다."},
    {title:"양방향 집계",purpose:"item→user, user→item 메시지와 self message를 각 node에 더합니다.",code:"index_add_(0,destination,message)",flow:"[E,D] → [V,D]",watch:"두 방향의 destination index를 바꾸어 쓰지 않습니다."},
    {title:"BPR 학습",purpose:"관측 item의 내적 점수가 임의 negative item보다 커지게 만듭니다.",code:"-mean(logsigmoid(pos-neg))",flow:"3×[B,D] → 2×[B] scores → scalar",watch:"negative item은 전체 item 범위에서 batch 크기만큼 뽑습니다."},
    {title:"Top-K 평가",purpose:"사용자별 모든 item 점수에서 상위 K개와 실제 positive를 비교합니다.",code:"scores=item_features @ user_emb; topk(scores,k)",flow:"[I,D] @ [D] → [I] → K indices",watch:"NDCG는 맞힌 개수뿐 아니라 높은 순위의 hit에 더 큰 값을 줍니다."}
  ];
  chapter.theory_guide = [
    {title:"메시지 방향",concept:"메시지는 이웃 feature로 만들고 목적 node index에 누적합니다.",flow:"dst feature → message for src; src feature → message for dst",code_signal:"변수명 edge_messages_for_src/for_dst가 목적지를 표시합니다.",exam_clue:"for_dst를 계산할 때 첫 선형변환 입력은 src_feat입니다."},
    {title:"Broadcasting",concept:"edge마다 하나인 norm을 모든 feature 차원에 적용하려면 singleton 축을 추가합니다.",flow:"[E] → [E,1] × [E,D]",code_signal:"unsqueeze(1)은 값을 복사하지 않고 shape만 바꿉니다.",exam_clue:"unsqueeze(0)이면 [1,E]라 feature 축과 맞지 않습니다."},
    {title:"Layer concat",concept:"초기 embedding과 각 layer가 담은 서로 다른 hop 정보를 node별 긴 vector로 연결합니다.",flow:"H0,H1,... → concat(dim=-1)",code_signal:"layer_outputs는 loop 전에 node_features를 이미 포함합니다.",exam_clue:"dim=0은 node 수를 늘리므로 틀립니다."},
    {title:"Ranking metric",concept:"Recall@K는 실제 positive를 얼마나 회수했는지, Precision@K는 추천 K개 중 hit 비율, NDCG@K는 hit 순위까지 평가합니다.",flow:"top-K indices + positives → three scalars",code_signal:"dcg는 rank+2의 log2로 할인하고 idcg로 나눕니다.",exam_clue:"recall 분모는 n_pos, precision 분모는 k입니다."}
  ];
  const cells={
    "exam-data2-edge":`src.append(row['userId'])\ndst.append(row['movieId'] + num_users)`,
    "exam-data2-norm":`norm = 1.0/torch.sqrt(deg[src]*deg[dst])`,
    "exam-data2-dstmsg":`edge_messages_for_dst = self.W1(src_feat) + self.W2(src_feat*dst_feat)\nedge_messages_for_dst *= norm.unsqueeze(1)`,
    "exam-data2-dstagg":`aggregated_messages.index_add_(0, dst, edge_messages_for_dst)\naggregated_messages[user_num:] += self.W1(node_features[user_num:])`,
    "exam-data2-layer":`node_features = layer(edge_index, node_features,self.num_users, self.num_items)\nlayer_outputs.append(node_features)`,
    "exam-data2-concat":`final_features = torch.concat(layer_outputs,dim=-1)\nuser_features = final_features[:self.num_users]\nitem_features = final_features[self.num_users:]`,
    "exam-data2-bpr":`pos_scores = torch.sum(user_emb * pos_item_emb, dim=1)\nneg_scores = torch.sum(user_emb * neg_item_emb, dim=1)\nloss = -torch.mean(F.logsigmoid(pos_scores - neg_scores))`,
    "exam-data2-sample":`pos_item_indices = train_edge_index[1, indices] - num_users\nneg_item_indices = torch.randint(0, num_movies, (batch_size,), device=device)\npos_emb = item_features[pos_item_indices]\nneg_emb = item_features[neg_item_indices]`,
    "exam-data2-update":`loss = model.bpr_loss(u_emb, pos_emb, neg_emb)\noptimizer.zero_grad()\nloss.backward()\noptimizer.step()`,
    "exam-data2-topk":`scores = torch.matmul(item_features, user_emb)\ntopk_scores, topk_indices = torch.topk(scores, k=k)\nrecall_u = hits / n_pos\nprecision_u = hits / k\nndcg_u = dcg / idcg if idcg > 0 else 0.0`
  };
  Object.entries(cells).forEach(([id,source])=>course.cells[id]={source});
  const base={subject:"Data",chapterId:chapter.id,chapterNumber:chapter.number,chapterTitle:chapter.title,file:chapter.file,occurrence:0,isSourceBlank:true,source_type:"practice TODO·전체 코드와 solution 검증"};
  const make=d=>({...base,accepted_answers:[d.answer],...d});
  chapter.subjective=[
    make({id:"exam-data02-01",topic:"Graph Edge 구성",difficulty:"1 · 인덱스",sourceId:"exam-data2-edge",prompt:"rating row에서 사용자 node와 offset이 적용된 아이템 node를 edge 목록에 추가하는 두 줄을 작성하세요.",answer:cells["exam-data2-edge"],problem_context:`if row['rating'] >= rating_threshold:\n    src.append(????)\n    dst.append(????)`,explanation:"사용자 ID는 앞 node 구간에 그대로 넣고 아이템은 num_users를 더해 뒤 구간으로 이동시킵니다. 두 종류 node가 같은 번호를 갖는 충돌을 막습니다.",tensor_flow:"row scalars → src/dst lists → edge_index [2,E] long",code_signal:"바로 아래 item indices after user indices 주석이 offset 기준을 알려줍니다.",retry:"user node 범위와 item node 범위를 반열림 구간으로 적어 보세요."}),
    make({id:"exam-data02-02",topic:"Degree 정규화",difficulty:"2 · 수식",sourceId:"exam-data2-norm",prompt:"각 edge의 양 끝 degree를 대칭적으로 보정하는 norm [E] 계산 한 줄을 작성하세요.",answer:cells["exam-data2-norm"],problem_context:`# calculate 1/(root(deg(u)) * root(deg(i))) for all edge\nnorm = ????`,explanation:"각 edge의 src와 dst degree를 곱한 뒤 제곱근의 역수를 취합니다. degree가 큰 node에서 오는 메시지를 줄여 graph 연결 수 차이를 보정합니다.",tensor_flow:"deg [V] → deg[src],deg[dst] [E] → norm [E]",code_signal:"주석의 1/(root(deg(u))*root(deg(i)))를 Tensor 연산 순서로 그대로 옮기면 됩니다.",retry:"norm의 shape가 node 수 V가 아니라 edge 수 E인 이유를 말해 보세요."}),
    make({id:"exam-data02-03",topic:"User→Item 메시지",difficulty:"2 · 메시지",sourceId:"exam-data2-dstmsg",prompt:"dst 아이템이 src 사용자에게서 받을 interaction message를 계산하고 norm을 적용하는 두 줄을 작성하세요.",answer:cells["exam-data2-dstmsg"],problem_context:`# Hint: W1(h_u) + W2(h_i * h_u), then normalize\nedge_messages_for_dst = ????\nedge_messages_for_dst *= ????`,explanation:"목적지가 dst이므로 이웃 src_feat를 W1에 넣고, 사용자·아이템 원소곱을 W2에 넣습니다. norm은 [E,1]로 바꿔 feature별 broadcasting합니다.",tensor_flow:"src_feat,dst_feat [E,D] → message [E,D] × norm [E,1]",code_signal:"for_dst와 주석 h_u가 첫 W1 입력을 결정하고 기존 for_src 코드가 대칭 구조의 예시입니다.",retry:"for_src 코드에서 src와 dst만 역할 교환해 다시 작성하세요."}),
    make({id:"exam-data02-04",topic:"Item 집계·Self message",difficulty:"3 · 집계",sourceId:"exam-data2-dstagg",prompt:"user→item 메시지를 dst node에 합산하고 모든 item node의 self 변환을 더하는 두 줄을 작성하세요.",answer:cells["exam-data2-dstagg"],problem_context:`# m_(i<-i) and messages arriving at item i\n????\n????`,explanation:"edge message는 destination인 dst 위치에 index_add_로 누적합니다. item node는 전체 node 배열의 user_num 이후 구간이므로 같은 slice에 W1(self)를 더합니다.",tensor_flow:"edge messages [E,D] → aggregated [V,D]; item slice [I,D]",code_signal:"바로 위 user 집계 두 줄이 완전한 대칭 예시이며 item 경계는 user_num입니다.",retry:"user용 두 줄에서 src→dst, 앞 slice→뒤 slice로 바꿔 보세요."}),
    make({id:"exam-data02-05",topic:"NGCF Layer 반복",difficulty:"1 · 호출",sourceId:"exam-data2-layer",prompt:"현재 node feature를 한 NGCF layer에 전달해 갱신하고 layer 출력 목록에 저장하는 두 줄을 작성하세요.",answer:cells["exam-data2-layer"],problem_context:`for layer in self.layers:\n    node_features = ????\n    ????`,explanation:"각 layer는 edge, 현재 node 표현, 사용자·아이템 수를 받아 다음 표현을 반환합니다. 이 결과를 다음 layer 입력과 최종 concat 자료로 동시에 사용합니다.",tensor_flow:"H(l-1) [V,Din] → H(l) [V,Dout] → layer_outputs",code_signal:"NGCFLayer.forward signature의 인자 순서와 loop 뒤 concat 주석이 답을 결정합니다.",retry:"호출 인자를 forward 정의와 한 자리씩 대응시키세요."}),
    make({id:"exam-data02-06",topic:"Multi-layer 표현",difficulty:"2 · 축·분리",sourceId:"exam-data2-concat",prompt:"초기 embedding과 모든 layer 출력을 feature 축으로 연결한 뒤 user/item node 구간을 분리하는 세 줄을 작성하세요.",answer:cells["exam-data2-concat"],problem_context:`final_features = torch.concat(????, dim=????)\nuser_features = final_features[????]\nitem_features = final_features[????]`,explanation:"같은 node의 hop별 표현을 길게 붙이므로 마지막 feature 축 dim=-1을 사용합니다. node 배열은 user가 먼저이므로 self.num_users를 경계로 자릅니다.",tensor_flow:"H0...HL [V,Dl] → [V,sum Dl] → user [U,D*], item [I,D*]",code_signal:"layer_outputs의 각 Tensor가 node 축 V를 공유하고 node embedding 생성 순서가 user+item입니다.",retry:"dim=0을 쓰면 어떤 축 크기가 잘못 커지는지 확인하세요."}),
    make({id:"exam-data02-07",topic:"BPR Ranking Loss",difficulty:"3 · Loss",sourceId:"exam-data2-bpr",prompt:"user와 positive/negative item embedding 내적으로 두 score를 만들고 positive가 더 커지도록 BPR loss를 계산하는 세 줄을 작성하세요.",answer:cells["exam-data2-bpr"],problem_context:`pos_scores = ????\nneg_scores = ????\nloss = ????`,explanation:"batch별 user-item 원소곱을 feature 축으로 합쳐 score [B]를 만듭니다. logsigmoid(pos-neg)의 음의 평균을 최소화하면 positive score와 negative score 차이가 커집니다.",tensor_flow:"three [B,D] embeddings → two [B] scores → scalar loss",code_signal:"함수 인자명과 이어지는 reg_loss가 현재 loss가 ranking 본항임을 알려줍니다.",retry:"pos와 neg가 같을 때 loss가 왜 충분히 작지 않은지 식으로 확인하세요."}),
    make({id:"exam-data02-08",topic:"Negative Sampling",difficulty:"2 · 학습 데이터",sourceId:"exam-data2-sample",prompt:"positive item의 user offset을 제거하고 같은 batch 크기의 negative item을 뽑아 두 embedding을 조회하는 네 줄을 작성하세요.",answer:cells["exam-data2-sample"],problem_context:`pos_item_indices = ????\nneg_item_indices = torch.randint(????, ????, ????, device=device)\npos_emb = ????\nneg_emb = ????`,explanation:"edge_index의 item은 통합 node 번호이므로 item_features용 0 기반 index로 되돌립니다. negative는 [0,num_movies)에서 batch_size개를 뽑아 같은 shape의 비교 embedding을 만듭니다.",tensor_flow:"edge node IDs [B] → item IDs [B] → pos/neg embeddings [B,D]",code_signal:"item_features는 이미 user 구간이 제거된 배열이고 torch.randint의 high는 exclusive입니다.",retry:"offset 제거 전 index로 item_features를 조회하면 왜 범위를 벗어날 수 있는지 설명하세요."}),
    make({id:"exam-data02-09",topic:"BPR 학습 Step",difficulty:"2 · 최적화",sourceId:"exam-data2-update",prompt:"세 embedding으로 BPR loss를 구하고 gradient를 초기화·역전파·갱신하는 네 줄을 작성하세요.",answer:cells["exam-data2-update"],problem_context:`loss = ????\noptimizer.????()\nloss.????()\noptimizer.????()`,explanation:"모델의 bpr_loss로 scalar를 만든 뒤 이전 gradient를 지우고 backward로 새 gradient를 계산해 optimizer가 파라미터를 갱신합니다.",tensor_flow:"embeddings → scalar loss → gradients → updated embeddings/layers",code_signal:"model.train과 batch loop 안이라는 문맥이 표준 optimizer 순서를 요구합니다.",retry:"zero_grad, backward, step을 각각 왜 필요한지 한 문장씩 말하세요."}),
    make({id:"exam-data02-10",topic:"Top-K 평가",difficulty:"3 · Metric",sourceId:"exam-data2-topk",prompt:"한 사용자의 전체 item score와 top-K index를 구하고 hits·DCG로 Recall, Precision, NDCG를 계산하는 핵심 다섯 줄을 작성하세요.",answer:cells["exam-data2-topk"],problem_context:`scores = ????\ntopk_scores, topk_indices = ????\n# hits, dcg, idcg were accumulated above\nrecall_u = ????\nprecision_u = ????\nndcg_u = ????`,explanation:"모든 item embedding과 user embedding의 내적으로 ranking score를 만들고 상위 K를 고릅니다. Recall은 실제 positive 기준, Precision은 추천 수 K 기준, NDCG는 이상적 DCG 대비 순위 품질입니다.",tensor_flow:"item [I,D] @ user [D] → scores [I] → top-K → three scalars",code_signal:"n_pos와 k의 의미, 위 loop에서 누적한 dcg/idcg가 각 분모를 결정합니다.",retry:"hits=2, n_pos=4, k=10일 때 Recall과 Precision을 직접 계산하세요."})
  ];
  chapter.mcq=[
    {id:"exam-data02-m1",source_question_id:"exam-data02-03",topic:"메시지 방향",prompt:"dst 아이템이 받을 메시지의 W1 입력은?",answer_index:1,explanation:"목적지가 dst이면 이웃인 src 사용자의 feature가 전달됩니다.",choices:[{text:"dst_feat",why:"자기 feature이며 이웃 메시지의 첫 항이 아닙니다."},{text:"src_feat",why:"사용자에서 아이템으로 전달되는 이웃 feature입니다."},{text:"node_features",why:"모든 node를 edge별 선택하지 않았습니다."},{text:"norm",why:"정규화 scalar입니다."},{text:"user_num",why:"node 경계값입니다."}]},
    {id:"exam-data02-m2",source_question_id:"exam-data02-04",topic:"집계 목적지",prompt:"edge_messages_for_dst를 누적할 index는?",answer_index:3,explanation:"변수 이름의 dst가 메시지를 받는 node index입니다.",choices:[{text:"src",why:"user 쪽 집계가 됩니다."},{text:"user_num",why:"단일 경계값입니다."},{text:"item_features",why:"index가 아니라 feature Tensor입니다."},{text:"dst",why:"item 목적 node입니다."},{text:"edge_index.size(1)",why:"edge 개수입니다."}]},
    {id:"exam-data02-m3",source_question_id:"exam-data02-06",topic:"Concat 축",prompt:"각 layer의 [V,D] 표현을 node별 긴 embedding으로 결합할 축은?",answer_index:4,explanation:"node 축 V를 유지하고 마지막 feature 축을 연결합니다.",choices:[{text:"dim=0",why:"node 수가 늘어납니다."},{text:"새 dim을 stack",why:"별도 layer 축이 생깁니다."},{text:"평균",why:"차원과 layer별 정보가 줄어듭니다."},{text:"concat 없이 마지막 layer",why:"이전 hop 표현을 버립니다."},{text:"dim=-1",why:"feature 차원이 늘어납니다."}]},
    {id:"exam-data02-m4",source_question_id:"exam-data02-07",topic:"BPR 목표",prompt:"BPR loss가 직접 크게 만들려는 값은?",answer_index:0,explanation:"positive와 negative 점수의 차이가 커질수록 logsigmoid 항이 좋아집니다.",choices:[{text:"pos_scores - neg_scores",why:"positive 순위를 negative보다 높이는 차이입니다."},{text:"pos_scores + neg_scores",why:"두 점수를 함께 키우는 목표가 아닙니다."},{text:"embedding norm",why:"regularization은 norm을 줄입니다."},{text:"edge degree",why:"graph 정규화 값입니다."},{text:"Recall@K",why:"평가 지표는 직접 미분하지 않습니다."}]},
    {id:"exam-data02-m5",source_question_id:"exam-data02-10",topic:"추천 Metric",prompt:"실제 positive 4개 중 2개를 Top-10에서 맞혔다면 Recall@10과 Precision@10은?",answer_index:2,explanation:"Recall=2/4, Precision=2/10입니다.",choices:[{text:"0.2, 0.5",why:"두 분모를 바꿨습니다."},{text:"0.5, 0.5",why:"Precision 분모는 실제 positive 수가 아닙니다."},{text:"0.5, 0.2",why:"각각 n_pos와 k를 분모로 씁니다."},{text:"2.0, 10.0",why:"비율 계산을 하지 않았습니다."},{text:"0.25, 0.1",why:"hit를 1개처럼 계산했습니다."}]}
  ];
  chapter.questionCount=chapter.subjective.length;
  chapter.exam_design={version:2,style:"practice TODO·전체 코드 검증형",difficulty:["호출·인덱스","Tensor 축·메시지","loss·평가 독립 구현"],excluded:["URL·경로","다운로드 명령","고정 seed·epoch 암기"]};
})();
