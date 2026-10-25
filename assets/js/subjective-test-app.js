const STORAGE_KEY = document.body.dataset.storageKey || 'ai-coding-recall-subjective-v1';
const BLANKS_BY_STORAGE_KEY = {
  "vision_resnet18_subjective_test-history-v1": [
    {
      "id": "blank-random-crop",
      "label": "🔴 2026-09 기출 1-1 · 학습 이미지 Random Crop (32x32, padding=4)",
      "instruction": "[2026-09 기출 1-1] 학습용 32×32 CIFAR 이미지를 padding=4 후 random crop하도록 T.RandomCrop(32, padding=4)를 작성하세요.",
      "answer": "T.RandomCrop(32, padding=4)"
    },
    {
      "id": "blank-random-flip",
      "label": "🔴 2026-09 기출 1-2 · 학습 이미지 좌우 반전 증강",
      "instruction": "[2026-09 기출 1-2] Random Crop 뒤에 좌우 반전 증강 T.RandomHorizontalFlip()을 적용하세요.",
      "answer": "T.RandomHorizontalFlip()"
    },
    {
      "id": "blank-to-tensor",
      "label": "🔴 2026-09 기출 1-3 · PIL 이미지를 CHW Tensor로 변환 (0~1)",
      "instruction": "[2026-09 기출 1-3] 증강된 PIL 이미지를 (C,H,W) 범위 0~1 Tensor로 바꾸는 T.ToTensor()를 작성하세요.",
      "answer": "T.ToTensor()"
    },
    {
      "id": "blank-normalize",
      "label": "🔴 2026-09 기출 1-4 · CIFAR-10 채널 정규화 (MEAN, STD)",
      "instruction": "[2026-09 기출 1-4] 앞에서 정의한 CIFAR10_MEAN, CIFAR10_STD를 사용해 T.Normalize(CIFAR10_MEAN, CIFAR10_STD) 정규화를 적용하세요.",
      "answer": "T.Normalize(CIFAR10_MEAN, CIFAR10_STD)"
    },
    {
      "id": "blank-cifar-stem",
      "label": "★ 유력 · CIFAR 입력용 Conv Stem (3x3, stride=1, padding=1)",
      "instruction": "CIFAR-10의 32×32 입력에 맞는 3→64, kernel_size=3, stride=1, padding=1, bias=False Conv2d stem을 선언하세요.",
      "answer": "nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)"
    },
    {
      "id": "blank-resnet-fc",
      "label": "🟣 기출 변형 유력 · ResNet18 최종 분류기 출력 클래스 수 변경 (nn.Linear)",
      "instruction": "기존 model.fc.in_features를 입력받아 num_classes를 출력하는 nn.Linear 레이어를 작성하세요.",
      "answer": "nn.Linear(model.fc.in_features, num_classes)"
    },
    {
      "id": "blank-resnet-argmax",
      "label": "🟣 기출 변형 유력 · 분류 로짓에서 Top-1 예측 클래스 인덱스 추출 (argmax)",
      "instruction": "[B, C] logits의 클래스 축(dim=1)에서 가장 큰 인덱스를 선택하세요.",
      "answer": "logits.argmax(dim=1)"
    },
    {
      "id": "blank-resnet-loss",
      "label": "🟣 기출 변형 유력 · 학습 루프 분류 손실 계산 (criterion)",
      "instruction": "모델 출력 logits와 정답 labels로 criterion 손실을 계산하세요.",
      "answer": "criterion(logits, labels)"
    },
    {
      "id": "blank-resnet-softmax",
      "label": "🟣 기출 변형 유력 · 로짓을 클래스 확률 분포로 변환 (F.softmax)",
      "instruction": "분류 logits의 클래스 축(dim=1)에 대해 F.softmax 확률을 계산하세요.",
      "answer": "F.softmax(logits, dim=1)"
    },
    {
      "id": "blank-resnet-conf-pred",
      "label": "🟣 기출 변형 유력 · 최대 확률(conf)과 예측 클래스(pred) 동시 추출 (max)",
      "instruction": "확률 텐서 probs의 클래스 축(dim=1)에서 최대값과 인덱스를 함께 반환하세요.",
      "answer": "probs.max(dim=1)"
    },
    {
      "id": "blank-gradcam-weight",
      "label": "🟣 기출 변형 유력 · Grad-CAM 공간 축(H, W) 그래디언트 평균 가중치 계산 (dim=(2,3))",
      "instruction": "self.grad [B, C, H, W]의 공간 차원(dim=(2,3)) 평균을 keepdim=True로 계산하세요.",
      "answer": "self.grad.mean(dim=(2,3), keepdim=True)"
    }
  ],
  "vision_vit_subjective_test-history-v1": [
    {
      "id": "blank-vit-pair",
      "label": "🔴 2026-09 기출 8-1 · ViT pair(t) 크기 튜플 통일 유틸",
      "instruction": "[2026-09 기출] 입력 t가 tuple이면 그대로, 정수가 들어오면 (t, t) 튜플로 반환하는 조건 표현식을 작성하세요.",
      "answer": "t if isinstance(t, tuple) else (t, t)"
    },
    {
      "id": "blank-vit-qkv",
      "label": "★ 유력 · QKV 동시 투영 (Linear)",
      "instruction": "토큰 dim을 Q·K·V 세 덩어리로 동시에 투영하도록 inner_dim * 3 출력 Linear layer를 만드세요.",
      "answer": "nn.Linear(dim, inner_dim * 3, bias = False)"
    },
    {
      "id": "blank-vit-qkv-chunk",
      "label": "🟣 기출 변형 유력 · QKV 투영 텐서를 마지막 차원(dim=-1) 기준 3등분 (chunk)",
      "instruction": "self.to_qkv(x) 결과를 마지막 차원(dim=-1) 기준으로 3등분하는 chunk 호출을 작성하세요.",
      "answer": "self.to_qkv(x).chunk(3, dim = -1)"
    },
    {
      "id": "blank-vit-scores",
      "label": "★ 유력 · Head별 QK 유사도 (einsum + scale)",
      "instruction": "분리된 Q와 K의 head별 내적을 계산하고 self.scale을 곱해 attention score [B,H,N,N]를 만드세요.",
      "answer": "einsum('b h i d, b h j d -> b h i j', q, k) * self.scale"
    },
    {
      "id": "blank-vit-weighted-sum",
      "label": "★ 유력 · Attention Value 가중합 (einsum)",
      "instruction": "attention weight [B,H,N,N]로 V [B,H,N,D]를 가중합해 token representation을 만드세요.",
      "answer": "einsum('b h i j, b h j d -> b h i d', attn, v)"
    },
    {
      "id": "blank-vit-residual-attn",
      "label": "🔴 2026-09 기출 2-1 · Transformer Attention Residual 연결",
      "instruction": "[2026-09 기출 2-1] Attention 결과를 입력 x에 더하는 Residual 연결(x = attn(x) + x)을 작성하세요.",
      "answer": "x = attn(x) + x"
    },
    {
      "id": "blank-vit-residual-ff",
      "label": "🔴 2026-09 기출 2-2 · Transformer FFN Residual 연결",
      "instruction": "[2026-09 기출 2-2] FFN 결과를 입력 x에 더하는 Residual 연결(x = ff(x) + x)을 작성하세요.",
      "answer": "x = ff(x) + x"
    },
    {
      "id": "blank-vit-patch-proj",
      "label": "🟣 기출 변형 유력 · 펼쳐진 패치 벡터(patch_dim)를 토큰 차원(cfg.dim)으로 선형 투영",
      "instruction": "패치 1개 차원 patch_dim을 Transformer 차원 cfg.dim으로 매핑하는 nn.Linear를 작성하세요.",
      "answer": "nn.Linear(patch_dim, cfg.dim)"
    },
    {
      "id": "blank-vit-cls-repeat",
      "label": "🟣 기출 변형 유력 · CLS 토큰을 배치 크기(b)만큼 복제 (repeat)",
      "instruction": "self.cls_token [1, 1, d]를 현재 배치 크기 b만큼 반복해 [b, 1, d]로 만드세요.",
      "answer": "repeat(self.cls_token, \"1 1 d -> b 1 d\", b=b)"
    },
    {
      "id": "blank-vit-cls-cat",
      "label": "🟣 기출 변형 유력 · CLS 토큰과 패치 토큰 시퀀스를 토큰 축(dim=1)으로 결합 (torch.cat)",
      "instruction": "cls_tokens와 패치 토큰 x를 토큰 차원(dim=1)에서 이어붙이세요.",
      "answer": "torch.cat((cls_tokens, x), dim=1)"
    },
    {
      "id": "blank-vit-pos-add",
      "label": "🟣 기출 변형 유력 · CLS 포함 토큰 시퀀스에 위치 임베딩 브로드캐스팅 합산",
      "instruction": "토큰 시퀀스 x에 self.pos_embedding[:, : (n + 1)]을 더하세요.",
      "answer": "x + self.pos_embedding[:, : (n + 1)]"
    },
    {
      "id": "blank-vit-pool",
      "label": "🟣 기출 변형 유력 · 분류 헤드 입력용 대표 벡터 추출 (CLS 0번 토큰 vs 평균 풀링)",
      "instruction": "self.pool == \"cls\"이면 0번 토큰 x[:, 0]을, 아니면 x.mean(dim=1)을 반환하는 조건식을 작성하세요.",
      "answer": "x[:, 0] if self.pool == \"cls\" else x.mean(dim=1)"
    }
  ],
  "vision_detr_subjective_test-history-v1": [
    {
      "id": "blank-detr-resize",
      "label": "★ 유력 · DETR 입력 크기 조정",
      "instruction": "DETR 입력 transform에서 이미지의 짧은 변 기준 크기를 800으로 맞추세요.",
      "answer": "T.Resize(800)"
    },
    {
      "id": "blank-detr-normalize",
      "label": "★ 유력 · ImageNet 정규화",
      "instruction": "사전학습 DETR이 기대하는 ImageNet RGB mean/std 정규화를 적용하세요.",
      "answer": "T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])"
    },
    {
      "id": "blank-detr-unbind",
      "label": "🟣 기출 변형 유력 · [N, 4] 중심 좌표 박스를 (x_c, y_c, w, h) 4개 성분으로 분리 (unbind)",
      "instruction": "[N, 4] 박스 텐서 x를 dim=1 기준으로 4개의 1D 텐서로 분리하세요.",
      "answer": "x.unbind(1)"
    },
    {
      "id": "blank-detr-stack",
      "label": "🟣 기출 변형 유력 · 변환된 좌상/우하 꼭짓점 리스트를 [N, 4] 텐서로 병합 (torch.stack)",
      "instruction": "4개의 좌표 텐서 리스트 b를 dim=1 기준으로 쌓아 [N, 4] 텐서를 만드세요.",
      "answer": "torch.stack(b, dim=1)"
    },
    {
      "id": "blank-detr-model",
      "label": "★ 유력 · 사전학습 DETR 로드",
      "instruction": "facebookresearch/detr hub의 detr_resnet50 사전학습 모델을 불러오세요.",
      "answer": "torch.hub.load('facebookresearch/detr', 'detr_resnet50', pretrained=True)"
    },
    {
      "id": "blank-detr-probas",
      "label": "🟣 기출 변형 유력 · 마지막 no-object 클래스를 제외한 쿼리별 클래스 확률 추출 (softmax)",
      "instruction": "outputs['pred_logits']에 softmax(-1)를 적용한 뒤 0번 배치에서 마지막 no-object 슬롯(:-1)을 제외하세요.",
      "answer": "outputs['pred_logits'].softmax(-1)[0, :, :-1]"
    },
    {
      "id": "blank-detr-keep",
      "label": "🟣 기출 변형 유력 · 최대 클래스 확률이 0.9를 초과하는 유효 쿼리 마스크 생성",
      "instruction": "각 쿼리의 최대 확률 probas.max(-1).values가 0.9보다 큰지 비교하는 식을 작성하세요.",
      "answer": "probas.max(-1).values > 0.9"
    },
    {
      "id": "blank-detr-rescale",
      "label": "🟣 기출 변형 유력 · 유효 쿼리(keep) 예측 박스를 원본 이미지 픽셀 크기로 복원 (rescale_bboxes)",
      "instruction": "rescale_bboxes 함수에 outputs['pred_boxes'][0, keep]와 im.size를 전달하세요.",
      "answer": "rescale_bboxes(outputs['pred_boxes'][0, keep], im.size)"
    }
  ],
  "vision_unet_subjective_test-history-v1": [
    {
      "id": "blank-unet-expand-img",
      "label": "🟣 기출 변형 유력 · 2D 흑백 이미지 배열에 채널 축(axis=0) 추가 (np.expand_dims)",
      "instruction": "(H, W) 넘파이 배열 img의 axis=0 위치에 채널 차원을 추가해 (1, H, W)로 만드세요.",
      "answer": "np.expand_dims(img, axis=0)"
    },
    {
      "id": "blank-unet-maxpool",
      "label": "🟣 기출 변형 유력 · Down 블록 공간 해상도 1/2 축소용 MaxPool2d 선언",
      "instruction": "kernel_size=2를 사용하는 nn.MaxPool2d 레이어를 선언하세요.",
      "answer": "nn.MaxPool2d(kernel_size=2)"
    },
    {
      "id": "blank-unet-up",
      "label": "★ 유력 · 학습 가능한 업샘플링 (ConvTranspose2d)",
      "instruction": "bilinear=False일 때 해상도를 2배로 키우고 채널을 절반으로 줄이는 ConvTranspose2d를 만드세요.",
      "answer": "nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2)"
    },
    {
      "id": "blank-unet-skip",
      "label": "★ 유력 · Skip feature 채널 결합 (torch.cat)",
      "instruction": "skip feature x2와 upsampled feature x1을 채널 축 dim=1에서 결합하세요.",
      "answer": "torch.cat([x2, x1], dim=1)"
    },
    {
      "id": "blank-unet-outconv",
      "label": "🟣 기출 변형 유력 · OutConv 픽셀별 클래스 매핑용 1x1 Conv2d 선언",
      "instruction": "in_channels에서 out_channels로 매핑하는 kernel_size=1 nn.Conv2d를 작성하세요.",
      "answer": "nn.Conv2d(in_channels, out_channels, kernel_size=1)"
    },
    {
      "id": "blank-unet-loss",
      "label": "★ 유력 · Mask 예측 손실 계산",
      "instruction": "pixel logits와 정답 masks를 criterion으로 비교해 segmentation loss를 계산하세요.",
      "answer": "loss = criterion(logits, masks)"
    },
    {
      "id": "blank-unet-sigmoid",
      "label": "🟣 기출 변형 유력 · 분할 로짓에 Sigmoid를 적용해 픽셀별 전경 확률 변환",
      "instruction": "logits에 torch.sigmoid를 적용해 픽셀별 확률을 계산하세요.",
      "answer": "torch.sigmoid(logits)"
    },
    {
      "id": "blank-unet-thresh",
      "label": "🟣 기출 변형 유력 · 0.5 임계값 기준 이진 분할 마스크(0/1 float) 생성",
      "instruction": "probs > 0.5 조건 결과를 .float() 텐서로 변환하세요.",
      "answer": "(probs > 0.5).float()"
    }
  ],
  "vision_ddpm_subjective_test-history-v1": [
    {
      "id": "blank-ddpm-sin-cos",
      "label": "🟣 기출 변형 유력 · 타임스텝 주파수 인자의 sin, cos 성분을 마지막 축(dim=-1)으로 결합 (torch.cat)",
      "instruction": "args.sin()과 args.cos()를 리스트로 묶어 마지막 차원(dim=-1)으로 결합하세요.",
      "answer": "torch.cat([args.sin(), args.cos()], dim=-1)"
    },
    {
      "id": "blank-ddpm-time-rearrange",
      "label": "🟣 기출 변형 유력 · 타임스텝 임베딩 [B, C]를 4D 특징맵 브로드캐스팅용 [B, C, 1, 1]로 확장 (rearrange)",
      "instruction": "einops.rearrange를 사용해 time_emb를 \"b c -> b c 1 1\" 형태로 변환하세요.",
      "answer": "rearrange(time_emb, \"b c -> b c 1 1\")"
    },
    {
      "id": "blank-ddpm-qkv",
      "label": "★ 유력 · Conv 기반 QKV 투영",
      "instruction": "이미지 feature map에서 Q·K·V를 동시에 만들도록 1×1 Conv2d의 출력 채널을 hidden_dim*3으로 설정하세요.",
      "answer": "nn.Conv2d(dim, hidden_dim * 3, 1, bias=False)"
    },
    {
      "id": "blank-ddpm-scores",
      "label": "★ 유력 · Pixel 간 Attention 점수 (einsum)",
      "instruction": "각 head의 pixel token 사이 QK dot product attention score를 einsum으로 계산하세요.",
      "answer": "torch.einsum(\"b h d i, b h d j -> b h i j\", q, k)"
    },
    {
      "id": "blank-ddpm-softmax",
      "label": "★ 유력 · Attention 가중치 정규화 (softmax)",
      "instruction": "attention score의 마지막 token 축(dim=-1)을 확률 분포로 정규화하세요.",
      "answer": "sim.softmax(dim=-1)"
    },
    {
      "id": "blank-ddpm-qsample-eq",
      "label": "🟣 기출 변형 유력 · Forward Diffusion 수식 구현 (원본 계수 × x_start + 노이즈 계수 × noise)",
      "instruction": "sqrt_alphas_cumprod_t * x_start와 sqrt_one_minus_alphas_cumprod_t * noise를 더한 값을 반환하세요.",
      "answer": "sqrt_alphas_cumprod_t * x_start + sqrt_one_minus_alphas_cumprod_t * noise"
    },
    {
      "id": "blank-ddpm-pred-noise",
      "label": "🟣 기출 변형 유력 · 노이즈 섞인 이미지(x_noisy)와 타임스텝(t)으로 노이즈 예측",
      "instruction": "denoise_model에 x_noisy와 t를 전달해 예측 노이즈를 구하세요.",
      "answer": "denoise_model(x_noisy, t)"
    },
    {
      "id": "blank-ddpm-l2-loss",
      "label": "🟣 기출 변형 유력 · 실제 노이즈(noise)와 예측 노이즈(predicted_noise) 간 MSE 손실 계산",
      "instruction": "F.mse_loss를 사용해 noise와 predicted_noise 사이의 오차를 계산하세요.",
      "answer": "F.mse_loss(noise, predicted_noise)"
    },
    {
      "id": "blank-ddpm-reverse-step",
      "label": "🟣 기출 변형 유력 · t > 0 역확산 샘플링 (model_mean + 표준편차 × 가우시안 노이즈)",
      "instruction": "model_mean에 torch.sqrt(posterior_variance_t) * noise를 더해 이전 시점 이미지를 샘플링하세요.",
      "answer": "model_mean + torch.sqrt(posterior_variance_t) * noise"
    }
  ],
  "vision_stable_diffusion_subjective_test-history-v1": [
    {
      "id": "blank-sd-pipeline",
      "label": "★ 유력 · 사전학습 Pipeline 로드",
      "instruction": "Stable Diffusion v1.4 pretrained pipeline을 모델 ID로 불러오는 메서드를 작성하세요.",
      "answer": "StableDiffusionPipeline.from_pretrained"
    },
    {
      "id": "blank-sd-dtype",
      "label": "🟣 기출 변형 유력 · VRAM 절약을 위한 반정밀도(FP16) 데이터 타입 지정",
      "instruction": "16비트 부동소수점 타입인 torch.float16을 지정하세요.",
      "answer": "torch.float16"
    },
    {
      "id": "blank-sd-image",
      "label": "★ 유력 · Guidance Scale별 Pipeline 이미지 추출",
      "instruction": "pipe(prompt, guidance_scale=cfg, generator=generator) 결과에서 첫 번째 생성 이미지(.images[0])를 꺼내세요.",
      "answer": "pipe(prompt, guidance_scale=cfg, generator=generator).images[0]"
    },
    {
      "id": "blank-sd-generator",
      "label": "★ 유력 · 재현 가능한 CUDA seed Generator 생성",
      "instruction": "고정 seed로 재현 가능한 CUDA generator를 만드세요.",
      "answer": "torch.Generator(\"cuda\").manual_seed(seed)"
    },
    {
      "id": "blank-sd-neg-arg",
      "label": "🟣 기출 변형 유력 · 파이프라인 호출 시 부정 프롬프트(negative_prompt) 변수 전달",
      "instruction": "반복문에서 순회 중인 부정 프롬프트 문자열 변수 neg_prompt를 전달하세요.",
      "answer": "neg_prompt"
    },
    {
      "id": "blank-sd-size-call",
      "label": "🟣 기출 변형 유력 · 가로(width=w)·세로(height=h) 해상도 지정 이미지 생성",
      "instruction": "pipe에 prompt, width=w, height=h, generator=generator를 전달하고 .images[0]을 추출하세요.",
      "answer": "pipe(prompt, width=w, height=h, generator=generator).images[0]"
    }
  ],
  "data_timeseries_subjective_test-history-v1": [
    {
      "id": "blank-ts-scale-fit",
      "label": "🟣 기출 변형 유력 · 학습 데이터(train_data) MinMaxScaler 적합 및 변환 (fit_transform)",
      "instruction": "scaler.fit_transform을 사용해 train_data.values를 적합 및 스케일링하세요.",
      "answer": "scaler.fit_transform(train_data.values)"
    },
    {
      "id": "blank-ts-scale-test",
      "label": "🟣 기출 변형 유력 · 테스트 데이터(test_data) 학습 기준 변환 (transform)",
      "instruction": "scaler.transform을 사용해 test_data.values를 변환하세요.",
      "answer": "scaler.transform(test_data.values)"
    },
    {
      "id": "blank-ts-single-feat",
      "label": "🟣 기출 변형 유력 · 단일 스텝 예측용 입력 윈도우 슬라이싱 (i ~ i + sequence_length)",
      "instruction": "data_seq에서 i부터 i + sequence_length 구간을 슬라이싱하세요.",
      "answer": "data_seq[i:i + sequence_length]"
    },
    {
      "id": "blank-ts-single-label",
      "label": "🟣 기출 변형 유력 · 단일 스텝 예측용 직후 시점 타깃 추출 (i + sequence_length, 0)",
      "instruction": "data_seq의 i + sequence_length 행, 0열 원소를 추출하세요.",
      "answer": "data_seq[i + sequence_length, 0]"
    },
    {
      "id": "blank-ts-lstm-init",
      "label": "🟣 기출 변형 유력 · Batch-first 다층 LSTM 레이어 선언 (nn.LSTM)",
      "instruction": "input_size, hidden_size, num_layers, batch_first=True로 nn.LSTM을 선언하세요.",
      "answer": "nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)"
    },
    {
      "id": "blank-ts-train-pred",
      "label": "★ 유력 · 마지막 시점 예측값 슬라이싱",
      "instruction": "모델 출력 [B, T, 1]에서 각 배치의 마지막 시점(-1)과 0번 피처 값을 선택해 pred [B]를 만드세요.",
      "answer": "model(batch_x)[:, -1, 0]"
    },
    {
      "id": "blank-ts-conv-transpose",
      "label": "🟣 기출 변형 유력 · Conv1d 입력을 위한 시간축-채널축 전치 (transpose(1, 2))",
      "instruction": "[B, T, C] 텐서 x의 1번 차원과 2번 차원을 맞바꾸는 transpose 호출을 작성하세요.",
      "answer": "x.transpose(1, 2)"
    },
    {
      "id": "blank-ts-rnn",
      "label": "★ 유력 · Batch-first RNN 계층 선언",
      "instruction": "입력 [B, T, input_size]를 받도록 input_size, hidden_size, num_layers와 batch_first=True를 사용한 nn.RNN을 선언하세요.",
      "answer": "nn.RNN(input_size, hidden_size, num_layers, batch_first=True)"
    },
    {
      "id": "blank-ts-forward",
      "label": "★ 유력 · RNN sequence output projection",
      "instruction": "RNN의 모든 시점 출력 out을 self.fc에 통과시켜 반환하세요.",
      "answer": "return self.fc(out)"
    },
    {
      "id": "blank-ts-encdec-feat",
      "label": "🔴 2026-09 기출 1-1 · Encoder 입력 시퀀스 슬라이싱 (i ~ i + sequence_length)",
      "instruction": "[2026-09 기출 1-1] data에서 현재 인덱스 i부터 i + sequence_length까지 슬라이싱하세요.",
      "answer": "data[i:i + sequence_length]"
    },
    {
      "id": "blank-ts-encdec-label",
      "label": "🔴 2026-09 기출 1-2 · Decoder 타깃 시퀀스 슬라이싱 (i + sequence_length ~ + target_len)",
      "instruction": "[2026-09 기출 1-2] data에서 i + sequence_length부터 i + sequence_length + target_len까지 슬라이싱하세요.",
      "answer": "data[i + sequence_length : i + sequence_length + target_len]"
    },
    {
      "id": "blank-ts-np-float32",
      "label": "🔴 2026-09 기출 5-2 · 입력 시퀀스 float32 NumPy 배열 변환",
      "instruction": "[2026-09 기출 5-2] 리스트 features를 dtype=np.float32인 NumPy 배열(np.array)로 변환하세요.",
      "answer": "np.array(features, dtype=np.float32)"
    },
    {
      "id": "blank-ts-rnnrnn-enc",
      "label": "🔴 2026-09 기출 2-1 · RNNRNN 인코더 은닉 상태 추출 (self.encoder(source))",
      "instruction": "[2026-09 기출 2-1] self.encoder에 source를 입력해 인코더 마지막 은닉 상태 h를 구하세요.",
      "answer": "self.encoder(source)"
    },
    {
      "id": "blank-ts-rnnrnn-init-input",
      "label": "🔴 2026-09 기출 2-2 · RNNRNN 디코더 첫 입력 생성 (source[:, -1, :].unsqueeze(1))",
      "instruction": "[2026-09 기출 2-2] source의 마지막 시점(source[:, -1, :])에 시간 차원(dim=1)을 추가(unsqueeze(1))하세요.",
      "answer": "source[:, -1, :].unsqueeze(1)"
    },
    {
      "id": "blank-ts-rnnrnn-dec-step",
      "label": "🔴 2026-09 기출 2-3 · RNNRNN 디코더 1스텝 실행 (self.decoder(input, h))",
      "instruction": "[2026-09 기출 2-3] self.decoder에 현재 input과 은닉 상태 h를 전달하세요.",
      "answer": "self.decoder(input, h)"
    },
    {
      "id": "blank-ts-rnnrnn-pred-append",
      "label": "🔴 2026-09 기출 2-4 · RNNRNN 예측값 시간축 제거 (out.squeeze(1))",
      "instruction": "[2026-09 기출 2-4] 디코더 출력 out [B, 1, F]에서 시간축(dim=1)을 squeeze(1)로 제거하세요.",
      "answer": "out.squeeze(1)"
    },
    {
      "id": "blank-ts-rnnrnn-autoreg",
      "label": "🔴 2026-09 기출 2-5 · RNNRNN 자기회귀 다음 입력 갱신 (input = out)",
      "instruction": "[2026-09 기출 2-5] 현재 시점 디코더 출력 out을 다음 시점 입력 input에 대입하세요.",
      "answer": "out"
    },
    {
      "id": "blank-ts-rnnrnn-stack",
      "label": "🔴 2026-09 기출 2-6 · RNNRNN 전체 시점 예측 병합 (torch.stack(predictions, dim=1))",
      "instruction": "[2026-09 기출 2-6] 리스트 predictions에 모인 텐서들을 시간축(dim=1)으로 쌓아(torch.stack) 반환하세요.",
      "answer": "torch.stack(predictions, dim=1)"
    }
  ],
  "data_ngcf_subjective_test-history-v1": [
    {
      "id": "blank-ngcf-item-offset",
      "label": "🟣 기출 변형 유력 · 이분 그래프 아이템 노드 인덱스 오프셋 보정 (+ num_users)",
      "instruction": "row['movieId']에 전체 사용자 수 num_users를 더해 아이템 노드 ID를 만드세요.",
      "answer": "row['movieId'] + num_users"
    },
    {
      "id": "blank-ngcf-norm",
      "label": "★ 유력 · 대칭 차수 정규화 계수 norm 계산",
      "instruction": "각 엣지의 src·dst 차수(deg)를 사용해 1.0 / torch.sqrt(deg[src] * deg[dst])를 계산하세요.",
      "answer": "1.0/torch.sqrt(deg[src]*deg[dst])"
    },
    {
      "id": "blank-ngcf-norm-bcast",
      "label": "🟣 기출 변형 유력 · 1D 정규화 계수(norm)를 2D 메시지 차원에 맞춰 브로드캐스팅 (unsqueeze(1))",
      "instruction": "1D 텐서 norm에 1번 차원을 추가해 [E, 1] 모양으로 만드세요.",
      "answer": "norm.unsqueeze(1)"
    },
    {
      "id": "blank-ngcf-edge-dst",
      "label": "★ 유력 · 아이템 노드 전달 메시지 (self.W1 + self.W2 상호작용)",
      "instruction": "src_feat에 대한 선형 변환 self.W1(src_feat)과 상호작용 항 self.W2(src_feat * dst_feat)의 합을 작성하세요.",
      "answer": "self.W1(src_feat) + self.W2(src_feat*dst_feat)"
    },
    {
      "id": "blank-ngcf-agg-dst",
      "label": "🟣 기출 변형 유력 · 도착 아이템 노드(dst) 위치에 메시지 누적 집계 (index_add_)",
      "instruction": "aggregated_messages의 0번 차원 dst 위치에 edge_messages_for_dst를 인플레이스 합산(index_add_)하세요.",
      "answer": "aggregated_messages.index_add_(0, dst, edge_messages_for_dst)"
    },
    {
      "id": "blank-ngcf-self-item",
      "label": "🟣 기출 변형 유력 · 아이템 노드 구간(user_num:) 자기 자신 선형 변환 합산 (self.W1)",
      "instruction": "아이템 노드 특징 node_features[user_num:]에 self.W1을 적용하세요.",
      "answer": "self.W1(node_features[user_num:])"
    },
    {
      "id": "blank-ngcf-concat",
      "label": "★ 유력 · 전체 레이어 표현 결합 (torch.concat)",
      "instruction": "초기 임베딩과 모든 NGCF 레이어 출력이 담긴 layer_outputs를 마지막 차원(dim=-1)으로 연결하세요.",
      "answer": "torch.concat(layer_outputs,dim=-1)"
    },
    {
      "id": "blank-ngcf-bpr-pos",
      "label": "🟣 기출 변형 유력 · 사용자-긍정 아이템 내적 점수 계산 (torch.sum(..., dim=1))",
      "instruction": "user_emb * pos_item_emb를 임베딩 차원(dim=1)으로 합산하세요.",
      "answer": "torch.sum(user_emb * pos_item_emb, dim=1)"
    },
    {
      "id": "blank-ngcf-bpr-loss",
      "label": "🟣 기출 변형 유력 · BPR Pairwise Ranking Loss 수식 (-torch.mean(F.logsigmoid(...)))",
      "instruction": "pos_scores - neg_scores에 F.logsigmoid를 적용한 평균에 음수(-)를 취하세요.",
      "answer": "-torch.mean(F.logsigmoid(pos_scores - neg_scores))"
    },
    {
      "id": "blank-ngcf-topk",
      "label": "🟣 기출 변형 유력 · 전체 아이템 점수에서 상위 K개 점수와 인덱스 추출 (torch.topk)",
      "instruction": "torch.topk를 사용해 scores에서 상위 k개를 추출하세요.",
      "answer": "torch.topk(scores, k=k)"
    }
  ],
  "data_ncf_subjective_test-history-v1": [
    {
      "id": "blank-ncf-label-enc",
      "label": "🟣 기출 변형 유력 · 사용자 ID를 연속적인 정수 인덱스로 변환 (fit_transform)",
      "instruction": "lbl_user.fit_transform을 호출해 df.userId.values를 정수 인덱스로 변환하세요.",
      "answer": "lbl_user.fit_transform(df.userId.values)"
    },
    {
      "id": "blank-ncf-user-embedding",
      "label": "★ 유력 · 사용자 latent vector 임베딩 선언 (nn.Embedding)",
      "instruction": "사용자 수 n_users를 32차원 잠재 벡터로 매핑하는 nn.Embedding을 선언하세요.",
      "answer": "nn.Embedding(n_users, 32)"
    },
    {
      "id": "blank-ncf-fc1",
      "label": "🟣 기출 변형 유력 · 결합된 64차원(32+32) 임베딩을 32차원으로 축소하는 첫 번째 MLP 레이어 선언",
      "instruction": "입력 64차원, 출력 32차원인 nn.Linear 레이어를 작성하세요.",
      "answer": "nn.Linear(64,32)"
    },
    {
      "id": "blank-ncf-user-lookup",
      "label": "🟣 기출 변형 유력 · 입력 사용자 인덱스 텐서로 사용자 임베딩 조회 (self.user_embedding)",
      "instruction": "self.user_embedding 레이어에 users 텐서를 전달하세요.",
      "answer": "self.user_embedding(users)"
    },
    {
      "id": "blank-ncf-concat",
      "label": "★ 유력 · User·movie embedding 결합 (torch.cat)",
      "instruction": "user_embedding과 movie_embedding을 피처 차원(dim=1)으로 결합하세요.",
      "answer": "torch.cat([user_embedding, movie_embedding], dim = 1)"
    },
    {
      "id": "blank-ncf-gt-view",
      "label": "🟣 기출 변형 유력 · 정답 평점 텐서를 모델 출력과 동일한 [batch_size, -1] float32로 변환",
      "instruction": "train_data['ratings']를 .view(batch_size, -1)로 정렬한 뒤 .to(torch.float32)로 캐스팅하세요.",
      "answer": "train_data['ratings'].view(batch_size,-1).to(torch.float32)"
    },
    {
      "id": "blank-ncf-loss",
      "label": "★ 유력 · 평점 회귀 MSE Loss 계산",
      "instruction": "loss_func를 사용해 prediction과 ground_truth의 회귀 손실을 계산하세요.",
      "answer": "loss_func(prediction, ground_truth)"
    },
    {
      "id": "blank-ncf-recall-k",
      "label": "🟣 기출 변형 유력 · 사용자별 Recall@K 계산 (Top-K 내 적합 아이템 수 / 전체 적합 아이템 수)",
      "instruction": "n_real_relevant_in_top_k를 n_real_relevant로 나눈 식을 작성하세요.",
      "answer": "n_real_relevant_in_top_k / n_real_relevant"
    }
  ],
  "ondevice_quantization_cnn_subjective_test-history-v1": [
    {
      "id": "blank-quant-round",
      "label": "Scaled float 반올림 (torch.round)",
      "instruction": "scale로 나눈 실수 텐서를 가장 가까운 정수로 반올림하세요.",
      "answer": "torch.round(scaled_tensor)"
    },
    {
      "id": "blank-quant-shift",
      "label": "Zero point 이동 (+ zero_point)",
      "instruction": "반올림된 정수 텐서에 zero_point를 더해 영점을 이동하세요.",
      "answer": "rounded_tensor + zero_point"
    },
    {
      "id": "blank-quant-scale-calc",
      "label": "🟣 기출 변형 유력 1-1 · 비대칭 Quantization Scale 계산 공식",
      "instruction": "[기출 변형 유력] 실수 범위(fp_max - fp_min)를 양자화 범위(quantized_max - quantized_min)로 나누세요.",
      "answer": "(fp_max - fp_min) / (quantized_max - quantized_min)"
    },
    {
      "id": "blank-quant-zp-calc",
      "label": "🟣 기출 변형 유력 1-2 · 비대칭 Quantization Zero-Point 계산 공식",
      "instruction": "[기출 변형 유력] quantized_min에서 fp_min / scale을 빼서 실수 0에 대응하는 영점을 구하세요.",
      "answer": "quantized_min - fp_min / scale"
    },
    {
      "id": "blank-weight-sym-scale",
      "label": "🟣 기출 변형 유력 2 · 대칭(Symmetric) 가중치 Scale 계산 (fp_max / quantized_max)",
      "instruction": "[기출 변형 유력] 가중치 최대 절댓값 fp_max를 양자화 최댓값 quantized_max로 나누세요.",
      "answer": "fp_max / quantized_max"
    },
    {
      "id": "blank-quant-bias-scale",
      "label": "🟣 기출 변형 유력 3 · Bias 양자화 스케일 (input_scale * weight_scale)",
      "instruction": "[기출 변형 유력] 입력 스케일(input_scale)과 가중치 스케일(weight_scale)을 곱해 bias_scale을 구하세요.",
      "answer": "input_scale * weight_scale"
    },
    {
      "id": "blank-quant-output-scale",
      "label": "Linear output 재스케일",
      "instruction": "정수 내적 결과 output에 (input_scale * weight_scale / output_scale)을 곱하세요.",
      "answer": "output*(input_scale * weight_scale / output_scale)"
    },
    {
      "id": "blank-conv2d-bias-shift",
      "label": "🟣 기출 변형 유력 4 · Conv2d Bias 영점 보정 (sum((1,2,3)))",
      "instruction": "[기출 변형 유력] quantized_bias에서 quantized_weight.sum((1,2,3)).to(torch.int32) * input_zero_point를 빼세요.",
      "answer": "quantized_bias - quantized_weight.sum((1,2,3)).to(torch.int32) * input_zero_point"
    }
  ],
  "ondevice_pruning_cnn_subjective_test-history-v1": [
    {
      "id": "blank-prune-count",
      "label": "Fine-grained 제거할 가중치 개수 (round)",
      "instruction": "전체 가중치 원소 수(weight.numel())에 sparsity를 곱해 반올림한 제거 개수를 구하세요.",
      "answer": "round(weight.numel() * sparsity)"
    },
    {
      "id": "blank-prune-threshold",
      "label": "k번째 중요도 threshold (kthvalue)",
      "instruction": "1차원으로 펼친 importance에서 num_pruned_elements번째 작은 값을 구하세요.",
      "answer": "torch.kthvalue(importance.flatten(), num_pruned_elements)[0]"
    },
    {
      "id": "blank-prune-mask",
      "label": "유지할 weight mask (>)",
      "instruction": "importance가 threshold보다 큰 위치만 남기는 boolean mask를 작성하세요.",
      "answer": "importance > threshold"
    },
    {
      "id": "blank-kernel-prune-count",
      "label": "🟣 기출 변형 유력 1-1 · Kernel-level 프루닝할 커널 수 계산 (round)",
      "instruction": "[기출 변형 유력] 전체 2D 커널 개수(num_kernels)에 sparsity를 곱하고 round()로 반올림하세요.",
      "answer": "round(num_kernels * sparsity)"
    },
    {
      "id": "blank-kernel-prune-importance",
      "label": "🟣 기출 변형 유력 1-2 · Kernel-level 커널별 절댓값 합 중요도 (dim=(2, 3))",
      "instruction": "[기출 변형 유력] 커널 높이(2)와 너비(3) 축에 대해 절댓값 합을 keepdim=True로 계산하세요.",
      "answer": "weight.abs().sum(dim=(2, 3), keepdim=True)"
    },
    {
      "id": "blank-channel-prune-count",
      "label": "🔴 2026-09 기출 1-1 · 프루닝할 채널 수 계산 (round)",
      "instruction": "[2026-09 기출] 입력 채널 수(num_channels)에 sparsity를 곱하고 round()로 반올림해 프루닝할 채널 수를 계산하세요.",
      "answer": "round(num_channels * sparsity)"
    },
    {
      "id": "blank-channel-prune-importance",
      "label": "🔴 2026-09 기출 1-2 · 채널별 절댓값 합 중요도 (abs, sum, dim=(0,2,3))",
      "instruction": "[2026-09 기출] 출력 채널(0), 커널 높이(2), 커널 너비(3) 축에 대해 가중치 절댓값 합을 keepdim=True로 계산하세요.",
      "answer": "weight.abs().sum(dim=(0, 2, 3), keepdim=True)"
    },
    {
      "id": "blank-channel-mask-expand",
      "label": "🔴 2026-09 기출 1-3 · 채널 마스크를 가중치 크기로 확장 (expand_as)",
      "instruction": "[2026-09 기출] (1, C, 1, 1) 형태의 채널 마스크를 원본 weight와 동일한 4D 크기로 확장하세요.",
      "answer": "mask.expand_as(weight)"
    },
    {
      "id": "blank-global-prune-cat",
      "label": "🟣 기출 변형 유력 2 · Global Pruning 전체 가중치 1D 결합 (torch.cat)",
      "instruction": "[기출 변형 유력] 레이어별 1D 가중치 리스트 parameters_to_prune을 하나의 텐서로 이어붙이세요.",
      "answer": "torch.cat(parameters_to_prune)"
    }
  ],
  "ondevice_distillation_subjective_test-history-v1": [
    {
      "id": "blank-teacher-logits",
      "label": "Teacher forward (teacher(inputs))",
      "instruction": "torch.no_grad() 블록 안에서 교사 모델에 inputs를 통과시켜 로짓을 얻으세요.",
      "answer": "teacher(inputs)"
    },
    {
      "id": "blank-teacher-soft-targets",
      "label": "🟣 기출 변형 유력 1 · Teacher 온도 스케일링 Softmax (teacher_logits / T)",
      "instruction": "[기출 변형 유력] teacher_logits를 온도 T로 나누고 dim=-1에 대해 nn.functional.softmax를 적용하세요.",
      "answer": "nn.functional.softmax(teacher_logits / T, dim=-1)"
    },
    {
      "id": "blank-student-prob",
      "label": "Student Temperature softmax (student_logits / T)",
      "instruction": "student_logits를 온도 T로 나누고 dim=-1에 대해 nn.functional.softmax를 적용하세요.",
      "answer": "nn.functional.softmax(student_logits / T, dim=-1)"
    },
    {
      "id": "blank-distill-loss",
      "label": "Soft-target + label loss 가중합 결합",
      "instruction": "soft_target_loss_weight * soft_targets_loss와 ce_loss_weight * label_loss를 더하세요.",
      "answer": "soft_target_loss_weight * soft_targets_loss + ce_loss_weight * label_loss"
    },
    {
      "id": "blank-cosine-distill-loss",
      "label": "🟣 기출 변형 유력 2 · 은닉 표현 CosineEmbeddingLoss 계산 (target=ones)",
      "instruction": "[기출 변형 유력] cosine_loss에 student_hidden_representation, teacher_hidden_representation, target=torch.ones(inputs.size(0)).cuda()를 전달하세요.",
      "answer": "cosine_loss(student_hidden_representation, teacher_hidden_representation, target=torch.ones(inputs.size(0)).cuda())"
    },
    {
      "id": "blank-mse-distill-loss",
      "label": "🟣 기출 변형 유력 3 · 특성 맵 Regressor MSE 손실 계산 (mse_loss)",
      "instruction": "[기출 변형 유력] mse_loss(regressor_feature_map, teacher_feature_map)로 중간 특성 맵 손실을 계산하세요.",
      "answer": "mse_loss(regressor_feature_map, teacher_feature_map)"
    }
  ],
  "ondevice_pruning_llm_subjective_test-history-v1": [
    {
      "id": "blank-llm-prune-importance",
      "label": "Magnitude 중요도 (torch.abs(W))",
      "instruction": "가중치 행렬 W의 절댓값을 계산해 중요도로 저장하세요.",
      "answer": "torch.abs(W)"
    },
    {
      "id": "blank-llm-prune-threshold",
      "label": "제거 개수 기준 threshold (kthvalue)",
      "instruction": "1차원으로 펼친 importance에서 num_zeros번째 작은 값을 구하세요.",
      "answer": "torch.kthvalue(importance.flatten(), num_zeros)[0]"
    },
    {
      "id": "blank-llm-prune-mask",
      "label": "남길 weight mask (>)",
      "instruction": "importance가 threshold보다 큰 위치만 남기는 마스크를 만드세요.",
      "answer": "importance > threshold"
    },
    {
      "id": "blank-wanda-act-norm",
      "label": "🟣 기출 변형 유력 1 · WANDA 입력 활성화 L2 Norm 제곱 (torch.norm)",
      "instruction": "[기출 변형 유력] x (hidden_size, batch_size)에서 배치 축(dim=1)에 대해 L2 norm(p=2)의 제곱을 계산하세요.",
      "answer": "torch.norm(x, p=2, dim=1) ** 2"
    },
    {
      "id": "blank-wanda-importance",
      "label": "🟣 기출 변형 유력 2-1 · WANDA 가중치×활성화 중요도 (torch.abs(W) * input_feat[n])",
      "instruction": "[기출 변형 유력] 가중치 절댓값 torch.abs(W)에 입력 채널별 활성화 norm(input_feat[n])을 곱하세요.",
      "answer": "torch.abs(W) * input_feat[n]"
    },
    {
      "id": "blank-wanda-threshold",
      "label": "🟣 기출 변형 유력 2-2 · WANDA 출력 행(dim=1)별 threshold 추출 (kthvalue)",
      "instruction": "[기출 변형 유력] 각 출력 채널 행(dim=1)마다 num_zeros_per_row번째 작은 값을 torch.kthvalue로 구하세요.",
      "answer": "torch.kthvalue(importance, num_zeros_per_row, dim=1)[0]"
    },
    {
      "id": "blank-wanda-mask",
      "label": "🟣 기출 변형 유력 2-3 · WANDA 행별 브로드캐스팅 마스크 (threshold.reshape(row, 1))",
      "instruction": "[기출 변형 유력] threshold를 (row, 1)로 변형해 importance > threshold.reshape(row, 1) 마스크를 만드세요.",
      "answer": "importance > threshold.reshape(row, 1)"
    }
  ],
  "ondevice_quantization_llm_subjective_test-history-v1": [
    {
      "id": "blank-outlier-mask",
      "label": "상위 1% 중요 채널 선택 (torch.topk)",
      "instruction": "importance에서 상위 num_samples개 채널의 인덱스([1])를 추출하세요.",
      "answer": "torch.topk(importance, int(len(importance) * 0.01))[1]"
    },
    {
      "id": "blank-scaleup",
      "label": "Quantization 전 중요 채널 확장 (*= scale_factor)",
      "instruction": "양자화 전에 outlier_mask 채널의 가중치에 scale_factor를 곱하세요.",
      "answer": "m.weight.data[:, outlier_mask] *= scale_factor"
    },
    {
      "id": "blank-scaledown",
      "label": "Quantization 후 원래 scale 복원 (/= scale_factor)",
      "instruction": "양자화 후에 outlier_mask 채널의 가중치를 다시 scale_factor로 나누세요.",
      "answer": "m.weight.data[:, outlier_mask] /= scale_factor"
    },
    {
      "id": "blank-awq-grid-scale",
      "label": "🟣 기출 변형 유력 1 · AWQ 활성화 기반 스케일 탐색 (s_x ** ratio)",
      "instruction": "[기출 변형 유력] 채널별 입력 활성화 평균 크기 s_x에 탐색 비율 ratio를 거듭제곱하세요.",
      "answer": "s_x ** ratio"
    },
    {
      "id": "blank-smooth-ln-div",
      "label": "🟣 기출 변형 유력 2-1 · SmoothQuant LayerNorm 스케일 축소 (div_)",
      "instruction": "[기출 변형 유력] ln.weight와 ln.bias를 각각 div_(scale)로 인플레이스 나눗셈하세요.",
      "answer": "ln.weight.div_(scale)\n    ln.bias.div_(scale)"
    },
    {
      "id": "blank-smooth-fc-mul",
      "label": "🟣 기출 변형 유력 2-2 · SmoothQuant FC 가중치 스케일 보상 (mul_)",
      "instruction": "[기출 변형 유력] fc.weight에 mul_(scale)로 스케일을 인플레이스 곱셈하세요.",
      "answer": "fc.weight.mul_(scale)"
    },
    {
      "id": "blank-smooth-alpha-scales",
      "label": "🟣 기출 변형 유력 3 · SmoothQuant alpha 거듭제곱 스케일 공식 (pow)",
      "instruction": "[기출 변형 유력] act_scales.pow(alpha)를 weight_scales.pow(1 - alpha)로 나누어 채널별 이동 스케일을 계산하세요.",
      "answer": "act_scales.pow(alpha) / weight_scales.pow(1 - alpha)"
    },
    {
      "id": "blank-quarot-linear",
      "label": "🟣 기출 변형 유력 4 · QuaRot Linear 가중치 직교 행렬 회전 (W_ @ R1)",
      "instruction": "[기출 변형 유력] Linear 가중치 W_ (out_features, in_features)에 회전 행렬 R1 (in_features, in_features)을 행렬곱(@)하세요.",
      "answer": "W_ @ R1"
    }
  ],
  "llm_chapter_2_subjective_test-history-v1": [
    {
      "id": "blank-token-encode",
      "label": "문자열을 token ID로 인코딩",
      "answer": "encode"
    },
    {
      "id": "blank-token-decode",
      "label": "token ID를 문자열로 디코딩",
      "answer": "decode"
    },
    {
      "id": "blank-next-token-start",
      "label": "next-token 시작 인덱스",
      "answer": "1"
    },
    {
      "id": "blank-next-token-end",
      "label": "next-token 끝 인덱스 보정",
      "answer": "1"
    },
    {
      "id": "blank-input-start",
      "label": "입력 윈도우 시작 인덱스",
      "answer": "i"
    },
    {
      "id": "blank-input-end",
      "label": "입력 윈도우 끝 인덱스 기준",
      "answer": "i"
    },
    {
      "id": "blank-target-start-i",
      "label": "target 시작 위치 기준",
      "answer": "i"
    },
    {
      "id": "blank-target-start-offset",
      "label": "target 시작 한 칸 이동",
      "answer": "1"
    },
    {
      "id": "blank-target-end-i",
      "label": "target 끝 위치 기준",
      "answer": "i"
    },
    {
      "id": "blank-target-end-offset",
      "label": "target 끝 한 칸 보정",
      "answer": "1"
    },
    {
      "id": "blank-dataloader-dataset",
      "label": "DataLoader에 전달할 Dataset",
      "answer": "dataset"
    },
    {
      "id": "blank-embedding-vocab",
      "label": "Embedding vocab_size",
      "answer": "vocab_size"
    },
    {
      "id": "blank-embedding-dim",
      "label": "Embedding output_dim",
      "answer": "output_dim"
    },
    {
      "id": "blank-embedding-input",
      "label": "Embedding 입력 token ID",
      "answer": "input_ids"
    },
    {
      "id": "blank-ch2-pos-emb-layer",
      "label": "🟣 기출 변형 유력 · 위치 임베딩 층(torch.nn.Embedding) 정의",
      "hint": "문맥 길이(context_length)를 입력 사전 크기로, output_dim을 임베딩 차원으로 하는 torch.nn.Embedding 층을 생성합니다.",
      "answer": "torch.nn.Embedding(context_length, output_dim)"
    },
    {
      "id": "blank-ch2-pos-emb-lookup",
      "label": "🟣 기출 변형 유력 · torch.arange(max_length) 위치 임베딩 조회",
      "hint": "torch.arange(max_length)로 [0, 1, ..., max_length-1] 위치 인덱스를 생성하여 pos_embedding_layer에 통과시킵니다.",
      "answer": "pos_embedding_layer(torch.arange(max_length))"
    },
    {
      "id": "blank-input-embeddings",
      "label": "GPT 입력 임베딩 합산",
      "answer": "token_embeddings + pos_embeddings"
    }
  ],
  "llm_chapter_3_subjective_test-history-v1": [
    {
      "id": "blank-ch3-w-query",
      "label": "🟣 기출 변형 유력 · CausalAttention Query 선형 투영 층 정의",
      "hint": "nn.Linear(d_in, d_out, bias=qkv_bias)로 Query 투영 행렬을 정의합니다.",
      "answer": "nn.Linear(d_in, d_out, bias=qkv_bias)"
    },
    {
      "id": "blank-key",
      "label": "Key 투영",
      "answer": "self.W_key(x)"
    },
    {
      "id": "blank-score",
      "label": "Q·K 내적 점수",
      "answer": "queries @ keys.transpose(1, 2)"
    },
    {
      "id": "blank-ch3-causal-mask",
      "label": "🟣 기출 변형 유력 · Causal Mask 인플레이스 적용(masked_fill_)",
      "hint": "attn_scores.masked_fill_(self.mask.bool()[:num_tokens, :num_tokens], -torch.inf)를 호출해 상삼각 영역을 음의 무한대로 채웁니다.",
      "answer": "attn_scores.masked_fill_(self.mask.bool()[:num_tokens, :num_tokens], -torch.inf)"
    },
    {
      "id": "blank-ch3-scaled-softmax",
      "label": "🟣 기출 변형 유력 · Scaled Dot-Product Softmax 가중치 계산",
      "hint": "torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)로 스케일링된 어텐션 확률 분포를 구합니다.",
      "answer": "torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)"
    },
    {
      "id": "blank-context",
      "label": "Value 가중합",
      "answer": "attn_weights @ values"
    },
    {
      "id": "blank-ch3-mha-headdim",
      "label": "🟣 기출 변형 유력 · MultiHeadAttention 개별 헤드 차원(head_dim) 계산",
      "hint": "전체 출력 차원 d_out을 헤드 개수 num_heads로 정수 나눗셈(//)합니다.",
      "answer": "d_out // num_heads"
    },
    {
      "id": "blank-mha-keys-view",
      "label": "🔴 2026-09 기출 1-1 · MHA keys 헤드 분할 (view)",
      "answer": "keys.view(b, num_tokens, self.num_heads, self.head_dim)"
    },
    {
      "id": "blank-mha-values-view",
      "label": "🔴 2026-09 기출 1-2 · MHA values 헤드 분할 (view)",
      "answer": "values.view(b, num_tokens, self.num_heads, self.head_dim)"
    },
    {
      "id": "blank-mha-queries-view",
      "label": "🔴 2026-09 기출 1-3 · MHA queries 헤드 분할 (view)",
      "answer": "queries.view(b, num_tokens, self.num_heads, self.head_dim)"
    },
    {
      "id": "blank-mha-keys-transpose",
      "label": "🔴 2026-09 기출 1-4 · MHA 헤드 축 전치 (transpose)",
      "answer": "keys.transpose(1, 2)"
    },
    {
      "id": "blank-ch3-mha-scores",
      "label": "🟣 기출 변형 유력 · Multi-Head Q·K^T 어텐션 스코어 행렬곱",
      "hint": "4차원 텐서 (b, num_heads, num_tokens, head_dim)에서 마지막 두 차원(2번과 3번)을 전치한 keys.transpose(2, 3)와 queries를 행렬곱(@)합니다.",
      "answer": "queries @ keys.transpose(2, 3)"
    },
    {
      "id": "blank-mha-concat-view",
      "label": "🔴 2026-09 기출 1-5 · MHA 헤드 재결합 (contiguous view)",
      "answer": "context_vec.contiguous().view(b, num_tokens, self.d_out)"
    }
  ],
  "llm_chapter_4_subjective_test-history-v1": [
    {
      "id": "blank-mha-view",
      "label": "🔴 2026-09 기출 1 · MultiHeadAttention QKV 헤드 분할 (view)",
      "instruction": "주석 # (b, num_tokens, d_out) -> (b, num_tokens, num_heads, head_dim)에 맞춰 keys, values, queries 세 텐서를 .view(...)로 분할하세요.",
      "answer": "keys = keys.view(b, num_tokens, self.num_heads, self.head_dim)\nvalues = values.view(b, num_tokens, self.num_heads, self.head_dim)\nqueries = queries.view(b, num_tokens, self.num_heads, self.head_dim)"
    },
    {
      "id": "blank-ch4-ln-affine",
      "label": "🟣 기출 변형 유력 · LayerNorm 스케일·시프트 아핀 변환",
      "hint": "정규화된 norm_x에 self.scale을 곱하고 self.shift를 더합니다.",
      "answer": "self.scale * norm_x + self.shift"
    },
    {
      "id": "blank-ch4-ffn-expand",
      "label": "🟣 기출 변형 유력 · FeedForward 차원 4배 확장 선형 층",
      "hint": "nn.Linear(cfg[\"emb_dim\"], 4 * cfg[\"emb_dim\"])로 은닉 차원을 4배 확장합니다.",
      "answer": "nn.Linear(cfg[\"emb_dim\"], 4 * cfg[\"emb_dim\"])"
    },
    {
      "id": "blank-ch4-ffn-contract",
      "label": "🟣 기출 변형 유력 · FeedForward 차원 축소(원복) 선형 층",
      "hint": "nn.Linear(4 * cfg[\"emb_dim\"], cfg[\"emb_dim\"])로 다시 원래 임베딩 차원으로 축소합니다.",
      "answer": "nn.Linear(4 * cfg[\"emb_dim\"], cfg[\"emb_dim\"])"
    },
    {
      "id": "blank-mha-init",
      "label": "🔴 2026-09 기출 2-1 · TransformerBlock self.att (MultiHeadAttention) 할당",
      "instruction": "cfg 딕셔너리의 emb_dim, context_length, n_heads, drop_rate, qkv_bias를 사용해 MultiHeadAttention 인스턴스를 생성하세요.",
      "answer": "MultiHeadAttention(\n    d_in=cfg[\"emb_dim\"],\n    d_out=cfg[\"emb_dim\"],\n    context_length=cfg[\"context_length\"],\n    num_heads=cfg[\"n_heads\"],\n    dropout=cfg[\"drop_rate\"],\n    qkv_bias=cfg[\"qkv_bias\"])"
    },
    {
      "id": "blank-trf-att",
      "label": "🔴 2026-09 기출 2-2 · TransformerBlock 어텐션 블록 호출 (self.att)",
      "instruction": "Pre-LayerNorm(self.norm1)을 거친 x에 멀티헤드 어텐션(self.att)을 적용하세요.",
      "answer": "self.att(x)"
    },
    {
      "id": "blank-trf-ff",
      "label": "🔴 2026-09 기출 2-3 · TransformerBlock 피드포워드 블록 호출 (self.ff)",
      "instruction": "두 번째 LayerNorm(self.norm2)을 거친 x에 피드포워드 네트워크(self.ff)를 적용하세요.",
      "answer": "self.ff(x)"
    },
    {
      "id": "blank-tok-emb",
      "label": "🔴 2026-09 기출 3-1 · GPTModel 토큰 임베딩 레이어 (self.tok_emb)",
      "instruction": "cfg[\"vocab_size\"]와 cfg[\"emb_dim\"]을 인자로 받는 nn.Embedding 레이어를 선언하세요.",
      "answer": "nn.Embedding(cfg[\"vocab_size\"], cfg[\"emb_dim\"])"
    },
    {
      "id": "blank-pos-emb",
      "label": "🔴 2026-09 기출 3-2 · GPTModel 위치 임베딩 레이어 (self.pos_emb)",
      "instruction": "cfg[\"context_length\"]와 cfg[\"emb_dim\"]을 인자로 받는 nn.Embedding 레이어를 선언하세요.",
      "answer": "nn.Embedding(cfg[\"context_length\"], cfg[\"emb_dim\"])"
    },
    {
      "id": "blank-trf-blocks-init",
      "label": "🔴 2026-09 기출 3-3 · GPTModel 트랜스포머 블록 적층 (self.trf_blocks)",
      "instruction": "cfg[\"n_layers\"] 개수만큼 TransformerBlock(cfg)을 생성해 nn.Sequential(*[...])로 묶으세요.",
      "answer": "nn.Sequential(\n    *[TransformerBlock(cfg) for _ in range(cfg[\"n_layers\"])])"
    },
    {
      "id": "blank-output-head",
      "label": "🔴 2026-09 기출 3-4 · GPTModel Vocabulary 출력 Head (self.out_head)",
      "instruction": "임베딩 차원(cfg[\"emb_dim\"])을 단어장 크기(cfg[\"vocab_size\"])로 투영하는 선형 레이어를 bias=False로 선언하세요.",
      "answer": "nn.Linear(cfg[\"emb_dim\"], cfg[\"vocab_size\"], bias=False)"
    },
    {
      "id": "blank-emb-sum",
      "label": "🔴 2026-09 기출 4-1 · GPTModel 토큰 임베딩 + 위치 임베딩 합산",
      "instruction": "위에서 계산한 tok_embeds와 pos_embeds를 더하는 식을 작성하세요.",
      "answer": "tok_embeds + pos_embeds"
    },
    {
      "id": "blank-trf-blocks-call",
      "label": "🔴 2026-09 기출 4-2 · GPTModel 트랜스포머 블록 통과 (self.trf_blocks)",
      "instruction": "드롭아웃을 거친 임베딩 x를 self.trf_blocks에 통과시키는 식을 작성하세요.",
      "answer": "self.trf_blocks(x)"
    },
    {
      "id": "blank-out-head-call",
      "label": "🔴 2026-09 기출 4-3 · GPTModel 최종 로짓 출력 계산 (self.out_head)",
      "instruction": "final_norm을 거친 x를 self.out_head에 통과시켜 각 단어의 예측 점수(logits)를 구하는 식을 작성하세요.",
      "answer": "self.out_head(x)"
    },
    {
      "id": "blank-no-grad-pred",
      "label": "🔴 2026-09 기출 5 · 모델 예측 (with torch.no_grad)",
      "instruction": "기울기 계산 없이(with torch.no_grad():) model(idx_cond)를 호출해 logits에 저장하는 두 줄을 작성하세요.",
      "answer": "with torch.no_grad():\n    logits = model(idx_cond)"
    },
    {
      "id": "blank-last-logits",
      "label": "🔴 2026-09 기출 6-1 · 마지막 타임스텝 logits 슬라이싱",
      "instruction": "(batch, n_token, vocab_size)에서 마지막 타임스텝(-1)만 선택해 (batch, vocab_size)로 만드는 슬라이싱 식을 작성하세요.",
      "answer": "logits[:, -1, :]"
    },
    {
      "id": "blank-greedy-argmax",
      "label": "🔴 2026-09 기출 6-2 · Greedy 토큰 선택 (torch.argmax)",
      "instruction": "마지막 차원(dim=-1)에서 가장 큰 로짓의 인덱스를 차원 유지(keepdim=True)하여 구하는 식을 작성하세요.",
      "answer": "torch.argmax(logits, dim=-1, keepdim=True)"
    },
    {
      "id": "blank-cat-next",
      "label": "🔴 2026-09 기출 6-3 · 시퀀스 이어붙이기 (torch.cat)",
      "instruction": "현재 시퀀스 idx와 다음 토큰 idx_next를 시간축(dim=1)으로 이어 붙이는 식을 작성하세요.",
      "answer": "torch.cat((idx, idx_next), dim=1)"
    }
  ],
  "llm_chapter_5_subjective_test-history-v1": [
    {
      "id": "blank-cross-entropy",
      "label": "Token 단위 Cross Entropy",
      "answer": "torch.nn.functional.cross_entropy(\n    logits.flatten(0, 1),\n    target_batch.flatten()\n)"
    },
    {
      "id": "blank-ch5-model-train",
      "label": "🟣 기출 변형 유력 · 에폭 시작 시 학습 모드 전환(model.train)",
      "hint": "드롭아웃 등이 학습 모드로 동작하도록 model.train()을 호출합니다.",
      "answer": "model.train()"
    },
    {
      "id": "blank-zero-grad",
      "label": "Gradient 초기화",
      "answer": "optimizer.zero_grad()"
    },
    {
      "id": "blank-ch5-calc-loss-batch",
      "label": "🟣 기출 변형 유력 · 배치 손실 계산 함수(calc_loss_batch) 호출",
      "hint": "앞서 정의한 calc_loss_batch(input_batch, target_batch, model, device)를 호출합니다.",
      "answer": "calc_loss_batch(input_batch, target_batch, model, device)"
    },
    {
      "id": "blank-backward",
      "label": "역전파",
      "answer": "loss.backward()"
    },
    {
      "id": "blank-step",
      "label": "Optimizer 갱신",
      "answer": "optimizer.step()"
    },
    {
      "id": "blank-ch5-last-logits",
      "label": "🟣 기출 변형 유력 · 생성 시 마지막 타임스텝 로짓 슬라이싱(logits[:, -1, :])",
      "hint": "시퀀스 차원(1번 축)의 마지막 위치(-1)만 슬라이싱하여 logits[:, -1, :]를 선택합니다.",
      "answer": "logits[:, -1, :]"
    },
    {
      "id": "blank-ch5-argmax-next",
      "label": "🟣 기출 변형 유력 · Greedy Decoding 다음 토큰 인덱스 선택(torch.argmax)",
      "hint": "torch.argmax(logits, dim=-1, keepdim=True)로 (batch, 1) 차원의 다음 토큰 인덱스를 구합니다.",
      "answer": "torch.argmax(logits, dim=-1, keepdim=True)"
    },
    {
      "id": "blank-ch5-cat-idx",
      "label": "🟣 기출 변형 유력 · 생성된 다음 토큰 시퀀스 이어붙이기(torch.cat)",
      "hint": "torch.cat((idx, idx_next), dim=1)로 시퀀스 길이를 1 늘립니다.",
      "answer": "torch.cat((idx, idx_next), dim=1)"
    },
    {
      "id": "blank-ch5-unsqueeze-batch",
      "label": "🟣 기출 변형 유력 · 토큰 ID 텐서 변환 및 배치 차원 추가(unsqueeze(0))",
      "hint": "torch.tensor(encoded).unsqueeze(0)으로 1차원 토큰 리스트를 (1, seq_len) 2차원 배치 텐서로 만듭니다.",
      "answer": "torch.tensor(encoded).unsqueeze(0)"
    }
  ],
  "llm_chapter_6a_classification_subjective_test-history-v1": [
    {
      "id": "blank-ch6a-label",
      "label": "정답 Label column",
      "answer": "[\"Label\"]"
    },
    {
      "id": "blank-ch6a-truncate",
      "label": "최대 길이 truncation",
      "answer": "encoded_text[:self.max_length]"
    },
    {
      "id": "blank-ch6a-padding",
      "label": "Padding token ID",
      "answer": "[pad_token_id]"
    },
    {
      "id": "blank-ch6a-last-token-logits",
      "label": "🟣 기출 변형 유력 · 분류 파인튜닝 마지막 토큰 로짓 추출(model(input_batch)[:, -1, :])",
      "hint": "Causal Attention 특성상 문장 전체 정보가 모이는 마지막 타임스텝(-1)의 출력 model(input_batch)[:, -1, :]을 추출합니다.",
      "answer": "model(input_batch)[:, -1, :]"
    },
    {
      "id": "blank-ch6a-ce-loss",
      "label": "🟣 기출 변형 유력 · 분류 파인튜닝 교차 엔트로피 손실 계산",
      "hint": "torch.nn.functional.cross_entropy(logits, target_batch)로 분류 손실을 계산합니다.",
      "answer": "torch.nn.functional.cross_entropy(logits, target_batch)"
    },
    {
      "id": "blank-ch6a-freeze-all",
      "label": "🟣 기출 변형 유력 · 사전학습 모델 전체 파라미터 동결(requires_grad = False)",
      "hint": "param.requires_grad = False로 백본 가중치 업데이트를 비활성화합니다.",
      "answer": "param.requires_grad = False"
    },
    {
      "id": "blank-ch6a-replace-head",
      "label": "🟣 기출 변형 유력 · 분류용 출력 헤드(model.out_head) 교체",
      "hint": "torch.nn.Linear(in_features=BASE_CONFIG[\"emb_dim\"], out_features=num_classes)로 기존 어휘 사전 크기 헤드를 2클래스 분류 헤드로 교체합니다.",
      "answer": "torch.nn.Linear(in_features=BASE_CONFIG[\"emb_dim\"], out_features=num_classes)"
    },
    {
      "id": "blank-ch6a-unfreeze-last",
      "label": "🟣 기출 변형 유력 · 마지막 Transformer 블록 학습 활성화(requires_grad = True)",
      "hint": "param.requires_grad = True로 마지막 블록(trf_blocks[-1])의 가중치 학습을 켭니다.",
      "answer": "param.requires_grad = True"
    }
  ],
  "llm_chapter_6b_lora_subjective_test-history-v1": [
    {
      "id": "blank-ch6b-a",
      "label": "LoRA A down-projection",
      "answer": "nn.Parameter(torch.empty(in_dim, self.rank))"
    },
    {
      "id": "blank-ch6b-lora-b-zero",
      "label": "🟣 기출 변형 유력 · LoRA 행렬 B 영행렬(torch.zeros) 초기화",
      "hint": "nn.Parameter(torch.zeros(self.rank, out_dim))로 행렬 B를 0으로 초기화합니다.",
      "answer": "nn.Parameter(torch.zeros(self.rank, out_dim))"
    },
    {
      "id": "blank-ch6b-delta",
      "label": "LoRA scaled delta",
      "answer": "(self.alpha / self.rank) * (x @ self.A @ self.B)"
    },
    {
      "id": "blank-ch6b-residual",
      "label": "Linear + LoRA 결과 결합",
      "answer": "self.linear(x) + self.lora(x)"
    },
    {
      "id": "blank-ch6b-isinstance-linear",
      "label": "🟣 기출 변형 유력 · LoRA 교체 대상 선형 층 판별(isinstance)",
      "hint": "isinstance(module, torch.nn.Linear)로 현재 자식 모듈이 선형 계층인지 확인합니다.",
      "answer": "isinstance(module, torch.nn.Linear)"
    },
    {
      "id": "blank-ch6b-setattr-lora",
      "label": "🟣 기출 변형 유력 · setattr을 이용한 LinearWithLoRA 계층 교체",
      "hint": "setattr(model, name, LinearWithLoRA(module, rank, alpha))로 기존 선형 계층을 교체합니다.",
      "answer": "setattr(model, name, LinearWithLoRA(module, rank, alpha))"
    },
    {
      "id": "blank-ch6b-apply-lora",
      "label": "🟣 기출 변형 유력 · 모델 전체 LoRA 계층 일괄 적용 호출",
      "hint": "replace_linear_with_lora(model, rank=LORA_RANK, alpha=LORA_ALPHA)를 호출합니다.",
      "answer": "replace_linear_with_lora(model, rank=LORA_RANK, alpha=LORA_ALPHA)"
    }
  ],
  "llm_chapter_7a_instruction_subjective_test-history-v1": [
    {
      "id": "blank-ch7a-full-text",
      "label": "🟣 기출 변형 유력 · Instruction 프롬프트와 Response 텍스트 결합",
      "hint": "instruction_plus_input + response_text로 전체 학습 시퀀스 문자열을 만듭니다.",
      "answer": "instruction_plus_input + response_text"
    },
    {
      "id": "blank-ch7a-eos",
      "label": "Sequence 끝 pad token",
      "answer": "pad_token_id"
    },
    {
      "id": "blank-ch7a-padding",
      "label": "Batch padding token",
      "answer": "pad_token_id"
    },
    {
      "id": "blank-ch7a-input-shift",
      "label": "Input 마지막 token 제외",
      "answer": "-1"
    },
    {
      "id": "blank-ch7a-inst-targets",
      "label": "🟣 기출 변형 유력 · Instruction Collator 1칸 우측 시프트 타겟 텐서 생성",
      "hint": "torch.tensor(padded[1:])로 입력과 1칸 어긋난 다음 토큰 정답 시퀀스를 만듭니다.",
      "answer": "torch.tensor(padded[1:])"
    },
    {
      "id": "blank-ch7a-pad-mask",
      "label": "🟣 기출 변형 유력 · 타겟 시퀀스 내 패딩 토큰 위치 불리언 마스크 생성",
      "hint": "targets == pad_token_id 비교 연산으로 패딩 토큰 위치를 찾습니다.",
      "answer": "targets == pad_token_id"
    },
    {
      "id": "blank-ch7a-ignore-index",
      "label": "🟣 기출 변형 유력 · 첫 패딩 토큰 이후 패딩 위치 ignore_index(-100) 마스킹",
      "hint": "targets[indices[1:]] = ignore_index로 두 번째 패딩 토큰부터 -100을 대입합니다.",
      "answer": "targets[indices[1:]] = ignore_index"
    }
  ],
  "llm_chapter_7b_dpo_subjective_test-history-v1": [
    {
      "id": "blank-ch7b-chosen",
      "label": "Chosen response 연결",
      "answer": "chosen_response"
    },
    {
      "id": "blank-ch7b-rejected",
      "label": "Rejected response 연결",
      "answer": "rejected_response"
    },
    {
      "id": "blank-ch7b-label-shift",
      "label": "DPO label next-token shift",
      "answer": "1"
    },
    {
      "id": "blank-ch7b-shift-logits",
      "label": "🟣 기출 변형 유력 · DPO 로그 확률 계산용 로짓 시점 정렬(logits[:, :-1, :])",
      "hint": "labels = labels[:, 1:]와 길이를 맞추기 위해 마지막 토큰 로짓을 제외한 logits[:, :-1, :]를 선택합니다.",
      "answer": "logits[:, :-1, :]"
    },
    {
      "id": "blank-ch7b-gather-logprobs",
      "label": "🟣 기출 변형 유력 · torch.gather를 이용한 정답 토큰 로그 확률 추출",
      "hint": "torch.gather(input=log_probs, dim=-1, index=labels.unsqueeze(-1)).squeeze(-1)로 각 위치의 실제 토큰 로그 확률을 수집합니다.",
      "answer": "torch.gather(input=log_probs, dim=-1, index=labels.unsqueeze(-1)).squeeze(-1)"
    },
    {
      "id": "blank-ch7b-model-logratios",
      "label": "🟣 기출 변형 유력 · DPO 정책 모델 선호/비선호 로그 확률 차이 계산",
      "hint": "model_chosen_logprobs - model_rejected_logprobs를 계산합니다.",
      "answer": "model_chosen_logprobs - model_rejected_logprobs"
    },
    {
      "id": "blank-ch7b-ref-logratios",
      "label": "🟣 기출 변형 유력 · DPO 기준(Reference) 모델 선호/비선호 로그 확률 차이 계산",
      "hint": "reference_chosen_logprobs - reference_rejected_logprobs를 계산합니다.",
      "answer": "reference_chosen_logprobs - reference_rejected_logprobs"
    },
    {
      "id": "blank-ch7b-dpo-logits",
      "label": "🟣 기출 변형 유력 · DPO 정책-기준 로그 비율 차분(logits) 계산",
      "hint": "model_logratios - reference_logratios로 정책 모델이 기준 모델 대비 선호 응답을 얼마나 더 높게 평가하는지 구합니다.",
      "answer": "model_logratios - reference_logratios"
    },
    {
      "id": "blank-ch7b-dpo-loss",
      "label": "🟣 기출 변형 유력 · DPO 최종 손실 함수(-F.logsigmoid(beta * logits))",
      "hint": "-F.logsigmoid(beta * logits)로 Bradley-Terry 선호도 모델 기반 음의 로그 우도를 계산합니다.",
      "answer": "-F.logsigmoid(beta * logits)"
    }
  ],
  "rag_subjective_test-history-v1": [
    {
      "id": "blank-documents",
      "label": "문서 로드 (SimpleDirectoryReader(\"data\").load_data())",
      "answer": "SimpleDirectoryReader(\"data\").load_data()"
    },
    {
      "id": "blank-index",
      "label": "🔴 2026-09 기출 1 · VectorStoreIndex 생성 (VectorStoreIndex.from_documents(documents))",
      "instruction": "로드한 documents 리스트를 입력받아 VectorStoreIndex.from_documents(documents)로 벡터 인덱스를 생성하세요.",
      "answer": "VectorStoreIndex.from_documents(documents)"
    },
    {
      "id": "blank-llama-splitter",
      "label": "🟣 기출 변형 유력 · SentenceSplitter 청크 크기·오버랩 설정",
      "hint": "SentenceSplitter(chunk_size=1024, chunk_overlap=200)으로 문장 분할기를 초기화합니다.",
      "answer": "SentenceSplitter(chunk_size=1024, chunk_overlap=200)"
    },
    {
      "id": "blank-llama-get-nodes",
      "label": "🟣 기출 변형 유력 · Document 리스트에서 Node 분할 추출(get_nodes_from_documents)",
      "hint": "parser.get_nodes_from_documents(documents)를 호출해 문서를 노드 리스트로 분할합니다.",
      "answer": "parser.get_nodes_from_documents(documents)"
    },
    {
      "id": "blank-query",
      "label": "🔴 2026-09 기출 2 · Query Engine 변환 (index.as_query_engine())",
      "instruction": "생성된 index 객체에서 index.as_query_engine()을 호출해 질의응답 엔진을 생성하세요.",
      "answer": "index.as_query_engine()"
    },
    {
      "id": "blank-user-message",
      "label": "🔴 2026-09 기출 3 · OpenAI messages 사용자 프롬프트 딕셔너리 ({\"role\": \"user\", \"content\": question})",
      "instruction": "OpenAI Chat Completions의 messages 리스트 안에 들어갈 사용자 역할 딕셔너리 {\"role\": \"user\", \"content\": question}을 작성하세요.",
      "answer": "{\"role\": \"user\", \"content\": question}"
    },
    {
      "id": "blank-llama-index-insert",
      "label": "🟣 기출 변형 유력 · 기존 VectorStoreIndex에 새 Document 삽입(index.insert)",
      "hint": "index.insert(docu)를 호출해 인덱스를 전체 재구축하지 않고 문서를 추가합니다.",
      "answer": "index.insert(docu)"
    },
    {
      "id": "blank-llama-custom-retrieve",
      "label": "🟣 기출 변형 유력 · CustomQueryEngine Retriever 노드 검색(self.retriever.retrieve)",
      "hint": "self.retriever.retrieve(query_str)로 관련 노드 리스트를 가져옵니다.",
      "answer": "self.retriever.retrieve(query_str)"
    },
    {
      "id": "blank-llama-custom-synth",
      "label": "🟣 기출 변형 유력 · CustomQueryEngine Synthesizer 응답 합성(synthesize)",
      "hint": "self.response_synthesizer.synthesize(query_str, nodes)로 검색된 노드를 바탕으로 답변을 합성합니다.",
      "answer": "self.response_synthesizer.synthesize(query_str, nodes)"
    }
  ],
  "rag_2_subjective_test-history-v1": [
    {
      "id": "blank-rag2-user-message",
      "label": "🔴 2026-09 기출 3 · OpenAI messages 사용자 메시지 딕셔너리 ({\"role\": \"user\", \"content\": question})",
      "instruction": "system 메시지 다음에 들어갈 사용자 질문 딕셔너리 {\"role\": \"user\", \"content\": question}을 작성하세요.",
      "answer": "{\"role\": \"user\", \"content\": question}"
    },
    {
      "id": "blank-rag2-choice-content",
      "label": "🟣 기출 변형 유력 · OpenAI ChatCompletion 응답 본문 추출(choices[0].message.content)",
      "hint": "response.choices[0].message.content로 생성된 답변 문자열을 반환합니다.",
      "answer": "response.choices[0].message.content"
    },
    {
      "id": "blank-documents",
      "label": "Wikipedia 문서 로드",
      "answer": "reader.load_data(city_names, auto_suggest=False)"
    },
    {
      "id": "blank-index",
      "label": "🔴 2026-09 기출 1 · VectorStoreIndex 생성 (VectorStoreIndex.from_documents(documents))",
      "instruction": "로드한 Wikipedia documents로 VectorStoreIndex.from_documents(documents)를 호출하세요.",
      "answer": "VectorStoreIndex.from_documents(documents)"
    },
    {
      "id": "blank-query-engine",
      "label": "🔴 2026-09 기출 2 · Query Engine 변환 (index.as_query_engine())",
      "instruction": "생성한 index를 index.as_query_engine()으로 변환하세요.",
      "answer": "index.as_query_engine()"
    },
    {
      "id": "blank-rag2-index-trans",
      "label": "🟣 기출 변형 유력 · 커스텀 SentenceSplitter(transformations) 적용 인덱스 생성",
      "hint": "VectorStoreIndex.from_documents(documents=documents, transformations=[text_splitter_short])를 호출합니다.",
      "answer": "VectorStoreIndex.from_documents(documents=documents, transformations=[text_splitter_short])"
    },
    {
      "id": "blank-rag2-as-retriever-topk",
      "label": "🟣 기출 변형 유력 · similarity_top_k 지정 Retriever 변환(as_retriever)",
      "hint": "index_short.as_retriever(similarity_top_k=1)로 상위 k개 검색기를 생성합니다.",
      "answer": "index_short.as_retriever(similarity_top_k=1)"
    },
    {
      "id": "blank-rag2-join-nodes",
      "label": "🟣 기출 변형 유력 · 검색된 Node 본문 추출 및 결합(n.node.get_content())",
      "hint": "\"\\n\\n\".join([n.node.get_content() for n in nodes])로 검색된 노드 텍스트들을 하나의 문맥 문자열로 합칩니다.",
      "answer": "\"\\n\\n\".join([n.node.get_content() for n in nodes])"
    },
    {
      "id": "blank-rag2-llm-complete",
      "label": "🟣 기출 변형 유력 · PromptTemplate 포맷팅 및 LLM 완성 호출(self.llm.complete)",
      "hint": "self.llm.complete(self.qa_prompt.format(context_str=context_str, query_str=query_str))를 호출합니다.",
      "answer": "self.llm.complete(\n            self.qa_prompt.format(context_str=context_str, query_str=query_str)\n        )"
    }
  ],
  "rag_data_preprocessing_subjective_test-history-v1": [
    {
      "id": "blank-json-load",
      "label": "JSON 레코드 파싱",
      "answer": "json.loads(line.strip())"
    },
    {
      "id": "blank-prep-requests-get",
      "label": "🟣 기출 변형 유력 · Knowledge Graph API 서버 연결 확인(requests.get)",
      "hint": "requests.get(f\"{external_server_url}/\")로 GET 요청을 보냅니다.",
      "answer": "requests.get(f\"{external_server_url}/\")"
    },
    {
      "id": "blank-prep-domain-counter",
      "label": "🟣 기출 변형 유력 · Counter를 이용한 도메인별 데이터 분포 집계",
      "hint": "Counter(item['domain'] for item in dataset if 'domain' in item)으로 도메인별 개수를 구합니다.",
      "answer": "Counter(item['domain'] for item in dataset if 'domain' in item)"
    },
    {
      "id": "blank-html-parse",
      "label": "HTML 본문 파싱",
      "answer": "BeautifulSoup(html_text[\"page_result\"], features=\"lxml\")"
    },
    {
      "id": "blank-prep-soup-gettext",
      "label": "🟣 기출 변형 유력 · BeautifulSoup HTML 태그 제거 본문 추출(soup.get_text)",
      "hint": "soup.get_text(\" \", strip=True)로 공백 구분 및 앞뒤 공백 제거된 본문 텍스트를 추출합니다.",
      "answer": "soup.get_text(\" \", strip=True)"
    },
    {
      "id": "blank-sentence-offsets",
      "label": "문장 경계 추출",
      "answer": "text_to_sentences_and_offsets(text)"
    },
    {
      "id": "blank-prep-offset-slice",
      "label": "🟣 기출 변형 유력 · 문장 오프셋 구간 슬라이싱 및 최대 길이 제한(text[start:end][:4000])",
      "hint": "text[start:end][:4000]으로 문장 구간을 잘라내고 최대 4000자로 제한합니다.",
      "answer": "text[start:end][:4000]"
    }
  ],
  "rag_task_1_subjective_test-history-v1": [
    {
      "id": "blank-task1-cosine-sim",
      "label": "🟣 기출 변형 유력 · NumPy 내적 및 L2 노름 기반 코사인 유사도 계산",
      "hint": "np.dot(all_embeddings, query_embedding) / (np.linalg.norm(all_embeddings, axis=1) * np.linalg.norm(query_embedding))으로 코사인 유사도를 구합니다.",
      "answer": "np.dot(all_embeddings, query_embedding) / (\n            np.linalg.norm(all_embeddings, axis=1) * np.linalg.norm(query_embedding)\n        )"
    },
    {
      "id": "blank-task1-topk-argsort",
      "label": "🟣 기출 변형 유력 · 코사인 유사도 내림차순 상위 topk 인덱스 추출(argsort)",
      "hint": "(-cosine_scores).argsort()[:topk]로 유사도가 가장 큰 상위 topk개 인덱스를 추출합니다.",
      "answer": "(-cosine_scores).argsort()[:topk]"
    },
    {
      "id": "blank-vector-index",
      "label": "🔴 2026-09 기출 응용 · 문서 기반 VectorStoreIndex 생성 (transformations 포함)",
      "instruction": "documents와 transformations=[self.parser]를 전달해 VectorStoreIndex.from_documents(...)를 호출하세요.",
      "answer": "VectorStoreIndex.from_documents(documents = documents, transformations=[self.parser])"
    },
    {
      "id": "blank-task1-as-retriever",
      "label": "🟣 기출 변형 유력 · LlamaIndexRetriever 상위 topk 검색기 변환(as_retriever)",
      "hint": "base_index.as_retriever(similarity_top_k=topk)를 호출합니다.",
      "answer": "base_index.as_retriever(similarity_top_k=topk)"
    },
    {
      "id": "blank-task1-retrieve-nodes",
      "label": "🟣 기출 변형 유력 · LlamaIndexRetriever 질의 노드 검색(base_retriever.retrieve)",
      "hint": "base_retriever.retrieve(query)로 검색된 NodeWithScore 리스트를 얻습니다.",
      "answer": "base_retriever.retrieve(query)"
    },
    {
      "id": "blank-rag-for-chunks",
      "label": "🟣 기출 변형 유력 · 참조 청크 순회 포맷팅 루프(enumerate(top_k_chunks))",
      "answer": "for chunk_id, chunk in enumerate(top_k_chunks):",
      "hint": "for chunk_id, chunk in enumerate(top_k_chunks): 로 검색된 상위 청크들을 순회합니다."
    },
    {
      "id": "blank-rag-max-refs",
      "label": "🟣 기출 변형 유력 · 참조 문맥 최대 길이 슬라이싱(references[:MAX_CONTEXT_REFERENCES_LENGTH])",
      "answer": "references[:MAX_CONTEXT_REFERENCES_LENGTH]",
      "hint": "references[:MAX_CONTEXT_REFERENCES_LENGTH]로 프롬프트 참조 문맥 길이를 제한합니다."
    },
    {
      "id": "blank-task1-user-message",
      "label": "🔴 2026-09 기출 3 · Reader llm_input 사용자 메시지 딕셔너리 ({\"role\": \"user\", \"content\": user_message})",
      "instruction": "system_prompt 다음에 위치할 사용자 메시지 딕셔너리 {\"role\": \"user\", \"content\": user_message}를 작성하세요.",
      "answer": "{\"role\": \"user\", \"content\": user_message}"
    },
    {
      "id": "blank-retrieve",
      "label": "관련 청크 검색",
      "answer": "self.retriever.retrieve(query, search_results, topk)"
    },
    {
      "id": "blank-reader",
      "label": "검색 결과 기반 답변",
      "answer": "self.reader.generate_response(query, retrieved_results)"
    }
  ],
  "rag_task_2_subjective_test-history-v1": [
    {
      "id": "blank-task2-kg-post",
      "label": "🟣 기출 변형 유력 · CRAG Knowledge Graph REST API POST 호출(requests.post)",
      "hint": "requests.post(url, json=data, headers=headers)로 KG 서버에 질의 데이터를 전송합니다.",
      "answer": "requests.post(url, json=data, headers=headers)"
    },
    {
      "id": "blank-llm-input",
      "label": "질문 메시지 생성",
      "answer": "prompt_generator(query)"
    },
    {
      "id": "blank-task2-is-finance",
      "label": "🟣 기출 변형 유력 · 금융 도메인 여부 판별 플래그(domain == \"finance\")",
      "hint": "domain == \"finance\" 비교식을 작성합니다.",
      "answer": "domain == \"finance\""
    },
    {
      "id": "blank-task2-gen-query-call",
      "label": "🟣 기출 변형 유력 · KGQueryEngine 구조화 쿼리 생성 호출(self.generate_query)",
      "hint": "self.generate_query(query)를 호출해 (generated_query, is_finance) 튜플을 얻습니다.",
      "answer": "self.generate_query(query)"
    },
    {
      "id": "blank-task2-get-fin-kg",
      "label": "🟣 기출 변형 유력 · 금융 Knowledge Graph 검색 실행(self.get_finance_kg_results)",
      "hint": "self.get_finance_kg_results(generated_query)를 호출합니다.",
      "answer": "self.get_finance_kg_results(generated_query)"
    },
    {
      "id": "blank-kg-query",
      "label": "KG 결과 조회",
      "answer": "self.kg_query_engine.query(query)"
    },
    {
      "id": "blank-task2-sr-retrieve",
      "label": "🟣 기출 변형 유력 · RAGWithSRKG 웹 검색 청크 추출(self.retriever.retrieve)",
      "hint": "self.retriever.retrieve(query, search_results, topk)를 호출합니다.",
      "answer": "self.retriever.retrieve(query, search_results, topk)"
    },
    {
      "id": "blank-combined-reader",
      "label": "결합 문맥 답변",
      "answer": "self.reader.generate_response(query, combined_results)"
    }
  ],
  "rag_mcp_evaluation_subjective_test-history-v1": [
    {
      "id": "blank-mcp-hallucinate-count",
      "label": "🟣 기출 변형 유력 · CRAG 평가 환각(Hallucination) 오답 개수 계산",
      "hint": "전체 테스트 수 len(finance_test_dataset_ids)에서 n_correct_exact, n_correct, n_miss를 모두 뺍니다.",
      "answer": "(len(finance_test_dataset_ids) - n_correct_exact - n_correct - n_miss)"
    },
    {
      "id": "blank-mcp-crag-score",
      "label": "🟣 기출 변형 유력 · CRAG 종합 점수(정답 가점 및 환각 감점) 수식 계산",
      "hint": "n_correct_exact + 0.5*n_correct - n_hallucinate 수식으로 점수를 계산합니다.",
      "answer": "n_correct_exact + 0.5*n_correct - n_hallucinate"
    },
    {
      "id": "blank-mcp-client",
      "label": "MCP Client 생성",
      "answer": "BasicMCPClient(external_mcp_server)"
    },
    {
      "id": "blank-mcp-spec",
      "label": "MCP Tool Spec 생성",
      "answer": "McpToolSpec(client=mcp_client)"
    },
    {
      "id": "blank-mcp-tools",
      "label": "비동기 도구 목록 로드",
      "answer": "mcp_tool.to_tool_list_async()"
    },
    {
      "id": "blank-mcp-func-agent",
      "label": "🟣 기출 변형 유력 · MCP 도구 연동 FunctionAgent 초기화",
      "hint": "FunctionAgent(name=\"Agent\", description=\"An agent that can work with Our Knowledge Graph api.\", tools=tools, llm=self.llm, system_prompt=SYSTEM_PROMPT)를 생성합니다.",
      "answer": "FunctionAgent(\n            name=\"Agent\",\n            description=\"An agent that can work with Our Knowledge Graph api.\",\n            tools=tools,\n            llm=self.llm,\n            system_prompt=SYSTEM_PROMPT,\n        )"
    },
    {
      "id": "blank-mcp-agent-ctx",
      "label": "🟣 기출 변형 유력 · FunctionAgent 실행 문맥(Context) 생성",
      "hint": "Context(self.agent)로 에이전트 컨텍스트를 초기화합니다.",
      "answer": "Context(self.agent)"
    },
    {
      "id": "blank-mcp-agent-run",
      "label": "🟣 기출 변형 유력 · FunctionAgent 비동기 질의 실행(self.agent.run)",
      "hint": "self.agent.run(question, ctx=self.agent_context)를 호출합니다.",
      "answer": "self.agent.run(question, ctx=self.agent_context)"
    }
  ],
  "rag-inline-subjective-history-v1": [
    {
      "id": "blank-documents",
      "label": "문서 로드 (SimpleDirectoryReader(\"data\").load_data())",
      "answer": "SimpleDirectoryReader(\"data\").load_data()"
    },
    {
      "id": "blank-index",
      "label": "🔴 2026-09 기출 1 · VectorStoreIndex 생성 (VectorStoreIndex.from_documents(documents))",
      "instruction": "로드한 documents 리스트를 입력받아 VectorStoreIndex.from_documents(documents)로 벡터 인덱스를 생성하세요.",
      "answer": "VectorStoreIndex.from_documents(documents)"
    },
    {
      "id": "blank-llama-splitter",
      "label": "🟣 기출 변형 유력 · SentenceSplitter 청크 크기·오버랩 설정",
      "hint": "SentenceSplitter(chunk_size=1024, chunk_overlap=200)으로 문장 분할기를 초기화합니다.",
      "answer": "SentenceSplitter(chunk_size=1024, chunk_overlap=200)"
    },
    {
      "id": "blank-llama-get-nodes",
      "label": "🟣 기출 변형 유력 · Document 리스트에서 Node 분할 추출(get_nodes_from_documents)",
      "hint": "parser.get_nodes_from_documents(documents)를 호출해 문서를 노드 리스트로 분할합니다.",
      "answer": "parser.get_nodes_from_documents(documents)"
    },
    {
      "id": "blank-query",
      "label": "🔴 2026-09 기출 2 · Query Engine 변환 (index.as_query_engine())",
      "instruction": "생성된 index 객체에서 index.as_query_engine()을 호출해 질의응답 엔진을 생성하세요.",
      "answer": "index.as_query_engine()"
    },
    {
      "id": "blank-user-message",
      "label": "🔴 2026-09 기출 3 · OpenAI messages 사용자 프롬프트 딕셔너리 ({\"role\": \"user\", \"content\": question})",
      "instruction": "OpenAI Chat Completions의 messages 리스트 안에 들어갈 사용자 역할 딕셔너리 {\"role\": \"user\", \"content\": question}을 작성하세요.",
      "answer": "{\"role\": \"user\", \"content\": question}"
    },
    {
      "id": "blank-llama-index-insert",
      "label": "🟣 기출 변형 유력 · 기존 VectorStoreIndex에 새 Document 삽입(index.insert)",
      "hint": "index.insert(docu)를 호출해 인덱스를 전체 재구축하지 않고 문서를 추가합니다.",
      "answer": "index.insert(docu)"
    },
    {
      "id": "blank-llama-custom-retrieve",
      "label": "🟣 기출 변형 유력 · CustomQueryEngine Retriever 노드 검색(self.retriever.retrieve)",
      "hint": "self.retriever.retrieve(query_str)로 관련 노드 리스트를 가져옵니다.",
      "answer": "self.retriever.retrieve(query_str)"
    },
    {
      "id": "blank-llama-custom-synth",
      "label": "🟣 기출 변형 유력 · CustomQueryEngine Synthesizer 응답 합성(synthesize)",
      "hint": "self.response_synthesizer.synthesize(query_str, nodes)로 검색된 노드를 바탕으로 답변을 합성합니다.",
      "answer": "self.response_synthesizer.synthesize(query_str, nodes)"
    }
  ]
};
const blanks = window.SUBJECTIVE_BLANKS || (window.SUBJECTIVE_EXAM_DATA && window.SUBJECTIVE_EXAM_DATA.blanks) || BLANKS_BY_STORAGE_KEY[STORAGE_KEY] || [];
const storageKey = STORAGE_KEY;
const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'), drafts = {};
let active = 0, activeView = 'exam';
const canonical = v => String(v).trim().replace(/\s+/g, '').replace(/'/g, '"');
const isCorrectBlank = (val, ans) => {
  const u = canonical(val).replace(/,+$/, '').replace(/,\}/g, '}').replace(/from_documents\(documents=documents/g, 'from_documents(documents'), a = canonical(ans).replace(/,+$/, '').replace(/,\}/g, '}').replace(/from_documents\(documents=documents/g, 'from_documents(documents');
  if (u === a) return true;
  // GPTModel LHS & Sequential variants
  // TimeSeries enc_dec & RNNRNN variants
  const normTs = s => s.replace(/\\/g, '').replace(/^(features|labels|predictions)\.append\((.*)\)$/, '$2').replace(/^(h|input|outputs|out,h)=/, '');
  if (normTs(u) === normTs(a)) return true;
  const stripLhs = s => s.replace(/^[a-zA-Z0-9_.]+=/, '');
  if (stripLhs(u) === stripLhs(a)) return true;
  if (a.includes('for_inrange(cfg["n_layers"])') && u.replace(/for[a-zA-Z0-9_]+inrange/, 'for_inrange') === a) return true;
  if (a === 'x=attn(x)+x' && (u === 'x=x+attn(x)' || u === 'attn(x)+x' || u === 'x+attn(x)')) return true;
  if (a === 'x=ff(x)+x' && (u === 'x=x+ff(x)' || u === 'ff(x)+x' || u === 'x+ff(x)')) return true;
  if (a === 'round(num_channels*sparsity)' && (u === 'num_pruned_channels=round(num_channels*sparsity)' || u === 'int(round(num_channels*sparsity))' || u === 'round(weight.shape[1]*sparsity)')) return true;
  if (a === 'round(num_kernels*sparsity)' && (u === 'num_pruned_kernels=round(num_kernels*sparsity)' || u === 'int(round(num_kernels*sparsity))')) return true;
  if (a === 'weight.abs().sum(dim=(0,2,3),keepdim=True)' && (u === 'importance=weight.abs().sum(dim=(0,2,3),keepdim=True)' || u === 'torch.abs(weight).sum(dim=(0,2,3),keepdim=True)' || u === 'importance=torch.abs(weight).sum(dim=(0,2,3),keepdim=True)' || u === 'torch.sum(torch.abs(weight),dim=(0,2,3),keepdim=True)' || u === 'torch.sum(weight.abs(),dim=(0,2,3),keepdim=True)' || u === 'weight.abs().sum(dim=[0,2,3],keepdim=True)')) return true;
  if (a === 'weight.abs().sum(dim=(2,3),keepdim=True)' && (u === 'importance=weight.abs().sum(dim=(2,3),keepdim=True)' || u === 'torch.abs(weight).sum(dim=(2,3),keepdim=True)' || u === 'torch.sum(torch.abs(weight),dim=(2,3),keepdim=True)' || u === 'weight.abs().sum(dim=[2,3],keepdim=True)')) return true;
  if (a === 'torch.topk(importance,int(len(importance)*0.01))[1]' && (u === 'torch.topk(importance,num_samples)[1]' || u === 'importance.topk(num_samples)[1]')) return true;
  if (a === '(fp_max-fp_min)/(quantized_max-quantized_min)' && (u === '(fp_max-fp_min)/(2**bitwidth-1)' || u === '(fp_max-fp_min)/((1<<bitwidth)-1)')) return true;
  if (a === 's_x**ratio' && (u === 'torch.pow(s_x,ratio)' || u === 's_x.pow(ratio)')) return true;
  if (a === 'torch.abs(W)*input_feat[n]' && (u === 'W.abs()*input_feat[n]' || u === 'input_feat[n]*torch.abs(W)' || u === 'input_feat[n]*W.abs()')) return true;
  if (a === 'importance>threshold.reshape(row,1)' && (u === 'importance>threshold.view(row,1)' || u === 'importance>threshold.unsqueeze(1)' || u === 'importance>threshold.view(-1,1)')) return true;
  return false;
};
const $ = s => document.querySelector(s);
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"}[char]));

const isVariantNewItem = item => /^🟣|기출\s*변형\s*유력/.test(item?.label || '');
const isPastExamItem = item => !isVariantNewItem(item) && (/2026-09|기출|^🔴/.test(item?.label || ''));

function renderCodeCells() {
  const blankMarkup = item => {
    const isPast = isPastExamItem(item);
    const isVariant = isVariantNewItem(item);
    const badge = isPast ? '<span class="inline-past-tag">🔥 2026-09 기출 · NEW</span>' : isVariant ? '<span class="inline-variant-tag">✨ 기출 변형 유력 · NEW</span>' : '';
    const extraCls = isPast ? ' past-exam-input' : isVariant ? ' variant-new-input' : '';
    return `${badge}<textarea id="${item.id}" class="inline-code-input${extraCls}" aria-label="${item.label}" rows="1" placeholder="### 공개 제한 ###" spellcheck="false">${escapeHtml(drafts[item.id] || '')}</textarea><button id="mark-${item.id}" class="review-mark" type="button" title="나중에 복습할 문제로 표시">☆ 복습 표시</button><div id="feedback-${item.id}" class="inline-feedback" aria-live="polite"></div>`;
  };
  const rawCells = window.RAG_SUBJECTIVE_CELLS || (window.SUBJECTIVE_EXAM_DATA && window.SUBJECTIVE_EXAM_DATA.cells) || [];
  const cells = activeView === 'exam' ? rawCells.filter(cell => cell.type === 'code') : rawCells;
  $('#codeCells').innerHTML = cells.map(cell => {
    let source = escapeHtml(cell.source);
    if (cell.type === 'code') {
      const cellBlanks = blanks.filter(item => cell.source.includes(`[[BLANK:${item.id}]]`));
      const hasPast = cellBlanks.some(isPastExamItem);
      const hasVariant = !hasPast && cellBlanks.some(isVariantNewItem);
      blanks.forEach(item => {
        source = source.replace(`[[BLANK:${item.id}]]`, blankMarkup(item));
      });
      const cellBadge = hasPast ? '<span class="cell-past-badge">🔥 2026-09 실제 기출 재구성 · NEW</span>' : hasVariant ? '<span class="cell-variant-badge">✨ 기출 변형 유력 · NEW</span>' : '';
      const cellCls = hasPast ? ' has-past-exam' : hasVariant ? ' has-variant-new' : '';
      return `<section class="code-cell${cellCls}" data-cell-number="${cell.number}" data-code-number="${cell.code_number}"><div class="cell-title">코드 Cell ${cell.code_number} · 원본 Notebook Cell ${cell.number}${cellBadge}</div><pre><code>${source}</code></pre></section>`;
    }
    return `<section class="code-cell markdown-cell" data-cell-number="${cell.number}"><div class="cell-title">원본 Notebook Cell ${cell.number} · 설명</div><div class="markdown-source">${source || '(빈 마크다운 셀)'}</div></section>`;
  }).join('');
}

function statusText() {
  if (!blanks.length) return;
  const item = blanks[active], h = history[item.id] || {}, cell = document.getElementById(item.id)?.closest('.code-cell'), codeNumber = cell?.dataset.codeNumber, notebookNumber = cell?.dataset.cellNumber;
  const pastPill = isPastExamItem(item) ? '<span class="status-past-pill">🔥 2026-09 기출 NEW</span> ' : isVariantNewItem(item) ? '<span class="status-variant-pill">✨ 기출 변형 유력 NEW</span> ' : '';
  $('#status').innerHTML = `${pastPill}<strong>빈칸 ${active + 1} / ${blanks.length} · ${item.label}</strong> · ${h.correct ? '정답 확인됨' : `오답 ${h.wrongCount || 0}회`}`;
  $('#cellNumber').textContent = codeNumber ? `코드 ${codeNumber} · 원본 ${notebookNumber}` : `빈칸 ${active + 1}`;
  $('#progress').style.width = `${(active + 1) / blanks.length * 100}%`;
}

function renderList() {
  $('#blankList').innerHTML = blanks.map((item, index) => {
    const h = history[item.id] || {}, state = h.correct ? 'correct' : h.wrongCount ? 'wrong' : h.starred ? 'starred' : '';
    const isPast = isPastExamItem(item);
    const isVariant = isVariantNewItem(item);
    const pill = isPast ? '<span class="list-past-pill">🔥 기출</span> ' : isVariant ? '<span class="list-variant-pill">✨ 신유형</span> ' : '';
    const itemCls = isPast ? 'past-exam-item' : isVariant ? 'variant-new-item' : '';
    return `<button class="${index === active ? 'active' : ''} ${state} ${itemCls}" data-index="${index}" type="button">${pill}${index + 1}. ${item.label}${h.starred ? ' ★' : ''}${h.wrongCount ? ` · 오답 ${h.wrongCount}` : ''}</button>`;
  }).join('');
  document.querySelectorAll('[data-index]').forEach(b => b.addEventListener('click', () => focusBlank(Number(b.dataset.index))));
  const wrongTotal = blanks.reduce((sum, item) => sum + (history[item.id]?.wrongCount || 0), 0), starTotal = blanks.filter(item => history[item.id]?.starred).length;
  $('#review').textContent = `오답·복습 리뷰 (${wrongTotal} / ★${starTotal})`;
}

function focusBlank(index) {
  if (!blanks.length) return;
  active = (index + blanks.length) % blanks.length;
  const item = blanks[active], input = document.getElementById(item.id);
  renderList();
  statusText();
  input.focus({preventScroll: true});
  input.closest('.code-cell').scrollIntoView({behavior: 'smooth', block: 'center'});
}

function checkCurrent() {
  if (!blanks.length) return;
  const item = blanks[active], input = document.getElementById(item.id), feedback = document.getElementById(`feedback-${item.id}`), h = history[item.id] || {wrongCount: 0, attempts: 0}, correct = isCorrectBlank(input.value, item.answer);
  h.attempts += 1;
  h.lastAttempt = new Date().toISOString();
  if (correct) {
    h.correct = true;
    input.className = 'inline-code-input correct';
    feedback.className = 'inline-feedback show correct';
    feedback.textContent = '정답입니다. 다음 구현으로 넘어가세요.';
  } else {
    h.wrongCount += 1;
    h.correct = false;
    input.className = 'inline-code-input wrong';
    feedback.className = 'inline-feedback show wrong';
    feedback.textContent = `오답입니다. 오답 이력에 ${h.wrongCount}회 기록했습니다.\n정답: ${item.answer}\n직전 변수와 다음 줄에서 요구하는 객체 타입을 다시 확인하세요.`;
  }
  history[item.id] = h;
  save();
  renderList();
  statusText();
}

function toggleStar(index) {
  const item = blanks[index], h = history[item.id] || {wrongCount: 0, attempts: 0};
  h.starred = !h.starred;
  history[item.id] = h;
  save();
  const button = document.getElementById(`mark-${item.id}`);
  button.className = `review-mark${h.starred ? ' starred' : ''}`;
  button.textContent = h.starred ? '★ 복습 표시됨' : '☆ 복습 표시';
  renderList();
}

function showReview() {
  const rows = blanks.map((item, index) => ({item, index, h: history[item.id] || {wrongCount: 0, attempts: 0}})).filter(r => r.h.wrongCount || r.h.starred).sort((a, b) => Number(b.h.starred) - Number(a.h.starred) || b.h.wrongCount - a.h.wrongCount);
  $('#reviewRows').innerHTML = rows.length ? rows.map(({item, index, h}) => `<div class="review-row"><strong>${index + 1}. ${item.label}</strong><span class="${h.starred ? 'starred' : ''}">${h.starred ? '★ 복습 표시 · ' : ''}오답 ${h.wrongCount || 0}회 · 시도 ${h.attempts || 0}회</span><button class="button" data-review-index="${index}" type="button">다시 풀기</button></div>`).join('') : '<p class="empty">별표 또는 오답으로 기록된 문제가 없습니다.</p>';
  document.querySelectorAll('[data-review-index]').forEach(b => b.addEventListener('click', () => {
    $('#reviewModal').classList.remove('open');
    focusBlank(Number(b.dataset.reviewIndex));
  }));
  $('#reviewModal').classList.add('open');
}

function autoGrow(input) {
  input.style.height = 'auto';
  input.style.height = `${input.scrollHeight}px`;
}

function bindBlankControls() {
  blanks.forEach((item, index) => {
    const input = document.getElementById(item.id), mark = document.getElementById(`mark-${item.id}`), h = history[item.id] || {};
    input.addEventListener('focus', () => { active = index; renderList(); statusText(); });
    input.addEventListener('input', () => { drafts[item.id] = input.value; autoGrow(input); });
    autoGrow(input);
    if (h.starred) {
      mark.classList.add('starred');
      mark.textContent = '★ 복습 표시됨';
    }
    mark.addEventListener('click', () => toggleStar(index));
  });
}

function switchView(view) {
  blanks.forEach(item => {
    const input = document.getElementById(item.id);
    if (input) drafts[item.id] = input.value;
  });
  activeView = view;
  $('#examTab').classList.toggle('active', view === 'exam');
  $('#examTab').setAttribute('aria-selected', view === 'exam');
  $('#fullTab').classList.toggle('active', view === 'full');
  $('#fullTab').setAttribute('aria-selected', view === 'full');
  renderCodeCells();
  bindBlankControls();
  renderList();
  statusText();
}

renderCodeCells();
bindBlankControls();
$('#examTab').addEventListener('click', () => switchView('exam'));
$('#fullTab').addEventListener('click', () => switchView('full'));
$('#prev').addEventListener('click', () => focusBlank(active - 1));
$('#next').addEventListener('click', () => focusBlank(active + 1));
$('#check').addEventListener('click', checkCurrent);
$('#review').addEventListener('click', showReview);
$('#closeReview').addEventListener('click', () => $('#reviewModal').classList.remove('open'));
$('#reviewModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#reviewModal').classList.contains('open')) {
    e.preventDefault();
    $('#reviewModal').classList.remove('open');
    return;
  }
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    checkCurrent();
  }
});
renderList();
statusText();
