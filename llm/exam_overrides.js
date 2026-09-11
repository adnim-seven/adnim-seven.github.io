(() => {
  "use strict";
  const course = window.LLM_COURSE;
  const chapter = course.chapters.find((item) => item.file === "Chapter_2_Exercise_Dataset.ipynb");
  if (!chapter) return;

  chapter.overview = {
    title: "텍스트가 학습용 Embedding Tensor가 되는 과정",
    subtitle: "문자열을 다음 토큰 예측용 배치로 구성하고, Transformer 입력 형태 [B, T, D]까지 변환한다.",
    steps: [
      { label: "텍스트 토큰화", code: "token_ids = tokenizer.encode(txt)", flow: "str → list[int]" },
      { label: "다음 토큰 쌍", code: "target = token_ids[i+1 : i+T+1]", flow: "input [T] ↔ target [T]" },
      { label: "Dataset 저장", code: "torch.tensor(chunk)", flow: "list[int] → int64 Tensor [T]" },
      { label: "배치 구성", code: "DataLoader(dataset, batch_size=B)", flow: "[T] → [B, T]" },
      { label: "Embedding 결합", code: "tok_emb + pos_emb", flow: "[B,T,D] + [T,D] → [B,T,D]" }
    ],
    rules: [
      "target은 input보다 시작과 끝을 모두 한 칸 오른쪽으로 이동한다.",
      "Embedding의 입력은 정수 token ID이며 출력은 실수 벡터다.",
      "DataLoader에는 Dataset 클래스가 아니라 생성된 dataset 객체를 넣는다.",
      "position embedding은 broadcasting되어 token embedding과 같은 [B,T,D]가 된다."
    ]
  };

  course.cells["exam-ch2-position"] = {
    source: `vocab_size = 50257
output_dim = 256

token_embedding_layer = torch.nn.Embedding(vocab_size, output_dim)

max_length = 4
dataloader = create_dataloader_v1(
    raw_text, batch_size=8, max_length=max_length,
    stride=max_length, shuffle=False
)

data_iter = iter(dataloader)
inputs, targets = next(data_iter)
token_embeddings = token_embedding_layer(inputs)
print(token_embeddings.shape)

context_length = max_length
# region [포지셔널 임베딩 레이어 생성]
pos_embedding_layer = torch.nn.Embedding(context_length, output_dim)
# endregion
# region [포지셔널 임베딩 적용]
pos_embeddings = pos_embedding_layer(torch.arange(max_length))
# endregion
print(pos_embeddings.shape)
# region [토큰 임베딩과 포지셔널 임베딩 합산]
input_embeddings = token_embeddings + pos_embeddings
# endregion
print(input_embeddings.shape)`,
    cell: 7,
    answerSource: "Chapter_2_Exercise_Dataset.ipynb",
  };

  const Q = (id, topic, prompt, answer, sourceId, accepted = [answer]) => ({
    id,
    subject: "LLM",
    chapterId: chapter.id,
    chapterNumber: chapter.number,
    chapterTitle: chapter.title,
    file: chapter.file,
    topic,
    prompt,
    answer,
    occurrence: 0,
    sourceId,
    isSourceBlank: false,
    accepted_answers: accepted,
    source_type: "원본 전체 코드 기반 실전 문제",
  });

  chapter.subjective = [
    Q(
      "exam-llm02-01",
      "기초 · 다음 토큰 학습쌍",
      "enc_sample에서 context_size개의 입력과, 각 위치의 바로 다음 토큰을 정답으로 갖는 같은 길이의 시퀀스를 만드시오. 두 슬라이스를 모두 작성하고 길이가 동일하도록 하시오.",
      "x = enc_sample[:context_size]\ny = enc_sample[1:context_size+1]",
      "ch2-cell-1"
    ),
    Q(
      "exam-llm02-02",
      "중급 · 슬라이딩 윈도우",
      "현재 시작 위치 i에서 max_length 길이의 입력을 만들고, 다음 토큰 예측용 정답은 시작과 끝을 모두 한 칸 이동해 구성하시오.",
      "input_chunk = token_ids[i:i+max_length]",
      "ch2-cell-2"
    ),
    Q(
      "exam-llm02-03",
      "중급 · Dataset Tensor 저장",
      "위에서 만든 input_chunk와 target_chunk를 PyTorch Tensor로 변환하여 Dataset의 두 저장소에 같은 순서로 추가하시오.",
      "self.input_ids.append(torch.tensor(input_chunk))\n            self.target_ids.append(torch.tensor(target_chunk))",
      "ch2-cell-2"
    ),
    Q(
      "exam-llm02-04",
      "중급 · Dataset 조회 규약",
      "DataLoader가 idx를 전달했을 때 같은 인덱스의 입력 Tensor와 정답 Tensor를 한 쌍으로 반환하시오.",
      "return self.input_ids[idx], self.target_ids[idx]",
      "ch2-cell-2"
    ),
    Q(
      "exam-llm02-05",
      "실전 · DataLoader 구성",
      "생성된 dataset을 받아 함수 인자로 전달된 batch_size, shuffle, drop_last, num_workers 설정을 모두 보존하는 DataLoader 생성 블록을 완성하시오.",
      "dataloader = DataLoader(\n        dataset,\n        batch_size=batch_size,\n        shuffle=shuffle,\n        drop_last=drop_last,\n        num_workers=num_workers\n    )",
      "ch2-cell-3"
    ),
    Q(
      "exam-llm02-06",
      "중급 · Token Embedding",
      "정수 token ID를 output_dim 크기의 학습 가능한 벡터로 변환할 PyTorch layer를 vocab_size에 맞춰 생성하시오.",
      "embedding_layer = torch.nn.Embedding(vocab_size, output_dim)",
      "ch2-cell-5"
    ),
    Q(
      "exam-llm02-07",
      "실전 · Token·Position 결합",
      "배치의 token embedding에 각 위치의 embedding을 broadcasting으로 더해 모델 입력 Tensor [B,T,D]를 완성하시오.",
      "input_embeddings = token_embeddings + pos_embeddings",
      "exam-ch2-position"
    ),
  ];

  const feedback = {
    "exam-llm02-01": {
      explanation: "입력 x의 각 위치에서 바로 다음 token이 정답 y가 되어야 합니다. 따라서 y는 시작점과 끝점을 모두 1만큼 이동해야 x와 길이가 같습니다.",
      tensor_flow: "enc_sample list[int] → x, y: 각각 길이 context_size의 list[int]",
      code_signal: "변수명이 x/y로 짝을 이루고, 다음 token 예측이라는 앞 문맥이 slice의 +1 이동을 지시합니다.",
      retry: "두 slice의 길이를 직접 계산하고 x[j]의 정답이 y[j]인지 확인한 뒤 다시 작성하세요.",
    },
    "exam-llm02-02": {
      explanation: "슬라이딩 윈도우의 입력은 i부터 max_length개입니다. 정답은 같은 길이로 한 칸 오른쪽에 있어야 하므로 target을 만들 때 시작과 끝 모두 +1이 필요합니다.",
      tensor_flow: "token_ids list[int] → input_chunk/target_chunk: 길이 max_length",
      code_signal: "for문의 i와 max_length, 바로 아래 target_chunk 주석이 slice 범위를 결정합니다.",
      retry: "i=0, max_length=4를 대입해 실제 index 0~3이 선택되는지 확인하세요.",
    },
    "exam-llm02-03": {
      explanation: "DataLoader가 나중에 Tensor batch를 만들 수 있도록 입력과 정답을 각각 Tensor로 변환해 대응되는 리스트에 append해야 합니다. 대입하면 이전 sample을 덮어씁니다.",
      tensor_flow: "input_chunk/target_chunk list[int] → torch.tensor → self.input_ids/self.target_ids",
      code_signal: "두 저장소가 __init__에서 빈 list로 초기화되어 있으므로 append가 필요합니다.",
      retry: "반복문이 두 번 돌았을 때 두 리스트의 길이가 모두 2가 되는 구현인지 확인하세요.",
    },
    "exam-llm02-04": {
      explanation: "Dataset의 __getitem__은 하나의 idx에 대응하는 학습 입력과 정답을 함께 반환해야 DataLoader가 두 batch로 묶을 수 있습니다.",
      tensor_flow: "idx int → input_ids[idx], target_ids[idx] → tuple(Tensor, Tensor)",
      code_signal: "__len__이 input_ids의 sample 수를 반환하고 있으므로 __getitem__도 같은 저장소의 idx를 기준으로 합니다.",
      retry: "반환값의 첫 번째가 모델 입력, 두 번째가 loss target인지 순서를 확인하세요.",
    },
    "exam-llm02-05": {
      explanation: "DataLoader는 이미 생성한 dataset을 첫 인자로 받고, 헬퍼 함수가 받은 실행 설정을 같은 이름의 keyword 인자로 전달해야 합니다.",
      tensor_flow: "GPTDatasetV1 sample → DataLoader → inputs/targets batch [B,T]",
      code_signal: "함수 signature의 batch_size, shuffle, drop_last, num_workers가 DataLoader 생성자에 그대로 대응합니다.",
      retry: "첫 인자가 클래스나 txt가 아닌 dataset 인스턴스인지, 네 설정이 빠짐없이 전달되는지 점검하세요.",
    },
    "exam-llm02-06": {
      explanation: "Embedding은 token ID를 행 인덱스로 사용해 학습 가능한 벡터를 조회합니다. 생성자의 첫 인자는 조회 가능한 token 수, 둘째는 출력 벡터 차원입니다.",
      tensor_flow: "input_ids int64 [B,T] → Embedding(vocab_size,D) → float [B,T,D]",
      code_signal: "앞에서 vocab_size와 output_dim을 정의했고, 뒤에서 layer(input_ids) 형태로 호출합니다.",
      retry: "Linear와 달리 입력 feature 수가 아니라 vocabulary 행 수를 첫 인자로 받는다는 점을 확인하세요.",
    },
    "exam-llm02-07": {
      explanation: "Token embedding과 position embedding의 마지막 두 차원이 [T,D]로 맞으므로 덧셈 시 position이 batch 축으로 broadcasting됩니다. concatenate하면 D가 변해 모델 입력 규격이 깨집니다.",
      tensor_flow: "token [B,T,D] + position [T,D] → input_embeddings [B,T,D]",
      code_signal: "두 print의 shape와 '합산'이라는 region 주석이 연산과 출력 shape을 알려 줍니다.",
      retry: "연산 전후 마지막 차원 D가 유지되는지 확인하고 다시 작성하세요.",
    },
  };
  chapter.subjective.forEach((question) => Object.assign(question, feedback[question.id]));

  chapter.mcq = [
    {
      id: "exam-llm02-m1", source_question_id: "exam-llm02-01", topic: "다음 토큰 정렬",
      prompt: "입력과 정답의 길이를 같게 유지하면서 한 칸 이동시키는 구현은?", answer_index: 0,
      explanation: "정답은 입력의 각 위치보다 정확히 한 칸 뒤이며 두 slice 길이는 동일해야 합니다.",
      choices: [
        {text:"x = enc_sample[:context_size]\ny = enc_sample[1:context_size+1]",why:"시작과 끝을 모두 한 칸 이동해 길이와 정렬이 맞습니다."},
        {text:"x = enc_sample[:context_size]\ny = enc_sample[1:context_size]",why:"target의 끝에 +1이 없어 길이가 하나 짧습니다."},
        {text:"x = enc_sample[1:context_size+1]\ny = enc_sample[:context_size]",why:"입력과 정답의 방향이 뒤바뀝니다."},
        {text:"x = enc_sample[:context_size]\ny = enc_sample[context_size:]",why:"각 위치의 다음 토큰이 아니라 이후 전체 구간입니다."},
        {text:"x = enc_sample[:context_size]\ny = x",why:"현재 토큰 자체를 정답으로 사용하게 됩니다."},
      ],
    },
    {
      id: "exam-llm02-m2", source_question_id: "exam-llm02-03", topic: "Dataset 저장",
      prompt: "DataLoader가 batch로 묶을 수 있도록 두 chunk를 저장하는 올바른 구현은?", answer_index: 1,
      explanation: "입력과 정답 모두 같은 시점에 Tensor로 변환하여 대응되는 리스트에 저장해야 합니다.",
      choices: [
        {text:"self.input_ids.append(input_chunk)\nself.target_ids.append(target_chunk)",why:"Python list 상태로도 일부 동작할 수 있지만 Dataset의 Tensor 반환 의도를 충족하지 못합니다."},
        {text:"self.input_ids.append(torch.tensor(input_chunk))\nself.target_ids.append(torch.tensor(target_chunk))",why:"두 시퀀스를 Tensor로 바꾸고 올바른 저장소에 넣습니다."},
        {text:"self.input_ids = torch.tensor(input_chunk)\nself.target_ids = torch.tensor(target_chunk)",why:"반복할 때마다 이전 sample을 덮어씁니다."},
        {text:"self.input_ids.append(torch.tensor(target_chunk))\nself.target_ids.append(torch.tensor(input_chunk))",why:"입력과 정답이 서로 바뀝니다."},
        {text:"torch.stack(input_chunk, target_chunk)",why:"stack 호출 형식이 틀리고 Dataset sample 저장도 수행하지 않습니다."},
      ],
    },
    {
      id: "exam-llm02-m3", source_question_id: "exam-llm02-05", topic: "DataLoader 인자 전달",
      prompt: "헬퍼 함수의 인자를 그대로 반영해 학습 batch를 만드는 구성은?", answer_index: 2,
      explanation: "DataLoader에는 Dataset 인스턴스와 batch·shuffle·drop·worker 설정을 전달합니다.",
      choices: [
        {text:"DataLoader(GPTDatasetV1, batch_size=batch_size)",why:"Dataset 클래스 자체를 넘겼고 나머지 실행 설정도 잃었습니다."},
        {text:"DataLoader(txt, tokenizer, max_length, stride)",why:"DataLoader는 원문과 tokenizer가 아니라 Dataset 인스턴스를 받습니다."},
        {text:"DataLoader(dataset, batch_size=batch_size, shuffle=shuffle, drop_last=drop_last, num_workers=num_workers)",why:"생성된 Dataset과 모든 호출 설정을 보존합니다."},
        {text:"DataLoader(dataset.input_ids, shuffle=False)",why:"target 쌍과 함수의 shuffle 설정을 잃습니다."},
        {text:"DataLoader(dataset, batch_size=max_length, num_workers=stride)",why:"서로 다른 의미의 인자를 잘못 연결했습니다."},
      ],
    },
    {
      id: "exam-llm02-m4", source_question_id: "exam-llm02-06", topic: "Embedding Tensor 흐름",
      prompt: "[B,T] 정수 token ID를 [B,T,D] 실수 Tensor로 바꾸는 layer 구성은?", answer_index: 3,
      explanation: "Embedding의 첫 차원은 조회 가능한 token 수, 둘째는 token 하나의 출력 벡터 차원입니다.",
      choices: [
        {text:"torch.nn.Linear(vocab_size, output_dim)",why:"Linear는 token ID를 행 인덱스로 조회하지 않습니다."},
        {text:"torch.nn.Embedding(output_dim, vocab_size)",why:"단어장 크기와 embedding 차원의 순서가 반대입니다."},
        {text:"torch.tensor(vocab_size, output_dim)",why:"학습 가능한 lookup layer를 만들지 않습니다."},
        {text:"torch.nn.Embedding(vocab_size, output_dim)",why:"token ID를 vocab 행에서 찾아 D차원 벡터로 반환합니다."},
        {text:"torch.nn.Embedding(input_ids, output_dim)",why:"첫 인자는 Tensor가 아니라 단어장 크기 정수여야 합니다."},
      ],
    },
    {
      id: "exam-llm02-m5", source_question_id: "exam-llm02-07", topic: "Position broadcasting",
      prompt: "[B,T,D] token embedding과 [T,D] position embedding으로 모델 입력을 만드는 연산은?", answer_index: 4,
      explanation: "PyTorch broadcasting이 [T,D]를 batch 전체에 적용하므로 같은 shape의 [B,T,D]가 됩니다.",
      choices: [
        {text:"torch.cat((token_embeddings, pos_embeddings), dim=-1)",why:"마지막 차원이 2D로 늘어나 모델 embedding 크기가 달라집니다."},
        {text:"token_embeddings @ pos_embeddings",why:"행렬곱 대상이 아니며 원하는 shape도 나오지 않습니다."},
        {text:"token_embeddings - pos_embeddings",why:"shape은 맞지만 위치 정보를 더한다는 구성과 반대입니다."},
        {text:"pos_embeddings[token_embeddings]",why:"실수 embedding을 인덱스로 사용할 수 없습니다."},
        {text:"token_embeddings + pos_embeddings",why:"position 정보가 batch 전체에 broadcasting되어 더해집니다."},
      ],
    },
  ];

  chapter.questionCount = chapter.subjective.length;
  chapter.exam_design = {
    version: 2,
    style: "함수 문맥 기반 구현형",
    difficulty: ["기초 호출", "연산 연결", "독립 구현"],
    excluded: ["URL", "로컬 경로", "의미 없는 고정 문자열"],
  };
})();

