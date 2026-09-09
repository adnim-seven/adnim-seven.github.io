(() => {
  const line = (text, highlight = false) => ({ text, highlight });
  const cell = (cell_number, problem, answer, marked) => ({
    cell_number,
    blank_count: marked.length,
    problem_lines: problem.map((text, i) => line(text, marked.includes(i))),
    answer_lines: answer.map((text, i) => line(text, marked.includes(i))),
  });
  const transformProblem = [
    "train_tfms = T.Compose([",
    "    T.????(32, padding=4),",
    "    T.????(),",
    "    T.????(),  # PIL → Tensor (C, H, W), 0~1",
    "    T.????(CIFAR10_MEAN, CIFAR10_STD),",
    "]) ",
    "train_loader = DataLoader(train_set, batch_size=batch_size, ????=True)",
  ];
  const transformAnswer = [
    "train_tfms = T.Compose([",
    "    T.RandomCrop(32, padding=4),",
    "    T.RandomHorizontalFlip(),",
    "    T.ToTensor(),  # PIL → Tensor (C, H, W), 0~1",
    "    T.Normalize(CIFAR10_MEAN, CIFAR10_STD),",
    "]) ",
    "train_loader = DataLoader(train_set, batch_size=batch_size, shuffle=True)",
  ];
  const modelProblem = [
    "model = models.resnet18(weights=None)",
    "model.conv1 = nn.Conv2d(????, 64, kernel_size=3, stride=1, padding=1, bias=False)",
    "model.maxpool = nn.Identity()",
    "model.fc = nn.Linear(model.fc.in_features, ????)",
  ];
  const modelAnswer = [
    "model = models.resnet18(weights=None)",
    "model.conv1 = nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)",
    "model.maxpool = nn.Identity()",
    "model.fc = nn.Linear(model.fc.in_features, num_classes)",
  ];
  const trainProblem = [
    "optimizer.zero_grad(set_to_none=True)",
    "logits = ????(images)",
    "loss = criterion(logits, labels)",
    "scaler.scale(loss).????()",
    "scaler.step(optimizer)",
    "scaler.update()",
    "preds = logits.????(dim=1)",
  ];
  const trainAnswer = [
    "optimizer.zero_grad(set_to_none=True)",
    "logits = model(images)",
    "loss = criterion(logits, labels)",
    "scaler.scale(loss).backward()",
    "scaler.step(optimizer)",
    "scaler.update()",
    "preds = logits.argmax(dim=1)",
  ];
  window.LLM_COURSE = {
    subject: "2. Vision",
    sample_mode: true,
    cells: {
      "v-01": { source: "T.RandomCrop(32, padding=4)" },
      "v-02": { source: "T.RandomHorizontalFlip()" },
      "v-03": { source: "T.ToTensor()" },
      "v-04": { source: "T.Normalize(CIFAR10_MEAN, CIFAR10_STD)" },
      "v-05": { source: "DataLoader(train_set, batch_size=batch_size, shuffle=True)" },
      "v-06": { source: "nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)" },
      "v-07": { source: "nn.Linear(model.fc.in_features, num_classes)" },
      "v-08": { source: "logits = model(images)" },
      "v-09": { source: "scaler.scale(loss).backward()" },
      "v-10": { source: "preds = logits.argmax(dim=1)" },
    },
    chapters: [{
      id: "vision-01", number: "01", title: "ResNet18 & CIFAR-10", file: "01_ResNet18_CIFAR10.ipynb",
      capability: "CIFAR-10 이미지 분류를 위해 변형·ResNet18·학습 루프·Accuracy를 연결해 구현할 수 있다.",
      summary: "이미지 데이터가 Transform과 DataLoader를 거쳐 [B,C,H,W] Tensor가 되고, ResNet의 logits를 정답과 비교해 학습하는 흐름입니다.",
      notebook_goal: "CIFAR-10 이미지를 증강·정규화하고, ResNet18을 10개 클래스 분류기에 맞춰 학습·평가하는 파이프라인을 구현한다.",
      key_points: [
        { title: "학습 이미지 증강", purpose: "학습 데이터에만 crop과 flip을 적용해 같은 이미지의 다양한 모습을 학습합니다.", code: "T.RandomCrop(32, padding=4)\nT.RandomHorizontalFlip()", flow: "PIL → 증강된 PIL", watch: "평가 데이터에는 무작위 증강을 넣지 않습니다." },
        { title: "이미지 Tensor와 정규화", purpose: "ToTensor는 이미지를 [C,H,W] float Tensor로, Normalize는 채널별 분포를 맞춘 값으로 바꿉니다.", code: "T.ToTensor()\nT.Normalize(mean, std)", flow: "PIL → [C,H,W] float", watch: "Normalize는 ToTensor 뒤에 와야 합니다." },
        { title: "CIFAR용 ResNet 변경", purpose: "RGB 입력 채널 3개와 10개 클래스 출력에 맞게 첫 Conv와 마지막 Linear를 바꿉니다.", code: "nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1)\nnn.Linear(in_features, num_classes)", flow: "[B,3,32,32] → [B,10]", watch: "분류기의 출력 차원은 클래스 수입니다." },
        { title: "분류 학습과 Accuracy", purpose: "logits와 label로 loss를 만들고 backward 후 optimizer가 가중치를 갱신합니다.", code: "logits = model(images)\nloss.backward()\npreds = logits.argmax(dim=1)", flow: "[B,C], [B] → loss → gradient", watch: "argmax는 클래스 차원 dim=1에서 수행합니다." },
      ],
      theory_guide: [
        { title: "1. Data augmentation", concept: "증강은 학습 이미지에 무작위 변형을 적용해 새로운 입력처럼 보이게 만드는 방법입니다. 과적합을 줄이는 데 쓰입니다.", flow: "PIL → RandomCrop/Flip → Tensor", code_signal: "train_tfms에만 Random으로 시작하는 transform이 들어갑니다.", exam_clue: "crop은 크기와 padding, flip은 함수 호출 괄호를 함께 봅니다." },
        { title: "2. Tensor 입력 형태", concept: "이미지 분류 모델은 배치·채널·높이·너비 순서의 Tensor를 입력으로 받습니다.", flow: "[B, C, H, W] = [batch, 3, 32, 32]", code_signal: "RGB 이미지의 Conv2d 첫 입력 채널은 3입니다.", exam_clue: "CIFAR-10은 RGB이므로 1이 아니라 3입니다." },
        { title: "3. Logits와 CrossEntropyLoss", concept: "logits는 각 클래스에 대한 점수이며, CrossEntropyLoss가 정수 label과 비교해 학습 신호를 만듭니다.", flow: "model(images) [B,10] + labels [B] → loss", code_signal: "criterion(logits, labels) 앞에서는 model(images)가 필요합니다.", exam_clue: "softmax를 따로 넣지 않고 raw logits를 CrossEntropyLoss에 전달합니다." },
        { title: "4. 예측과 Accuracy", concept: "가장 큰 logit의 위치가 모델이 고른 클래스입니다. 이를 label과 비교해 맞은 비율을 구합니다.", flow: "[B,10] → argmax(dim=1) → [B]", code_signal: "클래스 차원이 두 번째 축이면 dim=1입니다.", exam_clue: "argmax는 값이 아니라 class index를 반환합니다." },
      ],
      full_code_cells: [cell(1, transformProblem, transformAnswer, [1,2,3,4,6]), cell(2, modelProblem, modelAnswer, [1,3]), cell(3, trainProblem, trainAnswer, [1,3,6])],
      subjective: [
        { id:"v-q1", sourceId:"v-01", occurrence:0, answer:"RandomCrop", accepted_answers:["RandomCrop"], topic:"학습 증강", prompt:"32×32 crop과 padding=4를 적용하는 transform 이름을 채우세요.", isSourceBlank:false },
        { id:"v-q2", sourceId:"v-02", occurrence:0, answer:"RandomHorizontalFlip", accepted_answers:["RandomHorizontalFlip"], topic:"학습 증강", prompt:"좌우 반전을 무작위로 적용하는 transform 이름을 채우세요.", isSourceBlank:false },
        { id:"v-q3", sourceId:"v-03", occurrence:0, answer:"ToTensor", accepted_answers:["ToTensor"], topic:"Tensor 변환", prompt:"PIL 이미지를 [C,H,W] Tensor로 바꾸는 transform 이름을 채우세요.", isSourceBlank:false },
        { id:"v-q4", sourceId:"v-04", occurrence:0, answer:"Normalize", accepted_answers:["Normalize"], topic:"정규화", prompt:"채널별 mean과 std로 정규화하는 transform 이름을 채우세요.", isSourceBlank:false },
        { id:"v-q5", sourceId:"v-05", occurrence:0, answer:"shuffle", accepted_answers:["shuffle"], topic:"DataLoader", prompt:"학습 배치의 순서를 매 epoch 섞는 인자 이름을 채우세요.", isSourceBlank:false },
        { id:"v-q6", sourceId:"v-06", occurrence:0, answer:"3", accepted_answers:["3"], topic:"ResNet 입력", prompt:"CIFAR-10 RGB 입력의 Conv2d in_channels를 채우세요.", isSourceBlank:false },
        { id:"v-q7", sourceId:"v-07", occurrence:0, answer:"num_classes", accepted_answers:["num_classes","10"], topic:"ResNet 출력", prompt:"마지막 분류기의 출력 차원을 클래스 수로 맞추는 변수를 채우세요.", isSourceBlank:false },
        { id:"v-q8", sourceId:"v-08", occurrence:0, answer:"model", accepted_answers:["model"], topic:"학습", prompt:"images를 입력해 logits를 만드는 호출 대상을 채우세요.", isSourceBlank:false },
        { id:"v-q9", sourceId:"v-09", occurrence:0, answer:"backward", accepted_answers:["backward"], topic:"역전파", prompt:"scaled loss에서 gradient를 계산하는 메서드 이름을 채우세요.", isSourceBlank:false },
        { id:"v-q10", sourceId:"v-10", occurrence:0, answer:"argmax", accepted_answers:["argmax"], topic:"예측", prompt:"클래스 점수에서 가장 높은 클래스 index를 고르는 메서드 이름을 채우세요.", isSourceBlank:false },
      ],
      mcq: [
        { id:"v-m1", source_question_id:"v-q4", topic:"Tensor 변환 순서", prompt:"PIL 이미지를 정규화하려면 빈칸에 무엇이 들어가야 하나요?", answer_index:1, explanation:"Normalize는 Tensor를 입력으로 받으므로 ToTensor 다음에 사용합니다.", choices:[{text:"RandomCrop",why:"공간 증강입니다."},{text:"Normalize",why:"정답: 채널별 정규화입니다."},{text:"DataLoader",why:"배치 생성 객체입니다."},{text:"argmax",why:"예측 class 선택 메서드입니다."},{text:"backward",why:"역전파 메서드입니다."}] },
        { id:"v-m2", source_question_id:"v-q6", topic:"RGB 입력 채널", prompt:"CIFAR-10용 첫 Conv의 입력 채널 수는?", answer_index:2, explanation:"CIFAR-10 이미지는 RGB이므로 채널 수가 3입니다.", choices:[{text:"1",why:"흑백 이미지 채널 수입니다."},{text:"10",why:"클래스 수입니다."},{text:"3",why:"정답: RGB 채널 수입니다."},{text:"32",why:"이미지 높이·너비입니다."},{text:"64",why:"첫 Conv의 출력 채널입니다."}] },
        { id:"v-m3", source_question_id:"v-q10", topic:"예측 class", prompt:"logits [B, C]에서 클래스 index [B]를 얻는 표현은?", answer_index:0, explanation:"C가 두 번째 차원이므로 argmax(dim=1)입니다.", choices:[{text:"argmax",why:"정답: 빈칸 뒤의 (dim=1)과 합쳐져 class index를 만듭니다."},{text:"softmax",why:"확률은 만들지만 index를 고르지 않습니다."},{text:"backward",why:"gradient 계산입니다."},{text:"Normalize",why:"이미지 변환입니다."},{text:"shuffle",why:"DataLoader 인자입니다."}] },
      ],
    }],
  };
})();
