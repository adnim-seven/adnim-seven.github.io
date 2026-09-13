/* Vision 공식 시험범위와 노트북별 코드 연결 */
window.VISION_EXAM_SCOPE = {
  scope: [
    ["모델의 원리 이해", "주요 layer의 구성·동작, 모델 출력과 정답을 학습으로 연결"],
    ["데이터 구성 원리", "학습·평가 목적에 맞는 이미지와 label 구성"],
    ["관련 Library 활용", "torchvision.transforms를 통한 이미지 변형·Tensor 변환·정규화"],
    ["평가 Metric 이해", "예측값을 확률·클래스·정확도·탐지/분할 결과로 해석"],
  ],
  chapters: {
    "01_ResNet18_CIFAR10.ipynb": {
      matched: ["모델의 원리 이해", "데이터 구성 원리", "관련 Library 활용", "평가 Metric 이해"],
      highlights: [
        ["학습 이미지 변형", "transforms 출제 핵심", "T.RandomCrop(32, padding=4)\nT.RandomHorizontalFlip()\nT.ToTensor()\nT.Normalize(CIFAR10_MEAN, CIFAR10_STD)"],
        ["CIFAR용 ResNet", "32×32 입력·10개 클래스에 맞춘 layer 교체", "model.conv1 = nn.Conv2d(3, 64, 3, 1, 1, bias=False)\nmodel.maxpool = nn.Identity()\nmodel.fc = nn.Linear(model.fc.in_features, num_classes)"],
        ["학습·정확도", "logits와 label을 loss·update·metric으로 연결", "logits = model(images)\nloss = criterion(logits, labels)\nloss.backward(); optimizer.step()\npreds = logits.argmax(dim=1)"],
      ],
    },
    "02_ViT_CIFAR10.ipynb": {
      matched: ["모델의 원리 이해", "데이터 구성 원리", "평가 Metric 이해"],
      highlights: [
        ["Patch Embedding", "이미지 Tensor를 Transformer token으로 변환", "[B,C,H,W] → [B,N,patch_dim] → [B,N,dim]"],
        ["Self-Attention", "Q·K·V layer의 핵심 계산", "dots = q @ k.transpose(-1, -2) * scale\nattn = dots.softmax(dim=-1)\nout = attn @ v"],
        ["분류 Loss", "logits와 label을 학습 신호로 연결", "log_probs = F.log_softmax(logits, dim=1)\nloss = F.nll_loss(log_probs, labels)"],
      ],
    },
    "03_DETR.ipynb": {
      matched: ["모델의 원리 이해", "관련 Library 활용", "평가 Metric 이해"],
      highlights: [
        ["DETR 전처리", "pretrained backbone용 transforms", "T.Resize(800)\nT.ToTensor()\nT.Normalize([0.485,0.456,0.406], [0.229,0.224,0.225])"],
        ["Attention·Encoder", "기출 언급된 MultiHeadAttention / EncoderLayer forward", "attn_scores = queries @ keys.transpose(1, 2)\nattn_weights = torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)\ncontext_vec = attn_weights @ values"],
        ["탐지 결과 해석", "no-object 제외·confidence·box의 같은 query 처리", "probas = outputs['pred_logits'].softmax(-1)[0, :, :-1]\nkeep = probas.max(-1).values > 0.9\nbboxes_scaled = rescale_bboxes(outputs['pred_boxes'][0, keep], im.size)"],
      ],
    },
    "04_Unet.ipynb": {
      matched: ["모델의 원리 이해", "데이터 구성 원리", "평가 Metric 이해"],
      highlights: [
        ["Skip Connection", "decoder와 encoder feature를 채널 축으로 결합", "x1 = self.up(x1)\nx = torch.cat([x2, x1], dim=1)"],
        ["Mask Loss·예측", "pixel logits와 mask를 loss·threshold로 연결", "loss = nn.BCEWithLogitsLoss()(logits, masks)\nprobs = torch.sigmoid(logits)\npred_mask = probs > 0.5"],
      ],
    },
    "05_DDPM.ipynb": {
      matched: ["모델의 원리 이해", "데이터 구성 원리"],
      highlights: [
        ["Forward Diffusion", "이미지·timestep·noise를 학습 입력으로 구성", "x_t = sqrt_alpha_bar_t * x_0 + sqrt_one_minus_alpha_bar_t * noise"],
        ["Noise Prediction Loss", "실제로 주입한 noise를 모델 정답으로 사용", "x_noisy = q_sample(x_start, t, noise)\npredicted_noise = model(x_noisy, t)\nloss = F.mse_loss(noise, predicted_noise)"],
      ],
    },
    "06_Stable_Diffusion_v1_4.ipynb": {
      matched: ["모델의 원리 이해"],
      highlights: [
        ["Pipeline 구성·생성", "사전학습 모델 활용 응용 코드", "pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)\npipe = pipe.to('cuda')\nimage = pipe(prompt, guidance_scale=7.5).images[0]"],
      ],
    },
  },
};