(() => {
  "use strict";
  const course=window.LLM_COURSE;
  const chapter=course.chapters.find((item)=>item.file==="Chapter_6_Excercise_Finetuning_Classification.ipynb");
  if(!chapter)return;
  chapter.notebook_goal="사전학습 GPT를 고정하고 분류 head와 마지막 block만 미세조정하여 문장 단위 이진 분류기를 구현한다.";
  chapter.overview={title:"사전학습 GPT가 Spam 분류기가 되는 과정",subtitle:"문장을 같은 길이의 token Tensor로 만들고, 마지막 token 표현을 2-class logits로 변환해 선택된 파라미터만 학습한다.",steps:[
    {label:"Dataset",code:"truncate → pad → (input_ids, label)",flow:"text → [T] int64, scalar label"},
    {label:"GPT 표현",code:"model(input_batch)[:, -1, :]",flow:"[B,T] → [B,T,C] → [B,C]"},
    {label:"기본 모델 동결",code:"param.requires_grad = False",flow:"pretrained weights 고정"},
    {label:"분류 Head",code:"Linear(emb_dim, num_classes)",flow:"[B,D] → [B,2]"},
    {label:"부분 미세조정",code:"last block + final_norm + out_head",flow:"선택 Parameter만 gradient 갱신"}
  ],rules:["validation/test는 train_dataset.max_length를 공유해 입력 shape을 일관되게 유지한다.","시퀀스 분류는 마지막 token 위치의 logits만 사용한다.","전체 동결 뒤 새 out_head와 마지막 block·final norm만 학습한다.","Cross Entropy는 [B,C] logits와 [B] class ID label을 받는다."]};
  const cells={
    "exam-ch6a-dataset":`self.encoded_texts = [
    encoded_text[:self.max_length]
    for encoded_text in self.encoded_texts
]
self.encoded_texts = [
    encoded_text + [pad_token_id] * (self.max_length - len(encoded_text))
    for encoded_text in self.encoded_texts
]
label = self.data.iloc[index]["Label"]`,
    "exam-ch6a-last":"logits = model(input_batch)[:, -1, :]",
    "exam-ch6a-freeze":`for param in model.parameters():
    param.requires_grad = False`,
    "exam-ch6a-head":`model.out_head = torch.nn.Linear(
    in_features=BASE_CONFIG["emb_dim"], out_features=num_classes
)`,
    "exam-ch6a-unfreeze":`for param in model.trf_blocks[-1].parameters():
    param.requires_grad = True
for param in model.final_norm.parameters():
    param.requires_grad = True`
  };
  Object.entries(cells).forEach(([id,source])=>{course.cells[id]={source};});
  const base={subject:"LLM",chapterId:chapter.id,chapterNumber:chapter.number,chapterTitle:chapter.title,file:chapter.file,isSourceBlank:true,source_type:"원본 노트북 실제 빈칸"};
  const make=(data)=>({...base,occurrence:0,accepted_answers:[data.answer],...data});
  chapter.subjective=[
    make({id:"exam-llm06a-01",topic:"분류 Dataset 구성",difficulty:"3 · 데이터 연결",sourceId:"exam-ch6a-dataset",prompt:"원본 TODO의 최대 길이, padding ID, label 컬럼을 채운 완성 코드를 작성하세요.",answer:cells["exam-ch6a-dataset"],
      problem_context:`if max_length is not None:
    self.max_length = max_length
    # TODO: 시퀀스를 설정된 최대 길이로 자르세요.
    self.encoded_texts = [
        encoded_text[:????]
        for encoded_text in self.encoded_texts
    ]

# TODO: 전달된 padding token ID로 길이를 맞추세요.
self.encoded_texts = [
    encoded_text + [????] * (self.max_length - len(encoded_text))
    for encoded_text in self.encoded_texts
]

def __getitem__(self, index):
    encoded = self.encoded_texts[index]
    # TODO: 정답 컬럼에서 label을 가져오세요.
    label = self.data.iloc[index]["????"]`,
      explanation:"truncation과 padding은 모두 self.max_length를 기준으로 하며, padding 값은 생성자 인자 pad_token_id를 사용합니다. 정답은 CSV의 Label 컬럼에서 같은 index로 가져옵니다.",tensor_flow:"text→list[int]→고정 길이 [T] int64; Label→scalar int64",code_signal:"함수 인자 max_length·pad_token_id와 CSV 생성 시 지정한 Label 컬럼명이 답을 제한합니다.",retry:"길이를 결정하는 값, 채우는 값, 정답이 있는 열을 각각 구분해 다시 작성하세요."}),
    make({id:"exam-llm06a-02",topic:"마지막 token 분류",difficulty:"2 · Tensor 인덱싱",sourceId:"exam-ch6a-last",prompt:"GPT 출력에서 문장 분류에 사용할 마지막 token 위치만 선택하는 완성된 줄을 작성하세요.",answer:cells["exam-ch6a-last"],
      problem_context:`input_batch, target_batch = input_batch.to(device), target_batch.to(device)
# TODO: 시퀀스의 마지막 token 출력만 분류에 사용하세요.
# model 출력: [batch, seq_len, num_classes]
logits = model(input_batch)[:, ????, :]
loss = torch.nn.functional.cross_entropy(logits, target_batch)`,
      explanation:"batch와 class 축은 유지하고 sequence 축에서 -1을 선택해 [B,C]를 만듭니다. 전체 [B,T,C]를 target [B]와 바로 비교할 수 없습니다.",tensor_flow:"[B,T]→model [B,T,C]→slice [B,C]→CE with [B]",code_signal:"가운데 축이 seq_len이고 '마지막' Python index는 -1입니다.",retry:"B,T,C 세 축 중 제거할 축과 남길 축을 먼저 표시하세요."}),
    make({id:"exam-llm06a-03",topic:"사전학습 가중치 동결",difficulty:"1 · 학습 설정",sourceId:"exam-ch6a-freeze",prompt:"모델 전체 Parameter를 optimizer 갱신 대상에서 제외하는 완성된 두 줄을 작성하세요.",answer:cells["exam-ch6a-freeze"],
      problem_context:`# 모든 사전학습 파라미터를 먼저 고정합니다.
# TODO: 학습에서 제외할 requires_grad 값을 채우세요.
for param in model.parameters():
    param.requires_grad = ????`,
      explanation:"requires_grad=False이면 backward가 해당 Parameter의 gradient를 만들지 않습니다. eval()은 dropout 동작을 바꿀 뿐 Parameter를 동결하지 않습니다.",tensor_flow:"Parameter.requires_grad True→False; Tensor shape 변화 없음",code_signal:"주석의 '고정'과 '학습에서 제외'가 False를 의미합니다.",retry:"모델 모드와 gradient 허용 설정의 차이를 확인하세요."}),
    make({id:"exam-llm06a-04",topic:"분류 Head 교체",difficulty:"2 · Layer 구성",sourceId:"exam-ch6a-head",prompt:"embedding 표현을 햄/스팸 두 class logits로 바꾸는 완성된 out_head 코드를 작성하세요.",answer:cells["exam-ch6a-head"],accepted_answers:[cells["exam-ch6a-head"],`model.out_head = torch.nn.Linear(in_features=BASE_CONFIG["emb_dim"], out_features=num_classes)`],
      problem_context:`num_classes = 2
# TODO: 기존 vocab 출력층을 이진 분류층으로 교체하세요.
model.out_head = torch.nn.Linear(
    in_features=BASE_CONFIG["emb_dim"],
    out_features=????
)`,
      explanation:"입력은 GPT hidden 크기 emb_dim이고 출력은 token vocabulary가 아니라 분류 label 수 num_classes입니다. 새 Linear는 기본적으로 학습 가능합니다.",tensor_flow:"hidden [B,D]→classification logits [B,2]",code_signal:"바로 위 num_classes=2와 out_features 빈칸이 연결됩니다.",retry:"출력 한 칸이 단어 후보인지 class 후보인지 구분하세요."}),
    make({id:"exam-llm06a-05",topic:"선택적 Unfreeze",difficulty:"3 · 부분 미세조정",sourceId:"exam-ch6a-unfreeze",prompt:"마지막 Transformer block과 final_norm만 다시 학습 가능하게 만드는 완성 코드를 작성하세요.",answer:cells["exam-ch6a-unfreeze"],
      problem_context:`# 전체 동결 뒤 마지막 block과 final norm만 잠금 해제합니다.
# TODO: 마지막 block 인덱스와 학습 허용 값을 채우세요.
for param in model.trf_blocks[????].parameters():
    param.requires_grad = ????

# TODO: final norm을 학습 가능하게 하세요.
for param in model.final_norm.parameters():
    param.requires_grad = ????`,
      explanation:"Python의 -1은 마지막 block을 선택하고 requires_grad=True가 gradient 계산을 다시 허용합니다. 이렇게 하면 전체 모델보다 적은 Parameter만 task에 적응합니다.",tensor_flow:"last block·final_norm Parameter: frozen→trainable",code_signal:"'마지막'은 -1, '잠금 해제/학습 가능'은 True입니다.",retry:"대상 범위와 Boolean 값을 따로 확인한 뒤 세 빈칸을 다시 채우세요."})
  ];
  chapter.mcq=[
    {id:"exam-llm06a-m1",source_question_id:"exam-llm06a-01",topic:"Padding",prompt:"길이 T로 padding하는 올바른 식은?",answer_index:1,explanation:"현재 길이와 목표 길이의 차이만큼 pad ID를 붙입니다.",choices:[{text:"encoded+[T]*pad_token_id",why:"길이와 값의 역할이 바뀌었습니다."},{text:"encoded+[pad_token_id]*(T-len(encoded))",why:"부족한 개수만큼 올바른 ID를 붙입니다."},{text:"encoded+[0]*T",why:"원본 길이를 고려하지 않고 pad ID도 무시합니다."},{text:"encoded[:pad_token_id]",why:"padding이 아니라 slicing입니다."},{text:"[pad_token_id]+encoded",why:"앞에 하나만 붙입니다."}]},
    {id:"exam-llm06a-m2",source_question_id:"exam-llm06a-02",topic:"분류 위치",prompt:"[B,T,C]에서 문장별 [B,C] logits을 얻는 코드는?",answer_index:3,explanation:"시간축 마지막 위치를 선택합니다.",choices:[{text:"logits[-1,:,:]",why:"마지막 batch만 선택합니다."},{text:"logits[:,:,-1]",why:"마지막 class만 선택합니다."},{text:"logits.mean(dim=-1)",why:"class 축을 없앱니다."},{text:"logits[:,-1,:]",why:"각 batch의 마지막 token을 선택합니다."},{text:"logits[:,0,:]",why:"첫 token을 선택합니다."}]},
    {id:"exam-llm06a-m3",source_question_id:"exam-llm06a-03",topic:"Freeze",prompt:"Parameter를 동결하는 설정은?",answer_index:0,explanation:"gradient 생성을 끕니다.",choices:[{text:"param.requires_grad=False",why:"학습 gradient 대상에서 제외합니다."},{text:"model.eval()",why:"모듈 동작 모드만 바꿉니다."},{text:"param.grad=0",why:"현재 gradient 값만 바꿉니다."},{text:"optimizer.zero_grad()",why:"배치 gradient를 초기화할 뿐 다음 gradient는 생성됩니다."},{text:"torch.no_grad()",why:"해당 문맥의 연산 기록만 잠시 끕니다."}]},
    {id:"exam-llm06a-m4",source_question_id:"exam-llm06a-04",topic:"Head 출력",prompt:"햄/스팸 분류 head의 out_features는?",answer_index:4,explanation:"후보 class가 두 개이므로 num_classes입니다.",choices:[{text:"vocab_size",why:"언어모델 token 예측 크기입니다."},{text:"context_length",why:"입력 길이입니다."},{text:"emb_dim",why:"head 입력 차원입니다."},{text:"batch_size",why:"데이터 묶음 크기입니다."},{text:"num_classes",why:"분류 후보 수입니다."}]},
    {id:"exam-llm06a-m5",source_question_id:"exam-llm06a-05",topic:"부분 미세조정",prompt:"전체 동결 후 마지막 block만 선택하는 index는?",answer_index:2,explanation:"Python sequence의 마지막 원소는 -1입니다.",choices:[{text:"0",why:"첫 block입니다."},{text:"1",why:"두 번째 block입니다."},{text:"-1",why:"마지막 block입니다."},{text:"n_layers",why:"범위를 벗어납니다."},{text:"None",why:"유효한 block index가 아닙니다."}]}
  ];
  chapter.questionCount=chapter.subjective.length;
  chapter.exam_design={version:3,style:"원본 TODO·???? 골격 보존형",difficulty:["단일 설정","Tensor 인덱싱","데이터·부분 미세조정 연결"],excluded:["URL·경로","다운로드 주소","고정 파일명 암기"]};
})();

