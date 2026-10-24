window.EXAM_NUMBER=2;
window.EXAM=[
  {
    "subject": "LLM",
    "title": "Embedding 입력 준비",
    "source": "Dataset & Embeddings · 기존 빈칸 주변 코드 응용",
    "prompt": "token_ids는 길이 T의 Python 정수 목록입니다. torch.tensor로 정수 index Tensor를 만들고 batch 축을 추가하세요. model_device로 이동시킨 뒤 준비된 embedding_layer에 전달하세요.",
    "code": "token_ids = [2, 5, 1, 3]  # 제공값\n{{A}}\n{{B}}\n{{C}}\n# embeddings: [1,T,D]",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "input_ids = torch.tensor(token_ids, dtype=torch.long)",
        "why": "파이썬 정수 목록을 임베딩 룩업에 적합한 64비트 정수(long) 텐서 [T]로 변환합니다. 오답 주의: float 타입으로 생성하면 nn.Embedding에서 룩업 인덱스 타입 불일치 에러가 발생합니다.",
        "alternatives": [
          "input_ids = torch.tensor(token_ids, dtype=torch.int64)",
          "input_ids = torch.LongTensor(token_ids)",
          "input_ids = torch.tensor(token_ids)"
        ]
      },
      {
        "key": "B",
        "points": 2,
        "answer": "input_ids = input_ids.unsqueeze(0).to(model_device)",
        "why": "1차원 시퀀스 텐서 [T]의 앞쪽에 배치 차원을 추가하여 [1, T] 형태로 만들고 모델 디바이스로 전송합니다.",
        "alternatives": [
          "input_ids = input_ids.unsqueeze(dim=0).to(model_device)",
          "input_ids = input_ids.to(model_device).unsqueeze(0)",
          "input_ids = input_ids.unsqueeze(0).to(device=model_device)"
        ]
      },
      {
        "key": "C",
        "points": 1,
        "answer": "embeddings = embedding_layer(input_ids)",
        "why": "[1, T] 정수 인덱스 텐서를 임베딩 레이어에 전달하여 각 토큰을 D차원 벡터로 변환한 [1, T, D] 임베딩 텐서를 얻습니다.",
        "alternatives": [
          "embeddings = embedding_layer.forward(input_ids)"
        ]
      }
    ],
    "id": "1-1"
  },
  {
    "id": "1-2",
    "subject": "LLM",
    "title": "LayerNorm 정규화",
    "source": "Chapter_4_Excercise_GPT.ipynb · 강의 코드 기반 재구성",
    "prompt": "평균과 분산을 이용해 LayerNorm의 정규화 계산식을 완성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: x [B,T,D] → mean,var [B,T,1] → norm_x [B,T,D]",
    "code": "mean = x.mean(dim=-1, keepdim=True)\nvar = x.var(dim=-1, keepdim=True, unbiased=False)\n# TODO: LayerNorm 계산식의 통계량 변수를 채우세요.\n# 힌트: 평균(mean)과 분산(var)을 사용해 정규화합니다.\n{{A}}",
    "slots": [
      {
        "key": "A",
        "points": 7,
        "answer": "norm_x = (x - mean) / torch.sqrt(var + self.eps)",
        "alternatives": [
          "norm_x = (x - mean) / (var + self.eps).sqrt()",
          "norm_x = (x - mean) / torch.sqrt(self.eps + var)"
        ],
        "why": "입력 x [B, T, D]에서 평균을 빼고 분산에 수치적 안정성을 위한 epsilon(self.eps)을 더한 뒤 제곱근을 나누어 피처 차원을 표준화(평균 0, 분산 1)합니다."
      }
    ]
  },
  {
    "id": "1-3",
    "subject": "LLM",
    "title": "GPT forward 흐름",
    "source": "Chapter_4_Excercise_GPT.ipynb · 강의 코드 기반 재구성",
    "prompt": "Embedding 결합, Transformer block 통과, logits 계산의 완성된 세 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: [B,T] → [B,T,D] → [B,T,D] → [B,T,V]",
    "code": "class GPTModel(nn.Module):\n    def __init__(self, cfg):\n        super().__init__()\n        self.tok_emb = nn.Embedding(cfg[\"vocab_size\"], cfg[\"emb_dim\"])\n        self.pos_emb = nn.Embedding(cfg[\"context_length\"], cfg[\"emb_dim\"])\n        self.drop_emb = nn.Dropout(cfg[\"drop_rate\"])\n        self.trf_blocks = nn.Sequential(\n            *[TransformerBlock(cfg) for _ in range(cfg[\"n_layers\"])]\n        )\n        self.final_norm = LayerNorm(cfg[\"emb_dim\"])\n        self.out_head = nn.Linear(cfg[\"emb_dim\"], cfg[\"vocab_size\"], bias=False)\n\n    def forward(self, in_idx):\n        # in_idx: token ID batch [B,T]\n        batch_size, seq_len = in_idx.shape\n\n        # 토큰·위치 임베딩 생성\n        tok_embeds = self.tok_emb(in_idx)\n        pos_embeds = self.pos_emb(torch.arange(seq_len, device=in_idx.device))\n        # TODO: 토큰 의미와 위치 정보 합산\n        {{A}}\n        x = self.drop_emb(x)\n\n        # TODO: Transformer blocks 통과\n        {{B}}\n        x = self.final_norm(x)\n        # TODO: vocab logits 계산\n        {{C}}\n\n        return logits",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "x = tok_embeds + pos_embeds",
        "alternatives": [
          "x = pos_embeds + tok_embeds"
        ],
        "why": "동일한 shape [B, T, D]를 갖는 토큰 임베딩과 위치 임베딩을 원소별 덧셈으로 결합하여 시퀀스 내 위치 정보를 부여합니다."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "x = self.trf_blocks(x)",
        "alternatives": [
          "x = self.trf_blocks.forward(x)"
        ],
        "why": "결합된 임베딩을 순차적인 트랜스포머 블록 컨테이너(self.trf_blocks)에 통과시켜 문맥화된 은닉 상태 [B, T, D]를 추출합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "logits = self.out_head(x)",
        "alternatives": [
          "logits = self.out_head.forward(x)"
        ],
        "why": "트랜스포머 은닉 표현을 최종 선형 출력 헤드(Linear(D, vocab_size))에 통과시켜 각 토큰 위치의 다음 단어 로짓 [B, T, V]를 산출합니다."
      }
    ]
  },
  {
    "id": "2-1",
    "subject": "RAG",
    "title": "Query Engine",
    "source": "1. Llama_index.ipynb · 강의 코드 기반 재구성",
    "prompt": "검색과 답변 생성을 함께 수행하는 query engine을 index에서 만들고 제공된 question으로 실행하세요. 질문 문장은 암기 대상이 아닙니다. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: Index → QueryEngine; str query → Response",
    "code": "question = \"문서의 저자가 처음 작성한 프로그램은 무엇인가요?\"\n{{A}}\n{{B}}",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "query_engine = index.as_query_engine()",
        "alternatives": [
          "query_engine = index.as_query_engine(similarity_top_k=2)",
          "query_engine = index.as_query_engine(similarity_top_k=5)"
        ],
        "why": "벡터 인덱스로부터 검색(Retriever)과 응답 합성(ResponseSynthesizer)을 결합한 일체형 쿼리 엔진 객체를 생성합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "response = query_engine.query(question)",
        "alternatives": [
          "response = query_engine.query(str(question))"
        ],
        "why": "질문 문자열을 쿼리 엔진에 전달하여 관련 청크를 자동 검색하고 LLM 증강 답변 객체를 생성합니다."
      }
    ]
  },
  {
    "id": "2-2",
    "subject": "RAG",
    "title": "검색과 응답 합성",
    "source": "1. Llama_index.ipynb · 강의 코드 기반 재구성",
    "prompt": "StandardQueryEngine.custom_query에서 검색한 nodes를 응답 합성기에 전달하는 두 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: query_str → nodes → response_obj",
    "code": "class StandardQueryEngine(CustomQueryEngine):\n    retriever: BaseRetriever\n    response_synthesizer: BaseSynthesizer\n\n    def custom_query(self, query_str: str):\n        {{A}}\n        {{B}}\n        return response_obj",
    "slots": [
      {
        "key": "A",
        "points": 4,
        "answer": "nodes = self.retriever.retrieve(query_str)",
        "alternatives": [
          "nodes = self.retriever.retrieve(str(query_str))"
        ],
        "why": "질의 문자열을 전달하여 벡터 인덱스로부터 코사인 유사도가 가장 높은 관련 NodeWithScore 리스트를 검색합니다."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "response_obj = self.response_synthesizer.synthesize(query_str, nodes)",
        "alternatives": [
          "response_obj = self.response_synthesizer.synthesize(query=query_str, nodes=nodes)"
        ],
        "why": "검색된 노드들과 원본 질의를 response_synthesizer에 전달하여 LLM 기반의 최종 답변 객체를 합성합니다."
      }
    ]
  },
  {
    "id": "2-3",
    "subject": "RAG",
    "title": "Custom Prompt RAG",
    "source": "2. RAG.ipynb · 강의 코드 기반 재구성",
    "prompt": "retriever로 근거를 검색하고 n.node.get_content()를 두 줄바꿈으로 연결하세요. qa_prompt의 두 변수를 채워 self.llm.complete로 생성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: query → nodes → context string → formatted prompt → response",
    "code": "def custom_query(self, query_str):\n    # self.retriever, self.llm, self.qa_prompt는 준비됨\n    # template 변수: context_str, query_str\n    {{A}}\n    {{B}}\n    {{C}}\n    return response",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "nodes = self.retriever.retrieve(query_str)",
        "alternatives": [
          "nodes = self.retriever.retrieve(str(query_str))"
        ],
        "why": "검색기(retriever)를 사용하여 질의와 가장 연관성 높은 텍스트 노드 목록을 검색합니다."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "context_str = \"\\n\\n\".join([n.node.get_content() for n in nodes])",
        "alternatives": [
          "context_str = \"\\n\\n\".join(n.node.get_content() for n in nodes)",
          "context_str = \"\\n\".join([n.node.get_content() for n in nodes])",
          "context_str = \"\\n\".join(n.node.get_content() for n in nodes)",
          "context_str = \"\\n\\n\".join([n.get_content() for n in nodes])"
        ],
        "why": "검색된 각 노드(n.node)에서 본문 문자열을 추출하여 두 줄바꿈(\"\\n\\n\")으로 연결한 컨텍스트 문자열을 구성합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "response = self.llm.complete(\n    self.qa_prompt.format(context_str=context_str, query_str=query_str)\n)",
        "alternatives": [
          "response = self.llm.complete(self.qa_prompt.format(query_str=query_str, context_str=context_str))"
        ],
        "why": "qa_prompt 템플릿의 context_str과 query_str을 바인딩한 후 LLM 완성형 메서드(.complete())를 호출하여 응답을 생성합니다."
      }
    ]
  },
  {
    "id": "3-1",
    "subject": "Data",
    "title": "RMSE·MAPE",
    "source": "ts_practice.ipynb · 강의 코드 기반 재구성",
    "prompt": "CPU NumPy 정답과 예측으로 RMSE와 MAPE를 계산하는 두 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: y_test/test_predictions [N] → two scalar metrics",
    "code": "test_predictions = test_predictions.cpu().numpy()\ny_test = y_test.cpu().numpy()\n{{A}}\n{{B}}",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "rmse = root_mean_squared_error(y_test, test_predictions)",
        "alternatives": [
          "rmse = root_mean_squared_error(y_true=y_test, y_pred=test_predictions)",
          "rmse = np.sqrt(mean_squared_error(y_test, test_predictions))"
        ],
        "why": "실제 타깃 y_test와 모델 예측값 test_predictions 간의 평균 제곱근 오차(RMSE)를 계산합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "mape = mean_absolute_percentage_error(y_test, test_predictions)",
        "alternatives": [
          "mape = mean_absolute_percentage_error(y_true=y_test, y_pred=test_predictions)"
        ],
        "why": "실제 값 대비 오차율의 절댓값 평균인 평균 절대 백분율 오차(MAPE)를 계산합니다."
      }
    ]
  },
  {
    "id": "3-2",
    "subject": "Data",
    "title": "Conv1D Model",
    "source": "ts_practice.ipynb · 강의 코드 기반 재구성",
    "prompt": "Conv1d의 input channel은 input_size, output channel은 hidden_size입니다. kernel_size=2, stride=1로 구성하고 시점별 hidden을 1개 값으로 바꾸는 self.fc를 구성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: [B,T,input] → [B,input,T] → [B,hidden,T-1] → [B,T-1,hidden] → [B,T-1,1]",
    "code": "class ConvModel(nn.Module):\n    def __init__(self, input_size, hidden_size):\n        super().__init__()\n        {{A}}\n        {{B}}\n    def forward(self, x):\n        # x [B,T,F], Conv1d 입력은 [B,F,T]\n        out = self.conv1d(x.transpose(1,2)).transpose(1,2)\n        return self.fc(out)",
    "slots": [
      {
        "key": "A",
        "points": 4,
        "answer": "self.conv1d = nn.Conv1d(in_channels=input_size, out_channels=hidden_size, kernel_size=2, stride=1)",
        "alternatives": [
          "self.conv1d = nn.Conv1d(input_size, hidden_size, kernel_size=2, stride=1)",
          "self.conv1d = nn.Conv1d(input_size, hidden_size, 2, stride=1)",
          "self.conv1d = nn.Conv1d(input_size, hidden_size, 2)"
        ],
        "why": "시계열 특징 수를 입력 채널로 취급하여 kernel_size=2인 1차원 합성곱 계층을 구성합니다."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "self.fc = nn.Linear(hidden_size, 1)",
        "alternatives": [
          "self.fc = nn.Linear(in_features=hidden_size, out_features=1)",
          "self.fc = torch.nn.Linear(hidden_size, 1)"
        ],
        "why": "합성곱 결과의 hidden_size 차원을 1개의 스칼라 예측값으로 사영하는 완전연결계층을 정의합니다."
      }
    ]
  },
  {
    "id": "3-3",
    "subject": "Data",
    "title": "Training Step",
    "source": "ts_practice.ipynb · 강의 코드 기반 재구성",
    "prompt": "device에 준비된 batch에서 마지막 시점 예측의 MSE gradient로 파라미터를 갱신하는 다섯 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: [B,T,1] → model [B,T,1] → [:,-1,0] [B] → loss scalar → gradients",
    "code": "# batch_x and batch_y are already on device\n# model output: [B,T,1], target: [B]\n{{A}}\n{{B}}\n{{C}}\n{{D}}\n{{E}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "pred = model(batch_x)[:, -1, 0]",
        "alternatives": [
          "pred = model(batch_x)[:, -1]",
          "pred = model(batch_x)[:, -1, :].squeeze(-1)"
        ],
        "why": "모델 출력 [B, T, 1]에서 시계열의 가장 마지막 시점(-1)과 단일 채널(0)을 슬라이싱하여 배치별 1차원 예측값 [B]를 추출합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "loss = loss_fn(pred, batch_y)",
        "alternatives": [
          "loss = loss_fn(input=pred, target=batch_y)"
        ],
        "why": "예측값 [B]와 정답 타깃 batch_y [B]를 손실 함수에 전달하여 스칼라 손실을 계산합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "optimizer.zero_grad()",
        "alternatives": [
          "optimizer.zero_grad(set_to_none=True)"
        ],
        "why": "기존에 누적된 가중치 파라미터의 gradient를 0으로 초기화합니다."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "loss.backward()",
        "alternatives": [],
        "why": "손실 스칼라로부터 역전파를 수행하여 가중치 파라미터의 기울기를 계산합니다."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "optimizer.step()",
        "alternatives": [],
        "why": "옵티마이저를 통해 계산된 기울기를 바탕으로 모델 파라미터를 갱신합니다."
      }
    ]
  },
  {
    "id": "4-1",
    "subject": "Vision",
    "title": "역정규화",
    "source": "01_ResNet18_CIFAR10.ipynb · 강의 코드 기반 재구성",
    "prompt": "CPU float 이미지 x [B,3,H,W]를 역정규화하세요. 제공된 CIFAR10_MEAN과 CIFAR10_STD를 [1,3,1,1]로 만들어 broadcast하고 x*std+mean을 반환하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: [B,3,H,W] × [1,3,1,1] + [1,3,1,1]",
    "code": "def denorm(x):\n    {{A}}\n    {{B}}\n    {{C}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "mean = torch.tensor(CIFAR10_MEAN).view(1,3,1,1)",
        "alternatives": [
          "mean = torch.tensor(CIFAR10_MEAN).reshape(1,3,1,1)",
          "mean = torch.tensor(CIFAR10_MEAN).view(1, 3, 1, 1)",
          "mean = torch.tensor(CIFAR10_MEAN).reshape(1, 3, 1, 1)"
        ],
        "why": "이미지 텐서 [B, 3, H, W]와의 브로드캐스팅 연산을 위해 채널별 평균 튜플을 [1, 3, 1, 1] 텐서로 변환합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "std  = torch.tensor(CIFAR10_STD).view(1,3,1,1)",
        "alternatives": [
          "std  = torch.tensor(CIFAR10_STD).reshape(1,3,1,1)",
          "std = torch.tensor(CIFAR10_STD).view(1,3,1,1)",
          "std = torch.tensor(CIFAR10_STD).view(1, 3, 1, 1)"
        ],
        "why": "채널별 표준편차 튜플을 [1, 3, 1, 1] 텐서로 변환합니다."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "return x * std + mean",
        "alternatives": [
          "return (x * std) + mean",
          "return x*std + mean"
        ],
        "why": "정규화 공식의 역변환인 x * std + mean을 계산하여 원래 픽셀 색상 값으로 복원합니다."
      }
    ]
  },
  {
    "id": "4-2",
    "subject": "Vision",
    "title": "Q·K·V Head 분리",
    "source": "02_ViT_CIFAR10.ipynb · 강의 코드 기반 재구성",
    "prompt": "token [B,N,D]를 한 번에 Q·K·V로 투영·분할하고 각각 [B,H,N,d]로 재배열하는 두 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: [B,N,D] → [B,N,3Hd] → 3×[B,H,N,d]",
    "code": "b, n, _, h = *x.shape, self.heads\n{{A}}\n{{B}}",
    "slots": [
      {
        "key": "A",
        "points": 4,
        "answer": "qkv = self.to_qkv(x).chunk(3, dim = -1)",
        "alternatives": [
          "qkv = self.to_qkv(x).chunk(3, dim=-1)",
          "qkv = self.to_qkv(x).chunk(3, -1)",
          "qkv = self.to_qkv(x).chunk(3, dim=2)"
        ],
        "why": "입력 x를 3배 크기로 선형 사영한 뒤 마지막 특징 축(dim=-1)을 따라 Query, Key, Value 3개 텐서로 균등 분할(chunk)합니다."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "q, k, v = map(lambda t: rearrange(t, 'b n (h d) -> b h n d', h = h), qkv)",
        "alternatives": [
          "q, k, v = map(lambda t: rearrange(t, 'b n (h d) -> b h n d', h=h), qkv)",
          "q, k, v = [rearrange(t, 'b n (h d) -> b h n d', h=h) for t in qkv]"
        ],
        "why": "rearrange를 사용하여 각 텐서 [B, N, H*D]를 멀티헤드 차원 [B, H, N, D]로 재배열합니다."
      }
    ]
  },
  {
    "id": "4-3",
    "subject": "Vision",
    "title": "Scaled Self-Attention",
    "source": "02_ViT_CIFAR10.ipynb · 강의 코드 기반 재구성",
    "prompt": "head별 Q·K로 scaled token score를 만들고 마지막 축 softmax 후 V를 가중합하는 세 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: Q,K [B,H,N,d] → dots/attn [B,H,N,N] → out [B,H,N,d]",
    "code": "{{A}}\n{{B}}\nself.last_attn = attn.detach()\n{{C}}",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "dots = einsum('b h i d, b h j d -> b h i j', q, k) * self.scale",
        "alternatives": [
          "dots = (q @ k.transpose(-2, -1)) * self.scale"
        ],
        "why": "Query와 Key의 헤드별 내적을 계산하여 어텐션 스코어 [B, H, i, j]를 구하고 1/sqrt(D) 스케일 팩터를 곱합니다."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "attn = self.attend(dots)",
        "alternatives": [
          "attn = torch.softmax(dots, dim=-1)"
        ],
        "why": "스케일된 점수에 softmax 및 드롭아웃을 적용하여 정규화된 어텐션 확률 가중치 행렬을 얻습니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "out = einsum('b h i j, b h j d -> b h i d', attn, v)",
        "alternatives": [
          "out = attn @ v"
        ],
        "why": "어텐션 확률 행렬과 Value 텐서의 행렬곱을 통해 최종 어텐션 가중합 출력 [B, H, i, D]를 산출합니다."
      }
    ]
  },
  {
    "subject": "On-device AI",
    "title": "Conv 재양자화 broadcast 준비",
    "source": "Quantization for CNN · 기존 빈칸 주변 코드 응용",
    "prompt": "output [B,OC,H,W]와 weight_scale [OC,1,1,1]이 주어집니다. output에 channel별 scale을 곱하기 위한 shape로 바꾸고 output을 float로 변환하세요. 그 뒤 제공된 재양자화 식이 실행됩니다.",
    "code": "{{A}}\n{{B}}\noutput = output * (input_scale * weight_scale / output_scale)\noutput = output + output_zero_point",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "weight_scale = weight_scale.flatten().view(1, -1, 1, 1)",
        "why": "출력 텐서 [B, OC, H, W]와의 브로드캐스팅 연산을 위해 각 출력 채널별 가중치 스케일을 [1, OC, 1, 1] 텐서로 재배열합니다.",
        "alternatives": [
          "weight_scale = weight_scale.view(1, -1, 1, 1)",
          "weight_scale = weight_scale.reshape(1, -1, 1, 1)",
          "weight_scale = weight_scale.flatten().reshape(1, -1, 1, 1)"
        ]
      },
      {
        "key": "B",
        "points": 2,
        "answer": "output = output.float()",
        "why": "정수 누적기(int32 accumulator) 출력을 부동소수점 실수 스케일 연산을 위해 float32 텐서로 변환합니다.",
        "alternatives": [
          "output = output.to(torch.float)",
          "output = output.type(torch.float)"
        ]
      }
    ],
    "id": "5-1"
  },
  {
    "id": "5-2",
    "subject": "On-device AI",
    "title": "Bias Quantization",
    "source": "2. Quantization for CNN.ipynb · 강의 코드 기반 재구성",
    "prompt": "정수 MAC 누산값과 단위를 맞추도록 bias scale을 만들고 int32로 양자화하는 두 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: bias [OC] / (s_x·s_w [OC]) → int32 [OC]",
    "code": "# input q_x, weight q_w are multiplied and accumulated\n{{A}}\n{{B}}",
    "slots": [
      {
        "key": "A",
        "points": 4,
        "answer": "bias_scale = input_scale * weight_scale",
        "alternatives": [
          "bias_scale = weight_scale * input_scale"
        ],
        "why": "bias는 input과 weight의 곱에 더해지므로 바이어스의 양자화 스케일은 반드시 input_scale * weight_scale이어야 합니다."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "quantized_bias = linear_quantize(bias, 32, bias_scale, zero_point=0, dtype=torch.int32)",
        "alternatives": [
          "quantized_bias = linear_quantize(bias, 32, bias_scale, 0, torch.int32)",
          "quantized_bias = linear_quantize(bias, 32, bias_scale, zero_point=0, dtype=torch.int)"
        ],
        "why": "32비트 정수(int32) 정밀도로 zero_point=0을 적용하여 bias를 양자화합니다."
      }
    ]
  },
  {
    "id": "5-3",
    "subject": "On-device AI",
    "title": "Linear Requantization",
    "source": "2. Quantization for CNN.ipynb · 강의 코드 기반 재구성",
    "prompt": "int32 Linear 누산 결과를 output의 정수 좌표계로 바꾸는 scale 조정과 zero point 이동 두 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: int32 [B,OC] → float × [1,OC] ratio → shifted → int8",
    "code": "weight_scale = weight_scale.flatten().view(1, -1)\noutput = output.float()\n############### YOUR CODE STARTS HERE ###############\n{{A}}\n{{B}}\n############### YOUR CODE ENDS HERE #################\noutput = output.round().clamp(*get_quantized_range(feature_bitwidth)).to(torch.int8)",
    "slots": [
      {
        "key": "A",
        "points": 4,
        "answer": "output = output*(input_scale * weight_scale / output_scale)",
        "alternatives": [
          "output = output * (input_scale * weight_scale / output_scale)",
          "output = output * ((input_scale * weight_scale) / output_scale)"
        ],
        "why": "누적기 출력에 유효 배율 M = (input_scale * weight_scale) / output_scale을 곱하여 목표 출력 스케일로 재양자화합니다."
      },
      {
        "key": "B",
        "points": 4,
        "answer": "output = output + output_zero_point",
        "alternatives": [
          "output = output_zero_point + output"
        ],
        "why": "출력 텐서의 정수 표현 오프셋인 output_zero_point를 더하여 영점을 정렬합니다."
      }
    ]
  }
];
