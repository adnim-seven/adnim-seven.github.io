(() => {
  "use strict";
  const course = window.LLM_COURSE;
  const chapter = course.chapters.find((item) => item.file === "Chapter_2_Exercise_Dataset.ipynb");
  if (!chapter) return;

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