(() => {
  "use strict";
  const course=window.LLM_COURSE;
  const chapter=course.chapters.find((item)=>item.file==="Chapter_5_Excercise_Pretraining.ipynb");
  if(!chapter)return;
  chapter.notebook_goal="다음 토큰 Cross Entropy loss를 계산하고, gradient 학습 루프와 autoregressive 생성을 구현한다.";
  chapter.overview={title:"Logits에서 학습과 다음 토큰 생성으로 이어지는 흐름",subtitle:"같은 GPT 출력에서 학습은 loss·gradient 업데이트로, 생성은 마지막 logits·token 연결로 갈라진다.",steps:[
    {label:"Forward",code:"logits = model(input_batch)",flow:"[B,T] → [B,T,V]"},
    {label:"Loss",code:"cross_entropy(logits.flatten(0,1), target.flatten())",flow:"[B,T,V] → [B·T,V], [B,T] → [B·T]"},
    {label:"학습",code:"zero_grad → loss → backward → step",flow:"gradient 초기화·계산·갱신"},
    {label:"다음 토큰",code:"argmax(logits[:, -1, :])",flow:"[B,T,V] → [B,1]"},
    {label:"문맥 확장",code:"cat((idx, idx_next), dim=1)",flow:"[B,T] → [B,T+1]"}
  ],rules:["Cross Entropy의 class 축 V는 마지막에 남기고 B와 T만 합친다.","매 batch의 학습 순서는 zero_grad→forward/loss→backward→step이다.","평가·생성에서는 gradient 기록을 끄고, 학습으로 돌아오면 train 모드를 복구한다.","다음 토큰 생성에는 마지막 time step logits만 사용한다."]};
  const cells={
    "exam-ch5-loss":`loss = torch.nn.functional.cross_entropy(
    logits.flatten(0, 1),
    target_batch.flatten()
)`,
    "exam-ch5-train":"model.train()",
    "exam-ch5-update":`optimizer.zero_grad()
loss = calc_loss_batch(input_batch, target_batch, model, device)
loss.backward()
optimizer.step()`,
    "exam-ch5-generate":`logits = logits[:, -1, :]
idx_next = torch.argmax(logits, dim=-1, keepdim=True)
idx = torch.cat((idx, idx_next), dim=1)`,
    "exam-ch5-convert":`encoded_tensor = torch.tensor(encoded).unsqueeze(0)
flat = token_ids.squeeze(0)`,
    "exam-ch5-optimizer":`optimizer = torch.optim.AdamW(
    model.parameters(), lr=settings["learning_rate"], weight_decay=settings["weight_decay"]
)`
  };
  Object.entries(cells).forEach(([id,source])=>{course.cells[id]={source};});
  const base={subject:"LLM",chapterId:chapter.id,chapterNumber:chapter.number,chapterTitle:chapter.title,file:chapter.file,isSourceBlank:true,source_type:"원본 노트북 실제 빈칸"};
  const make=(data)=>({...base,occurrence:0,accepted_answers:[data.answer],...data});
  chapter.subjective=[
    make({id:"exam-llm05-01",topic:"Next-token Cross Entropy",difficulty:"3 · Tensor reshape",sourceId:"exam-ch5-loss",prompt:"원본 TODO의 함수명과 두 flatten 연산을 채워 완성된 loss 블록을 작성하세요.",answer:cells["exam-ch5-loss"],
      problem_context:`logits = model(input_batch)  # [B,T,V]
# CrossEntropy 입력은 [N,C], target은 [N]이어야 합니다.
# TODO: 함수명과 logits/target 평탄화 메서드를 채우세요.
loss = torch.nn.functional.????(
    logits.????(0, 1),
    target_batch.????()
)`,
      explanation:"모든 B·T 위치가 하나의 분류 sample이고 V가 class 축입니다. logits는 앞 두 축만 합치고 target은 전체를 1차원으로 펴야 위치가 대응됩니다.",tensor_flow:"logits [B,T,V]→[B·T,V], target [B,T]→[B·T], loss→scalar",code_signal:"주석의 CrossEntropy [N,C] 조건과 flatten(0,1) 힌트가 축 변환을 결정합니다.",retry:"V축을 보존해야 한다는 기준으로 두 출력 shape을 먼저 적으세요."}),
    make({id:"exam-llm05-02",topic:"Train mode",difficulty:"1 · 모드 전환",sourceId:"exam-ch5-train",prompt:"각 epoch의 학습 시작 전에 호출할 완성된 한 줄을 작성하세요.",answer:cells["exam-ch5-train"],
      problem_context:`for epoch in range(num_epochs):
    # TODO: 학습 루프 시작 전 모델 모드를 설정하세요.
    model.????()
    for input_batch, target_batch in train_loader:`,
      explanation:"train()은 Dropout 등 모듈을 학습 동작으로 전환합니다. optimizer를 학습 모드로 바꾸는 것이 아닙니다.",tensor_flow:"Tensor shape 변화 없음; module.training=True",code_signal:"호출 대상이 model이고 주석이 '학습 모드'를 지시합니다.",retry:"평가용 eval()의 반대 메서드를 작성하세요."}),
    make({id:"exam-llm05-03",topic:"Batch 학습 4단계",difficulty:"3 · 실행 순서",sourceId:"exam-ch5-update",prompt:"이전 gradient 초기화부터 파라미터 갱신까지 원본 네 빈칸을 완성한 네 줄을 순서대로 작성하세요.",answer:cells["exam-ch5-update"],
      problem_context:`for input_batch, target_batch in train_loader:
    # Step 1: 이전 gradient 초기화
    optimizer.????()
    # Step 2: 현재 batch loss
    loss = ????(input_batch, target_batch, model, device)
    # Step 3: gradient 계산
    loss.????()
    # Step 4: 파라미터 갱신
    optimizer.????()`,
      explanation:"PyTorch gradient는 누적되므로 먼저 비우고, loss를 만든 뒤 backward로 gradient를 계산해야 step이 이를 사용해 가중치를 바꿀 수 있습니다.",tensor_flow:"batch→scalar loss→parameter.grad→updated parameters",code_signal:"호출 대상 optimizer/loss와 네 Step 주석이 각 메서드와 순서를 제한합니다.",retry:"초기화·계산·역전파·갱신을 소리 내어 말한 뒤 코드를 다시 쓰세요."}),
    make({id:"exam-llm05-04",topic:"Greedy autoregressive 생성",difficulty:"3 · 연결 구현",sourceId:"exam-ch5-generate",prompt:"마지막 위치 logits 선택, 최고 점수 token ID 선택, 시간축 연결의 완성된 세 줄을 작성하세요.",answer:cells["exam-ch5-generate"],
      problem_context:`# logits: [batch, seq_len, vocab_size]
# TODO: 마지막 시점 logits만 추출
logits = logits[:, ????, :]
# TODO: Greedy decoding으로 token ID 선택
idx_next = torch.????(logits, dim=-1, keepdim=True)
# TODO: 새 token을 기존 문맥 뒤에 연결
idx = torch.cat((idx, ????), dim=1)`,
      explanation:"시간축 -1을 선택해 [B,V]를 만들고 argmax를 keepdim=True로 [B,1]로 유지해야 idx [B,T]의 시간축에 연결할 수 있습니다.",tensor_flow:"[B,T,V]→[B,V]→[B,1]; [B,T]+[B,1]→[B,T+1]",code_signal:"'마지막', '가장 높은', '이어붙이기'가 각각 -1, argmax, idx_next를 가리킵니다.",retry:"각 줄의 출력 shape을 확인하면서 세 줄을 다시 작성하세요."}),
    make({id:"exam-llm05-05",topic:"Text·token batch 차원",difficulty:"2 · 차원 변환",sourceId:"exam-ch5-convert",prompt:"단일 token 시퀀스에 batch 축을 추가하고, decoding 전 다시 제거하는 완성된 두 줄을 작성하세요.",answer:cells["exam-ch5-convert"],
      problem_context:`encoded = tokenizer.encode(text)  # [T]
# TODO: 모델 입력용 batch 축 추가
encoded_tensor = torch.tensor(encoded).????(0)

# token_ids: [1,T]
# TODO: decoding 전 batch 축 제거
flat = token_ids.????(0)`,
      explanation:"모델은 [B,T]를 요구하므로 단일 문장 [T] 앞에 크기 1 축을 추가합니다. decode에는 다시 [T] ID 목록이 필요해 그 축만 제거합니다.",tensor_flow:"list[int] [T]→Tensor [1,T]→Tensor [T]→list[int]",code_signal:"'추가/제거'와 명시된 축 0이 서로 반대인 unsqueeze/squeeze를 지시합니다.",retry:"변환 전후 shape을 [T]와 [1,T]로 써 놓고 메서드를 고르세요."}),
    make({id:"exam-llm05-06",topic:"AdamW 연결",difficulty:"2 · 학습 구성",sourceId:"exam-ch5-optimizer",prompt:"모델의 학습 파라미터와 settings의 학습률·가중치 감쇠를 연결한 완성된 optimizer 블록을 작성하세요.",answer:cells["exam-ch5-optimizer"],
      problem_context:`model = GPTModel(gpt_config)
model.to(device)
# TODO: AdamW에 파라미터 이터레이터와 학습률 키워드를 채우세요.
optimizer = torch.optim.AdamW(
    model.????(), ????=settings["learning_rate"],
    weight_decay=settings["weight_decay"]
)`,
      explanation:"optimizer는 값 복사본이 아니라 model.parameters() 이터레이터를 받아야 실제 Parameter를 갱신합니다. 학습률 키워드는 lr입니다.",tensor_flow:"model Parameters + scalar hyperparameters → optimizer state",code_signal:"model.????() 형태와 settings['learning_rate'] 앞 키워드가 parameters와 lr을 요구합니다.",retry:"optimizer가 무엇을 갱신하는지와 학습률의 PyTorch 키워드를 다시 확인하세요."})
  ];
  chapter.mcq=[
    {id:"exam-llm05-m1",source_question_id:"exam-llm05-01",topic:"Cross Entropy shape",prompt:"logits [B,T,V]와 target [B,T]의 올바른 변환은?",answer_index:2,explanation:"B와 T를 합치고 V는 class 축으로 보존합니다.",choices:[{text:"logits.flatten(), target.flatten()",why:"logits의 V축까지 사라집니다."},{text:"logits.flatten(1), target.flatten(1)",why:"logits가 [B,T·V]가 됩니다."},{text:"logits.flatten(0,1), target.flatten()",why:"[B·T,V]와 [B·T]가 됩니다."},{text:"logits.mean(1), target[:,0]",why:"시퀀스 위치 대부분을 잃습니다."},{text:"logits.transpose(1,2), target",why:"일반 cross_entropy 호출에서 요구 shape와 다릅니다."}]},
    {id:"exam-llm05-m2",source_question_id:"exam-llm05-03",topic:"Gradient 순서",prompt:"한 batch의 올바른 학습 순서는?",answer_index:0,explanation:"이전 gradient를 비운 뒤 현재 loss의 gradient로 갱신합니다.",choices:[{text:"zero_grad→loss→backward→step",why:"올바른 순서입니다."},{text:"loss→step→backward→zero_grad",why:"gradient 계산 전에 갱신합니다."},{text:"backward→loss→step",why:"backward할 loss가 없습니다."},{text:"zero_grad→step→loss→backward",why:"현재 gradient 없이 step합니다."},{text:"loss→backward→zero_grad→step",why:"계산한 gradient를 갱신 전에 지웁니다."}]},
    {id:"exam-llm05-m3",source_question_id:"exam-llm05-04",topic:"마지막 logits",prompt:"[B,T,V]에서 다음 token용 [B,V]를 얻는 인덱싱은?",answer_index:4,explanation:"batch와 vocab은 유지하고 시간축 마지막만 선택합니다.",choices:[{text:"logits[-1,:,:]",why:"마지막 batch를 선택합니다."},{text:"logits[:,:,-1]",why:"마지막 vocab class만 선택합니다."},{text:"logits[:,0,:]",why:"첫 time step입니다."},{text:"logits[:,-1]",why:"동일 결과지만 시험 원본의 세 축 표현을 보존하지 않습니다."},{text:"logits[:,-1,:]",why:"시간축 마지막 위치를 선택합니다."}]},
    {id:"exam-llm05-m4",source_question_id:"exam-llm05-05",topic:"Batch 차원",prompt:"[T]를 [1,T]로 만드는 연산은?",answer_index:1,explanation:"0번 위치에 크기 1인 축을 삽입합니다.",choices:[{text:"squeeze(0)",why:"축을 제거합니다."},{text:"unsqueeze(0)",why:"앞에 batch 축을 추가합니다."},{text:"flatten(0)",why:"이미 1차원이며 batch 축이 생기지 않습니다."},{text:"transpose(0,1)",why:"1차원에는 교환할 두 축이 없습니다."},{text:"view(-1)",why:"계속 [T]입니다."}]},
    {id:"exam-llm05-m5",source_question_id:"exam-llm05-06",topic:"Optimizer 대상",prompt:"AdamW의 첫 번째 인자로 알맞은 것은?",answer_index:3,explanation:"학습할 Parameter 이터레이터를 전달합니다.",choices:[{text:"model",why:"모듈 자체는 parameter iterable이 아닙니다."},{text:"model.state_dict()",why:"Tensor 사전이며 optimizer의 Parameter 참조가 아닙니다."},{text:"model.forward",why:"실행 메서드입니다."},{text:"model.parameters()",why:"학습 가능한 Parameter 이터레이터입니다."},{text:"model.eval()",why:"평가 모드 전환 결과입니다."}]}
  ];
  chapter.questionCount=chapter.subjective.length;
  chapter.exam_design={version:3,style:"원본 TODO·???? 골격 보존형",difficulty:["단일 모드","Tensor 변환","학습·생성 연결 구현"],excluded:["URL·경로","고정 데이터 암기","설명만 묻기"]};
})();

