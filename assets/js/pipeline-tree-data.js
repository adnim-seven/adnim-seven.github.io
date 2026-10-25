/**
 * AI Specialist True Top-Down Nested Dependency Tree Data
 * Every caller function branches directly down into its callee sub-functions.
 */
window.PIPELINE_TREE_DATA = {
  "llm": {
    "subject": "01 · LLM",
    "title": "과목 1. LLM · 최상위 함수 탑다운 의존성 트리",
    "desc": "최상위 학습 루프, 텍스트 생성 루프, 파인튜닝/DPO 함수에서 시작하여 하위 백본, 어텐션, 텐서 연산으로 뻗어나가는 진짜 Top-Down 호출 트리입니다.",
    "root": {
      "title": "TOP-LEVEL CALL ENTRIES (최상위 실행 진입점 3가지)",
      "methods": "1. train_model_simple (사전학습) | 2. generate_text_simple (텍스트 생성) | 3. compute_dpo_loss (선호 정렬)"
    },
    "top_down_trees": [
      {
        "name": "🔥 [진입점 1] train_model_simple(model, train_loader, val_loader, optimizer, device, num_epochs, ...)",
        "kind": "최상위 학습 루프 (Ch 5)",
        "inShape": "train_loader: [B, T]",
        "outShape": "학습 가중치 갱신",
        "isExam": true,
        "children": [
          {
            "name": "model.train()",
            "kind": "모드 설정",
            "inShape": "-",
            "outShape": "드롭아웃/BN 활성화",
            "isExam": false
          },
          {
            "name": "optimizer.zero_grad()",
            "kind": "기울기 초기화",
            "inShape": "-",
            "outShape": "grad = 0",
            "isExam": true
          },
          {
            "name": "🔥 loss = calc_loss_batch(input_batch, target_batch, model, device)",
            "kind": "배치 손실 계산 (Ch 5)",
            "inShape": "inputs: [B, T], targets: [B, T]",
            "outShape": "scalar Loss",
            "isExam": true,
            "children": [
              {
                "name": "input_batch, target_batch = input_batch.to(device), target_batch.to(device)",
                "kind": "GPU 전송",
                "inShape": "CPU Tensor",
                "outShape": "Device Tensor",
                "isExam": false
              },
              {
                "name": "🔥 logits = model(input_batch) ➔ GPTModel.forward(in_idx)",
                "kind": "백본 신경망 순전파 (Ch 4)",
                "inShape": "in_idx: [B, T]",
                "outShape": "logits: [B, T, vocab_size]",
                "isExam": true,
                "children": [
                  {
                    "name": "x = self.drop_emb(tok_embeds + pos_embeds)",
                    "kind": "임베딩 결합 (Ch 2)",
                    "inShape": "in_idx: [B, T]",
                    "outShape": "x: [B, T, emb_dim]",
                    "isExam": true,
                    "children": [
                      {
                        "name": "tok_embeds = self.tok_emb(in_idx)",
                        "kind": "토큰 임베딩",
                        "inShape": "[B, T]",
                        "outShape": "[B, T, D]"
                      },
                      {
                        "name": "pos_embeds = self.pos_emb(torch.arange(seq_len, device=device))",
                        "kind": "위치 임베딩",
                        "inShape": "[T]",
                        "outShape": "[T, D]"
                      }
                    ]
                  },
                  {
                    "name": "🔥 x = self.trf_blocks(x) ➔ TransformerBlock.forward(x) (× n_layers)",
                    "kind": "트랜스포머 블록 누적 (Ch 4)",
                    "inShape": "x: [B, T, D]",
                    "outShape": "x: [B, T, D]",
                    "isExam": true,
                    "children": [
                      {
                        "name": "🔥 [서브블록 1] x = x + self.drop_shortcut(self.att(self.norm1(x)))",
                        "kind": "어텐션 잔차 연결 (Ch 4)",
                        "inShape": "x: [B, T, D]",
                        "outShape": "x: [B, T, D]",
                        "isExam": true,
                        "children": [
                          {
                            "name": "norm1_out = self.norm1(x) ➔ LayerNorm.forward",
                            "kind": "Pre-LayerNorm",
                            "inShape": "[B, T, D]",
                            "outShape": "[B, T, D]"
                          },
                          {
                            "name": "🔥 att_out = self.att(norm1_out) ➔ MultiHeadAttention.forward(x)",
                            "kind": "🔥 2026-09 기출 (Ch 3)",
                            "inShape": "x: [B, T, D]",
                            "outShape": "context_vec: [B, T, D]",
                            "isExam": true,
                            "children": [
                              {
                                "name": "keys = self.W_key(x).view(b, T, num_heads, head_dim).transpose(1, 2)",
                                "kind": "헤드 분할 K",
                                "inShape": "[B, T, D]",
                                "outShape": "[B, H, T, Dh]"
                              },
                              {
                                "name": "queries = self.W_query(x).view(b, T, num_heads, head_dim).transpose(1, 2)",
                                "kind": "헤드 분할 Q",
                                "inShape": "[B, T, D]",
                                "outShape": "[B, H, T, Dh]"
                              },
                              {
                                "name": "values = self.W_value(x).view(b, T, num_heads, head_dim).transpose(1, 2)",
                                "kind": "헤드 분할 V",
                                "inShape": "[B, T, D]",
                                "outShape": "[B, H, T, Dh]"
                              },
                              {
                                "name": "attn_scores = queries @ keys.transpose(2, 3)",
                                "kind": "Dot-Product",
                                "inShape": "Q, K",
                                "outShape": "[B, H, T, T]"
                              },
                              {
                                "name": "attn_scores.masked_fill_(self.mask.bool()[:T, :T], -torch.inf)",
                                "kind": "Causal Mask",
                                "inShape": "[B, H, T, T]",
                                "outShape": "[B, H, T, T]"
                              },
                              {
                                "name": "attn_weights = torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)",
                                "kind": "Softmax",
                                "inShape": "[B, H, T, T]",
                                "outShape": "[B, H, T, T]"
                              },
                              {
                                "name": "context_vec = (dropout(attn_weights) @ values).transpose(1, 2)",
                                "kind": "가중합 병합",
                                "inShape": "Weights, V",
                                "outShape": "[B, T, H, Dh]"
                              },
                              {
                                "name": "context_vec = context_vec.contiguous().view(b, T, self.d_out)",
                                "kind": "차원 복원",
                                "inShape": "[B, T, H, Dh]",
                                "outShape": "[B, T, D]"
                              },
                              {
                                "name": "return self.out_proj(context_vec)",
                                "kind": "출력 선형 사영",
                                "inShape": "[B, T, D]",
                                "outShape": "[B, T, D]"
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "name": "[서브블록 2] x = x + self.drop_shortcut(self.ff(self.norm2(x)))",
                        "kind": "피드포워드 잔차 연결 (Ch 4)",
                        "inShape": "x: [B, T, D]",
                        "outShape": "x: [B, T, D]",
                        "isExam": true,
                        "children": [
                          {
                            "name": "norm2_out = self.norm2(x) ➔ LayerNorm.forward",
                            "kind": "Pre-LayerNorm",
                            "inShape": "[B, T, D]",
                            "outShape": "[B, T, D]"
                          },
                          {
                            "name": "ff_out = self.ff(norm2_out) ➔ FeedForward.forward(x)",
                            "kind": "FFN 블록 (Ch 4)",
                            "inShape": "[B, T, D]",
                            "outShape": "[B, T, D]",
                            "isExam": false,
                            "children": [
                              {
                                "name": "Linear(cfg['emb_dim'], 4 * cfg['emb_dim'])",
                                "kind": "4배 확장",
                                "inShape": "[B, T, D]",
                                "outShape": "[B, T, 4D]"
                              },
                              {
                                "name": "GELU()",
                                "kind": "GELU 활성화",
                                "inShape": "[B, T, 4D]",
                                "outShape": "[B, T, 4D]"
                              },
                              {
                                "name": "Linear(4 * cfg['emb_dim'], cfg['emb_dim'])",
                                "kind": "원래 차원 복원",
                                "inShape": "[B, T, 4D]",
                                "outShape": "[B, T, D]"
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "name": "x = self.final_norm(x) ➔ LayerNorm.forward(x)",
                    "kind": "최종 정규화 (Ch 4)",
                    "inShape": "[B, T, D]",
                    "outShape": "[B, T, D]",
                    "isExam": false
                  },
                  {
                    "name": "logits = self.out_head(x) ➔ Linear(emb_dim, vocab_size, bias=False)",
                    "kind": "출력 어휘 사영 (Ch 4)",
                    "inShape": "[B, T, D]",
                    "outShape": "[B, T, vocab_size]",
                    "isExam": true
                  }
                ]
              },
              {
                "name": "🔥 loss = torch.nn.functional.cross_entropy(logits.flatten(0, 1), target_batch.flatten())",
                "kind": "1차원 손실 계산 (Ch 5)",
                "inShape": "logits: [B*T, V], targets: [B*T]",
                "outShape": "scalar Loss",
                "isExam": true
              }
            ]
          },
          {
            "name": "loss.backward()",
            "kind": "역전파",
            "inShape": "scalar Loss",
            "outShape": "파라미터 .grad 계산",
            "isExam": true
          },
          {
            "name": "optimizer.step()",
            "kind": "가중치 갱신",
            "inShape": ".grad",
            "outShape": "w = w - lr * grad",
            "isExam": true
          },
          {
            "name": "(데이터 공급원): DataLoader ➔ GPTDatasetV1 ➔ tiktoken",
            "kind": "입력 파이프라인 (Ch 2)",
            "inShape": "Raw Text",
            "outShape": "input_batch, target_batch [B, T]",
            "isExam": true,
            "children": [
              {
                "name": "token_ids = tokenizer.encode(txt)",
                "kind": "BPE 토큰화",
                "inShape": "str",
                "outShape": "list[int]"
              },
              {
                "name": "input_chunk = token_ids[i : i + max_length]",
                "kind": "입력 슬라이스",
                "inShape": "list[int]",
                "outShape": "[T]"
              },
              {
                "name": "target_chunk = token_ids[i + 1 : i + max_length + 1]",
                "kind": "타깃 (우측 1칸 시프트)",
                "inShape": "list[int]",
                "outShape": "[T]"
              }
            ]
          }
        ]
      },
      {
        "name": "🔥 [진입점 2] generate_text_simple(model, idx, max_new_tokens, context_size)",
        "kind": "최상위 텍스트 생성 루프 (Ch 4)",
        "inShape": "idx: [B, T]",
        "outShape": "idx: [B, T + max_new_tokens]",
        "isExam": true,
        "children": [
          {
            "name": "for _ in range(max_new_tokens):",
            "kind": "자기회귀 반복",
            "inShape": "토큰 1개씩 확장",
            "outShape": "시퀀스 길이 누적",
            "isExam": false,
            "children": [
              {
                "name": "idx_cond = idx[:, -context_size:]",
                "kind": "문맥 길이 슬라이싱",
                "inShape": "[B, T_curr]",
                "outShape": "[B, min(T, C)]"
              },
              {
                "name": "with torch.no_grad(): logits = model(idx_cond) ➔ GPTModel.forward",
                "kind": "모델 순전파 (위 백본 호출)",
                "inShape": "[B, T_cond]",
                "outShape": "[B, T_cond, V]"
              },
              {
                "name": "🔥 logits = logits[:, -1, :]",
                "kind": "마지막 토큰 로짓 추출",
                "inShape": "[B, T_cond, V]",
                "outShape": "[B, V]"
              },
              {
                "name": "🔥 idx_next = torch.argmax(logits, dim=-1, keepdim=True)",
                "kind": "그리디 다음 토큰 선택",
                "inShape": "[B, V]",
                "outShape": "[B, 1]"
              },
              {
                "name": "🔥 idx = torch.cat((idx, idx_next), dim=1)",
                "kind": "토큰 연쇄 병합",
                "inShape": "[B, T], [B, 1]",
                "outShape": "[B, T + 1]"
              }
            ]
          }
        ]
      },
      {
        "name": "🔥 [진입점 3] compute_dpo_loss(model_chosen_logprobs, model_rejected_logprobs, ref_chosen_logprobs, ref_rejected_logprobs, beta=0.1)",
        "kind": "최상위 DPO 손실 계산 (Ch 7)",
        "inShape": "4개 Logprobs: [B]",
        "outShape": "scalar Loss",
        "isExam": true,
        "children": [
          {
            "name": "(로그확률 공급원): compute_logprobs(logits, labels)",
            "kind": "조건부 로그확률",
            "inShape": "logits: [B, T, V], labels: [B, T]",
            "outShape": "[B]",
            "children": [
              {
                "name": "log_probs = F.log_softmax(logits, dim=-1)",
                "kind": "LogSoftmax",
                "inShape": "[B, T, V]",
                "outShape": "[B, T, V]"
              },
              {
                "name": "selected = torch.gather(log_probs[:, :-1, :], dim=2, index=labels[:, 1:].unsqueeze(2)).squeeze(2)",
                "kind": "정답 토큰 추출",
                "inShape": "gather",
                "outShape": "[B, T-1]"
              },
              {
                "name": "return selected.sum(dim=-1)",
                "kind": "시퀀스 로그확률합",
                "inShape": "[B, T-1]",
                "outShape": "[B]"
              }
            ]
          },
          {
            "name": "model_logratios = model_chosen_logprobs - model_rejected_logprobs",
            "kind": "정책 모델 확률비",
            "inShape": "[B], [B]",
            "outShape": "[B]"
          },
          {
            "name": "reference_logratios = reference_chosen_logprobs - reference_rejected_logprobs",
            "kind": "참조 모델 확률비",
            "inShape": "[B], [B]",
            "outShape": "[B]"
          },
          {
            "name": "logits = model_logratios - reference_logratios",
            "kind": "마진 (Margin)",
            "inShape": "[B], [B]",
            "outShape": "[B]"
          },
          {
            "name": "🔥 losses = -torch.nn.functional.logsigmoid(beta * logits).mean()",
            "kind": "★DPO 핵심 손실",
            "inShape": "[B]",
            "outShape": "scalar"
          }
        ]
      },
      {
        "name": "🔥 [진입점 4] LinearWithLoRA.forward(x) ➔ LoRA 파인튜닝 (Ch 6)",
        "kind": "최상위 LoRA 선형 변환 (Ch 6)",
        "inShape": "x: [B, T, in_dim]",
        "outShape": "[B, T, out_dim]",
        "isExam": true,
        "children": [
          {
            "name": "base_out = self.linear(x)  # linear.weight.requires_grad = False (동결)",
            "kind": "사전학습 가중치",
            "inShape": "[B, T, in_dim]",
            "outShape": "[B, T, out_dim]"
          },
          {
            "name": "🔥 lora_out = self.lora(x) ➔ LoRALayer.forward(x)",
            "kind": "저순위 적응 변환",
            "inShape": "x: [B, T, in_dim]",
            "outShape": "[B, T, out_dim]",
            "isExam": true,
            "children": [
              {
                "name": "self.A = nn.Parameter(empty(in_dim, rank)) ➔ kaiming_uniform_",
                "kind": "A 행렬 초기화",
                "inShape": "[in_dim, rank]",
                "outShape": "A"
              },
              {
                "name": "self.B = nn.Parameter(zeros(rank, out_dim))",
                "kind": "B 행렬 (0 초기화)",
                "inShape": "[rank, out_dim]",
                "outShape": "B"
              },
              {
                "name": "🔥 return (x @ self.A @ self.B) * (self.alpha / self.rank)",
                "kind": "저순위 곱 & 스케일링",
                "inShape": "x @ A @ B",
                "outShape": "[B, T, out_dim]"
              }
            ]
          },
          {
            "name": "return base_out + lora_out",
            "kind": "최종 출력 합성",
            "inShape": "base + lora",
            "outShape": "[B, T, out_dim]"
          }
        ]
      }
    ]
  },
  "rag": {
    "subject": "02 · RAG",
    "title": "과목 2. RAG · 최상위 질의/검색 탑다운 의존성 트리",
    "desc": "최상위 query_engine.query() 및 FastMCP 에이전트 실행에서 시작하여 하이브리드 검색, Cross-Encoder 리랭킹, 청킹으로 뻗어나가는 Top-Down 트리입니다.",
    "root": {
      "title": "TOP-LEVEL CALL ENTRIES (최상위 실행 진입점 2가지)",
      "methods": "1. query_engine.query (RAG 질의응답) | 2. ClientSession.call_tool (MCP 도구 연동)"
    },
    "top_down_trees": [
      {
        "name": "🔥 [진입점 1] response = query_engine.query(query_str)",
        "kind": "최상위 RAG 질의 (Task 1 & 2)",
        "inShape": "query_str: str",
        "outShape": "Response (근거 기반 답변)",
        "isExam": true,
        "children": [
          {
            "name": "🔥 retrieved_nodes = retriever.retrieve(query_bundle)",
            "kind": "상위 K개 노드 검색",
            "inShape": "query_bundle",
            "outShape": "list[NodeWithScore]",
            "isExam": true,
            "children": [
              {
                "name": "QueryFusionRetriever.retrieve() ➔ RRF 하이브리드 검색",
                "kind": "Dense + Sparse 융합",
                "inShape": "query_bundle",
                "outShape": "list[NodeWithScore]",
                "isExam": true,
                "children": [
                  {
                    "name": "dense_retriever.retrieve() ➔ VectorStoreIndex.as_retriever()",
                    "kind": "밀집 벡터 검색 (코사인 유사도)",
                    "inShape": "query_bundle",
                    "outShape": "top_k nodes",
                    "isExam": true,
                    "children": [
                      {
                        "name": "🔥 VectorStoreIndex.from_documents(documents)",
                        "kind": "🔥 2026-09 기출",
                        "inShape": "list[Document]",
                        "outShape": "VectorStoreIndex"
                      },
                      {
                        "name": "SentenceSplitter(chunk_size=512, chunk_overlap=50)",
                        "kind": "문장 청킹",
                        "inShape": "Document",
                        "outShape": "Nodes"
                      },
                      {
                        "name": "SimpleDirectoryReader(input_dir).load_data()",
                        "kind": "문서 수집",
                        "inShape": "dir path",
                        "outShape": "list[Document]"
                      }
                    ]
                  },
                  {
                    "name": "sparse_retriever.retrieve() ➔ BM25Retriever.from_defaults()",
                    "kind": "희소 키워드 검색 (TF-IDF/BM25)",
                    "inShape": "query_bundle",
                    "outShape": "top_k nodes",
                    "isExam": false
                  },
                  {
                    "name": "RRF(Reciprocal Rank Fusion) 순위 결합",
                    "kind": "RRF 순위 공식",
                    "inShape": "rank_dense, rank_sparse",
                    "outShape": "score = 1 / (60 + rank)",
                    "isExam": false
                  }
                ]
              },
              {
                "name": "SentenceTransformerRerank.postprocess_nodes(candidate_nodes, query_bundle)",
                "kind": "Cross-Encoder 재정렬",
                "inShape": "candidate_nodes (20개)",
                "outShape": "final_nodes (상위 3개)",
                "isExam": true
              }
            ]
          },
          {
            "name": "🔥 prompt = prompt_generator(query, top_k_chunks)",
            "kind": "🔥 2026-09 기출 (Task 1)",
            "inShape": "query, chunks",
            "outShape": "str (Prompt)",
            "isExam": true,
            "children": [
              {
                "name": "for chunk_id, chunk in enumerate(top_k_chunks): references += f'Reference [{chunk_id+1}]...'",
                "kind": "청크 참조 포맷",
                "inShape": "chunks",
                "outShape": "references"
              },
              {
                "name": "references = references[:MAX_CONTEXT_REFERENCES_LENGTH]",
                "kind": "문맥 길이 제한",
                "inShape": "references",
                "outShape": "truncated"
              }
            ]
          },
          {
            "name": "response = llm.predict(prompt)",
            "kind": "LLM 답변 생성",
            "inShape": "prompt",
            "outShape": "response",
            "isExam": false
          },
          {
            "name": "CRAG 평가: RelevancyEvaluator & FaithfulnessEvaluator",
            "kind": "CRAG 품질 검증",
            "inShape": "Query, Response",
            "outShape": "Passing / Fallback",
            "isExam": true,
            "children": [
              {
                "name": "RelevancyEvaluator.evaluate(query, response)",
                "kind": "관련성 채점",
                "inShape": "q, res",
                "outShape": "rel_score"
              },
              {
                "name": "FaithfulnessEvaluator.evaluate_response(response)",
                "kind": "충실성 (환각 검증)",
                "inShape": "res",
                "outShape": "faith_score"
              }
            ]
          }
        ]
      },
      {
        "name": "🔥 [진입점 2] await session.call_tool(tool_name, arguments)",
        "kind": "최상위 MCP 도구 호출",
        "inShape": "tool_name, arguments",
        "outShape": "Tool Execution Result",
        "isExam": true,
        "children": [
          {
            "name": "FastMCP Server 도구 등록: @mcp.tool()",
            "kind": "도구 데코레이터",
            "inShape": "python func",
            "outShape": "MCP Tool Schema"
          },
          {
            "name": "ClientSession(read_stream, write_stream)",
            "kind": "클라이언트 세션",
            "inShape": "stdio streams",
            "outShape": "ClientSession"
          }
        ]
      }
    ]
  },
  "data": {
    "subject": "03 · DATA",
    "title": "과목 3. Data Model · 최상위 시계열 & 추천 탑다운 의존성 트리",
    "desc": "시계열 단일 예측 학습 루프, Seq2Seq 순전파 루프, BPR 랭킹 추천 학습 루프에서 하위 텐서 연산으로 이어지는 Top-Down 트리입니다.",
    "root": {
      "title": "TOP-LEVEL CALL ENTRIES (최상위 실행 진입점 3가지)",
      "methods": "1. 시계열 예측 루프 | 2. RNNRNN Seq2Seq 순전파 | 3. train_bpr (NGCF & NCF)"
    },
    "top_down_trees": [
      {
        "name": "🔥 [진입점 1] 시계열 지도학습: loss = criterion(model(X), y)",
        "kind": "최상위 시계열 예측 (ts_practice)",
        "inShape": "X: [B, T, F], y: [B, 1]",
        "outShape": "scalar MSE Loss",
        "isExam": true,
        "children": [
          {
            "name": "🔥 (입력 데이터 생성): create_sequences(data, seq_length)",
            "kind": "슬라이딩 윈도우 분할",
            "inShape": "data: [N, F]",
            "outShape": "X: [B, T, F], y: [B, 1]",
            "isExam": true,
            "children": [
              {
                "name": "scaler.fit_transform(raw_df) ➔ MinMaxScaler",
                "kind": "정규화",
                "inShape": "Raw Data",
                "outShape": "[0, 1] 스케일링"
              },
              {
                "name": "features.append(data[i : i + seq_length])",
                "kind": "입력 구간 [T, F]",
                "inShape": "data",
                "outShape": "features"
              },
              {
                "name": "labels.append(data[i + seq_length, 0])",
                "kind": "타깃 시점 [1]",
                "inShape": "data",
                "outShape": "labels"
              }
            ]
          },
          {
            "name": "🔥 pred = model(X) (LSTM 또는 Conv1D)",
            "kind": "시계열 백본 순전파",
            "inShape": "X: [B, T, F]",
            "outShape": "pred: [B, 1]",
            "isExam": true,
            "children": [
              {
                "name": "LSTMModel: out, _ = self.lstm(X) ➔ pred = self.fc(out[:, -1, :])",
                "kind": "LSTM 마지막 시점 슬라이싱",
                "inShape": "X: [B, T, F]",
                "outShape": "pred: [B, 1]",
                "isExam": true
              },
              {
                "name": "Conv1DModel: x = x.transpose(1, 2) ➔ relu(conv1d(x)) ➔ fc",
                "kind": "Conv1D 채널축 전치 [B, C, L]",
                "inShape": "X: [B, T, F]",
                "outShape": "pred: [B, 1]",
                "isExam": true
              }
            ]
          },
          {
            "name": "loss = nn.MSELoss()(pred, y)",
            "kind": "평균 제곱 오차",
            "inShape": "pred, y",
            "outShape": "MSE Loss"
          }
        ]
      },
      {
        "name": "🔥 [진입점 2] outputs = RNNRNN.forward(source, target, teacher_forcing_ratio)",
        "kind": "🔥 2026-09 기출 (Seq2Seq)",
        "inShape": "source: [B, T_src, F], target: [B, T_tgt, F]",
        "outShape": "outputs: [B, T_tgt, F]",
        "isExam": true,
        "children": [
          {
            "name": "🔥 (데이터 생성): create_enc_dec_sequences(data, sequence_length)",
            "kind": "🔥 2026-09 기출",
            "inShape": "data: [N, F]",
            "outShape": "features, labels: [B, T, F]",
            "isExam": true,
            "children": [
              {
                "name": "features.append(data[i : i + sequence_length])",
                "kind": "인코더 구간",
                "inShape": "data",
                "outShape": "[T, F]"
              },
              {
                "name": "labels.append(data[i + sequence_length : i + 2 * sequence_length])",
                "kind": "디코더 구간",
                "inShape": "data",
                "outShape": "[T, F]"
              },
              {
                "name": "return np.array(features, dtype=np.float32), np.array(labels, dtype=np.float32)",
                "kind": "float32 변환",
                "inShape": "list",
                "outShape": "ndarray"
              }
            ]
          },
          {
            "name": "🔥 _, h = self.encoder(source) ➔ EncoderRNN.forward",
            "kind": "인코더 은닉상태 추출",
            "inShape": "source: [B, T_src, F]",
            "outShape": "h: [1, B, hidden_size]",
            "isExam": true
          },
          {
            "name": "🔥 input = source[:, -1, :].unsqueeze(1) (디코더 초기 입력)",
            "kind": "마지막 시점 주입",
            "inShape": "[B, F]",
            "outShape": "[B, 1, F]",
            "isExam": true
          },
          {
            "name": "🔥 for t in range(target_len): out, h = self.decoder(input, h); outputs.append(out); input = out",
            "kind": "디코더 자기회귀 순전파",
            "inShape": "input, h",
            "outShape": "out: [B, 1, F], h",
            "isExam": true
          },
          {
            "name": "🔥 return torch.stack(outputs, dim=1)",
            "kind": "시퀀스 축 스택 결합",
            "inShape": "list of [B, 1, F]",
            "outShape": "[B, T_tgt, F]",
            "isExam": true
          }
        ]
      },
      {
        "name": "🔥 [진입점 3] BPR 추천 랭킹 손실: loss = -logsigmoid(pos_scores - neg_scores).mean()",
        "kind": "최상위 추천 학습 (RecSys)",
        "inShape": "u, pos_i, neg_j",
        "outShape": "scalar BPR Loss",
        "isExam": true,
        "children": [
          {
            "name": "NGCF 경로: norm_adj @ E @ W ➔ 다중 레이어 임베딩 concat",
            "kind": "그래프 신경망 추천",
            "inShape": "A_tilde, E",
            "outShape": "E_final: [N, (L+1)*D]",
            "isExam": true,
            "children": [
              {
                "name": "norm_adj = D^(-1/2) * (A + I) * D^(-1/2)",
                "kind": "대칭 라플라시안 정규화",
                "inShape": "Adj Matrix",
                "outShape": "norm_adj"
              },
              {
                "name": "e_list = [all_emb]; all_emb = layer(norm_adj, all_emb); e_list.append(all_emb)",
                "kind": "메시지 전달",
                "inShape": "E_l",
                "outShape": "E_l+1"
              },
              {
                "name": "return torch.cat(e_list, dim=1)",
                "kind": "레이어 Concat",
                "inShape": "list",
                "outShape": "[N, (L+1)*D]"
              }
            ]
          },
          {
            "name": "NCF 경로: affine_output(torch.cat([gmf_out, mlp_out], dim=-1))",
            "kind": "신경망 협업 필터링",
            "inShape": "user_id, item_id",
            "outShape": "score: [B, 1]",
            "isExam": true,
            "children": [
              {
                "name": "gmf = self.user_emb_gmf(u) * self.item_emb_gmf(i)",
                "kind": "GMF 원소별 곱",
                "inShape": "[B, D], [B, D]",
                "outShape": "[B, D]"
              },
              {
                "name": "mlp = self.mlp(torch.cat([self.user_emb_mlp(u), self.item_emb_mlp(i)], dim=-1))",
                "kind": "MLP 다층 퍼셉트론",
                "inShape": "[B, 2D]",
                "outShape": "[B, D]"
              }
            ]
          },
          {
            "name": "diff = pos_scores - neg_scores ➔ -F.logsigmoid(diff).mean()",
            "kind": "BPR 랭킹 목적함수",
            "inShape": "diff",
            "outShape": "scalar Loss"
          }
        ]
      }
    ]
  },
  "vision": {
    "subject": "04 · VISION",
    "title": "과목 4. Vision · 최상위 비전 모델 탑다운 의존성 트리",
    "desc": "학습 루프 loss.backward()에서 시작하여 ResNet18 잔차 연결, ViT 패치/어텐션 백본, 데이터 증강으로 내려가는 Top-Down 트리입니다.",
    "root": {
      "title": "TOP-LEVEL CALL ENTRIES (최상위 실행 진입점 2가지)",
      "methods": "1. ResNet18 학습 루프 | 2. ViT Transformer 학습 루프"
    },
    "top_down_trees": [
      {
        "name": "🔥 [진입점 1] ResNet18 학습: loss = criterion(model(images), targets)",
        "kind": "최상위 CNN 분류 (ResNet18)",
        "inShape": "images: [B, 3, 32, 32], targets: [B]",
        "outShape": "scalar Loss",
        "isExam": true,
        "children": [
          {
            "name": "🔥 (데이터 전처리): transforms.Compose([...])",
            "kind": "🔥 2026-09 기출",
            "inShape": "PIL Image",
            "outShape": "[3, 32, 32] 정규화 텐서",
            "isExam": true,
            "children": [
              {
                "name": "T.RandomCrop(32, padding=4)",
                "kind": "랜덤 크롭",
                "inShape": "img",
                "outShape": "cropped"
              },
              {
                "name": "T.RandomHorizontalFlip()",
                "kind": "좌우 반전",
                "inShape": "img",
                "outShape": "flipped"
              },
              {
                "name": "T.ToTensor()",
                "kind": "텐서화",
                "inShape": "PIL [0, 255]",
                "outShape": "Tensor [0.0, 1.0]"
              },
              {
                "name": "T.Normalize(CIFAR10_MEAN, CIFAR10_STD)",
                "kind": "정규화",
                "inShape": "Tensor",
                "outShape": "Normalized"
              }
            ]
          },
          {
            "name": "logits = model(images) ➔ ResNet18.forward(x)",
            "kind": "CNN 백본 순전파",
            "inShape": "images: [B, 3, 32, 32]",
            "outShape": "logits: [B, num_classes]",
            "isExam": true,
            "children": [
              {
                "name": "x = relu(bn1(conv1(x)))",
                "kind": "초기 Conv-BN-ReLU",
                "inShape": "[B, 3, 32, 32]",
                "outShape": "[B, 64, 32, 32]"
              },
              {
                "name": "🔥 layer1~4 ➔ BasicBlock.forward(x) 누적",
                "kind": "잔차 블록 (Residual Addition)",
                "inShape": "x: [B, C_in, H, W]",
                "outShape": "out: [B, C_out, H, W]",
                "isExam": true,
                "children": [
                  {
                    "name": "out = relu(bn1(conv1(x)))",
                    "kind": "Conv1 + BN + ReLU",
                    "inShape": "x",
                    "outShape": "out"
                  },
                  {
                    "name": "out = bn2(conv2(out))",
                    "kind": "Conv2 + BN",
                    "inShape": "out",
                    "outShape": "out"
                  },
                  {
                    "name": "🔥 out += self.shortcut(x)",
                    "kind": "스킵 연결 가산 (Shortcut)",
                    "inShape": "out, x",
                    "outShape": "residual sum"
                  },
                  {
                    "name": "out = relu(out)",
                    "kind": "최종 활성화",
                    "inShape": "sum",
                    "outShape": "out"
                  }
                ]
              },
              {
                "name": "out = self.avgpool(out) ➔ AdaptiveAvgPool2d((1, 1))",
                "kind": "글로벌 평균 풀링",
                "inShape": "[B, 512, 4, 4]",
                "outShape": "[B, 512, 1, 1]"
              },
              {
                "name": "return self.fc(torch.flatten(out, 1))",
                "kind": "선형 분류 헤드",
                "inShape": "[B, 512]",
                "outShape": "[B, 10]"
              }
            ]
          },
          {
            "name": "loss = F.cross_entropy(logits, targets)",
            "kind": "교차 엔트로피",
            "inShape": "logits, targets",
            "outShape": "scalar Loss"
          }
        ]
      },
      {
        "name": "🔥 [진입점 2] ViT 학습: loss = criterion(vit_model(images), targets)",
        "kind": "최상위 ViT 분류 (Vision Transformer)",
        "inShape": "images: [B, 3, 32, 32], targets: [B]",
        "outShape": "scalar Loss",
        "isExam": true,
        "children": [
          {
            "name": "x = to_patch_embedding(img) + cls_tokens + pos_embedding",
            "kind": "패치 임베딩 & [CLS] 결합",
            "inShape": "img: [B, C, H, W]",
            "outShape": "x: [B, N+1, D]",
            "isExam": true,
            "children": [
              {
                "name": "x = rearrange(img, 'b c (h p1) (w p2) -> b (h w) (p1 p2 c)') ➔ Linear",
                "kind": "패치 분할 사영",
                "inShape": "Image",
                "outShape": "[B, N, D]"
              },
              {
                "name": "cls_tokens = repeat(self.cls_token, '1 1 d -> b 1 d', b=b)",
                "kind": "[CLS] 복제",
                "inShape": "[1, 1, D]",
                "outShape": "[B, 1, D]"
              },
              {
                "name": "x = torch.cat((cls_tokens, x), dim=1) + self.pos_embedding",
                "kind": "위치 임베딩 가산",
                "inShape": "cls + patches",
                "outShape": "[B, N+1, D]"
              }
            ]
          },
          {
            "name": "🔥 x = Transformer(x) (Pre-Norm Residual Blocks)",
            "kind": "🔥 2026-09 기출",
            "inShape": "[B, N+1, D]",
            "outShape": "[B, N+1, D]",
            "isExam": true,
            "children": [
              {
                "name": "def pair(t): return t if isinstance(t, tuple) else (t, t)",
                "kind": "pair 튜플 유틸",
                "inShape": "t",
                "outShape": "(t, t)"
              },
              {
                "name": "🔥 x = attn(x) + x",
                "kind": "어텐션 잔차 연결",
                "inShape": "x",
                "outShape": "attn_out + x"
              },
              {
                "name": "🔥 x = ff(x) + x",
                "kind": "피드포워드 잔차 연결",
                "inShape": "x",
                "outShape": "ff_out + x"
              }
            ]
          },
          {
            "name": "logits = self.mlp_head(x[:, 0])",
            "kind": "[CLS] 토큰 분류 헤드",
            "inShape": "x[:, 0]: [B, D]",
            "outShape": "logits: [B, num_classes]",
            "isExam": true
          }
        ]
      }
    ]
  },
  "on-device": {
    "subject": "05 · ON-DEVICE",
    "title": "과목 5. On-Device AI · 최상위 3대 경량화 탑다운 의존성 트리",
    "desc": "채널 프루닝 마스크 생성 루프, 양자화 PTQ 변환 루프, 지식 증류 손실 계산에서 하위 텐서 연산으로 이어지는 Top-Down 트리입니다.",
    "root": {
      "title": "TOP-LEVEL CALL ENTRIES (최상위 실행 진입점 3가지)",
      "methods": "1. prune_weight_channel_level (가지치기) | 2. get_quantization_scale_and_zero_point (양자화) | 3. DistillationLoss (지식증류)"
    },
    "top_down_trees": [
      {
        "name": "🔥 [진입점 1] prune_weight_channel_level(model, layer, sparsity)",
        "kind": "🔥 2026-09 기출 (채널 프루닝)",
        "inShape": "Conv2d weight [C_out, C_in, k, k]",
        "outShape": "Pruned Masked Module",
        "isExam": true,
        "children": [
          {
            "name": "🔥 num_pruned_channels = round(num_channels * sparsity)",
            "kind": "제거 채널 수 계산",
            "inShape": "num_channels, sparsity",
            "outShape": "int k"
          },
          {
            "name": "🔥 importance = weight.abs().sum(dim=(0, 2, 3), keepdim=True)",
            "kind": "채널별 L1-Norm 중요도",
            "inShape": "[C_out, C_in, k, k]",
            "outShape": "[1, C_in, 1, 1]"
          },
          {
            "name": "threshold = torch.kthvalue(importance.view(-1), k=num_pruned_channels).values",
            "kind": "k번째 임계값 추출",
            "inShape": "importance",
            "outShape": "scalar threshold"
          },
          {
            "name": "mask = importance > threshold",
            "kind": "이진 마스크 생성",
            "inShape": "importance",
            "outShape": "bool mask [1, C_in, 1, 1]"
          },
          {
            "name": "🔥 weight.data *= mask.expand_as(weight)",
            "kind": "가중치 0 마스킹",
            "inShape": "mask, weight",
            "outShape": "masked weight"
          },
          {
            "name": "prune.remove(layer, 'weight')",
            "kind": "영구 가중치 병합",
            "inShape": "Pruned Module",
            "outShape": "Clean Model"
          }
        ]
      },
      {
        "name": "🔥 [진입점 2] 양자화 변환: q = quantize(x, scale, zero_point)",
        "kind": "🔥 2026-09 기출 (INT8 양자화)",
        "inShape": "FP32 x",
        "outShape": "INT8 q",
        "isExam": true,
        "children": [
          {
            "name": "🔥 (파라미터 산출): scale, zero_point = get_quantization_scale_and_zero_point(fp_min, fp_max, q_min, q_max)",
            "kind": "스케일 & 영점 계산",
            "inShape": "FP32/INT8 min/max",
            "outShape": "scale (float), zero_point (int)",
            "isExam": true,
            "children": [
              {
                "name": "🔥 scale = (fp_max - fp_min) / (quantized_max - quantized_min)",
                "kind": "스케일 공식 S",
                "inShape": "min/max",
                "outShape": "scale (float)"
              },
              {
                "name": "🔥 zero_point = round(quantized_min - fp_min / scale)",
                "kind": "영점 공식 Z",
                "inShape": "min, scale",
                "outShape": "zero_point (int)"
              },
              {
                "name": "zero_point = max(q_min, min(q_max, zero_point))",
                "kind": "클램핑 보정",
                "inShape": "Z",
                "outShape": "clamped Z"
              }
            ]
          },
          {
            "name": "q = torch.clamp(torch.round(x / scale) + zero_point, q_min, q_max)",
            "kind": "양자화 변환식",
            "inShape": "FP32 x",
            "outShape": "INT8 q"
          },
          {
            "name": "x_approx = (q - zero_point) * scale",
            "kind": "역양자화 변환식",
            "inShape": "INT8 q",
            "outShape": "FP32 x_approx"
          },
          {
            "name": "PyTorch PTQ: prepare(model) ➔ 보정(Calibration) ➔ convert(model)",
            "kind": "공식 PTQ 파이프라인",
            "inShape": "FP32 Model",
            "outShape": "Quantized INT8 Model"
          }
        ]
      },
      {
        "name": "🔥 [진입점 3] 지식 증류: loss = alpha * soft_loss + (1 - alpha) * hard_loss",
        "kind": "최상위 지식 증류 루프",
        "inShape": "student_logits, teacher_logits, targets",
        "outShape": "scalar Total Loss",
        "isExam": true,
        "children": [
          {
            "name": "teacher.eval() & with torch.no_grad(): teacher_logits = teacher(inputs)",
            "kind": "교사 모델 동결 순전파",
            "inShape": "inputs",
            "outShape": "teacher_logits"
          },
          {
            "name": "student_logits = student(inputs)",
            "kind": "학생 모델 순전파",
            "inShape": "inputs",
            "outShape": "student_logits"
          },
          {
            "name": "🔥 soft_loss = F.kl_div(F.log_softmax(S/T), F.softmax(T/T), reduction='batchmean') * (T * T)",
            "kind": "온도 T 스케일 KL 손실",
            "inShape": "logits, T",
            "outShape": "soft_loss",
            "isExam": true
          },
          {
            "name": "hard_loss = F.cross_entropy(student_logits, targets)",
            "kind": "원래 타깃 정답 손실",
            "inShape": "student_logits, y",
            "outShape": "hard_loss"
          },
          {
            "name": "return alpha * soft_loss + (1 - alpha) * hard_loss",
            "kind": "최종 손실 가중합",
            "inShape": "soft, hard",
            "outShape": "Total Loss"
          }
        ]
      }
    ]
  }
};
