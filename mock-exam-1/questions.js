// Each slot holds its own rubric and points. {{A}} marks the exact code location.
window.EXAM_NUMBER = 1;
window.EXAM = [];
function q(id,subject,title,source,prompt,code,slots){
  window.EXAM.push({
    id,
    subject,
    title,
    source,
    prompt,
    code,
    slots: slots.map(([key, points, answer, why, alternatives = []]) => ({
      key,
      points,
      answer,
      why,
      alternatives
    }))
  });
}

q('1-1','LLM','다음 토큰 예측 데이터 구성','Chapter_2_Exercise_Dataset.ipynb','현재 i에서 max_length개 입력 토큰과 한 토큰 뒤로 이동한 정답을 구성하세요.',`for i in range(0, len(token_ids) - max_length, stride):
    input_chunk = {{A}}
    target_chunk = {{B}}
    self.input_ids.append(torch.tensor(input_chunk))
    self.target_ids.append(torch.tensor(target_chunk))`,[
  ['A', 2, 'token_ids[i:i+max_length]', '시작 인덱스 i부터 길이 max_length만큼 슬라이싱하여 입력 토큰 청크 [max_length]를 구성합니다. 오답 주의: token_ids[i:max_length]처럼 슬라이싱 끝점 계산에 i를 누락하면 매 스텝마다 청크 길이가 축소되는 치명적 오류가 발생합니다.', [
    'token_ids[i: i+max_length]', 'token_ids[i:i + max_length]', 'token_ids[i : i+max_length]', 'token_ids[i : i + max_length]'
  ]],
  ['B', 3, 'token_ids[i+1:i+max_length+1]', 'Next Token Prediction을 위해 입력과 길이는 max_length로 동일하되 한 토큰 미래로 시프트된 타깃 청크 [max_length]를 추출합니다. 오답 주의: 끝 인덱스를 max_length로 지정하면 입력과 길이가 달라져 배치 결합 시 shape mismatch 예외가 발생합니다.', [
    'token_ids[i+1: i+max_length+1]', 'token_ids[i+1:i + max_length + 1]', 'token_ids[i + 1:i + max_length + 1]', 'token_ids[i + 1 : i + max_length + 1]'
  ]]
]);

q('1-2','LLM','Causal Attention','Chapter_3_Excercise_Attention.ipynb 기반 변형','Q·K·V projection을 적용하세요. self.mask는 대각선 위가 1인 상삼각행렬입니다. 현재 길이의 bool mask로 미래 위치를 masked_fill_ 하세요.',`def forward(self, x):
    b, num_tokens, _ = x.shape
    keys = {{A}}
    queries = {{B}}
    values = {{C}}
    attn_scores = queries @ keys.transpose(1, 2)
    mask_bool = {{D}}
    {{E}}
    attn_weights = torch.softmax(attn_scores / keys.shape[-1] ** 0.5, dim=-1)
    return attn_weights @ values`,[
  ['A', 1, 'self.W_key(x)', '선형 계층을 통해 입력 임베딩 x [B, T, D]로부터 Key 텐서 [B, T, D_out]을 사영합니다.', ['self.W_k(x)']],
  ['B', 1, 'self.W_query(x)', '선형 계층을 통해 입력 임베딩 x [B, T, D]로부터 Query 텐서 [B, T, D_out]을 사영합니다.', ['self.W_q(x)']],
  ['C', 1, 'self.W_value(x)', '선형 계층을 통해 입력 임베딩 x [B, T, D]로부터 Value 텐서 [B, T, D_out]을 사영합니다.', ['self.W_v(x)']],
  ['D', 2, 'self.mask[:num_tokens, :num_tokens].bool()', '버퍼 마스크를 현재 시퀀스 길이 [num_tokens, num_tokens]로 자르고 불리언 타입으로 변환합니다. 오답 주의: .bool() 없이 정수 텐서를 masked_fill_에 넘기면 PyTorch 불리언 마스크 요구 런타임 에러가 발생합니다.', [
    'self.mask[:num_tokens, :num_tokens].to(torch.bool)', 'self.mask[:num_tokens, :num_tokens] == 1', 'self.mask[:num_tokens, :num_tokens].type(torch.bool)'
  ]],
  ['E', 2, 'attn_scores.masked_fill_(mask_bool, -torch.inf)', '미래 위치(상삼각)의 어텐션 스코어를 -∞로 채워 softmax 후 확률이 0이 되도록 인과적 마스킹을 적용합니다. 오답 주의: -1e9 등 유한 음수를 쓰면 FP16/BF16 정밀도에서 언더플로우나 미세 확률 누수가 발생합니다.', [
    "attn_scores.masked_fill_(mask_bool, float('-inf'))", "attn_scores.masked_fill_(mask_bool, -float('inf'))", 'attn_scores.masked_fill(mask_bool, -torch.inf)', "attn_scores.masked_fill(mask_bool, float('-inf'))"
  ]]
]);

