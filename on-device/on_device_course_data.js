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

  window.LLM_COURSE = {
    subject: "5. On-device AI",
    sample_mode: false,
    cells: Object.fromEntries(Object.entries(sources).map(([id, source]) => [id, { source }])),
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
    }],
  };
})();
