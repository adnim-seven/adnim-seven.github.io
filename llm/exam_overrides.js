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
