'use strict';
// Build only the user-confirmed October recall targets; never edit source notebooks.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..'),VAULT=path.resolve(ROOT,'../..');
const folders={llm:'1. llm_hands_on-main/llm_hands_on-main',rag:'5. LLM Application/2일차/십습자료/Code',data:'4. Data model 의 이해/20260114/7_8-recsys-practice',vision:'2. vision/AI_Specialist_Vision',device:'3. On-Device AI/On-Device AI 강의자료/실습'};
const specs=[
 ['llm-1','LLM','llm','Chapter_7_Exercise_Follow_Instructions_dpo.ipynb',[1],['PreferenceDataset','custom_collate_fn'],'DPO 토큰화와 프롬프트 마스킹'],
 ['llm-2','LLM','llm','Chapter_3_Excercise_Attention.ipynb',[4],['MultiHeadAttention'],'MultiHeadAttention 축 변환·헤드 결합'],
 ['llm-3','LLM','llm','Chapter_4_Excercise_GPT.ipynb',[4],['GPTModel'],'GPTModel 임베딩과 Dropout 생성'],
 ['rag-1','RAG','rag','4_RAG_framework_evaluation_with_MCP.ipynb',[38,43,44],[],'MCP Client·ToolSpec·도구 및 리소스 조회'],
 ['rag-2','RAG','rag','4_RAG_framework_evaluation_with_MCP.ipynb',[47],['KGQueryEngineWithMCP'],'MCP Agent 구성과 비동기 query'],
 ['data-1','Data','data','RecSys_NCF.ipynb',[11],['Neural_Collaborative_Filtering'],'NCF 임베딩·예측 레이어·결합'],
 ['vision-1','Vision','vision','01_ResNet18_CIFAR10.ipynb',[7],[],'CIFAR-10 학습·평가 Transform'],
 ['vision-2','Vision','vision','01_ResNet18_CIFAR10.ipynb',[11],['build_resnet18_for_cifar10'],'ResNet18의 첫 Conv2d 교체'],
 ['device-1','On-device','device','2. Quantization for CNN_answer.ipynb',[64],['quantized_conv2d'],'CNN 양자화 출력 scale·zero point'],
 ['device-2','On-device','device','5. Quantization for LLM_answer.ipynb',[18],['pseudo_quantize_tensor'],'LLM 의사 양자화·역양자화'],
];
const requests=specs.map(([id,subject,folder,notebook,cells,scopes,title])=>{
 const file=path.join(VAULT,folders[folder],notebook),bytes=fs.readFileSync(file),nb=JSON.parse(bytes.toString('utf8'));
 let code=cells.map(n=>nb.cells[n-1].source.join('')).join('\n\n');
 if(id==='llm-1')code=code.replace('chosen_full_tokens = tokenizer.encode(f"{prompt}\\n\\n### Response:\\n{????}")','chosen_full_tokens = tokenizer.encode(f"{prompt}\\n\\n### Response:\\n{chosen_response}")').replace('rejected_full_tokens = tokenizer.encode(f"{prompt}\\n\\n### Response:\\n{????}")','rejected_full_tokens = tokenizer.encode(f"{prompt}\\n\\n### Response:\\n{rejected_response}")');
 if(id==='rag-1')code=code.replace(/external_mcp_server = .*?(?=\r?\n)/,'external_mcp_server = MCP_SERVER_URL  # 실행 환경에서 제공된 서버 주소');
 if(id==='vision-1')code=code.split("data_root =")[0].trimEnd();
 return {id,subject,notebook,source_cells:cells,scope:scopes[0]||'module-cells',scopes,title,code,source_path:path.relative(VAULT,file).replaceAll('\\','/'),source_sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
});
const python=`import ast,json,re,sys
out=[]
for q in json.load(sys.stdin):
 if q['scopes']:
  tree=ast.parse(re.sub(r'\\?{3,}', '_UNFILLED_',q['code']))
  lines=q['code'].splitlines()
  nodes=[n for n in tree.body if isinstance(n,(ast.ClassDef,ast.FunctionDef,ast.AsyncFunctionDef)) and n.name in q['scopes']]
  if len(nodes)!=len(q['scopes']):raise ValueError(q['id']+': missing scope')
  q['code']='\\n\\n'.join('\\n'.join(lines[n.lineno-1:n.end_lineno]) for n in nodes)
 out.append(q)
print(json.dumps(out,ensure_ascii=False))`;
const result=cp.spawnSync(process.env.PYTHON||'python',['-X','utf8','-c',python],{input:JSON.stringify(requests),encoding:'utf8',maxBuffer:8*1024*1024});
if(result.status!==0)throw new Error(result.stderr);
const qs=JSON.parse(result.stdout);
for(const q of qs){q.completed_code=q.code;q.slots=[];q.argument_sources=[];q.preconditions=[];delete q.scopes;}
function slot(q,answer,task,why){const key=String.fromCharCode(65+q.slots.length+(q.id==='rag-1'?3:0));q.slots.push({key,answer,task,why,alternatives:[],origin:'actual-recall'});return '{{'+key+'}}';}
function expr(q,text,task,why){if(q.code.split(text).length!==2)throw new Error(q.id+': nonunique '+text);q.code=q.code.replace(text,slot(q,text,task,why));}
function rhs(q,lhs,task,why,contains=''){
 const lines=q.code.split('\n'),matches=lines.map((line,i)=>({line,i,m:line.match(/^(\s*)([^=]+?)\s*=\s*(.*)$/)})).filter(x=>x.m&&x.m[2].trim()===lhs&&(!contains||x.m[3].includes(contains)));
 if(matches.length!==1)throw new Error(q.id+': assignment not unique '+lhs);
 const x=matches[0],m=x.m[3].match(/^(.*?)(\s+#.*)$/),answer=m?m[1]:x.m[3],start=x.line.indexOf(answer,x.m[1].length+lhs.length);
 lines[x.i]=x.line.slice(0,start)+slot(q,answer,task,why)+x.line.slice(start+answer.length);q.code=lines.join('\n');
}
function block(q,text,task,why){
 const lines=q.code.split('\n'),i=lines.findIndex(l=>l.trim()===text);if(i<0)throw new Error(q.id+': line missing '+text);
 const indent=lines[i].match(/^\s*/)[0],trailing=lines[i].match(/[ \t]*$/)[0];lines[i]=indent+slot(q,text,task,why)+trailing;q.code=lines.join('\n');
}
let q=qs[0];
q.prompt='PreferenceDataset과 custom_collate_fn 전체 문맥에서 복기된 토큰화 3곳과 prompt 마스킹 1곳을 복원하세요. 대입문은 오른쪽 식만, 마스킹은 한 줄 전체를 작성합니다.';
q.argument_sources=['tokenizer: PreferenceDataset 생성자 인자, encode 메서드 사용','prompt·chosen_response·rejected_response: 같은 반복문에서 준비된 문자열','prompt Tensor와 mask: custom_collate_fn 내부에서 생성됨'];
q.preconditions=['format_input과 Dataset·torch는 준비됨. chosen/rejected 전체 문장은 prompt 뒤에 \\n\\n### Response:\\n과 해당 응답을 연결','마스킹 범위는 이 노트북의 prompt 길이 + 2 규칙. 다른 노트북에 일반화하지 않음','prompt 변수는 Dataset 안에서는 문자열, collate 안에서는 토큰 ID Tensor'];
rhs(q,'prompt_tokens','프롬프트 문자열을 토큰 ID 목록으로 인코딩하세요.','문자열 prompt를 생성자 인자 tokenizer의 encode에 전달합니다.');
rhs(q,'chosen_full_tokens','prompt와 선호 응답을 지정된 Response 구분자로 연결해 인코딩하세요.','chosen에는 chosen_response를 연결합니다. prompt와 응답 전체를 한 번에 인코딩합니다.');
rhs(q,'rejected_full_tokens','동일 prompt와 비선호 응답을 연결해 인코딩하세요.','rejected에는 rejected_response를 연결합니다. chosen 응답을 잘못 재사용하지 않습니다.');
block(q,'mask[:prompt.shape[0] + 2] = False','prompt 길이 + 2 위치까지 손실 계산에서 제외하세요.','mask의 앞부분을 False로 바꿉니다. 답변 부분만 DPO 확률 비교에 사용하기 위한 노트북 규칙입니다.');
q=qs[1];q.prompt='Q/K/V의 헤드 축을 토큰 축 앞으로 이동하고, 마지막에 여러 헤드를 하나의 출력 차원으로 결합하세요. 네 칸 모두 대입문의 오른쪽 식입니다.';
q.argument_sources=['b·num_tokens: forward의 x.shape에서 추출','self.num_heads·self.head_dim·self.d_out: 생성자에서 설정','keys·queries·values는 view 이후 [B,T,H,Dh]'];q.preconditions=['D = H × Dh, 출력 문맥 벡터는 [B,T,D]','기존 점수·마스크·softmax·out_proj는 제공 코드 그대로 사용'];
for(const name of ['keys','queries','values'])rhs(q,name,'[B,T,H,Dh]를 [B,H,T,Dh]로 바꾸세요.','배치 축은 유지하고 토큰 축 1과 헤드 축 2를 교환합니다.','transpose');
rhs(q,'context_vec','연속 메모리를 확보하고 [B,T,D]로 헤드를 합치세요.','transpose 결과에 contiguous를 적용하고 b, num_tokens, self.d_out으로 view합니다.','contiguous');
q=qs[2];q.prompt='GPTModel 전체에서 토큰·위치 임베딩과 임베딩 Dropout을 생성하세요. 세 칸 모두 오른쪽 식이며 cfg의 값을 사용합니다.';
q.argument_sources=['cfg: GPTModel 생성자 인자','cfg 키: vocab_size, context_length, emb_dim, drop_rate','TransformerBlock·LayerNorm·nn·torch는 준비됨'];q.preconditions=['입력 ID [B,T] long, 임베딩 출력 [B,T,emb_dim]','Embedding 인자는 표의 행 수, 벡터 차원 순서'];
rhs(q,'self.tok_emb','어휘 ID를 emb_dim 벡터로 바꾸는 조회 표를 생성하세요.','표의 행 수는 vocab_size, 벡터 차원은 emb_dim입니다.');
rhs(q,'self.pos_emb','최대 문맥 길이만큼의 위치 조회 표를 생성하세요.','위치 ID 수는 context_length이고 벡터 차원은 토큰 임베딩과 같은 emb_dim입니다.');
rhs(q,'self.drop_emb','설정의 비율로 임베딩 Dropout을 생성하세요.','nn.Dropout에 cfg의 drop_rate를 전달합니다.');
q=qs[3];q.prompt='주어진 서버 변수로 Client와 ToolSpec을 만든 뒤 비동기 도구·리소스를 조회하세요. import와 주소는 제공 코드이며 출제하지 않습니다.';
q.argument_sources=['MCP_SERVER_URL: 실행 환경에서 제공되는 서버 주소 문자열','external_mcp_server: 바로 위 서버 변수','필요한 import는 모두 제공됨. 기존 답안 저장 ID 보존을 위해 빈칸 표시는 D부터 시작'];q.preconditions=['Jupyter의 최상위 await 사용 문맥','이 페이지는 외부 서버·API를 실제 호출하지 않음'];
rhs(q,'mcp_client','서버 주소를 사용해 MCP Client를 생성하세요.','BasicMCPClient에 external_mcp_server를 전달합니다.');
rhs(q,'mcp_tool','방금 생성한 Client를 ToolSpec에 연결하세요.','McpToolSpec의 client 인자로 mcp_client를 전달합니다.');
rhs(q,'tools','Agent에 전달할 도구 목록을 비동기로 가져오세요.','to_tool_list_async 호출 결과를 await합니다.');
rhs(q,'resources','서버의 리소스 목록을 비동기로 가져오세요.','fetch_resources 호출 결과를 await합니다.');
q=qs[4];q.prompt='사용자 복기에 포함된 KGQueryEngineWithMCP의 구성·도구 조회·Agent 연결·이벤트 처리·응답 반환 부분을 복원하세요. 선언과 원본 초기화 검사 등 주변 코드는 제공합니다.';
q.argument_sources=['mcp_tool_spec·model·llm: 생성자 인자. llm이 있으면 재사용','McpToolSpec, FunctionAgent, ToolCall, ToolCallResult, Context, Optional은 준비됨','OpenAI는 llama_index.llms.openai.OpenAI. SYSTEM_PROMPT는 앞 셀에서 제공','description 최대 길이 1000자, 초과 시 앞 1000자 + "..."','FunctionAgent 키워드 tools/llm/system_prompt의 값만 작성'];q.preconditions=['init_agent를 먼저 await한 다음 query 호출','Agent name과 설명 문자열은 원본대로 제공하며 암기하지 않음','verbose가 True일 때만 ToolCall/ToolCallResult 내용을 출력','호출 로그 형식: Calling tool {event.tool_name} with kwargs {event.tool_kwargs}','결과 로그 형식: Tool {event.tool_name} returned {event.tool_output}'];
rhs(q,'self.llm','전달된 llm을 우선 사용하고 없으면 지정 모델·temperature=0으로 생성하세요.','llm or OpenAI(...)로 선택합니다. model은 생성자 인자입니다.');
rhs(q,'self.mcp_tool_spec','생성자로 받은 ToolSpec을 인스턴스에 보관하세요.','이후 init_agent에서 사용할 mcp_tool_spec을 저장합니다.');
expr(q,'self.agent: Optional[FunctionAgent] = None','Agent 생성 전 상태를 타입 힌트와 함께 초기화하세요.','self.agent는 Optional[FunctionAgent]이며 초기에는 None입니다.');
expr(q,'self.agent_context: Optional[Context] = None','실행 Context 생성 전 상태를 초기화하세요.','self.agent_context는 Optional[Context]이며 초기에는 None입니다.');
rhs(q,'tools','저장한 ToolSpec에서 도구 목록을 비동기로 조회하세요.','self.mcp_tool_spec.to_tool_list_async()를 await합니다.','await');
expr(q,'for tool in tools:','각 도구를 순회하는 for 문을 작성하세요.','조회한 tools의 각 tool을 처리합니다.');
expr(q,'len(tool.metadata.description) > 1000','도구 설명이 1000자를 초과하는 조건을 작성하세요.','문자열 description의 길이를 비교합니다.');
rhs(q,'tool.metadata.description','설명을 1000자로 자르고 생략 표시를 덧붙이세요.','슬라이싱 [:1000]과 "..." 문자열 결합을 사용합니다.');
const agentPrefix='self.agent = FunctionAgent(';
if(!q.code.includes(agentPrefix))throw new Error('Missing actual Agent constructor');
q.code=q.code.replace(agentPrefix,'self.agent = '+slot(q,'FunctionAgent','도구 호출 Agent를 생성하는 클래스 이름을 작성하세요.','FunctionAgent에 도구·LLM·시스템 프롬프트를 연결합니다.')+'(');
for(const [name,value,task,why] of [['tools','tools','도구 목록을 Agent에 연결하세요. 값만 작성합니다.','조회 결과 tools를 tools 인자로 전달합니다.'],['llm','self.llm','저장된 LLM을 Agent에 연결하세요. 값만 작성합니다.','생성자에서 선택한 self.llm을 전달합니다.'],['system_prompt','SYSTEM_PROMPT','제공된 시스템 프롬프트를 연결하세요. 값만 작성합니다.','앞 셀의 SYSTEM_PROMPT를 사용합니다.']]){
 const text=name+'='+value;if(q.code.split(text).length!==2)throw new Error('Agent keyword missing '+name);
 q.code=q.code.replace(text,name+'='+slot(q,value,task,why));
}
rhs(q,'self.agent_context','생성한 Agent의 실행 Context를 만드세요.','Context 생성자에 self.agent를 전달합니다.');
rhs(q,'handler','질문과 저장된 Context로 Agent 실행 핸들러를 얻으세요.','run(question, ctx=self.agent_context)의 핸들러를 먼저 얻고 이벤트를 순회한 뒤 await합니다.');
expr(q,'async for event in handler.stream_events():','핸들러의 이벤트 스트림을 비동기로 순회하세요.','async for로 handler.stream_events()를 소비합니다.');
block(q,'if verbose and type(event) == ToolCall:','verbose일 때 도구 호출 이벤트인지 검사하는 if 문을 작성하세요.','원본은 type(event) == ToolCall 비교를 사용합니다.');
expr(q,'print(f"Calling tool {event.tool_name} with kwargs {event.tool_kwargs}")','호출 도구 이름과 인자를 제공 형식으로 출력하세요.','ToolCall의 tool_name과 tool_kwargs를 출력합니다.');
block(q,'elif verbose and type(event) == ToolCallResult:','verbose일 때 도구 결과 이벤트인지 검사하는 elif 문을 작성하세요.','ToolCallResult는 도구 실행 결과 이벤트입니다.');
expr(q,'print(f"Tool {event.tool_name} returned {event.tool_output}")','결과 이벤트의 도구 이름과 출력을 표시하세요.','ToolCallResult의 tool_name과 tool_output을 사용합니다.');
rhs(q,'response','핸들러를 기다려 최종 응답을 얻으세요.','이벤트 스트림 처리 후 await handler로 결과를 받습니다.');
expr(q,'return str(response)','응답을 문자열로 반환하세요.','query 반환형 str에 맞춰 응답을 변환합니다.');
q=qs[5];q.prompt='사용자와 영화의 32차원 임베딩을 만들고, 결합한 64차원 벡터를 32차원 hidden과 값 하나로 변환하세요. 모든 칸은 오른쪽 식입니다.';
q.argument_sources=['n_users·n_movies: 생성자 인자','사용자·영화 각각 embedding_dim=32','forward의 user_embedding·movie_embedding: [B,32]'];q.preconditions=['users·movies는 정수 ID Tensor [B]','결합은 feature 축 dim=1. 최종 출력 [B,1]'];
for(const [lhs,task,why] of [['self.user_embedding','사용자 ID용 32차원 임베딩을 생성하세요.','행 수 n_users, 벡터 차원 32.'],['self.movie_embedding','영화 ID용 32차원 임베딩을 생성하세요.','행 수 n_movies, 벡터 차원 32.'],['self.fc1','결합 벡터 64차원을 hidden 32차원으로 변환하세요.','사용자 32 + 영화 32 = 64 입력입니다.'],['self.relu','ReLU 활성화 모듈을 생성하세요.','nn.ReLU()는 비선형 변환입니다.'],['self.fc2','hidden 32차원을 예측값 하나로 바꾸세요.','nn.Linear의 입력/출력 인자 순서를 확인합니다.'],['input_embedding','사용자·영화 임베딩을 feature 축으로 결합하세요.','torch.cat의 dim=1로 [B,64]를 만듭니다.']])rhs(q,lhs,task,why);
q=qs[6];q.prompt='학습에는 32×32 padding=4 랜덤 crop·좌우 반전·텐서 변환·채널 정규화를, 평가에는 텐서 변환·정규화만 구성하세요. Compose 함수 이름과 리스트의 각 호출을 복원합니다.';
q.argument_sources=['T: torchvision.transforms','CIFAR10_MEAN·CIFAR10_STD: 코드 상단에 제공된 채널 통계','crop 크기=32, padding=4, 반전은 기본 확률'];q.preconditions=['입력: RGB PIL 이미지, 출력: float [3,32,32]','원본 주석 -2.5~2.5는 대략적 표현이며 엄밀한 출력 범위 제한이 아님'];
// Process occurrences in physical order so repeated test/train calls are distinct blanks.
const targetCalls=['T.Compose','T.RandomCrop(32, padding=4)','T.RandomHorizontalFlip()','T.ToTensor()','T.Normalize(CIFAR10_MEAN, CIFAR10_STD)','T.Compose','T.ToTensor()','T.Normalize(CIFAR10_MEAN, CIFAR10_STD)'];
for(let i=0;i<targetCalls.length;i++){const text=targetCalls[i],pos=q.code.indexOf(text);if(pos<0)throw new Error('Transform target missing');q.code=q.code.slice(0,pos)+slot(q,text,i===0||i===5?'여러 변환을 순서대로 묶는 T의 함수 이름을 작성하세요.':i<5?'학습 리스트에서 주석과 제시 조건에 맞는 변환 호출을 작성하세요.':'평가 리스트의 변환 호출을 작성하세요.','학습은 증강 → ToTensor → Normalize, 평가는 ToTensor → Normalize입니다.')+q.code.slice(pos+text.length);}
q=qs[7];q.prompt='ResNet18의 첫 합성곱을 CIFAR-10 RGB 32×32 입력에 맞게 교체하세요. model.conv1의 오른쪽 호출식만 작성합니다. maxpool과 fc는 오늘 추가 확인된 출제 대상이 아니므로 그대로 제공합니다.';
q.argument_sources=['model: 함수 앞부분에서 생성한 ResNet18','입력 채널 3, 출력 채널 64, kernel_size=3','stride=1, padding=1, bias=False 조건 제공'];q.preconditions=['입력 [B,3,32,32] → 첫 conv 출력 [B,64,32,32]','숫자를 추측하는 문제가 아니라 제공된 CIFAR용 stem 조건을 연결하는 문제'];
rhs(q,'model.conv1','제시한 조건으로 2차원 합성곱 레이어를 생성하세요.','nn.Conv2d의 첫 두 인자는 입력/출력 채널입니다. stride=1, padding=1로 공간 크기를 유지합니다.');
q=qs[8];q.prompt='사용자 복기에 포함된 weight_scale shape 변환, float 변환, 출력 scale 환산·영점 이동·반올림 및 범위 제한을 복원하세요. 모두 오른쪽 식입니다.';
q.argument_sources=['input_scale·weight_scale·output_scale·output_zero_point·feature_bitwidth: 함수 인자','output: 위 conv 누산 결과 [B,Cout,H,W]','get_quantized_range(bitwidth)는 (최솟값,최댓값)을 반환하는 준비된 helper'];q.preconditions=['이 원본 실습은 int8 입출력을 전제. 임의 dtype의 일반 코드로 해석하지 않음','weight_scale은 출력 채널별 값이며 [1,Cout,1,1]로 broadcast','bias는 입력 zero point 보정이 포함된 shifted quantized bias라는 원본 전제'];
rhs(q,'weight_scale','출력 channel 축에 맞춰 scale을 [1,Cout,1,1]로 바꾸세요.','flatten한 뒤 view(1,-1,1,1)로 맞춥니다.');
rhs(q,'output','소수 scale 계산을 위해 output을 실수로 변환하세요.','정수 누산 결과에 float 배율을 적용하기 위해 float()를 사용합니다.','output.float()');
rhs(q,'output','입력·가중치의 누산 단위를 출력 scale 단위로 환산하세요.','input_scale × weight_scale / output_scale 배율을 곱합니다.','input_scale');
rhs(q,'output','출력의 zero point만큼 이동하세요.','output_zero_point를 더합니다.','output_zero_point');
rhs(q,'output','반올림·bit폭 범위 제한 후 int8로 변환하세요.','round → clamp(*get_quantized_range(feature_bitwidth)) → to(torch.int8) 순서입니다.','get_quantized_range');
q=qs[9];q.prompt='그룹별 최소·최대가 주어진 상태에서 unsigned n_bit 범위, scale·zero point, 양자화와 실수 복원 식을 작성하세요. 모두 오른쪽 식입니다.';
q.argument_sources=['w·n_bit·q_group_size: 함수 인자','max_val·min_val: 위에서 각 행/그룹별로 계산한 값','scales·zeros: 앞 빈칸에서 계산하는 행/그룹별 계수'];q.preconditions=['정수 표현 범위는 0..2**n_bit-1','최소 분모 안정값은 1e-5, zero point와 양자화 값 모두 범위 제한','마지막은 실수 복원하므로 실제 정수 저장 압축이 아닌 의사 양자화'];
rhs(q,'max_int','n_bit로 표현할 unsigned 최댓값을 계산하세요.','표현 가능한 값은 2의 n_bit승 개, 최댓값은 거기서 1을 뺀 값입니다.');
rhs(q,'scales','실수 범위에 최소 안정값을 적용한 뒤 정수 범위로 나누세요.','(max_val-min_val).clamp(min=1e-5)를 max_int로 나눕니다.');
rhs(q,'zeros','최솟값에 대응하는 영점 이동량을 반올림하고 범위를 제한하세요.','-round(min_val/scales)에 0..max_int clamp를 적용합니다.');
rhs(q,'w','실수 값을 정수 격자로 매핑하고 범위를 제한하세요.','w/scales 반올림 → zeros 더하기 → clamp.','torch.clamp');
rhs(q,'w','양자화된 값을 다시 실수 단위로 복원하세요.','zeros를 빼고 scales를 곱합니다.','(w - zeros)');
for(const item of qs){if(item.slots.length>26)throw new Error('Too many marker letters');item.source=`${item.notebook} · 원본 셀 ${item.source_cells.join(', ')} · 사용자 확인 실제 기출`;}
const out=path.join(ROOT,'exam-recall-october');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'questions.js'),'// Generated by tools/build-october-recall.cjs; no API keys or live requests.\nwindow.OCTOBER_RECALL = '+JSON.stringify(qs,null,2)+';\n');
console.log(`Built October recall: ${qs.length} groups, ${qs.reduce((n,q)=>n+q.slots.length,0)} blanks`);