q('1-3','LLM','언어 모델 학습 단계','Pretraining 노트북 기반 변형','logits [B,T,V], target [B,T]입니다. 모든 토큰이 유효합니다. cross_entropy 입력을 정리하고 학습 단계를 완성하세요.',`def train_step(model, input_batch, target_batch, optimizer):
    {{A}}
    logits = model(input_batch)
    loss = torch.nn.functional.cross_entropy(
        {{B}},
        {{C}},
    )
    {{D}}
    {{E}}
    return loss.item()`,[
  ['A', 1, 'optimizer.zero_grad()', '파이토치의 기본 기울기 누적 특성을 방지하기 위해 새 배치 연산 직전 이전 gradient를 0으로 초기화합니다.', ['optimizer.zero_grad(set_to_none=True)']],
  ['B', 2, 'logits.flatten(0, 1)', 'CrossEntropyLoss 2D 입력 요구에 맞춰 배치와 시퀀스 차원을 병합하여 [B*T, V] 형태로 펼칩니다. V(어휘 차원)는 유지됩니다.', [
    'logits.reshape(-1, logits.shape[-1])', 'logits.view(-1, logits.shape[-1])', 'logits.reshape(-1, logits.size(-1))', 'logits.view(-1, logits.size(-1))', 'logits.reshape(-1, logits.size(2))', 'logits.view(-1, logits.size(2))'
  ]],
  ['C', 1, 'target_batch.flatten()', '2차원 타깃 라벨 [B, T]를 평탄화하여 로짓 샘플과 1:1 매칭되는 1차원 [B*T] 텐서로 만듭니다.', [
    'target_batch.reshape(-1)', 'target_batch.view(-1)', 'target_batch.contiguous().view(-1)'
  ]],
  ['D', 2, 'loss.backward()', '스칼라 손실로부터 자동 미분 연산 그래프를 역방향 추적하여 모든 학습 가능 파라미터의 gradient를 계산합니다.', ['loss.backward(retain_graph=False)']],
  ['E', 2, 'optimizer.step()', '계산된 기울기와 학습률 스케줄에 따라 모델 파라미터 가중치를 갱신합니다.', ['optimizer.step(closure=None)']]
]);

q('2-1','RAG','문서 로딩과 인덱스 생성','1. Llama_index.ipynb · 사용자 제보 7월 기출','SimpleDirectoryReader와 VectorStoreIndex를 사용해 제공된 폴더 문서를 읽고 벡터 인덱스를 구성하세요.',`data_dir = "data"  # 제공 경로
documents = {{A}}
index = {{B}}`,[
  ['A', 2, 'SimpleDirectoryReader(data_dir).load_data()', 'Reader 객체 생성 후 반드시 .load_data()를 호출해야 파싱된 Document 객체 리스트(List[Document])가 반환됩니다.', [
    'SimpleDirectoryReader(input_dir=data_dir).load_data()', 'SimpleDirectoryReader(data_dir=data_dir).load_data()'
  ]],
  ['B', 3, 'VectorStoreIndex.from_documents(documents)', '파싱된 Document 목록을 받아 청킹, 임베딩, 벡터 스토어 색인을 일괄 생성하는 팩토리 메서드입니다.', [
    'VectorStoreIndex.from_documents(documents=documents)', 'VectorStoreIndex.from_documents(documents, transformations=None)'
  ]]
]);

