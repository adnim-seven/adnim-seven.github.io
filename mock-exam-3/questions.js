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
        "why": "사전학습된 모델의 모든 파라미터에 대해 requires_grad를 False로 설정하여 백본을 동결하고 gradient 계산 대상에서 제외합니다.",
        "alternatives": [
          "param.requires_grad_(False)"
        ]
      },
      {
        "key": "B",
        "points": 3,
        "answer": "param.requires_grad = True",
        "why": "새로 부착한 분류 헤드(model.out_head)의 파라미터에 대해서만 requires_grad를 True로 복원하여 해당 계층만 미세조정(fine-tuning)되도록 활성화합니다.",
        "alternatives": [
          "param.requires_grad_(True)"
        ]
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
        "alternatives": [
          "model.out_head = nn.Linear(BASE_CONFIG[\"emb_dim\"], num_classes)",
          "model.out_head = torch.nn.Linear(BASE_CONFIG[\"emb_dim\"], num_classes)",
          "model.out_head = nn.Linear(in_features=BASE_CONFIG[\"emb_dim\"], out_features=num_classes)",
          "model.out_head = nn.Linear(BASE_CONFIG['emb_dim'], num_classes)"
        ],
        "why": "사전학습된 기본 백본의 출력 차원(BASE_CONFIG[\"emb_dim\"])을 다운스트림 분류 클래스 수(num_classes)로 변환하는 새 선형 계층을 장착합니다."
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
        "alternatives": [
          "return self.lora(x) + self.linear(x)"
        ],
        "why": "동결된 원본 선형 계층의 출력 self.linear(x)와 학습 가능한 LoRA 어댑터의 출력 self.lora(x)를 원소별 덧셈으로 결합하여 반환합니다."
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
        "alternatives": [
          "soup = BeautifulSoup(html_text['page_result'], 'lxml')",
          "soup = BeautifulSoup(html_text['page_result'], features='lxml')",
          "soup = BeautifulSoup(html_text[\"page_result\"], \"html.parser\")"
        ],
        "why": "크롤링된 HTML 본문 문자열을 lxml 파서를 통해 파싱 가능한 BeautifulSoup DOM 구조로 변환합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "text = soup.get_text(\" \", strip=True)",
        "alternatives": [
          "text = soup.get_text(' ', strip=True)",
          "text = soup.get_text(separator=\" \", strip=True)",
          "text = soup.get_text(separator=' ', strip=True)"
        ],
        "why": "HTML 태그를 배제하고 순수 텍스트만 추출하되 단어 간 공백을 두고 앞뒤 불필요한 공백을 strip합니다."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "all_documents.append(text)",
        "alternatives": [],
        "why": "정제된 순수 텍스트를 검색 대상 문서 리스트(all_documents)에 추가합니다."
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
        "alternatives": [
          "response = self.client.embeddings.create(input=texts, model=embedding_model)"
        ],
        "why": "OpenAI 호환 클라이언트를 호출하여 지정된 모델로 텍스트 목록의 고밀도 임베딩을 요청합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "embeddings = [np.array(item.embedding) for item in response.data]",
        "alternatives": [
          "embeddings = [np.array(item.embedding, dtype=np.float32) for item in response.data]",
          "embeddings = [item.embedding for item in response.data]"
        ],
        "why": "응답 데이터의 각 항목에서 임베딩 리스트(item.embedding)를 넘파이 배열(np.array)로 추출하여 모읍니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "return np.array(embeddings)",
        "alternatives": [
          "return np.asarray(embeddings)",
          "return np.array(embeddings, dtype=np.float32)"
        ],
        "why": "추출된 개별 임베딩 리스트를 최종 [N, D] 2차원 넘파이 행렬로 결합하여 반환합니다."
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
        "alternatives": [
          "cosine_scores = (all_embeddings @ query_embedding) / (np.linalg.norm(all_embeddings, axis=1) * np.linalg.norm(query_embedding))",
          "cosine_scores = np.dot(all_embeddings, query_embedding) / (np.linalg.norm(query_embedding) * np.linalg.norm(all_embeddings, axis=1))"
        ],
        "why": "문서 임베딩 행렬과 쿼리 벡터 간 내적을 L2 노름 곱으로 나누어 N개 문서에 대한 코사인 유사도 점수 [N]을 계산합니다."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "top_k_indices = (-cosine_scores).argsort()[:topk]",
        "alternatives": [
          "top_k_indices = np.argsort(-cosine_scores)[:topk]",
          "top_k_indices = np.argsort(cosine_scores)[::-1][:topk]"
        ],
        "why": "코사인 점수를 음수 부호로 변환 후 argsort를 취해 점수가 가장 높은 상위 topk개의 인덱스를 추출합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "top_k_chunks = np.array(all_chunks)[top_k_indices]",
        "alternatives": [
          "top_k_chunks = [all_chunks[i] for i in top_k_indices]",
          "top_k_chunks = np.asarray(all_chunks)[top_k_indices]"
        ],
        "why": "추출된 상위 인덱스로 전체 청크 배열을 슬라이싱하여 가장 연관성 높은 텍스트 청크 목록을 구성합니다."
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
        "alternatives": [
          "norm = 1.0 / torch.sqrt(deg[src] * deg[dst])",
          "norm = (deg[src] * deg[dst]).sqrt().pow(-1)",
          "norm = 1 / torch.sqrt(deg[src] * deg[dst])",
          "norm = 1.0 / (deg[src] * deg[dst]).sqrt()"
        ],
        "why": "GCN의 대칭 정규화 공식인 1 / sqrt(deg_src * deg_dst)를 계산하여 차수가 큰 노드의 메시지 과대 반영을 방지합니다."
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
        "alternatives": [
          "edge_messages_for_dst = self.W1(src_feat) + self.W2(src_feat * dst_feat)",
          "edge_messages_for_dst = self.W2(src_feat * dst_feat) + self.W1(src_feat)"
        ],
        "why": "소스 노드의 자체 특징 변환 W1(e_u)과 유저-아이템 상호작용 특징 W2(e_u ⊙ e_i)를 합산하여 엣지 메시지를 생성합니다."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "edge_messages_for_dst *= norm.unsqueeze(1)",
        "alternatives": [
          "edge_messages_for_dst = edge_messages_for_dst * norm.unsqueeze(1)",
          "edge_messages_for_dst = edge_messages_for_dst * norm.unsqueeze(-1)",
          "edge_messages_for_dst *= norm.unsqueeze(-1)"
        ],
        "why": "1차원 대칭 정규화 계수 norm [E]에 차원을 추가해 [E, 1]로 만든 뒤 엣지 메시지 [E, D]에 브로드캐스팅 곱합니다."
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
        "alternatives": [
          "aggregated_messages.index_add_(dim=0, index=dst, source=edge_messages_for_dst)"
        ],
        "why": "index_add_를 통해 목적지 노드(dst) 인덱스 위치에 맞춰 정규화된 엣지 메시지들을 누적 합산합니다."
      },
      {
        "key": "B",
        "points": 4,
        "answer": "aggregated_messages[user_num:] += self.W1(node_features[user_num:])",
        "alternatives": [
          "aggregated_messages[user_num:] = aggregated_messages[user_num:] + self.W1(node_features[user_num:])"
        ],
        "why": "아이템 노드 영역(user_num부터 끝까지)에 아이템 자신의 기존 특징 변환값(Self-connection)을 가산합니다."
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
        "alternatives": [
          "x_c, y_c, w, h = x.unbind(dim=1)",
          "x_c, y_c, w, h = x.unbind(-1)"
        ],
        "why": "바운딩 박스 텐서 [N, 4]를 1번 차원을 따라 중심x, 중심y, 너비, 높이 4개의 1차원 텐서로 분리(unbind)합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "b = [(x_c - 0.5 * w), (y_c - 0.5 * h),\n     (x_c + 0.5 * w), (y_c + 0.5 * h)]",
        "alternatives": [
          "b = [x_c - 0.5 * w, y_c - 0.5 * h, x_c + 0.5 * w, y_c + 0.5 * h]",
          "b = [(x_c - w / 2), (y_c - h / 2), (x_c + w / 2), (y_c + h / 2)]"
        ],
        "why": "중심과 크기 정보로부터 좌상단(x1, y1)과 우하단(x2, y2) 모서리 좌표를 계산하여 4원소 리스트로 묶습니다."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "return torch.stack(b, dim=1)",
        "alternatives": [
          "return torch.stack(b, dim=-1)",
          "return torch.stack(b, 1)"
        ],
        "why": "4개의 1차원 좌표 텐서 리스트를 1번 차원을 따라 스택하여 [N, 4] xyxy 바운딩 박스 텐서로 반환합니다."
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
        "why": "원본 이미지 크기 튜플 (너비, 높이)를 스칼라 변수로 언패킹합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "b = box_cxcywh_to_xyxy(out_bbox)",
        "alternatives": [],
        "why": "정규화된 cxcywh 포맷 박스를 xyxy 모서리 좌표 포맷으로 변환합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "b = b * torch.tensor([img_w, img_h, img_w, img_h], dtype=torch.float32)",
        "alternatives": [
          "b = b * torch.tensor([img_w, img_h, img_w, img_h], dtype=torch.float)",
          "b = b * torch.tensor([img_w, img_h, img_w, img_h], device=b.device, dtype=torch.float32)",
          "b = b * torch.tensor([img_w, img_h, img_w, img_h], dtype=torch.float32, device=b.device)"
        ],
        "why": "정규화 좌표 [x1, y1, x2, y2]에 [너비, 높이, 너비, 높이] 스케일을 곱하여 원본 이미지의 실제 픽셀 좌표계로 복원합니다."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "return b",
        "alternatives": [],
        "why": "스케일링이 완료된 실제 픽셀 단위 바운딩 박스 텐서를 반환합니다."
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
        "alternatives": [
          "outputs = model.forward(img)"
        ],
        "why": "전처리된 이미지 텐서를 DETR 모델에 통과시켜 클래스 로짓과 예측 박스 딕셔너리를 출력합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "probas = outputs['pred_logits'].softmax(-1)[0, :, :-1]",
        "alternatives": [
          "probas = outputs[\"pred_logits\"].softmax(-1)[0, :, :-1]",
          "probas = outputs['pred_logits'].softmax(dim=-1)[0, :, :-1]",
          "probas = outputs[\"pred_logits\"].softmax(dim=-1)[0, :, :-1]"
        ],
        "why": "클래스 로짓에 softmax를 적용하고 첫 배치([0])에서 마지막 no-object 배경 클래스를 제외([..., :-1])한 유효 객체 확률을 추출합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "keep = probas.max(-1).values > 0.9",
        "alternatives": [
          "keep = probas.max(dim=-1).values > 0.9",
          "keep = probas.max(-1)[0] > 0.9",
          "keep = probas.max(dim=-1)[0] > 0.9"
        ],
        "why": "최대 객체 확률이 0.9 신뢰도 임계값을 초과하는 유효 탐지 쿼리를 필터링하는 불리언 마스크를 생성합니다."
      },
      {
        "key": "D",
        "points": 2,
        "answer": "bboxes_scaled = rescale_bboxes(outputs['pred_boxes'][0, keep], im.size)",
        "alternatives": [
          "bboxes_scaled = rescale_bboxes(outputs[\"pred_boxes\"][0, keep], im.size)"
        ],
        "why": "선별된 쿼리의 예측 박스들을 원본 이미지 해상도(im.size)에 맞춰 실제 픽셀 좌표로 스케일 복원합니다."
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
        "why": "파라미터 이름(name)이 미리 계산된 가지치기 마스크 딕셔너리(self.masks)에 등록되어 있는지 검사합니다.",
        "alternatives": [
          "if name in self.masks.keys():"
        ]
      },
      {
        "key": "B",
        "points": 3,
        "answer": "param.mul_(self.masks[name])",
        "why": "optimizer 가중치 갱신 후 다시 0이 아니게 된 위치를 기존 이진 마스크와 in-place 곱하여 지속적으로 0으로 유지합니다.",
        "alternatives": [
          "param.data.mul_(self.masks[name])",
          "param *= self.masks[name]"
        ]
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
        "alternatives": [
          "importance = weight.abs().sum(dim=[2, 3], keepdim=True)",
          "importance = torch.abs(weight).sum(dim=(2, 3), keepdim=True)",
          "importance = weight.abs().sum((2, 3), keepdim=True)"
        ],
        "why": "가중치 [OC, IC, KH, KW]에서 공간 축인 2, 3번 차원을 절댓값 합산하여 커널 단위 중요도 [OC, IC, 1, 1]를 구합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "threshold = torch.kthvalue(importance.flatten(), num_pruned_kernels)[0]",
        "alternatives": [
          "threshold = torch.kthvalue(importance.flatten(), num_pruned_kernels).values",
          "threshold = torch.kthvalue(importance.view(-1), num_pruned_kernels)[0]"
        ],
        "why": "전체 커널 중요도 중 num_pruned_kernels번째로 작은 값을 추출하여 가지치기 경계 문턱값으로 설정합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "mask = importance > threshold",
        "alternatives": [
          "mask = threshold < importance"
        ],
        "why": "문턱값보다 큰 유의미한 커널 위치만 True로 설정하는 이진 마스크를 생성합니다."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "mask = mask.expand_as(weight)",
        "alternatives": [
          "mask = mask.expand(weight.shape)"
        ],
        "why": "[OC, IC, 1, 1] 마스크를 원본 가중치 크기인 [OC, IC, KH, KW]로 공간 확장합니다."
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
        "alternatives": [
          "all_weights = torch.concat(parameters_to_prune)"
        ],
        "why": "모델 전체의 모든 파라미터 텐서 리스트를 하나의 거대한 1차원 텐서로 결합하여 전역 비교를 준비합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "num_elements = all_weights.numel()",
        "alternatives": [
          "num_elements = len(all_weights)"
        ],
        "why": "전역 파라미터의 총 원소 수를 계산합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "num_zeros = round(num_elements * sparsity)",
        "alternatives": [
          "num_zeros = int(round(num_elements * sparsity))",
          "num_zeros = int(num_elements * sparsity)"
        ],
        "why": "총 원소 수에 목표 희소도(sparsity)를 곱해 제거할 전역 파라미터 개수를 정수로 산출합니다."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "importance = torch.abs(all_weights)",
        "alternatives": [
          "importance = all_weights.abs()"
        ],
        "why": "파라미터 가중치의 크기(절댓값)를 전역 중요도로 취합니다."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "threshold = torch.kthvalue(importance, num_zeros)[0]",
        "alternatives": [
          "threshold = torch.kthvalue(importance, num_zeros).values",
          "threshold = torch.kthvalue(importance.flatten(), num_zeros)[0]"
        ],
        "why": "전역 중요도 텐서에서 num_zeros번째로 작은 값을 찾아 모델 전체에 공통 적용할 전역 문턱값을 구합니다."
      }
    ]
  }
];
