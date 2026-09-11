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
        "why": "embedding index용 정수 Tensor입니다.",
        "alternatives": []
      },
      {
        "key": "B",
        "points": 2,
        "answer": "input_ids = input_ids.unsqueeze(0).to(model_device)",
        "why": "[T]에 batch 축을 추가해 [1,T]로 만들고 model과 device를 맞춥니다.",
        "alternatives": []
      },
      {
        "key": "C",
        "points": 1,
        "answer": "embeddings = embedding_layer(input_ids)",
        "why": "index가 embedding vector로 바뀝니다.",
        "alternatives": []
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
        "alternatives": [],
        "why": "입력에서 평균을 빼 중심을 0으로 만들고 표준편차 sqrt(var+eps)로 나눕니다. eps는 분산이 0일 때의 나눗셈 불안정을 막습니다.\n재도전: 평균 제거와 표준편차 나눗셈을 순서대로 적어 다시 작성하세요."
      }
    ]
  },
  {
    "id": "1-3",
    "subject": "LLM",
    "title": "GPT forward 흐름",
    "source": "Chapter_4_Excercise_GPT.ipynb · 강의 코드 기반 재구성",
    "prompt": "Embedding 결합, Transformer block 통과, logits 계산의 완성된 세 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: [B,T] → [B,T,D] → [B,T,D] → [B,T,V]",
    "code": "tok_embeds = self.tok_emb(in_idx)\npos_embeds = self.pos_emb(torch.arange(seq_len, device=in_idx.device))\n# TODO: 토큰 의미와 위치 정보 합산\n{{A}}\nx = self.drop_emb(x)\n# TODO: Transformer blocks 통과\n{{B}}\nx = self.final_norm(x)\n# TODO: vocab logits 계산\n{{C}}",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "x = tok_embeds + pos_embeds",
        "alternatives": [],
        "why": "토큰과 위치를 더해 [B,T,D]를 만든 뒤 모든 block과 final norm을 거쳐 out_head로 vocab 차원의 logits를 냅니다.\n재도전: 각 줄 뒤 shape D가 언제 V로 바뀌는지 표시하세요."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "x = self.trf_blocks(x)",
        "alternatives": [],
        "why": "토큰과 위치를 더해 [B,T,D]를 만든 뒤 모든 block과 final norm을 거쳐 out_head로 vocab 차원의 logits를 냅니다.\n재도전: 각 줄 뒤 shape D가 언제 V로 바뀌는지 표시하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "logits = self.out_head(x)",
        "alternatives": [],
        "why": "토큰과 위치를 더해 [B,T,D]를 만든 뒤 모든 block과 final norm을 거쳐 out_head로 vocab 차원의 logits를 냅니다.\n재도전: 각 줄 뒤 shape D가 언제 V로 바뀌는지 표시하세요."
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
        "alternatives": [],
        "why": "as_query_engine()은 index 검색과 LLM 응답 합성을 묶은 인터페이스를 만들고 query()가 자연어 질문을 실행합니다.\n재도전: 객체 생성 단계와 실제 질의 단계의 메서드를 구분해 다시 쓰세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "response = query_engine.query(question)",
        "alternatives": [],
        "why": "as_query_engine()은 index 검색과 LLM 응답 합성을 묶은 인터페이스를 만들고 query()가 자연어 질문을 실행합니다.\n재도전: 객체 생성 단계와 실제 질의 단계의 메서드를 구분해 다시 쓰세요."
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
        "alternatives": [],
        "why": "Custom query의 핵심 순서는 retrieve → synthesize입니다. 같은 query_str로 근거를 찾고, 찾은 nodes를 두 번째 인자로 합성기에 전달합니다.\n재도전: 첫 줄의 출력 nodes가 둘째 줄의 어느 위치로 전달되는지 확인하세요."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "response_obj = self.response_synthesizer.synthesize(query_str, nodes)",
        "alternatives": [],
        "why": "Custom query의 핵심 순서는 retrieve → synthesize입니다. 같은 query_str로 근거를 찾고, 찾은 nodes를 두 번째 인자로 합성기에 전달합니다.\n재도전: 첫 줄의 출력 nodes가 둘째 줄의 어느 위치로 전달되는지 확인하세요."
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
        "alternatives": [],
        "why": "검색 결과 객체에서 get_content로 본문을 꺼내 하나의 context로 합칩니다. PromptTemplate.format 결과를 llm.complete에 전달합니다.\n재도전: retrieve → get_content → format → complete 네 동사를 순서대로 적으세요."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "context_str = \"\\n\\n\".join([n.node.get_content() for n in nodes])",
        "alternatives": [],
        "why": "검색 결과 객체에서 get_content로 본문을 꺼내 하나의 context로 합칩니다. PromptTemplate.format 결과를 llm.complete에 전달합니다.\n재도전: retrieve → get_content → format → complete 네 동사를 순서대로 적으세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "response = self.llm.complete(\n    self.qa_prompt.format(context_str=context_str, query_str=query_str)\n)",
        "alternatives": [],
        "why": "검색 결과 객체에서 get_content로 본문을 꺼내 하나의 context로 합칩니다. PromptTemplate.format 결과를 llm.complete에 전달합니다.\n재도전: retrieve → get_content → format → complete 네 동사를 순서대로 적으세요."
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
        "alternatives": [],
        "why": "sklearn metric은 y_true를 먼저, y_pred를 두 번째로 받습니다. 두 값 모두 CPU NumPy 배열로 변환돼 있습니다.\n재도전: 정답(true)과 예측(pred)을 먼저 표시한 후 두 함수에 같은 순서로 넣으세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "mape = mean_absolute_percentage_error(y_test, test_predictions)",
        "alternatives": [],
        "why": "sklearn metric은 y_true를 먼저, y_pred를 두 번째로 받습니다. 두 값 모두 CPU NumPy 배열로 변환돼 있습니다.\n재도전: 정답(true)과 예측(pred)을 먼저 표시한 후 두 함수에 같은 순서로 넣으세요."
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
        "alternatives": [],
        "why": "transpose 뒤 feature 수가 Conv1d channel이므로 in_channels=input_size입니다. Conv 출력 channel hidden_size가 다시 마지막 축이 된 후 Linear 입력이 됩니다.\n재도전: 각 transpose 뒤 축 순서를 적고 Linear 직전 마지막 축을 확인하세요."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "self.fc = nn.Linear(hidden_size, 1)",
        "alternatives": [],
        "why": "transpose 뒤 feature 수가 Conv1d channel이므로 in_channels=input_size입니다. Conv 출력 channel hidden_size가 다시 마지막 축이 된 후 Linear 입력이 됩니다.\n재도전: 각 transpose 뒤 축 순서를 적고 Linear 직전 마지막 축을 확인하세요."
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
        "alternatives": [],
        "why": "[B,T,1]에서 마지막 시점의 scalar [B]를 선택해 target과 MSE를 계산합니다. 이전 gradient를 지운 뒤 backward와 step을 실행합니다.\n재도전: 각 줄 뒤 shape를 쓰고 zero_grad→backward→step 순서를 다시 확인하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "loss = loss_fn(pred, batch_y)",
        "alternatives": [],
        "why": "[B,T,1]에서 마지막 시점의 scalar [B]를 선택해 target과 MSE를 계산합니다. 이전 gradient를 지운 뒤 backward와 step을 실행합니다.\n재도전: 각 줄 뒤 shape를 쓰고 zero_grad→backward→step 순서를 다시 확인하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "optimizer.zero_grad()",
        "alternatives": [],
        "why": "[B,T,1]에서 마지막 시점의 scalar [B]를 선택해 target과 MSE를 계산합니다. 이전 gradient를 지운 뒤 backward와 step을 실행합니다.\n재도전: 각 줄 뒤 shape를 쓰고 zero_grad→backward→step 순서를 다시 확인하세요."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "loss.backward()",
        "alternatives": [],
        "why": "[B,T,1]에서 마지막 시점의 scalar [B]를 선택해 target과 MSE를 계산합니다. 이전 gradient를 지운 뒤 backward와 step을 실행합니다.\n재도전: 각 줄 뒤 shape를 쓰고 zero_grad→backward→step 순서를 다시 확인하세요."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "optimizer.step()",
        "alternatives": [],
        "why": "[B,T,1]에서 마지막 시점의 scalar [B]를 선택해 target과 MSE를 계산합니다. 이전 gradient를 지운 뒤 backward와 step을 실행합니다.\n재도전: 각 줄 뒤 shape를 쓰고 zero_grad→backward→step 순서를 다시 확인하세요."
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
        "alternatives": [],
        "why": "Normalize의 역연산은 x*std+mean입니다. 채널 통계를 [1,3,1,1]로 만들어 batch와 공간축 전체에 broadcasting합니다.\n재도전: view(3)만 사용할 때와 [1,3,1,1]의 broadcasting 차이를 설명하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "std  = torch.tensor(CIFAR10_STD).view(1,3,1,1)",
        "alternatives": [],
        "why": "Normalize의 역연산은 x*std+mean입니다. 채널 통계를 [1,3,1,1]로 만들어 batch와 공간축 전체에 broadcasting합니다.\n재도전: view(3)만 사용할 때와 [1,3,1,1]의 broadcasting 차이를 설명하세요."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "return x * std + mean",
        "alternatives": [],
        "why": "Normalize의 역연산은 x*std+mean입니다. 채널 통계를 [1,3,1,1]로 만들어 batch와 공간축 전체에 broadcasting합니다.\n재도전: view(3)만 사용할 때와 [1,3,1,1]의 broadcasting 차이를 설명하세요."
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
        "alternatives": [],
        "why": "Linear 출력의 마지막 축 3·H·d를 세 Tensor로 나눈 뒤 결합된 H·d를 head와 head_dim으로 분리합니다.\n재도전: chunk의 dim을 1로 쓰면 어떤 축이 잘못 나뉘는지 설명하세요."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "q, k, v = map(lambda t: rearrange(t, 'b n (h d) -> b h n d', h = h), qkv)",
        "alternatives": [],
        "why": "Linear 출력의 마지막 축 3·H·d를 세 Tensor로 나눈 뒤 결합된 H·d를 head와 head_dim으로 분리합니다.\n재도전: chunk의 dim을 1로 쓰면 어떤 축이 잘못 나뉘는지 설명하세요."
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
        "alternatives": [],
        "why": "Q의 i token과 K의 j token 내적으로 [i,j] score를 만들고 scale 후 softmax합니다. j축 attention으로 V[j]를 합쳐 query i의 새 표현을 얻습니다.\n재도전: 각 einsum에서 합산되어 사라지는 index를 표시하세요."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "attn = self.attend(dots)",
        "alternatives": [],
        "why": "Q의 i token과 K의 j token 내적으로 [i,j] score를 만들고 scale 후 softmax합니다. j축 attention으로 V[j]를 합쳐 query i의 새 표현을 얻습니다.\n재도전: 각 einsum에서 합산되어 사라지는 index를 표시하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "out = einsum('b h i j, b h j d -> b h i d', attn, v)",
        "alternatives": [],
        "why": "Q의 i token과 K의 j token 내적으로 [i,j] score를 만들고 scale 후 softmax합니다. j축 attention으로 V[j]를 합쳐 query i의 새 표현을 얻습니다.\n재도전: 각 einsum에서 합산되어 사라지는 index를 표시하세요."
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
        "why": "batch·공간 축은 singleton이고 OC가 두 번째 축입니다.",
        "alternatives": []
      },
      {
        "key": "B",
        "points": 2,
        "answer": "output = output.float()",
        "why": "실수 scale 연산을 위한 변환입니다.",
        "alternatives": []
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
        "alternatives": [],
        "why": "bias는 input×weight 누산값에 더해지므로 같은 실수 단위 input_scale×weight_scale을 사용하고 overflow 여유가 큰 int32에 저장합니다.\n재도전: bias를 int8로 저장할 때 생길 수 있는 문제를 설명하세요."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "quantized_bias = linear_quantize(bias, 32, bias_scale, zero_point=0, dtype=torch.int32)",
        "alternatives": [],
        "why": "bias는 input×weight 누산값에 더해지므로 같은 실수 단위 input_scale×weight_scale을 사용하고 overflow 여유가 큰 int32에 저장합니다.\n재도전: bias를 int8로 저장할 때 생길 수 있는 문제를 설명하세요."
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
        "alternatives": [],
        "why": "누산 결과의 실제 단위는 input_scale×weight_scale입니다. 이를 output_scale로 나눠 output 정수 한 칸 단위로 환산한 뒤 output_zero_point를 더합니다.\n재도전: Conv2d output [B,OC,H,W]에서는 weight_scale을 어떤 shape로 바꿀지 쓰세요."
      },
      {
        "key": "B",
        "points": 4,
        "answer": "output = output + output_zero_point",
        "alternatives": [],
        "why": "누산 결과의 실제 단위는 input_scale×weight_scale입니다. 이를 output_scale로 나눠 output 정수 한 칸 단위로 환산한 뒤 output_zero_point를 더합니다.\n재도전: Conv2d output [B,OC,H,W]에서는 weight_scale을 어떤 shape로 바꿀지 쓰세요."
      }
    ]
  }
];