q('2-2','RAG','청킹과 검색 연결','1. Llama_index.ipynb 기반 변형','SentenceSplitter로 청크 크기 200, 중복 50을 설정해 index에 적용하고, 검색 전용 객체로 question을 검색하세요.',`splitter = {{A}}
index = VectorStoreIndex.from_documents(documents, transformations={{B}})
retriever = {{C}}
retrieved_nodes = {{D}}`,[
  ['A', 2, 'SentenceSplitter(chunk_size=200, chunk_overlap=50)', '문장 경계를 보존하는 LlamaIndex 노드 파서로, 청크 크기 200과 중복 오버랩 50을 명시적 인자로 전달합니다.', [
    'SentenceSplitter(chunk_overlap=50, chunk_size=200)', 'SentenceSplitter(200, 50)'
  ]],
  ['B', 2, '[splitter]', 'from_documents의 transformations 매개변수는 청킹 파서와 메타데이터 추출기들의 리스트(List) 형태를 요구합니다.', ['(splitter,)', '[splitter,]']],
  ['C', 1, 'index.as_retriever()', '구축된 벡터 인덱스로부터 임베딩 유사도 기반 검색 전용 객체(Retriever)를 생성합니다.', [
    'index.as_retriever(similarity_top_k=2)', 'index.as_retriever(similarity_top_k=5)'
  ]],
  ['D', 2, 'retriever.retrieve(question)', '질문 텍스트를 전달하여 상위 연관 문서 청크들을 담은 NodeWithScore 리스트를 검색 및 반환합니다.', ['retriever.retrieve(str(question))']]
]);

q('2-3','RAG','검색 근거를 LLM 입력으로 연결','RAG 검색→prompt→생성 흐름 변형','각 검색 항목은 .node.get_content()로 읽습니다. 텍스트를 줄바꿈으로 연결하고 prompt를 채우세요. llm.complete() 응답의 .text를 추출하세요.',`qa_prompt = PromptTemplate(
    "근거: {context_str}\\n질문: {query_str}\\n답변:"
)
context_str = {{A}}
llm_input = qa_prompt.format(context_str={{B}}, query_str={{C}})
response = {{D}}
answer = {{E}}`,[
  ['A', 3, '"\\n".join(node.node.get_content() for node in retrieved_nodes)', '검색된 NodeWithScore 리스트의 각 node 객체에서 본문 텍스트(.get_content())를 추출하여 줄바꿈 문자("\\n")로 병합합니다.', [
    '"\\n".join([node.node.get_content() for node in retrieved_nodes])', '"\\n\\n".join(node.node.get_content() for node in retrieved_nodes)', '"\\n\\n".join([node.node.get_content() for node in retrieved_nodes])', '"\\n".join(n.node.get_content() for n in retrieved_nodes)', '"\\n".join([n.node.get_content() for n in retrieved_nodes])', '"\\n".join(node.get_content() for node in retrieved_nodes)', '"\\n".join([node.get_content() for node in retrieved_nodes])'
  ]],
  ['B', 1, 'context_str', 'qa_prompt 템플릿의 {context_str} 플레이스홀더에 결합된 검색 본문 문자열 변수를 연결합니다.', ['context_str=context_str']],
  ['C', 1, 'question', 'qa_prompt 템플릿의 {query_str} 플레이스홀더에 사용자 질문 변수를 연결합니다.', ['query_str=question']],
  ['D', 2, 'llm.complete(llm_input)', '완성된 프롬프트 텍스트를 LLM에 전달하여 CompletionResponse 객체를 획득합니다.', ['llm.complete(prompt=llm_input)']],
  ['E', 1, 'response.text', 'LLM 응답 객체에서 최종 생성된 텍스트 속성(.text)을 추출합니다.', ['str(response.text)', 'response.text.strip()']]
]);

q('3-1','Data','누수 없는 정규화','ts_practice.ipynb 기반 변형','시간순으로 분리된 [N,1] 데이터입니다. MinMaxScaler의 변환 기준을 훈련 데이터에서만 학습하세요.',`scaler = MinMaxScaler()
train_scaled = {{A}}
test_scaled = {{B}}`,[
  ['A', 2, 'scaler.fit_transform(train_values)', '훈련 데이터의 분포(최솟값, 최댓값)만을 학습(fit)하고 정규화(transform)합니다.', ['scaler.fit_transform(X=train_values)']],
  ['B', 3, 'scaler.transform(test_values)', '테스트 데이터는 반드시 훈련 데이터 기준 스케일러로 변환만 수행해야 데이터 누수(Data Leakage)를 방지할 수 있습니다. 오답 주의: test에 fit_transform을 호출하면 미래 정보 누수가 발생합니다.', ['scaler.transform(X=test_values)']]
]);

