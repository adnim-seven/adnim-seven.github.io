// Each slot holds its own rubric and points. {{A}} marks the exact code location.
window.EXAM = [];
function q(id,subject,title,source,prompt,code,slots){window.EXAM.push({id,subject,title,source,prompt,code,slots:slots.map(([key,points,answer,why,alternatives=[]])=>({key,points,answer,why,alternatives}))});}
q('1-1','LLM','다음 토큰 예측 데이터 구성','Chapter_2_Exercise_Dataset.ipynb','현재 i에서 max_length개 입력 토큰과 한 토큰 뒤로 이동한 정답을 구성하세요.',`for i in range(0, len(token_ids) - max_length, stride):
    input_chunk = {{A}}
    target_chunk = {{B}}
    self.input_ids.append(torch.tensor(input_chunk))
    self.target_ids.append(torch.tensor(target_chunk))`,[
['A',2,'token_ids[i:i+max_length]','시작 i부터 길이 max_length만큼 추출합니다.'],['B',3,'token_ids[i+1:i+max_length+1]','입력과 길이는 같고 시작과 끝이 모두 한 칸 뒤입니다.']]);
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
['A',1,'self.W_key(x)','Key projection입니다.'],['B',1,'self.W_query(x)','Query projection입니다.'],['C',1,'self.W_value(x)','Value projection입니다.'],['D',2,'self.mask[:num_tokens, :num_tokens].bool()','현재 토큰 길이로 두 축을 자르고 bool로 변환합니다.'],['E',2,'attn_scores.masked_fill_(mask_bool, -torch.inf)','미래 위치에 -∞를 넣어 softmax 확률을 0으로 만듭니다.',["attn_scores.masked_fill_(mask_bool, float('-inf'))"]]]);
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
['A',1,'optimizer.zero_grad()','이전 gradient 누적을 초기화합니다.'],['B',2,'logits.flatten(0, 1)','B와 T를 합치고 vocabulary 축을 유지합니다.',['logits.reshape(-1, logits.shape[-1])']],['C',1,'target_batch.flatten()','정답을 [B*T]로 만듭니다.',['target_batch.reshape(-1)']],['D',2,'loss.backward()','손실에서 gradient를 계산합니다.'],['E',2,'optimizer.step()','gradient를 이용해 parameter를 갱신합니다.']]);
q('2-1','RAG','문서 로딩과 인덱스 생성','1. Llama_index.ipynb · 사용자 제보 7월 기출','SimpleDirectoryReader와 VectorStoreIndex를 사용해 제공된 폴더 문서를 읽고 벡터 인덱스를 구성하세요.',`data_dir = "data"  # 제공 경로
documents = {{A}}
index = {{B}}`,[
['A',2,'SimpleDirectoryReader(data_dir).load_data()','Reader 자체가 아니라 Document 목록을 반환하는 load_data가 필요합니다.'],['B',3,'VectorStoreIndex.from_documents(documents)','읽어 들인 Document 목록을 전달합니다.']]);
q('2-2','RAG','청킹과 검색 연결','1. Llama_index.ipynb 기반 변형','SentenceSplitter로 청크 크기 200, 중복 50을 설정해 index에 적용하고, 검색 전용 객체로 question을 검색하세요.',`splitter = {{A}}
index = VectorStoreIndex.from_documents(documents, transformations={{B}})
retriever = {{C}}
retrieved_nodes = {{D}}`,[
['A',2,'SentenceSplitter(chunk_size=200, chunk_overlap=50)','크기와 중복을 이름 있는 인자로 전달합니다.'],['B',2,'[splitter]','변환 객체들의 목록입니다.'],['C',1,'index.as_retriever()','검색 전용 객체를 만듭니다.'],['D',2,'retriever.retrieve(question)','retrieve가 관련 node 목록을 반환합니다.']]);
q('2-3','RAG','검색 근거를 LLM 입력으로 연결','RAG 검색→prompt→생성 흐름 변형','각 검색 항목은 .node.get_content()로 읽습니다. 텍스트를 줄바꿈으로 연결하고 prompt를 채우세요. llm.complete() 응답의 .text를 추출하세요.',`qa_prompt = PromptTemplate(
    "근거: {context_str}\\n질문: {query_str}\\n답변:"
)
context_str = {{A}}
llm_input = qa_prompt.format(context_str={{B}}, query_str={{C}})
response = {{D}}
answer = {{E}}`,[
['A',3,'"\\n".join(node.node.get_content() for node in retrieved_nodes)','각 NodeWithScore의 node에서 텍스트를 읽어 연결합니다.',['"\\n".join([node.node.get_content() for node in retrieved_nodes])']],['B',1,'context_str','검색 근거를 context placeholder에 넣습니다.'],['C',1,'question','질문을 query placeholder에 넣습니다.'],['D',2,'llm.complete(llm_input)','완성된 prompt를 LLM에 전달합니다.'],['E',1,'response.text','응답 객체의 텍스트를 선택합니다.']]);
q('3-1','Data','누수 없는 정규화','ts_practice.ipynb 기반 변형','시간순으로 분리된 [N,1] 데이터입니다. MinMaxScaler의 변환 기준을 훈련 데이터에서만 학습하세요.',`scaler = MinMaxScaler()
train_scaled = {{A}}
test_scaled = {{B}}`,[
['A',2,'scaler.fit_transform(train_values)','훈련 데이터에서 min/max를 학습하고 변환합니다.'],['B',3,'scaler.transform(test_values)','평가 데이터에 fit하면 누수가 생깁니다.']]);
q('3-2','Data','RNN 구성','ts_practice.ipynb','입력은 [B,T,input_size]입니다. batch-first RNN의 모든 시점 hidden을 scalar로 바꿔 [B,T,1]을 반환하세요.',`class RNNModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers):
        super().__init__()
        self.rnn = {{A}}
        self.fc = {{B}}
    def forward(self, x):
        out, _ = {{C}}
        return {{D}}`,[
['A',3,'nn.RNN(input_size, hidden_size, num_layers, batch_first=True)','batch-first를 지정하고 세 크기 인자를 연결합니다.'],['B',2,'nn.Linear(hidden_size, 1)','마지막 hidden 축을 scalar로 바꿉니다.'],['C',1,'self.rnn(x)','RNN 반환값 중 모든 시점 출력이 out입니다.'],['D',1,'self.fc(out)','모든 시점에 같은 head를 적용합니다.']]);
q('3-3','Data','추천 순위 학습과 Top-K','RecSys_GCF_practice.ipynb 기반 변형','학습 embedding은 [B,D]입니다. logsigmoid로 BPR을 계산하세요. 평가 item_features [I,D], user_emb [D]이며 이미 본 아이템은 제외됐습니다.',`pos_scores = {{A}}
neg_scores = {{B}}
loss = {{C}}
# 평가
scores = {{D}}
topk_scores, topk_indices = {{E}}`,[
['A',1,'torch.sum(user_emb * pos_item_emb, dim=1)','feature 축을 합쳐 sample별 내적을 만듭니다.'],['B',1,'torch.sum(user_emb * neg_item_emb, dim=1)','negative item과 같은 방식으로 내적합니다.'],['C',3,'-torch.mean(F.logsigmoid(pos_scores - neg_scores))','positive가 negative보다 높을수록 loss가 작아집니다.'],['D',1,'torch.matmul(item_features, user_emb)','모든 후보의 내적을 계산합니다.',['item_features @ user_emb']],['E',2,'torch.topk(scores, k=k)','높은 k개 값과 index를 반환합니다.',['torch.topk(scores, k)']]]);
q('4-1','Vision','학습 이미지 변환','01_ResNet18_CIFAR10.ipynb · 사용자 제보 기출 반영','padding 4를 적용한 32×32 random crop, 무작위 좌우 반전, Tensor 변환, 제공된 채널 통계로 정규화를 순서대로 구현하세요.',`train_tfms = T.Compose([
    {{A}},
    {{B}},
    {{C}},
    {{D}},
])`,[
['A',2,'T.RandomCrop(32, padding=4)','padding 뒤 32 크기로 crop합니다.'],['B',1,'T.RandomHorizontalFlip()','무작위 좌우 반전입니다.'],['C',1,'T.ToTensor()','PIL을 channel-first Tensor로 바꿉니다.'],['D',1,'T.Normalize(CIFAR10_MEAN, CIFAR10_STD)','ToTensor 뒤 채널별 정규화를 적용합니다.']]);
q('4-2','Vision','CIFAR ResNet과 정확도','01_ResNet18_CIFAR10.ipynb 기반 변형','첫 Conv는 3→64, kernel 3, stride 1, padding 1, bias 없음입니다. maxpool을 통과 연산으로 바꾸고 head와 batch 정확도를 완성하세요.',`model.conv1 = {{A}}
model.maxpool = {{B}}
model.fc = {{C}}
logits = model(images)
preds = {{D}}
accuracy = {{E}}`,[
['A',2,'nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)','작은 이미지 해상도를 유지합니다.'],['B',1,'nn.Identity()','입력을 그대로 통과시킵니다.'],['C',1,'nn.Linear(model.fc.in_features, num_classes)','기존 feature 크기를 유지하고 class 수만 맞춥니다.'],['D',1,'logits.argmax(dim=1)','class 축의 최대값 index입니다.'],['E',2,'(preds == targets).float().mean().item()','일치 여부의 평균을 Python 실수로 반환합니다.']]);
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
['A',2,'nn.BCEWithLogitsLoss()','내부 sigmoid가 있는 logits용 loss입니다.'],['B',2,'criterion(logits, masks)','같은 shape의 logits와 정답 mask를 비교합니다.'],['C',1,'loss.backward()','loss를 역전파합니다.'],['D',1,'torch.sigmoid(logits)','이진 확률로 바꿉니다.'],['E',2,'(probs > 0.5).float()','threshold 결과를 float mask로 바꿉니다.']]);
q('5-1','On-device AI','선형 양자화','2. Quantization for CNN.ipynb 기반 변형','scale > 0입니다. 정수 한 칸 단위로 환산하고 torch.round로 반올림한 뒤 zero point를 적용하세요.',`scaled_tensor = {{A}}
rounded_tensor = {{B}}
shifted_tensor = {{C}}
quantized_tensor = shifted_tensor.clamp(quantized_min, quantized_max).to(dtype)`,[
['A',2,'fp_tensor / scale','정수 한 칸의 실수 간격으로 나눕니다.'],['B',2,'torch.round(scaled_tensor)','가장 가까운 정수 값으로 반올림합니다.'],['C',1,'rounded_tensor + zero_point','실수 0의 정수 위치를 반영합니다.']]);
q('5-2','On-device AI','Fine-grained Pruning','1. Pruning for CNN.ipynb','round·torch.abs·torch.kthvalue를 사용하세요. 제거 개수는 1 이상이며 importance에 동률은 없습니다. threshold보다 큰 원소만 유지하세요.',`@torch.no_grad()
def prune_weight_fine_grained(weight, sparsity):
    num_pruned_elements = {{A}}
    importance = {{B}}
    threshold = {{C}}
    mask = {{D}}
    weight.mul_(mask)
    return mask`,[
['A',2,'round(weight.numel() * sparsity)','원소 수×제거 비율을 정수 개수로 정합니다.'],['B',1,'torch.abs(weight)','부호와 무관한 magnitude입니다.'],['C',3,'torch.kthvalue(importance.flatten(), num_pruned_elements)[0]','전체 원소에서 k번째 작은 값 자체를 선택합니다.'],['D',1,'importance > threshold','True인 큰 원소만 유지됩니다.']]);
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
['A',1,'torch.no_grad()','Teacher graph를 만들지 않습니다.'],['B',1,'nn.functional.softmax(teacher_logits / T, dim=-1)','Teacher의 부드러운 class 분포입니다.',['F.softmax(teacher_logits / T, dim=-1)']],['C',1,'nn.functional.softmax(student_logits / T, dim=-1)','동일한 T로 비교합니다.',['F.softmax(student_logits / T, dim=-1)']],['D',2,'ce_loss(student_logits, labels)','실제 label은 Student의 raw logits와 비교합니다.'],['E',3,'soft_target_loss_weight * soft_targets_loss + ce_loss_weight * label_loss','두 학습 신호를 가중합합니다.']]);