// Chapter 2 final pass: preserve the exercise notebook's original TODO/???? skeleton.
(() => {
  "use strict";
  const course = window.LLM_COURSE;
  const chapter = course.chapters.find((item) => item.file === "Chapter_2_Exercise_Dataset.ipynb");
  if (!chapter) return;
  const cells = {
    "exam-ch2-final-codec":`integers = tokenizer.encode(text, allowed_special={"<|endoftext|>"})
strings = tokenizer.decode(integers)`,
    "exam-ch2-final-shift":"y = enc_sample[1:context_size+1]",
    "exam-ch2-final-chunks":`input_chunk = token_ids[i : i + max_length]
target_chunk = token_ids[i + 1 : i + max_length + 1]`,
    "exam-ch2-final-getitem":"return self.input_ids[idx], self.target_ids[idx]",
    "exam-ch2-final-loader":"dataset",
    "exam-ch2-final-embedding":"embedding_layer = torch.nn.Embedding(vocab_size, output_dim)",
    "exam-ch2-final-apply":"input_ids"
  };
  Object.entries(cells).forEach(([id, source]) => { course.cells[id] = {source}; });
  const base={subject:"LLM",chapterId:chapter.id,chapterNumber:chapter.number,chapterTitle:chapter.title,file:chapter.file,isSourceBlank:true,source_type:"원본 노트북 실제 빈칸"};
  const make=(data)=>({...base,occurrence:0,accepted_answers:[data.answer],...data});
  chapter.subjective=[
    make({id:"exam-llm02-01",topic:"Tokenizer encode·decode",difficulty:"2 · 역할 구분",sourceId:"exam-ch2-final-codec",
      prompt:"원본 TODO처럼 문자열을 token ID로 바꾸고 다시 문자열로 복원하는 완성된 두 줄을 작성하세요.",answer:cells["exam-ch2-final-codec"],
      problem_context:`# region [token encoding]
# TODO: 인코딩 메서드명을 채워 text를 토큰 ID로 변환하세요.
# 힌트: tokenizer. 뒤 메서드 이름만 채우고 allowed_special 설정은 유지합니다.
integers = tokenizer.????(text, allowed_special={"<|endoftext|>"})
# endregion

# region [token decoding]
# TODO: 디코딩 메서드명을 채워 토큰 ID를 문자열로 복원하세요.
strings = tokenizer.????(integers)
# endregion`,
      explanation:"encode는 문자열을 정수 ID 리스트로, decode는 ID 리스트를 문자열로 바꿉니다. 두 메서드의 방향을 바꾸면 입력 타입이 맞지 않습니다.",tensor_flow:"str → encode → list[int] → decode → str",code_signal:"출력 변수 integers와 strings, 그리고 주석의 '인코딩/복원'이 메서드 방향을 알려 줍니다.",retry:"각 줄의 입력 타입과 출력 타입을 먼저 적고 다시 완성하세요."}),
    make({id:"exam-llm02-02",topic:"다음 토큰 정렬",difficulty:"1 · 슬라이싱",sourceId:"exam-ch2-final-shift",
      prompt:"x와 길이는 같지만 한 칸 오른쪽인 y의 완성된 한 줄을 작성하세요.",answer:cells["exam-ch2-final-shift"],accepted_answers:[cells["exam-ch2-final-shift"],"1, 1"],
      problem_context:`context_size = 4
x = enc_sample[:context_size]
# TODO: y 시퀀스가 x보다 한 칸 오른쪽으로 밀리도록 인덱스를 채우세요.
# 두 빈칸은 모두 1이며 y는 x의 next-token 시퀀스가 됩니다.
y = enc_sample[????:context_size+?????]`,
      explanation:"target은 input의 각 위치에서 바로 다음 token이어야 하므로 시작과 끝을 모두 +1 이동합니다. 끝을 이동하지 않으면 길이가 하나 짧아집니다.",tensor_flow:"x [T] ↔ y [T], y의 시작 위치만 한 칸 뒤",code_signal:"'한 칸 오른쪽'과 '같은 길이'를 동시에 만족하려면 slice 양 끝에 +1이 필요합니다.",retry:"x와 y의 실제 index를 4개씩 써 보고 다시 작성하세요."}),
    make({id:"exam-llm02-03",topic:"Sliding input·target chunk",difficulty:"3 · 연결 슬라이싱",sourceId:"exam-ch2-final-chunks",
      prompt:"현재 i에서 길이 max_length의 input과 한 칸 뒤 target을 만드는 완성된 두 줄을 작성하세요.",answer:cells["exam-ch2-final-chunks"],
      problem_context:`for i in range(0, len(token_ids) - max_length, stride):
    # TODO: 입력 청크 슬라이싱 구간을 채우세요.
    input_chunk = token_ids[???? : ???? + max_length]

    # TODO: 타깃은 입력보다 한 칸 뒤에서 시작하고 같은 길이를 유지합니다.
    target_chunk = token_ids[???? + ???? : ???? + max_length + ????]`,
      explanation:"input은 i부터 i+max_length 직전까지, target은 양 끝을 모두 +1 이동합니다. stride는 다음 sample의 i를 이동시킬 뿐 target offset이 아닙니다.",tensor_flow:"token_ids → input [T], target [T]",code_signal:"loop 변수 i가 두 slice의 기준이고, next-token 관계가 target 양 끝의 +1을 결정합니다.",retry:"input의 시작·끝을 먼저 쓰고 각각에 +1을 더해 target을 만드세요."}),
    make({id:"exam-llm02-04",topic:"Dataset 조회",difficulty:"1 · 반환 규약",sourceId:"exam-ch2-final-getitem",
      prompt:"같은 idx의 입력과 정답 Tensor를 한 쌍으로 반환하는 완성된 return 문을 작성하세요.",answer:cells["exam-ch2-final-getitem"],
      problem_context:`def __getitem__(self, idx):
    # DataLoader가 해당 인덱스의 입력과 정답 쌍을 요청합니다.
    # TODO: 같은 idx의 입력/타깃 쌍을 반환하세요.
    return self.input_ids[????], self.target_ids[????]`,
      explanation:"입력과 target은 생성 시 같은 순서로 저장되므로 동일한 idx를 사용해야 학습쌍이 유지됩니다.",tensor_flow:"idx → (input_ids[idx] [T], target_ids[idx] [T])",code_signal:"함수 인자 idx와 두 리스트의 같은 위치라는 주석이 답을 직접 제한합니다.",retry:"두 리스트에서 서로 다른 index를 쓰면 어떤 sample 쌍이 되는지 생각하세요."}),
    make({id:"exam-llm02-05",topic:"DataLoader 연결",difficulty:"1 · 객체 선택",sourceId:"exam-ch2-final-loader",
      prompt:"DataLoader의 첫 번째 빈칸에 들어갈 객체를 작성하세요.",answer:cells["exam-ch2-final-loader"],
      problem_context:`dataset = GPTDatasetV1(txt, tokenizer, max_length, stride)

# TODO: DataLoader의 첫 번째 인자를 채우세요.
# 힌트: 바로 위에서 생성한 순회 대상 객체를 전달합니다.
dataloader = DataLoader(
    ????,
    batch_size=batch_size,
    shuffle=shuffle,
    drop_last=drop_last,
    num_workers=num_workers
)`,
      explanation:"DataLoader는 클래스나 원문이 아니라 __len__과 __getitem__을 제공하는 생성된 Dataset 인스턴스를 받습니다.",tensor_flow:"Dataset sample [T] → DataLoader batch [B,T]",code_signal:"바로 위 대입문의 왼쪽 변수 dataset이 이미 생성된 순회 대상입니다.",retry:"클래스와 인스턴스 중 DataLoader가 실제로 index 조회할 대상을 고르세요."}),
    make({id:"exam-llm02-06",topic:"Embedding 생성",difficulty:"2 · 생성자 인자",sourceId:"exam-ch2-final-embedding",
      prompt:"단어장 크기의 token ID를 output_dim 벡터로 바꾸는 완성된 layer 생성문을 작성하세요.",answer:cells["exam-ch2-final-embedding"],
      problem_context:`vocab_size = 6
output_dim = 3
torch.manual_seed(123)
# TODO: Embedding 생성자 인자를 채우세요.
# 첫 인자는 단어장 크기, 두 번째는 각 벡터 차원입니다.
embedding_layer = torch.nn.Embedding(????, ????)`,
      explanation:"Embedding 표는 vocab_size개의 행과 output_dim개의 열을 가집니다. 두 인자를 바꾸면 조회 가능한 ID 범위와 벡터 차원이 뒤집힙니다.",tensor_flow:"weight [V,D], input IDs […] → output […,D]",code_signal:"주석의 '단어장 크기'와 '벡터 차원'이 생성자 인자 순서를 알려 줍니다.",retry:"Embedding weight의 예상 shape [V,D]를 먼저 쓰세요."}),
    make({id:"exam-llm02-07",topic:"Embedding 적용",difficulty:"1 · 입력 Tensor",sourceId:"exam-ch2-final-apply",
      prompt:"Embedding 레이어 호출의 빈칸에 들어갈 입력 변수를 작성하세요.",answer:cells["exam-ch2-final-apply"],
      problem_context:`input_ids = torch.tensor([2, 3, 5, 1])

# TODO: 임베딩 레이어 입력 변수를 채우세요.
# Embedding은 정수 token ID Tensor를 입력으로 받습니다.
token_embeddings = embedding_layer(????)`,
      explanation:"Embedding은 실수 벡터나 원문이 아니라 행을 조회할 정수 token ID Tensor를 입력으로 받습니다.",tensor_flow:"input_ids [T] int64 → token_embeddings [T,D] float",code_signal:"바로 위 input_ids의 값과 주석의 '정수 token ID Tensor'가 입력 변수를 지시합니다.",retry:"레이어가 lookup할 index가 들어 있는 변수를 고르세요."})
  ];
  chapter.mcq=[
    {id:"exam-llm02-m1",source_question_id:"exam-llm02-01",topic:"Tokenizer 방향",prompt:"text를 ID로 바꾸고 다시 복원하는 순서는?",answer_index:0,explanation:"문자열에는 encode, ID에는 decode를 적용합니다.",choices:[{text:"encode(text) → decode(ids)",why:"입출력 타입과 방향이 맞습니다."},{text:"decode(text) → encode(ids)",why:"메서드 입력 타입이 반대입니다."},{text:"encode(ids) → decode(text)",why:"각 입력이 뒤바뀌었습니다."},{text:"tokenize(ids) → detokenize(text)",why:"이 노트북 tokenizer의 실제 API가 아닙니다."},{text:"decode(decode(text))",why:"문자열을 ID로 만드는 단계가 없습니다."}]},
    {id:"exam-llm02-m2",source_question_id:"exam-llm02-02",topic:"Next-token slice",prompt:"x와 같은 길이의 다음-token target은?",answer_index:1,explanation:"slice 시작과 끝을 모두 +1 이동합니다.",choices:[{text:"enc_sample[1:context_size]",why:"길이가 하나 짧습니다."},{text:"enc_sample[1:context_size+1]",why:"한 칸 이동하면서 길이를 유지합니다."},{text:"enc_sample[:context_size]",why:"입력과 같습니다."},{text:"enc_sample[-1:context_size]",why:"마지막 원소부터의 잘못된 구간입니다."},{text:"enc_sample[context_size:]",why:"위치별 다음 token 쌍이 아닙니다."}]},
    {id:"exam-llm02-m3",source_question_id:"exam-llm02-03",topic:"Sliding target",prompt:"input이 token_ids[i:i+T]일 때 target은?",answer_index:3,explanation:"양 끝을 한 칸 오른쪽으로 이동합니다.",choices:[{text:"token_ids[i:i+T]",why:"현재 token 자체입니다."},{text:"token_ids[i+1:i+T]",why:"길이가 T-1입니다."},{text:"token_ids[i+T:i+2*T]",why:"다음 chunk이지 위치별 다음 token이 아닙니다."},{text:"token_ids[i+1:i+T+1]",why:"next-token 정렬과 길이가 모두 맞습니다."},{text:"token_ids[i-1:i+T-1]",why:"이전 token 방향입니다."}]},
    {id:"exam-llm02-m4",source_question_id:"exam-llm02-05",topic:"DataLoader 대상",prompt:"DataLoader의 첫 인자로 알맞은 것은?",answer_index:2,explanation:"초기화된 Dataset 인스턴스를 전달합니다.",choices:[{text:"GPTDatasetV1",why:"클래스 자체입니다."},{text:"txt",why:"원문 문자열은 Dataset 규약을 제공하지 않습니다."},{text:"dataset",why:"생성된 Dataset 인스턴스입니다."},{text:"tokenizer",why:"Dataset 내부 변환 도구입니다."},{text:"dataset.input_ids",why:"target과의 쌍 반환 규약을 잃습니다."}]},
    {id:"exam-llm02-m5",source_question_id:"exam-llm02-06",topic:"Embedding 인자",prompt:"weight shape [V,D]를 만드는 생성자는?",answer_index:4,explanation:"첫 인자는 조회 행 수 V, 둘째는 벡터 차원 D입니다.",choices:[{text:"Embedding(D,V)",why:"두 의미가 반대입니다."},{text:"Linear(V,D)",why:"token ID lookup이 아닙니다."},{text:"Embedding(input_ids,D)",why:"첫 인자는 Tensor가 아니라 정수 V입니다."},{text:"Embedding(V,V)",why:"출력 차원을 D로 설정하지 않습니다."},{text:"Embedding(V,D)",why:"단어장 행과 embedding 열이 맞습니다."}]}
  ];
  chapter.questionCount=chapter.subjective.length;
  chapter.exam_design={version:3,style:"원본 TODO·???? 골격 보존형",difficulty:["단일 빈칸","다중 인자","연결 슬라이싱"],excluded:["원본에 없던 빈칸","URL·경로 암기","함수 전체 삭제"]};
})();

