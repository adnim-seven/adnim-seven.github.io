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
        "why": "batch는 유지하고 최근 token window만 선택합니다.",
        "alternatives": []
      },
      {
        "key": "B",
        "points": 3,
        "answer": "logits = logits[:, -1, :]",
        "why": "마지막 시점의 다음 토큰 예측만 추출합니다.",
        "alternatives": []
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
        "alternatives": [],
        "why": "argmax는 vocab 축의 최고 점수 ID를 고르고 keepdim=True로 [B,1]을 유지합니다. cat은 token 시간축 dim=1에 이어 붙입니다.\n재도전: 각 함수의 출력 shape을 먼저 적고 두 줄을 다시 작성하세요."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "idx = torch.cat((idx, idx_next), dim=1)",
        "alternatives": [],
        "why": "argmax는 vocab 축의 최고 점수 ID를 고르고 keepdim=True로 [B,1]을 유지합니다. cat은 token 시간축 dim=1에 이어 붙입니다.\n재도전: 각 함수의 출력 shape을 먼저 적고 두 줄을 다시 작성하세요."
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
        "alternatives": [],
        "why": "첫 pad_token_id는 모델이 문장 종료를 예측해야 하는 실제 target입니다. 그 뒤 길이 맞춤용 pad만 -100으로 바꿔 Cross Entropy에서 제외합니다.\n재도전: indices[0]과 indices[1:]의 의미를 구분하세요."
      },
      {
        "key": "B",
        "points": 4,
        "answer": "targets[indices[1:]] = ignore_index",
        "alternatives": [],
        "why": "첫 pad_token_id는 모델이 문장 종료를 예측해야 하는 실제 target입니다. 그 뒤 길이 맞춤용 pad만 -100으로 바꿔 Cross Entropy에서 제외합니다.\n재도전: indices[0]과 indices[1:]의 의미를 구분하세요."
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
        "why": "BasicMCPClient가 서버 통신을 담당하고 McpToolSpec이 도구 metadata를 LlamaIndex 형식으로 변환합니다. 목록 조회는 네트워크 작업이라 await합니다.\n재도전: Client→Spec→await 목록의 세 객체 변화를 적으세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "mcp_tool = McpToolSpec(client=mcp_client)",
        "alternatives": [],
        "why": "BasicMCPClient가 서버 통신을 담당하고 McpToolSpec이 도구 metadata를 LlamaIndex 형식으로 변환합니다. 목록 조회는 네트워크 작업이라 await합니다.\n재도전: Client→Spec→await 목록의 세 객체 변화를 적으세요."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "tools = await mcp_tool.to_tool_list_async()",
        "alternatives": [],
        "why": "BasicMCPClient가 서버 통신을 담당하고 McpToolSpec이 도구 metadata를 LlamaIndex 형식으로 변환합니다. 목록 조회는 네트워크 작업이라 await합니다.\n재도전: Client→Spec→await 목록의 세 객체 변화를 적으세요."
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
        "alternatives": [],
        "why": "FunctionAgent는 사용 가능한 tools와 판단할 LLM, tool 사용 규칙을 받습니다. Context(self.agent)는 이후 run에서 대화와 workflow 상태를 유지합니다.\n재도전: Agent 구성 요소와 Context가 감싸는 대상이 같은 Agent인지 확인하세요."
      },
      {
        "key": "B",
        "points": 3,
        "answer": "self.agent_context = Context(self.agent)",
        "alternatives": [],
        "why": "FunctionAgent는 사용 가능한 tools와 판단할 LLM, tool 사용 규칙을 받습니다. Context(self.agent)는 이후 run에서 대화와 workflow 상태를 유지합니다.\n재도전: Agent 구성 요소와 Context가 감싸는 대상이 같은 Agent인지 확인하세요."
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
        "why": "run은 handler를 반환합니다. async for로 진행 이벤트를 관찰할 수 있고 모든 처리가 끝난 최종 값은 await handler로 얻습니다.\n재도전: 이벤트 관찰과 최종 결과 대기를 별개의 단계로 쓰세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "async for event in handler.stream_events():",
        "alternatives": [],
        "why": "run은 handler를 반환합니다. async for로 진행 이벤트를 관찰할 수 있고 모든 처리가 끝난 최종 값은 await handler로 얻습니다.\n재도전: 이벤트 관찰과 최종 결과 대기를 별개의 단계로 쓰세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "if verbose and type(event) == ToolCall:",
        "alternatives": [],
        "why": "run은 handler를 반환합니다. async for로 진행 이벤트를 관찰할 수 있고 모든 처리가 끝난 최종 값은 await handler로 얻습니다.\n재도전: 이벤트 관찰과 최종 결과 대기를 별개의 단계로 쓰세요."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "print(event.tool_name, event.tool_kwargs)",
        "alternatives": [],
        "why": "run은 handler를 반환합니다. async for로 진행 이벤트를 관찰할 수 있고 모든 처리가 끝난 최종 값은 await handler로 얻습니다.\n재도전: 이벤트 관찰과 최종 결과 대기를 별개의 단계로 쓰세요."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "response = await handler",
        "alternatives": [],
        "why": "run은 handler를 반환합니다. async for로 진행 이벤트를 관찰할 수 있고 모든 처리가 끝난 최종 값은 await handler로 얻습니다.\n재도전: 이벤트 관찰과 최종 결과 대기를 별개의 단계로 쓰세요."
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
        "alternatives": [],
        "why": "Encoder의 목적은 전체 시점 출력보다 과거를 요약한 hidden state를 Decoder에 전달하는 것입니다. 따라서 out을 _로 버리고 h를 반환합니다.\n재도전: RNN의 (out,h) 중 다음 Decoder 호출 인자로 쓰이는 것을 고르세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "_, h = self.rnn(x)",
        "alternatives": [],
        "why": "Encoder의 목적은 전체 시점 출력보다 과거를 요약한 hidden state를 Decoder에 전달하는 것입니다. 따라서 out을 _로 버리고 h를 반환합니다.\n재도전: RNN의 (out,h) 중 다음 Decoder 호출 인자로 쓰이는 것을 고르세요."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "return h",
        "alternatives": [],
        "why": "Encoder의 목적은 전체 시점 출력보다 과거를 요약한 hidden state를 Decoder에 전달하는 것입니다. 따라서 out을 _로 버리고 h를 반환합니다.\n재도전: RNN의 (out,h) 중 다음 Decoder 호출 인자로 쓰이는 것을 고르세요."
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
        "alternatives": [],
        "why": "Decoder RNN 출력 hidden_size를 다음 입력과 같은 input_size로 투영해야 autoregressive loop에서 input=out이 가능합니다. 갱신된 h도 다음 step으로 넘깁니다.\n재도전: 현재 step 값과 다음 step 상태 두 반환값을 구분하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "self.fc = nn.Linear(hidden_size, input_size)",
        "alternatives": [],
        "why": "Decoder RNN 출력 hidden_size를 다음 입력과 같은 input_size로 투영해야 autoregressive loop에서 input=out이 가능합니다. 갱신된 h도 다음 step으로 넘깁니다.\n재도전: 현재 step 값과 다음 step 상태 두 반환값을 구분하세요."
      },
      {
        "key": "C",
        "points": 1,
        "answer": "out, h = self.rnn(x, h)",
        "alternatives": [],
        "why": "Decoder RNN 출력 hidden_size를 다음 입력과 같은 input_size로 투영해야 autoregressive loop에서 input=out이 가능합니다. 갱신된 h도 다음 step으로 넘깁니다.\n재도전: 현재 step 값과 다음 step 상태 두 반환값을 구분하세요."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "out = self.fc(out)",
        "alternatives": [],
        "why": "Decoder RNN 출력 hidden_size를 다음 입력과 같은 input_size로 투영해야 autoregressive loop에서 input=out이 가능합니다. 갱신된 h도 다음 step으로 넘깁니다.\n재도전: 현재 step 값과 다음 step 상태 두 반환값을 구분하세요."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "return out, h",
        "alternatives": [],
        "why": "Decoder RNN 출력 hidden_size를 다음 입력과 같은 input_size로 투영해야 autoregressive loop에서 input=out이 가능합니다. 갱신된 h도 다음 step으로 넘깁니다.\n재도전: 현재 step 값과 다음 step 상태 두 반환값을 구분하세요."
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
        "why": "Encoder가 만든 h와 관측된 마지막 값을 첫 Decoder 입력으로 사용합니다. 각 예측 out을 저장하고 그대로 다음 입력으로 재사용해 target_len만큼 생성합니다.\n재도전: 첫 입력, 한 step 출력 저장, 다음 입력 갱신 세 역할을 확인하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "input = source[:, -1, :].unsqueeze(1)",
        "alternatives": [],
        "why": "Encoder가 만든 h와 관측된 마지막 값을 첫 Decoder 입력으로 사용합니다. 각 예측 out을 저장하고 그대로 다음 입력으로 재사용해 target_len만큼 생성합니다.\n재도전: 첫 입력, 한 step 출력 저장, 다음 입력 갱신 세 역할을 확인하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "for t in range(target_len):",
        "alternatives": [],
        "why": "Encoder가 만든 h와 관측된 마지막 값을 첫 Decoder 입력으로 사용합니다. 각 예측 out을 저장하고 그대로 다음 입력으로 재사용해 target_len만큼 생성합니다.\n재도전: 첫 입력, 한 step 출력 저장, 다음 입력 갱신 세 역할을 확인하세요."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "out, h = self.decoder(input, h)",
        "alternatives": [],
        "why": "Encoder가 만든 h와 관측된 마지막 값을 첫 Decoder 입력으로 사용합니다. 각 예측 out을 저장하고 그대로 다음 입력으로 재사용해 target_len만큼 생성합니다.\n재도전: 첫 입력, 한 step 출력 저장, 다음 입력 갱신 세 역할을 확인하세요."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "input = out",
        "alternatives": [],
        "why": "Encoder가 만든 h와 관측된 마지막 값을 첫 Decoder 입력으로 사용합니다. 각 예측 out을 저장하고 그대로 다음 입력으로 재사용해 target_len만큼 생성합니다.\n재도전: 첫 입력, 한 step 출력 저장, 다음 입력 갱신 세 역할을 확인하세요."
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
        "alternatives": [],
        "why": "2×2 stride2 transposed convolution이 H,W를 2배, channel을 절반으로 만듭니다. skip concat 후 총 channel은 원래 in_channels가 되어 DoubleConv 입력과 맞습니다.\n재도전: bilinear=True 분기에서 channel 감소를 어느 block이 담당하는지 확인하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "self.conv = DoubleConv(in_channels, out_channels)",
        "alternatives": [],
        "why": "2×2 stride2 transposed convolution이 H,W를 2배, channel을 절반으로 만듭니다. skip concat 후 총 channel은 원래 in_channels가 되어 DoubleConv 입력과 맞습니다.\n재도전: bilinear=True 분기에서 channel 감소를 어느 block이 담당하는지 확인하세요."
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
        "why": "upsample 후 홀수 크기 오차를 x2 기준 diff로 구합니다. pad 순서는 left,right,top,bottom이며 마지막에 같은 공간 크기의 두 feature를 dim=1로 concat합니다.\n재도전: diff_x=3이면 left와 right pad가 각각 얼마인지 계산하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "x1 = F.pad(x1, [diff_x // 2, diff_x - diff_x // 2, diff_y // 2, diff_y - diff_y // 2])",
        "alternatives": [],
        "why": "upsample 후 홀수 크기 오차를 x2 기준 diff로 구합니다. pad 순서는 left,right,top,bottom이며 마지막에 같은 공간 크기의 두 feature를 dim=1로 concat합니다.\n재도전: diff_x=3이면 left와 right pad가 각각 얼마인지 계산하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "x = torch.cat([x2, x1], dim=1)",
        "alternatives": [],
        "why": "upsample 후 홀수 크기 오차를 x2 기준 diff로 구합니다. pad 순서는 left,right,top,bottom이며 마지막에 같은 공간 크기의 두 feature를 dim=1로 concat합니다.\n재도전: diff_x=3이면 left와 right pad가 각각 얼마인지 계산하세요."
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
        "why": "각 Up은 현재 decoder feature와 같은 scale의 encoder feature를 받습니다. 마지막 x1까지 결합한 [B,64,H,W]를 1×1 head가 [B,n_classes,H,W]로 투영합니다.\n재도전: up2가 x2가 아니라 x3을 받는 이유를 spatial scale로 설명하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "x = self.up2(x, x3)",
        "alternatives": [],
        "why": "각 Up은 현재 decoder feature와 같은 scale의 encoder feature를 받습니다. 마지막 x1까지 결합한 [B,64,H,W]를 1×1 head가 [B,n_classes,H,W]로 투영합니다.\n재도전: up2가 x2가 아니라 x3을 받는 이유를 spatial scale로 설명하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "x = self.up3(x, x2)",
        "alternatives": [],
        "why": "각 Up은 현재 decoder feature와 같은 scale의 encoder feature를 받습니다. 마지막 x1까지 결합한 [B,64,H,W]를 1×1 head가 [B,n_classes,H,W]로 투영합니다.\n재도전: up2가 x2가 아니라 x3을 받는 이유를 spatial scale로 설명하세요."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "x = self.up4(x, x1)",
        "alternatives": [],
        "why": "각 Up은 현재 decoder feature와 같은 scale의 encoder feature를 받습니다. 마지막 x1까지 결합한 [B,64,H,W]를 1×1 head가 [B,n_classes,H,W]로 투영합니다.\n재도전: up2가 x2가 아니라 x3을 받는 이유를 spatial scale로 설명하세요."
      },
      {
        "key": "E",
        "points": 1,
        "answer": "logits = self.outc(x)",
        "alternatives": [],
        "why": "각 Up은 현재 decoder feature와 같은 scale의 encoder feature를 받습니다. 마지막 x1까지 결합한 [B,64,H,W]를 1×1 head가 [B,n_classes,H,W]로 투영합니다.\n재도전: up2가 x2가 아니라 x3을 받는 이유를 spatial scale로 설명하세요."
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
        "why": "dropout·batch normalization을 평가 동작으로 바꿉니다. eval만으로 gradient가 꺼지지는 않습니다.",
        "alternatives": []
      },
      {
        "key": "B",
        "points": 1,
        "answer": "student.train()",
        "why": "Student 학습 모드입니다.",
        "alternatives": []
      },
      {
        "key": "C",
        "points": 3,
        "answer": "optimizer = optim.Adam(student.parameters(), lr=learning_rate)",
        "why": "Teacher parameter를 optimizer에 넣지 않습니다.",
        "alternatives": []
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
        "alternatives": [],
        "why": "feature 값 자체를 맞추려면 같은 shape의 Student regressor output과 Teacher feature map에 MSE를 적용합니다.\n재도전: feature map shape가 다르면 왜 MSE가 실패하는지 설명하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "_, teacher_feature_map = teacher(inputs)",
        "alternatives": [],
        "why": "feature 값 자체를 맞추려면 같은 shape의 Student regressor output과 Teacher feature map에 MSE를 적용합니다.\n재도전: feature map shape가 다르면 왜 MSE가 실패하는지 설명하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "student_logits, regressor_feature_map = student(inputs)",
        "alternatives": [],
        "why": "feature 값 자체를 맞추려면 같은 shape의 Student regressor output과 Teacher feature map에 MSE를 적용합니다.\n재도전: feature map shape가 다르면 왜 MSE가 실패하는지 설명하세요."
      },
      {
        "key": "D",
        "points": 1,
        "answer": "hidden_rep_loss = mse_loss(regressor_feature_map, teacher_feature_map)",
        "alternatives": [],
        "why": "feature 값 자체를 맞추려면 같은 shape의 Student regressor output과 Teacher feature map에 MSE를 적용합니다.\n재도전: feature map shape가 다르면 왜 MSE가 실패하는지 설명하세요."
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
        "alternatives": [],
        "why": "CosineEmbeddingLoss에서 target +1은 두 vector 방향의 cosine similarity를 높이는 목표입니다. Teacher hidden은 fixed target이고 Student hidden만 gradient를 받습니다.\n재도전: cosine loss와 MSE loss가 각각 feature의 무엇을 맞추는지 비교하세요."
      },
      {
        "key": "B",
        "points": 2,
        "answer": "_, teacher_hidden_representation = teacher(inputs)",
        "alternatives": [],
        "why": "CosineEmbeddingLoss에서 target +1은 두 vector 방향의 cosine similarity를 높이는 목표입니다. Teacher hidden은 fixed target이고 Student hidden만 gradient를 받습니다.\n재도전: cosine loss와 MSE loss가 각각 feature의 무엇을 맞추는지 비교하세요."
      },
      {
        "key": "C",
        "points": 2,
        "answer": "student_logits, student_hidden_representation = student(inputs)",
        "alternatives": [],
        "why": "CosineEmbeddingLoss에서 target +1은 두 vector 방향의 cosine similarity를 높이는 목표입니다. Teacher hidden은 fixed target이고 Student hidden만 gradient를 받습니다.\n재도전: cosine loss와 MSE loss가 각각 feature의 무엇을 맞추는지 비교하세요."
      },
      {
        "key": "D",
        "points": 2,
        "answer": "hidden_rep_loss = cosine_loss(student_hidden_representation, teacher_hidden_representation,\n                              target=torch.ones(inputs.size(0)).cuda())",
        "alternatives": [],
        "why": "CosineEmbeddingLoss에서 target +1은 두 vector 방향의 cosine similarity를 높이는 목표입니다. Teacher hidden은 fixed target이고 Student hidden만 gradient를 받습니다.\n재도전: cosine loss와 MSE loss가 각각 feature의 무엇을 맞추는지 비교하세요."
      }
    ]
  }
];
