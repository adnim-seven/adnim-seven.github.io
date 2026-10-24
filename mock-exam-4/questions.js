window.EXAM_NUMBER=4;
window.EXAM=[
  {
    "subject": "LLM",
    "title": "생성 문맥 길이 제한",
    "source": "Autoregressive Generation · 기존 빈칸 주변 코드 응용",
    "prompt": "idx [B,T]가 context_size보다 길어질 수 있습니다. 모델에는 마지막 context_size개 토큰만 전달하고 model 출력에서 마지막 시점 vocabulary logits를 선택하세요.",
    "code": "with torch.no_grad():\n    {{A}}\n    logits = model(idx_cond)\n    {{B}}\n# logits [B,V]를 다음 token 선택에 사용",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "idx_cond = idx[:, -context_size:]",
        "why": "토큰 시퀀스 [B, T]가 사전 훈련된 위치 임베딩 크기(context_size)를 초과하지 않도록 가장 최근의 마지막 context_size개 토큰만 슬라이싱하여 조건부 입력으로 사용합니다.",
        "alternatives": [
          "idx_cond = idx[:, -context_size:, ...]"
        ]
      },
      {
        "key": "B",
        "points": 3,
        "answer": "logits = logits[:, -1, :]",
        "why": "모델의 3차원 출력 로짓 [B, T, V]에서 가장 마지막 타임스텝(-1)의 어휘 로짓 [B, V]을 선택하여 다음 토큰 예측 확률 분포를 산출합니다.",
        "alternatives": [
          "logits = logits[:, -1]",
          "logits = logits[:, -1, :].squeeze(1)"
        ]
      }
    ],
    "id": "1-1"
  },
  {
    "id": "1-2",
    "subject": "LLM",
    "title": "Greedy 생성과 연결",
    "source": "Chapter_4_Excercise_GPT.ipynb · 강의 코드 기반 재구성",
    "prompt": "가장 큰 logits의 token ID를 [B,1]로 선택하고 기존 idx 뒤에 붙이는 두 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: logits [B,V] → idx_next [B,1]; idx [B,T] → [B,T+1]",
    "code": "# 가장 로짓값이 높은 토큰 선택\n# TODO\n{{A}}\n# 예측 토큰을 기존 시퀀스 뒤에 연결\n# TODO\n{{B}}",
    "slots": [
      {
        "key": "A",
        "points": 4,
        "answer": "idx_next = torch.argmax(logits, dim=-1, keepdim=True)",
        "alternatives": [
          "idx_next = torch.argmax(logits, dim=1, keepdim=True)",
          "idx_next = logits.argmax(dim=-1, keepdim=True)",
          "idx_next = logits.argmax(dim=1, keepdim=True)",
          "idx_next = torch.argmax(logits, -1, keepdim=True)"
        ],
        "why": "어휘 로짓 [B, V]에서 가장 높은 확률의 토큰을 선택하되, 텐서 결합을 위해 2차원 [B, 1] 형태를 유지(keepdim=True)합니다."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "idx = torch.cat((idx, idx_next), dim=1)",
        "alternatives": [
          "idx = torch.cat([idx, idx_next], dim=1)",
          "idx = torch.cat((idx, idx_next), dim=-1)",
          "idx = torch.cat([idx, idx_next], dim=-1)",
          "idx = torch.concat((idx, idx_next), dim=1)",
          "idx = torch.concat([idx, idx_next], dim=1)"
        ],
        "why": "기존 토큰 시퀀스 [B, T]와 새로 생성된 토큰 [B, 1]을 시퀀스 축(dim=1)을 따라 이어붙여 [B, T+1]로 확장합니다."
      }
    ]
  },
  {
    "id": "1-3",
    "subject": "LLM",
    "title": "Padding Loss Mask",
    "source": "Chapter_7_Exercise_Follow_Instructions.ipynb · 강의 코드 기반 재구성",
    "prompt": "첫 EOS는 정답으로 유지하고 두 번째 이후 padding 위치는 ignore_index로 바꾸세요. indices는 오름차순 padding 위치입니다. 개수가 충분할 때만 slice를 적용하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: targets [T]→padding index→두 번째 이후 값 -100",
    "code": "ignore_index = -100\n# targets [T]에는 정답 토큰 뒤에 EOS/padding 토큰이 반복됩니다.\nindices = (targets == pad_token_id).nonzero().flatten()\n{{A}}\n    {{B}}\n# 첫 EOS는 학습하고 그 뒤 padding만 loss에서 제외합니다.",
    "slots": [
      {
        "key": "A",
        "points": 4,
        "answer": "if indices.numel() > 1:",
        "alternatives": [
          "if len(indices) > 1:",
          "if indices.size(0) > 1:"
        ],
        "why": "패딩 토큰 인덱스가 2개 이상일 때(첫 EOS 뒤에 실제 패딩이 존재할 때)만 슬라이싱을 적용하기 위해 개수를 확인합니다."
      },
      {
        "key": "B",
        "points": 4,
        "answer": "targets[indices[1:]] = ignore_index",
        "alternatives": [],
        "why": "첫 번째 패딩 위치(EOS)는 모델의 생성 종료 학습을 위해 유지하고, 두 번째 이후 위치(indices[1:])만 손실 계산에서 무시되는 ignore_index(-100)로 치환합니다."
      }
    ]
  },
  {
    "id": "2-1",
    "subject": "RAG",
    "title": "MCP Tool Discovery",
    "source": "4_RAG_framework_evaluation_with_MCP.ipynb · 강의 코드 기반 재구성",
    "prompt": "외부 MCP 서버 client와 tool spec을 만들고 비동기로 Agent용 tool 목록을 조회하는 세 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: server URI → MCP client → tool spec → list[tools]",
    "code": "async def load_tools(external_mcp_server):\n    # BasicMCPClient, McpToolSpec이 import됨\n    {{A}}\n    {{B}}\n    {{C}}\n    return tools",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "mcp_client = BasicMCPClient(external_mcp_server)",
        "alternatives": [],
        "why": "외부 MCP(Model Context Protocol) 서버와 통신하는 기본 MCP 클라이언트를 생성합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "mcp_tool = McpToolSpec(client=mcp_client)",
        "alternatives": [],
        "why": "클라이언트를 감싸서 LlamaIndex 도구 명세 객체(McpToolSpec)로 초기화합니다."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "tools = await mcp_tool.to_tool_list_async()",
        "alternatives": [],
        "why": "원격 MCP 서버에 비동기 RPC를 보내 제공되는 도구 목록을 FunctionTool 리스트로 가져옵니다."
      }
    ]
  },
  {
    "id": "2-2",
    "subject": "RAG",
    "title": "FunctionAgent 초기화",
    "source": "4_RAG_framework_evaluation_with_MCP.ipynb · 강의 코드 기반 재구성",
    "prompt": "FunctionAgent에 tools, self.llm, SYSTEM_PROMPT를 연결해 self.agent에 저장하세요. 이어 Context(self.agent)로 대화 문맥을 생성해 self.agent_context에 저장하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: tools + LLM + rules → Agent → Context",
    "code": "def configure(self, tools):\n    # self.llm과 SYSTEM_PROMPT는 제공되어 있습니다.\n    {{A}}\n    {{B}}",
    "slots": [
      {
        "key": "A",
        "points": 4,
        "answer": "self.agent = FunctionAgent(\n    tools=tools,\n    llm=self.llm,\n    system_prompt=SYSTEM_PROMPT,\n)",
        "alternatives": [
          "self.agent = FunctionAgent(tools=tools, llm=self.llm, system_prompt=SYSTEM_PROMPT,)"
        ],
        "why": "제공된 MCP 도구 리스트, LLM, 그리고 시스템 프롬프트를 바인딩하여 도구 호출 에이전트를 초기화합니다."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "self.agent_context = Context(self.agent)",
        "alternatives": [],
        "why": "에이전트 인스턴스로부터 실행 상태 및 대화 이력을 추적할 Context 객체를 생성하여 저장합니다."
      }
    ]
  },
  {
    "id": "2-3",
    "subject": "RAG",
    "title": "Agent Handler 실행",
    "source": "4_RAG_framework_evaluation_with_MCP.ipynb · 강의 코드 기반 재구성",
    "prompt": "self.agent.run에 question과 ctx=self.agent_context를 전달하세요. handler.stream_events()를 async for로 읽고 verbose이며 type(event)==ToolCall인 경우 tool_name과 tool_kwargs를 출력하세요. 마지막으로 handler를 await해 최종 응답을 받으세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: question + Context → handler → events → final response",
    "code": "async def run_query(self, question, verbose):\n    {{A}}\n    {{B}}\n        {{C}}\n            {{D}}\n    {{E}}\n    return response",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "handler = self.agent.run(question, ctx=self.agent_context)",
        "alternatives": [],
        "why": "질문 텍스트와 대화 컨텍스트를 에이전트에 전달하여 비동기 실행 핸들러를 획득합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "async for event in handler.stream_events():",
        "alternatives": [],
        "why": "핸들러가 비동기적으로 발생시키는 이벤트 스트림을 순회합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "if verbose and type(event) == ToolCall:",
        "alternatives": [
          "if verbose and isinstance(event, ToolCall):"
        ],
        "why": "상세 출력(verbose) 모드이고 이벤트 타입이 도구 호출(ToolCall)인지 검사합니다."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "print(event.tool_name, event.tool_kwargs)",
        "alternatives": [
          "print(event.tool_name,event.tool_kwargs)"
        ],
        "why": "호출되는 도구의 함수명과 전달된 키워드 인자들을 콘솔에 출력합니다."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "response = await handler",
        "alternatives": [],
        "why": "핸들러 작업의 완료를 비동기 대기(await)하여 최종 응답 객체를 수신합니다."
      }
    ]
  },
  {
    "id": "3-1",
    "subject": "Data",
    "title": "Encoder Hidden State",
    "source": "ts_practice.ipynb · 강의 코드 기반 재구성",
    "prompt": "Encoder에서 batch-first RNN을 구성하고 마지막 hidden state만 반환하는 세 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: source [B,T,input] → h [layers,B,H]",
    "code": "class Encoder(nn.Module):\n    def __init__(self, input_size, hidden_size, num_layers):\n        super().__init__()\n        {{A}}\n    def forward(self, x):\n        {{B}}\n        {{C}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "self.rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)",
        "alternatives": [
          "self.rnn = nn.RNN(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers, batch_first=True)"
        ],
        "why": "시계열 인코더용 다층 순환신경망(batch_first=True) 계층을 정의합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "_, h = self.rnn(x)",
        "alternatives": [],
        "why": "입력 시계열 [B, T, input_size]을 RNN에 통과시켜 전체 시점 출력과 최종 은닉 상태 h [num_layers, B, hidden_size]를 구합니다."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "return h",
        "alternatives": [],
        "why": "디코더의 초기 은닉 상태로 전달할 컨텍스트 은닉 상태 h를 반환합니다."
      }
    ]
  },
  {
    "id": "3-2",
    "subject": "Data",
    "title": "Decoder Step",
    "source": "ts_practice.ipynb · 강의 코드 기반 재구성",
    "prompt": "batch-first RNN과 hidden_size→input_size Linear를 구성하세요. forward에서 입력 x와 이전 h를 RNN에 전달하고 출력에 fc를 적용한 뒤 out과 새 h를 반환하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: x [B,1,input] + h → out [B,1,H] → value [B,1,input] + new h",
    "code": "class Decoder(nn.Module):\n    def __init__(self, input_size, hidden_size, num_layers):\n        super().__init__()\n        {{A}}\n        {{B}}\n    def forward(self, x, h):\n        {{C}}\n        {{D}}\n        {{E}}",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "self.rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)",
        "alternatives": [
          "self.rnn = nn.RNN(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers, batch_first=True)"
        ],
        "why": "1개 시점의 입력을 받아 순환 갱신을 수행할 디코더 순환신경망 계층을 구성합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "self.fc = nn.Linear(hidden_size, input_size)",
        "alternatives": [
          "self.fc = nn.Linear(in_features=hidden_size, out_features=input_size)"
        ],
        "why": "은닉 상태 차원(hidden_size)을 다음 시점 입력 크기(input_size)로 변환하는 선형 계층을 구성합니다."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "out, h = self.rnn(x, h)",
        "alternatives": [],
        "why": "1개 시점 입력 x [B, 1, input_size]와 이전 은닉 상태 h를 RNN에 전달하여 출력과 새 은닉 상태를 획득합니다."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "out = self.fc(out)",
        "alternatives": [],
        "why": "RNN 출력을 완전연결계층에 통과시켜 다음 1시점의 예측값 out [B, 1, input_size]을 생성합니다."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "return out, h",
        "alternatives": [],
        "why": "예측값 out과 갱신된 은닉 상태 h를 튜플로 반환합니다."
      }
    ]
  },
  {
    "id": "3-3",
    "subject": "Data",
    "title": "Autoregressive Forecast",
    "source": "ts_practice.ipynb · 강의 코드 기반 재구성",
    "prompt": "Encoder 상태와 source 마지막 값을 시작점으로 target_len개 미래 값을 순차 생성하는 핵심 다섯 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: source [B,T,F] → h + input [B,1,F] → target_len outputs → [B,H,F]",
    "code": "def forward(self, source, target_len):\n    predictions = []\n    {{A}}\n    {{B}}\n    {{C}}\n        {{D}}\n        predictions.append(out.squeeze(1))\n        {{E}}\n    return torch.stack(predictions, dim=1)",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "h = self.encoder(source)",
        "alternatives": [],
        "why": "과거 관측 데이터 source [B, T_in, F]를 인코더에 통과시켜 초기 은닉 상태 h를 획득합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "input = source[:, -1, :].unsqueeze(1)",
        "alternatives": [
          "input = source[:, -1:].clone()",
          "input = source[:, -1:, :]"
        ],
        "why": "관측 시계열의 가장 마지막 실제 시점 벡터 [B, F]에 시간 차원을 추가하여 첫 디코더 입력 [B, 1, F]을 준비합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "for t in range(target_len):",
        "alternatives": [],
        "why": "예측 목표 길이(target_len)만큼 반복하여 자기회귀 생성을 수행합니다."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "out, h = self.decoder(input, h)",
        "alternatives": [],
        "why": "현재 시점 입력과 은닉 상태를 디코더에 통과시켜 다음 시점 예측 out과 갱신된 은닉 상태 h를 구합니다."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "input = out",
        "alternatives": [],
        "why": "현재 생성된 예측값 out을 다음 스텝의 입력으로 피드백합니다."
      }
    ]
  },
  {
    "id": "4-1",
    "subject": "Vision",
    "title": "Learned Upsampling",
    "source": "04_Unet.ipynb · 강의 코드 기반 재구성",
    "prompt": "kernel_size=2, stride=2인 ConvTranspose2d로 공간을 두 배, channel을 절반으로 만드세요. 이후 skip 결합 결과 in_channels를 out_channels로 바꿀 DoubleConv를 self.conv에 준비하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: [B,C,H/2,W/2] → [B,C/2,H,W] → concat [B,C,H,W]",
    "code": "class Up(nn.Module):\n    def __init__(self, in_channels, out_channels):\n        super().__init__()\n        # 여기서는 transposed convolution 경로만 구현합니다.\n        {{A}}\n        {{B}}",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2)",
        "alternatives": [
          "self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, 2, stride=2)",
          "self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2, bias=True)"
        ],
        "why": "피처맵 공간 해상도를 2배 확장하고 채널을 절반으로 축소하는 전치 합성곱(ConvTranspose2d) 계층을 구성합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "self.conv = DoubleConv(in_channels, out_channels)",
        "alternatives": [],
        "why": "스킵 연결로 합쳐진 2배 채널을 최종 출력 채널(out_channels)로 정제하는 DoubleConv 블록을 준비합니다."
      }
    ]
  },
  {
    "id": "4-2",
    "subject": "Vision",
    "title": "Up·Skip 정렬",
    "source": "04_Unet.ipynb · 강의 코드 기반 재구성",
    "prompt": "H,W 차이 diff_y·diff_x가 계산된 상태에서 decoder x1을 upsample·대칭 padding하고 encoder skip x2와 channel 축으로 연결하는 네 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: x1 [B,Cd,h,w] → [B,Cup,H,W]; x2 [B,Cs,H,W] → [B,Cs+Cup,H,W]",
    "code": "def forward(self, x1, x2):\n    # x1: decoder, x2: encoder skip\n    {{A}}\n    diff_y = x2.size(2) - x1.size(2)\n    diff_x = x2.size(3) - x1.size(3)\n    {{B}}\n    {{C}}\n    return self.conv(x)",
    "slots": [
      {
        "key": "A",
        "points": 3,
        "answer": "x1 = self.up(x1)",
        "alternatives": [],
        "why": "디코더 피처 x1의 공간 해상도를 2배 업샘플링합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "x1 = F.pad(x1, [diff_x // 2, diff_x - diff_x // 2, diff_y // 2, diff_y - diff_y // 2])",
        "alternatives": [
          "x1 = F.pad(x1, (diff_x // 2, diff_x - diff_x // 2, diff_y // 2, diff_y - diff_y // 2))"
        ],
        "why": "다운샘플링 절삭으로 인한 인코더 스킵 피처 x2와의 해상도 불일치를 보정하기 위해 상하좌우 패딩을 적용합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "x = torch.cat([x2, x1], dim=1)",
        "alternatives": [
          "x = torch.cat((x2, x1), dim=1)",
          "x = torch.concat([x2, x1], dim=1)",
          "x = torch.concat((x2, x1), dim=1)"
        ],
        "why": "공간 크기가 일치된 인코더 스킵 피처 x2와 업샘플링 피처 x1을 채널 차원(dim=1)으로 이어붙입니다."
      }
    ]
  },
  {
    "id": "4-3",
    "subject": "Vision",
    "title": "Decoder·Output",
    "source": "04_Unet.ipynb · 강의 코드 기반 재구성",
    "prompt": "bottleneck에서 시작해 encoder skip을 역순으로 결합하고 원래 해상도를 복원한 뒤 pixel class logits를 만드는 다섯 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: [B,1024,H/16,W/16] → four Up → [B,64,H,W] → logits [B,1,H,W]",
    "code": "{{A}}\n{{B}}\n{{C}}\n{{D}}\n{{E}}\nreturn logits",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "x = self.up1(x5, x4)",
        "alternatives": [],
        "why": "보틀넥 x5와 최하단 인코더 스킵 피처 x4를 첫 번째 업샘플링 계층에 통과시켜 결합합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "x = self.up2(x, x3)",
        "alternatives": [],
        "why": "이전 단계 디코더 피처와 x3 스킵 피처를 두 번째 업샘플링 블록에서 결합합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "x = self.up3(x, x2)",
        "alternatives": [],
        "why": "세 번째 업샘플링 블록을 거쳐 x2 피처와 결합합니다."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "x = self.up4(x, x1)",
        "alternatives": [],
        "why": "최상단 원본 해상도 스킵 피처 x1과 마지막 업샘플링 결합을 수행합니다."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "logits = self.outc(x)",
        "alternatives": [],
        "why": "1x1 합성곱(self.outc)을 통해 최종 세그멘테이션 클래스 수 채널의 로짓 맵 [B, C, H, W]을 출력합니다."
      }
    ]
  },
  {
    "subject": "On-device AI",
    "title": "Teacher·Student 학습 설정",
    "source": "Knowledge Distillation · 기존 빈칸 주변 코드 응용",
    "prompt": "Teacher는 평가 모드, Student는 학습 모드로 설정하세요. optim.Adam에 Student parameter만 전달해 optimizer를 만드세요. learning_rate는 주어져 있습니다.",
    "code": "{{A}}\n{{B}}\n{{C}}\n# batch loop 안에서 Teacher forward는 별도로 no_grad 처리합니다.",
    "slots": [
      {
        "key": "A",
        "points": 1,
        "answer": "teacher.eval()",
        "why": "교사 모델을 평가 모드로 전환하여 드롭아웃 및 배치 정규화 이동 통계를 동결합니다.",
        "alternatives": []
      },
      {
        "key": "B",
        "points": 1,
        "answer": "student.train()",
        "why": "지식을 전수받을 학생 모델을 학습 모드로 설정합니다.",
        "alternatives": []
      },
      {
        "key": "C",
        "points": 3,
        "answer": "optimizer = optim.Adam(student.parameters(), lr=learning_rate)",
        "why": "교사 모델 가중치는 고정하고 오직 학생 모델 파라미터(student.parameters())만을 최적화 대상에 등록합니다.",
        "alternatives": [
          "optimizer = torch.optim.Adam(student.parameters(), lr=learning_rate)",
          "optimizer = optim.Adam(params=student.parameters(), lr=learning_rate)"
        ]
      }
    ],
    "id": "5-1"
  },
  {
    "id": "5-2",
    "subject": "On-device AI",
    "title": "Feature-map MSE",
    "source": "3. Knowledge Distillation.ipynb · 강의 코드 기반 재구성",
    "prompt": "Teacher feature map과 Student regressor output을 MSE로 맞추는 네 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: inputs → feature maps [B,...] → MSE scalar",
    "code": "def feature_loss(teacher, student, inputs, mse_loss):\n    # teacher와 student가 반환하는 feature는 같은 shape입니다.\n    {{A}}\n        {{B}}\n    {{C}}\n    {{D}}\n    return student_logits, hidden_rep_loss",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "with torch.no_grad():",
        "alternatives": [
          "with torch.inference_mode():"
        ],
        "why": "교사 모델의 특징 맵 추출 시 불필요한 gradient 그래프 생성을 방지하기 위해 no_grad 컨텍스트를 적용합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "_, teacher_feature_map = teacher(inputs)",
        "alternatives": [],
        "why": "교사 모델을 순전파하여 중간 은닉 특징 맵(teacher_feature_map)을 추출합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "student_logits, regressor_feature_map = student(inputs)",
        "alternatives": [],
        "why": "학생 모델을 순전파하여 학생의 로짓과 매핑된 특징 맵을 동시에 추출합니다."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "hidden_rep_loss = mse_loss(regressor_feature_map, teacher_feature_map)",
        "alternatives": [
          "hidden_rep_loss = mse_loss(input=regressor_feature_map, target=teacher_feature_map)"
        ],
        "why": "학생과 교사의 중간 특징 맵 간 평균 제곱 오차(MSE)를 계산하여 중간 계층 증류 손실을 구합니다."
      }
    ]
  },
  {
    "id": "5-3",
    "subject": "On-device AI",
    "title": "Cosine Representation",
    "source": "3. Knowledge Distillation.ipynb · 강의 코드 기반 재구성",
    "prompt": "Teacher hidden vector를 gradient 없이 얻고 Student hidden vector와 cosine similarity가 커지도록 loss를 만드는 다섯 줄을 작성하세요. 각 표시 위치에는 해당 코드 줄 전체를 작성하세요. 여러 줄도 가능합니다. 입출력: inputs → teacher/student hidden [B,D] → cosine loss scalar",
    "code": "def cosine_feature_loss(teacher, student, inputs, cosine_loss):\n    # CUDA Tensor, 두 hidden의 shape [B,D]는 같습니다.\n    {{A}}\n        {{B}}\n    {{C}}\n    {{D}}\n    return student_logits, hidden_rep_loss",
    "slots": [
      {
        "key": "A",
        "points": 2,
        "answer": "with torch.no_grad():",
        "alternatives": [
          "with torch.inference_mode():"
        ],
        "why": "교사 모델의 은닉 표현 추출 시 연산 그래프 생성과 메모리 낭비를 방지합니다."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "_, teacher_hidden_representation = teacher(inputs)",
        "alternatives": [],
        "why": "교사 모델로부터 최종 은닉 벡터 표현 [B, D]를 추출합니다."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "student_logits, student_hidden_representation = student(inputs)",
        "alternatives": [],
        "why": "학생 모델로부터 학생의 로짓과 은닉 벡터 표현 [B, D]를 추출합니다."
      },
      {
        "key": "D",
        "points": 2,
        "answer": "hidden_rep_loss = cosine_loss(student_hidden_representation, teacher_hidden_representation,\n                              target=torch.ones(inputs.size(0)).cuda())",
        "alternatives": [
          "hidden_rep_loss = cosine_loss(student_hidden_representation, teacher_hidden_representation, target=torch.ones(inputs.size(0), device=inputs.device))",
          "hidden_rep_loss = cosine_loss(student_hidden_representation, teacher_hidden_representation, torch.ones(inputs.size(0)).cuda())"
        ],
        "why": "CosineEmbeddingLoss에서 두 벡터가 동일 방향(코사인 유사도 1)을 지향하도록 target을 1로 설정한 텐서를 넘겨 손실을 계산합니다."
      }
    ]
  }
];
