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
        "why": "B,T를 합치고 V는 유지합니다.",
        "alternatives": []
      },
      {
        "key": "B",
        "points": 1,
        "answer": "targets.flatten()",
        "why": "각 토큰 정답을 1차원으로 만듭니다.",
        "alternatives": []
      },
      {
        "key": "C",
        "points": 3,
        "answer": "nn.functional.cross_entropy(flat_logits, flat_targets, ignore_index=-100)",
        "why": "padding 정답은 loss와 gradient에서 제외합니다.",
        "alternatives": []
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
        "alternatives": [],
        "why": "x의 마지막 in_dim과 A의 첫 축이 소거되고 rank를 거쳐 B의 out_dim이 남습니다. 이 구조가 큰 dense 변화량을 저랭크 곱으로 표현합니다.\n재도전: 행렬곱에서 인접한 안쪽 차원을 표시하고 다시 채우세요."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "self.B = nn.Parameter(torch.zeros(rank, out_dim))",
        "alternatives": [],
        "why": "x의 마지막 in_dim과 A의 첫 축이 소거되고 rank를 거쳐 B의 out_dim이 남습니다. 이 구조가 큰 dense 변화량을 저랭크 곱으로 표현합니다.\n재도전: 행렬곱에서 인접한 안쪽 차원을 표시하고 다시 채우세요."
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
        "why": "각 모델의 chosen-rejected log-ratio가 선호 강도입니다. policy 비율에서 reference 비율을 뺀 margin이 클수록 좋은데, -logsigmoid는 이를 최소화하도록 policy를 학습시킵니다.\n재도전: 먼저 두 ratio를 같은 방향으로 쓴 뒤 policy에서 reference를 빼세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "reference_logratios = reference_chosen_logprobs - reference_rejected_logprobs",
        "alternatives": [],
        "why": "각 모델의 chosen-rejected log-ratio가 선호 강도입니다. policy 비율에서 reference 비율을 뺀 margin이 클수록 좋은데, -logsigmoid는 이를 최소화하도록 policy를 학습시킵니다.\n재도전: 먼저 두 ratio를 같은 방향으로 쓴 뒤 policy에서 reference를 빼세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "logits = model_logratios - reference_logratios",
        "alternatives": [],
        "why": "각 모델의 chosen-rejected log-ratio가 선호 강도입니다. policy 비율에서 reference 비율을 뺀 margin이 클수록 좋은데, -logsigmoid는 이를 최소화하도록 policy를 학습시킵니다.\n재도전: 먼저 두 ratio를 같은 방향으로 쓴 뒤 policy에서 reference를 빼세요."
      },
      {
        "key": "D",
        "points": 2,
        "answer": "losses = -F.logsigmoid(beta * logits)",
        "alternatives": [],
        "why": "각 모델의 chosen-rejected log-ratio가 선호 강도입니다. policy 비율에서 reference 비율을 뺀 margin이 클수록 좋은데, -logsigmoid는 이를 최소화하도록 policy를 학습시킵니다.\n재도전: 먼저 두 ratio를 같은 방향으로 쓴 뒤 policy에서 reference를 빼세요."
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
        "alternatives": [],
        "why": "query는 모델에 줄 질문이고 answer는 평가 기준입니다. 두 field를 분리해야 모델 응답과 ground truth를 비교할 수 있습니다.\n재도전: 입력과 평가 기준 중 어느 것이 query이고 answer인지 구분하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "answer = example_item['answer']",
        "alternatives": [],
        "why": "query는 모델에 줄 질문이고 answer는 평가 기준입니다. 두 field를 분리해야 모델 응답과 ground truth를 비교할 수 있습니다.\n재도전: 입력과 평가 기준 중 어느 것이 query이고 answer인지 구분하세요."
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
        "why": "모든 사례는 exact, acceptable, miss, hallucinate 중 하나입니다. exact는 1점, 의미 정답은 0.5점, hallucination은 -1점이며 miss는 점수 0입니다.\n재도전: 전체=네 범주 합을 먼저 쓰고 점수 가중치를 적용하세요."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "CRAG_score = n_correct_exact + 0.5 * n_correct - n_hallucinate",
        "alternatives": [],
        "why": "모든 사례는 exact, acceptable, miss, hallucinate 중 하나입니다. exact는 1점, 의미 정답은 0.5점, hallucination은 -1점이며 miss는 점수 0입니다.\n재도전: 전체=네 범주 합을 먼저 쓰고 점수 가중치를 적용하세요."
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
        "why": "두 검색을 수행한 뒤 is_finance가 True면 구조화 KG 근거를 목록으로, 아니면 웹 chunks를 선택합니다. 이후 생성 코드는 분기 밖에서 한 번만 실행합니다.\n재도전: 각 분기가 동일 타입 list를 만드는지와 분기 밖에서 한 번만 생성하는지 검산하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "combined_results = [kg_results]",
        "alternatives": [],
        "why": "두 검색을 수행한 뒤 is_finance가 True면 구조화 KG 근거를 목록으로, 아니면 웹 chunks를 선택합니다. 이후 생성 코드는 분기 밖에서 한 번만 실행합니다.\n재도전: 각 분기가 동일 타입 list를 만드는지와 분기 밖에서 한 번만 생성하는지 검산하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "else:",
        "alternatives": [],
        "why": "두 검색을 수행한 뒤 is_finance가 True면 구조화 KG 근거를 목록으로, 아니면 웹 chunks를 선택합니다. 이후 생성 코드는 분기 밖에서 한 번만 실행합니다.\n재도전: 각 분기가 동일 타입 list를 만드는지와 분기 밖에서 한 번만 생성하는지 검산하세요."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "combined_results = retrieved_results",
        "alternatives": [],
        "why": "두 검색을 수행한 뒤 is_finance가 True면 구조화 KG 근거를 목록으로, 아니면 웹 chunks를 선택합니다. 이후 생성 코드는 분기 밖에서 한 번만 실행합니다.\n재도전: 각 분기가 동일 타입 list를 만드는지와 분기 밖에서 한 번만 생성하는지 검산하세요."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "answer = self.reader.generate_response(query, combined_results)",
        "alternatives": [],
        "why": "두 검색을 수행한 뒤 is_finance가 True면 구조화 KG 근거를 목록으로, 아니면 웹 chunks를 선택합니다. 이후 생성 코드는 분기 밖에서 한 번만 실행합니다.\n재도전: 각 분기가 동일 타입 list를 만드는지와 분기 밖에서 한 번만 생성하는지 검산하세요."
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
        "why": "edge_index의 item은 통합 node 번호이므로 item_features용 0 기반 index로 되돌립니다. negative는 [0,num_movies)에서 batch_size개를 뽑아 같은 shape의 비교 embedding을 만듭니다.\n재도전: offset 제거 전 index로 item_features를 조회하면 왜 범위를 벗어날 수 있는지 설명하세요."
      },
      {
        "key": "B",
        "points": 1,
        "answer": "neg_item_indices = torch.randint(0, num_movies, (batch_size,), device=device)",
        "alternatives": [],
        "why": "edge_index의 item은 통합 node 번호이므로 item_features용 0 기반 index로 되돌립니다. negative는 [0,num_movies)에서 batch_size개를 뽑아 같은 shape의 비교 embedding을 만듭니다.\n재도전: offset 제거 전 index로 item_features를 조회하면 왜 범위를 벗어날 수 있는지 설명하세요."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "pos_emb = item_features[pos_item_indices]",
        "alternatives": [],
        "why": "edge_index의 item은 통합 node 번호이므로 item_features용 0 기반 index로 되돌립니다. negative는 [0,num_movies)에서 batch_size개를 뽑아 같은 shape의 비교 embedding을 만듭니다.\n재도전: offset 제거 전 index로 item_features를 조회하면 왜 범위를 벗어날 수 있는지 설명하세요."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "neg_emb = item_features[neg_item_indices]",
        "alternatives": [],
        "why": "edge_index의 item은 통합 node 번호이므로 item_features용 0 기반 index로 되돌립니다. negative는 [0,num_movies)에서 batch_size개를 뽑아 같은 shape의 비교 embedding을 만듭니다.\n재도전: offset 제거 전 index로 item_features를 조회하면 왜 범위를 벗어날 수 있는지 설명하세요."
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
        "alternatives": [],
        "why": "같은 node의 hop별 표현을 길게 붙이므로 마지막 feature 축 dim=-1을 사용합니다. node 배열은 user가 먼저이므로 self.num_users를 경계로 자릅니다.\n재도전: dim=0을 쓰면 어떤 축 크기가 잘못 커지는지 확인하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "user_features = final_features[:self.num_users]",
        "alternatives": [],
        "why": "같은 node의 hop별 표현을 길게 붙이므로 마지막 feature 축 dim=-1을 사용합니다. node 배열은 user가 먼저이므로 self.num_users를 경계로 자릅니다.\n재도전: dim=0을 쓰면 어떤 축 크기가 잘못 커지는지 확인하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "item_features = final_features[self.num_users:]",
        "alternatives": [],
        "why": "같은 node의 hop별 표현을 길게 붙이므로 마지막 feature 축 dim=-1을 사용합니다. node 배열은 user가 먼저이므로 self.num_users를 경계로 자릅니다.\n재도전: dim=0을 쓰면 어떤 축 크기가 잘못 커지는지 확인하세요."
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
        "why": "모델의 bpr_loss로 scalar를 만든 뒤 이전 gradient를 지우고 backward로 새 gradient를 계산해 optimizer가 파라미터를 갱신합니다.\n재도전: zero_grad, backward, step을 각각 왜 필요한지 한 문장씩 말하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "optimizer.zero_grad()",
        "alternatives": [],
        "why": "모델의 bpr_loss로 scalar를 만든 뒤 이전 gradient를 지우고 backward로 새 gradient를 계산해 optimizer가 파라미터를 갱신합니다.\n재도전: zero_grad, backward, step을 각각 왜 필요한지 한 문장씩 말하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "loss.backward()",
        "alternatives": [],
        "why": "모델의 bpr_loss로 scalar를 만든 뒤 이전 gradient를 지우고 backward로 새 gradient를 계산해 optimizer가 파라미터를 갱신합니다.\n재도전: zero_grad, backward, step을 각각 왜 필요한지 한 문장씩 말하세요."
      },
      {
        "key": "D",
        "points": 2,
        "answer": "optimizer.step()",
        "alternatives": [],
        "why": "모델의 bpr_loss로 scalar를 만든 뒤 이전 gradient를 지우고 backward로 새 gradient를 계산해 optimizer가 파라미터를 갱신합니다.\n재도전: zero_grad, backward, step을 각각 왜 필요한지 한 문장씩 말하세요."
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
        "alternatives": [],
        "why": "CLS pooling은 index 0, mean pooling은 token 축 dim=1을 제거합니다. 둘 다 [B,D]가 되어 mlp_head에서 [B,C] logits로 바뀝니다.\n재도전: mean(dim=-1)을 쓰면 head 입력 shape가 왜 틀리는지 설명하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "return self.mlp_head(x)",
        "alternatives": [],
        "why": "CLS pooling은 index 0, mean pooling은 token 축 dim=1을 제거합니다. 둘 다 [B,D]가 되어 mlp_head에서 [B,C] logits로 바뀝니다.\n재도전: mean(dim=-1)을 쓰면 head 입력 shape가 왜 틀리는지 설명하세요."
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
        "alternatives": [],
        "why": "대각선은 정답과 예측이 같은 개수이고 각 행 합은 해당 실제 class 수입니다. 0개 class의 나눗셈을 막기 위해 분모를 최소 1로 clamp합니다.\n재도전: 행·열을 반대로 누적하면 어떤 metric 해석이 바뀌는지 설명하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "per_class_acc = cm.diagonal().float() / torch.clamp(cm.sum(dim=1).float(), min=1.0)",
        "alternatives": [],
        "why": "대각선은 정답과 예측이 같은 개수이고 각 행 합은 해당 실제 class 수입니다. 0개 class의 나눗셈을 막기 위해 분모를 최소 1로 clamp합니다.\n재도전: 행·열을 반대로 누적하면 어떤 metric 해석이 바뀌는지 설명하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "return cm, per_class_acc",
        "alternatives": [],
        "why": "대각선은 정답과 예측이 같은 개수이고 각 행 합은 해당 실제 class 수입니다. 0개 class의 나눗셈을 막기 위해 분모를 최소 1로 clamp합니다.\n재도전: 행·열을 반대로 누적하면 어떤 metric 해석이 바뀌는지 설명하세요."
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
        "alternatives": [],
        "why": "forward와 loss는 autocast 안에서 계산합니다. scaler가 loss를 확대해 backward하고 optimizer step의 안전성을 확인한 뒤 다음 batch를 위해 scale을 조절합니다.\n재도전: 일반 FP32 학습이라면 마지막 세 줄을 어떤 두 줄로 바꾸는지 작성하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "loss = criterion(logits, labels)",
        "alternatives": [],
        "why": "forward와 loss는 autocast 안에서 계산합니다. scaler가 loss를 확대해 backward하고 optimizer step의 안전성을 확인한 뒤 다음 batch를 위해 scale을 조절합니다.\n재도전: 일반 FP32 학습이라면 마지막 세 줄을 어떤 두 줄로 바꾸는지 작성하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "scaler.scale(loss).backward()",
        "alternatives": [],
        "why": "forward와 loss는 autocast 안에서 계산합니다. scaler가 loss를 확대해 backward하고 optimizer step의 안전성을 확인한 뒤 다음 batch를 위해 scale을 조절합니다.\n재도전: 일반 FP32 학습이라면 마지막 세 줄을 어떤 두 줄로 바꾸는지 작성하세요."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "scaler.step(optimizer)",
        "alternatives": [],
        "why": "forward와 loss는 autocast 안에서 계산합니다. scaler가 loss를 확대해 backward하고 optimizer step의 안전성을 확인한 뒤 다음 batch를 위해 scale을 조절합니다.\n재도전: 일반 FP32 학습이라면 마지막 세 줄을 어떤 두 줄로 바꾸는지 작성하세요."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "scaler.update()",
        "alternatives": [],
        "why": "forward와 loss는 autocast 안에서 계산합니다. scaler가 loss를 확대해 backward하고 optimizer step의 안전성을 확인한 뒤 다음 batch를 위해 scale을 조절합니다.\n재도전: 일반 FP32 학습이라면 마지막 세 줄을 어떤 두 줄로 바꾸는지 작성하세요."
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
        "why": "누적된 제곱 norm에서 제곱근을 취해 importance에 사용할 크기를 얻습니다.",
        "alternatives": []
      },
      {
        "key": "B",
        "points": 2,
        "answer": "hook.remove()",
        "why": "calibration 이후 불필요한 수집이 계속되지 않도록 해제합니다.",
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
        "alternatives": [],
        "why": "Wanda는 input feature norm을 곱해 실제 activation에 민감한 column을 중요하게 보고, output row마다 같은 개수만 제거합니다.\n재도전: global magnitude와 Wanda가 서로 다르게 남길 수 있는 weight를 설명하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "num_zeros_per_row = round(col * sparsity)",
        "alternatives": [],
        "why": "Wanda는 input feature norm을 곱해 실제 activation에 민감한 column을 중요하게 보고, output row마다 같은 개수만 제거합니다.\n재도전: global magnitude와 Wanda가 서로 다르게 남길 수 있는 weight를 설명하세요."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "importance = torch.abs(W) * input_feat[n]",
        "alternatives": [],
        "why": "Wanda는 input feature norm을 곱해 실제 activation에 민감한 column을 중요하게 보고, output row마다 같은 개수만 제거합니다.\n재도전: global magnitude와 Wanda가 서로 다르게 남길 수 있는 weight를 설명하세요."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "threshold = torch.kthvalue(importance, num_zeros_per_row, dim=1)[0]",
        "alternatives": [],
        "why": "Wanda는 input feature norm을 곱해 실제 activation에 민감한 column을 중요하게 보고, output row마다 같은 개수만 제거합니다.\n재도전: global magnitude와 Wanda가 서로 다르게 남길 수 있는 weight를 설명하세요."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "mask = importance > threshold.reshape(row, 1)",
        "alternatives": [],
        "why": "Wanda는 input feature norm을 곱해 실제 activation에 민감한 column을 중요하게 보고, output row마다 같은 개수만 제거합니다.\n재도전: global magnitude와 Wanda가 서로 다르게 남길 수 있는 weight를 설명하세요."
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
        "alternatives": [],
        "why": "outlier channel은 작은 bitwidth에서 큰 오차를 만들 수 있어 양자화 전 확대하고 후에 같은 비율로 되돌립니다.\n재도전: 확대 후 되돌리지 않으면 layer 출력에 어떤 변화가 생기는지 설명하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "m.weight.data[:, outlier_mask] *= scale_factor",
        "alternatives": [],
        "why": "outlier channel은 작은 bitwidth에서 큰 오차를 만들 수 있어 양자화 전 확대하고 후에 같은 비율로 되돌립니다.\n재도전: 확대 후 되돌리지 않으면 layer 출력에 어떤 변화가 생기는지 설명하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "m.weight.data = pseudo_quantize_tensor(m.weight.data, n_bit=w_bit, q_group_size=q_group_size)",
        "alternatives": [],
        "why": "outlier channel은 작은 bitwidth에서 큰 오차를 만들 수 있어 양자화 전 확대하고 후에 같은 비율로 되돌립니다.\n재도전: 확대 후 되돌리지 않으면 layer 출력에 어떤 변화가 생기는지 설명하세요."
      },
      {
        "key": "D",
        "points": 2,
        "answer": "m.weight.data[:, outlier_mask] /= scale_factor",
        "alternatives": [],
        "why": "outlier channel은 작은 bitwidth에서 큰 오차를 만들 수 있어 양자화 전 확대하고 후에 같은 비율로 되돌립니다.\n재도전: 확대 후 되돌리지 않으면 layer 출력에 어떤 변화가 생기는지 설명하세요."
      }
    ]
  }
];
