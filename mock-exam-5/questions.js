window.EXAM_NUMBER=5;
window.EXAM=[
  {
    "subject": "LLM",
    "title": "평가 시 padding loss 제외",
    "source": "Instruction Finetuning · 기존 빈칸 주변 코드 응용",
    "prompt": "logits [B,T,V], targets [B,T]입니다. targets의 padding은 -100으로 표시돼 있습니다. nn.functional.cross_entropy로 토큰별 분류 loss를 계산하되 ignore_index=-100을 명시하세요.",
    "code": "# 모델 forward는 이미 완료됨\nflat_logits = {{A}}\nflat_targets = {{B}}\nloss = {{C}}",
    "slots": [
      {
        "key": "A",
        "points": 1,
        "answer": "logits.flatten(0, 1)",
        "why": "3차원 로짓 [B, T, V]의 배치와 시퀀스 축을 병합하여 CrossEntropyLoss 입력 형식인 [B*T, V] 형태로 평탄화합니다.",
        "alternatives": [
          "logits.reshape(-1, logits.shape[-1])",
          "logits.view(-1, logits.shape[-1])",
          "logits.view(-1, logits.size(-1))"
        ]
      },
      {
        "key": "B",
        "points": 1,
        "answer": "targets.flatten()",
        "why": "2차원 정답 라벨 [B, T]를 1차원 [B*T] 텐서로 변환하여 로짓 샘플과 1:1 대응시킵니다.",
        "alternatives": [
          "targets.reshape(-1)",
          "targets.view(-1)"
        ]
      },
      {
        "key": "C",
        "points": 3,
        "answer": "nn.functional.cross_entropy(flat_logits, flat_targets, ignore_index=-100)",
        "why": "프롬프트 및 패딩 토큰 위치(-100)를 손실 및 역전파 계산에서 무시(ignore_index=-100)하여 유효한 응답 토큰에 대해서만 교차 엔트로피 손실을 계산합니다.",
        "alternatives": [
          "F.cross_entropy(flat_logits, flat_targets, ignore_index=-100)",
          "torch.nn.functional.cross_entropy(flat_logits, flat_targets, ignore_index=-100)"
        ]
      }
    ],
    "id": "1-1"
  },
  {
    "id": "1-2",
    "subject": "LLM",
    "title": "LoRA A·B shape",
    "source": "Chapter_6_Excercise_Finetuning_Classification_LoRA.ipynb · 강의 코드 기반 재구성",
    "prompt": "x@A@B가 기존 Linear와 같은 출력 차원을 갖도록 A와 B 생성문의 빈칸을 완성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: x […,in] @ A [in,r] @ B [r,out] → […,out]",
    "code": "class LoRALayer(nn.Module):\n    def __init__(self, in_dim, out_dim, rank, alpha):\n        super().__init__()\n        # TODO: A는 (in_dim, rank)입니다.\n        {{A}}\n        nn.init.kaiming_uniform_(self.A, a=math.sqrt(5))\n        # TODO: B는 (rank, out_dim)입니다.\n        {{B}}",
    "slots": [
      {
        "key": "A",
        "points": 4,
        "answer": "self.A = nn.Parameter(torch.empty(in_dim, rank))",
        "alternatives": [
          "self.A = torch.nn.Parameter(torch.empty(in_dim, rank))",
          "self.A = nn.Parameter(torch.zeros(in_dim, rank))"
        ],
        "why": "LoRA 다운 프로젝션 파라미터 행렬 A는 입력 차원(in_dim)에서 저순위 차원(rank)으로 축소하는 [in_dim, rank] 크기로 선언합니다."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "self.B = nn.Parameter(torch.zeros(rank, out_dim))",
        "alternatives": [
          "self.B = torch.nn.Parameter(torch.zeros(rank, out_dim))"
        ],
        "why": "LoRA 업 프로젝션 행렬 B는 [rank, out_dim] 크기로 선언하되, 초기 학습 시 기존 사전학습 가중치를 그대로 보존(ΔW = B @ A = 0)하기 위해 반드시 0(zeros)으로 초기화합니다."
      }
    ]
  },
  {
    "id": "1-3",
    "subject": "LLM",
    "title": "DPO Loss",
    "source": "Chapter_7_Exercise_Follow_Instructions_dpo.ipynb · 강의 코드 기반 재구성",
    "prompt": "policy와 reference의 chosen-rejected log-ratio 차이에 beta를 적용한 DPO loss 네 줄을 완성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: 네 log-prob [B]→두 ratio [B]→margin [B]→loss [B]→mean scalar",
    "code": "# TODO: policy와 reference 모두 chosen - rejected 순서\n{{A}}\n{{B}}\n# TODO: policy 개선량\n{{C}}\n# TODO: beta-scaled preference loss\n{{D}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "model_logratios = model_chosen_logprobs - model_rejected_logprobs",
        "alternatives": [],
        "why": "학습 대상 모델(policy)에서 선호 응답(chosen)과 비선호 응답(rejected)의 로그 확률 차이를 계산합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "reference_logratios = reference_chosen_logprobs - reference_rejected_logprobs",
        "alternatives": [],
        "why": "기준 모델(reference)에서 선호 응답과 비선호 응답의 로그 확률 차이를 계산합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "logits = model_logratios - reference_logratios",
        "alternatives": [],
        "why": "학습 모델의 로그 비율에서 기준 모델의 로그 비율을 차감하여 암묵적 보상 차이 로짓을 산출합니다."
      },
      {
        "key": "D",
        "points": 2,
        "answer": "losses = -F.logsigmoid(beta * logits)",
        "alternatives": [
          "losses = -torch.logsigmoid(beta * logits)",
          "losses = -torch.nn.functional.logsigmoid(beta * logits)"
        ],
        "why": "KL 계수 beta를 곱한 상대적 보상 로짓에 -log(sigmoid)를 적용하여 DPO 손실을 완성합니다."
      }
    ]
  },
  {
    "id": "2-1",
    "subject": "RAG",
    "title": "평가 Query·Answer",
    "source": "1. Data_preprocessing.ipynb · 강의 코드 기반 재구성",
    "prompt": "대표 레코드에서 모델 입력 질문과 정답 비교값을 꺼내는 두 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: record dict → query str + answer str",
    "code": "# 각 example_item은 {\"query\": 질문, \"answer\": 정답, ...} 형식\nfor domain, example_item in unique_domains.items():\n    {{A}}\n    {{B}}\n    # question은 모델 입력, answer는 평가 기준으로 사용",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "question = example_item['query']",
        "alternatives": [
          "question = example_item[\"query\"]"
        ],
        "why": "평가 데이터 딕셔너리로부터 모델 입력으로 전달할 질의 문자열 필드(\"query\")를 추출합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "answer = example_item['answer']",
        "alternatives": [
          "answer = example_item[\"answer\"]"
        ],
        "why": "생성된 응답의 정답 일치 검증 기준으로 사용할 타깃 필드(\"answer\")를 추출합니다."
      }
    ]
  },
  {
    "id": "2-2",
    "subject": "RAG",
    "title": "CRAG Score",
    "source": "4_RAG_framework_evaluation_with_MCP.ipynb · 강의 코드 기반 재구성",
    "prompt": "전체 샘플 수에서 exact correct, semantic correct, miss 수를 빼 hallucination 개수를 구하세요. 제공된 가중치로 정규화 전 CRAG_score 합계를 계산하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: category counts → hallucination count → scalar score",
    "code": "# 네 범주는 상호 배타적이며 전체 평가 데이터를 모두 포함합니다.\n# exact correct: +1, semantic correct: +0.5, miss: 0, hallucination: -1\n# finance_test_dataset_ids는 전체 평가 ID 목록입니다.\n{{A}}\n{{B}}",
    "slots": [
      {
        "key": "A",
        "points": 4,
        "answer": "n_hallucinate = len(finance_test_dataset_ids) - n_correct_exact - n_correct - n_miss",
        "alternatives": [],
        "why": "전체 평가 샘플 수에서 정확 일치, 의미 일치, 미답변(miss) 건수를 차감하여 모델의 환각(hallucination) 건수를 산출합니다."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "CRAG_score = n_correct_exact + 0.5 * n_correct - n_hallucinate",
        "alternatives": [
          "CRAG_score = 1.0 * n_correct_exact + 0.5 * n_correct - n_hallucinate",
          "CRAG_score = n_correct_exact + 0.5 * n_correct - 1.0 * n_hallucinate",
          "CRAG_score = n_correct_exact + 0.5 * n_correct - 1 * n_hallucinate"
        ],
        "why": "완전 일치(+1.0), 의미적 일치(+0.5), 환각(-1.0) 가중치를 적용하여 CRAG 총점을 합산합니다."
      }
    ]
  },
  {
    "id": "2-3",
    "subject": "RAG",
    "title": "KG·Web Hybrid RAG",
    "source": "3. Task_2.ipynb · 강의 코드 기반 재구성",
    "prompt": "금융 질문이면 단일 KG 문자열을 목록으로 감싸고, 그 외에는 웹 검색 목록을 그대로 선택하세요. self.reader.generate_response(query, combined_results)로 답변을 생성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: KG/Web evidence → route-selected list → Reader answer",
    "code": "def answer_query(self, query, is_finance, kg_results, retrieved_results):\n    # kg_results: 단일 문자열, retrieved_results: 웹 근거 문자열 목록\n    {{A}}\n        {{B}}\n    {{C}}\n        {{D}}\n    {{E}}\n    return answer",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "if is_finance:",
        "alternatives": [],
        "why": "금융 도메인 질문인지 여부를 불리언 플래그로 분기합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "combined_results = [kg_results]",
        "alternatives": [],
        "why": "금융 질문인 경우 지식 그래프(Knowledge Graph)의 단일 사실 문자열을 리스트로 감싸 컨텍스트를 구성합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "else:",
        "alternatives": [],
        "why": "일반 질문인 경우의 분기입니다."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "combined_results = retrieved_results",
        "alternatives": [],
        "why": "일반 질문인 경우 웹 검색 엔진으로부터 가져온 텍스트 청크 리스트를 그대로 선택합니다."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "answer = self.reader.generate_response(query, combined_results)",
        "alternatives": [],
        "why": "질의와 취합된 근거 리스트를 Reader 모델에 전달하여 최종 답변 문자열을 생성합니다."
      }
    ]
  },
  {
    "id": "3-1",
    "subject": "Data",
    "title": "Negative Sampling",
    "source": "RecSys_GCF_practice.ipynb · 강의 코드 기반 재구성",
    "prompt": "positive item의 user offset을 제거하고 같은 batch 크기의 negative item을 뽑아 두 embedding을 조회하는 네 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: edge node IDs [B] → item IDs [B] → pos/neg embeddings [B,D]",
    "code": "# train_edge_index[1,indices]: user offset이 포함된 positive node ID\n# item_features는 item만의 embedding입니다.\n# 이 문제는 균일 무작위 후보 추출만 구현합니다(positive 제외 검사는 별도).\n{{A}}\n{{B}}\n{{C}}\n{{D}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "pos_item_indices = train_edge_index[1, indices] - num_users",
        "alternatives": [],
        "why": "edge_index의 아이템 노드 번호에 포함된 유저 오프셋(num_users)을 차감하여 순수 아이템 0 기반 인덱스로 환원합니다."
      },
      {
        "key": "B",
        "points": 1,
        "answer": "neg_item_indices = torch.randint(0, num_movies, (batch_size,), device=device)",
        "alternatives": [
          "neg_item_indices = torch.randint(low=0, high=num_movies, size=(batch_size,), device=device)",
          "neg_item_indices = torch.randint(0, num_movies, [batch_size], device=device)"
        ],
        "why": "전체 영화 아이템 수 범위 [0, num_movies)에서 배치 크기만큼의 부정 아이템 인덱스를 균일 무작위 샘플링합니다."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "pos_emb = item_features[pos_item_indices]",
        "alternatives": [],
        "why": "긍정 아이템 인덱스를 사용하여 아이템 특징 행렬에서 실제 상호작용 아이템 임베딩을 추출합니다."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "neg_emb = item_features[neg_item_indices]",
        "alternatives": [],
        "why": "부정 아이템 인덱스를 사용하여 아이템 특징 행렬에서 대조 학습용 부정 아이템 임베딩을 추출합니다."
      }
    ]
  },
  {
    "id": "3-2",
    "subject": "Data",
    "title": "Multi-layer 표현",
    "source": "RecSys_GCF_practice.ipynb · 강의 코드 기반 재구성",
    "prompt": "초기 embedding과 모든 layer 출력을 feature 축으로 연결한 뒤 user/item node 구간을 분리하는 세 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: H0...HL [V,Dl] → [V,sum Dl] → user [U,D*], item [I,D*]",
    "code": "{{A}}\n{{B}}\n{{C}}",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "final_features = torch.concat(layer_outputs,dim=-1)",
        "alternatives": [
          "final_features = torch.concat(layer_outputs, dim=-1)",
          "final_features = torch.cat(layer_outputs, dim=-1)",
          "final_features = torch.cat(layer_outputs, -1)",
          "final_features = torch.concat(layer_outputs, -1)"
        ],
        "why": "각 레이어의 노드 임베딩 출력 리스트를 마지막 특징 차원(dim=-1)을 따라 연결하여 다중 홉(multi-hop) 표현을 만듭니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "user_features = final_features[:self.num_users]",
        "alternatives": [
          "user_features = final_features[0:self.num_users]"
        ],
        "why": "통합 노드 행렬의 앞쪽 영역([:self.num_users])을 슬라이싱하여 유저 노드들의 최종 특징 임베딩을 분리합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "item_features = final_features[self.num_users:]",
        "alternatives": [],
        "why": "통합 노드 행렬의 뒤쪽 영역([self.num_users:])을 슬라이싱하여 아이템 노드들의 최종 특징 임베딩을 분리합니다."
      }
    ]
  },
  {
    "id": "3-3",
    "subject": "Data",
    "title": "BPR 학습 Step",
    "source": "RecSys_GCF_practice.ipynb · 강의 코드 기반 재구성",
    "prompt": "세 embedding으로 BPR loss를 구하고 gradient를 초기화·역전파·갱신하는 네 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: embeddings → scalar loss → gradients → updated embeddings/layers",
    "code": "{{A}}\n{{B}}\n{{C}}\n{{D}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "loss = model.bpr_loss(u_emb, pos_emb, neg_emb)",
        "alternatives": [],
        "why": "유저, 긍정 아이템, 부정 아이템 임베딩을 bpr_loss 함수에 전달하여 베이지안 개인화 랭킹 손실 스칼라를 계산합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "optimizer.zero_grad()",
        "alternatives": [
          "optimizer.zero_grad(set_to_none=True)"
        ],
        "why": "이전 배치에서 계산된 가중치 파라미터의 gradient를 0으로 초기화합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "loss.backward()",
        "alternatives": [],
        "why": "손실값으로부터 모델 파라미터에 대한 기울기를 역전파합니다."
      },
      {
        "key": "D",
        "points": 2,
        "answer": "optimizer.step()",
        "alternatives": [],
        "why": "옵티마이저를 통해 모델 파라미터 가중치를 갱신합니다."
      }
    ]
  },
  {
    "id": "4-1",
    "subject": "Vision",
    "title": "Pooling·Classifier",
    "source": "02_ViT_CIFAR10.ipynb · 강의 코드 기반 재구성",
    "prompt": "Encoder token에서 설정에 따라 CLS 또는 token 평균을 선택하고 class head로 logits를 반환하는 두 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: [B,N+1,D] → [B,D] → [B,num_classes]",
    "code": "x = self.transformer(x)\n{{A}}\n{{B}}",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "x = x[:, 0] if self.pool == \"cls\" else x.mean(dim=1)",
        "alternatives": [
          "x = x[:, 0] if self.pool == 'cls' else x.mean(dim=1)",
          "x = x[:, 0] if self.pool == \"cls\" else x.mean(1)",
          "x = x[:, 0] if self.pool == 'cls' else x.mean(1)",
          "x = x[:, 0] if self.pool == \"cls\" else torch.mean(x, dim=1)"
        ],
        "why": "ViT에서 pool 모드가 \"cls\"인 경우 첫 번째 CLS 토큰([:, 0])을 취하고, 그렇지 않으면 패치 토큰 축(dim=1)의 평균(GAP)을 계산하여 [B, D] 표현을 만듭니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "return self.mlp_head(x)",
        "alternatives": [],
        "why": "풀링된 특징 벡터를 MLP 헤드에 통과시켜 클래스 수에 대응하는 로짓 [B, C]를 출력합니다."
      }
    ]
  },
  {
    "id": "4-2",
    "subject": "Vision",
    "title": "Confusion Matrix",
    "source": "01_ResNet18_CIFAR10.ipynb · 강의 코드 기반 재구성",
    "prompt": "정답 t와 예측 p를 confusion matrix의 GT 행·Pred 열에 누적하고 class별 정확도를 계산해 반환하는 세 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: labels,preds [N] → cm [C,C] → diagonal/row sums [C]",
    "code": "for t, p in zip(labels, preds):\n    {{A}}\n{{B}}\n{{C}}",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "cm[int(t), int(p)] += 1",
        "alternatives": [
          "cm[int(t)][int(p)] += 1",
          "cm[t.long(), p.long()] += 1",
          "cm[t.item(), p.item()] += 1"
        ],
        "why": "실제 클래스 t와 예측 클래스 p의 교차 위치 빈도를 1 증가시켜 혼동 행렬(Confusion Matrix) 원소를 누적합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "per_class_acc = cm.diagonal().float() / torch.clamp(cm.sum(dim=1).float(), min=1.0)",
        "alternatives": [
          "per_class_acc = cm.diagonal().float() / torch.clamp(cm.sum(1).float(), min=1.0)",
          "per_class_acc = cm.diag().float() / torch.clamp(cm.sum(dim=1).float(), min=1.0)",
          "per_class_acc = cm.diagonal() / torch.clamp(cm.sum(dim=1), min=1.0).float()"
        ],
        "why": "대각선 원소(정답 수)를 각 행의 합(실제 클래스 총 샘플 수)으로 나누되, 0으로 나누기를 방지하기 위해 분모를 최소 1.0으로 clamp하여 클래스별 정확도를 구합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "return cm, per_class_acc",
        "alternatives": [],
        "why": "계산된 혼동 행렬과 클래스별 정확도 텐서를 튜플로 반환합니다."
      }
    ]
  },
  {
    "id": "4-3",
    "subject": "Vision",
    "title": "AMP 학습 Step",
    "source": "01_ResNet18_CIFAR10.ipynb · 강의 코드 기반 재구성",
    "prompt": "autocast 문맥에서 logits와 분류 loss를 계산하고 GradScaler로 역전파·optimizer 갱신·scale 갱신을 수행하는 다섯 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: images [B,3,32,32] → logits [B,10] + labels [B] → loss → scaled gradients",
    "code": "optimizer.zero_grad()\nwith torch.amp.autocast(device_type=device.type, enabled=torch.cuda.is_available()):\n    {{A}}\n    {{B}}\n{{C}}\n{{D}}\n{{E}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "logits = model(images)",
        "alternatives": [
          "logits = model.forward(images)"
        ],
        "why": "자동 혼합 정밀도(autocast) 컨텍스트 내에서 모델 순전파를 실행하여 FP16/BF16 가속 로짓을 산출합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "loss = criterion(logits, labels)",
        "alternatives": [],
        "why": "autocast 내부에서 정답 레이블과 비교하여 손실을 계산합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "scaler.scale(loss).backward()",
        "alternatives": [],
        "why": "FP16 언더플로우를 방지하기 위해 GradScaler로 손실을 스케일업(확대)한 뒤 역전파를 수행합니다."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "scaler.step(optimizer)",
        "alternatives": [],
        "why": "scaler가 gradient를 unscale하고 inf/nan 여부를 확인한 뒤 안전할 때만 optimizer.step()을 실행합니다."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "scaler.update()",
        "alternatives": [],
        "why": "다음 iteration을 위해 스케일링 팩터의 크기를 동적으로 갱신합니다."
      }
    ]
  },
  {
    "subject": "On-device AI",
    "title": "Calibration 통계 마무리",
    "source": "Pruning for LLM · 기존 빈칸 주변 코드 응용",
    "prompt": "input_dict에는 채널별 평균 제곱 activation norm이 누적되어 있고 hooks는 등록한 forward hook handle 목록입니다. sqrt_로 norm으로 바꾸고 모든 hook을 remove한 뒤 통계를 반환하세요.",
    "code": "for key in input_dict.keys():\n    {{A}}\nfor hook in hooks:\n    {{B}}\nreturn input_dict",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "input_dict[key].sqrt_()",
        "why": "누적된 제곱 평균 활성화 텐서에 in-place 제곱근(sqrt_)을 적용하여 실제 L2 노름 크기로 변환합니다.",
        "alternatives": [
          "input_dict[key] = input_dict[key].sqrt()",
          "input_dict[key] = torch.sqrt(input_dict[key])"
        ]
      },
      {
        "key": "B",
        "points": 2,
        "answer": "hook.remove()",
        "why": "캘리브레이션 완료 후 등록되었던 순전파 훅(forward hook handle)을 해제하여 메모리 누수와 불필요한 연산 오버헤드를 방지합니다.",
        "alternatives": []
      }
    ],
    "id": "5-1"
  },
  {
    "id": "5-2",
    "subject": "On-device AI",
    "title": "Wanda Row Mask",
    "source": "4. Pruning for LLM.ipynb · 강의 코드 기반 재구성",
    "prompt": "W [row,col]과 input_feat[n] [col]이 주어집니다. 절댓값 weight×input norm으로 중요도를 만들고 row마다 round(col*sparsity)개를 제거하세요. 유효한 k와 동률 없음이 보장됩니다. threshold를 [row,1]로 바꿔 비교하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: W [row,col] × input_feat [col] → importance [row,col] → threshold [row] → mask [row,col]",
    "code": "W = m.weight.data\n{{A}}\n{{B}}\n{{C}}\n{{D}}\n{{E}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "row, col = W.shape",
        "alternatives": [
          "row, col = W.size()"
        ],
        "why": "가중치 행렬 W의 출력 행(row)과 입력 열(col) 크기를 추출합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "num_zeros_per_row = round(col * sparsity)",
        "alternatives": [
          "num_zeros_per_row = int(round(col * sparsity))",
          "num_zeros_per_row = int(col * sparsity)"
        ],
        "why": "각 행마다 동일하게 제거할 입력 열의 개수를 산출합니다."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "importance = torch.abs(W) * input_feat[n]",
        "alternatives": [
          "importance = W.abs() * input_feat[n]",
          "importance = torch.abs(W) * input_feat[n].view(1, -1)"
        ],
        "why": "가중치 절댓값과 입력 활성화 노름의 곱으로 Wanda 중요도 행렬 [row, col]을 계산합니다."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "threshold = torch.kthvalue(importance, num_zeros_per_row, dim=1)[0]",
        "alternatives": [
          "threshold = torch.kthvalue(importance, num_zeros_per_row, dim=1).values",
          "threshold = torch.kthvalue(importance, num_zeros_per_row, dim=-1)[0]",
          "threshold = torch.kthvalue(importance, num_zeros_per_row, dim=-1).values"
        ],
        "why": "행 차원(dim=1)을 따라 각 행에서 num_zeros_per_row번째로 작은 중요도를 찾아 행별 문턱값 [row]을 구합니다."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "mask = importance > threshold.reshape(row, 1)",
        "alternatives": [
          "mask = importance > threshold.view(row, 1)",
          "mask = importance > threshold.unsqueeze(1)",
          "mask = importance > threshold.unsqueeze(-1)"
        ],
        "why": "1차원 문턱값을 [row, 1]로 확장하여 원본 중요도와 브로드캐스팅 비교함으로써 행 단위 가지치기 마스크를 생성합니다."
      }
    ]
  },
  {
    "id": "5-3",
    "subject": "On-device AI",
    "title": "Outlier Channel Scale-up",
    "source": "5. Quantization for LLM.ipynb · 강의 코드 기반 재구성",
    "prompt": "importance 길이는 100 이상입니다. torch.topk로 상위 1% input channel index를 찾고 해당 weight column을 scale_factor배 확대하세요. pseudo_quantize_tensor로 양자화한 뒤 같은 column을 scale_factor로 나누세요. scale_factor>0입니다. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: importance [hidden] → indices → selected weight columns → restored weights",
    "code": "importance = sum(input_feat[n]).float()\n{{A}}\n{{B}}\n{{C}}\n{{D}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "outlier_mask = torch.topk(importance, int(len(importance) * 0.01))[1]",
        "alternatives": [
          "outlier_mask = torch.topk(importance, int(len(importance) * 0.01)).indices",
          "outlier_mask = torch.topk(importance, int(importance.numel() * 0.01))[1]",
          "outlier_mask = torch.topk(importance, int(importance.numel() * 0.01)).indices"
        ],
        "why": "입력 채널 중 활성화 중요도 상위 1%에 해당하는 이상치(Outlier) 채널 인덱스를 추출합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "m.weight.data[:, outlier_mask] *= scale_factor",
        "alternatives": [
          "m.weight.data[:, outlier_mask] = m.weight.data[:, outlier_mask] * scale_factor"
        ],
        "why": "이상치 채널에 해당하는 가중치 열들을 scale_factor배 확대하여 양자화 격자 해상도를 높입니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "m.weight.data = pseudo_quantize_tensor(m.weight.data, n_bit=w_bit, q_group_size=q_group_size)",
        "alternatives": [
          "m.weight.data = pseudo_quantize_tensor(m.weight.data, w_bit, q_group_size=q_group_size)",
          "m.weight.data = pseudo_quantize_tensor(m.weight.data, n_bit=w_bit, q_group_size=q_group_size)"
        ],
        "why": "확대된 가중치에 대해 지정된 비트수(w_bit)와 그룹 크기로 모의 양자화를 수행합니다."
      },
      {
        "key": "D",
        "points": 2,
        "answer": "m.weight.data[:, outlier_mask] /= scale_factor",
        "alternatives": [
          "m.weight.data[:, outlier_mask] = m.weight.data[:, outlier_mask] / scale_factor"
        ],
        "why": "양자화 완료 후 확대한 비율만큼 다시 scale_factor로 나누어 수학적 크기를 복원합니다."
      }
    ]
  }
];