q('3-2','Data','RNN 구성','ts_practice.ipynb','입력은 [B,T,input_size]입니다. batch-first RNN의 모든 시점 hidden을 scalar로 바꿔 [B,T,1]을 반환하세요.',`class RNNModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers):
        super().__init__()
        self.rnn = {{A}}
        self.fc = {{B}}
    def forward(self, x):
        out, _ = {{C}}
        return {{D}}`,[
  ['A', 3, 'nn.RNN(input_size, hidden_size, num_layers, batch_first=True)', '입력 텐서 [B, T, F]에 맞춰 배치 차원이 가장 먼저 오도록 batch_first=True를 지정한 다층 RNN 계층을 구성합니다.', [
    'nn.RNN(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers, batch_first=True)', 'torch.nn.RNN(input_size, hidden_size, num_layers, batch_first=True)', 'nn.RNN(input_size, hidden_size, num_layers=num_layers, batch_first=True)'
  ]],
  ['B', 2, 'nn.Linear(hidden_size, 1)', '각 시점의 은닉 상태 벡터 [hidden_size]를 1개의 스칼라 예측값으로 사영하는 선형 헤드입니다.', [
    'torch.nn.Linear(hidden_size, 1)', 'nn.Linear(in_features=hidden_size, out_features=1)'
  ]],
  ['C', 1, 'self.rnn(x)', '순환신경망 순전파를 수행하여 모든 시점의 은닉 출력 out [B, T, hidden_size]을 추출합니다.', ['self.rnn.forward(x)']],
  ['D', 1, 'self.fc(out)', '모든 타임스텝에 선형 계층을 브로드캐스팅 적용하여 최종 예측 [B, T, 1]을 반환합니다.', ['self.fc.forward(out)']]
]);

q('3-3','Data','추천 순위 학습과 Top-K','RecSys_GCF_practice.ipynb 기반 변형','학습 embedding은 [B,D]입니다. logsigmoid로 BPR을 계산하세요. 평가 item_features [I,D], user_emb [D]이며 이미 본 아이템은 제외됐습니다.',`pos_scores = {{A}}
neg_scores = {{B}}
loss = {{C}}
# 평가
scores = {{D}}
topk_scores, topk_indices = {{E}}`,[
  ['A', 1, 'torch.sum(user_emb * pos_item_emb, dim=1)', '유저 임베딩과 긍정 아이템 임베딩의 원소별 곱을 특징 차원(dim=1)으로 합산하여 배치별 내적 선호 점수 [B]를 구합니다.', [
    'torch.sum(user_emb * pos_item_emb, dim=-1)', '(user_emb * pos_item_emb).sum(dim=1)', '(user_emb * pos_item_emb).sum(dim=-1)', '(user_emb * pos_item_emb).sum(1)'
  ]],
  ['B', 1, 'torch.sum(user_emb * neg_item_emb, dim=1)', '부정 아이템 임베딩과의 원소별 곱을 합산하여 유저-부정 아이템 내적 점수 [B]를 구합니다.', [
    'torch.sum(user_emb * neg_item_emb, dim=-1)', '(user_emb * neg_item_emb).sum(dim=1)', '(user_emb * neg_item_emb).sum(dim=-1)', '(user_emb * neg_item_emb).sum(1)'
  ]],
  ['C', 3, '-torch.mean(F.logsigmoid(pos_scores - neg_scores))', 'BPR 손실 -E[log σ(x_uij)]를 계산합니다. 긍정 점수가 부정 점수보다 클수록 손실이 0으로 수렴합니다.', [
    '-F.logsigmoid(pos_scores - neg_scores).mean()', '-torch.logsigmoid(pos_scores - neg_scores).mean()', '-(F.logsigmoid(pos_scores - neg_scores)).mean()', '-torch.mean(torch.log(torch.sigmoid(pos_scores - neg_scores)))'
  ]],
  ['D', 1, 'torch.matmul(item_features, user_emb)', '전체 아이템 행렬 [I, D]와 단일 유저 벡터 [D]의 행렬-벡터 곱으로 모든 후보 아이템의 선호도 점수 벡터 [I]를 계산합니다.', [
    'item_features @ user_emb', 'torch.mv(item_features, user_emb)'
  ]],
  ['E', 2, 'torch.topk(scores, k=k)', '계산된 점수 벡터에서 가장 높은 상위 k개의 점수(values)와 해당 아이템 인덱스(indices)를 추출합니다.', [
    'torch.topk(scores, k)', 'scores.topk(k=k)', 'scores.topk(k)'
  ]]
]);

