// New questions deliberately target code surrounding original TODO blocks.
const make = (subject, title, source, prompt, code, parts) => ({
  subject,
  title,
  source: source + ' · 기존 빈칸 주변 코드 응용',
  prompt,
  code,
  slots: parts.map(([key, points, answer, why, alternatives = []]) => ({
    key,
    points,
    answer,
    why,
    alternatives
  }))
});

module.exports = {
  '2/LLM': make(
    'LLM',
    'Embedding 입력 준비',
    'Dataset & Embeddings',
    'token_ids는 길이 T의 Python 정수 목록입니다. torch.tensor로 정수 index Tensor를 만들고 batch 축을 추가하세요. model_device로 이동시킨 뒤 준비된 embedding_layer에 전달하세요.',
    `token_ids = [2, 5, 1, 3]  # 제공값\n{{A}}\n{{B}}\n{{C}}\n# embeddings: [1,T,D]`,
    [
      ['A', 2, 'input_ids = torch.tensor(token_ids, dtype=torch.long)', '파이썬 정수 목록을 임베딩 룩업에 적합한 64비트 정수(long) 텐서 [T]로 변환합니다. 오답 주의: float 타입으로 생성하면 nn.Embedding에서 룩업 인덱스 타입 불일치 에러가 발생합니다.', [
        'input_ids = torch.tensor(token_ids, dtype=torch.int64)', 'input_ids = torch.LongTensor(token_ids)', 'input_ids = torch.tensor(token_ids)'
      ]],
      ['B', 2, 'input_ids = input_ids.unsqueeze(0).to(model_device)', '1차원 시퀀스 텐서 [T]의 앞쪽에 배치 차원을 추가하여 [1, T] 형태로 만들고 모델 디바이스로 전송합니다.', [
        'input_ids = input_ids.unsqueeze(dim=0).to(model_device)', 'input_ids = input_ids.to(model_device).unsqueeze(0)', 'input_ids = input_ids.unsqueeze(0).to(device=model_device)'
      ]],
      ['C', 1, 'embeddings = embedding_layer(input_ids)', '[1, T] 정수 인덱스 텐서를 임베딩 레이어에 전달하여 각 토큰을 D차원 벡터로 변환한 [1, T, D] 임베딩 텐서를 얻습니다.', [
        'embeddings = embedding_layer.forward(input_ids)'
      ]]
    ]
  ),

  '3/LLM': make(
    'LLM',
    '동결 뒤 학습 대상 설정',
    'Finetuning Classification',
    'backbone을 동결하고 새 classifier만 학습하려 합니다. 모든 parameter를 동결한 뒤 model.out_head만 다시 학습 가능하게 만드세요. for문은 제공되어 있습니다.',
    `for param in model.parameters():\n    {{A}}\nfor param in model.out_head.parameters():\n    {{B}}\noptimizer = torch.optim.AdamW(\n    filter(lambda p: p.requires_grad, model.parameters()), lr=learning_rate\n)`,
    [
      ['A', 2, 'param.requires_grad = False', '사전학습된 모델의 모든 파라미터에 대해 requires_grad를 False로 설정하여 백본을 동결하고 gradient 계산 대상에서 제외합니다.', [
        'param.requires_grad_(False)'
      ]],
      ['B', 3, 'param.requires_grad = True', '새로 부착한 분류 헤드(model.out_head)의 파라미터에 대해서만 requires_grad를 True로 복원하여 해당 계층만 미세조정(fine-tuning)되도록 활성화합니다.', [
        'param.requires_grad_(True)'
      ]]
    ]
  ),

  '4/LLM': make(
    'LLM',
    '생성 문맥 길이 제한',
    'Autoregressive Generation',
    'idx [B,T]가 context_size보다 길어질 수 있습니다. 모델에는 마지막 context_size개 토큰만 전달하고 model 출력에서 마지막 시점 vocabulary logits를 선택하세요.',
    `with torch.no_grad():\n    {{A}}\n    logits = model(idx_cond)\n    {{B}}\n# logits [B,V]를 다음 token 선택에 사용`,
    [
      ['A', 2, 'idx_cond = idx[:, -context_size:]', '토큰 시퀀스 [B, T]가 사전 훈련된 위치 임베딩 크기(context_size)를 초과하지 않도록 가장 최근의 마지막 context_size개 토큰만 슬라이싱하여 조건부 입력으로 사용합니다.', [
        'idx_cond = idx[:, -context_size:, ...]'
      ]],
      ['B', 3, 'logits = logits[:, -1, :]', '모델의 3차원 출력 로짓 [B, T, V]에서 가장 마지막 타임스텝(-1)의 어휘 로짓 [B, V]을 선택하여 다음 토큰 예측 확률 분포를 산출합니다.', [
        'logits = logits[:, -1]', 'logits = logits[:, -1, :].squeeze(1)'
      ]]
    ]
  ),

  '5/LLM': make(
    'LLM',
    '평가 시 padding loss 제외',
    'Instruction Finetuning',
    'logits [B,T,V], targets [B,T]입니다. targets의 padding은 -100으로 표시돼 있습니다. nn.functional.cross_entropy로 토큰별 분류 loss를 계산하되 ignore_index=-100을 명시하세요.',
    `# 모델 forward는 이미 완료됨\nflat_logits = {{A}}\nflat_targets = {{B}}\nloss = {{C}}`,
    [
      ['A', 1, 'logits.flatten(0, 1)', '3차원 로짓 [B, T, V]의 배치와 시퀀스 축을 병합하여 CrossEntropyLoss 입력 형식인 [B*T, V] 형태로 평탄화합니다.', [
        'logits.reshape(-1, logits.shape[-1])', 'logits.view(-1, logits.shape[-1])', 'logits.view(-1, logits.size(-1))'
      ]],
      ['B', 1, 'targets.flatten()', '2차원 정답 라벨 [B, T]를 1차원 [B*T] 텐서로 변환하여 로짓 샘플과 1:1 대응시킵니다.', [
        'targets.reshape(-1)', 'targets.view(-1)'
      ]],
      ['C', 3, 'nn.functional.cross_entropy(flat_logits, flat_targets, ignore_index=-100)', '프롬프트 및 패딩 토큰 위치(-100)를 손실 및 역전파 계산에서 무시(ignore_index=-100)하여 유효한 응답 토큰에 대해서만 교차 엔트로피 손실을 계산합니다.', [
        'F.cross_entropy(flat_logits, flat_targets, ignore_index=-100)', 'torch.nn.functional.cross_entropy(flat_logits, flat_targets, ignore_index=-100)'
      ]]
    ]
  ),

  '2/On-device AI': make(
    'On-device AI',
    'Conv 재양자화 broadcast 준비',
    'Quantization for CNN',
    'output [B,OC,H,W]와 weight_scale [OC,1,1,1]이 주어집니다. output에 channel별 scale을 곱하기 위한 shape로 바꾸고 output을 float로 변환하세요. 그 뒤 제공된 재양자화 식이 실행됩니다.',
    `{{A}}\n{{B}}\noutput = output * (input_scale * weight_scale / output_scale)\noutput = output + output_zero_point`,
    [
      ['A', 3, 'weight_scale = weight_scale.flatten().view(1, -1, 1, 1)', '출력 텐서 [B, OC, H, W]와의 브로드캐스팅 연산을 위해 각 출력 채널별 가중치 스케일을 [1, OC, 1, 1] 텐서로 재배열합니다.', [
        'weight_scale = weight_scale.view(1, -1, 1, 1)', 'weight_scale = weight_scale.reshape(1, -1, 1, 1)', 'weight_scale = weight_scale.flatten().reshape(1, -1, 1, 1)'
      ]],
      ['B', 2, 'output = output.float()', '정수 누적기(int32 accumulator) 출력을 부동소수점 실수 스케일 연산을 위해 float32 텐서로 변환합니다.', [
        'output = output.to(torch.float)', 'output = output.type(torch.float)'
      ]]
    ]
  ),

  '3/On-device AI': make(
    'On-device AI',
    'Pruning 후 fine-tuning 유지',
    'Pruning for CNN',
    'optimizer 갱신 직후 기존 mask를 다시 적용하려 합니다. param 이름이 self.masks에 있을 때만 in-place 곱하세요. 새로운 mask를 계산하지 마세요.',
    `@torch.no_grad()\ndef apply(self, model):\n    for name, param in model.named_parameters():\n        {{A}}\n            {{B}}`,
    [
      ['A', 2, 'if name in self.masks:', '파라미터 이름(name)이 미리 계산된 가지치기 마스크 딕셔너리(self.masks)에 등록되어 있는지 검사합니다.', [
        'if name in self.masks.keys():'
      ]],
      ['B', 3, 'param.mul_(self.masks[name])', 'optimizer 가중치 갱신 후 다시 0이 아니게 된 위치를 기존 이진 마스크와 in-place 곱하여 지속적으로 0으로 유지합니다.', [
        'param.data.mul_(self.masks[name])', 'param *= self.masks[name]'
      ]]
    ]
  ),

  '4/On-device AI': make(
    'On-device AI',
    'Teacher·Student 학습 설정',
    'Knowledge Distillation',
    'Teacher는 평가 모드, Student는 학습 모드로 설정하세요. optim.Adam에 Student parameter만 전달해 optimizer를 만드세요. learning_rate는 주어져 있습니다.',
    `{{A}}\n{{B}}\n{{C}}\n# batch loop 안에서 Teacher forward는 별도로 no_grad 처리합니다.`,
    [
      ['A', 1, 'teacher.eval()', '교사 모델을 평가 모드로 전환하여 드롭아웃 및 배치 정규화 이동 통계를 동결합니다.', []],
      ['B', 1, 'student.train()', '지식을 전수받을 학생 모델을 학습 모드로 설정합니다.', []],
      ['C', 3, 'optimizer = optim.Adam(student.parameters(), lr=learning_rate)', '교사 모델 가중치는 고정하고 오직 학생 모델 파라미터(student.parameters())만을 최적화 대상에 등록합니다.', [
        'optimizer = torch.optim.Adam(student.parameters(), lr=learning_rate)', 'optimizer = optim.Adam(params=student.parameters(), lr=learning_rate)'
      ]]
    ]
  ),

  '5/On-device AI': make(
    'On-device AI',
    'Calibration 통계 마무리',
    'Pruning for LLM',
    'input_dict에는 채널별 평균 제곱 activation norm이 누적되어 있고 hooks는 등록한 forward hook handle 목록입니다. sqrt_로 norm으로 바꾸고 모든 hook을 remove한 뒤 통계를 반환하세요.',
    `for key in input_dict.keys():\n    {{A}}\nfor hook in hooks:\n    {{B}}\nreturn input_dict`,
    [
      ['A', 3, 'input_dict[key].sqrt_()', '누적된 제곱 평균 활성화 텐서에 in-place 제곱근(sqrt_)을 적용하여 실제 L2 노름 크기로 변환합니다.', [
        'input_dict[key] = input_dict[key].sqrt()', 'input_dict[key] = torch.sqrt(input_dict[key])'
      ]],
      ['B', 2, 'hook.remove()', '캘리브레이션 완료 후 등록되었던 순전파 훅(forward hook handle)을 해제하여 메모리 누수와 불필요한 연산 오버헤드를 방지합니다.', []]
    ]
  )
};
