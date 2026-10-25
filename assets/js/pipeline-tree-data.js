/**
 * AI Specialist Pipeline Tree Data Repository
 * Stores full hierarchical tree structures, sub-steps, tensor shapes, and raw ASCII diagrams.
 */
window.PIPELINE_TREE_DATA = {
  llm: {
    subject: "01 · LLM",
    title: "과목 1. LLM · 전 챕터(Ch 1~7) 종합 통합 파이프라인 트리",
    desc: "학습 루프 및 생성 지점부터 QKV 어텐션, 백본, 데이터셋, LoRA, DPO까지 모든 함수/클래스를 계층적으로 접고 펼칠 수 있습니다.",
    root: {
      title: "[최종 목표: 학습 루프 / 텍스트 생성 / 하류 정렬 태스크 실행]",
      methods: "train_model_simple(...) / generate(...) / compute_dpo_loss(...)"
    },
    ascii: "========================================================================================================================\n[최종 목표: 학습 루프 / 텍스트 생성 / 하류 정렬 태스크 실행]\n- train_model_simple(...) / generate(...) / compute_dpo_loss(...)\n========================================================================================================================\n │\n ├── 🎯 [Branch A: 사전학습 손실 계산 및 평가 함수군 (Ch 5)]\n │    │\n │    ├── train_model_simple(model, train_loader, val_loader, optimizer, device, num_epochs, ...)\n │    │    ├─ model.train()\n │    │    ├─ optimizer.zero_grad()\n │    │    ├─ loss = calc_loss_batch(input_batch, target_batch, model, device)\n │    │    ├─ loss.backward()\n │    │    └─ optimizer.step()\n │    │\n │    ├── calc_loss_batch(input_batch, target_batch, model, device)\n │    │    ├─ [Input] input_batch: [B, T], target_batch: [B, T]\n │    │    ├─ logits = model(input_batch)                                               # [B, T, V]\n │    │    └─ loss = F.cross_entropy(logits.flatten(0, 1), target_batch.flatten())      # logits: [B*T, V], targets: [B*T]\n │    │\n │    ├── calc_loss_loader(data_loader, model, device, num_batches=None)\n │    │    └─ total_loss += calc_loss_batch(input_batch, target_batch, model, device)\n │    │\n │    └── evaluate_model(model, train_loader, val_loader, device, eval_iter)\n │         ├─ model.eval() & with torch.no_grad():\n │         ├─ train_loss = calc_loss_loader(train_loader, model, device, num_batches=eval_iter)\n │         └─ val_loss   = calc_loss_loader(val_loader, model, device, num_batches=eval_iter)\n │\n ├── 🔤 [Branch B: 자기회귀 텍스트 생성 루프 (Ch 4 & Ch 5)]\n │    │\n │    ├── generate_text_simple(model, idx, max_new_tokens, context_size)                 # Greedy Decoding\n │    │    ├─ [Loop for _ in range(max_new_tokens)]\n │    │    ├─ idx_cond = idx[:, -context_size:]                                         # 문맥 길이 초과 방지 슬라이싱\n │    │    ├─ with torch.no_grad(): logits = model(idx_cond)                            # [B, T_curr, V]\n │    │    ├─ logits = logits[:, -1, :]                                                 # [B, V] ★마지막 토큰 로짓\n │    │    ├─ idx_next = torch.argmax(logits, dim=-1, keepdim=True)                     # [B, 1] 그리디 선택\n │    │    └─ idx = torch.cat((idx, idx_next), dim=1)                                   # [B, T_curr + 1] 토큰 연쇄 병합\n │    │\n │    └── generate(model, idx, max_new_tokens, context_size, temperature, top_k, eos_id) # 고급 샘플링\n │         ├─ logits = logits[:, -1, :] / temperature                                   # 온도 스케일링 (T > 0)\n │         ├─ top_logits, _ = torch.topk(logits, top_k)                                 # Top-k 필터링\n │         ├─ logits[logits < top_logits[:, -1:]] = -torch.inf                          # 임계값 미만 차단\n │         ├─ probs = torch.softmax(logits, dim=-1)                                     # [B, V] 확률 분포 변환\n │         └─ idx_next = torch.multinomial(probs, num_samples=1)                        # 확률적 다항 샘플링\n │\n ├── 🤖 [Branch C: GPTModel 백본 신경망 (Ch 4)]\n │    │\n │    └── GPTModel.forward(in_idx)                                                      # [Input] in_idx: [B, T] (정수 토큰)\n │         │\n │         ├── 1. logits = self.out_head(x)                                             # [Output] [B, T, vocab_size]\n │         │    └─ self.out_head = nn.Linear(cfg[\"emb_dim\"], cfg[\"vocab_size\"], bias=False)\n │         │\n │         ├── 2. x = self.final_norm(x)                                                # [B, T, D] 최종 정규화\n │         │    └─ LayerNorm.forward(x): norm_x = (x - mean) / sqrt(var + eps) * scale + shift\n │         │\n │         ├── 3. x = self.trf_blocks(x)                                                # Sequential(TransformerBlock × n_layers)\n │         │    │\n │         │    └── TransformerBlock.forward(x)                                         # [B, T, D] ➔ [B, T, D]\n │         │         │\n │         │         ├── [Sub-block 2: Pre-LayerNorm & FeedForward]\n │         │         │    x = x + self.drop_shortcut(self.ff(self.norm2(x)))            # Residual Add 2\n │         │         │    ├─ self.norm2 = LayerNorm(cfg[\"emb_dim\"])\n │         │         │    ├─ self.drop_shortcut = nn.Dropout(cfg[\"drop_rate\"])\n │         │         │    └─ FeedForward.forward(x)\n │         │         │         ├─ self.layers = nn.Sequential(\n │         │         │         │      nn.Linear(cfg[\"emb_dim\"], 4 * cfg[\"emb_dim\"]),    # [B, T, D] ➔ [B, T, 4D]\n │         │         │         │      GELU(),                                           # 비선형 근사 활성화\n │         │         │         │      nn.Linear(4 * cfg[\"emb_dim\"], cfg[\"emb_dim\"])     # [B, T, 4D] ➔ [B, T, D]\n │         │         │         │  )\n │         │         │         └─ GELU.forward(x): 0.5 * x * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))\n │         │         │\n │         │         └── [Sub-block 1: Pre-LayerNorm & MultiHeadAttention]\n │         │              x = x + self.drop_shortcut(self.att(self.norm1(x)))           # Residual Add 1\n │         │              ├─ self.norm1 = LayerNorm(cfg[\"emb_dim\"])\n │         │              └─ MultiHeadAttention.forward(x)                              # (Ch 3 핵심 구현)\n │         │                   │\n │         │                   ├─ [헤드 차원 분할 및 전치] (b, num_tokens, _) = x.shape\n │         │                   │   ├─ keys = self.W_key(x).view(b, T, num_heads, head_dim).transpose(1, 2)       # [B, H, T, Dh]\n │         │                   │   ├─ queries = self.W_query(x).view(b, T, num_heads, head_dim).transpose(1, 2)   # [B, H, T, Dh]\n │         │                   │   └─ values = self.W_value(x).view(b, T, num_heads, head_dim).transpose(1, 2)   # [B, H, T, Dh]\n │         │                   │\n │         │                   ├─ [Scaled Dot-Product & Causal Masking]\n │         │                   │   ├─ attn_scores = queries @ keys.transpose(2, 3)                                # [B, H, T, T]\n │         │                   │   ├─ mask_bool = self.mask.bool()[:num_tokens, :num_tokens]                     # 상삼각 마스크\n │         │                   │   ├─ attn_scores.masked_fill_(mask_bool, -torch.inf)                            # 미래 정보 차단\n │         │                   │   └─ attn_weights = torch.softmax(attn_scores / (keys.shape[-1]**0.5), dim=-1) # 가중치 정규화\n │         │                   │\n │         │                   └─ [문맥 벡터 합성 및 차원 복원]\n │         │                       ├─ context_vec = (self.dropout(attn_weights) @ values).transpose(1, 2)        # [B, T, H, Dh]\n │         │                       ├─ context_vec = context_vec.contiguous().view(b, num_tokens, self.d_out)     # [B, T, D]\n │         │                       └─ return self.out_proj(context_vec)                                          # Linear(D, D)\n │         │\n │         └── 4. x = self.drop_emb(tok_embeds + pos_embeds)                             # [B, T, D] 입력 임베딩 결합\n │              ├─ tok_embeds = self.tok_emb(in_idx)                                    # nn.Embedding(vocab_size, emb_dim)\n │              ├─ pos_embeds = self.pos_emb(torch.arange(seq_len, device=device))      # nn.Embedding(context_length, emb_dim)\n │              └─ self.drop_emb = nn.Dropout(cfg[\"drop_rate\"])\n │\n ├── 📦 [Branch D: 데이터셋 및 입력 토크나이저 파이프라인 (Ch 1 & Ch 2)]\n │    │\n │    ├── create_dataloader_v1(txt, batch_size, max_length, stride, shuffle, drop_last)\n │    │    ├─ tokenizer = tiktoken.get_encoding(\"gpt2\")\n │    │    ├─ dataset = GPTDatasetV1(txt, tokenizer, max_length, stride)\n │    │    │    ├─ [슬라이딩 윈도우 분할]\n │    │    │    │   ├─ input_chunk  = token_ids[i : i + max_length]                      # [T]\n │    │    │    │   └─ target_chunk = token_ids[i + 1 : i + max_length + 1]              # [T] (우측 1칸 시프트)\n │    │    │    ├─ __len__(): (len(token_ids) - max_length) // stride\n │    │    │    └─ __getitem__(idx): return (torch.tensor(input), torch.tensor(target))\n │    │    └─ return DataLoader(dataset, batch_size=batch_size, drop_last=drop_last)\n │    │\n │    └── [Ch 1 벡터 공간 기초 연산]\n │         ├─ cos_sim(u, v) = torch.dot(u, v) / (torch.norm(u, p=2) * torch.norm(v, p=2))\n │         └─ Gensim Word2Vec: model.most_similar(positive=[...], topn=5) / model.doesnt_match(words)\n │\n ├── 🏷️ [Branch E: 분류 파인튜닝 & LoRA 어댑터 (Ch 6)]\n │    │\n │    ├── [분류 헤드 교체 및 선택적 레이어 동결]\n │    │    ├─ model.out_head = nn.Linear(cfg[\"emb_dim\"], num_classes)                   # Vocab Head ➔ Class Head 교체\n │    │    ├─ for p in model.parameters(): p.requires_grad = False                      # 전체 파라미터 Freeze\n │    │    └─ for p in [model.trf_blocks[-1], model.final_norm, model.out_head]:        # 마지막 1개 블록 + 헤드 Unfreeze\n │    │         for param in p.parameters(): param.requires_grad = True\n │    │\n │    ├── LinearWithLoRA.forward(x)                                                     # [B, T, in_features] ➔ [B, T, out_features]\n │    │    ├─ base_out = self.linear(x)                                                 # 기존 동결된 선형 변환 (grad=False)\n │    │    ├─ lora_out = self.lora(x)                                                   # 저순위 적응 출력 가산\n │    │    │    └── LoRALayer.forward(x)\n │    │    │         ├─ self.A = Parameter(empty(in_dim, r)) -> kaiming_uniform_(A, a=sqrt(5))\n │    │    │         ├─ self.B = Parameter(zeros(r, out_dim))                           # 초기 Delta W = 0 보장\n │    │    │         └─ return (x @ self.A @ self.B) * (self.alpha / self.rank)         # 저순위 행렬 곱 및 스케일링\n │    │    └─ return base_out + lora_out\n │    │\n │    └── replace_linear_with_lora(model, rank, alpha)                                  # 모든 대상 Linear를 LinearWithLoRA로 교체\n │\n └── 🎯 [Branch F: 지시어 미세조정(SFT) & DPO 피드백 정렬 (Ch 7)]\n      │\n      ├── custom_collate_fn(batch, pad_token_id, ignore_index=-100, device)            # 배치 패딩 및 타깃 마스킹\n      │    ├─ batch_max_length = max(len(item)+1 for item in batch)\n      │    ├─ padded = item + [pad_token_id] * (batch_max_length - len(item))\n      │    ├─ inputs  = torch.tensor(padded[:-1])                                       # [T_max]\n      │    ├─ targets = torch.tensor(padded[1:])                                        # [T_max]\n      │    ├─ mask = (targets == pad_token_id)                                          # 패딩 위치 식별\n      │    ├─ targets[mask] = ignore_index                                              # CrossEntropyLoss 무시값(-100) 마스킹\n      │    └─ return torch.stack(inputs_lst).to(device), torch.stack(targets_lst).to(device)\n      │\n      ├── compute_logprobs(logits, labels, selection_mask=None)                         # 토큰별 조건부 로그확률\n      │    ├─ log_probs = F.log_softmax(logits, dim=-1)\n      │    └─ selected = torch.gather(log_probs[:, :-1, :], dim=2, index=labels[:, 1:].unsqueeze(2)).squeeze(2)\n      │\n      └── compute_dpo_loss(model_chosen_logprobs, model_rejected_logprobs, \n                           reference_chosen_logprobs, reference_rejected_logprobs, beta=0.1)\n           ├─ model_logratios = model_chosen_logprobs - model_rejected_logprobs         # 정책 모델 로그확률차\n           ├─ ref_logratios   = reference_chosen_logprobs - reference_rejected_logprobs # 참조 모델 로그확률차\n           ├─ logits = model_logratios - ref_logratios                                  # 마진(Margin)\n           ├─ losses = -F.logsigmoid(beta * logits).mean()                              # ★DPO 핵심 손실식\n           ├─ chosen_rewards   = beta * (model_chosen_logprobs - reference_chosen_logprobs).detach()\n           └─ rejected_rewards = beta * (model_rejected_logprobs - reference_rejected_logprobs).detach()",
    branches: [
      {
        icon: "🎯",
        id: "branch-a",
        title: "Branch A: 사전학습 손실 계산 및 평가 함수군 (Ch 5)",
        meta: "4개 함수 · CrossEntropyLoss",
        nodes: [
          {
            name: "train_model_simple(model, train_loader, val_loader, optimizer, device, num_epochs, ...)",
            kind: "학습루프",
            inShape: "train_loader: [B, T]",
            outShape: "학습 가중치 갱신",
            isExam: true,
            desc: "PyTorch 표준 4단계 최적화 루프. 매 에포크마다 zero_grad() ➔ loss 계산 ➔ backward() ➔ step() 순서로 가중치를 갱신합니다.",
            steps: [
              "model.train()  # 훈련 모드 전환",
              "optimizer.zero_grad()  # 이전 배치 기울기 초기화",
              "loss = calc_loss_batch(input_batch, target_batch, model, device)  # 순전파 및 배치 손실",
              "loss.backward()  # 역전파 기울기 계산",
              "optimizer.step()  # 옵티마이저 가중치 갱신"
            ],
            code: "for epoch in range(num_epochs):\n    model.train()\n    for input_batch, target_batch in train_loader:\n        optimizer.zero_grad()\n        loss = calc_loss_batch(input_batch, target_batch, model, device)\n        loss.backward()\n        optimizer.step()"
          },
          {
            name: "calc_loss_batch(input_batch, target_batch, model, device)",
            kind: "손실계산",
            inShape: "inputs: [B, T], targets: [B, T]",
            outShape: "scalar Loss",
            isExam: true,
            desc: "모델 순전파로 로짓 [B, T, V]을 산출한 뒤, cross_entropy 입력을 위해 로짓을 [B*T, V], 타깃을 [B*T]로 flatten하여 1차원 축소 손실을 계산합니다.",
            steps: [
              "input_batch, target_batch = input_batch.to(device), target_batch.to(device)",
              "logits = model(input_batch)  # [B, T, vocab_size]",
              "loss = F.cross_entropy(logits.flatten(0, 1), target_batch.flatten())  # [B*T, V], [B*T]",
              "return loss"
            ],
            code: "def calc_loss_batch(input_batch, target_batch, model, device):\n    input_batch, target_batch = input_batch.to(device), target_batch.to(device)\n    logits = model(input_batch)\n    loss = torch.nn.functional.cross_entropy(\n        logits.flatten(0, 1), target_batch.flatten()\n    )\n    return loss"
          },
          {
            name: "calc_loss_loader(data_loader, model, device, num_batches=None)",
            kind: "검증함수",
            inShape: "DataLoader",
            outShape: "평균 손실 (scalar)",
            isExam: false,
            desc: "지정된 배치 수(또는 데이터셋 전체) 동안 배치별 손실을 누적하여 평균 손실을 산출합니다.",
            steps: [
              "total_loss = 0",
              "for i, (input_batch, target_batch) in enumerate(data_loader):",
              "    loss = calc_loss_batch(input_batch, target_batch, model, device)",
              "    total_loss += loss.item()",
              "return total_loss / num_batches"
            ],
            code: "def calc_loss_loader(data_loader, model, device, num_batches=None):\n    total_loss = 0.\n    if len(data_loader) == 0: return float('nan')\n    elif num_batches is None: num_batches = len(data_loader)\n    else: num_batches = min(num_batches, len(data_loader))\n    for i, (input_batch, target_batch) in enumerate(data_loader):\n        if i < num_batches:\n            loss = calc_loss_batch(input_batch, target_batch, model, device)\n            total_loss += loss.item()\n        else: break\n    return total_loss / num_batches"
          },
          {
            name: "evaluate_model(model, train_loader, val_loader, device, eval_iter)",
            kind: "평가함수",
            inShape: "Train/Val Loaders",
            outShape: "(train_loss, val_loss)",
            isExam: false,
            desc: "model.eval() 상태 및 torch.no_grad() 블록 안에서 학습 데이터 및 검증 데이터의 손실을 각각 측정합니다.",
            steps: [
              "model.eval()",
              "with torch.no_grad():",
              "    train_loss = calc_loss_loader(train_loader, model, device, num_batches=eval_iter)",
              "    val_loss = calc_loss_loader(val_loader, model, device, num_batches=eval_iter)",
              "return train_loss, val_loss"
            ],
            code: "def evaluate_model(model, train_loader, val_loader, device, eval_iter):\n    model.eval()\n    with torch.no_grad():\n        train_loss = calc_loss_loader(train_loader, model, device, num_batches=eval_iter)\n        val_loss = calc_loss_loader(val_loader, model, device, num_batches=eval_iter)\n    return train_loss, val_loss"
          }
        ]
      },
      {
        icon: "🔤",
        id: "branch-b",
        title: "Branch B: 자기회귀 텍스트 생성 루프 (Ch 4 & Ch 5)",
        meta: "2개 함수 · Greedy & Temperature Sampling",
        nodes: [
          {
            name: "generate_text_simple(model, idx, max_new_tokens, context_size)",
            kind: "🔥 2026-09 기출",
            inShape: "idx: [B, T]",
            outShape: "idx: [B, T + max_new_tokens]",
            isExam: true,
            desc: "컨텍스트 크기를 초과하지 않도록 마지막 context_size 토큰만 모델에 전달하고, 마지막 시점 로짓[:, -1, :]의 argmax를 추출하여 자기회귀적으로 이어붙입니다.",
            steps: [
              "idx_cond = idx[:, -context_size:]  # 문맥 길이 초과 방지 슬라이싱",
              "with torch.no_grad(): logits = model(idx_cond)  # [B, T_curr, vocab_size]",
              "logits = logits[:, -1, :]  # [B, vocab_size] ★마지막 토큰 로짓",
              "idx_next = torch.argmax(logits, dim=-1, keepdim=True)  # [B, 1] 그리디 선택",
              "idx = torch.cat((idx, idx_next), dim=1)  # [B, T_curr + 1] 토큰 연쇄 병합"
            ],
            code: "def generate_text_simple(model, idx, max_new_tokens, context_size):\n    for _ in range(max_new_tokens):\n        idx_cond = idx[:, -context_size:]\n        with torch.no_grad():\n            logits = model(idx_cond)\n        logits = logits[:, -1, :]\n        idx_next = torch.argmax(logits, dim=-1, keepdim=True)\n        idx = torch.cat((idx, idx_next), dim=1)\n    return idx"
          },
          {
            name: "generate(model, idx, max_new_tokens, context_size, temperature, top_k, eos_id)",
            kind: "고급샘플링",
            inShape: "idx: [B, T]",
            outShape: "idx: [B, T + N]",
            isExam: false,
            desc: "온도(temperature)로 로짓의 평탄도를 조절하고, Top-K 필터링으로 하위 토큰을 -inf로 차단한 뒤 multinomial 확률 분포 샘플링을 수행합니다.",
            steps: [
              "if temperature > 0.0: logits = logits / temperature",
              "if top_k is not None: top_logits, _ = torch.topk(logits, top_k); logits[logits < top_logits[:, -1:]] = -torch.inf",
              "probs = torch.softmax(logits, dim=-1)",
              "idx_next = torch.multinomial(probs, num_samples=1)"
            ],
            code: "if temperature > 0.0:\n    logits = logits / temperature\nif top_k is not None:\n    top_logits, _ = torch.topk(logits, top_k)\n    logits[logits < top_logits[:, -1:]] = -torch.inf\nprobs = torch.softmax(logits, dim=-1)\nidx_next = torch.multinomial(probs, num_samples=1)"
          }
        ]
      },
      {
        icon: "🤖",
        id: "branch-c",
        title: "Branch C: GPTModel 백본 신경망 (Ch 4 & Ch 3)",
        meta: "5개 클래스/모듈 · Pre-Norm Architecture",
        nodes: [
          {
            name: "GPTModel.forward(in_idx)",
            kind: "메인모델",
            inShape: "in_idx: [B, T]",
            outShape: "logits: [B, T, vocab_size]",
            isExam: true,
            desc: "토큰 임베딩과 위치 임베딩을 합산하고, n_layers개의 TransformerBlock을 순차 통과시킨 뒤 최종 LayerNorm과 선형 출력 헤드를 통해 로짓을 출력합니다.",
            steps: [
              "tok_embeds = self.tok_emb(in_idx)  # [B, T, emb_dim]",
              "pos_embeds = self.pos_emb(torch.arange(seq_len, device=in_idx.device))  # [T, emb_dim]",
              "x = self.drop_emb(tok_embeds + pos_embeds)  # [B, T, emb_dim]",
              "x = self.trf_blocks(x)  # Sequential 통과",
              "x = self.final_norm(x)  # 최종 LayerNorm",
              "logits = self.out_head(x)  # [B, T, vocab_size]"
            ],
            code: "def forward(self, in_idx):\n    batch_size, seq_len = in_idx.shape\n    tok_embeds = self.tok_emb(in_idx)\n    pos_embeds = self.pos_emb(torch.arange(seq_len, device=in_idx.device))\n    x = self.drop_emb(tok_embeds + pos_embeds)\n    x = self.trf_blocks(x)\n    x = self.final_norm(x)\n    logits = self.out_head(x)\n    return logits"
          },
          {
            name: "TransformerBlock.forward(x)",
            kind: "블록모듈",
            inShape: "x: [B, T, emb_dim]",
            outShape: "x: [B, T, emb_dim]",
            isExam: true,
            desc: "Pre-LayerNorm 구조. MultiHeadAttention 잔차 연결(x + attn(norm1(x)))과 FeedForward 잔차 연결(x + ff(norm2(x)))의 2개 서브블록으로 구성됩니다.",
            steps: [
              "# 서브블록 1: Pre-LayerNorm 어텐션 잔차",
              "shortcut = x; x = self.norm1(x); x = self.att(x); x = self.drop_shortcut(x); x = x + shortcut",
              "# 서브블록 2: Pre-LayerNorm 피드포워드 잔차",
              "shortcut = x; x = self.norm2(x); x = self.ff(x); x = self.drop_shortcut(x); x = x + shortcut"
            ],
            code: "def forward(self, x):\n    shortcut = x\n    x = self.norm1(x)\n    x = self.att(x)\n    x = self.drop_shortcut(x)\n    x = x + shortcut\n\n    shortcut = x\n    x = self.norm2(x)\n    x = self.ff(x)\n    x = self.drop_shortcut(x)\n    x = x + shortcut\n    return x"
          },
          {
            name: "MultiHeadAttention.forward(x)",
            kind: "🔥 2026-09 기출",
            inShape: "x: [B, T, d_in]",
            outShape: "context_vec: [B, T, d_out]",
            isExam: true,
            desc: "W_key, W_query, W_value 선형변환 후 [B, T, num_heads, head_dim]으로 view 및 transpose(1, 2)하여 헤드를 분할하고, Q @ K.T에 Causal Mask를 씌워 소프트맥스 정규화 후 V와 곱해 out_proj로 사영합니다.",
            steps: [
              "keys = self.W_key(x).view(b, num_tokens, self.num_heads, self.head_dim).transpose(1, 2)",
              "queries = self.W_query(x).view(b, num_tokens, self.num_heads, self.head_dim).transpose(1, 2)",
              "values = self.W_value(x).view(b, num_tokens, self.num_heads, self.head_dim).transpose(1, 2)",
              "attn_scores = queries @ keys.transpose(2, 3)",
              "mask_bool = self.mask.bool()[:num_tokens, :num_tokens]",
              "attn_scores.masked_fill_(mask_bool, -torch.inf)",
              "attn_weights = torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)",
              "context_vec = (self.dropout(attn_weights) @ values).transpose(1, 2)",
              "context_vec = context_vec.contiguous().view(b, num_tokens, self.d_out)",
              "return self.out_proj(context_vec)"
            ],
            code: "b, num_tokens, _ = x.shape\nkeys = self.W_key(x).view(b, num_tokens, self.num_heads, self.head_dim).transpose(1, 2)\nqueries = self.W_query(x).view(b, num_tokens, self.num_heads, self.head_dim).transpose(1, 2)\nvalues = self.W_value(x).view(b, num_tokens, self.num_heads, self.head_dim).transpose(1, 2)\nattn_scores = queries @ keys.transpose(2, 3)\nmask_bool = self.mask.bool()[:num_tokens, :num_tokens]\nattn_scores.masked_fill_(mask_bool, -torch.inf)\nattn_weights = torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)\ncontext_vec = (self.dropout(attn_weights) @ values).transpose(1, 2).contiguous().view(b, num_tokens, self.d_out)\nreturn self.out_proj(context_vec)"
          },
          {
            name: "FeedForward.forward(x)",
            kind: "FFN블록",
            inShape: "[B, T, emb_dim]",
            outShape: "[B, T, emb_dim]",
            isExam: false,
            desc: "Linear(emb_dim, 4*emb_dim)으로 확장한 후 GELU 비선형 활성화를 거쳐 원래 차원으로 복원합니다.",
            steps: [
              "Linear(emb_dim, 4 * emb_dim) ➔ GELU() ➔ Linear(4 * emb_dim, emb_dim)"
            ],
            code: "class FeedForward(nn.Module):\n    def __init__(self, cfg):\n        super().__init__()\n        self.layers = nn.Sequential(\n            nn.Linear(cfg['emb_dim'], 4 * cfg['emb_dim']),\n            GELU(),\n            nn.Linear(4 * cfg['emb_dim'], cfg['emb_dim']),\n        )\n    def forward(self, x): return self.layers(x)"
          },
          {
            name: "LayerNorm.forward(x)",
            kind: "정규화",
            inShape: "[B, T, emb_dim]",
            outShape: "[B, T, emb_dim]",
            isExam: false,
            desc: "마지막 차원(dim=-1) 기준 평균과 분산(unbiased=False)을 구하고 epsilon 보정 후 scale과 shift를 적용합니다.",
            steps: [
              "mean = x.mean(dim=-1, keepdim=True)",
              "var = x.var(dim=-1, keepdim=True, unbiased=False)",
              "norm_x = (x - mean) / torch.sqrt(var + self.eps)",
              "return self.scale * norm_x + self.shift"
            ],
            code: "class LayerNorm(nn.Module):\n    def __init__(self, emb_dim):\n        super().__init__()\n        self.eps = 1e-5\n        self.scale = nn.Parameter(torch.ones(emb_dim))\n        self.shift = nn.Parameter(torch.zeros(emb_dim))\n    def forward(self, x):\n        mean = x.mean(dim=-1, keepdim=True)\n        var = x.var(dim=-1, keepdim=True, unbiased=False)\n        norm_x = (x - mean) / torch.sqrt(var + self.eps)\n        return self.scale * norm_x + self.shift"
          }
        ]
      },
      {
        icon: "📦",
        id: "branch-d",
        title: "Branch D: 데이터셋 및 입력 토크나이저 파이프라인 (Ch 1 & Ch 2)",
        meta: "3개 컴포넌트 · Dataset & Vector Space",
        nodes: [
          {
            name: "GPTDatasetV1.__init__(txt, tokenizer, max_length, stride)",
            kind: "데이터셋",
            inShape: "Raw Text string",
            outShape: "input [T], target [T]",
            isExam: true,
            desc: "원문 텍스트를 BPE 인코딩한 뒤, max_length 윈도우로 stride 간격마다 슬라이싱하여 (input, target) 쌍을 생성합니다.",
            steps: [
              "token_ids = tokenizer.encode(txt, allowed_special=<|endoftext|>)",
              "for i in range(0, len(token_ids) - max_length, stride):",
              "    input_chunk = token_ids[i : i + max_length]",
              "    target_chunk = token_ids[i + 1 : i + max_length + 1]  # 1칸 우측 시프트",
              "    self.input_ids.append(torch.tensor(input_chunk))",
              "    self.target_ids.append(torch.tensor(target_chunk))"
            ],
            code: "for i in range(0, len(token_ids) - max_length, stride):\n    input_chunk = token_ids[i:i + max_length]\n    target_chunk = token_ids[i + 1: i + max_length + 1]\n    self.input_ids.append(torch.tensor(input_chunk))\n    self.target_ids.append(torch.tensor(target_chunk))"
          },
          {
            name: "create_dataloader_v1(txt, batch_size, max_length, stride, drop_last)",
            kind: "로더생성",
            inShape: "txt",
            outShape: "DataLoader",
            isExam: false,
            desc: "tiktoken 토크나이저를 초기화하고 GPTDatasetV1을 DataLoader로 래핑합니다.",
            steps: [
              "tokenizer = tiktoken.get_encoding('gpt2')",
              "dataset = GPTDatasetV1(txt, tokenizer, max_length, stride)",
              "return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle, drop_last=drop_last)"
            ],
            code: "def create_dataloader_v1(txt, batch_size=4, max_length=256, stride=128, shuffle=True, drop_last=True):\n    tokenizer = tiktoken.get_encoding('gpt2')\n    dataset = GPTDatasetV1(txt, tokenizer, max_length, stride)\n    return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle, drop_last=drop_last)"
          },
          {
            name: "cos_sim(u, v)",
            kind: "벡터공간",
            inShape: "u: [D], v: [D]",
            outShape: "scalar [-1, 1]",
            isExam: false,
            desc: "두 벡터의 내적을 L2 Norm(크기)의 곱으로 나눈 코사인 유사도 수식을 계산합니다.",
            steps: [
              "dot = torch.dot(u, v)",
              "norm_u = torch.norm(u, p=2)",
              "norm_v = torch.norm(v, p=2)",
              "return dot / (norm_u * norm_v)"
            ],
            code: "def cos_sim(u, v):\n    dot = torch.dot(u, v)\n    norm_u = torch.norm(u, p=2)\n    norm_v = torch.norm(v, p=2)\n    return dot / (norm_u * norm_v)"
          }
        ]
      },
      {
        icon: "🏷️",
        id: "branch-e",
        title: "Branch E: 분류 파인튜닝 & LoRA 어댑터 (Ch 6)",
        meta: "3개 구현체 · Low-Rank Adaptation",
        nodes: [
          {
            name: "분류 헤드 교체 및 선택적 레이어 동결 (Freeze Backbone)",
            kind: "파인튜닝",
            inShape: "GPTModel",
            outShape: "분류기 모델",
            isExam: true,
            desc: "기존 out_head를 num_classes 출력의 Linear로 교체하고, 백본 전체를 동결한 뒤 마지막 트랜스포머 블록과 출력 헤드만 학습 가능하도록 설정합니다.",
            steps: [
              "model.out_head = torch.nn.Linear(cfg['emb_dim'], num_classes)",
              "for param in model.parameters(): param.requires_grad = False  # 전체 Freeze",
              "for param in model.trf_blocks[-1].parameters(): param.requires_grad = True",
              "for param in model.final_norm.parameters(): param.requires_grad = True",
              "for param in model.out_head.parameters(): param.requires_grad = True"
            ],
            code: "model.out_head = torch.nn.Linear(cfg['emb_dim'], num_classes)\nfor param in model.parameters():\n    param.requires_grad = False\nfor param in model.trf_blocks[-1].parameters():\n    param.requires_grad = True\nfor param in model.final_norm.parameters():\n    param.requires_grad = True\nfor param in model.out_head.parameters():\n    param.requires_grad = True"
          },
          {
            name: "LoRALayer.forward(x)",
            kind: "LoRA레이어",
            inShape: "x: [B, T, in_dim]",
            outShape: "lora: [B, T, out_dim]",
            isExam: true,
            desc: "Kaiming 균등 초기화된 A(in_dim, rank)와 0으로 초기화된 B(rank, out_dim)의 행렬 곱에 (alpha / rank)를 스케일링합니다.",
            steps: [
              "self.A = nn.Parameter(torch.empty(in_dim, rank)); nn.init.kaiming_uniform_(self.A, a=5**0.5)",
              "self.B = nn.Parameter(torch.zeros(rank, out_dim))  # 초기 Delta W = 0",
              "lora = (x @ self.A @ self.B) * (self.alpha / self.rank)",
              "return lora"
            ],
            code: "class LoRALayer(nn.Module):\n    def __init__(self, in_dim, out_dim, rank, alpha):\n        super().__init__()\n        self.rank, self.alpha = rank, alpha\n        self.A = nn.Parameter(torch.empty(in_dim, rank))\n        nn.init.kaiming_uniform_(self.A, a=5**0.5)\n        self.B = nn.Parameter(torch.zeros(rank, out_dim))\n    def forward(self, x):\n        return (x @ self.A @ self.B) * (self.alpha / self.rank)"
          },
          {
            name: "LinearWithLoRA.forward(x)",
            kind: "선형어댑터",
            inShape: "[B, T, in_features]",
            outShape: "[B, T, out_features]",
            isExam: false,
            desc: "기존 가중치가 동결된 linear(x)의 출력에 LoRA 저순위 분해 적응 출력을 더합니다.",
            steps: [
              "return self.linear(x) + self.lora(x)"
            ],
            code: "class LinearWithLoRA(nn.Module):\n    def __init__(self, linear, rank, alpha):\n        super().__init__()\n        self.linear = linear\n        self.linear.weight.requires_grad = False\n        self.lora = LoRALayer(linear.in_features, linear.out_features, rank, alpha)\n    def forward(self, x):\n        return self.linear(x) + self.lora(x)"
          }
        ]
      },
      {
        icon: "🎯",
        id: "branch-f",
        title: "Branch F: 지시어 미세조정(SFT) & DPO 피드백 정렬 (Ch 7)",
        meta: "3개 함수 · Instruction Tuning & DPO",
        nodes: [
          {
            name: "custom_collate_fn(batch, pad_token_id, ignore_index=-100, device)",
            kind: "콜레이트",
            inShape: "batch: list[list[int]]",
            outShape: "inputs, targets: [B, T_max]",
            isExam: true,
            desc: "배치 내 최대 길이에 맞춰 EOS/PAD 토큰을 패딩하고, targets에서 패딩 위치를 -100(ignore_index)으로 치환하여 손실 계산에서 제외합니다.",
            steps: [
              "batch_max_length = max(len(item)+1 for item in batch)",
              "padded = item + [pad_token_id] * (batch_max_length - len(item))",
              "inputs = torch.tensor(padded[:-1])",
              "targets = torch.tensor(padded[1:])",
              "mask = targets == pad_token_id",
              "targets[mask] = ignore_index  # -100",
              "return torch.stack(inputs_lst).to(device), torch.stack(targets_lst).to(device)"
            ],
            code: "def custom_collate_fn(batch, pad_token_id=50256, ignore_index=-100, device='cpu'):\n    batch_max_length = max(len(item)+1 for item in batch)\n    inputs_lst, targets_lst = [], []\n    for item in batch:\n        new_item = item.copy() + [pad_token_id]\n        padded = new_item + [pad_token_id] * (batch_max_length - len(new_item))\n        inputs = torch.tensor(padded[:-1])\n        targets = torch.tensor(padded[1:])\n        mask = targets == pad_token_id\n        indices = torch.nonzero(mask).squeeze()\n        if indices.numel() > 1: targets[indices[1:]] = ignore_index\n        inputs_lst.append(inputs); targets_lst.append(targets)\n    return torch.stack(inputs_lst).to(device), torch.stack(targets_lst).to(device)"
          },
          {
            name: "compute_dpo_loss(model_chosen, model_rejected, ref_chosen, ref_rejected, beta=0.1)",
            kind: "DPO손실",
            inShape: "4개 Logprobs: [B]",
            outShape: "scalar Loss",
            isExam: true,
            desc: "선호(chosen)와 비선호(rejected) 응답에 대한 정책 모델과 참조 모델의 로그확률비 차이(Margin)에 대해 -logsigmoid 손실을 계산합니다.",
            steps: [
              "model_logratios = model_chosen_logprobs - model_rejected_logprobs",
              "reference_logratios = reference_chosen_logprobs - reference_rejected_logprobs",
              "logits = model_logratios - reference_logratios",
              "losses = -torch.nn.functional.logsigmoid(beta * logits).mean()",
              "return losses"
            ],
            code: "def compute_dpo_loss(model_chosen_logprobs, model_rejected_logprobs, reference_chosen_logprobs, reference_rejected_logprobs, beta=0.1):\n    model_logratios = model_chosen_logprobs - model_rejected_logprobs\n    reference_logratios = reference_chosen_logprobs - reference_rejected_logprobs\n    logits = model_logratios - reference_logratios\n    losses = -torch.nn.functional.logsigmoid(beta * logits).mean()\n    return losses"
          },
          {
            name: "compute_logprobs(logits, labels, selection_mask=None)",
            kind: "로그확률추출",
            inShape: "logits: [B, T, V]",
            outShape: "[B]",
            isExam: false,
            desc: "로짓에 log_softmax를 취한 뒤 torch.gather로 1칸 시프트된 정답 레이블 위치의 로그확률만 추출하여 합산합니다.",
            steps: [
              "log_probs = F.log_softmax(logits, dim=-1)",
              "selected = torch.gather(log_probs[:, :-1, :], dim=2, index=labels[:, 1:].unsqueeze(2)).squeeze(2)",
              "return selected.sum(dim=-1)"
            ],
            code: "def compute_logprobs(logits, labels):\n    log_probs = torch.nn.functional.log_softmax(logits, dim=-1)\n    selected = torch.gather(log_probs[:, :-1, :], dim=2, index=labels[:, 1:].unsqueeze(2)).squeeze(2)\n    return selected.sum(dim=-1)"
          }
        ]
      }
    ]
  }
,
  rag: {
  "subject": "02 · RAG",
  "title": "과목 2. RAG · 검색 증강 생성 종합 통합 파이프라인 트리",
  "desc": "Document 로딩, 청킹, VectorStoreIndex, 하이브리드 RRF, Cross-Encoder 리랭킹, CRAG 평가, FastMCP 연동까지 전체 흐름을 확인하세요.",
  "root": {
    "title": "[최종 결과물: 사용자 질문에 대한 정확한 근거 기반 응답]",
    "methods": "response = query_engine.query(query_str) 또는 mcp_agent.run(task)"
  },
  "ascii": "========================================================================================================\n[최종 결과물: 사용자 질문에 대한 정확한 근거 기반 응답]\nresponse = query_engine.query(query_str)  또는  mcp_agent.run(task)\n========================================================================================================\n │\n ├── [Step 4: 생성 및 도구 연동 (Generation & MCP Tools)]\n │    ├── response = llm.predict(prompt_template.format(context_str, query_str))\n │    └── tool_result = await session.call_tool(\"tool_name\", arguments={...}) # FastMCP 클라이언트 호출\n │\n ├── [Step 3: 검색 품질 보정 (CRAG & Reranking)]\n │    ├── eval_score = FaithfulnessEvaluator.evaluate_response(response=response)\n │    ├── eval_score = RelevancyEvaluator.evaluate(query=query_str, response=response)\n │    └── reranked_nodes = SentenceTransformerRerank(top_n=3).postprocess_nodes(nodes, query_bundle)\n │\n ├── [Step 2: 하이브리드 검색 (Hybrid Retrieval)]\n │    └── candidate_nodes = QueryFusionRetriever(retrievers=[dense, sparse], mode=\"reciprocal_rerank\")\n │         ├── dense_retriever = index.as_retriever(similarity_top_k=10)\n │         └── sparse_retriever = BM25Retriever.from_defaults(nodes=nodes, similarity_top_k=10)\n │\n └── [Step 1: 색인 및 청킹 (Indexing & Ingestion)]\n      ├── index = VectorStoreIndex(nodes=nodes, embed_model=embed_model)\n      ├── nodes = SentenceSplitter(chunk_size=512, chunk_overlap=50).get_nodes_from_documents(documents)\n      └── documents = SimpleDirectoryReader(\"./data\").load_data()",
  "branches": [
    {
      "icon": "📥",
      "id": "rag-step-1",
      "title": "Step 1: 데이터 수집 및 청킹 (Ingestion & Chunking)",
      "meta": "2개 컴포넌트",
      "nodes": [
        {
          "name": "SimpleDirectoryReader(input_dir).load_data()",
          "kind": "문서로드",
          "inShape": "파일 경로",
          "outShape": "list[Document]",
          "isExam": true,
          "desc": "디렉터리 내의 텍스트/문서 파일을 LlamaIndex Document 객체로 적재합니다.",
          "steps": [
            "documents = SimpleDirectoryReader(input_dir='./data').load_data()"
          ],
          "code": "from llama_index.core import SimpleDirectoryReader\ndocuments = SimpleDirectoryReader(input_dir='./data').load_data()"
        },
        {
          "name": "SentenceSplitter(chunk_size=512, chunk_overlap=50)",
          "kind": "청크분할",
          "inShape": "list[Document]",
          "outShape": "list[BaseNode]",
          "isExam": true,
          "desc": "문맥 보존을 위해 문장 경계를 존중하며 512 토큰 단위(오버랩 50)로 청크를 분할합니다.",
          "steps": [
            "splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)",
            "nodes = splitter.get_nodes_from_documents(documents)"
          ],
          "code": "from llama_index.core.node_parser import SentenceSplitter\nsplitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)\nnodes = splitter.get_nodes_from_documents(documents)"
        }
      ]
    },
    {
      "icon": "🔍",
      "id": "rag-step-2",
      "title": "Step 2: 인덱싱 및 하이브리드 검색 (Indexing & Hybrid Retrieval)",
      "meta": "3개 컴포넌트 · Dense + Sparse RRF",
      "nodes": [
        {
          "name": "VectorStoreIndex.from_documents(documents)",
          "kind": "🔥 2026-09 기출",
          "inShape": "list[Document] / list[BaseNode]",
          "outShape": "VectorStoreIndex",
          "isExam": true,
          "desc": "임베딩 모델을 사용하여 텍스트 노드를 고차원 벡터 공간에 색인합니다.",
          "steps": [
            "index = VectorStoreIndex.from_documents(documents)"
          ],
          "code": "from llama_index.core import VectorStoreIndex\nindex = VectorStoreIndex.from_documents(documents)"
        },
        {
          "name": "QueryFusionRetriever(retrievers=[dense, sparse], mode='reciprocal_rerank')",
          "kind": "하이브리드검색",
          "inShape": "QueryBundle",
          "outShape": "list[NodeWithScore]",
          "isExam": true,
          "desc": "Dense(VectorStoreIndex)와 Sparse(BM25Retriever)를 RRF(Reciprocal Rank Fusion)로 종합하여 순위를 매깁니다.",
          "steps": [
            "dense_retriever = index.as_retriever(similarity_top_k=10)",
            "sparse_retriever = BM25Retriever.from_defaults(nodes=nodes, similarity_top_k=10)",
            "retriever = QueryFusionRetriever(retrievers=[dense_retriever, sparse_retriever], mode='reciprocal_rerank')"
          ],
          "code": "from llama_index.core.retrievers import QueryFusionRetriever\nfrom llama_index.retrievers.bm25 import BM25Retriever\n\nretriever = QueryFusionRetriever(\n    retrievers=[index.as_retriever(similarity_top_k=10), BM25Retriever.from_defaults(nodes=nodes, similarity_top_k=10)],\n    similarity_top_k=5,\n    mode='reciprocal_rerank'\n)"
        },
        {
          "name": "SentenceTransformerRerank(top_n=3, model='cross-encoder/ms-marco-MiniLM-L-6-v2')",
          "kind": "Cross-Encoder",
          "inShape": "list[NodeWithScore]",
          "outShape": "상위 3개 재정렬 노드",
          "isExam": false,
          "desc": "Cross-Encoder를 통해 질문과 문맥의 상호관계를 정밀 채점하여 재정렬합니다.",
          "steps": [
            "reranker = SentenceTransformerRerank(top_n=3, model='cross-encoder/ms-marco-MiniLM-L-6-v2')",
            "final_nodes = reranker.postprocess_nodes(nodes, query_bundle)"
          ],
          "code": "from llama_index.core.postprocessor import SentenceTransformerRerank\nreranker = SentenceTransformerRerank(top_n=3, model='cross-encoder/ms-marco-MiniLM-L-6-v2')\nfinal_nodes = reranker.postprocess_nodes(candidate_nodes, query_bundle)"
        }
      ]
    },
    {
      "icon": "⚖️",
      "id": "rag-step-3",
      "title": "Step 3: CRAG 평가 & MCP 에이전트 도구 연동 (Evaluation & Agent)",
      "meta": "3개 컴포넌트",
      "nodes": [
        {
          "name": "RelevancyEvaluator & FaithfulnessEvaluator",
          "kind": "CRAG평가",
          "inShape": "Query & Response",
          "outShape": "Score / Passing",
          "isExam": true,
          "desc": "관련성(Relevancy)과 충실성(Faithfulness, 환각 방지) 평가 후 임계값 미달 시 웹/폴백 검색을 트리거합니다.",
          "steps": [
            "rel_eval = RelevancyEvaluator().evaluate(query=q, response=res)",
            "faith_eval = FaithfulnessEvaluator().evaluate_response(response=res)"
          ],
          "code": "from llama_index.core.evaluation import RelevancyEvaluator, FaithfulnessEvaluator\nrel_eval = RelevancyEvaluator().evaluate(query=query_str, response=response)\nfaith_eval = FaithfulnessEvaluator().evaluate_response(response=response)"
        },
        {
          "name": "prompt_generator(query, top_k_chunks)",
          "kind": "🔥 2026-09 기출",
          "inShape": "query, top_k_chunks",
          "outShape": "str (Prompt)",
          "isExam": true,
          "desc": "검색된 상위 K개 청크의 텍스트를 참조 포맷으로 결합하여 프롬프트를 완성합니다.",
          "steps": [
            "references = ''",
            "for chunk_id, chunk in enumerate(top_k_chunks):",
            "    references += f'Reference [{chunk_id + 1}](Citation: {chunk.metadata[\"source\"]})\\n'",
            "references = references[:MAX_CONTEXT_REFERENCES_LENGTH]"
          ],
          "code": "references = ''\\nfor chunk_id, chunk in enumerate(top_k_chunks):\\n    references += f'Reference [{chunk_id + 1}](Citation: {chunk.metadata[\"source\"]})\\n'\\nreferences = references[:MAX_CONTEXT_REFERENCES_LENGTH]"
        },
        {
          "name": "FastMCP & ClientSession.call_tool(tool_name, arguments)",
          "kind": "MCP도구호출",
          "inShape": "tool arguments",
          "outShape": "Tool Result",
          "isExam": false,
          "desc": "표준 MCP 프로토콜을 통해 외부 데이터베이스 및 계산 도구를 안전하게 호출합니다.",
          "steps": [
            "async with client_session as session:",
            "    result = await session.call_tool('fetch_weather', {'location': 'Seoul'})"
          ],
          "code": "from mcp import ClientSession\\nasync with client_session as session:\\n    result = await session.call_tool('fetch_info', {'query': query_str})"
        }
      ]
    }
  ]
},
  data: {
  "subject": "03 · DATA",
  "title": "과목 3. Data Model · 시계열 & 추천시스템 종합 통합 파이프라인 트리",
  "desc": "MinMaxScaler, Sliding Window, Conv1D, LSTM, Seq2Seq 인코더-디코더, NGCF, NCF, BPR Loss까지 확인하세요.",
  "root": {
    "title": "[최종 산출물: 시계열 예측 MSE / 추천 랭킹 BPR Loss]",
    "methods": "TS Loss = MSELoss(preds, targets) / RecSys Loss = -logsigmoid(y_pos - y_neg).mean()"
  },
  "ascii": "========================================================================================================\n[최종 산출물: 시계열 예측 MSE / 추천 랭킹 BPR Loss]\nTS Loss = MSELoss(preds, targets)  /  RecSys Loss = -logsigmoid(y_pos - y_neg).mean()\n========================================================================================================\n │\n ├── 📈 [Part 1. 시계열 예측 (Time Series Forecasting)]\n │    ├── [Seq2Seq RNN 인코더-디코더]:\n │    │    ├── outputs = torch.stack(outputs, dim=1)                    # [B, T_tgt, F]\n │    │    │    └── for t in range(tgt_len): dec_out, h = decoder(dec_in, h)\n │    │    └── dec_in_init = source[:, -1, :].unsqueeze(1) & h_0 = enc_hidden\n │    │         └── _, enc_hidden = encoder(source)                    # [1, B, H]\n │    │\n │    ├── [단일 LSTM / Conv1D 예측]:\n │    │    ├── pred = fc(lstm_out[:, -1, :])                            # [B, 1] ★마지막 타임스텝\n │    │    └── conv_out = relu(conv1d(x.transpose(1, 2)))               # Conv1D는 [B, C, L] 순서!\n │    │\n │    └── [데이터 슬라이딩 윈도우]:\n │         └── X = data[i : i + seq_len],  y = data[i + seq_len : i + seq_len + pred_len]\n │\n └── 🛒 [Part 2. 추천 시스템 (Recommendation System)]\n      ├── [NCF (Neural Collaborative Filtering)]:\n      │    └── y = out_linear(torch.cat([gmf_out, mlp_out], dim=-1))\n      │         ├── gmf_out = emb_u_gmf * emb_i_gmf                     # 원소별 곱 (Hadamard)\n      │         └── mlp_out = mlp_layers(torch.cat([emb_u, emb_i], dim=-1))\n      │\n      └── [NGCF (Neural Graph Collaborative Filtering)]:\n           ├── e_final = torch.cat([E_0, E_1, E_2], dim=1)              # 다중 레이어 임베딩 결합\n           └── E_next = LeakyReLU(norm_adj @ E_curr @ W1 + (E_curr * (norm_adj @ E_curr)) @ W2)\n                └── norm_adj = D^(-1/2) * (A + I) * D^(-1/2)            # 대칭 라플라시안 정규화",
  "branches": [
    {
      "icon": "📈",
      "id": "data-part-1",
      "title": "Part 1: 시계열 단일 예측 (Sliding Window & Conv1D/LSTM)",
      "meta": "3개 컴포넌트",
      "nodes": [
        {
          "name": "create_sequences(data, seq_length)",
          "kind": "슬라이딩윈도우",
          "inShape": "[N, F]",
          "outShape": "X: [B, T, F], y: [B, 1]",
          "isExam": true,
          "desc": "시계열 데이터를 입력 길이만큼 슬라이싱하고 바로 다음 시점을 레이블로 생성합니다.",
          "steps": [
            "for i in range(len(data) - seq_length):",
            "    features.append(data[i : i + seq_length])",
            "    labels.append(data[i + seq_length, 0])"
          ],
          "code": "for i in range(len(data) - seq_length):\\n    features.append(data[i : i + seq_length])\\n    labels.append(data[i + seq_length, 0])\\nreturn np.array(features, dtype=np.float32), np.array(labels, dtype=np.float32)"
        },
        {
          "name": "LSTMModel.forward(x) / Conv1DModel.forward(x)",
          "kind": "시계열백본",
          "inShape": "LSTM: [B, T, F] / Conv1D: [B, F, T]",
          "outShape": "pred: [B, 1]",
          "isExam": true,
          "desc": "LSTM은 마지막 시점[:, -1, :]을 슬라이싱하여 FC 통과 / Conv1D는 채널축 transpose(1, 2)가 필수입니다.",
          "steps": [
            "out, _ = self.lstm(x)",
            "pred = self.fc(out[:, -1, :])"
          ],
          "code": "out, _ = self.lstm(x)\\npred = self.fc(out[:, -1, :])\\nreturn pred"
        },
        {
          "name": "nn.MSELoss()(preds, targets)",
          "kind": "회귀손실",
          "inShape": "preds: [B, 1], targets: [B, 1]",
          "outShape": "scalar MSE",
          "isExam": true,
          "desc": "시계열 연속 예측값과 실제 수치 간의 평균 제곱 오차를 계산합니다.",
          "steps": [
            "loss = criterion(preds, targets)",
            "rmse = torch.sqrt(loss)"
          ],
          "code": "criterion = nn.MSELoss()\\nloss = criterion(preds, targets)\\nrmse = torch.sqrt(loss)"
        }
      ]
    },
    {
      "icon": "🔄",
      "id": "data-part-2",
      "title": "Part 2: 시계열 Seq2Seq (EncoderRNN & DecoderRNN)",
      "meta": "2개 컴포넌트 · Auto-regressive Unrolling",
      "nodes": [
        {
          "name": "create_enc_dec_sequences(data, sequence_length)",
          "kind": "🔥 2026-09 기출",
          "inShape": "[N, F]",
          "outShape": "enc_in, dec_in: [B, T, F]",
          "isExam": true,
          "desc": "인코더 입력 구간과 디코더 타깃 구간으로 윈도우를 슬라이싱합니다.",
          "steps": [
            "features.append(data[i : i + sequence_length])",
            "labels.append(data[i + sequence_length : i + 2 * sequence_length])"
          ],
          "code": "features.append(data[i : i + sequence_length])\\nlabels.append(data[i + sequence_length : i + 2 * sequence_length])\\nreturn np.array(features, dtype=np.float32), np.array(labels, dtype=np.float32)"
        },
        {
          "name": "RNNRNN.forward(source, target, teacher_forcing_ratio)",
          "kind": "🔥 2026-09 기출",
          "inShape": "source: [B, T_src, F]",
          "outShape": "outputs: [B, T_tgt, F]",
          "isExam": true,
          "desc": "인코더 은닉상태 h_n을 디코더 h_0로 전달하고 source 마지막 스텝부터 스텝별 autoregressive 루프를 unroll합니다.",
          "steps": [
            "_, h = self.encoder(source)",
            "input = source[:, -1, :].unsqueeze(1)",
            "outputs = []",
            "for t in range(target_len): out, h = self.decoder(input, h); outputs.append(out); input = out",
            "return torch.stack(outputs, dim=1)"
          ],
          "code": "_, h = self.encoder(source)\\ninput = source[:, -1, :].unsqueeze(1)\\noutputs = []\\nfor t in range(target_len):\\n    out, h = self.decoder(input, h)\\n    outputs.append(out)\\n    input = out\\nreturn torch.stack(outputs, dim=1)"
        }
      ]
    },
    {
      "icon": "🛒",
      "id": "data-part-3",
      "title": "Part 3: 추천 시스템 (NGCF, NCF & BPR Ranking Loss)",
      "meta": "3개 컴포넌트 · Graph & Neural CF",
      "nodes": [
        {
          "name": "NGCF.forward(norm_adj, user_emb, item_emb)",
          "kind": "그래프추천",
          "inShape": "norm_adj, emb",
          "outShape": "final_emb: [N, (L+1)*D]",
          "isExam": true,
          "desc": "라플라시안 정규화 D^(-1/2) A D^(-1/2) 기반 메시지 전달 및 레이어 임베딩 concat",
          "steps": [
            "e_list = [all_emb]",
            "for layer in self.layers: all_emb = layer(norm_adj, all_emb); e_list.append(all_emb)",
            "return torch.cat(e_list, dim=1)"
          ],
          "code": "e_list = [all_emb]\\nfor layer in self.layers:\\n    all_emb = layer(norm_adj, all_emb)\\n    e_list.append(all_emb)\\nreturn torch.cat(e_list, dim=1)"
        },
        {
          "name": "NCF.forward(user_id, item_id)",
          "kind": "신경망추천",
          "inShape": "user_idx, item_idx",
          "outShape": "score: [B, 1]",
          "isExam": true,
          "desc": "GMF 원소별 곱(Hadamard) 브랜치와 MLP 결합(concat) 브랜치를 최종 선형층에서 융합합니다.",
          "steps": [
            "gmf = self.user_emb_gmf(u) * self.item_emb_gmf(i)",
            "mlp = self.mlp(torch.cat([self.user_emb_mlp(u), self.item_emb_mlp(i)], dim=-1))",
            "return self.affine_output(torch.cat([gmf, mlp], dim=-1))"
          ],
          "code": "gmf = self.user_emb_gmf(u) * self.item_emb_gmf(i)\\nmlp = self.mlp(torch.cat([self.user_emb_mlp(u), self.item_emb_mlp(i)], dim=-1))\\nreturn self.affine_output(torch.cat([gmf, mlp], dim=-1))"
        },
        {
          "name": "BPRLoss: -torch.log(torch.sigmoid(pos_scores - neg_scores)).mean()",
          "kind": "랭킹손실",
          "inShape": "pos, neg scores",
          "outShape": "scalar Loss",
          "isExam": true,
          "desc": "양성 아이템 점수와 음성 아이템 점수 차이에 대한 -logsigmoid 평균 손실",
          "steps": [
            "diff = pos_scores - neg_scores",
            "loss = -torch.nn.functional.logsigmoid(diff).mean()"
          ],
          "code": "diff = pos_scores - neg_scores\\nloss = -torch.nn.functional.logsigmoid(diff).mean()\\nreturn loss"
        }
      ]
    }
  ]
},
  vision: {
  "subject": "04 · VISION",
  "title": "과목 4. Vision · CNN & Vision Transformer 종합 통합 파이프라인 트리",
  "desc": "CIFAR-10 데이터 전처리, ResNet18 잔차 연결, ViT 패치 임베딩 및 PreNorm Transformer, DETR, U-Net까지 확인하세요.",
  "root": {
    "title": "[최종 산출물: 이미지 분류 / 객체 검출 손실]",
    "methods": "loss = criterion(logits, targets) 또는 Hungarian_Loss(preds, targets)"
  },
  "ascii": "========================================================================================================\n[최종 산출물: 이미지 분류 / 객체 검출 손실]\nloss = criterion(logits, targets)   또는   Hungarian_Loss(preds, targets)\n========================================================================================================\n │\n ├── 🅰️ [Vision Transformer (ViT) 경로]\n │    ├── logits = mlp_head(x[:, 0])                                    # [B, num_classes] (CLS 토큰 사용)\n │    │    └── x = Transformer_Stack(x)                                 # Pre-Norm 잔차: attn(ln1(x)) + x\n │    │         └── x = torch.cat([cls_token, patch_emb], dim=1) + pos_emb # [B, N+1, D]\n │    │              ├── cls_token = repeat(cls_param, '1 1 d -> b 1 d', b=B)\n │    │              └── patch_emb = to_patch_embedding(img)           # Rearrange + Linear\n │\n ├── 🅱️ [ResNet18 CNN 경로]\n │    ├── logits = fc(AdaptiveAvgPool2d((1, 1))(x).flatten(1))          # [B, num_classes]\n │    │    └── x = Layer1_to_4(x)                                       # BasicBlock 누적\n │    │         └── BasicBlock: out = relu(bn2(conv2(relu(bn1(conv1(x))))) + shortcut(x))\n │    │              └── shortcut(x) = conv_1x1(x) if stride != 1 else x\n │    │\n ├── 🅲️ [DETR 객체 검출 경로]\n │    └── out = TransformerDecoder(queries=object_queries, memory=Encoder(cnn_backbone(img)))\n │\n └── 📥 [공통 데이터 전처리 (Data Transforms)]\n      └── tfms = T.Compose([\n              T.RandomCrop(32, padding=4),\n              T.RandomHorizontalFlip(),\n              T.ToTensor(),\n              T.Normalize(CIFAR10_MEAN, CIFAR10_STD)\n          ])",
  "branches": [
    {
      "icon": "📥",
      "id": "vis-step-1",
      "title": "Step 1: 이미지 전처리 및 증강 (Data Transforms)",
      "meta": "1개 파이프라인",
      "nodes": [
        {
          "name": "transforms.Compose([...])",
          "kind": "🔥 2026-09 기출",
          "inShape": "PIL Image",
          "outShape": "Tensor [3, 32, 32]",
          "isExam": true,
          "desc": "RandomCrop(32, padding=4), RandomHorizontalFlip(), ToTensor(), Normalize(CIFAR10_MEAN, CIFAR10_STD)",
          "steps": [
            "T.RandomCrop(32, padding=4)",
            "T.RandomHorizontalFlip()",
            "T.ToTensor()",
            "T.Normalize(CIFAR10_MEAN, CIFAR10_STD)"
          ],
          "code": "train_tfms = T.Compose([\\n    T.RandomCrop(32, padding=4),\\n    T.RandomHorizontalFlip(),\\n    T.ToTensor(),\\n    T.Normalize(CIFAR10_MEAN, CIFAR10_STD)\\n])"
        }
      ]
    },
    {
      "icon": "🧱",
      "id": "vis-step-2",
      "title": "Step 2: ResNet18 CNN 잔차 백본 (Residual Connections)",
      "meta": "2개 컴포넌트",
      "nodes": [
        {
          "name": "BasicBlock.forward(x)",
          "kind": "잔차블록",
          "inShape": "[B, C, H, W]",
          "outShape": "[B, C_out, H_out, W_out]",
          "isExam": true,
          "desc": "F(x) = conv2(bn2(relu(conv1(bn1(x))))) 계산 후 shortcut(x)를 더하고 최종 ReLU를 통과합니다.",
          "steps": [
            "out = relu(bn1(conv1(x)))",
            "out = bn2(conv2(out))",
            "out += self.shortcut(x)",
            "out = relu(out)"
          ],
          "code": "out = self.conv1(x)\\nout = self.bn1(out)\\nout = self.relu(out)\\nout = self.conv2(out)\\nout = self.bn2(out)\\nout += self.shortcut(x)\\nout = self.relu(out)\\nreturn out"
        },
        {
          "name": "ResNet18.forward(x)",
          "kind": "CNN모델",
          "inShape": "[B, 3, 32, 32]",
          "outShape": "logits: [B, 10]",
          "isExam": false,
          "desc": "초기 Conv-BN-ReLU-MaxPool 후 layer1~4(BasicBlock 스택) ➔ AdaptiveAvgPool2d((1, 1)) ➔ fc",
          "steps": [
            "out = layer1~4(x)",
            "out = self.avgpool(out)",
            "out = torch.flatten(out, 1)",
            "return self.fc(out)"
          ],
          "code": "out = self.layer1(x)\\nout = self.layer2(out)\\nout = self.layer3(out)\\nout = self.layer4(out)\\nout = self.avgpool(out)\\nout = torch.flatten(out, 1)\\nreturn self.fc(out)"
        }
      ]
    },
    {
      "icon": "👁️",
      "id": "vis-step-3",
      "title": "Step 3: Vision Transformer (ViT) 아키텍처",
      "meta": "3개 컴포넌트 · Patch Embedding & PreNorm",
      "nodes": [
        {
          "name": "ViT Patch Embedding & [CLS] Token",
          "kind": "패치임베딩",
          "inShape": "[B, C, H, W]",
          "outShape": "[B, N+1, D]",
          "isExam": true,
          "desc": "이미지를 패치로 분할해 Linear projection 후 [CLS] 토큰 prepend 및 pos_embedding 가산",
          "steps": [
            "x = self.to_patch_embedding(img) # [B, N, D]",
            "cls_tokens = repeat(self.cls_token, '1 1 d -> b 1 d', b=b)",
            "x = torch.cat((cls_tokens, x), dim=1)",
            "x += self.pos_embedding[:, :(n + 1)]"
          ],
          "code": "x = self.to_patch_embedding(img)\\ncls_tokens = repeat(self.cls_token, '1 1 d -> b 1 d', b=b)\\nx = torch.cat((cls_tokens, x), dim=1)\\nx += self.pos_embedding[:, :(n + 1)]"
        },
        {
          "name": "ViT PreNorm Residual (pair & Transformer Blocks)",
          "kind": "🔥 2026-09 기출",
          "inShape": "[B, N+1, D]",
          "outShape": "[B, N+1, D]",
          "isExam": true,
          "desc": "pair(t) 튜플 유틸 및 Pre-Norm 어텐션 잔차(attn(x) + x)와 피드포워드 잔차(ff(x) + x)",
          "steps": [
            "def pair(t): return t if isinstance(t, tuple) else (t, t)",
            "x = attn(x) + x",
            "x = ff(x) + x"
          ],
          "code": "def pair(t): return t if isinstance(t, tuple) else (t, t)\\n# Pre-Norm 잔차 연결\\nx = attn(x) + x\\nx = ff(x) + x\\nreturn x"
        },
        {
          "name": "ViT Classification Head",
          "kind": "분류헤드",
          "inShape": "[B, N+1, D]",
          "outShape": "logits: [B, num_classes]",
          "isExam": true,
          "desc": "Transformer 블록을 통과한 출력 중 0번 [CLS] 토큰 벡터만 추출하여 MLP Head에 전달합니다.",
          "steps": [
            "cls_out = x[:, 0]",
            "logits = self.mlp_head(cls_out)"
          ],
          "code": "cls_out = x[:, 0]\\nlogits = self.mlp_head(cls_out)\\nreturn logits"
        }
      ]
    }
  ]
},
  "on-device": {
  "subject": "05 · ON-DEVICE",
  "title": "과목 5. On-Device AI · 3대 경량화 기법 종합 통합 파이프라인 트리",
  "desc": "채널 단위/가중치 프루닝, INT8 양자화 스케일 & 영점 계산, 지식 증류 온도 스케일링 KL 손실까지 확인하세요.",
  "root": {
    "title": "[최종 산출물: 모바일/NPU 타깃 초경량·저지연 모델]",
    "methods": "Loss_total = alpha * (T^2 * KLDivLoss(soft_S, soft_T)) + (1 - alpha) * CrossEntropyLoss(logits_S, y)"
  },
  "ascii": "========================================================================================================\n[최종 산출물: 모바일/NPU 타깃 초경량·저지연 모델]\nLoss_total = alpha * (T^2 * KLDivLoss(soft_S, soft_T)) + (1 - alpha) * CrossEntropyLoss(logits_S, y)\n========================================================================================================\n │\n ├── 🥉 [3. Knowledge Distillation (지식 증류)]\n │    ├── soft_T = softmax(logits_teacher / T, dim=-1)   (teacher.eval(), torch.no_grad())\n │    └── soft_S = log_softmax(logits_student / T, dim=-1)\n │\n ├── 🥈 [2. Quantization (양자화 - INT8)]\n │    ├── [PTQ 공식 변환]: prepared_model = prepare(model) ➔ 보정(Calibration) ➔ converted_model = convert(model)\n │    ├── [레이어 간 스케일 보정]: M = (S_in * S_w) / S_out  (출력 스케일 정규화)\n │    └── [양자화 파라미터 계산]:\n │         ├── S = (fp_max - fp_min) / (quantized_max - quantized_min)\n │         └── Z = round(quantized_min - fp_min / S)\n │\n └── 🥇 [1. Pruning (가지치기 - Sparsity)]\n      ├── [영구 적용]: prune.remove(module, \"weight\")\n      ├── [마스크 적용]: module.weight.data *= mask\n      └── [임계값 산출]:\n           ├── 채널 L1-norm: score = weight.abs().sum(dim=(0, 2, 3), keepdim=True)\n           └── 가중치 임계값: threshold = torch.kthvalue(scores.view(-1), k=int(total * sparsity)).values",
  "branches": [
    {
      "icon": "✂️",
      "id": "ondev-part-1",
      "title": "Part 1: 가지치기 (Pruning - Magnitude & Channel)",
      "meta": "2개 컴포넌트",
      "nodes": [
        {
          "name": "prune_weight_channel_level(model, layer, sparsity)",
          "kind": "🔥 2026-09 기출",
          "inShape": "Conv2d weight [C_out, C_in, k, k]",
          "outShape": "Pruned Masked Weight",
          "isExam": true,
          "desc": "채널 L1-norm(dim=(0, 2, 3), keepdim=True)으로 중요도 계산 후 하위 채널 0 마스킹 및 expand_as",
          "steps": [
            "num_pruned_channels = round(num_channels * sparsity)",
            "importance = weight.abs().sum(dim=(0, 2, 3), keepdim=True)",
            "threshold = torch.kthvalue(importance.view(-1), k=num_pruned_channels).values",
            "mask = importance > threshold",
            "weight.data *= mask.expand_as(weight)"
          ],
          "code": "num_pruned_channels = round(num_channels * sparsity)\\nimportance = weight.abs().sum(dim=(0, 2, 3), keepdim=True)\\nthreshold = torch.kthvalue(importance.view(-1), k=num_pruned_channels).values\\nmask = importance > threshold\\nweight.data *= mask.expand_as(weight)"
        },
        {
          "name": "prune.remove(module, 'weight')",
          "kind": "영구적용",
          "inShape": "Pruned module",
          "outShape": "Clean module",
          "isExam": false,
          "desc": "PyTorch prune 모듈의 reparametrization(weight_orig, weight_mask)을 제거하고 실제 가중치로 병합합니다.",
          "steps": [
            "prune.remove(layer, 'weight')"
          ],
          "code": "import torch.nn.utils.prune as prune\\nprune.remove(layer, 'weight')"
        }
      ]
    },
    {
      "icon": "📉",
      "id": "ondev-part-2",
      "title": "Part 2: 양자화 (Quantization - Scale, Zero-Point & PTQ)",
      "meta": "3개 컴포넌트",
      "nodes": [
        {
          "name": "get_quantization_scale_and_zero_point(fp_min, fp_max, q_min, q_max)",
          "kind": "🔥 2026-09 기출",
          "inShape": "FP32 min/max, INT8 min/max",
          "outShape": "scale (float), zero_point (int)",
          "isExam": true,
          "desc": "S = (fp_max - fp_min) / (q_max - q_min) 및 Z = round(q_min - fp_min / S)",
          "steps": [
            "scale = (fp_max - fp_min) / (quantized_max - quantized_min)",
            "zero_point = round(quantized_min - fp_min / scale)",
            "zero_point = max(quantized_min, min(quantized_max, zero_point))"
          ],
          "code": "scale = (fp_max - fp_min) / (quantized_max - quantized_min)\\nzero_point = round(quantized_min - fp_min / scale)\\nzero_point = max(quantized_min, min(quantized_max, zero_point))\\nreturn scale, zero_point"
        },
        {
          "name": "quantize(x, scale, zero_point) & dequantize(q, scale, zero_point)",
          "kind": "변환공식",
          "inShape": "x: FP32 Tensor",
          "outShape": "q: INT8 Tensor",
          "isExam": true,
          "desc": "q = clamp(round(x / scale) + zero_point, q_min, q_max) / x_approx = (q - zero_point) * scale",
          "steps": [
            "q = torch.clamp(torch.round(x / scale) + zero_point, q_min, q_max)",
            "x_approx = (q - zero_point) * scale"
          ],
          "code": "q = torch.clamp(torch.round(x / scale) + zero_point, q_min, q_max)\\nx_approx = (q - zero_point) * scale"
        },
        {
          "name": "PyTorch PTQ: prepare(model) → calibrate → convert(model)",
          "kind": "PTQ파이프라인",
          "inShape": "FP32 Model",
          "outShape": "Quantized Model",
          "isExam": false,
          "desc": "모델 가중치와 활성화 함수 사이에 관측기(Observer)를 삽입해 통계 수집 후 INT8로 영구 변환합니다.",
          "steps": [
            "prepared = torch.ao.quantization.prepare(model)",
            "quantized = torch.ao.quantization.convert(prepared)"
          ],
          "code": "model.qconfig = torch.ao.quantization.get_default_qconfig('fbgemm')\\nprepared = torch.ao.quantization.prepare(model)\\n# 보정(Calibration) 실행...\\nquantized = torch.ao.quantization.convert(prepared)"
        }
      ]
    },
    {
      "icon": "🎓",
      "id": "ondev-part-3",
      "title": "Part 3: 지식 증류 (Knowledge Distillation - Teacher & Student)",
      "meta": "2개 컴포넌트",
      "nodes": [
        {
          "name": "DistillationLoss: alpha * T^2 * KLDivLoss + (1 - alpha) * CrossEntropy",
          "kind": "증류손실",
          "inShape": "student_logits, teacher_logits, targets",
          "outShape": "scalar Loss",
          "isExam": true,
          "desc": "온도 T로 스케일링된 soft label에 대해 T^2 가중치의 KLDivLoss와 원본 target에 대한 CrossEntropy 손실을 결합합니다.",
          "steps": [
            "soft_teacher = F.softmax(teacher_logits / T, dim=-1)",
            "soft_student = F.log_softmax(student_logits / T, dim=-1)",
            "loss_kd = F.kl_div(soft_student, soft_teacher, reduction='batchmean') * (T * T)",
            "loss_ce = F.cross_entropy(student_logits, targets)",
            "loss = alpha * loss_kd + (1.0 - alpha) * loss_ce"
          ],
          "code": "soft_teacher = F.softmax(teacher_logits / T, dim=-1)\\nsoft_student = F.log_softmax(student_logits / T, dim=-1)\\nloss_kd = F.kl_div(soft_student, soft_teacher, reduction='batchmean') * (T * T)\\nloss_ce = F.cross_entropy(student_logits, targets)\\nloss = alpha * loss_kd + (1.0 - alpha) * loss_ce"
        },
        {
          "name": "teacher.eval() & torch.no_grad()",
          "kind": "동결평가",
          "inShape": "Teacher Model",
          "outShape": "Frozen Output",
          "isExam": true,
          "desc": "교사 모델은 기울기 계산을 하지 않고 순전파 출력(logits)만 부드러운 확률 분포로 제공합니다.",
          "steps": [
            "teacher.eval()",
            "with torch.no_grad(): teacher_logits = teacher(inputs)"
          ],
          "code": "teacher.eval()\\nwith torch.no_grad():\\n    teacher_logits = teacher(inputs)"
        }
      ]
    }
  ]
}
};