q('4-1','Vision','학습 이미지 변환','01_ResNet18_CIFAR10.ipynb · 사용자 제보 기출 반영','padding 4를 적용한 32×32 random crop, 무작위 좌우 반전, Tensor 변환, 제공된 채널 통계로 정규화를 순서대로 구현하세요.',`train_tfms = T.Compose([
    {{A}},
    {{B}},
    {{C}},
    {{D}},
])`,[
  ['A', 2, 'T.RandomCrop(32, padding=4)', '40x40으로 상하좌우 패딩 후 32x32 크기로 무작위 크롭하여 공간 변형 다양성을 부여합니다.', [
    'transforms.RandomCrop(32, padding=4)', 'T.RandomCrop(size=32, padding=4)', 'transforms.RandomCrop(size=32, padding=4)', 'T.RandomCrop((32, 32), padding=4)'
  ]],
  ['B', 1, 'T.RandomHorizontalFlip()', '50% 확률로 좌우를 반전시켜 수평 대칭성을 학습합니다.', [
    'transforms.RandomHorizontalFlip()', 'T.RandomHorizontalFlip(p=0.5)', 'transforms.RandomHorizontalFlip(p=0.5)'
  ]],
  ['C', 1, 'T.ToTensor()', '0~255 HWC PIL 이미지를 0.0~1.0 CHW 파이토치 FloatTensor로 변환합니다.', ['transforms.ToTensor()']],
  ['D', 1, 'T.Normalize(CIFAR10_MEAN, CIFAR10_STD)', '사전 계산된 채널별 평균과 표준편차로 각 채널을 표준정규분포(N(0, 1))로 정규화합니다.', [
    'transforms.Normalize(CIFAR10_MEAN, CIFAR10_STD)', 'T.Normalize(mean=CIFAR10_MEAN, std=CIFAR10_STD)', 'transforms.Normalize(mean=CIFAR10_MEAN, std=CIFAR10_STD)'
  ]]
]);

q('4-2','Vision','CIFAR ResNet과 정확도','01_ResNet18_CIFAR10.ipynb 기반 변형','첫 Conv는 3→64, kernel 3, stride 1, padding 1, bias 없음입니다. maxpool을 통과 연산으로 바꾸고 head와 batch 정확도를 완성하세요.',`model.conv1 = {{A}}
model.maxpool = {{B}}
model.fc = {{C}}
logits = model(images)
preds = {{D}}
accuracy = {{E}}`,[
  ['A', 2, 'nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)', '32x32 저해상도 CIFAR 입력의 급격한 공간 축소를 막기 위해 3x3 stride=1 conv로 첫 계층을 교체합니다.', [
    'nn.Conv2d(3, 64, 3, stride=1, padding=1, bias=False)', 'nn.Conv2d(3, 64, kernel_size=3, padding=1, bias=False)', 'nn.Conv2d(in_channels=3, out_channels=64, kernel_size=3, stride=1, padding=1, bias=False)', 'torch.nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)'
  ]],
  ['B', 1, 'nn.Identity()', '해상도 보존을 위해 초기 MaxPool 계층을 입력을 그대로 통과시키는 Identity 연산으로 대체합니다.', ['torch.nn.Identity()']],
  ['C', 1, 'nn.Linear(model.fc.in_features, num_classes)', '기존 백본 출력 차원(512)을 타깃 클래스 수(num_classes)로 사영하는 새 분류 계층을 설정합니다.', [
    'torch.nn.Linear(model.fc.in_features, num_classes)', 'nn.Linear(512, num_classes)'
  ]],
  ['D', 1, 'logits.argmax(dim=1)', '배치 로짓 [B, C]에서 클래스 차원(dim=1)의 최댓값 인덱스를 추출하여 예측 클래스 텐서 [B]를 생성합니다.', [
    'logits.argmax(dim=-1)', 'torch.argmax(logits, dim=1)', 'torch.argmax(logits, dim=-1)', 'logits.argmax(1)'
  ]],
  ['E', 2, '(preds == targets).float().mean().item()', '불리언 일치 여부 텐서를 부동소수점으로 변환 후 평균을 취해 배치 분류 정확도를 파이썬 실수 스칼라로 반환합니다.', [
    '(preds == targets).type(torch.float).mean().item()', '(preds == targets).to(torch.float).mean().item()', '(preds == targets).sum().item() / len(targets)', '((preds == targets).sum() / len(targets)).item()', '(preds == targets).float().mean()'
  ]]
]);

