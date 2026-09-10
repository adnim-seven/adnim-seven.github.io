(() => {
  const lines = (text) => text.replace(/^\n|\n$/g, "").split("\n");
  const cell = (cell_number, problem, answer) => {
    const p = lines(problem), a = lines(answer);
    return {
      cell_number,
      blank_count: p.filter((row, i) => row !== a[i]).length,
      problem_lines: p.map((text, i) => ({ text, highlight: text !== a[i] && !text.trim().startsWith("#") })),
      answer_lines: a.map((text, i) => ({ text, highlight: text !== p[i] && !text.trim().startsWith("#") })),
    };
  };
  const S = (id, answer, topic, prompt, accepted = [answer]) => ({
    id, sourceId: id, occurrence: 0, answer, accepted_answers: accepted,
    topic, prompt, isSourceBlank: true,
  });

  const c24p = `def linear_quantize(fp_tensor, bitwidth, scale, zero_point, dtype=torch.int8) -> torch.Tensor:
    """
    linear quantization for single fp_tensor
      from
        fp_tensor = (quantized_tensor - zero_point) * scale
      we have,
        quantized_tensor = int(round(fp_tensor / scale)) + zero_point
    :param tensor: [torch.(cuda.)FloatTensor] floating tensor to be quantized
    :param bitwidth: [int] quantization bit width
    :param scale: [torch.(cuda.)FloatTensor] scaling factor
    :param zero_point: [torch.(cuda.)IntTensor] the desired centroid of tensor values
    :return:
        [torch.(cuda.)FloatTensor] quantized tensor whose values are integers
    """
    assert(fp_tensor.dtype == torch.float)
    assert(isinstance(scale, float) or
           (scale.dtype == torch.float and scale.dim() == fp_tensor.dim()))
    assert(isinstance(zero_point, int) or
           (zero_point.dtype == dtype and zero_point.dim() == fp_tensor.dim()))

    ############### YOUR CODE STARTS HERE ###############
    # Step 1: fp_tensor를 scale 하세요.
    scaled_tensor =
    # Step 2: 부동 소수점 값을 정수 값으로 rounding 하세요.
    rounded_tensor =
    ############### YOUR CODE ENDS HERE #################

    rounded_tensor = rounded_tensor.to(dtype)

    ############### YOUR CODE STARTS HERE ###############
    # Step 3: rounded_tensor를 zero_point 만큼 shift하여 영점을 조정합니다.
    shifted_tensor =
    ############### YOUR CODE ENDS HERE #################

    # Step 4: shifted_tensor를 bitwidth 범위에 있도록 절사(clamp)합니다.
    quantized_min, quantized_max = get_quantized_range(bitwidth)
    quantized_tensor = shifted_tensor.clamp_(quantized_min, quantized_max)
    return quantized_tensor`;
  const c24a = c24p
    .replace("scaled_tensor =\n", "scaled_tensor = fp_tensor/scale\n")
    .replace("rounded_tensor =\n", "rounded_tensor = torch.round(scaled_tensor)\n")
    .replace("shifted_tensor =\n", "shifted_tensor = rounded_tensor + zero_point\n");

  const c33p = `def get_quantization_scale_and_zero_point(fp_tensor, bitwidth):
    """
    get quantization scale for single tensor
    :param fp_tensor: [torch.(cuda.)Tensor] floating tensor to be quantized
    :param bitwidth: [int] quantization bit width
    :return:
        [float] scale
        [int] zero_point
    """
    quantized_min, quantized_max = get_quantized_range(bitwidth)
    fp_max = fp_tensor.max().item()
    fp_min = fp_tensor.min().item()

    ############### YOUR CODE STARTS HERE ###############
    # hint: quantized_max - quantized_min = 2 ** bitwith - 1
    scale =
    zero_point =
    ############### YOUR CODE ENDS HERE #################

    # clip the zero_point to fall in [quantized_min, quantized_max]
    if zero_point < quantized_min:
        zero_point = quantized_min
    elif zero_point > quantized_max:
        zero_point = quantized_max
    else: # convert from float to int using round()
        zero_point = round(zero_point)
    return scale, int(zero_point)`;
  const c33a = c33p
    .replace("scale =\n", "scale = (fp_max - fp_min) / (quantized_max - quantized_min)\n")
    .replace("zero_point =\n", "zero_point = round(quantized_min - fp_min/scale)\n");

  const c55p = `def quantized_linear(input, weight, bias, feature_bitwidth, weight_bitwidth,
                     input_zero_point, output_zero_point,
                     input_scale, weight_scale, output_scale):
    """
    quantized fully-connected layer
    :param input: [torch.CharTensor] quantized input (torch.int8)
    :param weight: [torch.CharTensor] quantized weight (torch.int8)
    :param bias: [torch.IntTensor] shifted quantized bias or None (torch.int32)
    :param feature_bitwidth: [int] quantization bit width of input and output
    :param weight_bitwidth: [int] quantization bit width of weight
    :param input_zero_point: [int] input zero point
    :param output_zero_point: [int] output zero point
    :param input_scale: [float] input feature scale
    :param weight_scale: [torch.FloatTensor] weight per-channel scale
    :param output_scale: [float] output feature scale
    :return:
        [torch.CharIntTensor] quantized output feature (torch.int8)
    """
    assert(input.dtype == torch.int8)
    assert(weight.dtype == input.dtype)
    assert(bias is None or bias.dtype == torch.int32)
    assert(isinstance(input_zero_point, int))
    assert(isinstance(output_zero_point, int))
    assert(isinstance(input_scale, float))
    assert(isinstance(output_scale, float))
    assert(weight_scale.dtype == torch.float)

    # Step 1: integer-based fully-connected (8-bit multiplication with 32-bit accumulation)
    if 'cpu' in input.device.type:
        # use 32-b MAC for simplicity
        output = torch.nn.functional.linear(input.to(torch.int32), weight.to(torch.int32), bias)
    else:
        # 현재 버전의 PyTorch는 GPU에서 정수 기반의 linear() 연산을 아직 지원하지 않습니다.
        output = torch.nn.functional.linear(input.float(), weight.float(), bias.float())

    # weight scale의 shape 가[oc, 1, 1, 1] 인 반면, output의 shape는 [batch_size, oc]이므로 shape를 조정합니다.
    weight_scale = weight_scale.flatten().view(1, -1)

    # scale이 부동 소수점이므로, 출력도 부동 소수점으로 변환해야 합니다.
    output = output.float()

    ############### YOUR CODE STARTS HERE ###############
    # Step 2: output 텐서를 scale합니다.
    output =

    # Step 3: output을 out_zero_point 만큼 이동하여 영점을 조정합니다.
    output =
    ############### YOUR CODE ENDS HERE #################

    # 모든 값이 지정된 비트폭 범위 내에 있도록 clamp합니다.
    output = output.round().clamp(*get_quantized_range(feature_bitwidth)).to(torch.int8)
    return output`;
  const c55a = c55p
    .replace("    output =\n\n    # Step 3", "    output = output*(input_scale * weight_scale / output_scale)\n\n    # Step 3")
    .replace("    output =\n    ############### YOUR CODE ENDS", "    output = output + output_zero_point\n    ############### YOUR CODE ENDS");

  const c63p = `def quantized_conv2d(input, weight, bias, feature_bitwidth, weight_bitwidth,
                     input_zero_point, output_zero_point,
                     input_scale, weight_scale, output_scale,
                     stride, padding, dilation, groups):
    """
    quantized 2d convolution
    :param input: [torch.CharTensor] quantized input (torch.int8)
    :param weight: [torch.CharTensor] quantized weight (torch.int8)
    :param bias: [torch.IntTensor] shifted quantized bias or None (torch.int32)
    :param feature_bitwidth: [int] quantization bit width of input and output
    :param weight_bitwidth: [int] quantization bit width of weight
    :param input_zero_point: [int] input zero point
    :param samp: [int] output zero point
    :param input_scale: [float] input feature scale
    :param weight_scale: [torch.FloatTensor] weight per-channel scale
    :param output_scale: [float] output feature scale
    :return:
        [torch.(cuda.)CharTensor] quantized output feature
    """
    assert(len(padding) == 4)
    assert(input.dtype == torch.int8)
    assert(weight.dtype == input.dtype)
    assert(bias is None or bias.dtype == torch.int32)
    assert(isinstance(input_zero_point, int))
    assert(isinstance(output_zero_point, int))
    assert(isinstance(input_scale, float))
    assert(isinstance(output_scale, float))
    assert(weight_scale.dtype == torch.float)

    # Step 1: calculate integer-based 2d convolution (8-bit multiplication with 32-bit accumulation)
    input = torch.nn.functional.pad(input, padding, 'constant', input_zero_point)
    if 'cpu' in input.device.type:
        # use 32-b MAC for simplicity
        output = torch.nn.functional.conv2d(input.to(torch.int32), weight.to(torch.int32), None, stride, 0, dilation, groups)
    else:
        # 현재 버전의 PyTorch는 GPU에서 정수 기반의 conv2d() 연산을 아직 지원하지 않습니다.
        output = torch.nn.functional.conv2d(input.float(), weight.float(), None, stride, 0, dilation, groups)
        output = output.round().to(torch.int32)
    if bias is not None:
        output = output + bias.view(1, -1, 1, 1)

    # weight scale의 shape가 [oc, 1, 1, 1]인 반면, output의 shape는 [batch_size, oc, height, width]이므로 shape를 조정합니다.
    weight_scale = weight_scale.flatten().view(1, -1, 1, 1)

    # scale이 부동 소수점이므로, 출력도 부동 소수점으로 변환해야 합니다.
    output = output.float()

    ############### YOUR CODE STARTS HERE ###############
    # hint: 이번 코드 블록은 quantized_linear()와 매우 유사합니다.

    # Step 2: output 텐서를 scale합니다.
    output =

    # Step 3: output을 out_zero_point 만큼 이동하여 영점을 조정합니다.
    output =
    ############### YOUR CODE ENDS HERE #################

    # 모든 값이 지정된 비트폭 범위 내에 있도록 clamp 합니다.
    output = output.round().clamp(*get_quantized_range(feature_bitwidth)).to(torch.int8)
    return output`;
  const c63a = c63p
    .replace("    output =\n\n    # Step 3", "    output = output*(input_scale * weight_scale / output_scale)\n\n    # Step 3")
    .replace("    output =\n    ############### YOUR CODE ENDS", "    output = output + output_zero_point\n    ############### YOUR CODE ENDS");

  const c85p = `def k_means_quantize(fp32_tensor: torch.Tensor, bitwidth=4, codebook=None):
    """
    quantize tensor using k-means clustering
    :param fp32_tensor:
    :param bitwidth: [int] quantization bit width, default=4
    :param codebook: [Codebook] (the cluster centroids, the cluster label tensor)
    :return:
        [Codebook = (centroids, labels)]
            centroids: [torch.(cuda.)FloatTensor] the cluster centroids
            labels: [torch.(cuda.)LongTensor] cluster label tensor
    """
    if codebook is None:
        ############### YOUR CODE STARTS HERE ###############
        # bitwidth에 따라 클러스터 수를 설정하세요.
        n_clusters =
        ############### YOUR CODE ENDS HERE #################
        # k-means를 사용하여 quantization centroid를 얻습니다.
        kmeans = KMeans(n_clusters=n_clusters, mode='euclidean', verbose=0)
        labels = kmeans.fit_predict(fp32_tensor.view(-1, 1)).to(torch.long)
        centroids = kmeans.centroids.to(torch.float).view(-1)
        codebook = Codebook(centroids, labels)
    ############### YOUR CODE STARTS HERE ###############
    # 추론에서 사용할 quantized tensor를 구하기 위해 코드북을 디코딩하세요.
    quantized_tensor =
    ############### YOUR CODE ENDS HERE #################
    fp32_tensor.set_(quantized_tensor.view_as(fp32_tensor))
    return codebook`;
  const c85a = c85p
    .replace("n_clusters =\n", "n_clusters = 2**bitwidth\n")
    .replace("quantized_tensor =\n", "quantized_tensor = codebook.centroids[codebook.labels]\n");

  const c96p = `def update_codebook(fp32_tensor: torch.Tensor, codebook: Codebook):
    """
    update the centroids in the codebook using updated fp32_tensor
    :param fp32_tensor: [torch.(cuda.)Tensor]
    :param codebook: [Codebook] (the cluster centroids, the cluster label tensor)
    """
    n_clusters = codebook.centroids.numel()
    fp32_tensor = fp32_tensor.view(-1)
    for k in range(n_clusters):
    ############### YOUR CODE STARTS HERE ###############
    # hint : torch.mean() 함수를 이용하여 평균을 구할 수 있습니다.
        codebook.centroids[k] =
    ############### YOUR CODE ENDS HERE #################`;
  const c96a = c96p.replace("codebook.centroids[k] =\n", "codebook.centroids[k] = torch.mean(fp32_tensor[codebook.labels==k])\n");

  const p28p = `def prune_weight_fine_grained(weight: torch.Tensor, sparsity: float) -> None:
    """가중치 텐서에 대해 fine-grained pruning을 수행하는 함수

    Args:
        weight: pruning할 가중치 텐서
        sparsity: pruning할 비율 (0~1 사이 값)

    Returns:
        pruning mask 텐서
    """
    # sparsity 값을 0~1 사이로 제한
    sparsity = min(1.0, max(0.0, sparsity))

    # 특수한 경우 처리
    if sparsity == 1.0:  # 모든 가중치를 제거
        weight.zero_()
        return torch.zeros_like(weight)
    elif sparsity == 0.0:  # 모든 가중치를 유지
        return torch.ones_like(weight)

    ##################### YOUR CODE STARTS HERE #####################
    # 제거할 원소 개수를 계산하세요.
    # hint: round() 함수를 사용하세요.
    num_pruned_elements =

    # 가중치의 중요도를 절댓값으로 importance 계산
    # hint: torch.abs() 함수를 사용하세요.
    importance =

    # pruning trheshold를 계산하세요.
    # hint: torch.kthvalue() 함수를 사용하세요.
    threshold =

    # threshold보다 큰 값들은 유지(1), 작은 값들은 제거(0)하는 마스크 생성
    # hint: 부등호를 사용하세요.
    mask =
    ##################### YOUR CODE ENDS HERE #######################

    # 마스크를 적용하여 pruning 수행
    weight.mul_(mask)

    return mask

# 마스크 생성 및 시각화
mask_fine_grained = prune_weight_fine_grained(weight.clone(), prune_sparsity)
draw_weight_distribution(mask_fine_grained, title="Fine-grained Pruning Mask")`;
  const p28a = p28p
    .replace("num_pruned_elements =\n", "num_pruned_elements = round(weight.numel() * sparsity)\n")
    .replace("importance =\n", "importance = torch.abs(weight)\n")
    .replace("threshold =\n", "threshold = torch.kthvalue(importance.flatten(), num_pruned_elements)[0]\n")
    .replace("mask =\n", "mask = importance > threshold\n");

  const p47p = `def get_model_sparsity(model: nn.Module) -> float:
    """
    모델 전체의 sparsity 계산.

    Args:
        model: 스파시티를 계산할 모델

    Returns:
        float: 모델의 전체 스파시티 비율 (0~1 사이 값)
    """
    num_nonzeros, num_elements = 0, 0
    for param in model.parameters():
        num_nonzeros += param.count_nonzero()
        num_elements += param.numel()
    return 1 - float(num_nonzeros) / num_elements

custom_sparsity_dict = {
##################### YOUR CODE STARTS HERE #####################
    # Key는 수정하지 마시고, 각 layer의 sparsity 값을 조정하세요.
    'backbone.conv0.weight': ,
    'backbone.conv1.weight': ,
    'backbone.conv2.weight': ,
    'backbone.conv3.weight': ,
    'backbone.conv4.weight': ,
    'backbone.conv5.weight': ,
    'backbone.conv6.weight': ,
    'backbone.conv7.weight': ,
    'classifier.weight':
##################### YOUR CODE ENDS HERE #######################
}

# 프루닝 적용 및 평가
pruner = FineGrainedPruner(model, custom_sparsity_dict)
pruner.apply(model)
custom_pruned_model_accuracy = evaluate(model, dataloader['test'])
custom_sparsity = get_model_sparsity(model)
model.recover_model()

# 결과 출력
print(f"custom_pruned_model has accuracy={custom_pruned_model_accuracy:.2f}%")
print(f"Model sparsity: {custom_sparsity:.3f}")`;
  const p47a = p47p
    .replace("'backbone.conv0.weight': ,", "'backbone.conv0.weight': 0.5,")
    .replace("'backbone.conv1.weight': ,", "'backbone.conv1.weight': 0.8,")
    .replace("'backbone.conv2.weight': ,", "'backbone.conv2.weight': 0.8,")
    .replace("'backbone.conv3.weight': ,", "'backbone.conv3.weight': 0.7,")
    .replace("'backbone.conv4.weight': ,", "'backbone.conv4.weight': 0.7,")
    .replace("'backbone.conv5.weight': ,", "'backbone.conv5.weight': 0.8,")
    .replace("'backbone.conv6.weight': ,", "'backbone.conv6.weight': 0.8,")
    .replace("'backbone.conv7.weight': ,", "'backbone.conv7.weight': 0.9,")
    .replace("'classifier.weight':\n", "'classifier.weight': 0.9\n");

  const p53p = `class FineGrainedPrunerV2:
    def __init__(self, model, sparsity, global_prune=False):
        """
        전역 또는 레이어별 프루닝을 위한 프루너 클래스

        Args:
            model: 프루닝할 모델
            sparsity: 프루닝 비율 (0~1)
            global_prune: 전역 프루닝 여부
        """
        self.masks = FineGrainedPrunerV2.prune(model, sparsity, global_prune)

    @torch.no_grad()
    def apply(self, model):
        """프루닝 마스크를 모델에 적용"""
        for name, param in model.named_parameters():
            if name in self.masks:
                param *= self.masks[name]

    @staticmethod
    @torch.no_grad()
    def prune(model, sparsity, global_prune):
        """
        전역 또는 레이어별 프루닝 수행

        Args:
            model: 프루닝할 모델
            sparsity: 프루닝 비율 (0~1)
            global_prune: 전역 프루닝 여부

        Returns:
            masks: 프루닝 마스크 딕셔너리
        """
        masks = dict()
        if global_prune:
            # 모든 2D 이상의 파라미터를 1차원으로 변환하여 수집
            parameters_to_prune = []
            for name, param in model.named_parameters():
                if param.dim() > 1:  # conv, fc 레이어만 프루닝
                    parameters_to_prune.append(param.view(-1))

            ##################### YOUR CODE STARTS HERE #####################
            # 모든 weight를 하나의 텐서로 결합해주세요..
            # hint: torch.cat()을 사용하세요.
            all_weights =

            # all_weights를 대상으로 global threshold를 구해주세요.
            num_elements =
            num_zeros =
            importance =
            threshold =
            ##################### YOUR CODE ENDS HERE #######################

            # threshold 기반 마스크 생성
            for name, param in model.named_parameters():
                if param.dim() > 1:
                    mask = torch.abs(param.data) > threshold
                    masks[name] = mask
        else:
            # 레이어별 프루닝 수행
            for name, param in model.named_parameters():
                if param.dim() > 1: # we only prune conv and fc weights
                    masks[name] = prune_weight_fine_grained(param, sparsity)
        return masks`;
  const p53a = p53p
    .replace("all_weights =\n", "all_weights = torch.cat(parameters_to_prune)\n")
    .replace("num_elements =\n", "num_elements = all_weights.numel()\n")
    .replace("num_zeros =\n", "num_zeros = round(num_elements * sparsity)\n")
    .replace("importance =\n", "importance = torch.abs(all_weights)\n")
    .replace("threshold =\n", "threshold = torch.kthvalue(importance, num_zeros)[0]\n");

  const p64p = `def get_sparsity_schedule(num_epochs: int,
                          epoch_start: int,
                          epoch_end: int,
                          sparsity_start: float,
                          sparsity_end: float,
                          exponent: int,
                          ) -> List[float]:
    """
    스파시티 스케줄을 생성하는 함수입니다.

    Args:
        num_epochs: 전체 에폭 수
        epoch_start: 스파시티 스케줄링 시작 에폭
        epoch_end: 스파시티 스케줄링 종료 에폭
        sparsity_start: 시작 스파시티 값
        sparsity_end: 종료 스파시티 값
        exponent: 스케줄링 지수 (1: linear, 3: cubic)

    Returns:
        각 에폭별 스파시티 값 리스트
    """
    sparsity_schedule = []
    ##################### YOUR CODE STARTS HERE #####################
    for epoch in range(num_epochs):
        # 위 수식에 맞게 sparsity를 계산하세요. (단, epoch_start보다 작은 경우 0으로 epochs_end 이후는 sparsity_end로 설정합니다.)
        if epoch < epoch_start:
            sparsity =
        elif epoch >= epoch_end:
            sparsity =
        else:
            sparsity =

        sparsity_schedule.append(sparsity)
    ##################### YOUR CODE ENDS HERE #######################
    return sparsity_schedule

# Linear sparsity schedule
# linear_sparsity_schedule = [0.9, 0.925, 0.95, 0.95, 0.95]
linear_sparsity_schedule = get_sparsity_schedule(num_finetune_epochs, 0, 2, 0.9, target_sparsity, 1)
print("Linear sparsity schedule:", linear_sparsity_schedule)

# Cubic sparsity schedule
# cubic_sparsity_schedule = [0.9, 0.94375, 0.95, 0.95, 0.95]
cubic_sparsity_schedule = get_sparsity_schedule(num_finetune_epochs, 0, 2, 0.9, target_sparsity, 3)
print("Cubic sparsity schedule:", cubic_sparsity_schedule)`;
  const p64a = p64p
    .replace("sparsity =\n", "sparsity = 0\n")
    .replace("sparsity =\n", "sparsity = sparsity_end\n")
    .replace("sparsity =\n", "sparsity = sparsity_end + (sparsity_start - sparsity_end) * (1 - (epoch - epoch_start) / (epoch_end - epoch_start)) ** exponent\n");

  const subjective = [
    S("q-scale-tensor", "fp_tensor/scale", "선형 양자화: 스케일", "fp_tensor를 정수 격자 단위로 환산하는 식을 작성하세요."),
    S("q-round", "torch.round(scaled_tensor)", "선형 양자화: 반올림", "스케일된 실수를 가장 가까운 정수로 반올림하세요."),
    S("q-shift", "rounded_tensor + zero_point", "선형 양자화: 영점 이동", "반올림한 값에 zero point를 반영하세요."),
    S("q-scale-range", "(fp_max - fp_min) / (quantized_max - quantized_min)", "Scale 계산", "실수 범위와 정수 범위로 scale을 계산하세요."),
    S("q-zero-point", "round(quantized_min - fp_min/scale)", "Zero point 계산", "실수 최솟값이 정수 최솟값에 대응하도록 zero point를 계산하세요."),
    S("q-linear-requant", "output*(input_scale * weight_scale / output_scale)", "Quantized Linear 재양자화", "int32 누산 결과를 출력 양자화 단위로 변환하세요."),
    S("q-linear-zp", "output + output_zero_point", "Quantized Linear 출력 영점", "출력 좌표계의 zero point를 적용하세요."),
    S("q-conv-requant", "output*(input_scale * weight_scale / output_scale)", "Quantized Conv2d 재양자화", "Conv2d의 int32 누산 결과를 출력 scale로 재양자화하세요."),
    S("q-conv-zp", "output + output_zero_point", "Quantized Conv2d 출력 영점", "Conv2d 출력에 output zero point를 적용하세요."),
    S("q-clusters", "2**bitwidth", "K-means 클러스터 수", "bitwidth가 표현할 수 있는 centroid 개수를 작성하세요.", ["2**bitwidth", "2 ** bitwidth"]),
    S("q-decode", "codebook.centroids[codebook.labels]", "Codebook 디코딩", "각 원소의 label로 centroid를 조회해 양자화 텐서를 복원하세요."),
    S("q-centroid-update", "torch.mean(fp32_tensor[codebook.labels==k])", "Codebook 업데이트", "클러스터 k에 속한 가중치 평균으로 centroid를 갱신하세요.", ["torch.mean(fp32_tensor[codebook.labels==k])", "torch.mean(fp32_tensor[codebook.labels == k])"]),
  ];

  const sources = {
    "q-scale-tensor": c24a, "q-round": c24a, "q-shift": c24a,
    "q-scale-range": c33a, "q-zero-point": c33a,
    "q-linear-requant": c55a, "q-linear-zp": c55a,
    "q-conv-requant": c63a, "q-conv-zp": c63a,
    "q-clusters": c85a, "q-decode": c85a, "q-centroid-update": c96a,
  };
  const mcq = [
    ["m1","q-scale-tensor","선형 양자화","fp_tensor를 정수 격자로 옮기는 올바른 코드는?",0,
      ["fp_tensor/scale","fp_tensor*scale","scale/fp_tensor","fp_tensor-zero_point","torch.round(scale)"],
      "q = round(x / scale) + zero_point이므로 먼저 scale로 나눕니다."],
    ["m2","q-round","반올림","scaled_tensor를 정수 격자에 맞추는 함수는?",1,
      ["torch.floor(scaled_tensor)","torch.round(scaled_tensor)","torch.ceil(scaled_tensor)","scaled_tensor.to(torch.int8)","torch.abs(scaled_tensor)"],
      "round는 가장 가까운 정수로 이동하고 dtype 변환은 다음 단계에서 수행합니다."],
    ["m3","q-zero-point","Zero point","fp_min이 quantized_min에 대응하는 식은?",2,
      ["round(fp_min - quantized_min/scale)","round(quantized_min + fp_min/scale)","round(quantized_min - fp_min/scale)","round(fp_min/scale)","round(quantized_max - fp_max*scale)"],
      "q_min = round(fp_min/scale) + zero_point를 zero_point에 대해 정리한 식입니다."],
    ["m4","q-linear-requant","재양자화","Linear의 int32 누산 결과를 output scale로 바꾸는 배율은?",3,
      ["output_scale/(input_scale*weight_scale)","input_scale/output_scale","weight_scale/output_scale","input_scale*weight_scale/output_scale","input_scale+weight_scale-output_scale"],
      "입력과 가중치 곱의 실제 scale은 input_scale × weight_scale이며, 출력 정수 단위로 바꾸려면 output_scale로 나눕니다."],
    ["m5","q-conv-zp","출력 영점","재양자화 뒤 output 좌표계의 영점을 맞추는 코드는?",4,
      ["output-input_zero_point","output+input_zero_point","output*output_zero_point","output/output_zero_point","output+output_zero_point"],
      "결과는 출력 텐서의 양자화 좌표계에 있으므로 output_zero_point를 더합니다."],
    ["m6","q-clusters","K-means 양자화","4-bit codebook의 centroid 수를 일반화한 식은?",0,
      ["2**bitwidth","bitwidth**2","2*bitwidth","bitwidth-1","2**bitwidth-1"],
      "b비트는 서로 다른 2^b개 코드를 표현합니다."],
    ["m7","q-decode","Codebook 디코딩","label별 centroid를 원소 위치에 배치하는 코드는?",1,
      ["codebook.labels[codebook.centroids]","codebook.centroids[codebook.labels]","codebook.centroids.mean()","codebook.labels.view_as(fp32_tensor)","codebook.centroids[0]"],
      "labels는 각 원소가 사용할 centroid의 인덱스입니다."],
    ["m8","q-centroid-update","Centroid 업데이트","클러스터 k의 새 중심을 구하는 코드는?",2,
      ["torch.sum(fp32_tensor)","fp32_tensor[codebook.labels==k]","torch.mean(fp32_tensor[codebook.labels==k])","torch.mean(codebook.labels)","torch.max(fp32_tensor)"],
      "해당 label의 원소만 선택한 뒤 평균을 취합니다."],
  ].map(([id,source_question_id,topic,prompt,answer_index,options,explanation]) => ({
    id, source_question_id, topic, prompt, answer_index, explanation,
    choices: options.map((text, i) => ({ text, why: i === answer_index ? "정답 코드입니다." : "연산 목적 또는 양자화 식과 맞지 않습니다." })),
  }));

  const pruningSubjective = [
    S("p-count", "round(weight.numel() * sparsity)", "제거 원소 수", "전체 원소 수와 sparsity로 제거할 원소 개수를 계산하세요."),
    S("p-importance", "torch.abs(weight)", "Magnitude importance", "부호와 무관하게 가중치 중요도를 계산하세요."),
    S("p-threshold", "torch.kthvalue(importance.flatten(), num_pruned_elements)[0]", "Pruning threshold", "중요도를 펼친 뒤 제거 개수 번째 작은 값을 threshold로 구하세요."),
    S("p-mask", "importance > threshold", "Fine-grained mask", "threshold보다 중요한 가중치만 유지하는 마스크를 작성하세요."),
    S("p-custom", "'backbone.conv0.weight': 0.5", "레이어별 sparsity", "정답 노트북에서 conv0에 지정한 sparsity 항목을 작성하세요."),
    S("p-cat", "torch.cat(parameters_to_prune)", "Global weight 결합", "모든 레이어의 펼친 가중치를 하나의 텐서로 결합하세요."),
    S("p-global-count", "round(num_elements * sparsity)", "Global 제거 수", "전체 가중치에서 제거할 원소 수를 계산하세요."),
    S("p-global-threshold", "torch.kthvalue(importance, num_zeros)[0]", "Global threshold", "전역 importance에서 threshold를 구하세요."),
    S("p-before", "sparsity = 0", "Scheduler 시작 전", "epoch_start 이전의 sparsity를 작성하세요."),
    S("p-after", "sparsity = sparsity_end", "Scheduler 종료 후", "epoch_end 이후의 sparsity를 작성하세요."),
    S("p-schedule", "sparsity = sparsity_end + (sparsity_start - sparsity_end) * (1 - (epoch - epoch_start) / (epoch_end - epoch_start)) ** exponent", "Sparsity schedule", "시작과 종료 사이의 linear/cubic sparsity 식을 작성하세요."),
  ];
  const pruningSources = {
    "p-count":p28a,"p-importance":p28a,"p-threshold":p28a,"p-mask":p28a,
    "p-custom":p47a,"p-cat":p53a,"p-global-count":p53a,"p-global-threshold":p53a,
    "p-before":p64a,"p-after":p64a,"p-schedule":p64a,
  };
  const pruningMcq = [
    ["pm1","p-count","제거 개수","sparsity 비율만큼 제거할 원소 수는?",0,["round(weight.numel() * sparsity)","round(weight.numel() / sparsity)","weight.numel() - sparsity","round(sparsity)","weight.count_nonzero()"],"전체 원소 수에 제거 비율을 곱합니다."],
    ["pm2","p-importance","Magnitude pruning","가중치 부호와 무관한 중요도는?",1,["weight","torch.abs(weight)","torch.mean(weight)","weight > 0","torch.square(sparsity)"],"Magnitude pruning은 절댓값이 작은 가중치를 덜 중요하다고 봅니다."],
    ["pm3","p-threshold","임계값","제거 개수 번째 작은 importance를 얻는 코드는?",2,["torch.max(importance)","torch.sort(weight)[0]","torch.kthvalue(importance.flatten(), num_pruned_elements)[0]","torch.mean(importance)","torch.topk(importance, num_pruned_elements)"],"kthvalue는 k번째 작은 값과 인덱스를 반환하므로 [0]으로 값을 취합니다."],
    ["pm4","p-mask","마스크","작은 값을 제거하고 큰 값을 유지하는 조건은?",3,["importance < threshold","importance == threshold","importance >= 0","importance > threshold","weight != sparsity"],"threshold보다 큰 중요도만 True로 유지합니다."],
    ["pm5","p-cat","Global pruning","레이어별 벡터를 전역 비교용 텐서로 만드는 함수는?",4,["torch.stack(model)","torch.flatten(parameters_to_prune)","sum(parameters_to_prune)","torch.mean(parameters_to_prune)","torch.cat(parameters_to_prune)"],"이미 펼친 벡터들을 같은 축으로 이어 붙입니다."],
    ["pm6","p-global-threshold","Global threshold","전역 importance에서 올바른 threshold 계산은?",0,["torch.kthvalue(importance, num_zeros)[0]","torch.kthvalue(importance, sparsity)[1]","torch.max(importance)","importance[num_elements]","torch.abs(num_zeros)"],"num_zeros 번째 작은 importance 값이 전역 임계값입니다."],
    ["pm7","p-before","스케줄 경계","epoch_start 이전의 pruning 비율은?",1,["sparsity_start","0","sparsity_end","1","epoch_start"],"스케줄 시작 전에는 pruning을 적용하지 않습니다."],
    ["pm8","p-schedule","Linear/Cubic schedule","linear와 cubic을 같은 식으로 제어하는 인자는?",2,["epoch_end","sparsity_end","exponent","num_epochs","num_zeros"],"exponent가 1이면 linear, 3이면 cubic 곡선이 됩니다."],
  ].map(([id,source_question_id,topic,prompt,answer_index,options,explanation])=>({id,source_question_id,topic,prompt,answer_index,explanation,choices:options.map((text,i)=>({text,why:i===answer_index?"정답 코드입니다.":"원본 구현의 목적이나 Tensor 흐름과 맞지 않습니다."}))}));

  window.LLM_COURSE = {
    subject: "5. On-device AI",
    sample_mode: false,
    cells: Object.fromEntries(Object.entries({...sources, ...pruningSources}).map(([id, source]) => [id, { source }])),
    chapters: [{
      id: "quantization-cnn", number: "01", title: "CNN Quantization",
      file: "2. Quantization for CNN.ipynb",
      capability: "CNN의 가중치와 activation을 정수로 양자화하고, 정수 연산 결과를 올바른 출력 scale로 재양자화한다.",
      summary: "선형 양자화의 scale·zero point 계산부터 quantized Linear/Conv2d, K-means codebook까지 코드 흐름을 연결합니다.",
      notebook_goal: "실수 텐서를 제한된 비트폭의 정수로 변환하고, 정수 layer 연산 및 codebook 양자화를 구현한다.",
      key_points: [
        {title:"Affine quantization",purpose:"실수 값을 일정 간격의 정수 격자에 대응시킵니다.",code:"q = round(x / scale) + zero_point",flow:"실수 → scale로 나눔 → 반올림 → zero point 이동 → clamp",watch:"나누기와 곱하기, input/output zero point를 혼동하지 않습니다."},
        {title:"Scale과 zero point",purpose:"실수 범위의 양 끝을 정수 범위에 대응시킵니다.",code:"scale = (fp_max-fp_min)/(q_max-q_min)",flow:"범위 길이 비율 계산 → fp_min의 위치로 zero point 계산",watch:"zero point는 비율이 아니라 영점의 정수 좌표입니다."},
        {title:"Integer layer 재양자화",purpose:"int32 누산 결과를 다음 layer가 받을 int8 좌표계로 변환합니다.",code:"output *= input_scale * weight_scale / output_scale",flow:"int8×int8 → int32 누산 → scale 변환 → output zero point → round/clamp",watch:"곱셈 결과의 실제 단위에는 input_scale과 weight_scale이 모두 포함됩니다."},
        {title:"K-means quantization",purpose:"가중치를 2^bitwidth개의 centroid로 공유해 저장량을 줄입니다.",code:"centroids[labels]",flow:"클러스터링 → centroid/label 저장 → label로 decode → centroid 평균 갱신",watch:"label은 값이 아니라 centroid를 가리키는 인덱스입니다."},
      ],
      theory_guide: [
        {title:"양자화 식",concept:"x ≈ (q-z)×s를 q에 대해 정리하면 q = round(x/s)+z입니다.",flow:"divide → round → shift → clamp",code_signal:"주석의 scale, rounding, shift가 각 연산을 직접 지시합니다.",exam_clue:"빈칸 앞뒤 변수명이 scaled_tensor → rounded_tensor → shifted_tensor 순서입니다."},
        {title:"재양자화 배율",concept:"input과 weight의 정수 곱은 실제로 s_in×s_w 단위를 가집니다.",flow:"accumulator × (s_in×s_w/s_out) + z_out",code_signal:"output_scale은 분모, input_scale과 weight_scale은 분자입니다.",exam_clue:"Linear와 Conv2d의 힌트가 동일한 코드 블록임을 알려 줍니다."},
        {title:"비트폭과 codebook",concept:"b비트로 구분 가능한 값은 2^b개입니다.",flow:"2**bitwidth clusters → labels → centroids[labels]",code_signal:"KMeans의 n_clusters 인자와 codebook의 centroids/labels를 찾습니다.",exam_clue:"decode는 labels로 centroids를 인덱싱하는 방향입니다."},
      ],
      full_code_cells: [cell(24,c24p,c24a),cell(33,c33p,c33a),cell(55,c55p,c55a),cell(63,c63p,c63a),cell(85,c85p,c85a),cell(96,c96p,c96a)],
      subjective,
      mcq,
    },{
      id:"pruning-cnn",number:"02",title:"CNN Pruning",file:"1. Pruning for CNN.ipynb",
      capability:"가중치 magnitude로 중요도를 계산하고 레이어별·전역 pruning mask와 sparsity schedule을 구현한다.",
      summary:"가중치 절댓값, k번째 작은 임계값, Boolean mask, global pruning, 점진적 sparsity schedule의 코드 연결을 연습합니다.",
      notebook_goal:"중요도가 낮은 CNN 가중치를 제거하면서 정확도와 sparsity의 균형을 조절하는 pruning 절차를 구현한다.",
      key_points:[
        {title:"Magnitude importance",purpose:"절댓값이 작은 가중치를 덜 중요하다고 판단합니다.",code:"importance = torch.abs(weight)",flow:"원소 수 계산 → 절댓값 → k번째 작은 값 → Boolean mask",watch:"원래 weight가 아니라 importance를 threshold와 비교합니다."},
        {title:"Fine-grained pruning",purpose:"가중치 원소 단위로 mask를 만들어 0을 적용합니다.",code:"mask = importance > threshold",flow:"sparsity → 제거 개수 → threshold → mask → weight.mul_(mask)",watch:"sparsity는 유지 비율이 아니라 제거 비율입니다."},
        {title:"Global magnitude pruning",purpose:"레이어 경계를 넘어 전체 모델에서 작은 가중치를 제거합니다.",code:"all_weights = torch.cat(parameters_to_prune)",flow:"각 weight flatten → concatenate → 전역 threshold → 레이어별 mask",watch:"레이어별 threshold를 따로 구하면 global pruning이 아닙니다."},
        {title:"Sparsity scheduling",purpose:"미세조정 중 pruning 강도를 점진적으로 목표값까지 높입니다.",code:"s_end + (s_start-s_end)*(1-progress)**exponent",flow:"시작 전 0 → 구간 내 보간 → 종료 후 sparsity_end",watch:"epoch 경계 조건과 exponent 위치를 확인합니다."},
      ],
      theory_guide:[
        {title:"임계값 유추",concept:"sparsity만큼 작은 가중치를 제거하려면 제거 개수 번째 작은 절댓값을 경계로 삼습니다.",flow:"numel×sparsity → abs → flatten → kthvalue",code_signal:"주석의 round, abs, kthvalue가 순서대로 답을 지시합니다.",exam_clue:"kthvalue는 (values, indices)가 아니라 (value, index) 한 쌍이므로 [0]을 사용합니다."},
        {title:"마스크 방향",concept:"True가 유지되는 mask이므로 중요도가 threshold보다 큰 항목을 선택합니다.",flow:"importance > threshold → weight.mul_(mask)",code_signal:"뒤에서 mask를 곱하므로 1은 유지, 0은 제거입니다.",exam_clue:"부등호 방향은 '큰 값 유지'라는 원본 주석에서 결정합니다."},
        {title:"레이어별과 전역",concept:"레이어별 pruning은 각 tensor의 분포를, global pruning은 모든 weight의 공통 분포를 사용합니다.",flow:"view(-1) → torch.cat → 한 번의 threshold",code_signal:"parameters_to_prune 리스트가 있으면 torch.cat이 자연스럽습니다.",exam_clue:"global_prune 분기 안에서 threshold를 한 번만 계산합니다."},
        {title:"스케줄 식",concept:"정규화된 진행률을 1에서 빼고 exponent를 적용해 시작값에서 종료값으로 이동합니다.",flow:"경계 처리 → progress → power → sparsity_end에 수렴",code_signal:"exponent 1/3 주석이 ** exponent를 요구합니다.",exam_clue:"epoch==epoch_end에서는 별도 분기로 정확히 sparsity_end가 됩니다."},
      ],
      full_code_cells:[cell(28,p28p,p28a),cell(47,p47p,p47a),cell(53,p53p,p53a),cell(64,p64p,p64a)],
      subjective:pruningSubjective,
      mcq:pruningMcq,
    }],
  };
})();
