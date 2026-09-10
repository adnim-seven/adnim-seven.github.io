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
