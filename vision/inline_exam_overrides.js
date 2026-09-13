/* Vision Chapter 1: CIFAR-10 train augmentation을 한 묶음으로 점검 */
window.INLINE_EXAM_OVERRIDES = {
  "01_ResNet18_CIFAR10.ipynb": {
    replacements: [
      {cell: 6, id: "vision-random-flip", from: "T.RandomHorizontalFlip()"},
      {cell: 6, id: "vision-to-tensor", from: "T.ToTensor()"},
      {cell: 11, id: "vision-accuracy-argmax", from: "preds = logits.argmax(dim=1)"},
      {cell: 11, id: "vision-train-forward", from: "logits = model(images)"},
      {cell: 11, id: "vision-train-loss", from: "loss = criterion(logits, labels)"},
      {cell: 11, id: "vision-train-backward", from: "scaler.scale(loss).backward()"},
      {cell: 11, id: "vision-train-step", from: "scaler.step(optimizer)"},
      {cell: 15, id: "vision-predict-softmax", from: "probs = F.softmax(logits, dim=1)"},
      {cell: 15, id: "vision-predict-max", from: "conf, pred = probs.max(dim=1)"},
    ],
    blanks: [
      {
        id: "vision-random-flip",
        label: "학습 이미지 좌우 반전 증강",
        instruction: "Random Crop 뒤에 학습 이미지의 좌우 반전 증강을 적용하세요.",
        answer: "T.RandomHorizontalFlip()",
      },
      {
        id: "vision-to-tensor",
        label: "PIL 이미지를 CHW Tensor로 변환",
        instruction: "증강된 PIL 이미지를 [C, H, W] 범위 0~1 Tensor로 변환하세요.",
        answer: "T.ToTensor()",
      },
      {id: "vision-accuracy-argmax", label: "분류 logits에서 예측 클래스 선택", instruction: "[B, C] logits의 클래스 축에서 가장 큰 index를 선택하세요.", answer: "preds = logits.argmax(dim=1)"},
      {id: "vision-train-forward", label: "학습 forward", instruction: "학습 이미지 batch를 모델에 넣어 logits를 만드세요.", answer: "logits = model(images)"},
      {id: "vision-train-loss", label: "분류 loss", instruction: "모델 logits와 정답 label로 criterion loss를 계산하세요.", answer: "loss = criterion(logits, labels)"},
      {id: "vision-train-backward", label: "AMP 역전파", instruction: "GradScaler로 scale한 loss를 역전파하세요.", answer: "scaler.scale(loss).backward()"},
      {id: "vision-train-step", label: "Optimizer update", instruction: "GradScaler를 통해 optimizer의 가중치 갱신을 실행하세요.", answer: "scaler.step(optimizer)"},
      {id: "vision-predict-softmax", label: "logits를 클래스 확률로 변환", instruction: "분류 logits의 클래스 축에서 softmax 확률을 계산하세요.", answer: "probs = F.softmax(logits, dim=1)"},
      {id: "vision-predict-max", label: "confidence와 예측 클래스 선택", instruction: "클래스 확률에서 최대 확률과 해당 class index를 함께 구하세요.", answer: "conf, pred = probs.max(dim=1)"},
    ],
  },
  "02_ViT_CIFAR10.ipynb": {
    replacements: [
      {cell: 9, id: "vision-vit-residual-attn", from: "x = attn(x) + x"},
      {cell: 9, id: "vision-vit-residual-ff", from: "x = ff(x) + x"},
      {cell: 19, id: "vision-vit-train-logprob", from: "output = F.log_softmax(model(data), dim=1)"},
      {cell: 19, id: "vision-vit-train-loss", from: "loss = F.nll_loss(output, target)"},
      {cell: 19, id: "vision-vit-train-step", from: "optimizer.step()"},
      {cell: 20, id: "vision-vit-eval-pred", from: "_, pred = torch.max(output, dim=1)"},
    ],
    blanks: [
      {id: "vision-vit-residual-attn", label: "Attention residual 연결", instruction: "Attention 출력과 기존 token 표현을 더해 residual 연결을 만드세요.", answer: "x = attn(x) + x"},
      {id: "vision-vit-residual-ff", label: "FeedForward residual 연결", instruction: "FFN 출력과 기존 token 표현을 더해 residual 연결을 만드세요.", answer: "x = ff(x) + x"},
      {id: "vision-vit-train-logprob", label: "ViT 분류 log-probability", instruction: "모델의 클래스 logits를 class 축 log_softmax로 변환하세요.", answer: "output = F.log_softmax(model(data), dim=1)"},
      {id: "vision-vit-train-loss", label: "NLL 분류 loss", instruction: "log-probability와 정답 target으로 NLL loss를 계산하세요.", answer: "loss = F.nll_loss(output, target)"},
      {id: "vision-vit-train-step", label: "ViT optimizer 갱신", instruction: "역전파 뒤 optimizer의 가중치를 갱신하세요.", answer: "optimizer.step()"},
      {id: "vision-vit-eval-pred", label: "평가 예측 class", instruction: "class 축 최대값으로 예측 index를 구하세요.", answer: "_, pred = torch.max(output, dim=1)"},
    ],
  },
  "03_DETR.ipynb": {
    replacements: [
      {cell: 8, id: "vision-detr-box-unbind", from: "x_c, y_c, w, h = x.unbind(1)"},
      {cell: 8, id: "vision-detr-box-stack", from: "return torch.stack(b, dim=1)"},
      {cell: 8, id: "vision-detr-box-scale", from: "b = b * torch.tensor([img_w, img_h, img_w, img_h], dtype=torch.float32)"},
      {cell: 18, id: "vision-detr-forward", from: "outputs = model(img)"},
      {cell: 18, id: "vision-detr-probas", from: "probas = outputs['pred_logits'].softmax(-1)[0, :, :-1]"},
      {cell: 18, id: "vision-detr-keep", from: "keep = probas.max(-1).values > 0.9"},
      {cell: 18, id: "vision-detr-scale-boxes", from: "bboxes_scaled = rescale_bboxes(outputs['pred_boxes'][0, keep], im.size)"},
      {cell: 22, id: "vision-detr-remove-hook", from: "hook.remove()"},
    ],
    blanks: [
      {id: "vision-detr-box-unbind", label: "cxcywh 네 성분 분리", instruction: "[N,4] box Tensor를 x center, y center, width, height로 분리하세요.", answer: "x_c, y_c, w, h = x.unbind(1)"},
      {id: "vision-detr-box-stack", label: "xyxy box Tensor 복원", instruction: "계산한 네 corner 좌표를 [N,4] Tensor로 stack해 반환하세요.", answer: "return torch.stack(b, dim=1)"},
      {id: "vision-detr-box-scale", label: "정규화 box를 픽셀 box로 변환", instruction: "xyxy 순서에 맞춘 [W,H,W,H] scale로 box를 곱하세요.", answer: "b = b * torch.tensor([img_w, img_h, img_w, img_h], dtype=torch.float32)"},
      {id: "vision-detr-forward", label: "DETR forward", instruction: "배치 이미지 Tensor를 DETR 모델에 넣어 logits와 boxes 출력을 얻으세요.", answer: "outputs = model(img)"},
      {id: "vision-detr-probas", label: "no-object 제외 class 확률", instruction: "마지막 no-object class를 제외한 query별 softmax 확률을 만드세요.", answer: "probas = outputs['pred_logits'].softmax(-1)[0, :, :-1]"},
      {id: "vision-detr-keep", label: "confidence query mask", instruction: "각 query의 최대 class 확률이 0.9보다 큰지 판정하세요.", answer: "keep = probas.max(-1).values > 0.9"},
      {id: "vision-detr-scale-boxes", label: "선택 query의 픽셀 box", instruction: "동일 keep mask를 pred_boxes에 적용한 뒤 원본 이미지 pixel 좌표로 바꾸세요.", answer: "bboxes_scaled = rescale_bboxes(outputs['pred_boxes'][0, keep], im.size)"},
      {id: "vision-detr-remove-hook", label: "forward hook 해제", instruction: "분석이 끝난 등록 hook을 반복문에서 제거하세요.", answer: "hook.remove()"},
    ],
  },
  "04_Unet.ipynb": {
    replacements: [
      {cell: 5, id: "vision-unet-img-channel", from: "img = np.expand_dims(img, axis=0)"},
      {cell: 5, id: "vision-unet-mask-channel", from: "mask = np.expand_dims(mask, axis=0)"},
      {cell: 7, id: "vision-unet-pad", from: "x1 = F.pad(x1, [diff_x // 2, diff_x - diff_x // 2,  # left, right\n                        diff_y // 2, diff_y - diff_y // 2]) # top, bottom"},
      {cell: 7, id: "vision-unet-output", from: "logits = self.outc(x)"},
      {cell: 15, id: "vision-unet-sigmoid", from: "probs = torch.sigmoid(logits)"},
      {cell: 15, id: "vision-unet-threshold", from: "preds = (probs > 0.5).float()"},
    ],
    blanks: [
      {id: "vision-unet-img-channel", label: "입력 image 채널 축 추가", instruction: "2D image를 [1,H,W] 1채널 입력으로 바꾸세요.", answer: "img = np.expand_dims(img, axis=0)"},
      {id: "vision-unet-mask-channel", label: "정답 mask 채널 축 추가", instruction: "2D binary mask를 [1,H,W] Tensor 준비 형태로 바꾸세요.", answer: "mask = np.expand_dims(mask, axis=0)"},
      {id: "vision-unet-pad", label: "skip과 upsampled feature 크기 정렬", instruction: "skip feature x2의 H/W에 맞도록 x1 양쪽에 padding을 적용하세요.", answer: "x1 = F.pad(x1, [diff_x // 2, diff_x - diff_x // 2,  # left, right\n                        diff_y // 2, diff_y - diff_y // 2]) # top, bottom"},
      {id: "vision-unet-output", label: "U-Net pixel logits 출력", instruction: "decoder feature를 마지막 1×1 output layer에 넣어 logits를 만드세요.", answer: "logits = self.outc(x)"},
      {id: "vision-unet-sigmoid", label: "binary logits를 확률로 변환", instruction: "분할 logits에 sigmoid를 적용해 pixel probability를 만드세요.", answer: "probs = torch.sigmoid(logits)"},
      {id: "vision-unet-threshold", label: "binary prediction mask", instruction: "0.5 threshold로 확률을 0/1 prediction mask로 바꾸세요.", answer: "preds = (probs > 0.5).float()"},
    ],
  },
  "05_DDPM.ipynb": {
    replacements: [
      {cell: 18, id: "vision-ddpm-qsample", from: "x_noisy = q_sample(x_start=x_start, t=t, noise=noise)"},
      {cell: 18, id: "vision-ddpm-predict-noise", from: "predicted_noise = denoise_model(x_noisy, t)"},
      {cell: 18, id: "vision-ddpm-mse", from: "loss = F.mse_loss(noise, predicted_noise)"},
      {cell: 22, id: "vision-ddpm-model-mean", from: "model_mean = sqrt_recip_alphas_t * (\n        x - betas_t * model(x, t) / sqrt_one_minus_alphas_cumprod_t\n    )"},
      {cell: 22, id: "vision-ddpm-last-step", from: "return model_mean"},
      {cell: 22, id: "vision-ddpm-reverse-noise", from: "return model_mean + torch.sqrt(posterior_variance_t) * noise"},
    ],
    blanks: [
      {id: "vision-ddpm-qsample", label: "forward diffusion x_t 생성", instruction: "원본 x_start, timestep t, 실제 noise로 noisy image x_t를 만드세요.", answer: "x_noisy = q_sample(x_start=x_start, t=t, noise=noise)"},
      {id: "vision-ddpm-predict-noise", label: "U-Net noise 예측", instruction: "noisy image와 timestep을 denoise model에 넣어 noise를 예측하세요.", answer: "predicted_noise = denoise_model(x_noisy, t)"},
      {id: "vision-ddpm-mse", label: "DDPM noise MSE", instruction: "실제 주입 noise와 예측 noise의 MSE loss를 계산하세요.", answer: "loss = F.mse_loss(noise, predicted_noise)"},
      {id: "vision-ddpm-model-mean", label: "역과정 model mean", instruction: "현재 x와 모델이 예측한 noise로 DDPM Equation 11의 mean을 계산하세요.", answer: "model_mean = sqrt_recip_alphas_t * (\n        x - betas_t * model(x, t) / sqrt_one_minus_alphas_cumprod_t\n    )"},
      {id: "vision-ddpm-last-step", label: "t=0 최종 image 반환", instruction: "마지막 역확산 단계에서는 추가 noise 없이 model mean을 반환하세요.", answer: "return model_mean"},
      {id: "vision-ddpm-reverse-noise", label: "t>0 역확산 샘플", instruction: "model mean에 posterior standard deviation과 random noise를 더해 이전 시점 sample을 반환하세요.", answer: "return model_mean + torch.sqrt(posterior_variance_t) * noise"},
    ],
  },
};