q('4-3','Vision','Binary Segmentation 학습과 추론','04_Unet.ipynb 기반 변형','모델 출력과 0/1 float mask는 [B,1,H,W]입니다. raw logits용 binary loss를 사용하고, 추론 확률이 0.5 초과인 위치를 1로 만드세요.',`criterion = {{A}}
model.train()
optimizer.zero_grad()
logits = model(imgs)
loss = {{B}}
{{C}}
optimizer.step()
model.eval()
with torch.no_grad():
    logits = model(eval_imgs)
    probs = {{D}}
    preds = {{E}}`,[
  ['A', 2, 'nn.BCEWithLogitsLoss()', '수치적 안정성을 위해 Sigmoid와 Binary Cross Entropy를 결합 계산하는 logits 전용 손실 함수입니다.', ['torch.nn.BCEWithLogitsLoss()']],
  ['B', 2, 'criterion(logits, masks)', '동일한 shape [B, 1, H, W]를 갖는 모델 로짓과 정답 세그멘테이션 마스크 간의 손실을 계산합니다.', ['criterion(input=logits, target=masks)']],
  ['C', 1, 'loss.backward()', '손실값으로부터 네트워크 파라미터의 gradient를 역전파합니다.', ['loss.backward(retain_graph=False)']],
  ['D', 1, 'torch.sigmoid(logits)', '출력 로짓을 0~1 사이의 픽셀별 이진 클래스 확률 맵으로 변환합니다.', ['logits.sigmoid()', 'F.sigmoid(logits)']],
  ['E', 2, '(probs > 0.5).float()', '임계값 0.5를 초과하는 전경 픽셀 위치를 1.0 부동소수점 마스크로 이진화합니다.', [
    '(probs > 0.5).to(torch.float)', '(probs > 0.5).type(torch.float)', '(probs >= 0.5).float()'
  ]]
]);

q('5-1','On-device AI','선형 양자화','2. Quantization for CNN.ipynb 기반 변형','scale > 0입니다. 정수 한 칸 단위로 환산하고 torch.round로 반올림한 뒤 zero point를 적용하세요.',`scaled_tensor = {{A}}
rounded_tensor = {{B}}
shifted_tensor = {{C}}
quantized_tensor = shifted_tensor.clamp(quantized_min, quantized_max).to(dtype)`,[
  ['A', 2, 'fp_tensor / scale', '부동소수점 실수를 정수 1단위의 실수 간격인 scale로 나누어 양자화 스케일로 정규화합니다.', ['torch.div(fp_tensor, scale)']],
  ['B', 2, 'torch.round(scaled_tensor)', '정규화된 실수를 가장 가까운 정수 격자점으로 반올림(rounding)합니다.', ['scaled_tensor.round()']],
  ['C', 1, 'rounded_tensor + zero_point', '실수 0.0의 정수 도메인 위치인 zero_point를 더하여 오프셋을 정렬합니다.', ['zero_point + rounded_tensor']]
]);

