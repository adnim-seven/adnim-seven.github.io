window.EXAM_NUMBER=3;
window.EXAM=[
  {
    "subject": "LLM",
    "title": "동결 뒤 학습 대상 설정",
    "source": "Finetuning Classification · 기존 빈칸 주변 코드 응용",
    "prompt": "backbone을 동결하고 새 classifier만 학습하려 합니다. 모든 parameter를 동결한 뒤 model.out_head만 다시 학습 가능하게 만드세요. for문은 제공되어 있습니다.",
    "code": "for param in model.parameters():\n    {{A}}\nfor param in model.out_head.parameters():\n    {{B}}\noptimizer = torch.optim.AdamW(\n    filter(lambda p: p.requires_grad, model.parameters()), lr=learning_rate\n)",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "param.requires_grad = False",
        "why": "기존 parameter 전체를 동결합니다.",
        "alternatives": []
      },
      {
        "key": "B",
        "points": 3,
        "answer": "param.requires_grad = True",
        "why": "그 뒤 classifier만 학습 대상으로 되돌립니다. 순서가 중요합니다.",
        "alternatives": []
      }
    ],
    "id": "1-1"
  },
  {
    "id": "1-2",
    "subject": "LLM",
    "title": "분류 Head 교체",
    "source": "Chapter_6_Excercise_Finetuning_Classification.ipynb · 강의 코드 기반 재구성",
    "prompt": "embedding 표현을 햄/스팸 두 class logits로 바꾸는 완성된 out_head 코드를 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: hidden [B,D]→classification logits [B,2]",
    "code": "num_classes = 2\n# BASE_CONFIG[\"emb_dim\"]은 최종 hidden vector 크기\n{{A}}\n# 이후 model(x)는 class logits를 출력합니다.",
    "slots": [
      {
        "key": "A",
        "points": 7,
        "answer": "model.out_head = torch.nn.Linear(\n    in_features=BASE_CONFIG[\"emb_dim\"], out_features=num_classes\n)",
        "alternatives": [],
        "why": "입력은 GPT hidden 크기 emb_dim이고 출력은 token vocabulary가 아니라 분류 label 수 num_classes입니다. 새 Linear는 기본적으로 학습 가능합니다.\n재도전: 출력 한 칸이 단어 후보인지 class 후보인지 구분하세요."
      }
    ]
  },
  {
    "id": "1-3",
    "subject": "LLM",
    "title": "Base와 LoRA 결합",
    "source": "Chapter_6_Excercise_Finetuning_Classification_LoRA.ipynb · 강의 코드 기반 재구성",
    "prompt": "기존 Linear 출력에 같은 입력의 LoRA 변화량을 더하는 return 문을 완성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: linear(x) […,out] + lora(x) […,out] → […,out]",
    "code": "class LinearWithLoRA(nn.Module):\n    def forward(self, x):\n        # TODO: 기존 출력에 LoRA 잔차 출력을 더하세요.\n        {{A}}",
    "slots": [
      {
        "key": "A",
        "points": 8,
        "answer": "return self.linear(x) + self.lora(x)",
        "alternatives": [],
        "why": "LoRA는 기존 출력을 대체하지 않고 ΔW에 해당하는 adapter 출력을 더합니다. 두 항의 shape이 같아 원소별 합이 가능합니다.\n재도전: 기존 경로와 변화량 경로를 각각 한 항으로 적으세요."
      }
    ]
  },
  {
    "id": "2-1",
    "subject": "RAG",
    "title": "HTML 문서 정제",
    "source": "2. Task_1.ipynb · 강의 코드 기반 재구성",
    "prompt": "검색 결과의 전체 HTML을 lxml로 분석하고 본문 문자열을 all_documents에 저장하는 세 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: list[page dict] → HTML str → text str → list[str]",
    "code": "for html_text in search_results:\n    {{A}}\n    {{B}}\n    {{C}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "soup = BeautifulSoup(html_text[\"page_result\"], features=\"lxml\")",
        "alternatives": [],
        "why": "page_result가 전체 HTML이고 BeautifulSoup이 구조를 분석합니다. get_text는 태그를 제거한 본문을 만들며 append로 문서 순서를 보존합니다.\n재도전: 입력 field, parser, text 추출, 저장 네 역할을 순서대로 확인하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "text = soup.get_text(\" \", strip=True)",
        "alternatives": [],
        "why": "page_result가 전체 HTML이고 BeautifulSoup이 구조를 분석합니다. get_text는 태그를 제거한 본문을 만들며 append로 문서 순서를 보존합니다.\n재도전: 입력 field, parser, text 추출, 저장 네 역할을 순서대로 확인하세요."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "all_documents.append(text)",
        "alternatives": [],
        "why": "page_result가 전체 HTML이고 BeautifulSoup이 구조를 분석합니다. get_text는 태그를 제거한 본문을 만들며 append로 문서 순서를 보존합니다.\n재도전: 입력 field, parser, text 추출, 저장 네 역할을 순서대로 확인하세요."
      }
    ]
  },
  {
    "id": "2-2",
    "subject": "RAG",
    "title": "Embedding API",
    "source": "2. Task_1.ipynb · 강의 코드 기반 재구성",
    "prompt": "준비된 self.client와 embedding_model을 사용해 texts를 임베딩하세요. response.data의 각 item.embedding을 NumPy 벡터로 모아 [N,D] 배열로 반환하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: list[str] N → API response.data N → ndarray [N,D]",
    "code": "def embed(self, texts):\n    embedding_model = \"text-embedding-3-small\"  # 제공값\n    {{A}}\n    {{B}}\n    {{C}}",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "response = self.client.embeddings.create(model=embedding_model, input=texts)",
        "alternatives": [],
        "why": "embeddings.create는 입력마다 response.data 항목을 반환합니다. 각 item.embedding을 NumPy vector로 바꾸고 전체 목록을 [N,D] 배열로 묶습니다.\n재도전: API 호출 결과에서 목록과 개별 vector가 각각 어느 속성인지 구분하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "embeddings = [np.array(item.embedding) for item in response.data]",
        "alternatives": [],
        "why": "embeddings.create는 입력마다 response.data 항목을 반환합니다. 각 item.embedding을 NumPy vector로 바꾸고 전체 목록을 [N,D] 배열로 묶습니다.\n재도전: API 호출 결과에서 목록과 개별 vector가 각각 어느 속성인지 구분하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "return np.array(embeddings)",
        "alternatives": [],
        "why": "embeddings.create는 입력마다 response.data 항목을 반환합니다. 각 item.embedding을 NumPy vector로 바꾸고 전체 목록을 [N,D] 배열로 묶습니다.\n재도전: API 호출 결과에서 목록과 개별 vector가 각각 어느 속성인지 구분하세요."
      }
    ]
  },
  {
    "id": "2-3",
    "subject": "RAG",
    "title": "Cosine Top-k",
    "source": "2. Task_1.ipynb · 강의 코드 기반 재구성",
    "prompt": "np.dot와 np.linalg.norm으로 cosine similarity를 계산하세요. (-cosine_scores).argsort()로 내림차순 index를 얻어 상위 topk개 chunk를 선택하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: [N,D]·[D] → scores [N] → indices [K] → chunks [K]",
    "code": "# all_embeddings [N,D], query_embedding [D]\n# 두 입력의 모든 vector norm은 0보다 큽니다.\n# all_chunks 길이 N, 1 <= topk <= N\n{{A}}\n{{B}}\n{{C}}\n# top_k_chunks를 Reader에 전달합니다.",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "cosine_scores = np.dot(all_embeddings, query_embedding) / (\n    np.linalg.norm(all_embeddings, axis=1) * np.linalg.norm(query_embedding)\n)",
        "alternatives": [],
        "why": "[N,D]와 [D]의 dot은 [N] 분자를 만들고 각 chunk norm(axis=1)과 query norm으로 정규화합니다. argsort는 오름차순이므로 음수 점수를 정렬해 높은 원래 점수를 먼저 얻습니다.\n재도전: 분자, 분모, 정렬, indexing 네 단계를 따로 검산하세요."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "top_k_indices = (-cosine_scores).argsort()[:topk]",
        "alternatives": [],
        "why": "[N,D]와 [D]의 dot은 [N] 분자를 만들고 각 chunk norm(axis=1)과 query norm으로 정규화합니다. argsort는 오름차순이므로 음수 점수를 정렬해 높은 원래 점수를 먼저 얻습니다.\n재도전: 분자, 분모, 정렬, indexing 네 단계를 따로 검산하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "top_k_chunks = np.array(all_chunks)[top_k_indices]",
        "alternatives": [],
        "why": "[N,D]와 [D]의 dot은 [N] 분자를 만들고 각 chunk norm(axis=1)과 query norm으로 정규화합니다. argsort는 오름차순이므로 음수 점수를 정렬해 높은 원래 점수를 먼저 얻습니다.\n재도전: 분자, 분모, 정렬, indexing 네 단계를 따로 검산하세요."
      }
    ]
  },
  {
    "id": "3-1",
    "subject": "Data",
    "title": "Degree 정규화",
    "source": "RecSys_GCF_practice.ipynb · 강의 코드 기반 재구성",
    "prompt": "각 edge의 양 끝 degree를 대칭적으로 보정하는 norm [E] 계산 한 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: deg [V] → deg[src],deg[dst] [E] → norm [E]",
    "code": "# calculate 1/(root(deg(u)) * root(deg(i))) for all edge\n{{A}}",
    "slots": [
      {
        "key": "A",
        "points": 5,
        "answer": "norm = 1.0/torch.sqrt(deg[src]*deg[dst])",
        "alternatives": [],
        "why": "각 edge의 src와 dst degree를 곱한 뒤 제곱근의 역수를 취합니다. degree가 큰 node에서 오는 메시지를 줄여 graph 연결 수 차이를 보정합니다.\n재도전: norm의 shape가 node 수 V가 아니라 edge 수 E인 이유를 말해 보세요."
      }
    ]
  },
  {
    "id": "3-2",
    "subject": "Data",
    "title": "User→Item 메시지",
    "source": "RecSys_GCF_practice.ipynb · 강의 코드 기반 재구성",
    "prompt": "dst 아이템이 src 사용자에게서 받을 interaction message를 계산하고 norm을 적용하는 두 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: src_feat,dst_feat [E,D] → message [E,D] × norm [E,1]",
    "code": "# Hint: W1(h_u) + W2(h_i * h_u), then normalize\n{{A}}\n{{B}}",
    "slots": [
      {
        "key": "A",
        "points": 4,
        "answer": "edge_messages_for_dst = self.W1(src_feat) + self.W2(src_feat*dst_feat)",
        "alternatives": [],
        "why": "목적지가 dst이므로 이웃 src_feat를 W1에 넣고, 사용자·아이템 원소곱을 W2에 넣습니다. norm은 [E,1]로 바꿔 feature별 broadcasting합니다.\n재도전: for_src 코드에서 src와 dst만 역할 교환해 다시 작성하세요."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "edge_messages_for_dst *= norm.unsqueeze(1)",
        "alternatives": [],
        "why": "목적지가 dst이므로 이웃 src_feat를 W1에 넣고, 사용자·아이템 원소곱을 W2에 넣습니다. norm은 [E,1]로 바꿔 feature별 broadcasting합니다.\n재도전: for_src 코드에서 src와 dst만 역할 교환해 다시 작성하세요."
      }
    ]
  },
  {
    "id": "3-3",
    "subject": "Data",
    "title": "Item 집계·Self message",
    "source": "RecSys_GCF_practice.ipynb · 강의 코드 기반 재구성",
    "prompt": "user→item 메시지를 dst node에 합산하고 모든 item node의 self 변환을 더하는 두 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: edge messages [E,D] → aggregated [V,D]; item slice [I,D]",
    "code": "# m_(i<-i) and messages arriving at item i\n{{A}}\n{{B}}",
    "slots": [
      {
        "key": "A",
        "points": 4,
        "answer": "aggregated_messages.index_add_(0, dst, edge_messages_for_dst)",
        "alternatives": [],
        "why": "edge message는 destination인 dst 위치에 index_add_로 누적합니다. item node는 전체 node 배열의 user_num 이후 구간이므로 같은 slice에 W1(self)를 더합니다.\n재도전: user용 두 줄에서 src→dst, 앞 slice→뒤 slice로 바꿔 보세요."
      },
      {
        "key": "B",
        "points": 4,
        "answer": "aggregated_messages[user_num:] += self.W1(node_features[user_num:])",
        "alternatives": [],
        "why": "edge message는 destination인 dst 위치에 index_add_로 누적합니다. item node는 전체 node 배열의 user_num 이후 구간이므로 같은 slice에 W1(self)를 더합니다.\n재도전: user용 두 줄에서 src→dst, 앞 slice→뒤 slice로 바꿔 보세요."
      }
    ]
  },
  {
    "id": "4-1",
    "subject": "Vision",
    "title": "Box 형식 변환",
    "source": "03_DETR.ipynb · 강의 코드 기반 재구성",
    "prompt": "N개 normalized (cx,cy,w,h) box를 성분별로 나누고 (xmin,ymin,xmax,ymax) Tensor로 변환하는 네 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: [N,4] cxcywh → four [N] → [N,4] xyxy",
    "code": "def box_cxcywh_to_xyxy(x):\n    # x [N,4]: center x, center y, width, height\n    {{A}}\n    {{B}}\n    {{C}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "x_c, y_c, w, h = x.unbind(1)",
        "alternatives": [],
        "why": "중심에서 절반 크기를 빼면 좌상단, 더하면 우하단입니다. 각 성분 [N]을 dim=1에 stack해 [N,4]를 복원합니다.\n재도전: cx=0.5,w=0.2의 xmin과 xmax를 계산하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "b = [(x_c - 0.5 * w), (y_c - 0.5 * h),\n     (x_c + 0.5 * w), (y_c + 0.5 * h)]",
        "alternatives": [],
        "why": "중심에서 절반 크기를 빼면 좌상단, 더하면 우하단입니다. 각 성분 [N]을 dim=1에 stack해 [N,4]를 복원합니다.\n재도전: cx=0.5,w=0.2의 xmin과 xmax를 계산하세요."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "return torch.stack(b, dim=1)",
        "alternatives": [],
        "why": "중심에서 절반 크기를 빼면 좌상단, 더하면 우하단입니다. 각 성분 [N]을 dim=1에 stack해 [N,4]를 복원합니다.\n재도전: cx=0.5,w=0.2의 xmin과 xmax를 계산하세요."
      }
    ]
  },
  {
    "id": "4-2",
    "subject": "Vision",
    "title": "Pixel Box 복원",
    "source": "03_DETR.ipynb · 강의 코드 기반 재구성",
    "prompt": "normalized box를 corner 형식으로 바꾸고 PIL 원본 크기 (W,H)에 맞춰 pixel 좌표로 복원하는 네 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: [N,4] normalized × [4] WHWH → [N,4] pixels",
    "code": "def rescale_bboxes(out_bbox, size):\n    {{A}}\n    {{B}}\n    {{C}}\n    {{D}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "img_w, img_h = size",
        "alternatives": [],
        "why": "x 좌표에는 image width, y 좌표에는 height를 곱합니다. [4] scale Tensor가 [N,4] box 전체에 broadcasting됩니다.\n재도전: W와 H를 바꾸면 비정사각형 이미지에서 어떤 왜곡이 생기는지 설명하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "b = box_cxcywh_to_xyxy(out_bbox)",
        "alternatives": [],
        "why": "x 좌표에는 image width, y 좌표에는 height를 곱합니다. [4] scale Tensor가 [N,4] box 전체에 broadcasting됩니다.\n재도전: W와 H를 바꾸면 비정사각형 이미지에서 어떤 왜곡이 생기는지 설명하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "b = b * torch.tensor([img_w, img_h, img_w, img_h], dtype=torch.float32)",
        "alternatives": [],
        "why": "x 좌표에는 image width, y 좌표에는 height를 곱합니다. [4] scale Tensor가 [N,4] box 전체에 broadcasting됩니다.\n재도전: W와 H를 바꾸면 비정사각형 이미지에서 어떤 왜곡이 생기는지 설명하세요."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "return b",
        "alternatives": [],
        "why": "x 좌표에는 image width, y 좌표에는 height를 곱합니다. [4] scale Tensor가 [N,4] box 전체에 broadcasting됩니다.\n재도전: W와 H를 바꾸면 비정사각형 이미지에서 어떤 왜곡이 생기는지 설명하세요."
      }
    ]
  },
  {
    "id": "4-3",
    "subject": "Vision",
    "title": "Query 필터링",
    "source": "03_DETR.ipynb · 강의 코드 기반 재구성",
    "prompt": "DETR forward 후 no-object class를 제외한 확률을 만들고 최고 class confidence가 0.9를 넘는 query의 box만 pixel 좌표로 복원하는 네 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: logits [1,Q,C+1] → probs [Q,C] → keep [Q] → boxes [K,4]",
    "code": "{{A}}\n{{B}}\n{{C}}\n{{D}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "outputs = model(img)",
        "alternatives": [],
        "why": "softmax는 class 축 마지막에 적용하고 batch 0, 모든 query, 마지막 class 제외를 선택합니다. query별 max value로 keep mask를 만들고 동일 mask를 box에 적용합니다.\n재도전: [:-1]을 query 축에 적용하면 어떤 오류가 생기는지 확인하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "probas = outputs['pred_logits'].softmax(-1)[0, :, :-1]",
        "alternatives": [],
        "why": "softmax는 class 축 마지막에 적용하고 batch 0, 모든 query, 마지막 class 제외를 선택합니다. query별 max value로 keep mask를 만들고 동일 mask를 box에 적용합니다.\n재도전: [:-1]을 query 축에 적용하면 어떤 오류가 생기는지 확인하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "keep = probas.max(-1).values > 0.9",
        "alternatives": [],
        "why": "softmax는 class 축 마지막에 적용하고 batch 0, 모든 query, 마지막 class 제외를 선택합니다. query별 max value로 keep mask를 만들고 동일 mask를 box에 적용합니다.\n재도전: [:-1]을 query 축에 적용하면 어떤 오류가 생기는지 확인하세요."
      },
      {
        "key": "D",
        "points": 2,
        "answer": "bboxes_scaled = rescale_bboxes(outputs['pred_boxes'][0, keep], im.size)",
        "alternatives": [],
        "why": "softmax는 class 축 마지막에 적용하고 batch 0, 모든 query, 마지막 class 제외를 선택합니다. query별 max value로 keep mask를 만들고 동일 mask를 box에 적용합니다.\n재도전: [:-1]을 query 축에 적용하면 어떤 오류가 생기는지 확인하세요."
      }
    ]
  },
  {
    "subject": "On-device AI",
    "title": "Pruning 후 fine-tuning 유지",
    "source": "Pruning for CNN · 기존 빈칸 주변 코드 응용",
    "prompt": "optimizer 갱신 직후 기존 mask를 다시 적용하려 합니다. param 이름이 self.masks에 있을 때만 in-place 곱하세요. 새로운 mask를 계산하지 마세요.",
    "code": "@torch.no_grad()\ndef apply(self, model):\n    for name, param in model.named_parameters():\n        {{A}}\n            {{B}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "if name in self.masks:",
        "why": "mask가 있는 parameter만 선택합니다.",
        "alternatives": []
      },
      {
        "key": "B",
        "points": 3,
        "answer": "param.mul_(self.masks[name])",
        "why": "갱신으로 되살아난 pruned 위치를 0으로 되돌립니다.",
        "alternatives": []
      }
    ],
    "id": "5-1"
  },
  {
    "id": "5-2",
    "subject": "On-device AI",
    "title": "Kernel·Channel 구분",
    "source": "1. Pruning for CNN.ipynb · 강의 코드 기반 재구성",
    "prompt": "weight [OC,IC,KH,KW]입니다. torch.abs의 공간 두 축 합으로 kernel별 중요도를 계산하세요. num_pruned_kernels는 유효한 k이며 동률은 없습니다. kthvalue로 경계를 구하고 큰 kernel만 남기는 mask를 expand_as로 확장하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: [OC,IC,KH,KW] → [OC,IC,1,1] → mask → expanded weight",
    "code": "# kernel index is (out_channel, in_channel)\n{{A}}\n{{B}}\n{{C}}\n{{D}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "importance = weight.abs().sum(dim=(2, 3), keepdim=True)",
        "alternatives": [],
        "why": "kernel pruning은 spatial KH·KW를 합쳐 [OC,IC,1,1] importance를 만들고, channel pruning과 달리 input channel 축은 남겨 개별 kernel을 비교합니다.\n재도전: input channel 전체를 제거하려면 sum dim을 어떻게 바꿔야 하는지 작성하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "threshold = torch.kthvalue(importance.flatten(), num_pruned_kernels)[0]",
        "alternatives": [],
        "why": "kernel pruning은 spatial KH·KW를 합쳐 [OC,IC,1,1] importance를 만들고, channel pruning과 달리 input channel 축은 남겨 개별 kernel을 비교합니다.\n재도전: input channel 전체를 제거하려면 sum dim을 어떻게 바꿔야 하는지 작성하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "mask = importance > threshold",
        "alternatives": [],
        "why": "kernel pruning은 spatial KH·KW를 합쳐 [OC,IC,1,1] importance를 만들고, channel pruning과 달리 input channel 축은 남겨 개별 kernel을 비교합니다.\n재도전: input channel 전체를 제거하려면 sum dim을 어떻게 바꿔야 하는지 작성하세요."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "mask = mask.expand_as(weight)",
        "alternatives": [],
        "why": "kernel pruning은 spatial KH·KW를 합쳐 [OC,IC,1,1] importance를 만들고, channel pruning과 달리 input channel 축은 남겨 개별 kernel을 비교합니다.\n재도전: input channel 전체를 제거하려면 sum dim을 어떻게 바꿔야 하는지 작성하세요."
      }
    ]
  },
  {
    "id": "5-3",
    "subject": "On-device AI",
    "title": "Global Magnitude Pruning",
    "source": "1. Pruning for CNN.ipynb · 강의 코드 기반 재구성",
    "prompt": "parameters_to_prune에는 Conv/FC weight를 펼친 Tensor들이 들어 있습니다. 전체를 torch.cat으로 결합하고 sparsity에 맞는 전역 magnitude threshold를 구하세요. 반올림한 제거 수는 1 이상이고 원소 수 이하입니다. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: per-layer flat vectors → all [N] → |w| [N] → scalar threshold",
    "code": "# parameters_to_prune contains param.view(-1) for each Conv/FC layer\n############### YOUR CODE STARTS HERE ###############\n{{A}}\n{{B}}\n{{C}}\n{{D}}\n{{E}}\n############### YOUR CODE ENDS HERE #################",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "all_weights = torch.cat(parameters_to_prune)",
        "alternatives": [],
        "why": "전역 pruning은 모든 layer의 weight를 같은 importance ranking에 넣습니다. 따라서 작은 weight가 많은 layer는 더 많이 prune될 수 있습니다.\n재도전: layerwise pruning과 global pruning에서 layer별 실제 sparsity가 어떻게 달라질지 설명하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "num_elements = all_weights.numel()",
        "alternatives": [],
        "why": "전역 pruning은 모든 layer의 weight를 같은 importance ranking에 넣습니다. 따라서 작은 weight가 많은 layer는 더 많이 prune될 수 있습니다.\n재도전: layerwise pruning과 global pruning에서 layer별 실제 sparsity가 어떻게 달라질지 설명하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "num_zeros = round(num_elements * sparsity)",
        "alternatives": [],
        "why": "전역 pruning은 모든 layer의 weight를 같은 importance ranking에 넣습니다. 따라서 작은 weight가 많은 layer는 더 많이 prune될 수 있습니다.\n재도전: layerwise pruning과 global pruning에서 layer별 실제 sparsity가 어떻게 달라질지 설명하세요."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "importance = torch.abs(all_weights)",
        "alternatives": [],
        "why": "전역 pruning은 모든 layer의 weight를 같은 importance ranking에 넣습니다. 따라서 작은 weight가 많은 layer는 더 많이 prune될 수 있습니다.\n재도전: layerwise pruning과 global pruning에서 layer별 실제 sparsity가 어떻게 달라질지 설명하세요."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "threshold = torch.kthvalue(importance, num_zeros)[0]",
        "alternatives": [],
        "why": "전역 pruning은 모든 layer의 weight를 같은 importance ranking에 넣습니다. 따라서 작은 weight가 많은 layer는 더 많이 prune될 수 있습니다.\n재도전: layerwise pruning과 global pruning에서 layer별 실제 sparsity가 어떻게 달라질지 설명하세요."
      }
    ]
  }
];
