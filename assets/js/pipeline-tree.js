/**
 * AI Specialist Interactive Pipeline Tree Component
 * Provides collapsible/expandable top-down dependency trees with tensor shapes & exam highlights.
 */
(() => {
  const SUBJECT_TREES = {
    llm: {
      subject: "LLM",
      title: "과목 1. LLM · 전 챕터(Ch 1~7) 종합 통합 파이프라인 트리",
      desc: "사전학습, GPT 아키텍처, Attention, LoRA, DPO까지 전 함수의 입출력 텐서와 핵심 코드를 접고 펼치며 확인하세요.",
      branches: [
        {
          icon: "🎯",
          title: "Branch A: 사전학습 손실 계산 및 평가 함수군 (Ch 5)",
          meta: "4개 함수 · CrossEntropyLoss",
          nodes: [
            {
              name: "train_model_simple(model, train_loader, val_loader, optimizer, ...)",
              kind: "학습루프",
              inShape: "Dataloader",
              outShape: "학습 완료 모델",
              isExam: true,
              desc: "PyTorch 4단계 학습 루프: zero_grad() → loss 계산 → loss.backward() → optimizer.step()",
              code: "optimizer.zero_grad()\nloss = calc_loss_batch(input_batch, target_batch, model, device)\nloss.backward()\noptimizer.step()"
            },
            {
              name: "calc_loss_batch(input_batch, target_batch, model, device)",
              kind: "손실계산",
              inShape: "[B, T], [B, T]",
              outShape: "scalar Loss",
              isExam: true,
              desc: "배치 로짓 [B, T, V]과 타깃 [B, T]을 1차원으로 flatten하여 교차 엔트로피 손실 계산",
              code: "logits = model(input_batch)\nloss = torch.nn.functional.cross_entropy(logits.flatten(0, 1), target_batch.flatten())\nreturn loss"
            },
            {
              name: "calc_loss_loader(data_loader, model, device, num_batches=None)",
              kind: "검증함수",
              inShape: "DataLoader",
              outShape: "평균 Loss",
              isExam: false,
              desc: "전체 또는 num_batches 수만큼 루프를 돌며 배치별 손실을 누적 평균",
              code: "for i, (input_batch, target_batch) in enumerate(data_loader):\n    total_loss += calc_loss_batch(input_batch, target_batch, model, device)\nreturn total_loss / len(data_loader)"
            },
            {
              name: "evaluate_model(model, train_loader, val_loader, device, eval_iter)",
              kind: "평가함수",
              inShape: "Loaders",
              outShape: "(train_loss, val_loss)",
              isExam: false,
              desc: "model.eval()과 torch.no_grad() 상태에서 train/val 손실 측정",
              code: "model.eval()\nwith torch.no_grad():\n    train_loss = calc_loss_loader(train_loader, model, device, num_batches=eval_iter)\n    val_loss = calc_loss_loader(val_loader, model, device, num_batches=eval_iter)"
            }
          ]
        },
        {
          icon: "🔤",
          title: "Branch B: 자기회귀 텍스트 생성 루프 (Ch 4 & Ch 5)",
          meta: "2개 함수 · Greedy & Sampling",
          nodes: [
            {
              name: "generate_text_simple(model, idx, max_new_tokens, context_size)",
              kind: "🔥 2026-09 기출",
              inShape: "idx: [B, T]",
              outShape: "idx: [B, T + N]",
              isExam: true,
              desc: "마지막 시점 로짓[:, -1, :]의 argmax를 추출하여 자기회귀적으로 이어붙임",
              code: "idx_cond = idx[:, -context_size:]\nwith torch.no_grad():\n    logits = model(idx_cond)\nlogits = logits[:, -1, :]\nidx_next = torch.argmax(logits, dim=-1, keepdim=True)\nidx = torch.cat((idx, idx_next), dim=1)"
            },
            {
              name: "generate(model, idx, max_new_tokens, context_size, temperature, top_k)",
              kind: "고급생성",
              inShape: "idx: [B, T]",
              outShape: "idx: [B, T + N]",
              isExam: false,
              desc: "온도 스케일링(temperature) 및 Top-k 필터링 후 multinomial 확률적 샘플링",
              code: "logits = logits[:, -1, :] / temperature\ntop_logits, _ = torch.topk(logits, top_k)\nlogits[logits < top_logits[:, -1:]] = -torch.inf\nprobs = torch.softmax(logits, dim=-1)\nidx_next = torch.multinomial(probs, num_samples=1)"
            }
          ]
        },
        {
          icon: "🤖",
          title: "Branch C: GPTModel 백본 신경망 & Attention (Ch 4 & Ch 3)",
          meta: "5개 클래스 · Transformer Block Stack",
          nodes: [
            {
              name: "GPTModel.forward(in_idx)",
              kind: "메인모델",
              inShape: "[B, T]",
              outShape: "logits: [B, T, V]",
              isExam: true,
              desc: "tok_emb + pos_emb 결합 → TransformerBlock N회 통과 → final_norm → out_head",
              code: "tok_embeds = self.tok_emb(in_idx)\npos_embeds = self.pos_emb(torch.arange(seq_len, device=in_idx.device))\nx = self.drop_emb(tok_embeds + pos_embeds)\nx = self.trf_blocks(x)\nx = self.final_norm(x)\nlogits = self.out_head(x)"
            },
            {
              name: "TransformerBlock.forward(x)",
              kind: "블록모듈",
              inShape: "[B, T, D]",
              outShape: "[B, T, D]",
              isExam: true,
              desc: "Pre-LayerNorm 잔차 연결 2회: Attention 잔차 + FeedForward 잔차",
              code: "# 1. MultiHeadAttention 잔차\nx = x + self.drop_shortcut(self.att(self.norm1(x)))\n# 2. FeedForward 잔차\nx = x + self.drop_shortcut(self.ff(self.norm2(x)))\nreturn x"
            },
            {
              name: "MultiHeadAttention.forward(x)",
              kind: "🔥 2026-09 기출",
              inShape: "[B, T, D]",
              outShape: "[B, T, D]",
              isExam: true,
              desc: "W_key/query/value 헤드 분할 view & transpose(1, 2) → Causal Masking → Softmax → out_proj",
              code: "keys = self.W_key(x).view(b, num_tokens, self.num_heads, self.head_dim).transpose(1, 2)\nqueries = self.W_query(x).view(b, num_tokens, self.num_heads, self.head_dim).transpose(1, 2)\nvalues = self.W_value(x).view(b, num_tokens, self.num_heads, self.head_dim).transpose(1, 2)\nattn_scores = queries @ keys.transpose(2, 3)\nattn_scores.masked_fill_(self.mask.bool()[:num_tokens, :num_tokens], -torch.inf)\nattn_weights = torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)\ncontext_vec = (self.dropout(attn_weights) @ values).transpose(1, 2).contiguous().view(b, num_tokens, self.d_out)\nreturn self.out_proj(context_vec)"
            },
            {
              name: "FeedForward.forward(x)",
              kind: "FFN블록",
              inShape: "[B, T, D]",
              outShape: "[B, T, D]",
              isExam: false,
              desc: "Linear(D, 4D) 확장 → GELU 비선형 활성화 → Linear(4D, D) 복원",
              code: "self.layers = nn.Sequential(\n    nn.Linear(cfg['emb_dim'], 4 * cfg['emb_dim']),\n    GELU(),\n    nn.Linear(4 * cfg['emb_dim'], cfg['emb_dim'])\n)\nreturn self.layers(x)"
            },
            {
              name: "LayerNorm.forward(x)",
              kind: "정규화",
              inShape: "[B, T, D]",
              outShape: "[B, T, D]",
              isExam: false,
              desc: "마지막 차원 기준 mean, var(unbiased=False) 표준화 및 scale(gamma), shift(beta) 가산",
              code: "mean = x.mean(dim=-1, keepdim=True)\nvar = x.var(dim=-1, keepdim=True, unbiased=False)\nnorm_x = (x - mean) / torch.sqrt(var + self.eps)\nreturn self.scale * norm_x + self.shift"
            }
          ]
        },
        {
          icon: "📦",
          title: "Branch D: 데이터셋 및 토크나이저 파이프라인 (Ch 1 & Ch 2)",
          meta: "3개 컴포넌트 · Dataset & Vector Space",
          nodes: [
            {
              name: "GPTDatasetV1.__init__(txt, tokenizer, max_length, stride)",
              kind: "데이터셋",
              inShape: "Raw Text",
              outShape: "Chunk Pairs",
              isExam: true,
              desc: "슬라이딩 윈도우로 1칸 시프트된 (input, target) 쌍 생성",
              code: "input_chunk = token_ids[i : i + max_length]\ntarget_chunk = token_ids[i + 1 : i + max_length + 1]\nself.input_ids.append(torch.tensor(input_chunk))\nself.target_ids.append(torch.tensor(target_chunk))"
            },
            {
              name: "create_dataloader_v1(txt, batch_size, max_length, stride, drop_last)",
              kind: "로더생성",
              inShape: "txt 문자열",
              outShape: "DataLoader",
              isExam: false,
              desc: "tiktoken 토크나이저 초기화 및 GPTDatasetV1 기반 DataLoader 빌드",
              code: "tokenizer = tiktoken.get_encoding('gpt2')\ndataset = GPTDatasetV1(txt, tokenizer, max_length, stride)\nreturn DataLoader(dataset, batch_size=batch_size, shuffle=shuffle, drop_last=drop_last)"
            },
            {
              name: "cos_sim(u, v)",
              kind: "벡터공간",
              inShape: "u: [D], v: [D]",
              outShape: "scalar [-1, 1]",
              isExam: false,
              desc: "두 벡터 간의 내적을 L2 Norm(유클리드 크기)의 곱으로 나눈 코사인 유사도",
              code: "dot = torch.dot(u, v)\nnorm_u = torch.norm(u, p=2)\nnorm_v = torch.norm(v, p=2)\nreturn dot / (norm_u * norm_v)"
            }
          ]
        },
        {
          icon: "🏷️",
          title: "Branch E: 분류 파인튜닝 & LoRA 어댑터 (Ch 6)",
          meta: "3개 구현체 · Low-Rank Adaptation",
          nodes: [
            {
              name: "분류 헤드 교체 및 파라미터 동결 (Freeze Backbone)",
              kind: "파인튜닝",
              inShape: "GPTModel",
              outShape: "분류기 모델",
              isExam: true,
              desc: "out_head를 Linear(emb_dim, num_classes)로 교체하고 백본 파라미터 requires_grad=False 설정",
              code: "model.out_head = torch.nn.Linear(cfg['emb_dim'], num_classes)\nfor param in model.parameters():\n    param.requires_grad = False\n# 마지막 블록과 헤드만 Unfreeze\nfor param in model.trf_blocks[-1].parameters(): param.requires_grad = True\nfor param in model.out_head.parameters(): param.requires_grad = True"
            },
            {
              name: "LoRALayer.forward(x)",
              kind: "LoRA레이어",
              inShape: "[B, T, in_dim]",
              outShape: "[B, T, out_dim]",
              isExam: true,
              desc: "A(Kaiming 균등)와 B(0 초기화)의 저순위 분해 및 (alpha / rank) 스케일링",
              code: "# self.A: [in_dim, rank], self.B: [rank, out_dim]\nlora = (x @ self.A @ self.B) * (self.alpha / self.rank)\nreturn lora"
            },
            {
              name: "LinearWithLoRA.forward(x)",
              kind: "합성선형층",
              inShape: "[B, T, in_dim]",
              outShape: "[B, T, out_dim]",
              isExam: false,
              desc: "기존 동결된 linear(x) 출력에 LoRA 저순위 분해 적응값 가산",
              code: "return self.linear(x) + self.lora(x)"
            }
          ]
        },
        {
          icon: "🎯",
          title: "Branch F: 지시어 미세조정(SFT) & DPO 피드백 정렬 (Ch 7)",
          meta: "3개 함수 · Instruction Tuning & DPO",
          nodes: [
            {
              name: "custom_collate_fn(batch, pad_token_id, ignore_index=-100)",
              kind: "콜레이트",
              inShape: "list[token_list]",
              outShape: "inputs, targets: [B, T_max]",
              isExam: true,
              desc: "배치 최대 길이에 맞춰 EOS/PAD 패딩 후, targets의 패딩 위치를 -100(ignore_index)으로 마스킹",
              code: "padded = item + [pad_token_id] * (batch_max_length - len(item))\ninputs = torch.tensor(padded[:-1])\ntargets = torch.tensor(padded[1:])\nmask = targets == pad_token_id\ntargets[mask] = ignore_index\nreturn torch.stack(inputs_lst), torch.stack(targets_lst)"
            },
            {
              name: "compute_dpo_loss(model_chosen, model_rejected, ref_chosen, ref_rejected, beta=0.1)",
              kind: "DPO손실",
              inShape: "4개 Logprobs: [B]",
              outShape: "scalar Loss",
              isExam: true,
              desc: "정책 모델과 참조 모델의 선호/비선호 로그확률비 마진에 대한 -logsigmoid 손실",
              code: "model_logratios = model_chosen_logprobs - model_rejected_logprobs\nreference_logratios = reference_chosen_logprobs - reference_rejected_logprobs\nlogits = model_logratios - reference_logratios\nlosses = -torch.nn.functional.logsigmoid(beta * logits).mean()\nreturn losses"
            },
            {
              name: "compute_logprobs(logits, labels, selection_mask=None)",
              kind: "로그확률추출",
              inShape: "logits: [B, T, V]",
              outShape: "[B]",
              isExam: false,
              desc: "F.log_softmax 후 torch.gather로 레이어 시프트된 레이블 토큰의 로그확률만 추출",
              code: "log_probs = F.log_softmax(logits, dim=-1)\nselected = torch.gather(log_probs[:, :-1, :], dim=2, index=labels[:, 1:].unsqueeze(2)).squeeze(2)\nreturn selected.sum(dim=-1)"
            }
          ]
        }
      ]
    },
    rag: {
      subject: "RAG",
      title: "과목 2. RAG · 검색 증강 생성 종합 통합 파이프라인 트리",
      desc: "Document 로딩, 청킹, VectorStoreIndex, 하이브리드 RRF, Cross-Encoder 리랭킹, CRAG 평가, FastMCP 연동까지 전체 흐름을 확인하세요.",
      branches: [
        {
          icon: "📥",
          title: "Step 1: 데이터 수집 및 청킹 (Ingestion & Chunking)",
          meta: "2개 컴포넌트",
          nodes: [
            {
              name: "SimpleDirectoryReader(input_dir).load_data()",
              kind: "문서로드",
              inShape: "파일 경로",
              outShape: "list[Document]",
              isExam: true,
              desc: "디렉터리 내의 텍스트/문서 파일을 LlamaIndex Document 객체로 적재",
              code: "documents = SimpleDirectoryReader(input_dir='./data').load_data()"
            },
            {
              name: "SentenceSplitter(chunk_size=512, chunk_overlap=50)",
              kind: "청크분할",
              inShape: "list[Document]",
              outShape: "list[BaseNode]",
              isExam: true,
              desc: "문맥 보존을 위해 문장 경계를 존중하며 적정 크기로 토큰 청크 분할",
              code: "splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)\nnodes = splitter.get_nodes_from_documents(documents)"
            }
          ]
        },
        {
          icon: "🔍",
          title: "Step 2: 인덱싱 및 하이브리드 검색 (Indexing & Retrieval)",
          meta: "3개 컴포넌트 · Dense + Sparse RRF",
          nodes: [
            {
              name: "VectorStoreIndex.from_documents(documents)",
              kind: "🔥 2026-09 기출",
              inShape: "list[Document]",
              outShape: "VectorStoreIndex",
              isExam: true,
              desc: "임베딩 모델을 사용하여 텍스트 노드를 고차원 벡터 공간에 색인",
              code: "index = VectorStoreIndex.from_documents(documents)"
            },
            {
              name: "QueryFusionRetriever(retrievers=[dense, sparse], mode='reciprocal_rerank')",
              kind: "하이브리드검색",
              inShape: "QueryBundle",
              outShape: "list[NodeWithScore]",
              isExam: true,
              desc: "Dense(VectorStoreIndex)와 Sparse(BM25Retriever)를 RRF(Reciprocal Rank Fusion)로 종합",
              code: "retriever = QueryFusionRetriever(\n    retrievers=[index.as_retriever(similarity_top_k=10), BM25Retriever.from_defaults(nodes=nodes, similarity_top_k=10)],\n    similarity_top_k=5,\n    mode='reciprocal_rerank'\n)"
            },
            {
              name: "SentenceTransformerRerank(top_n=3, model='cross-encoder/ms-marco-MiniLM-L-6-v2')",
              kind: "리랭커",
              inShape: "후보 노드군",
              outShape: "상위 3개 노드",
              isExam: false,
              desc: "Cross-Encoder를 통해 질문과 문맥의 상호관계를 정밀 채점하여 재정렬",
              code: "reranker = SentenceTransformerRerank(top_n=3, model='cross-encoder/ms-marco-MiniLM-L-6-v2')\nfinal_nodes = reranker.postprocess_nodes(nodes, query_bundle)"
            }
          ]
        },
        {
          icon: "⚖️",
          title: "Step 3: CRAG 평가 & MCP 에이전트 도구 연동 (Evaluation & Agent)",
          meta: "3개 컴포넌트",
          nodes: [
            {
              name: "RelevancyEvaluator & FaithfulnessEvaluator",
              kind: "CRAG평가",
              inShape: "Query & Response",
              outShape: "Score / Passing",
              isExam: true,
              desc: "관련성(Relevancy)과 충실성(Faithfulness, 환각 방지) 평가 후 임계값 미달 시 웹/폴백 검색 트리거",
              code: "rel_eval = RelevancyEvaluator().evaluate(query=q, response=res)\nfaith_eval = FaithfulnessEvaluator().evaluate_response(response=res)"
            },
            {
              name: "prompt_generator(query, top_k_chunks)",
              kind: "🔥 2026-09 기출",
              inShape: "query, chunks",
              outShape: "str (Prompt)",
              isExam: true,
              desc: "검색된 상위 K개 청크의 텍스트를 참조 포맷으로 결합하여 프롬프트 완성",
              code: "references = ''\nfor chunk_id, chunk in enumerate(top_k_chunks):\n    references += f'Reference [{chunk_id + 1}](Citation: {chunk.metadata[\"source\"]})\\n'\nreferences = references[:MAX_CONTEXT_REFERENCES_LENGTH]"
            },
            {
              name: "FastMCP & ClientSession.call_tool(tool_name, arguments)",
              kind: "MCP도구호출",
              inShape: "tool arguments",
              outShape: "Tool Result",
              isExam: false,
              desc: "표준 MCP 프로토콜을 통해 외부 데이터베이스 및 계산 도구를 안전하게 호출",
              code: "async with client_session as session:\n    result = await session.call_tool('fetch_weather', {'location': 'Seoul'})\nreturn result"
            }
          ]
        }
      ]
    },
    data: {
      subject: "Data",
      title: "과목 3. Data Model · 시계열 & 추천시스템 종합 통합 파이프라인 트리",
      desc: "MinMaxScaler, Sliding Window, Conv1D, LSTM, Seq2Seq 인코더-디코더, NGCF, NCF, BPR Loss까지 확인하세요.",
      branches: [
        {
          icon: "📈",
          title: "Part 1: 시계열 단일 예측 (Sliding Window & Conv1D/LSTM)",
          meta: "3개 컴포넌트",
          nodes: [
            {
              name: "create_sequences(data, seq_length)",
              kind: "슬라이딩윈도우",
              inShape: "[N, F]",
              outShape: "X: [B, T, F], y: [B, 1]",
              isExam: true,
              desc: "시계열 데이터를 입력 길이만큼 슬라이싱하고 바로 다음 시점을 레이블로 생성",
              code: "for i in range(len(data) - seq_length):\n    features.append(data[i : i + seq_length])\n    labels.append(data[i + seq_length, 0])\nreturn np.array(features, dtype=np.float32), np.array(labels, dtype=np.float32)"
            },
            {
              name: "LSTMModel.forward(x) / Conv1DModel.forward(x)",
              kind: "시계열백본",
              inShape: "LSTM: [B, T, F] / Conv1D: [B, F, T]",
              outShape: "pred: [B, 1]",
              isExam: true,
              desc: "LSTM은 마지막 시점[:, -1, :]을 슬라이싱하여 FC 통과 / Conv1D는 채널축 transpose(1, 2) 필수",
              code: "# LSTM 마지막 시점 슬라이싱\nout, _ = self.lstm(x)\npred = self.fc(out[:, -1, :])\nreturn pred"
            },
            {
              name: "nn.MSELoss()(preds, targets)",
              kind: "회귀손실",
              inShape: "preds: [B, 1], targets: [B, 1]",
              outShape: "scalar MSE",
              isExam: true,
              desc: "시계열 연속 예측값과 실제 수치 간의 평균 제곱 오차 계산",
              code: "criterion = nn.MSELoss()\nloss = criterion(preds, targets)\nrmse = torch.sqrt(loss)"
            }
          ]
        },
        {
          icon: "🔄",
          title: "Part 2: 시계열 Seq2Seq (EncoderRNN & DecoderRNN)",
          meta: "2개 컴포넌트 · Auto-regressive Unrolling",
          nodes: [
            {
              name: "create_enc_dec_sequences(data, sequence_length)",
              kind: "🔥 2026-09 기출",
              inShape: "[N, F]",
              outShape: "enc_in, dec_in: [B, T, F]",
              isExam: true,
              desc: "인코더 입력 구간과 디코더 타깃 구간으로 윈도우 슬라이싱",
              code: "features.append(data[i : i + sequence_length])\nlabels.append(data[i + sequence_length : i + 2 * sequence_length])\nreturn np.array(features, dtype=np.float32), np.array(labels, dtype=np.float32)"
            },
            {
              name: "RNNRNN.forward(source, target, teacher_forcing_ratio)",
              kind: "🔥 2026-09 기출",
              inShape: "source: [B, T_src, F]",
              outShape: "outputs: [B, T_tgt, F]",
              isExam: true,
              desc: "인코더 은닉상태 h_n을 디코더 h_0로 전달하고 source 마지막 스텝부터 스텝별 autoregressive 루프",
              code: "_, h = self.encoder(source)\ninput = source[:, -1, :].unsqueeze(1)\noutputs = []\nfor t in range(target_len):\n    out, h = self.decoder(input, h)\n    outputs.append(out)\n    input = out # 다음 스텝 입력으로 재사용\nreturn torch.stack(outputs, dim=1)"
            }
          ]
        },
        {
          icon: "🛒",
          title: "Part 3: 추천 시스템 (NGCF, NCF & BPR Ranking Loss)",
          meta: "3개 컴포넌트 · Graph & Neural CF",
          nodes: [
            {
              name: "NGCF.forward(norm_adj, user_emb, item_emb)",
              kind: "그래프추천",
              inShape: "norm_adj, emb",
              outShape: "final_emb: [N, (L+1)*D]",
              isExam: true,
              desc: "라플라시안 정규화 D^(-1/2) A D^(-1/2) 기반 메시지 전달 및 레이어 임베딩 concat",
              code: "e_list = [all_emb]\nfor layer in self.layers:\n    all_emb = layer(norm_adj, all_emb)\n    e_list.append(all_emb)\nreturn torch.cat(e_list, dim=1)"
            },
            {
              name: "NCF.forward(user_id, item_id)",
              kind: "신경망추천",
              inShape: "user_idx, item_idx",
              outShape: "score: [B, 1]",
              isExam: true,
              desc: "GMF 원소별 곱(Hadamard) 브랜치와 MLP 결합(concat) 브랜치를 최종 선형층에서 융합",
              code: "gmf = self.user_emb_gmf(u) * self.item_emb_gmf(i)\nmlp = self.mlp(torch.cat([self.user_emb_mlp(u), self.item_emb_mlp(i)], dim=-1))\nreturn self.affine_output(torch.cat([gmf, mlp], dim=-1))"
            },
            {
              name: "BPRLoss: -torch.log(torch.sigmoid(pos_scores - neg_scores)).mean()",
              kind: "랭킹손실",
              inShape: "pos, neg scores",
              outShape: "scalar Loss",
              isExam: true,
              desc: "양성 아이템 점수와 음성 아이템 점수 차이에 대한 -logsigmoid 평균 손실",
              code: "diff = pos_scores - neg_scores\nloss = -torch.nn.functional.logsigmoid(diff).mean()\nreturn loss"
            }
          ]
        }
      ]
    },
    vision: {
      subject: "Vision",
      title: "과목 4. Vision · CNN & Vision Transformer 종합 통합 파이프라인 트리",
      desc: "CIFAR-10 데이터 전처리, ResNet18 잔차 연결, ViT 패치 임베딩 및 PreNorm Transformer, DETR, U-Net까지 확인하세요.",
      branches: [
        {
          icon: "📥",
          title: "Step 1: 이미지 전처리 및 증강 (Data Transforms)",
          meta: "1개 파이프라인",
          nodes: [
            {
              name: "transforms.Compose([...])",
              kind: "🔥 2026-09 기출",
              inShape: "PIL Image",
              outShape: "Tensor [3, 32, 32]",
              isExam: true,
              desc: "RandomCrop(32, padding=4), RandomHorizontalFlip(), ToTensor(), Normalize(CIFAR10_MEAN, CIFAR10_STD)",
              code: "train_tfms = T.Compose([\n    T.RandomCrop(32, padding=4),\n    T.RandomHorizontalFlip(),\n    T.ToTensor(),\n    T.Normalize(CIFAR10_MEAN, CIFAR10_STD)\n])"
            }
          ]
        },
        {
          icon: "🧱",
          title: "Step 2: ResNet18 CNN 잔차 백본 (Residual Connections)",
          meta: "2개 컴포넌트",
          nodes: [
            {
              name: "BasicBlock.forward(x)",
              kind: "잔차블록",
              inShape: "[B, C, H, W]",
              outShape: "[B, C_out, H_out, W_out]",
              isExam: true,
              desc: "F(x) = conv2(bn2(relu(conv1(bn1(x))))) 계산 후 shortcut(x)를 더하고 최종 ReLU 통과",
              code: "out = self.conv1(x)\nout = self.bn1(out)\nout = self.relu(out)\nout = self.conv2(out)\nout = self.bn2(out)\nout += self.shortcut(x)\nout = self.relu(out)\nreturn out"
            },
            {
              name: "ResNet18.forward(x)",
              kind: "CNN모델",
              inShape: "[B, 3, 32, 32]",
              outShape: "logits: [B, 10]",
              isExam: false,
              desc: "초기 Conv-BN-ReLU-MaxPool 후 layer1~4(BasicBlock 스택) → AdaptiveAvgPool2d((1, 1)) → fc",
              code: "out = self.layer1(x)\nout = self.layer2(out)\nout = self.layer3(out)\nout = self.layer4(out)\nout = self.avgpool(out)\nout = torch.flatten(out, 1)\nreturn self.fc(out)"
            }
          ]
        },
        {
          icon: "👁️",
          title: "Step 3: Vision Transformer (ViT) 아키텍처",
          meta: "3개 컴포넌트 · Patch Embedding & PreNorm",
          nodes: [
            {
              name: "ViT Patch Embedding & [CLS] Token",
              kind: "패치임베딩",
              inShape: "[B, C, H, W]",
              outShape: "[B, N+1, D]",
              isExam: true,
              desc: "이미지를 패치로 분할해 Linear projection 후 [CLS] 토큰 prepend 및 pos_embedding 가산",
              code: "x = self.to_patch_embedding(img) # [B, N, D]\ncls_tokens = repeat(self.cls_token, '1 1 d -> b 1 d', b=b)\nx = torch.cat((cls_tokens, x), dim=1)\nx += self.pos_embedding[:, :(n + 1)]"
            },
            {
              name: "ViT PreNorm Residual (pair & Transformer Blocks)",
              kind: "🔥 2026-09 기출",
              inShape: "[B, N+1, D]",
              outShape: "[B, N+1, D]",
              isExam: true,
              desc: "pair(t) 튜플 유틸 및 Pre-Norm 어텐션 잔차(attn(x) + x)와 피드포워드 잔차(ff(x) + x)",
              code: "def pair(t): return t if isinstance(t, tuple) else (t, t)\n# Pre-Norm 잔차 연결\nx = attn(x) + x\nx = ff(x) + x\nreturn x"
            },
            {
              name: "ViT Classification Head",
              kind: "분류헤드",
              inShape: "[B, N+1, D]",
              outShape: "logits: [B, num_classes]",
              isExam: true,
              desc: "Transformer 블록을 통과한 출력 중 0번 [CLS] 토큰 벡터만 추출하여 MLP Head에 전달",
              code: "cls_out = x[:, 0]\nlogits = self.mlp_head(cls_out)\nreturn logits"
            }
          ]
        }
      ]
    },
    "on-device": {
      subject: "On-Device AI",
      title: "과목 5. On-Device AI · 3대 경량화 기법 종합 통합 파이프라인 트리",
      desc: "채널 단위/가중치 프루닝, INT8 양자화 스케일 & 영점 계산, 지식 증류 온도 스케일링 KL 손실까지 확인하세요.",
      branches: [
        {
          icon: "✂️",
          title: "Part 1: 가지치기 (Pruning - Magnitude & Channel)",
          meta: "2개 컴포넌트",
          nodes: [
            {
              name: "prune_weight_channel_level(model, layer, sparsity)",
              kind: "🔥 2026-09 기출",
              inShape: "Conv2d weight [C_out, C_in, k, k]",
              outShape: "Pruned Masked Weight",
              isExam: true,
              desc: "채널 L1-norm(dim=(0, 2, 3), keepdim=True)으로 중요도 계산 후 하위 채널 0 마스킹 및 expand_as",
              code: "num_pruned_channels = round(num_channels * sparsity)\nimportance = weight.abs().sum(dim=(0, 2, 3), keepdim=True)\nthreshold = torch.kthvalue(importance.view(-1), k=num_pruned_channels).values\nmask = importance > threshold\nweight.data *= mask.expand_as(weight)"
            },
            {
              name: "prune.remove(module, 'weight')",
              kind: "영구적용",
              inShape: "Pruned module",
              outShape: "Clean module",
              isExam: false,
              desc: "PyTorch prune 모듈의 reparametrization(weight_orig, weight_mask)을 제거하고 실제 가중치로 병합",
              code: "prune.remove(layer, 'weight')"
            }
          ]
        },
        {
          icon: "📉",
          title: "Part 2: 양자화 (Quantization - Scale, Zero-Point & PTQ)",
          meta: "3개 컴포넌트",
          nodes: [
            {
              name: "get_quantization_scale_and_zero_point(fp_min, fp_max, q_min, q_max)",
              kind: "🔥 2026-09 기출",
              inShape: "FP32 min/max, INT8 min/max",
              outShape: "scale (float), zero_point (int)",
              isExam: true,
              desc: "S = (fp_max - fp_min) / (q_max - q_min) 및 Z = round(q_min - fp_min / S)",
              code: "scale = (fp_max - fp_min) / (quantized_max - quantized_min)\nzero_point = round(quantized_min - fp_min / scale)\nzero_point = max(quantized_min, min(quantized_max, zero_point))\nreturn scale, zero_point"
            },
            {
              name: "quantize(x, scale, zero_point) & dequantize(q, scale, zero_point)",
              kind: "변환공식",
              inShape: "x: FP32 Tensor",
              outShape: "q: INT8 Tensor",
              isExam: true,
              desc: "q = clamp(round(x / scale) + zero_point, q_min, q_max) / x_approx = (q - zero_point) * scale",
              code: "q = torch.clamp(torch.round(x / scale) + zero_point, q_min, q_max)\nx_approx = (q - zero_point) * scale"
            },
            {
              name: "PyTorch PTQ: prepare(model) → calibrate → convert(model)",
              kind: "PTQ파이프라인",
              inShape: "FP32 Model",
              outShape: "Quantized Model",
              isExam: false,
              desc: "모델 가중치와 활성화 함수 사이에 관측기(Observer)를 삽입해 통계 수집 후 INT8로 영구 변환",
              code: "model.qconfig = torch.ao.quantization.get_default_qconfig('fbgemm')\nprepared = torch.ao.quantization.prepare(model)\n# 보정(Calibration) 실행...\nquantized = torch.ao.quantization.convert(prepared)"
            }
          ]
        },
        {
          icon: "🎓",
          title: "Part 3: 지식 증류 (Knowledge Distillation - Teacher & Student)",
          meta: "2개 컴포넌트",
          nodes: [
            {
              name: "DistillationLoss: alpha * T^2 * KLDivLoss + (1 - alpha) * CrossEntropy",
              kind: "증류손실",
              inShape: "student_logits, teacher_logits, targets",
              outShape: "scalar Loss",
              isExam: true,
              desc: "온도 T로 스케일링된 soft label에 대해 T^2 가중치의 KLDivLoss와 원본 target에 대한 CrossEntropy 손실 결합",
              code: "soft_teacher = F.softmax(teacher_logits / T, dim=-1)\nsoft_student = F.log_softmax(student_logits / T, dim=-1)\nloss_kd = F.kl_div(soft_student, soft_teacher, reduction='batchmean') * (T * T)\nloss_ce = F.cross_entropy(student_logits, targets)\nloss = alpha * loss_kd + (1.0 - alpha) * loss_ce"
            },
            {
              name: "teacher.eval() & torch.no_grad()",
              kind: "동결평가",
              inShape: "Teacher Model",
              outShape: "Frozen Output",
              isExam: true,
              desc: "교사 모델은 기울기 계산을 하지 않고 순전파 출력(logits)만 부드러운 확률 분포로 제공",
              code: "teacher.eval()\nwith torch.no_grad():\n    teacher_logits = teacher(inputs)"
            }
          ]
        }
      ]
    }
  };

  function renderTree(container, data) {
    if (!container || !data) return;
    const branchesHtml = data.branches.map((b, bIdx) => {
      const nodesHtml = b.nodes.map((n, nIdx) => {
        return `
          <details class="tree-node ${n.isExam ? "is-exam-hit" : ""}" open>
            <summary class="tree-node-summary">
              <div class="tree-node-left">
                <span class="node-kind-badge ${n.isExam ? "exam" : ""}">${n.kind}</span>
                <span class="node-name">${escapeHtml(n.name)}</span>
              </div>
              <div class="node-shapes">
                <span class="shape-pill in">In: ${escapeHtml(n.inShape)}</span>
                <span class="shape-pill out">Out: ${escapeHtml(n.outShape)}</span>
              </div>
            </summary>
            <div class="tree-node-detail">
              <p>${escapeHtml(n.desc)}</p>
              <div class="tree-code-wrap">
                <pre class="tree-code"><code>${escapeHtml(n.code)}</code></pre>
                <button class="tree-copy-btn" type="button" data-copy-code="${escapeHtml(n.code)}">복사</button>
              </div>
            </div>
          </details>`;
      }).join("");

      return `
        <details class="tree-branch" open data-branch-index="${bIdx}">
          <summary class="tree-branch-summary">
            <div class="tree-branch-title">
              <span class="tree-icon">${b.icon}</span>
              <span>${escapeHtml(b.title)}</span>
            </div>
            <span class="tree-branch-meta">${escapeHtml(b.meta)}</span>
          </summary>
          <div class="tree-nodes">
            ${nodesHtml}
          </div>
        </details>`;
    }).join("");

    container.innerHTML = `
      <section class="pipeline-tree-card" id="pipelineTreeCard">
        <header class="pipeline-tree-header">
          <div>
            <span class="tree-badge">INTERACTIVE PIPELINE TREE</span>
            <h2>🌳 ${escapeHtml(data.title)}</h2>
            <p>${escapeHtml(data.desc)}</p>
          </div>
          <div class="pipeline-tree-actions">
            <input type="text" class="pipeline-tree-search" id="pipelineTreeSearch" placeholder="함수/키워드 검색..." />
            <button id="treeExpandAll" class="quiet-button" type="button">모두 펼치기</button>
            <button id="treeCollapseAll" class="quiet-button" type="button">모두 접기</button>
            <button id="treeExamFilter" class="quiet-button" type="button">🔥 기출만</button>
          </div>
        </header>
        <div class="pipeline-tree-body" id="pipelineTreeBody">
          ${branchesHtml}
        </div>
      </section>`;

    // Event Listeners
    const card = container.querySelector("#pipelineTreeCard");
    const expandBtn = card.querySelector("#treeExpandAll");
    const collapseBtn = card.querySelector("#treeCollapseAll");
    const examFilterBtn = card.querySelector("#treeExamFilter");
    const searchInput = card.querySelector("#pipelineTreeSearch");

    expandBtn?.addEventListener("click", () => {
      card.querySelectorAll("details").forEach(d => d.open = true);
    });

    collapseBtn?.addEventListener("click", () => {
      card.querySelectorAll(".tree-node").forEach(d => d.open = false);
    });

    let examOnly = false;
    examFilterBtn?.addEventListener("click", () => {
      examOnly = !examOnly;
      examFilterBtn.classList.toggle("active", examOnly);
      card.querySelectorAll(".tree-node").forEach(node => {
        if (examOnly) {
          node.style.display = node.classList.contains("is-exam-hit") ? "" : "none";
        } else {
          node.style.display = "";
        }
      });
    });

    searchInput?.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      card.querySelectorAll(".tree-node").forEach(node => {
        const text = node.textContent.toLowerCase();
        node.style.display = (!q || text.includes(q)) ? "" : "none";
        if (q && text.includes(q)) {
          node.open = true;
          const parentBranch = node.closest(".tree-branch");
          if (parentBranch) parentBranch.open = true;
        }
      });
    });

    card.querySelectorAll("[data-copy-code]").forEach(btn => {
      btn.addEventListener("click", () => {
        const code = btn.getAttribute("data-copy-code");
        navigator.clipboard.writeText(code).then(() => {
          const original = btn.textContent;
          btn.textContent = "복사됨!";
          setTimeout(() => btn.textContent = original, 1500);
        });
      });
    });
  }

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function detectSubject() {
    const p = location.pathname.toLowerCase();
    const t = document.title.toLowerCase();
    if (p.includes("/llm") || t.includes("llm")) return "llm";
    if (p.includes("/rag") || t.includes("rag")) return "rag";
    if (p.includes("/data") || t.includes("data")) return "data";
    if (p.includes("/vision") || t.includes("vision")) return "vision";
    if (p.includes("/on-device") || t.includes("on-device") || t.includes("ondevice")) return "on-device";
    return "llm";
  }

  function init() {
    const studyPanel = document.querySelector("#studyPanel");
    if (!studyPanel) return;

    let container = document.querySelector("#pipelineTreeContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "pipelineTreeContainer";
      const overview = studyPanel.querySelector("#notebookOverview");
      if (overview) {
        studyPanel.insertBefore(container, overview);
      } else {
        studyPanel.prepend(container);
      }
    }

    const key = detectSubject();
    const data = SUBJECT_TREES[key];
    if (data) {
      renderTree(container, data);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