/* 공식 출제범위의 직접 타깃: ResNet·ViT·U-Net 구조, transform, 학습 연결 */
(() => {
  const priority = {
    "01_ResNet18_CIFAR10.ipynb": new Set([
      "blank-random-crop", "blank-normalize", "blank-cifar-stem",
      "vision-random-flip", "vision-to-tensor", "vision-train-forward", "vision-train-loss", "vision-train-backward", "vision-train-step", "vision-accuracy-argmax"
    ]),
    "02_ViT_CIFAR10.ipynb": new Set([
      "blank-vit-qkv", "blank-vit-scores", "blank-vit-weighted-sum",
      "vision-vit-residual-attn", "vision-vit-residual-ff", "vision-vit-train-logprob", "vision-vit-train-loss", "vision-vit-train-step"
    ]),
    "04_Unet.ipynb": new Set([
      "blank-unet-up", "blank-unet-skip", "blank-unet-loss",
      "vision-unet-img-channel", "vision-unet-mask-channel", "vision-unet-pad", "vision-unet-output", "vision-unet-sigmoid", "vision-unet-threshold"
    ])
  };
  Object.entries(priority).forEach(([file, ids]) => {
    (window.INLINE_EXAM_MAP?.[file]?.blanks || []).forEach((blank) => {
      if (ids.has(blank.id) && !blank.label.startsWith("★")) blank.label = `★ 유력 · ${blank.label}`;
    });
    (window.INLINE_EXAM_OVERRIDES?.[file]?.blanks || []).forEach((blank) => {
      if (ids.has(blank.id) && !blank.label.startsWith("★")) blank.label = `★ 유력 · ${blank.label}`;
    });
  });
})();