(() => {
  "use strict";
  const course = window.LLM_COURSE;
  const chapter = course.chapters.find((item) => item.file === "Chapter_4_Excercise_GPT.ipynb");
  if (!chapter) return;

  chapter.notebook_goal = "GPT의 정규화·FFN·Transformer block·출력 head를 조립하고 autoregressive 생성 루프를 구현한다.";
  chapter.overview = {
    title: "Token ID가 다음 토큰 Logits가 되는 GPT 흐름",
    subtitle: "임베딩에서 Transformer block을 거쳐 vocab 점수를 만들고, 마지막 위치의 토큰을 반복 생성한다.",
    steps: [
      {label:"입력 임베딩",code:"tok_emb(in_idx) + pos_emb(arange(T))",flow:"[B,T] → [B,T,D]"},
      {label:"Transformer block",code:"LN → Attention → Add → LN → FFN → Add",flow:"[B,T,D] 유지"},
      {label:"출력 점수",code:"out_head(final_norm(x))",flow:"[B,T,D] → [B,T,V]"},
      {label:"다음 토큰 선택",code:"argmax(logits[:, -1, :])",flow:"[B,T,V] → [B,1]"},
      {label:"문맥 갱신",code:"cat((idx, idx_next), dim=1)",flow:"[B,T] + [B,1] → [B,T+1]"}
    ],
    rules: [
      "LayerNorm은 마지막 embedding 축의 평균·분산으로 정규화한 뒤 scale과 shift를 학습한다.",
      "FFN은 D→4D→D로 확장·축소하므로 residual 덧셈의 shape이 유지된다.",
      "GPTModel의 최종 출력 차원은 다음 토큰 후보 수인 vocab_size다.",
      "생성 시 모든 시점 중 마지막 위치 logits만 선택하고 새 ID를 시간축 dim=1에 붙인다."
    ]
  };

  const cells = {
    "exam-ch4-ln-norm":"norm_x = (x - mean) / torch.sqrt(var + self.eps)",
    "exam-ch4-ln-affine":"return self.scale * norm_x + self.shift",
    "exam-ch4-ffn":"self.layers = nn.Sequential(\n    nn.Linear(cfg[\"emb_dim\"], 4 * cfg[\"emb_dim\"]),\n    GELU(),\n    nn.Linear(4 * cfg[\"emb_dim\"], cfg[\"emb_dim\"]),\n)",
    "exam-ch4-block":"x = self.att(x)\nx = self.ff(x)",
    "exam-ch4-model-layers":"self.tok_emb = nn.Embedding(cfg[\"vocab_size\"], cfg[\"emb_dim\"])\nself.pos_emb = nn.Embedding(cfg[\"context_length\"], cfg[\"emb_dim\"])\nself.out_head = nn.Linear(cfg[\"emb_dim\"], cfg[\"vocab_size\"], bias=False)",
    "exam-ch4-forward":"x = tok_embeds + pos_embeds\nx = self.trf_blocks(x)\nlogits = self.out_head(x)",
    "exam-ch4-nograd":"with torch.no_grad():\n    logits = model(idx_cond)",
    "exam-ch4-last":"logits = logits[:, -1, :]",
    "exam-ch4-generate":"idx_next = torch.argmax(logits, dim=-1, keepdim=True)\nidx = torch.cat((idx, idx_next), dim=1)"
  };
  Object.entries(cells).forEach(([id, source]) => { course.cells[id] = {source}; });
  const base={subject:"LLM",chapterId:chapter.id,chapterNumber:chapter.number,chapterTitle:chapter.title,file:chapter.file,isSourceBlank:true,source_type:"원본 노트북 실제 빈칸"};
  const make=(data)=>({...base,occurrence:0,accepted_answers:[data.answer],...data});

  chapter.subjective = [
    make({id:"exam-llm04-01",topic:"LayerNorm 정규화",difficulty:"2 · 계산식",sourceId:"exam-ch4-ln-norm",
      prompt:"평균과 분산을 이용해 LayerNorm의 정규화 계산식을 완성하세요.",answer:"norm_x = (x - mean) / torch.sqrt(var + self.eps)",
      problem_context:`mean = x.mean(dim=-1, keepdim=True)
var = x.var(dim=-1, keepdim=True, unbiased=False)
# TODO: LayerNorm 계산식의 통계량 변수를 채우세요.
# 힌트: 평균(mean)과 분산(var)을 사용해 정규화합니다.
norm_x = (x - ????) / torch.sqrt(???? + self.eps)`,
      explanation:"입력에서 평균을 빼 중심을 0으로 만들고 표준편차 sqrt(var+eps)로 나눕니다. eps는 분산이 0일 때의 나눗셈 불안정을 막습니다.",tensor_flow:"x [B,T,D] → mean,var [B,T,1] → norm_x [B,T,D]",code_signal:"x-????에는 평균, sqrt 안에는 분산이 들어가야 합니다.",retry:"평균 제거와 표준편차 나눗셈을 순서대로 적어 다시 작성하세요."}),
    make({id:"exam-llm04-02",topic:"LayerNorm affine",difficulty:"1 · 파라미터",sourceId:"exam-ch4-ln-affine",
      prompt:"정규화 결과에 학습 가능한 scale과 shift를 적용하는 return 문을 완성하세요.",answer:"return self.scale * norm_x + self.shift",
      problem_context:`self.scale = nn.Parameter(torch.ones(emb_dim))
self.shift = nn.Parameter(torch.zeros(emb_dim))
# TODO: LayerNorm 학습 파라미터를 채우세요.
# 힌트: scale로 곱하고 shift를 더합니다.
return self.???? * norm_x + self.????`,
      explanation:"scale(γ)은 크기를, shift(β)는 위치를 학습해 정규화 뒤에도 필요한 표현 분포를 복원합니다.",tensor_flow:"[B,T,D] * [D] + [D] → [B,T,D]",code_signal:"ones로 초기화된 것은 곱셈 scale, zeros는 덧셈 shift입니다.",retry:"초깃값 1과 0이 각각 어떤 연산의 항등원인지 확인하세요."}),
    make({id:"exam-llm04-03",topic:"FeedForward 구성",difficulty:"3 · 연결 구현",sourceId:"exam-ch4-ffn",
      prompt:"D→4D→D 구조와 GELU를 포함하는 완성된 self.layers 블록을 작성하세요.",answer:cells["exam-ch4-ffn"],
      problem_context:`# TODO: FeedForward의 확장 배수와 활성화 함수 클래스를 채우세요.
self.layers = nn.Sequential(
    nn.Linear(cfg["emb_dim"], ???? * cfg["emb_dim"]),
    ????(),
    nn.Linear(???? * cfg["emb_dim"], cfg["emb_dim"]),
)`,
      explanation:"첫 Linear가 표현 공간을 4D로 확장하고 GELU가 비선형성을 추가하며 두 번째 Linear가 D로 복원합니다.",tensor_flow:"[B,T,D] → [B,T,4D] → [B,T,4D] → [B,T,D]",code_signal:"주석의 '4배 확장'과 'GELU', residual에 다시 더할 수 있어야 한다는 shape이 답입니다.",retry:"각 Linear의 입출력 차원을 화살표로 쓴 다음 블록을 다시 작성하세요."}),
    make({id:"exam-llm04-04",topic:"TransformerBlock 서브레이어",difficulty:"2 · 구조 연결",sourceId:"exam-ch4-block",
      prompt:"Pre-LayerNorm 뒤에 각각 Attention과 FeedForward를 호출하는 두 줄을 작성하세요.",answer:cells["exam-ch4-block"],
      problem_context:`shortcut = x
x = self.norm1(x)
# TODO
x = self.????(x)
x = self.drop_shortcut(x)
x = x + shortcut

shortcut = x
x = self.norm2(x)
# TODO
x = self.????(x)
x = self.drop_shortcut(x)
x = x + shortcut`,
      explanation:"첫 residual 가지는 토큰 간 정보를 모으는 self.att, 두 번째는 토큰별 표현을 변환하는 self.ff입니다.",tensor_flow:"두 가지 모두 [B,T,D] → [B,T,D], 따라서 shortcut과 덧셈 가능",code_signal:"norm1은 att 앞, norm2는 ff 앞이라는 __init__ 구성과 주석이 대응됩니다.",retry:"두 residual 가지의 역할을 '관계 수집/개별 변환'으로 구분하세요."}),
    make({id:"exam-llm04-05",topic:"GPT 입출력 레이어",difficulty:"3 · 모델 구성",sourceId:"exam-ch4-model-layers",
      prompt:"token·position Embedding과 vocab logits 출력 head의 완성된 세 줄을 작성하세요.",answer:cells["exam-ch4-model-layers"],
      problem_context:`# 토큰 임베딩: token ID → D
self.tok_emb = nn.Embedding(cfg["????"], cfg["emb_dim"])
# 위치 임베딩: position ID → D
self.pos_emb = nn.Embedding(cfg["????"], cfg["emb_dim"])
# 출력 헤드: D → token 후보 점수
self.out_head = nn.Linear(cfg["emb_dim"], cfg["????"], bias=False)`,
      explanation:"토큰 lookup 행 수와 출력 후보 수는 vocab_size이고, 위치 lookup 행 수는 최대 context_length입니다.",tensor_flow:"token [B,T]→[B,T,D], position [T]→[T,D], head [B,T,D]→[B,T,V]",code_signal:"단어 ID/단어 후보는 vocab_size, 허용 위치 수는 context_length입니다.",retry:"각 레이어의 행 개수가 무엇을 세는지 적고 다시 작성하세요."}),
    make({id:"exam-llm04-06",topic:"GPT forward 흐름",difficulty:"3 · 연결 구현",sourceId:"exam-ch4-forward",
      prompt:"Embedding 결합, Transformer block 통과, logits 계산의 완성된 세 줄을 작성하세요.",answer:cells["exam-ch4-forward"],
      problem_context:`tok_embeds = self.tok_emb(in_idx)
pos_embeds = self.pos_emb(torch.arange(seq_len, device=in_idx.device))
# TODO: 토큰 의미와 위치 정보 합산
x = tok_embeds + ????
x = self.drop_emb(x)
# TODO: Transformer blocks 통과
x = self.????(x)
x = self.final_norm(x)
# TODO: vocab logits 계산
logits = self.????(x)`,
      explanation:"토큰과 위치를 더해 [B,T,D]를 만든 뒤 모든 block과 final norm을 거쳐 out_head로 vocab 차원의 logits를 냅니다.",tensor_flow:"[B,T] → [B,T,D] → [B,T,D] → [B,T,V]",code_signal:"오른쪽에 이미 정의된 pos_embeds, trf_blocks, out_head를 forward 순서대로 연결합니다.",retry:"각 줄 뒤 shape D가 언제 V로 바뀌는지 표시하세요."}),
    make({id:"exam-llm04-07",topic:"추론 모드",difficulty:"1 · 컨텍스트",sourceId:"exam-ch4-nograd",
      prompt:"텍스트 생성 중 gradient 기록 없이 모델을 실행하는 두 줄을 작성하세요.",answer:cells["exam-ch4-nograd"],
      problem_context:`idx_cond = idx[:, -context_size:]
# 모델 예측 (기울기 계산 불필요)
# TODO
with torch.????():
    logits = model(idx_cond)`,
      explanation:"생성은 파라미터를 업데이트하지 않으므로 torch.no_grad()로 autograd 기록을 끄면 메모리와 연산을 줄일 수 있습니다.",tensor_flow:"idx_cond [B,T] → model → logits [B,T,V]",code_signal:"with torch.????(): 문법과 '기울기 계산 불필요' 주석이 no_grad를 지시합니다.",retry:"학습이 아닌 추론에서 끄는 PyTorch 기능명을 떠올리세요."}),
    make({id:"exam-llm04-08",topic:"마지막 시점 logits",difficulty:"2 · Tensor 인덱싱",sourceId:"exam-ch4-last",
      prompt:"모든 위치의 logits에서 마지막 토큰 위치만 선택하는 완성된 줄을 작성하세요.",answer:cells["exam-ch4-last"],
      problem_context:`# logits: [batch, n_token, vocab_size]
# 다음 단어 예측에는 마지막 time step만 사용합니다.
# TODO
logits = logits[:, ????, :]`,
      explanation:"첫 축 batch와 마지막 축 vocab은 모두 유지하고, 시간축에서 -1을 선택합니다.",tensor_flow:"[B,T,V] → [B,V]",code_signal:"가운데 축이 n_token이며 '마지막' 인덱스는 -1입니다.",retry:"세 축 B,T,V 중 줄여야 할 축 하나를 고르세요."}),
    make({id:"exam-llm04-09",topic:"Greedy 생성과 연결",difficulty:"3 · 생성 루프",sourceId:"exam-ch4-generate",
      prompt:"가장 큰 logits의 token ID를 [B,1]로 선택하고 기존 idx 뒤에 붙이는 두 줄을 작성하세요.",answer:cells["exam-ch4-generate"],
      accepted_answers:[cells["exam-ch4-generate"],"idx_next = torch.argmax(probas, dim=-1, keepdim=True)\nidx = torch.cat((idx, idx_next), dim=1)"],
      problem_context:`# 가장 로짓값이 높은 토큰 선택
# TODO
idx_next = torch.????(logits, dim=-1, keepdim=True)
# 예측 토큰을 기존 시퀀스 뒤에 연결
# TODO
idx = torch.????((idx, idx_next), dim=1)`,
      explanation:"argmax는 vocab 축의 최고 점수 ID를 고르고 keepdim=True로 [B,1]을 유지합니다. cat은 token 시간축 dim=1에 이어 붙입니다.",tensor_flow:"logits [B,V] → idx_next [B,1]; idx [B,T] → [B,T+1]",code_signal:"'가장 높은'은 argmax, '이어 붙임'은 cat이며 두 Tensor의 증가 축은 시간축입니다.",retry:"각 함수의 출력 shape을 먼저 적고 두 줄을 다시 작성하세요."})
  ];

  chapter.mcq = [
    {id:"exam-llm04-m1",source_question_id:"exam-llm04-01",topic:"LayerNorm 축",prompt:"[B,T,D]에서 토큰별 특성을 정규화하는 설정은?",answer_index:1,explanation:"마지막 D축 통계를 구하고 차원을 유지해야 broadcasting됩니다.",choices:[{text:"x.mean(dim=0)",why:"batch 축을 섞습니다."},{text:"x.mean(dim=-1, keepdim=True)",why:"각 토큰의 D축 통계를 [B,T,1]로 유지합니다."},{text:"x.mean(dim=1)",why:"시퀀스 위치들을 섞습니다."},{text:"x.mean()",why:"전체 Tensor를 하나의 값으로 정규화합니다."},{text:"x.mean(dim=-1, keepdim=False)",why:"[B,T]가 되어 [B,T,D]와 바로 broadcasting되지 않습니다."}]},
    {id:"exam-llm04-m2",source_question_id:"exam-llm04-03",topic:"FFN shape",prompt:"residual 연결이 가능한 GPT FFN 구조는?",answer_index:2,explanation:"중간은 4D로 확장하되 최종 출력은 D로 돌아와야 합니다.",choices:[{text:"D→D→4D",why:"최종 4D라 shortcut과 더할 수 없습니다."},{text:"D→4D→4D",why:"D로 복원되지 않습니다."},{text:"D→4D→D",why:"표현을 확장·변환한 뒤 residual용 D로 복원합니다."},{text:"D→D/4→D",why:"원본 GPT의 확장 구조와 반대입니다."},{text:"D→V→D",why:"vocab head와 FFN의 역할을 혼동했습니다."}]},
    {id:"exam-llm04-m3",source_question_id:"exam-llm04-04",topic:"Pre-LayerNorm 순서",prompt:"Transformer attention residual 가지의 올바른 순서는?",answer_index:3,explanation:"원본은 normalization을 서브레이어 전에 두고 결과에 shortcut을 더합니다.",choices:[{text:"Attention→LN→Add",why:"Post/Pre 순서가 다릅니다."},{text:"LN→Add→Attention",why:"서브레이어 전에 residual을 더합니다."},{text:"Attention→Add→LN→Dropout",why:"원본 구조와 순서가 다릅니다."},{text:"shortcut 저장→LN→Attention→Dropout→shortcut Add",why:"Pre-LN residual 흐름과 일치합니다."},{text:"LN→FFN→Attention→Add",why:"한 residual 가지에 두 서브레이어를 섞었습니다."}]},
    {id:"exam-llm04-m4",source_question_id:"exam-llm04-06",topic:"GPT 출력 shape",prompt:"in_idx [B,T]에서 vocab logits까지 올바른 shape 흐름은?",answer_index:0,explanation:"Embedding과 blocks는 D를 유지하고 head에서만 vocab V로 변환합니다.",choices:[{text:"[B,T]→[B,T,D]→[B,T,D]→[B,T,V]",why:"전체 forward 흐름이 맞습니다."},{text:"[B,T]→[B,D]→[B,V]",why:"시퀀스 축이 사라집니다."},{text:"[B,T]→[T,D]→[T,V]",why:"batch 축이 사라집니다."},{text:"[B,T]→[B,T,V]→[B,T,D]",why:"head와 block 순서가 반대입니다."},{text:"[B,T]→[B,D,T]→[B,V,T]",why:"일반 GPT forward에서 T와 D를 전치하지 않습니다."}]},
    {id:"exam-llm04-m5",source_question_id:"exam-llm04-09",topic:"Autoregressive 생성",prompt:"한 토큰 생성 뒤 다음 반복을 가능하게 하는 구현은?",answer_index:4,explanation:"새 ID를 시간축 뒤에 붙여 갱신된 idx를 다음 입력으로 사용합니다.",choices:[{text:"idx = idx_next",why:"기존 문맥을 모두 잃습니다."},{text:"idx = torch.stack((idx, idx_next))",why:"새 축을 만들고 shape도 맞지 않습니다."},{text:"idx = torch.cat((idx, idx_next), dim=0)",why:"batch 축에 붙입니다."},{text:"idx.append(idx_next)",why:"Tensor에는 list append를 사용하지 않습니다."},{text:"idx = torch.cat((idx, idx_next), dim=1)",why:"시간축 끝에 새 token ID를 연결합니다."}]}
  ];
  chapter.questionCount=chapter.subjective.length;
  chapter.exam_design={version:2,style:"원본 골격 보존형 구현 문제",difficulty:["단일 값·호출","Tensor 연산","모델·생성 연결 구현"],excluded:["경로 암기","함수 전체 무문맥 삭제","설명만 묻는 문제"]};
})();

