// Instructor-reviewed context, task constraints, slot-specific explanations and alternatives.
module.exports = {
  // ==========================================
  // ROUND 2
  // ==========================================
  'exam-llm04-01': {
    whys: {
      0: '입력 x [B, T, D]에서 평균을 빼고 분산에 수치적 안정성을 위한 epsilon(self.eps)을 더한 뒤 제곱근을 나누어 피처 차원을 표준화(평균 0, 분산 1)합니다.'
    },
    alternatives: {
      0: ['norm_x = (x - mean) / (var + self.eps).sqrt()', 'norm_x = (x - mean) / torch.sqrt(self.eps + var)']
    }
  },
  'exam-llm04-06': {
    whys: {
      0: '동일한 shape [B, T, D]를 갖는 토큰 임베딩과 위치 임베딩을 원소별 덧셈으로 결합하여 시퀀스 내 위치 정보를 부여합니다.',
      1: '결합된 임베딩을 순차적인 트랜스포머 블록 컨테이너(self.trf_blocks)에 통과시켜 문맥화된 은닉 상태 [B, T, D]를 추출합니다.',
      2: '트랜스포머 은닉 표현을 최종 선형 출력 헤드(Linear(D, vocab_size))에 통과시켜 각 토큰 위치의 다음 단어 로짓 [B, T, V]를 산출합니다.'
    },
    alternatives: {
      0: ['x = pos_embeds + tok_embeds'],
      1: ['x = self.trf_blocks.forward(x)'],
      2: ['logits = self.out_head.forward(x)']
    }
  },
  'exam-rag01-03': {
    code: 'question = "문서의 저자가 처음 작성한 프로그램은 무엇인가요?"\n{{A}}\n{{B}}',
    answers: { 1: 'response = query_engine.query(question)' },
    prompt: '검색과 답변 생성을 함께 수행하는 query engine을 index에서 만들고 제공된 question으로 실행하세요. 질문 문장은 암기 대상이 아닙니다.',
    whys: {
      0: '벡터 인덱스로부터 검색(Retriever)과 응답 합성(ResponseSynthesizer)을 결합한 일체형 쿼리 엔진 객체를 생성합니다.',
      1: '질문 문자열을 쿼리 엔진에 전달하여 관련 청크를 자동 검색하고 LLM 증강 답변 객체를 생성합니다.'
    },
    alternatives: {
      0: ['query_engine = index.as_query_engine(similarity_top_k=2)', 'query_engine = index.as_query_engine(similarity_top_k=5)'],
      1: ['response = query_engine.query(str(question))']
    }
  },
  'exam-rag01-05': {
    whys: {
      0: '질의 문자열을 전달하여 벡터 인덱스로부터 코사인 유사도가 가장 높은 관련 NodeWithScore 리스트를 검색합니다.',
      1: '검색된 노드들과 원본 질의를 response_synthesizer에 전달하여 LLM 기반의 최종 답변 객체를 합성합니다.'
    },
    alternatives: {
      0: ['nodes = self.retriever.retrieve(str(query_str))'],
      1: ['response_obj = self.response_synthesizer.synthesize(query=query_str, nodes=nodes)']
    }
  },
  'exam-rag02-05': {
    code: 'def custom_query(self, query_str):\n    # self.retriever, self.llm, self.qa_prompt는 준비됨\n    # template 변수: context_str, query_str\n    {{A}}\n    {{B}}\n    {{C}}\n    return response',
    prompt: 'retriever로 근거를 검색하고 n.node.get_content()를 두 줄바꿈으로 연결하세요. qa_prompt의 두 변수를 채워 self.llm.complete로 생성하세요.',
    whys: {
      0: '검색기(retriever)를 사용하여 질의와 가장 연관성 높은 텍스트 노드 목록을 검색합니다.',
      1: '검색된 각 노드(n.node)에서 본문 문자열을 추출하여 두 줄바꿈("\\n\\n")으로 연결한 컨텍스트 문자열을 구성합니다.',
      2: 'qa_prompt 템플릿의 context_str과 query_str을 바인딩한 후 LLM 완성형 메서드(.complete())를 호출하여 응답을 생성합니다.'
    },
    alternatives: {
      0: ['nodes = self.retriever.retrieve(str(query_str))'],
      1: [
        'context_str = "\\n\\n".join(n.node.get_content() for n in nodes)',
        'context_str = "\\n".join([n.node.get_content() for n in nodes])',
        'context_str = "\\n".join(n.node.get_content() for n in nodes)',
        'context_str = "\\n\\n".join([n.get_content() for n in nodes])'
      ],
      2: [
        'response = self.llm.complete(self.qa_prompt.format(query_str=query_str, context_str=context_str))'
      ]
    }
  },
  'exam-data01-04': {
    whys: {
      0: '실제 타깃 y_test와 모델 예측값 test_predictions 간의 평균 제곱근 오차(RMSE)를 계산합니다.',
      1: '실제 값 대비 오차율의 절댓값 평균인 평균 절대 백분율 오차(MAPE)를 계산합니다.'
    },
    alternatives: {
      0: ['rmse = root_mean_squared_error(y_true=y_test, y_pred=test_predictions)', 'rmse = np.sqrt(mean_squared_error(y_test, test_predictions))'],
      1: ['mape = mean_absolute_percentage_error(y_true=y_test, y_pred=test_predictions)']
    }
  },
  'exam-data01-05': {
    code: 'class ConvModel(nn.Module):\n    def __init__(self, input_size, hidden_size):\n        super().__init__()\n        {{A}}\n        {{B}}\n    def forward(self, x):\n        # x [B,T,F], Conv1d 입력은 [B,F,T]\n        out = self.conv1d(x.transpose(1,2)).transpose(1,2)\n        return self.fc(out)',
    prompt: 'Conv1d의 input channel은 input_size, output channel은 hidden_size입니다. kernel_size=2, stride=1로 구성하고 시점별 hidden을 1개 값으로 바꾸는 self.fc를 구성하세요.',
    whys: {
      0: '시계열 특징 수를 입력 채널로 취급하여 kernel_size=2인 1차원 합성곱 계층을 구성합니다.',
      1: '합성곱 결과의 hidden_size 차원을 1개의 스칼라 예측값으로 사영하는 완전연결계층을 정의합니다.'
    },
    alternatives: {
      0: [
        'self.conv1d = nn.Conv1d(input_size, hidden_size, kernel_size=2, stride=1)',
        'self.conv1d = nn.Conv1d(input_size, hidden_size, 2, stride=1)',
        'self.conv1d = nn.Conv1d(input_size, hidden_size, 2)'
      ],
      1: [
        'self.fc = nn.Linear(in_features=hidden_size, out_features=1)',
        'self.fc = torch.nn.Linear(hidden_size, 1)'
      ]
    }
  },
  'exam-data01-02': {
    whys: {
      0: '모델 출력 [B, T, 1]에서 시계열의 가장 마지막 시점(-1)과 단일 채널(0)을 슬라이싱하여 배치별 1차원 예측값 [B]를 추출합니다.',
      1: '예측값 [B]와 정답 타깃 batch_y [B]를 손실 함수에 전달하여 스칼라 손실을 계산합니다.',
      2: '기존에 누적된 가중치 파라미터의 gradient를 0으로 초기화합니다.',
      3: '손실 스칼라로부터 역전파를 수행하여 가중치 파라미터의 기울기를 계산합니다.',
      4: '옵티마이저를 통해 계산된 기울기를 바탕으로 모델 파라미터를 갱신합니다.'
    },
    alternatives: {
      0: ['pred = model(batch_x)[:, -1]', 'pred = model(batch_x)[:, -1, :].squeeze(-1)'],
      1: ['loss = loss_fn(input=pred, target=batch_y)'],
      2: ['optimizer.zero_grad(set_to_none=True)']
    }
  },
  'exam-v01-03': {
    prompt: 'CPU float 이미지 x [B,3,H,W]를 역정규화하세요. 제공된 CIFAR10_MEAN과 CIFAR10_STD를 [1,3,1,1]로 만들어 broadcast하고 x*std+mean을 반환하세요.',
    whys: {
      0: '이미지 텐서 [B, 3, H, W]와의 브로드캐스팅 연산을 위해 채널별 평균 튜플을 [1, 3, 1, 1] 텐서로 변환합니다.',
      1: '채널별 표준편차 튜플을 [1, 3, 1, 1] 텐서로 변환합니다.',
      2: '정규화 공식의 역변환인 x * std + mean을 계산하여 원래 픽셀 색상 값으로 복원합니다.'
    },
    alternatives: {
      0: ['mean = torch.tensor(CIFAR10_MEAN).reshape(1,3,1,1)', 'mean = torch.tensor(CIFAR10_MEAN).view(1, 3, 1, 1)', 'mean = torch.tensor(CIFAR10_MEAN).reshape(1, 3, 1, 1)'],
      1: ['std  = torch.tensor(CIFAR10_STD).reshape(1,3,1,1)', 'std = torch.tensor(CIFAR10_STD).view(1,3,1,1)', 'std = torch.tensor(CIFAR10_STD).view(1, 3, 1, 1)'],
      2: ['return (x * std) + mean', 'return x*std + mean']
    }
  },
  'exam-v02-02': {
    whys: {
      0: '입력 x를 3배 크기로 선형 사영한 뒤 마지막 특징 축(dim=-1)을 따라 Query, Key, Value 3개 텐서로 균등 분할(chunk)합니다.',
      1: 'rearrange를 사용하여 각 텐서 [B, N, H*D]를 멀티헤드 차원 [B, H, N, D]로 재배열합니다.'
    },
    alternatives: {
      0: ['qkv = self.to_qkv(x).chunk(3, dim=-1)', 'qkv = self.to_qkv(x).chunk(3, -1)', 'qkv = self.to_qkv(x).chunk(3, dim=2)'],
      1: ["q, k, v = map(lambda t: rearrange(t, 'b n (h d) -> b h n d', h=h), qkv)", "q, k, v = [rearrange(t, 'b n (h d) -> b h n d', h=h) for t in qkv]"]
    }
  },
  'exam-v02-03': {
    whys: {
      0: 'Query와 Key의 헤드별 내적을 계산하여 어텐션 스코어 [B, H, i, j]를 구하고 1/sqrt(D) 스케일 팩터를 곱합니다.',
      1: '스케일된 점수에 softmax 및 드롭아웃을 적용하여 정규화된 어텐션 확률 가중치 행렬을 얻습니다.',
      2: '어텐션 확률 행렬과 Value 텐서의 행렬곱을 통해 최종 어텐션 가중합 출력 [B, H, i, D]를 산출합니다.'
    },
    alternatives: {
      0: ["dots = (q @ k.transpose(-2, -1)) * self.scale"],
      1: ["attn = torch.softmax(dots, dim=-1)"],
      2: ["out = attn @ v"]
    }
  },
  'exam-od1-04': {
    whys: {
      0: 'bias는 input과 weight의 곱에 더해지므로 바이어스의 양자화 스케일은 반드시 input_scale * weight_scale이어야 합니다.',
      1: '32비트 정수(int32) 정밀도로 zero_point=0을 적용하여 bias를 양자화합니다.'
    },
    alternatives: {
      0: ['bias_scale = weight_scale * input_scale'],
      1: ['quantized_bias = linear_quantize(bias, 32, bias_scale, 0, torch.int32)', 'quantized_bias = linear_quantize(bias, 32, bias_scale, zero_point=0, dtype=torch.int)']
    }
  },
  'exam-od1-05': {
    whys: {
      0: '누적기 출력에 유효 배율 M = (input_scale * weight_scale) / output_scale을 곱하여 목표 출력 스케일로 재양자화합니다.',
      1: '출력 텐서의 정수 표현 오프셋인 output_zero_point를 더하여 영점을 정렬합니다.'
    },
    alternatives: {
      0: ['output = output * (input_scale * weight_scale / output_scale)', 'output = output * ((input_scale * weight_scale) / output_scale)'],
      1: ['output = output_zero_point + output']
    }
  },

  // ==========================================
  // ROUND 3
  // ==========================================
  'exam-llm06a-04': {
    code: 'num_classes = 2\n# BASE_CONFIG["emb_dim"]은 최종 hidden vector 크기\n{{A}}\n# 이후 model(x)는 class logits를 출력합니다.',
    whys: {
      0: '사전학습된 기본 백본의 출력 차원(BASE_CONFIG["emb_dim"])을 다운스트림 분류 클래스 수(num_classes)로 변환하는 새 선형 계층을 장착합니다.'
    },
    alternatives: {
      0: [
        'model.out_head = nn.Linear(BASE_CONFIG["emb_dim"], num_classes)',
        'model.out_head = torch.nn.Linear(BASE_CONFIG["emb_dim"], num_classes)',
        'model.out_head = nn.Linear(in_features=BASE_CONFIG["emb_dim"], out_features=num_classes)',
        'model.out_head = nn.Linear(BASE_CONFIG[\'emb_dim\'], num_classes)'
      ]
    }
  },
  'exam-llm06b-03': {
    whys: {
      0: '동결된 원본 선형 계층의 출력 self.linear(x)와 학습 가능한 LoRA 어댑터의 출력 self.lora(x)를 원소별 덧셈으로 결합하여 반환합니다.'
    },
    alternatives: {
      0: ['return self.lora(x) + self.linear(x)']
    }
  },
  'exam-rag04-01': {
    whys: {
      0: '크롤링된 HTML 본문 문자열을 lxml 파서를 통해 파싱 가능한 BeautifulSoup DOM 구조로 변환합니다.',
      1: 'HTML 태그를 배제하고 순수 텍스트만 추출하되 단어 간 공백을 두고 앞뒤 불필요한 공백을 strip합니다.',
      2: '정제된 순수 텍스트를 검색 대상 문서 리스트(all_documents)에 추가합니다.'
    },
    alternatives: {
      0: ["soup = BeautifulSoup(html_text['page_result'], 'lxml')", "soup = BeautifulSoup(html_text['page_result'], features='lxml')", 'soup = BeautifulSoup(html_text["page_result"], "html.parser")'],
      1: ["text = soup.get_text(' ', strip=True)", 'text = soup.get_text(separator=" ", strip=True)', "text = soup.get_text(separator=' ', strip=True)"]
    }
  },
  'exam-rag04-03': {
    code: 'def embed(self, texts):\n    embedding_model = "text-embedding-3-small"  # 제공값\n    {{A}}\n    {{B}}\n    {{C}}',
    answers: { 0: 'response = self.client.embeddings.create(model=embedding_model, input=texts)' },
    prompt: '준비된 self.client와 embedding_model을 사용해 texts를 임베딩하세요. response.data의 각 item.embedding을 NumPy 벡터로 모아 [N,D] 배열로 반환하세요.',
    whys: {
      0: 'OpenAI 호환 클라이언트를 호출하여 지정된 모델로 텍스트 목록의 고밀도 임베딩을 요청합니다.',
      1: '응답 데이터의 각 항목에서 임베딩 리스트(item.embedding)를 넘파이 배열(np.array)로 추출하여 모읍니다.',
      2: '추출된 개별 임베딩 리스트를 최종 [N, D] 2차원 넘파이 행렬로 결합하여 반환합니다.'
    },
    alternatives: {
      0: ['response = self.client.embeddings.create(input=texts, model=embedding_model)'],
      1: ['embeddings = [np.array(item.embedding, dtype=np.float32) for item in response.data]', 'embeddings = [item.embedding for item in response.data]'],
      2: ['return np.asarray(embeddings)', 'return np.array(embeddings, dtype=np.float32)']
    }
  },
  'exam-rag04-04': {
    code: '# all_embeddings [N,D], query_embedding [D]\n# 두 입력의 모든 vector norm은 0보다 큽니다.\n# all_chunks 길이 N, 1 <= topk <= N\n{{A}}\n{{B}}\n{{C}}\n# top_k_chunks를 Reader에 전달합니다.',
    prompt: 'np.dot와 np.linalg.norm으로 cosine similarity를 계산하세요. (-cosine_scores).argsort()로 내림차순 index를 얻어 상위 topk개 chunk를 선택하세요.',
    whys: {
      0: '문서 임베딩 행렬과 쿼리 벡터 간 내적을 L2 노름 곱으로 나누어 N개 문서에 대한 코사인 유사도 점수 [N]을 계산합니다.',
      1: '코사인 점수를 음수 부호로 변환 후 argsort를 취해 점수가 가장 높은 상위 topk개의 인덱스를 추출합니다.',
      2: '추출된 상위 인덱스로 전체 청크 배열을 슬라이싱하여 가장 연관성 높은 텍스트 청크 목록을 구성합니다.'
    },
    alternatives: {
      0: [
        'cosine_scores = (all_embeddings @ query_embedding) / (np.linalg.norm(all_embeddings, axis=1) * np.linalg.norm(query_embedding))',
        'cosine_scores = np.dot(all_embeddings, query_embedding) / (np.linalg.norm(query_embedding) * np.linalg.norm(all_embeddings, axis=1))'
      ],
      1: ['top_k_indices = np.argsort(-cosine_scores)[:topk]', 'top_k_indices = np.argsort(cosine_scores)[::-1][:topk]'],
      2: ['top_k_chunks = [all_chunks[i] for i in top_k_indices]', 'top_k_chunks = np.asarray(all_chunks)[top_k_indices]']
    }
  },
  'exam-data02-02': {
    whys: {
      0: 'GCN의 대칭 정규화 공식인 1 / sqrt(deg_src * deg_dst)를 계산하여 차수가 큰 노드의 메시지 과대 반영을 방지합니다.'
    },
    alternatives: {
      0: [
        'norm = 1.0 / torch.sqrt(deg[src] * deg[dst])',
        'norm = (deg[src] * deg[dst]).sqrt().pow(-1)',
        'norm = 1 / torch.sqrt(deg[src] * deg[dst])',
        'norm = 1.0 / (deg[src] * deg[dst]).sqrt()'
      ]
    }
  },
  'exam-data02-03': {
    whys: {
      0: '소스 노드의 자체 특징 변환 W1(e_u)과 유저-아이템 상호작용 특징 W2(e_u ⊙ e_i)를 합산하여 엣지 메시지를 생성합니다.',
      1: '1차원 대칭 정규화 계수 norm [E]에 차원을 추가해 [E, 1]로 만든 뒤 엣지 메시지 [E, D]에 브로드캐스팅 곱합니다.'
    },
    alternatives: {
      0: [
        'edge_messages_for_dst = self.W1(src_feat) + self.W2(src_feat * dst_feat)',
        'edge_messages_for_dst = self.W2(src_feat * dst_feat) + self.W1(src_feat)'
      ],
      1: [
        'edge_messages_for_dst = edge_messages_for_dst * norm.unsqueeze(1)',
        'edge_messages_for_dst = edge_messages_for_dst * norm.unsqueeze(-1)',
        'edge_messages_for_dst *= norm.unsqueeze(-1)'
      ]
    }
  },
  'exam-data02-04': {
    whys: {
      0: 'index_add_를 통해 목적지 노드(dst) 인덱스 위치에 맞춰 정규화된 엣지 메시지들을 누적 합산합니다.',
      1: '아이템 노드 영역(user_num부터 끝까지)에 아이템 자신의 기존 특징 변환값(Self-connection)을 가산합니다.'
    },
    alternatives: {
      0: ['aggregated_messages.index_add_(dim=0, index=dst, source=edge_messages_for_dst)'],
      1: ['aggregated_messages[user_num:] = aggregated_messages[user_num:] + self.W1(node_features[user_num:])']
    }
  },
  'exam-v03-02': {
    code: 'def box_cxcywh_to_xyxy(x):\n    # x [N,4]: center x, center y, width, height\n    {{A}}\n    {{B}}\n    {{C}}',
    whys: {
      0: '바운딩 박스 텐서 [N, 4]를 1번 차원을 따라 중심x, 중심y, 너비, 높이 4개의 1차원 텐서로 분리(unbind)합니다.',
      1: '중심과 크기 정보로부터 좌상단(x1, y1)과 우하단(x2, y2) 모서리 좌표를 계산하여 4원소 리스트로 묶습니다.',
      2: '4개의 1차원 좌표 텐서 리스트를 1번 차원을 따라 스택하여 [N, 4] xyxy 바운딩 박스 텐서로 반환합니다.'
    },
    alternatives: {
      0: ['x_c, y_c, w, h = x.unbind(dim=1)', 'x_c, y_c, w, h = x.unbind(-1)'],
      1: [
        'b = [x_c - 0.5 * w, y_c - 0.5 * h, x_c + 0.5 * w, y_c + 0.5 * h]',
        'b = [(x_c - w / 2), (y_c - h / 2), (x_c + w / 2), (y_c + h / 2)]'
      ],
      2: ['return torch.stack(b, dim=-1)', 'return torch.stack(b, 1)']
    }
  },
  'exam-v03-03': {
    whys: {
      0: '원본 이미지 크기 튜플 (너비, 높이)를 스칼라 변수로 언패킹합니다.',
      1: '정규화된 cxcywh 포맷 박스를 xyxy 모서리 좌표 포맷으로 변환합니다.',
      2: '정규화 좌표 [x1, y1, x2, y2]에 [너비, 높이, 너비, 높이] 스케일을 곱하여 원본 이미지의 실제 픽셀 좌표계로 복원합니다.',
      3: '스케일링이 완료된 실제 픽셀 단위 바운딩 박스 텐서를 반환합니다.'
    },
    alternatives: {
      2: [
        'b = b * torch.tensor([img_w, img_h, img_w, img_h], dtype=torch.float)',
        'b = b * torch.tensor([img_w, img_h, img_w, img_h], device=b.device, dtype=torch.float32)',
        'b = b * torch.tensor([img_w, img_h, img_w, img_h], dtype=torch.float32, device=b.device)'
      ]
    }
  },
  'exam-v03-04': {
    whys: {
      0: '전처리된 이미지 텐서를 DETR 모델에 통과시켜 클래스 로짓과 예측 박스 딕셔너리를 출력합니다.',
      1: '클래스 로짓에 softmax를 적용하고 첫 배치([0])에서 마지막 no-object 배경 클래스를 제외([..., :-1])한 유효 객체 확률을 추출합니다.',
      2: '최대 객체 확률이 0.9 신뢰도 임계값을 초과하는 유효 탐지 쿼리를 필터링하는 불리언 마스크를 생성합니다.',
      3: '선별된 쿼리의 예측 박스들을 원본 이미지 해상도(im.size)에 맞춰 실제 픽셀 좌표로 스케일 복원합니다.'
    },
    alternatives: {
      0: ['outputs = model.forward(img)'],
      1: [
        'probas = outputs["pred_logits"].softmax(-1)[0, :, :-1]',
        'probas = outputs[\'pred_logits\'].softmax(dim=-1)[0, :, :-1]',
        'probas = outputs["pred_logits"].softmax(dim=-1)[0, :, :-1]'
      ],
      2: [
        'keep = probas.max(dim=-1).values > 0.9',
        'keep = probas.max(-1)[0] > 0.9',
        'keep = probas.max(dim=-1)[0] > 0.9'
      ],
      3: ['bboxes_scaled = rescale_bboxes(outputs["pred_boxes"][0, keep], im.size)']
    }
  },
  'exam-od2-03': {
    prompt: 'weight [OC,IC,KH,KW]입니다. torch.abs의 공간 두 축 합으로 kernel별 중요도를 계산하세요. num_pruned_kernels는 유효한 k이며 동률은 없습니다. kthvalue로 경계를 구하고 큰 kernel만 남기는 mask를 expand_as로 확장하세요.',
    whys: {
      0: '가중치 [OC, IC, KH, KW]에서 공간 축인 2, 3번 차원을 절댓값 합산하여 커널 단위 중요도 [OC, IC, 1, 1]를 구합니다.',
      1: '전체 커널 중요도 중 num_pruned_kernels번째로 작은 값을 추출하여 가지치기 경계 문턱값으로 설정합니다.',
      2: '문턱값보다 큰 유의미한 커널 위치만 True로 설정하는 이진 마스크를 생성합니다.',
      3: '[OC, IC, 1, 1] 마스크를 원본 가중치 크기인 [OC, IC, KH, KW]로 공간 확장합니다.'
    },
    alternatives: {
      0: [
        'importance = weight.abs().sum(dim=[2, 3], keepdim=True)',
        'importance = torch.abs(weight).sum(dim=(2, 3), keepdim=True)',
        'importance = weight.abs().sum((2, 3), keepdim=True)'
      ],
      1: ['threshold = torch.kthvalue(importance.flatten(), num_pruned_kernels).values', 'threshold = torch.kthvalue(importance.view(-1), num_pruned_kernels)[0]'],
      2: ['mask = threshold < importance'],
      3: ['mask = mask.expand(weight.shape)']
    }
  },
  'exam-od2-05': {
    prompt: 'parameters_to_prune에는 Conv/FC weight를 펼친 Tensor들이 들어 있습니다. 전체를 torch.cat으로 결합하고 sparsity에 맞는 전역 magnitude threshold를 구하세요. 반올림한 제거 수는 1 이상이고 원소 수 이하입니다.',
    whys: {
      0: '모델 전체의 모든 파라미터 텐서 리스트를 하나의 거대한 1차원 텐서로 결합하여 전역 비교를 준비합니다.',
      1: '전역 파라미터의 총 원소 수를 계산합니다.',
      2: '총 원소 수에 목표 희소도(sparsity)를 곱해 제거할 전역 파라미터 개수를 정수로 산출합니다.',
      3: '파라미터 가중치의 크기(절댓값)를 전역 중요도로 취합니다.',
      4: '전역 중요도 텐서에서 num_zeros번째로 작은 값을 찾아 모델 전체에 공통 적용할 전역 문턱값을 구합니다.'
    },
    alternatives: {
      0: ['all_weights = torch.concat(parameters_to_prune)'],
      1: ['num_elements = len(all_weights)'],
      2: ['num_zeros = int(round(num_elements * sparsity))', 'num_zeros = int(num_elements * sparsity)'],
      3: ['importance = all_weights.abs()'],
      4: ['threshold = torch.kthvalue(importance, num_zeros).values', 'threshold = torch.kthvalue(importance.flatten(), num_zeros)[0]']
    }
  },

  // ==========================================
  // ROUND 4
  // ==========================================
  'exam-llm04-09': {
    whys: {
      0: '어휘 로짓 [B, V]에서 가장 높은 확률의 토큰을 선택하되, 텐서 결합을 위해 2차원 [B, 1] 형태를 유지(keepdim=True)합니다.',
      1: '기존 토큰 시퀀스 [B, T]와 새로 생성된 토큰 [B, 1]을 시퀀스 축(dim=1)을 따라 이어붙여 [B, T+1]로 확장합니다.'
    },
    alternatives: {
      0: [
        'idx_next = torch.argmax(logits, dim=1, keepdim=True)',
        'idx_next = logits.argmax(dim=-1, keepdim=True)',
        'idx_next = logits.argmax(dim=1, keepdim=True)',
        'idx_next = torch.argmax(logits, -1, keepdim=True)'
      ],
      1: [
        'idx = torch.cat([idx, idx_next], dim=1)',
        'idx = torch.cat((idx, idx_next), dim=-1)',
        'idx = torch.cat([idx, idx_next], dim=-1)',
        'idx = torch.concat((idx, idx_next), dim=1)',
        'idx = torch.concat([idx, idx_next], dim=1)'
      ]
    }
  },
  'exam-llm07-03': {
    code: 'ignore_index = -100\n# targets [T]에는 정답 토큰 뒤에 EOS/padding 토큰이 반복됩니다.\nindices = (targets == pad_token_id).nonzero().flatten()\n{{A}}\n    {{B}}\n# 첫 EOS는 학습하고 그 뒤 padding만 loss에서 제외합니다.',
    prompt: '첫 EOS는 정답으로 유지하고 두 번째 이후 padding 위치는 ignore_index로 바꾸세요. indices는 오름차순 padding 위치입니다. 개수가 충분할 때만 slice를 적용하세요.',
    whys: {
      0: '패딩 토큰 인덱스가 2개 이상일 때(첫 EOS 뒤에 실제 패딩이 존재할 때)만 슬라이싱을 적용하기 위해 개수를 확인합니다.',
      1: '첫 번째 패딩 위치(EOS)는 모델의 생성 종료 학습을 위해 유지하고, 두 번째 이후 위치(indices[1:])만 손실 계산에서 무시되는 ignore_index(-100)로 치환합니다.'
    },
    alternatives: {
      0: ['if len(indices) > 1:', 'if indices.size(0) > 1:']
    }
  },
  'exam-rag06-05': {
    code: 'async def load_tools(external_mcp_server):\n    # BasicMCPClient, McpToolSpec이 import됨\n    {{A}}\n    {{B}}\n    {{C}}\n    return tools',
    whys: {
      0: '외부 MCP(Model Context Protocol) 서버와 통신하는 기본 MCP 클라이언트를 생성합니다.',
      1: '클라이언트를 감싸서 LlamaIndex 도구 명세 객체(McpToolSpec)로 초기화합니다.',
      2: '원격 MCP 서버에 비동기 RPC를 보내 제공되는 도구 목록을 FunctionTool 리스트로 가져옵니다.'
    }
  },
  'exam-rag06-06': {
    code: 'def configure(self, tools):\n    # self.llm과 SYSTEM_PROMPT는 제공되어 있습니다.\n    {{A}}\n    {{B}}',
    prompt: 'FunctionAgent에 tools, self.llm, SYSTEM_PROMPT를 연결해 self.agent에 저장하세요. 이어 Context(self.agent)로 대화 문맥을 생성해 self.agent_context에 저장하세요.',
    whys: {
      0: '제공된 MCP 도구 리스트, LLM, 그리고 시스템 프롬프트를 바인딩하여 도구 호출 에이전트를 초기화합니다.',
      1: '에이전트 인스턴스로부터 실행 상태 및 대화 이력을 추적할 Context 객체를 생성하여 저장합니다.'
    },
    alternatives: {
      0: ['self.agent = FunctionAgent(tools=tools, llm=self.llm, system_prompt=SYSTEM_PROMPT,)']
    }
  },
  'exam-rag06-07': {
    code: 'async def run_query(self, question, verbose):\n    {{A}}\n    {{B}}\n        {{C}}\n            {{D}}\n    {{E}}\n    return response',
    prompt: 'self.agent.run에 question과 ctx=self.agent_context를 전달하세요. handler.stream_events()를 async for로 읽고 verbose이며 type(event)==ToolCall인 경우 tool_name과 tool_kwargs를 출력하세요. 마지막으로 handler를 await해 최종 응답을 받으세요.',
    whys: {
      0: '질문 텍스트와 대화 컨텍스트를 에이전트에 전달하여 비동기 실행 핸들러를 획득합니다.',
      1: '핸들러가 비동기적으로 발생시키는 이벤트 스트림을 순회합니다.',
      2: '상세 출력(verbose) 모드이고 이벤트 타입이 도구 호출(ToolCall)인지 검사합니다.',
      3: '호출되는 도구의 함수명과 전달된 키워드 인자들을 콘솔에 출력합니다.',
      4: '핸들러 작업의 완료를 비동기 대기(await)하여 최종 응답 객체를 수신합니다.'
    },
    alternatives: {
      2: ['if verbose and isinstance(event, ToolCall):'],
      3: ['print(event.tool_name,event.tool_kwargs)']
    }
  },
  'exam-data01-07': {
    code: 'class Encoder(nn.Module):\n    def __init__(self, input_size, hidden_size, num_layers):\n        super().__init__()\n        {{A}}\n    def forward(self, x):\n        {{B}}\n        {{C}}',
    whys: {
      0: '시계열 인코더용 다층 순환신경망(batch_first=True) 계층을 정의합니다.',
      1: '입력 시계열 [B, T, input_size]을 RNN에 통과시켜 전체 시점 출력과 최종 은닉 상태 h [num_layers, B, hidden_size]를 구합니다.',
      2: '디코더의 초기 은닉 상태로 전달할 컨텍스트 은닉 상태 h를 반환합니다.'
    },
    alternatives: {
      0: ['self.rnn = nn.RNN(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers, batch_first=True)']
    }
  },
  'exam-data01-08': {
    code: 'class Decoder(nn.Module):\n    def __init__(self, input_size, hidden_size, num_layers):\n        super().__init__()\n        {{A}}\n        {{B}}\n    def forward(self, x, h):\n        {{C}}\n        {{D}}\n        {{E}}',
    prompt: 'batch-first RNN과 hidden_size→input_size Linear를 구성하세요. forward에서 입력 x와 이전 h를 RNN에 전달하고 출력에 fc를 적용한 뒤 out과 새 h를 반환하세요.',
    whys: {
      0: '1개 시점의 입력을 받아 순환 갱신을 수행할 디코더 순환신경망 계층을 구성합니다.',
      1: '은닉 상태 차원(hidden_size)을 다음 시점 입력 크기(input_size)로 변환하는 선형 계층을 구성합니다.',
      2: '1개 시점 입력 x [B, 1, input_size]와 이전 은닉 상태 h를 RNN에 전달하여 출력과 새 은닉 상태를 획득합니다.',
      3: 'RNN 출력을 완전연결계층에 통과시켜 다음 1시점의 예측값 out [B, 1, input_size]을 생성합니다.',
      4: '예측값 out과 갱신된 은닉 상태 h를 튜플로 반환합니다.'
    },
    alternatives: {
      0: ['self.rnn = nn.RNN(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers, batch_first=True)'],
      1: ['self.fc = nn.Linear(in_features=hidden_size, out_features=input_size)']
    }
  },
  'exam-data01-09': {
    code: 'def forward(self, source, target_len):\n    predictions = []\n    {{A}}\n    {{B}}\n    {{C}}\n        {{D}}\n        predictions.append(out.squeeze(1))\n        {{E}}\n    return torch.stack(predictions, dim=1)',
    whys: {
      0: '과거 관측 데이터 source [B, T_in, F]를 인코더에 통과시켜 초기 은닉 상태 h를 획득합니다.',
      1: '관측 시계열의 가장 마지막 실제 시점 벡터 [B, F]에 시간 차원을 추가하여 첫 디코더 입력 [B, 1, F]을 준비합니다.',
      2: '예측 목표 길이(target_len)만큼 반복하여 자기회귀 생성을 수행합니다.',
      3: '현재 시점 입력과 은닉 상태를 디코더에 통과시켜 다음 시점 예측 out과 갱신된 은닉 상태 h를 구합니다.',
      4: '현재 생성된 예측값 out을 다음 스텝의 입력으로 피드백합니다.'
    },
    alternatives: {
      1: ['input = source[:, -1:].clone()', 'input = source[:, -1:, :]']
    }
  },
  'exam-v04-05': {
    code: 'class Up(nn.Module):\n    def __init__(self, in_channels, out_channels):\n        super().__init__()\n        # 여기서는 transposed convolution 경로만 구현합니다.\n        {{A}}\n        {{B}}',
    prompt: 'kernel_size=2, stride=2인 ConvTranspose2d로 공간을 두 배, channel을 절반으로 만드세요. 이후 skip 결합 결과 in_channels를 out_channels로 바꿀 DoubleConv를 self.conv에 준비하세요.',
    whys: {
      0: '피처맵 공간 해상도를 2배 확장하고 채널을 절반으로 축소하는 전치 합성곱(ConvTranspose2d) 계층을 구성합니다.',
      1: '스킵 연결로 합쳐진 2배 채널을 최종 출력 채널(out_channels)로 정제하는 DoubleConv 블록을 준비합니다.'
    },
    alternatives: {
      0: [
        'self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, 2, stride=2)',
        'self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2, bias=True)'
      ]
    }
  },
  'exam-v04-06': {
    code: 'def forward(self, x1, x2):\n    # x1: decoder, x2: encoder skip\n    {{A}}\n    diff_y = x2.size(2) - x1.size(2)\n    diff_x = x2.size(3) - x1.size(3)\n    {{B}}\n    {{C}}\n    return self.conv(x)',
    answers: { 1: 'x1 = F.pad(x1, [diff_x // 2, diff_x - diff_x // 2, diff_y // 2, diff_y - diff_y // 2])' },
    whys: {
      0: '디코더 피처 x1의 공간 해상도를 2배 업샘플링합니다.',
      1: '다운샘플링 절삭으로 인한 인코더 스킵 피처 x2와의 해상도 불일치를 보정하기 위해 상하좌우 패딩을 적용합니다.',
      2: '공간 크기가 일치된 인코더 스킵 피처 x2와 업샘플링 피처 x1을 채널 차원(dim=1)으로 이어붙입니다.'
    },
    alternatives: {
      1: ['x1 = F.pad(x1, (diff_x // 2, diff_x - diff_x // 2, diff_y // 2, diff_y - diff_y // 2))'],
      2: [
        'x = torch.cat((x2, x1), dim=1)',
        'x = torch.concat([x2, x1], dim=1)',
        'x = torch.concat((x2, x1), dim=1)'
      ]
    }
  },
  'exam-v04-08': {
    whys: {
      0: '보틀넥 x5와 최하단 인코더 스킵 피처 x4를 첫 번째 업샘플링 계층에 통과시켜 결합합니다.',
      1: '이전 단계 디코더 피처와 x3 스킵 피처를 두 번째 업샘플링 블록에서 결합합니다.',
      2: '세 번째 업샘플링 블록을 거쳐 x2 피처와 결합합니다.',
      3: '최상단 원본 해상도 스킵 피처 x1과 마지막 업샘플링 결합을 수행합니다.',
      4: '1x1 합성곱(self.outc)을 통해 최종 세그멘테이션 클래스 수 채널의 로짓 맵 [B, C, H, W]을 출력합니다.'
    }
  },
  'exam-od3-05': {
    code: 'def feature_loss(teacher, student, inputs, mse_loss):\n    # teacher와 student가 반환하는 feature는 같은 shape입니다.\n    {{A}}\n        {{B}}\n    {{C}}\n    {{D}}\n    return student_logits, hidden_rep_loss',
    whys: {
      0: '교사 모델의 특징 맵 추출 시 불필요한 gradient 그래프 생성을 방지하기 위해 no_grad 컨텍스트를 적용합니다.',
      1: '교사 모델을 순전파하여 중간 은닉 특징 맵(teacher_feature_map)을 추출합니다.',
      2: '학생 모델을 순전파하여 학생의 로짓과 매핑된 특징 맵을 동시에 추출합니다.',
      3: '학생과 교사의 중간 특징 맵 간 평균 제곱 오차(MSE)를 계산하여 중간 계층 증류 손실을 구합니다.'
    },
    alternatives: {
      0: ['with torch.inference_mode():'],
      3: ['hidden_rep_loss = mse_loss(input=regressor_feature_map, target=teacher_feature_map)']
    }
  },
  'exam-od3-03': {
    code: 'def cosine_feature_loss(teacher, student, inputs, cosine_loss):\n    # CUDA Tensor, 두 hidden의 shape [B,D]는 같습니다.\n    {{A}}\n        {{B}}\n    {{C}}\n    {{D}}\n    return student_logits, hidden_rep_loss',
    whys: {
      0: '교사 모델의 은닉 표현 추출 시 연산 그래프 생성과 메모리 낭비를 방지합니다.',
      1: '교사 모델로부터 최종 은닉 벡터 표현 [B, D]를 추출합니다.',
      2: '학생 모델로부터 학생의 로짓과 은닉 벡터 표현 [B, D]를 추출합니다.',
      3: 'CosineEmbeddingLoss에서 두 벡터가 동일 방향(코사인 유사도 1)을 지향하도록 target을 1로 설정한 텐서를 넘겨 손실을 계산합니다.'
    },
    alternatives: {
      0: ['with torch.inference_mode():'],
      3: [
        'hidden_rep_loss = cosine_loss(student_hidden_representation, teacher_hidden_representation, target=torch.ones(inputs.size(0), device=inputs.device))',
        'hidden_rep_loss = cosine_loss(student_hidden_representation, teacher_hidden_representation, torch.ones(inputs.size(0)).cuda())'
      ]
    }
  },

  // ==========================================
  // ROUND 5
  // ==========================================
  'exam-llm06b-01': {
    whys: {
      0: 'LoRA 다운 프로젝션 파라미터 행렬 A는 입력 차원(in_dim)에서 저순위 차원(rank)으로 축소하는 [in_dim, rank] 크기로 선언합니다.',
      1: 'LoRA 업 프로젝션 행렬 B는 [rank, out_dim] 크기로 선언하되, 초기 학습 시 기존 사전학습 가중치를 그대로 보존(ΔW = B @ A = 0)하기 위해 반드시 0(zeros)으로 초기화합니다.'
    },
    alternatives: {
      0: ['self.A = torch.nn.Parameter(torch.empty(in_dim, rank))', 'self.A = nn.Parameter(torch.zeros(in_dim, rank))'],
      1: ['self.B = torch.nn.Parameter(torch.zeros(rank, out_dim))']
    }
  },
  'exam-llm07d-03': {
    whys: {
      0: '학습 대상 모델(policy)에서 선호 응답(chosen)과 비선호 응답(rejected)의 로그 확률 차이를 계산합니다.',
      1: '기준 모델(reference)에서 선호 응답과 비선호 응답의 로그 확률 차이를 계산합니다.',
      2: '학습 모델의 로그 비율에서 기준 모델의 로그 비율을 차감하여 암묵적 보상 차이 로짓을 산출합니다.',
      3: 'KL 계수 beta를 곱한 상대적 보상 로짓에 -log(sigmoid)를 적용하여 DPO 손실을 완성합니다.'
    },
    alternatives: {
      3: [
        'losses = -torch.logsigmoid(beta * logits)',
        'losses = -torch.nn.functional.logsigmoid(beta * logits)'
      ]
    }
  },
  'exam-rag03-03': {
    code: '# 각 example_item은 {"query": 질문, "answer": 정답, ...} 형식\nfor domain, example_item in unique_domains.items():\n    {{A}}\n    {{B}}\n    # question은 모델 입력, answer는 평가 기준으로 사용',
    whys: {
      0: '평가 데이터 딕셔너리로부터 모델 입력으로 전달할 질의 문자열 필드("query")를 추출합니다.',
      1: '생성된 응답의 정답 일치 검증 기준으로 사용할 타깃 필드("answer")를 추출합니다.'
    },
    alternatives: {
      0: ['question = example_item["query"]'],
      1: ['answer = example_item["answer"]']
    }
  },
  'exam-rag06-04': {
    code: '# 네 범주는 상호 배타적이며 전체 평가 데이터를 모두 포함합니다.\n# exact correct: +1, semantic correct: +0.5, miss: 0, hallucination: -1\n# finance_test_dataset_ids는 전체 평가 ID 목록입니다.\n{{A}}\n{{B}}',
    prompt: '전체 샘플 수에서 exact correct, semantic correct, miss 수를 빼 hallucination 개수를 구하세요. 제공된 가중치로 정규화 전 CRAG_score 합계를 계산하세요.',
    whys: {
      0: '전체 평가 샘플 수에서 정확 일치, 의미 일치, 미답변(miss) 건수를 차감하여 모델의 환각(hallucination) 건수를 산출합니다.',
      1: '완전 일치(+1.0), 의미적 일치(+0.5), 환각(-1.0) 가중치를 적용하여 CRAG 총점을 합산합니다.'
    },
    alternatives: {
      1: [
        'CRAG_score = 1.0 * n_correct_exact + 0.5 * n_correct - n_hallucinate',
        'CRAG_score = n_correct_exact + 0.5 * n_correct - 1.0 * n_hallucinate',
        'CRAG_score = n_correct_exact + 0.5 * n_correct - 1 * n_hallucinate'
      ]
    }
  },
  'exam-rag05-08': {
    code: 'def answer_query(self, query, is_finance, kg_results, retrieved_results):\n    # kg_results: 단일 문자열, retrieved_results: 웹 근거 문자열 목록\n    {{A}}\n        {{B}}\n    {{C}}\n        {{D}}\n    {{E}}\n    return answer',
    prompt: '금융 질문이면 단일 KG 문자열을 목록으로 감싸고, 그 외에는 웹 검색 목록을 그대로 선택하세요. self.reader.generate_response(query, combined_results)로 답변을 생성하세요.',
    whys: {
      0: '금융 도메인 질문인지 여부를 불리언 플래그로 분기합니다.',
      1: '금융 질문인 경우 지식 그래프(Knowledge Graph)의 단일 사실 문자열을 리스트로 감싸 컨텍스트를 구성합니다.',
      2: '일반 질문인 경우의 분기입니다.',
      3: '일반 질문인 경우 웹 검색 엔진으로부터 가져온 텍스트 청크 리스트를 그대로 선택합니다.',
      4: '질의와 취합된 근거 리스트를 Reader 모델에 전달하여 최종 답변 문자열을 생성합니다.'
    }
  },
  'exam-data02-08': {
    code: '# train_edge_index[1,indices]: user offset이 포함된 positive node ID\n# item_features는 item만의 embedding입니다.\n# 이 문제는 균일 무작위 후보 추출만 구현합니다(positive 제외 검사는 별도).\n{{A}}\n{{B}}\n{{C}}\n{{D}}',
    whys: {
      0: 'edge_index의 아이템 노드 번호에 포함된 유저 오프셋(num_users)을 차감하여 순수 아이템 0 기반 인덱스로 환원합니다.',
      1: '전체 영화 아이템 수 범위 [0, num_movies)에서 배치 크기만큼의 부정 아이템 인덱스를 균일 무작위 샘플링합니다.',
      2: '긍정 아이템 인덱스를 사용하여 아이템 특징 행렬에서 실제 상호작용 아이템 임베딩을 추출합니다.',
      3: '부정 아이템 인덱스를 사용하여 아이템 특징 행렬에서 대조 학습용 부정 아이템 임베딩을 추출합니다.'
    },
    alternatives: {
      1: [
        'neg_item_indices = torch.randint(low=0, high=num_movies, size=(batch_size,), device=device)',
        'neg_item_indices = torch.randint(0, num_movies, [batch_size], device=device)'
      ]
    }
  },
  'exam-data02-06': {
    whys: {
      0: '각 레이어의 노드 임베딩 출력 리스트를 마지막 특징 차원(dim=-1)을 따라 연결하여 다중 홉(multi-hop) 표현을 만듭니다.',
      1: '통합 노드 행렬의 앞쪽 영역([:self.num_users])을 슬라이싱하여 유저 노드들의 최종 특징 임베딩을 분리합니다.',
      2: '통합 노드 행렬의 뒤쪽 영역([self.num_users:])을 슬라이싱하여 아이템 노드들의 최종 특징 임베딩을 분리합니다.'
    },
    alternatives: {
      0: [
        'final_features = torch.concat(layer_outputs, dim=-1)',
        'final_features = torch.cat(layer_outputs, dim=-1)',
        'final_features = torch.cat(layer_outputs, -1)',
        'final_features = torch.concat(layer_outputs, -1)'
      ],
      1: ['user_features = final_features[0:self.num_users]']
    }
  },
  'exam-data02-09': {
    whys: {
      0: '유저, 긍정 아이템, 부정 아이템 임베딩을 bpr_loss 함수에 전달하여 베이지안 개인화 랭킹 손실 스칼라를 계산합니다.',
      1: '이전 배치에서 계산된 가중치 파라미터의 gradient를 0으로 초기화합니다.',
      2: '손실값으로부터 모델 파라미터에 대한 기울기를 역전파합니다.',
      3: '옵티마이저를 통해 모델 파라미터 가중치를 갱신합니다.'
    },
    alternatives: {
      1: ['optimizer.zero_grad(set_to_none=True)']
    }
  },
  'exam-v02-06': {
    whys: {
      0: 'ViT에서 pool 모드가 "cls"인 경우 첫 번째 CLS 토큰([:, 0])을 취하고, 그렇지 않으면 패치 토큰 축(dim=1)의 평균(GAP)을 계산하여 [B, D] 표현을 만듭니다.',
      1: '풀링된 특징 벡터를 MLP 헤드에 통과시켜 클래스 수에 대응하는 로짓 [B, C]를 출력합니다.'
    },
    alternatives: {
      0: [
        'x = x[:, 0] if self.pool == \'cls\' else x.mean(dim=1)',
        'x = x[:, 0] if self.pool == "cls" else x.mean(1)',
        'x = x[:, 0] if self.pool == \'cls\' else x.mean(1)',
        'x = x[:, 0] if self.pool == "cls" else torch.mean(x, dim=1)'
      ]
    }
  },
  'exam-v01-09': {
    whys: {
      0: '실제 클래스 t와 예측 클래스 p의 교차 위치 빈도를 1 증가시켜 혼동 행렬(Confusion Matrix) 원소를 누적합니다.',
      1: '대각선 원소(정답 수)를 각 행의 합(실제 클래스 총 샘플 수)으로 나누되, 0으로 나누기를 방지하기 위해 분모를 최소 1.0으로 clamp하여 클래스별 정확도를 구합니다.',
      2: '계산된 혼동 행렬과 클래스별 정확도 텐서를 튜플로 반환합니다.'
    },
    alternatives: {
      0: ['cm[int(t)][int(p)] += 1', 'cm[t.long(), p.long()] += 1', 'cm[t.item(), p.item()] += 1'],
      1: [
        'per_class_acc = cm.diagonal().float() / torch.clamp(cm.sum(1).float(), min=1.0)',
        'per_class_acc = cm.diag().float() / torch.clamp(cm.sum(dim=1).float(), min=1.0)',
        'per_class_acc = cm.diagonal() / torch.clamp(cm.sum(dim=1), min=1.0).float()'
      ]
    }
  },
  'exam-v01-06': {
    code: 'optimizer.zero_grad()\nwith torch.amp.autocast(device_type=device.type, enabled=torch.cuda.is_available()):\n    {{A}}\n    {{B}}\n{{C}}\n{{D}}\n{{E}}',
    whys: {
      0: '자동 혼합 정밀도(autocast) 컨텍스트 내에서 모델 순전파를 실행하여 FP16/BF16 가속 로짓을 산출합니다.',
      1: 'autocast 내부에서 정답 레이블과 비교하여 손실을 계산합니다.',
      2: 'FP16 언더플로우를 방지하기 위해 GradScaler로 손실을 스케일업(확대)한 뒤 역전파를 수행합니다.',
      3: 'scaler가 gradient를 unscale하고 inf/nan 여부를 확인한 뒤 안전할 때만 optimizer.step()을 실행합니다.',
      4: '다음 iteration을 위해 스케일링 팩터의 크기를 동적으로 갱신합니다.'
    },
    alternatives: {
      0: ['logits = model.forward(images)']
    }
  },
  'exam-od4-03': {
    prompt: 'W [row,col]과 input_feat[n] [col]이 주어집니다. 절댓값 weight×input norm으로 중요도를 만들고 row마다 round(col*sparsity)개를 제거하세요. 유효한 k와 동률 없음이 보장됩니다. threshold를 [row,1]로 바꿔 비교하세요.',
    whys: {
      0: '가중치 행렬 W의 출력 행(row)과 입력 열(col) 크기를 추출합니다.',
      1: '각 행마다 동일하게 제거할 입력 열의 개수를 산출합니다.',
      2: '가중치 절댓값과 입력 활성화 노름의 곱으로 Wanda 중요도 행렬 [row, col]을 계산합니다.',
      3: '행 차원(dim=1)을 따라 각 행에서 num_zeros_per_row번째로 작은 중요도를 찾아 행별 문턱값 [row]을 구합니다.',
      4: '1차원 문턱값을 [row, 1]로 확장하여 원본 중요도와 브로드캐스팅 비교함으로써 행 단위 가지치기 마스크를 생성합니다.'
    },
    alternatives: {
      0: ['row, col = W.size()'],
      1: ['num_zeros_per_row = int(round(col * sparsity))', 'num_zeros_per_row = int(col * sparsity)'],
      2: ['importance = W.abs() * input_feat[n]', 'importance = torch.abs(W) * input_feat[n].view(1, -1)'],
      3: [
        'threshold = torch.kthvalue(importance, num_zeros_per_row, dim=1).values',
        'threshold = torch.kthvalue(importance, num_zeros_per_row, dim=-1)[0]',
        'threshold = torch.kthvalue(importance, num_zeros_per_row, dim=-1).values'
      ],
      4: [
        'mask = importance > threshold.view(row, 1)',
        'mask = importance > threshold.unsqueeze(1)',
        'mask = importance > threshold.unsqueeze(-1)'
      ]
    }
  },
  'exam-od5-02': {
    prompt: 'importance 길이는 100 이상입니다. torch.topk로 상위 1% input channel index를 찾고 해당 weight column을 scale_factor배 확대하세요. pseudo_quantize_tensor로 양자화한 뒤 같은 column을 scale_factor로 나누세요. scale_factor>0입니다.',
    whys: {
      0: '입력 채널 중 활성화 중요도 상위 1%에 해당하는 이상치(Outlier) 채널 인덱스를 추출합니다.',
      1: '이상치 채널에 해당하는 가중치 열들을 scale_factor배 확대하여 양자화 격자 해상도를 높입니다.',
      2: '확대된 가중치에 대해 지정된 비트수(w_bit)와 그룹 크기로 모의 양자화를 수행합니다.',
      3: '양자화 완료 후 확대한 비율만큼 다시 scale_factor로 나누어 수학적 크기를 복원합니다.'
    },
    alternatives: {
      0: [
        'outlier_mask = torch.topk(importance, int(len(importance) * 0.01)).indices',
        'outlier_mask = torch.topk(importance, int(importance.numel() * 0.01))[1]',
        'outlier_mask = torch.topk(importance, int(importance.numel() * 0.01)).indices'
      ],
      1: ['m.weight.data[:, outlier_mask] = m.weight.data[:, outlier_mask] * scale_factor'],
      2: [
        'm.weight.data = pseudo_quantize_tensor(m.weight.data, w_bit, q_group_size=q_group_size)',
        'm.weight.data = pseudo_quantize_tensor(m.weight.data, n_bit=w_bit, q_group_size=q_group_size)'
      ],
      3: ['m.weight.data[:, outlier_mask] = m.weight.data[:, outlier_mask] / scale_factor']
    }
  }
};