q('5-2','On-device AI','Fine-grained Pruning','1. Pruning for CNN.ipynb','round·torch.abs·torch.kthvalue를 사용하세요. 제거 개수는 1 이상이며 importance에 동률은 없습니다. threshold보다 큰 원소만 유지하세요.',`@torch.no_grad()
def prune_weight_fine_grained(weight, sparsity):
    num_pruned_elements = {{A}}
    importance = {{B}}
    threshold = {{C}}
    mask = {{D}}
    weight.mul_(mask)
    return mask`,[
  ['A', 2, 'round(weight.numel() * sparsity)', '총 가중치 원소 수에 목표 희소도(sparsity)를 곱해 0으로 제거할 요소의 개수를 정수로 산출합니다.', [
    'int(round(weight.numel() * sparsity))', 'int(weight.numel() * sparsity)'
  ]],
  ['B', 1, 'torch.abs(weight)', '가중치의 부호와 무관하게 크기가 작은 것부터 제거하기 위해 절댓값을 중요도 척도로 계산합니다.', ['weight.abs()']],
  ['C', 3, 'torch.kthvalue(importance.flatten(), num_pruned_elements)[0]', '1차원으로 펼쳐진 중요도 텐서에서 k번째로 작은 값을 찾아 제거 기준 문턱값(threshold)으로 지정합니다.', [
    'torch.kthvalue(importance.flatten(), num_pruned_elements).values', 'torch.kthvalue(importance.view(-1), num_pruned_elements)[0]', 'torch.kthvalue(importance.view(-1), num_pruned_elements).values'
  ]],
  ['D', 1, 'importance > threshold', '문턱값보다 큰 유효 가중치 위치만 True(1)로 남기는 가지치기 이진 마스크를 생성합니다.', ['threshold < importance']]
]);

q('5-3','On-device AI','Knowledge Distillation','3. Knowledge Distillation.ipynb 기반 변형','Teacher는 고정하고 Student만 학습합니다. 동일한 T의 softmax 분포와 실제 labels의 CE를 두 weight로 결합하세요. ce_loss는 준비되어 있습니다.',`teacher.eval()
student.train()
optimizer.zero_grad()
with {{A}}:
    teacher_logits = teacher(inputs)
student_logits = student(inputs)
soft_targets = {{B}}
student_prob = {{C}}
soft_targets_loss = (torch.sum(soft_targets * (soft_targets.log() - student_prob.log()))
                     / student_prob.size(0) * (T ** 2))
label_loss = {{D}}
loss = {{E}}
loss.backward()
optimizer.step()`,[
  ['A', 1, 'torch.no_grad()', 'Teacher 모델은 추론 전용이므로 연산 그래프 생성과 메모리 점유를 막기 위해 no_grad() 컨텍스트로 감쌉니다.', ['torch.inference_mode()']],
  ['B', 1, 'nn.functional.softmax(teacher_logits / T, dim=-1)', 'Teacher 로짓을 온도 T로 나누어 클래스 간 암묵적 지식을 담은 부드러운 소프트 타깃 확률 분포를 구합니다.', [
    'F.softmax(teacher_logits / T, dim=-1)', 'F.softmax(teacher_logits / T, dim=1)', 'torch.softmax(teacher_logits / T, dim=-1)', 'torch.softmax(teacher_logits / T, dim=1)'
  ]],
  ['C', 1, 'nn.functional.softmax(student_logits / T, dim=-1)', 'Student 로짓에도 동일한 온도 T를 적용하여 상호 비교 가능한 소프트 예측 분포를 구합니다.', [
    'F.softmax(student_logits / T, dim=-1)', 'F.softmax(student_logits / T, dim=1)', 'torch.softmax(student_logits / T, dim=-1)', 'torch.softmax(student_logits / T, dim=1)'
  ]],
  ['D', 2, 'ce_loss(student_logits, labels)', 'Student의 원시 로짓과 실제 원-핫 정답 라벨 간의 표준 하드 타깃 교차 엔트로피 손실을 계산합니다.', ['ce_loss(input=student_logits, target=labels)']],
  ['E', 3, 'soft_target_loss_weight * soft_targets_loss + ce_loss_weight * label_loss', '지식 증류 손실과 정답 라벨 손실을 각각의 가중치로 선형 결합하여 최종 역전파 손실을 산출합니다.', [
    'ce_loss_weight * label_loss + soft_target_loss_weight * soft_targets_loss'
  ]]
]);