(() => {
  "use strict";
  const course = window.LLM_COURSE;
  const chapter = course.chapters.find((item) => item.file === "Chapter_3_Excercise_Attention.ipynb");
  if (!chapter) return;

  chapter.notebook_goal = "입력 Tensor를 Q·K·V로 투영하고, 미래 토큰을 차단한 scaled dot-product attention을 직접 구현한다.";
  chapter.overview = {
    title: "Causal Attention이 문맥 벡터를 만드는 과정",
    subtitle: "Q·K 유사도를 확률로 바꾼 뒤, 과거 Value를 가중합하여 각 토큰의 새 표현을 만든다.",
    steps: [
      { label: "Q·K·V 투영", code: "W_query(x), W_key(x), W_value(x)", flow: "[B,T,d_in] → 3 × [B,T,D]" },
      { label: "토큰 간 점수", code: "Q @ K.transpose(1, 2)", flow: "[B,T,D] @ [B,D,T] → [B,T,T]" },
      { label: "미래 차단", code: "masked_fill_(mask, -torch.inf)", flow: "미래 위치 score → -∞" },
      { label: "확률 변환", code: "softmax(score / sqrt(D), dim=-1)", flow: "[B,T,T], 행별 합 = 1" },
      { label: "정보 가중합", code: "attn_weights @ values", flow: "[B,T,T] @ [B,T,D] → [B,T,D]" }
    ],
    rules: [
      "Query는 무엇을 찾을지, Key는 무엇과 비교할지, Value는 가져올 정보다.",
      "모든 토큰 쌍의 점수 [T,T]를 만들려면 Key의 마지막 두 축을 전치한다.",
      "마스크는 softmax 전에 -∞로 채워야 미래 위치 확률이 정확히 0이 된다.",
      "score에는 Q·K를 쓰고 최종 context에는 attention weight·V를 쓴다."
    ]
  };

  course.cells["exam-ch3-softmax"] = {
    source: "attn_weights = torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)"
  };
  course.cells["exam-ch3-qkv-layers"] = {
    source: "self.W_query = nn.Linear(d_in, d_out, bias=qkv_bias)\nself.W_key   = nn.Linear(d_in, d_out, bias=qkv_bias)\nself.W_value = nn.Linear(d_in, d_out, bias=qkv_bias)"
  };
  course.cells["exam-ch3-qkv-calc"] = {
    source: "keys = self.W_key(x)\nqueries = self.W_query(x)\nvalues = self.W_value(x)"
  };

  const base = {
    subject: "LLM", chapterId: chapter.id, chapterNumber: chapter.number,
    chapterTitle: chapter.title, file: chapter.file, isSourceBlank: true,
    source_type: "원본 노트북 실제 빈칸"
  };
  const make = (data) => ({ ...base, occurrence: 0, accepted_answers: [data.answer], ...data });

  chapter.subjective = [
    make({
      id: "exam-llm03-01", topic: "Q·K·V 투영 레이어", difficulty: "3 · 연결 구현",
      prompt: "원본 TODO와 같이 세 Linear 레이어의 타입과 입력·출력 차원을 채워 완성된 세 줄을 작성하세요.",
      answer: "self.W_query = nn.Linear(d_in, d_out, bias=qkv_bias)\nself.W_key   = nn.Linear(d_in, d_out, bias=qkv_bias)\nself.W_value = nn.Linear(d_in, d_out, bias=qkv_bias)",
      sourceId: "exam-ch3-qkv-layers",
      problem_context: `# 1. 쿼리(Query), 키(Key), 밸류(Value)를 만들기 위한 선형 투영 레이어 정의
# 입력 벡터(d_in)를 각각의 목적에 맞는 벡터(d_out)로 변환합니다.
# TODO: Q/K/V 투영 레이어 타입과 인자를 채우세요.
# 힌트: 입력 d_in, 출력 d_out을 사용하는 Linear 레이어를 선언하세요.
self.W_query = nn.????(????, ????, bias=qkv_bias)
self.W_key   = nn.????(????, ????, bias=qkv_bias)
self.W_value = nn.????(????, ????, bias=qkv_bias)`,
      explanation: "Q·K·V는 역할은 다르지만 모두 같은 입력 차원 d_in을 받아 같은 attention 차원 d_out으로 투영합니다. 서로 다른 Linear 인스턴스라 학습 가중치는 공유하지 않습니다.",
      tensor_flow: "각 Linear: [B,T,d_in] → [B,T,d_out]",
      code_signal: "생성자 인자 d_in, d_out과 세 속성명 W_query/W_key/W_value가 그대로 답의 구조를 제공합니다.",
      retry: "세 레이어가 같은 크기이되 서로 다른 객체인지 확인하며 세 줄을 다시 작성하세요."
    }),
    make({
      id: "exam-llm03-02", topic: "Q·K·V 벡터 계산", difficulty: "2 · 연결 구현",
      prompt: "각 역할에 맞는 투영 레이어를 x에 적용하여 완성된 세 줄을 작성하세요.",
      answer: "keys = self.W_key(x)\nqueries = self.W_query(x)\nvalues = self.W_value(x)",
      sourceId: "exam-ch3-qkv-calc",
      problem_context: `# 입력 x를 통과시켜 Query, Key, Value를 추출합니다.
# region [Q, K, V 벡터 계산]
# TODO: Q, K, V 계산 호출 대상을 채우세요.
# 힌트: W_query, W_key, W_value를 각각 x에 적용하면 됩니다.
keys = self.????(????)        # Shape: [b, num_tokens, d_out]
queries = self.?????(????)   # Shape: [b, num_tokens, d_out]
values = self.?????(????)    # Shape: [b, num_tokens, d_out]
# endregion`,
      explanation: "같은 x를 세 개의 서로 다른 projection에 넣습니다. 왼쪽 변수의 역할명과 오른쪽 W_* 이름이 일치해야 이후 score와 context 계산의 의미가 유지됩니다.",
      tensor_flow: "x [B,T,d_in] → keys·queries·values [B,T,D]",
      code_signal: "왼쪽 keys/queries/values와 같은 이름의 W_key/W_query/W_value를 대응시키면 됩니다.",
      retry: "왼쪽 변수명을 하나씩 읽고 같은 역할의 W_*를 연결해 다시 작성하세요."
    }),
    make({
      id: "exam-llm03-03", topic: "Attention score", difficulty: "2 · 핵심 연산",
      prompt: "모든 Query와 Key 쌍의 내적이 [B,T,T]가 되도록 오른쪽 표현식을 완성하세요.",
      answer: "queries @ keys.transpose(1, 2)", sourceId: "ch3-cell-126",
      problem_context: `# Query와 Key의 내적을 통해 각 토큰 간의 관련성을 구합니다.
# keys.transpose(1, 2): 행렬 곱을 위해 마지막 두 차원을 뒤집습니다.
# TODO: 어텐션 스코어 행렬곱 피연산자를 채우세요.
# 힌트: queries와 keys.transpose(1, 2)를 곱합니다.
attn_scores = ???? @ ????.transpose(1, 2)`,
      explanation: "queries의 마지막 D와 전치된 keys의 D가 곱해지고, 두 T축이 남아 모든 Query-Key 토큰 쌍의 점수가 만들어집니다.",
      tensor_flow: "[B,T,D] @ [B,D,T] → [B,T,T]",
      code_signal: "주석의 'Query와 Key의 내적'과 결과가 토큰 쌍이어야 한다는 점이 Key 전치를 요구합니다.",
      retry: "행렬곱에서 안쪽 차원 D가 일치하는지 shape을 적은 뒤 다시 작성하세요."
    }),
    make({
      id: "exam-llm03-04", topic: "Causal mask", difficulty: "1 · 단일 값",
      prompt: "미래 토큰 위치가 softmax 후 정확히 0이 되도록 채울 값을 작성하세요.",
      answer: "-torch.inf", sourceId: "ch3-cell-126",
      problem_context: `# mask가 1인 미래 위치를 softmax에서 제외합니다.
# TODO: 미래 시점의 어텐션 스코어를 가릴 값을 채우세요.
# 힌트: Softmax를 통과하면 0이 되도록 마이너스 무한대를 입력하세요.
attn_scores.masked_fill_(
    self.mask.bool()[:num_tokens, :num_tokens],
    ????
)`,
      explanation: "softmax는 exp(score)를 사용하므로 exp(-∞)=0입니다. 0이나 -1 같은 유한값은 작은 값일 뿐 확률이 완전히 사라지지 않습니다.",
      tensor_flow: "masked score [B,T,T] → softmax에서 미래 위치 확률 0",
      code_signal: "'Softmax를 통과하면 0'이라는 주석이 -torch.inf를 직접 지시합니다.",
      retry: "exp(채울 값)의 결과가 정확히 0인지 생각하고 다시 작성하세요."
    }),
    make({
      id: "exam-llm03-05", topic: "Scaled softmax", difficulty: "3 · 계산식",
      prompt: "점수를 key 차원의 제곱근으로 나눈 후 마지막 축에서 확률화하는 전체 표현식을 작성하세요.",
      answer: "torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)", sourceId: "exam-ch3-softmax",
      problem_context: `# 스케일링: 차원이 커질수록 커지는 내적 값을 sqrt(d_k)로 나눕니다.
# Softmax: 각 Query가 Key들에 부여할 확률로 변환합니다.
# TODO: 어텐션 가중치 함수명을 채우세요.
attn_weights = torch.????(
    attn_scores / keys.shape[-1]**0.5, dim=-1
)`,
      explanation: "내적 분산을 안정시키기 위해 D 자체가 아니라 sqrt(D)로 나눕니다. dim=-1은 각 Query 행에서 모든 Key 위치에 대한 확률 합을 1로 만듭니다.",
      tensor_flow: "scores [B,T,T] → scaled scores [B,T,T] → weights [B,T,T]",
      code_signal: "함수명 빈칸 앞의 torch., 제곱근을 뜻하는 **0.5, Key 위치인 마지막 축이 단서입니다.",
      retry: "나눗셈·제곱근·dim=-1 세 요소를 체크하며 전체 표현식을 다시 쓰세요."
    }),
    make({
      id: "exam-llm03-06", topic: "Context vector", difficulty: "2 · 핵심 연산",
      prompt: "각 Query의 attention 확률로 Value를 가중합하는 오른쪽 표현식을 작성하세요.",
      answer: "attn_weights @ values", sourceId: "ch3-cell-126",
      problem_context: `# 어텐션 가중치로 Value들을 가중 합산합니다.
# TODO: 컨텍스트 벡터 계산 피연산자를 채우세요.
# 힌트: attn_weights와 values를 곱해 최종 컨텍스트 벡터를 얻습니다.
context_vec = attn_weights @ ????

return context_vec`,
      explanation: "attention weight는 어떤 토큰의 정보를 얼마나 가져올지 정한 [T,T] 확률이고, 실제 정보는 Value [T,D]에 있으므로 둘을 곱합니다.",
      tensor_flow: "[B,T,T] @ [B,T,D] → context [B,T,D]",
      code_signal: "'Value 가중 합산'이라는 주석과 출력 마지막 차원 D를 유지해야 한다는 점이 values를 지시합니다.",
      retry: "score 계산의 K와 정보 결합의 V를 구분해 다시 작성하세요."
    }),
    make({
      id: "exam-llm03-07", topic: "모듈 실행", difficulty: "1 · 호출",
      prompt: "생성한 CausalAttention 인스턴스에 batch를 전달하는 오른쪽 표현식을 작성하세요.",
      answer: "ca(batch)", sourceId: "ch3-cell-126",
      problem_context: `context_length = batch.shape[1]

# TODO: 어텐션 모듈 호출 대상을 채우세요.
# 힌트: 직전에 생성한 CausalAttention 인스턴스(ca)를 호출하면 됩니다.
ca = CausalAttention(d_in, d_out, context_length, 0.0)
context_vecs = ????(batch)

print(context_vecs.shape)`,
      explanation: "nn.Module 인스턴스를 함수처럼 호출하면 내부적으로 __call__이 forward(batch)를 실행합니다. 클래스 CausalAttention이나 forward를 직접 호출하는 문제가 아닙니다.",
      tensor_flow: "batch [B,T,d_in] → ca → context_vecs [B,T,d_out]",
      code_signal: "바로 위에서 ca라는 인스턴스를 만들었고 빈칸 뒤에 이미 (batch)가 제공되어 있습니다.",
      retry: "클래스명과 생성된 인스턴스 변수명을 구분해 다시 작성하세요."
    })
  ];

  chapter.mcq = [
    {
      id: "exam-llm03-m1", source_question_id: "exam-llm03-02", topic: "Q·K·V 역할 대응", answer_index: 1,
      prompt: "같은 x에서 역할이 올바르게 연결된 구현은?", explanation: "왼쪽 역할명과 같은 W_* projection을 x에 적용해야 합니다.",
      choices: [
        {text:"keys = self.W_query(x); queries = self.W_key(x); values = self.W_value(x)",why:"Q와 K projection이 서로 뒤바뀌었습니다."},
        {text:"keys = self.W_key(x); queries = self.W_query(x); values = self.W_value(x)",why:"세 역할과 projection 이름이 정확히 대응합니다."},
        {text:"keys = queries = values = x",why:"학습 가능한 서로 다른 투영을 수행하지 않습니다."},
        {text:"keys = self.W_key; queries = self.W_query; values = self.W_value",why:"레이어를 x에 호출하지 않아 Tensor가 아니라 모듈 객체입니다."},
        {text:"keys, queries, values = self.W_query(x)",why:"하나의 Tensor를 세 변수로 올바르게 분해할 수 없습니다."}
      ]
    },
    {
      id: "exam-llm03-m2", source_question_id: "exam-llm03-03", topic: "Score shape", answer_index: 3,
      prompt: "queries와 keys가 [B,T,D]일 때 [B,T,T] 점수를 만드는 구현은?", explanation: "Key의 T와 D 축을 바꿔 D끼리 내적해야 합니다.",
      choices: [
        {text:"queries @ keys",why:"안쪽 차원이 D와 T여서 일반적으로 곱할 수 없습니다."},
        {text:"queries.transpose(1, 2) @ keys",why:"결과가 [B,D,D]가 됩니다."},
        {text:"keys @ queries.transpose(1, 2)",why:"shape은 [B,T,T]지만 Key가 행이 되어 Query별 검색이라는 의미가 반대입니다."},
        {text:"queries @ keys.transpose(1, 2)",why:"[B,T,D]와 [B,D,T]가 곱해져 Query별 Key 점수가 됩니다."},
        {text:"queries * keys",why:"원소별 곱으로 [B,T,D]에 머뭅니다."}
      ]
    },
    {
      id: "exam-llm03-m3", source_question_id: "exam-llm03-04", topic: "Mask 순서와 값", answer_index: 0,
      prompt: "미래 위치의 attention 확률을 정확히 0으로 만드는 처리는?", explanation: "softmax 전에 미래 score를 -∞로 바꿉니다.",
      choices: [
        {text:"attn_scores.masked_fill_(mask.bool(), -torch.inf)",why:"exp(-∞)=0이므로 softmax 확률이 정확히 0이 됩니다."},
        {text:"attn_scores.masked_fill_(mask.bool(), 0)",why:"0도 유한 score라 양의 확률을 가질 수 있습니다."},
        {text:"attn_weights.masked_fill_(mask.bool(), -torch.inf)",why:"softmax 후 확률에 -∞를 넣으면 확률 분포가 깨집니다."},
        {text:"attn_scores.masked_fill_(mask.bool(), torch.inf)",why:"미래 위치가 오히려 가장 큰 확률을 차지합니다."},
        {text:"attn_scores = attn_scores * mask",why:"미래가 아닌 위치를 0으로 만드는 반대 마스크가 됩니다."}
      ]
    },
    {
      id: "exam-llm03-m4", source_question_id: "exam-llm03-05", topic: "Scaled softmax", answer_index: 2,
      prompt: "scaled dot-product attention의 확률 계산으로 알맞은 것은?", explanation: "sqrt(D)로 나눈 score에 마지막 축 softmax를 적용합니다.",
      choices: [
        {text:"torch.softmax(attn_scores / keys.shape[-1], dim=0)",why:"D의 제곱근이 아니며 batch 축을 정규화합니다."},
        {text:"torch.softmax(attn_scores * keys.shape[-1]**0.5, dim=-1)",why:"나누지 않고 곱해 score 분산을 더 키웁니다."},
        {text:"torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)",why:"sqrt(D) 스케일과 Key 위치 축 정규화가 모두 맞습니다."},
        {text:"torch.argmax(attn_scores, dim=-1)",why:"연속적인 가중치가 아니라 하나의 인덱스만 선택합니다."},
        {text:"torch.softmax(keys / attn_scores, dim=-1)",why:"Q·K로 만든 score를 정규화하는 구조가 아닙니다."}
      ]
    },
    {
      id: "exam-llm03-m5", source_question_id: "exam-llm03-06", topic: "정보 가중합", answer_index: 4,
      prompt: "[B,T,T] 확률을 사용해 [B,T,D] 문맥 정보를 만드는 연산은?", explanation: "확률 행렬과 실제 정보를 담은 Value를 곱합니다.",
      choices: [
        {text:"attn_weights @ keys",why:"Key는 비교용이며 가져올 정보는 Value입니다."},
        {text:"attn_scores @ values",why:"정규화되지 않은 score를 사용합니다."},
        {text:"queries @ values.transpose(1, 2)",why:"또 다른 [T,T] 점수를 만들 뿐 문맥 벡터가 아닙니다."},
        {text:"attn_weights + values",why:"shape이 다르고 가중합도 수행하지 않습니다."},
        {text:"attn_weights @ values",why:"각 Query의 확률로 Value를 가중합해 [B,T,D]를 만듭니다."}
      ]
    }
  ];

  chapter.questionCount = chapter.subjective.length;
  chapter.exam_design = {
    version: 2, style: "원본 골격 보존형 구현 문제",
    difficulty: ["단일 호출·값", "핵심 Tensor 연산", "연결 계산식"],
    excluded: ["함수 전체 가리기", "URL·경로 암기", "문맥 없는 단편 암기"]
  };
})();
