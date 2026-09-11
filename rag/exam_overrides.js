(() => {
  "use strict";
  const course = window.LLM_COURSE;
  const chapter = course.chapters.find((item) => item.file === "1. Llama_index.ipynb");
  if (!chapter) return;

  chapter.notebook_goal = "문서를 LlamaIndex Document로 읽고 chunk·embedding index를 구성한 뒤 검색 결과를 LLM 응답으로 합성한다.";
  chapter.summary = "문서 로딩→청킹→벡터 인덱싱→검색→응답 합성의 RAG 기본 흐름과 인덱스 CRUD를 코드로 연결합니다.";
  chapter.capability = "전후 변수와 RAG 단계의 입출력을 근거로 LlamaIndex의 핵심 호출을 독립적으로 복원할 수 있다.";
  chapter.overview = {
    title: "문서가 근거 기반 답변이 되는 LlamaIndex 흐름",
    subtitle: "원문을 검색 가능한 node로 바꾸고 질문과 가까운 node를 찾아 LLM이 답을 합성한다.",
    steps: [
      {label:"문서 로딩",code:'SimpleDirectoryReader("data").load_data()',flow:"파일 → list[Document]"},
      {label:"청킹",code:"SentenceSplitter(chunk_size, chunk_overlap)",flow:"Document → Nodes"},
      {label:"벡터 인덱스",code:"VectorStoreIndex.from_documents(...) ",flow:"Nodes → embeddings/index"},
      {label:"검색",code:"retriever.retrieve(query)",flow:"query → relevant nodes"},
      {label:"응답 합성",code:"synthesizer.synthesize(query, nodes)",flow:"query + context → answer"}
    ],
    rules: [
      "Reader의 출력 documents가 index 생성의 입력이 된다.",
      "사용자 정의 splitter는 from_documents의 transformations 목록에 넣는다.",
      "as_retriever는 검색 전용, as_query_engine은 검색과 응답 생성을 한 번에 연결한다.",
      "CustomQueryEngine은 먼저 retrieve하고 그 nodes를 synthesize 또는 prompt에 넣는다.",
      "문서를 변경한 뒤에는 index의 insert·update_ref_doc·delete_ref_doc를 호출해야 검색 결과가 바뀐다."
    ]
  };
  chapter.key_points = [
    {title:"Load & Index",purpose:"폴더의 파일을 Document 목록으로 읽고 embedding 기반 index를 만듭니다.",code:'documents = SimpleDirectoryReader("data").load_data()\nindex = VectorStoreIndex.from_documents(documents)',flow:"files → Documents → vector index",watch:"from_documents에는 Reader 객체가 아니라 load_data 결과를 전달합니다."},
    {title:"Chunk 설정",purpose:"검색 근거의 크기와 문맥 중복을 지정합니다.",code:"splitter = SentenceSplitter(chunk_size=200, chunk_overlap=50)\nVectorStoreIndex.from_documents(documents, transformations=[splitter])",flow:"Document → overlapping nodes",watch:"chunk_overlap은 chunk_size보다 작아야 합니다."},
    {title:"Retrieve & Synthesize",purpose:"질문 관련 node를 검색한 뒤 그 근거로 답을 합성합니다.",code:"nodes = retriever.retrieve(query_str)\nresponse = synthesizer.synthesize(query_str, nodes)",flow:"query → nodes → response",watch:"synthesize의 두 번째 인자는 원문 전체가 아니라 검색 nodes입니다."},
    {title:"Index CRUD",purpose:"추가·수정·삭제된 문서가 검색 결과에 반영되도록 index를 갱신합니다.",code:"index.insert(doc)\nindex.update_ref_doc(doc)\nindex.delete_ref_doc(doc.doc_id)",flow:"Document mutation → index mutation",watch:"내용만 set_content하고 index update를 생략하면 검색 index가 갱신되지 않습니다."}
  ];
  chapter.theory_guide = [
    {title:"RAG의 두 단계",concept:"Retrieval은 근거를 찾고 Generation은 그 근거를 사용해 답합니다.",flow:"query → retriever → nodes → synthesizer/LLM → answer",code_signal:"retrieve 다음 줄에서 nodes가 synthesize나 prompt context로 전달되는지 봅니다.",exam_clue:"검색 결과 변수는 답 자체가 아니라 생성 단계의 입력입니다."},
    {title:"객체 변환 흐름",concept:"각 LlamaIndex 객체는 다음 단계에서 요구하는 인터페이스로 변환됩니다.",flow:"documents → index → retriever/query_engine",code_signal:"오른쪽의 from_documents, as_retriever, as_query_engine과 왼쪽 변수명을 대응시킵니다.",exam_clue:"동사가 load, index, retrieve, query 중 무엇인지 먼저 구분합니다."},
    {title:"Custom Query Engine",concept:"custom_query에서 검색과 합성 순서를 명시해 기본 query engine을 확장합니다.",flow:"query_str → retrieve → context/nodes → complete/synthesize",code_signal:"retriever와 response_synthesizer 또는 llm이 클래스 field로 선언돼 있습니다.",exam_clue:"함수 인자 query_str은 검색과 합성 양쪽에 공통으로 전달됩니다."},
    {title:"Index 갱신",concept:"Document 객체의 내용과 검색 index의 상태는 별도로 갱신해야 합니다.",flow:"set_content → update_ref_doc / doc_id → delete_ref_doc",code_signal:"docu와 index 두 객체 중 어느 쪽의 메서드인지 확인합니다.",exam_clue:"문서 내용 변경은 docu, 검색 반영은 index가 담당합니다."}
  ];

  const cells = {
    "exam-rag1-load-index": `documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)`,
    "exam-rag1-chunk-index": `text_splitter = SentenceSplitter(chunk_size=200, chunk_overlap=50)
index = VectorStoreIndex.from_documents(
    documents=documents,
    transformations=[text_splitter]
)`,
    "exam-rag1-query": `query_engine = index.as_query_engine()
response = query_engine.query("What is the first programs the author tried writing?")`,
    "exam-rag1-retrieve": `retriever = index.as_retriever()
ret_passages = retriever.retrieve("Who is the author?")`,
    "exam-rag1-standard": `nodes = self.retriever.retrieve(query_str)
response_obj = self.response_synthesizer.synthesize(query_str, nodes)`,
    "exam-rag1-insert": `docu = Document(text=data_text, id_="new_doc_id")
index.insert(docu)
new_query_engine = index.as_query_engine()`,
    "exam-rag1-update-delete": `docu.set_content(value=updated_text)
output = index.update_ref_doc(
    docu,
    update_kwargs={"delete_kwargs": {"delete_from_docstore": True}},
)
id = docu.doc_id
index.delete_ref_doc(id, delete_from_docstore=True)`,
    "exam-rag1-custom": `nodes = self.retriever.retrieve(query_str)
context_str = "\\n\\n".join([n.node.get_content() for n in nodes])
response = self.llm.complete(
    self.qa_prompt.format(context_str=context_str, query_str=query_str)
)`
  };
  Object.entries(cells).forEach(([id, source]) => { course.cells[id] = {source}; });
  const base = {subject:"RAG",chapterId:chapter.id,chapterNumber:chapter.number,chapterTitle:chapter.title,file:chapter.file,occurrence:0,isSourceBlank:false,source_type:"원본 YOUR CODE HERE 셀 기반"};
  const make = (data) => ({...base, accepted_answers:[data.answer], ...data});
  chapter.subjective = [
    make({id:"exam-rag01-01",topic:"문서 로딩과 Index",difficulty:"2 · 핵심 연결",sourceId:"exam-rag1-load-index",prompt:"data 폴더를 Document 목록으로 읽고 VectorStoreIndex를 만드는 완성된 두 줄을 작성하세요.",answer:cells["exam-rag1-load-index"],problem_context:`# TODO: 폴더의 파일을 읽어 documents를 만들고 vector index로 연결하세요.
documents = ????("data").????()
index = ????.????(documents)`,explanation:"SimpleDirectoryReader가 파일을 list[Document]로 바꾸고 from_documents가 node 분할·embedding·vector index 구성을 수행합니다.",tensor_flow:"files → list[Document] → nodes/embeddings → VectorStoreIndex",code_signal:"왼쪽 documents와 index, import된 SimpleDirectoryReader와 VectorStoreIndex가 단계별로 대응합니다.",retry:"Reader의 결과가 다음 줄 어느 인자로 들어가는지 화살표로 연결해 다시 쓰세요."}),
    make({id:"exam-rag01-02",topic:"Chunk Transformation",difficulty:"3 · 인자 구성",sourceId:"exam-rag1-chunk-index",prompt:"200 크기·50 중복의 splitter를 만들고 index 생성 시 적용하는 완성 코드를 작성하세요.",answer:cells["exam-rag1-chunk-index"],problem_context:`# TODO: 검색 단위를 정하고 from_documents에 transformation으로 전달하세요.
text_splitter = SentenceSplitter(chunk_size=????, chunk_overlap=????)
index = VectorStoreIndex.from_documents(
    documents=documents,
    ????=[text_splitter]
)`,explanation:"SentenceSplitter는 문서를 작은 node로 나눕니다. from_documents의 transformations 목록에 넣어 index 생성 과정에서 같은 규칙을 적용합니다.",tensor_flow:"Documents → SentenceSplitter → overlapping Nodes → Index",code_signal:"여러 전처리 변환을 받을 수 있어 인자명이 복수형 transformations이고 값도 list입니다.",retry:"크기·중복 숫자와 transformations=[객체]를 분리해 확인하세요."}),
    make({id:"exam-rag01-03",topic:"Query Engine",difficulty:"2 · 실행 흐름",sourceId:"exam-rag1-query",prompt:"index를 query engine으로 변환하고 질문을 실행하는 두 줄을 작성하세요.",answer:cells["exam-rag1-query"],problem_context:`# TODO: 검색과 응답 합성이 결합된 query engine으로 질문하세요.
query_engine = index.????()
response = query_engine.????("What is the first programs the author tried writing?")`,explanation:"as_query_engine()은 index 검색과 LLM 응답 합성을 묶은 인터페이스를 만들고 query()가 자연어 질문을 실행합니다.",tensor_flow:"Index → QueryEngine; str query → Response",code_signal:"왼쪽 query_engine과 response가 각각 as_query_engine, query 동사를 요구합니다.",retry:"객체 생성 단계와 실제 질의 단계의 메서드를 구분해 다시 쓰세요."}),
    make({id:"exam-rag01-04",topic:"Retriever",difficulty:"2 · 검색 전용",sourceId:"exam-rag1-retrieve",prompt:"index에서 검색기를 만들고 저자 질문과 관련된 passage를 검색하는 두 줄을 작성하세요.",answer:cells["exam-rag1-retrieve"],problem_context:`# TODO: 생성 없이 관련 node만 반환하는 검색 흐름을 완성하세요.
retriever = index.????()
ret_passages = retriever.????("Who is the author?")`,explanation:"as_retriever()는 검색만 담당하는 객체를 만들며 retrieve() 결과는 답변 문자열이 아니라 관련 NodeWithScore 목록입니다.",tensor_flow:"Index → Retriever; query str → list[NodeWithScore]",code_signal:"결과명이 response가 아니라 ret_passages이므로 query engine이 아닌 retriever 경로입니다.",retry:"as_query_engine/query와 as_retriever/retrieve 쌍을 대비해 다시 작성하세요."}),
    make({id:"exam-rag01-05",topic:"검색과 응답 합성",difficulty:"3 · 함수 구현",sourceId:"exam-rag1-standard",prompt:"StandardQueryEngine.custom_query에서 검색한 nodes를 응답 합성기에 전달하는 두 줄을 작성하세요.",answer:cells["exam-rag1-standard"],problem_context:`class StandardQueryEngine(CustomQueryEngine):
    retriever: BaseRetriever
    response_synthesizer: BaseSynthesizer

    def custom_query(self, query_str: str):
        nodes = self.retriever.????(query_str)
        response_obj = self.response_synthesizer.????(query_str, nodes)
        return response_obj`,explanation:"Custom query의 핵심 순서는 retrieve → synthesize입니다. 같은 query_str로 근거를 찾고, 찾은 nodes를 두 번째 인자로 합성기에 전달합니다.",tensor_flow:"query_str → nodes → response_obj",code_signal:"클래스 field 이름 retriever/response_synthesizer와 결과 변수 nodes/response_obj가 메서드를 알려줍니다.",retry:"첫 줄의 출력 nodes가 둘째 줄의 어느 위치로 전달되는지 확인하세요."}),
    make({id:"exam-rag01-06",topic:"Document Insert",difficulty:"2 · Index CRUD",sourceId:"exam-rag1-insert",prompt:"새 문서를 ID와 함께 만들고 index에 삽입한 뒤 새 query engine을 만드는 세 줄을 작성하세요.",answer:cells["exam-rag1-insert"],problem_context:`data_text = "Natural diamonds are formed ..."
# TODO: Document 생성 → index 삽입 → query engine 재생성
docu = Document(text=data_text, ????="new_doc_id")
index.????(docu)
new_query_engine = index.????()`,explanation:"Document의 명시적 식별자 인자는 id_이며 insert가 해당 문서를 검색 index에 추가합니다. 이후 index 상태를 사용하는 query engine을 다시 얻습니다.",tensor_flow:"text + id → Document → updated Index → QueryEngine",code_signal:"Document 생성자의 ID 인자는 Python 내장 id와 구분되는 id_이고 CRUD 동사는 insert입니다.",retry:"세 줄의 주체가 Document → index → index 순서인지 확인하세요."}),
    make({id:"exam-rag01-07",topic:"Document Update·Delete",difficulty:"3 · 상태 갱신",sourceId:"exam-rag1-update-delete",prompt:"문서 내용을 바꾸고 index를 갱신한 뒤 doc_id를 이용해 docstore에서도 삭제하는 전체 코드를 작성하세요.",answer:cells["exam-rag1-update-delete"],problem_context:`# TODO: Document 내용과 Index 상태를 순서대로 변경하세요.
docu.????(value=updated_text)
output = index.????(
    docu,
    update_kwargs={"delete_kwargs": {"delete_from_docstore": True}},
)
id = docu.????
index.????(id, delete_from_docstore=True)`,explanation:"set_content는 Document 본문을 바꾸고 update_ref_doc가 index 표현을 갱신합니다. update_kwargs는 기존 node를 docstore에서도 지우고 다시 구성하도록 합니다. 마지막 삭제는 doc_id를 delete_ref_doc에 전달합니다.",tensor_flow:"Document content change → Index update → ID lookup → Index/docstore delete",code_signal:"내용 변경은 docu 메서드, 검색 상태 변경은 index 메서드라는 주체 차이와 원본 update_kwargs를 봅니다.",retry:"set_content → update_ref_doc → doc_id → delete_ref_doc 순서를 적은 뒤 전체 블록을 다시 쓰세요."}),
    make({id:"exam-rag01-08",topic:"Custom Prompt RAG",difficulty:"3 · 전체 연결",sourceId:"exam-rag1-custom",prompt:"검색 node의 내용을 context로 합치고 prompt를 채운 뒤 LLM을 호출하는 완성 코드를 작성하세요.",answer:cells["exam-rag1-custom"],problem_context:`def custom_query(self, query_str: str):
    nodes = self.retriever.????(query_str)
    context_str = "\\n\\n".join([n.node.????() for n in nodes])
    response = self.llm.????(
        self.qa_prompt.????(context_str=context_str, query_str=query_str)
    )
    return str(response)`,explanation:"retrieve로 근거 node를 얻고 get_content로 문자열을 추출합니다. PromptTemplate.format에 context와 query를 넣은 결과를 llm.complete에 전달합니다.",tensor_flow:"query → Nodes → context str → formatted prompt → LLM response",code_signal:"qa_prompt의 자리표시자 context_str/query_str와 llm field가 format → complete 중첩 호출을 결정합니다.",retry:"검색, 내용 추출, prompt 채움, LLM 호출의 네 동사를 순서대로 적으세요."})
  ];
  chapter.mcq = [
    {id:"exam-rag01-m1",source_question_id:"exam-rag01-01",topic:"문서→Index",prompt:"폴더 문서를 검색 가능한 vector index로 만드는 올바른 연결은?",answer_index:2,explanation:"load_data 결과 documents를 from_documents에 전달합니다.",choices:[{text:'VectorStoreIndex("data")',why:"경로를 직접 받는 생성 흐름이 아닙니다."},{text:'SimpleDirectoryReader(documents).as_index()',why:"Reader의 인자와 메서드가 틀립니다."},{text:'documents = SimpleDirectoryReader("data").load_data(); index = VectorStoreIndex.from_documents(documents)',why:"문서 로딩과 index 생성 순서가 맞습니다."},{text:'documents = VectorStoreIndex.load_data("data")',why:"역할이 뒤바뀌었습니다."},{text:'index = SimpleDirectoryReader.from_documents(documents)',why:"Reader와 Index 클래스의 역할이 반대입니다."}]},
    {id:"exam-rag01-m2",source_question_id:"exam-rag01-02",topic:"Chunk 적용",prompt:"사용자 지정 SentenceSplitter를 index 생성에 적용하는 인자는?",answer_index:4,explanation:"transformations는 적용할 변환 객체 목록을 받습니다.",choices:[{text:"parser=text_splitter",why:"해당 인자명이 아닙니다."},{text:"documents=text_splitter",why:"문서 대신 parser를 전달합니다."},{text:"chunk_size=text_splitter",why:"숫자 자리에 객체를 전달합니다."},{text:"transform=text_splitter",why:"단수 인자와 직접 객체 형태가 아닙니다."},{text:"transformations=[text_splitter]",why:"변환 목록에 splitter를 넣는 올바른 형태입니다."}]},
    {id:"exam-rag01-m3",source_question_id:"exam-rag01-04",topic:"검색 전용 인터페이스",prompt:"LLM 답변 없이 관련 node만 필요할 때 사용할 조합은?",answer_index:1,explanation:"Retriever의 retrieve가 관련 node 목록만 반환합니다.",choices:[{text:"as_query_engine() + query()",why:"검색과 생성이 결합됩니다."},{text:"as_retriever() + retrieve()",why:"검색 전용 경로입니다."},{text:"as_retriever() + query()",why:"Retriever의 실행 메서드가 아닙니다."},{text:"as_query_engine() + retrieve()",why:"QueryEngine의 일반 실행 메서드가 아닙니다."},{text:"from_documents() + complete()",why:"index 생성과 LLM 호출을 직접 잘못 연결했습니다."}]},
    {id:"exam-rag01-m4",source_question_id:"exam-rag01-05",topic:"CustomQueryEngine 순서",prompt:"검색 근거로 답을 합성하는 올바른 순서는?",answer_index:0,explanation:"먼저 retrieve하고 그 nodes를 synthesize에 전달합니다.",choices:[{text:"nodes = retriever.retrieve(q); response = synthesizer.synthesize(q, nodes)",why:"검색→합성 흐름이 맞습니다."},{text:"response = retriever.synthesize(q)",why:"Retriever는 합성하지 않습니다."},{text:"nodes = synthesizer.retrieve(q)",why:"Synthesizer는 검색하지 않습니다."},{text:"response = synthesizer.synthesize(nodes, q)",why:"query와 nodes 인자 순서가 반대입니다."},{text:"response = retriever.retrieve(synthesizer)",why:"질문 대신 객체를 검색 인자로 전달합니다."}]},
    {id:"exam-rag01-m5",source_question_id:"exam-rag01-07",topic:"Index 갱신",prompt:"Document 본문 수정이 검색에 반영되도록 하는 순서는?",answer_index:3,explanation:"문서 내용을 바꾼 후 index의 update_ref_doc를 호출합니다.",choices:[{text:"index.set_content(text)",why:"본문 변경은 Document의 역할입니다."},{text:"docu.update_ref_doc(index)",why:"index 갱신 메서드의 주체가 반대입니다."},{text:"index.update_ref_doc(docu); docu.set_content(text)",why:"이전 내용으로 먼저 갱신합니다."},{text:"docu.set_content(value=text); index.update_ref_doc(docu)",why:"내용 변경 후 index 갱신 순서가 맞습니다."},{text:"docu.set_content(value=text)",why:"Document만 바뀌고 vector index 갱신이 빠졌습니다."}]}
  ];
  chapter.questionCount = chapter.subjective.length;
  chapter.exam_design = {version:2,style:"원본 YOUR CODE HERE 기반 함수 문맥 구현형",difficulty:["핵심 API 연결","검색·합성 흐름","CRUD·Custom Engine"],excluded:["API 키","URL","로컬 경로","설치 명령"]};
})();

(() => {
  "use strict";
  const course = window.LLM_COURSE;
  const chapter = course.chapters.find((item) => item.file === "1. Data_preprocessing.ipynb");
  if (!chapter) return;

  chapter.notebook_goal = "압축 JSONL 평가 데이터를 안전하게 읽고 검색 결과 HTML을 정제·문장 분할하여 RAG가 사용할 근거 chunk로 변환한다.";
  chapter.summary = "CRAG의 압축 JSONL을 레코드 목록으로 구성하고 query·answer·search_results schema를 확인한 뒤 HTML 본문을 문장 단위 chunk로 바꿉니다.";
  chapter.capability = "압축 데이터 로딩부터 예외 처리, 필드 선택, HTML 정제, 문장 offset slicing까지 전처리 파이프라인을 구현할 수 있다.";
  chapter.overview = {
    title: "압축 CRAG 데이터가 검색 근거 Chunk가 되는 과정",
    subtitle: "한 줄씩 파싱한 평가 레코드에서 웹 검색 HTML을 꺼내 모델 입력에 적합한 일반 텍스트 조각으로 바꾼다.",
    steps: [
      {label:"압축 읽기",code:"bz2.open(path, 'rt')",flow:".jsonl.bz2 → text lines"},
      {label:"JSON 파싱",code:"json.loads(line.strip())",flow:"line → dict"},
      {label:"Dataset",code:"dataset.append(data)",flow:"dicts → list[dict]"},
      {label:"HTML 정제",code:"BeautifulSoup(html, 'lxml').get_text(...) ",flow:"page_result → plain text"},
      {label:"문장 Chunk",code:"offsets → text[start:end][:4000]",flow:"text → evidence chunks"}
    ],
    rules: [
      "JSONL은 파일 전체가 하나의 JSON이 아니라 각 줄이 독립 레코드이므로 줄별 loads가 필요하다.",
      "bz2를 text mode로 열어야 json.loads에 문자열을 바로 전달할 수 있다.",
      "파싱 실패 레코드는 JSONDecodeError로 처리해 전체 전처리가 중단되지 않게 한다.",
      "검색 근거 본문은 search_results 각 항목의 page_result에 있으며 HTML 태그를 제거해야 한다.",
      "문장 함수가 반환한 start/end offset으로 원문을 slice해야 문장 경계가 보존된다."
    ]
  };
  chapter.key_points = [
    {title:"BZ2 JSONL 로딩",purpose:"압축 파일을 풀어 쓰지 않고 줄 단위로 레코드를 읽습니다.",code:"with bz2.open(file_path, 'rt') as file:\n    for line in file:\n        data = json.loads(line.strip())",flow:"compressed bytes → text line → dict",watch:"open 모드는 'rt', JSON 변환은 loads입니다."},
    {title:"Schema 선택",purpose:"질문·정답·검색 결과를 각 평가 목적에 맞게 꺼냅니다.",code:"query = item['query']\nanswer = item['answer']\nresults = item['search_results']",flow:"record dict → task fields",watch:"검색 결과는 문자열 하나가 아니라 page dictionary 목록입니다."},
    {title:"HTML 정제",purpose:"웹 페이지 HTML에서 사람이 읽을 수 있는 본문 텍스트만 추출합니다.",code:"soup = BeautifulSoup(page['page_result'], features='lxml')\ntext = soup.get_text(' ', strip=True)",flow:"HTML string → parsed tree → plain text",watch:"page_snippet이 아니라 전체 page_result를 사용합니다."},
    {title:"문장 경계 Chunk",purpose:"문장 offset으로 텍스트를 자르고 지나치게 긴 근거를 제한합니다.",code:"_, offsets = text_to_sentences_and_offsets(text)\nfor start, end in offsets:\n    chunk = text[start:end][:4000]",flow:"text → offsets → chunks",watch:"offset 자체가 아니라 offset으로 slice한 문자열을 저장합니다."}
  ];
  chapter.theory_guide = [
    {title:"JSONL",concept:"JSON Lines는 한 줄마다 독립적인 JSON 객체를 저장하는 형식입니다. 큰 파일을 전체 메모리에 올리지 않고 순차 처리할 수 있습니다.",flow:"line → strip → json.loads → dict",code_signal:"for line in file 안에서 loads와 append가 반복됩니다.",exam_clue:"json.load(file)이 아니라 json.loads(line)입니다."},
    {title:"압축 Text Mode",concept:"BZ2는 압축 형식이고 'rt'는 압축 해제 결과를 문자열로 읽는 모드입니다.",flow:"compressed file → decompressed str iterator",code_signal:"확장자 .bz2와 import bz2가 보이면 bz2.open을 사용합니다.",exam_clue:"바이너리 'rb'이면 별도 decode가 필요하므로 이 실습에서는 'rt'입니다."},
    {title:"HTML Parsing",concept:"BeautifulSoup은 HTML 구조를 해석하고 get_text는 태그를 제외한 본문을 만듭니다.",flow:"page_result HTML → soup → normalized text",code_signal:"features='lxml', get_text(' ', strip=True)가 연속됩니다.",exam_clue:"검색 snippet이 아닌 page_result를 parser에 전달합니다."},
    {title:"Offset slicing",concept:"Offset은 각 문장의 시작·끝 문자 위치입니다. 원문을 그 범위로 잘라 문장 경계를 유지합니다.",flow:"text → [(start,end)] → text[start:end]",code_signal:"for start, end in offsets 다음 줄의 slice를 확인합니다.",exam_clue:"4000 제한은 offset 계산 전이 아니라 추출된 문장 chunk 뒤에 적용됩니다."}
  ];

  const cells = {
    "exam-rag3-load": `dataset = []
with bz2.open(file_path, 'rt') as file:
    for line in file:
        try:
            data = json.loads(line.strip())
            dataset.append(data)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")`,
    "exam-rag3-domain": `unique_domains = {}
for item in dataset:
    if 'domain' in item:
        domain_value = item['domain']
        if domain_value not in unique_domains:
            unique_domains[domain_value] = item`,
    "exam-rag3-fields": `question = example_item['query']
answer = example_item['answer']`,
    "exam-rag3-results": `for page in example_data['search_results']:
    print(len(page['page_name']))
    print(len(page['page_snippet']))
    print(len(page['page_result']))`,
    "exam-rag3-html": `soup = BeautifulSoup(html_text["page_result"], features="lxml")
text = soup.get_text(" ", strip=True)`,
    "exam-rag3-chunk": `_, offsets = text_to_sentences_and_offsets(text)
for start, end in offsets:
    chunk = text[start:end][:4000]
    all_chunks.append(chunk)`
  };
  Object.entries(cells).forEach(([id, source]) => { course.cells[id] = {source}; });
  const base = {subject:"RAG",chapterId:chapter.id,chapterNumber:chapter.number,chapterTitle:chapter.title,file:chapter.file,occurrence:0,isSourceBlank:false,source_type:"원본 YOUR CODE HERE 셀 기반"};
  const make = (data) => ({...base,accepted_answers:[data.answer],...data});
  chapter.subjective = [
    make({id:"exam-rag03-01",topic:"BZ2 JSONL Dataset",difficulty:"3 · 전체 전처리",sourceId:"exam-rag3-load",prompt:"압축 JSONL을 text mode로 열어 각 줄을 파싱하고, 오류 행은 건너뛰며 dataset에 저장하는 전체 블록을 작성하세요.",answer:cells["exam-rag3-load"],problem_context:`dataset = []
with ????.open(file_path, '????') as file:
    for line in file:
        try:
            data = ????.loads(line.????())
            dataset.????(data)
        except ????.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")`,explanation:"bz2.open(...,'rt')이 압축을 해제한 문자열 줄을 제공합니다. strip 후 json.loads로 dict를 만들고 append합니다. JSONDecodeError만 잡아 손상된 한 줄 때문에 전체 작업이 멈추지 않게 합니다.",tensor_flow:".jsonl.bz2 → iterator[str] → dict → list[dict]",code_signal:"파일 확장자와 import bz2/json, dataset 초기값 [], 줄 반복 구조가 각 API를 지시합니다.",retry:"열기·파싱·저장·예외 처리 네 단계를 한 줄씩 적고 다시 구현하세요."}),
    make({id:"exam-rag03-02",topic:"Domain 대표 레코드",difficulty:"2 · Dictionary 구성",sourceId:"exam-rag3-domain",prompt:"각 domain에서 처음 만난 레코드 하나만 unique_domains에 저장하는 블록을 작성하세요.",answer:cells["exam-rag3-domain"],problem_context:`unique_domains = {}
for item in dataset:
    if 'domain' in item:
        domain_value = item[????]
        if domain_value not in unique_domains:
            unique_domains[????] = ????`,explanation:"domain 값을 key로 사용하고 전체 item을 value로 저장하면 뒤에서 해당 domain의 query와 answer를 함께 꺼낼 수 있습니다. 이미 있는 key는 덮어쓰지 않습니다.",tensor_flow:"list[record] → dict[domain, representative record]",code_signal:"뒤에서 unique_domains[wanted_domain]['query']를 쓰므로 value는 domain 문자열이 아닌 item 전체여야 합니다.",retry:"dictionary의 key와 value가 무엇인지 먼저 말로 적으세요."}),
    make({id:"exam-rag03-03",topic:"평가 Query·Answer",difficulty:"1 · Schema 접근",sourceId:"exam-rag3-fields",prompt:"대표 레코드에서 모델 입력 질문과 정답 비교값을 꺼내는 두 줄을 작성하세요.",answer:cells["exam-rag3-fields"],problem_context:`for domain, example_item in unique_domains.items():
    # TODO: 평가 입력과 정답 field를 선택하세요.
    question = example_item[????]
    answer = example_item[????]`,explanation:"query는 모델에 줄 질문이고 answer는 평가 기준입니다. 두 field를 분리해야 모델 응답과 ground truth를 비교할 수 있습니다.",tensor_flow:"record dict → query str + answer str",code_signal:"출력 문구 Example question/answer와 CRAG schema의 field 이름이 일치합니다.",retry:"입력과 평가 기준 중 어느 것이 query이고 answer인지 구분하세요."}),
    make({id:"exam-rag03-04",topic:"검색 결과 Schema",difficulty:"2 · 중첩 자료 접근",sourceId:"exam-rag3-results",prompt:"각 search result를 순회하며 제목·요약·전체 HTML 필드 길이를 확인하는 블록을 작성하세요.",answer:cells["exam-rag3-results"],problem_context:`for page in example_data[????]:
    print(len(page[????]))      # 제목
    print(len(page[????]))      # 검색 요약
    print(len(page[????]))      # 전체 HTML`,explanation:"search_results는 page dict 목록이며 page_name은 제목, page_snippet은 검색 요약, page_result는 전체 HTML 본문입니다.",tensor_flow:"record['search_results'] → page dict → three strings",code_signal:"주석의 제목/요약/전체 HTML과 field의 name/snippet/result가 직접 대응합니다.",retry:"바깥 목록 field와 안쪽 page field 세 개를 계층으로 그리세요."}),
    make({id:"exam-rag03-05",topic:"HTML 본문 정제",difficulty:"2 · Library 활용",sourceId:"exam-rag3-html",prompt:"page_result HTML을 lxml parser로 해석하고 공백으로 구분된 본문 텍스트를 추출하는 두 줄을 작성하세요.",answer:cells["exam-rag3-html"],problem_context:`for html_text in example_data['search_results']:
    soup = ????(html_text[????], features=????)
    text = soup.????(" ", strip=True)`,explanation:"BeautifulSoup에 전체 HTML인 page_result와 lxml parser를 전달합니다. get_text는 태그를 제거하고 문자열 사이를 공백으로 연결하며 양끝 공백을 제거합니다.",tensor_flow:"HTML str → BeautifulSoup tree → clean text str",code_signal:"import된 BeautifulSoup, page schema, features와 strip keyword가 답을 제한합니다.",retry:"parser 생성과 text 추출을 서로 다른 객체의 호출로 구분하세요."}),
    make({id:"exam-rag03-06",topic:"문장 Offset Chunk",difficulty:"3 · 연결 구현",sourceId:"exam-rag3-chunk",prompt:"본문의 문장 offset을 얻고 각 문장을 최대 4000자로 잘라 all_chunks에 저장하는 블록을 작성하세요.",answer:cells["exam-rag3-chunk"],problem_context:`# TODO: 문장 경계를 보존한 근거 chunk를 구성하세요.
????, offsets = ????(text)
for start, end in offsets:
    chunk = text[????:????][:????]
    all_chunks.????(chunk)`,explanation:"함수의 첫 반환값은 여기서 쓰지 않아 _로 받고 offsets만 사용합니다. 각 start:end 범위가 한 문장이며 그 결과를 4000자로 제한해 저장합니다.",tensor_flow:"clean text → sentence offsets → bounded chunk strings → list[str]",code_signal:"for start,end와 all_chunks=[]가 slice와 append를 요구하고 함수명이 import돼 있습니다.",retry:"함수 반환, 반복 unpack, slice, 길이 제한, 저장 순서를 확인하세요."})
  ];
  chapter.mcq = [
    {id:"exam-rag03-m1",source_question_id:"exam-rag03-01",topic:"JSONL 파싱",prompt:"압축 JSONL을 레코드 단위로 처리하는 올바른 방법은?",answer_index:2,explanation:"text mode 줄 반복 후 각 line에 json.loads를 적용합니다.",choices:[{text:"json.load(bz2.open(path, 'rb'))",why:"파일 전체가 하나의 JSON 객체라는 전제가 틀립니다."},{text:"json.loads(file_path)",why:"경로 문자열을 JSON으로 해석합니다."},{text:"with bz2.open(path, 'rt') as f: for line in f: json.loads(line.strip())",why:"압축 해제와 줄별 JSON 파싱이 맞습니다."},{text:"bz2.loads(json.load(path))",why:"호출 순서와 API가 틀립니다."},{text:"open(path).readlines()",why:"bz2 압축을 처리하지 않고 JSON 변환도 없습니다."}]},
    {id:"exam-rag03-m2",source_question_id:"exam-rag03-02",topic:"대표값 저장",prompt:"domain별 첫 레코드를 유지하는 올바른 대입은?",answer_index:1,explanation:"domain을 key, item 전체를 value로 저장합니다.",choices:[{text:"unique_domains[item] = domain",why:"dict인 item은 key로 쓸 수 없고 역할도 반대입니다."},{text:"unique_domains[domain_value] = item",why:"domain으로 대표 레코드를 조회할 수 있습니다."},{text:"unique_domains['domain'] = domain_value",why:"모든 항목이 같은 key를 덮어씁니다."},{text:"unique_domains.append(item)",why:"dictionary에는 append가 없습니다."},{text:"unique_domains[domain_value] = item['query']",why:"answer 등 다른 field를 잃습니다."}]},
    {id:"exam-rag03-m3",source_question_id:"exam-rag03-04",topic:"검색 본문 Field",prompt:"RAG chunk로 정제할 전체 웹 페이지 HTML은 어느 field인가?",answer_index:4,explanation:"page_result가 전체 HTML 본문입니다.",choices:[{text:"query",why:"사용자 질문입니다."},{text:"answer",why:"정답 값입니다."},{text:"page_name",why:"페이지 제목입니다."},{text:"page_snippet",why:"검색 결과의 짧은 요약입니다."},{text:"page_result",why:"parser에 전달할 전체 HTML입니다."}]},
    {id:"exam-rag03-m4",source_question_id:"exam-rag03-05",topic:"HTML 정제",prompt:"HTML 태그를 제거한 본문을 만드는 올바른 흐름은?",answer_index:0,explanation:"BeautifulSoup으로 parse한 뒤 get_text를 호출합니다.",choices:[{text:"BeautifulSoup(html, features='lxml').get_text(' ', strip=True)",why:"구조 해석과 본문 추출이 맞습니다."},{text:"json.loads(html)",why:"HTML은 JSON이 아닙니다."},{text:"html.strip_tags()",why:"문자열의 표준 메서드가 아닙니다."},{text:"BeautifulSoup.get_text(html)",why:"parser 인스턴스를 만들지 않았습니다."},{text:"text_to_sentences_and_offsets(html)",why:"HTML 태그 제거 전 문장 분할을 시도합니다."}]},
    {id:"exam-rag03-m5",source_question_id:"exam-rag03-06",topic:"문장 Chunk",prompt:"offset (start,end)에서 실제 문장 문자열을 얻는 코드는?",answer_index:3,explanation:"원문 text를 start:end로 slice합니다.",choices:[{text:"offsets[start:end]",why:"offset 목록 자체를 자릅니다."},{text:"text[offsets]",why:"offset list는 문자열 index가 될 수 없습니다."},{text:"text[start+end]",why:"한 문자 위치만 선택합니다."},{text:"text[start:end]",why:"시작 포함, 끝 제외 범위의 문장을 얻습니다."},{text:"text.split(start, end)",why:"split 인자는 구분 문자열이며 offset 범위가 아닙니다."}]}
  ];
  chapter.questionCount = chapter.subjective.length;
  chapter.exam_design = {version:2,style:"원본 전처리 파이프라인 구현형",difficulty:["Schema 접근","Library 연결","전체 반복·예외 처리"],excluded:["API 키","서버 URL","파일 경로","샘플 index 숫자"]};
})();

(() => {
  "use strict";
  const course = window.LLM_COURSE;
  const chapter = course.chapters.find((item) => item.file === "2. RAG.ipynb");
  if (!chapter) return;

  chapter.notebook_goal = "외부 문서를 검색하는 기본 RAG를 구현하고 chunk·top-k·prompt를 바꿔 검색 품질과 최종 응답을 개선한다.";
  chapter.summary = "Wikipedia 문서 수집부터 짧은/긴 chunk 비교, CustomQueryEngine, 두 단계 검색·요약을 거치는 Refine RAG까지 구현합니다.";
  chapter.capability = "RAG의 검색·context 구성·LLM 생성 단계를 분리하고, 각 단계의 객체와 인자를 목적에 맞게 연결할 수 있다.";
  chapter.overview = {
    title: "기본 RAG를 개선형 RAG로 확장하는 흐름",
    subtitle: "같은 문서도 chunk 크기, top-k, prompt, 중간 요약 방식에 따라 검색 근거와 답변 품질이 달라진다.",
    steps: [
      {label:"자료 수집",code:"WikipediaReader().load_data(...) ",flow:"titles → Documents"},
      {label:"Chunk 비교",code:"SentenceSplitter(200/50 vs 1024/200)",flow:"Documents → short/long nodes"},
      {label:"Top-k 검색",code:"index.as_retriever(similarity_top_k=k)",flow:"query → k nodes"},
      {label:"Prompt 합성",code:"PromptTemplate.format(context_str, query_str)",flow:"nodes → grounded prompt"},
      {label:"Refine",code:"retrieve → intermediate result → final LLM",flow:"raw evidence + summary → answer"}
    ],
    rules: [
      "Reader는 문서 수집, SentenceSplitter는 검색 단위 결정, VectorStoreIndex는 embedding 검색을 담당한다.",
      "chunk_size가 작으면 정밀도가, 크면 주변 문맥 보존이 유리할 수 있어 질문에 따라 비교한다.",
      "similarity_top_k는 검색 근거 개수이며 모델 출력 개수가 아니다.",
      "검색 결과는 context_str 자리표시자에, 사용자 질문은 query_str에 넣는다.",
      "Refine RAG는 검색 결과와 중간 query 결과를 함께 사용하지만 역할이 겹치지 않는지 코드상 확인한다."
    ]
  };
  chapter.key_points = [
    {title:"Wikipedia 문서 수집",purpose:"도시명 목록을 LlamaIndex Document로 읽습니다.",code:"reader = WikipediaReader()\ndocuments = reader.load_data(city_names, auto_suggest=False)",flow:"list[str] → list[Document]",watch:"load_data의 대상은 질문이 아니라 문서 제목 목록입니다."},
    {title:"Chunk와 Top-k",purpose:"검색 단위와 반환 근거 수를 조정해 질문별 검색 품질을 비교합니다.",code:"splitter = SentenceSplitter(chunk_size=200, chunk_overlap=50)\nretriever = index.as_retriever(similarity_top_k=2)",flow:"Documents → nodes; query → top 2 nodes",watch:"chunk_size와 similarity_top_k의 역할을 혼동하지 마세요."},
    {title:"Custom Prompt",purpose:"검색 node의 본문을 PromptTemplate의 context에 주입해 근거 기반 답을 만듭니다.",code:"context = '\\n\\n'.join(n.node.get_content() for n in nodes)\nllm.complete(prompt.format(context_str=context, query_str=query))",flow:"nodes → string → formatted prompt → answer",watch:"get_content 호출과 format의 두 keyword를 모두 확인하세요."},
    {title:"Refine 흐름",purpose:"원시 검색 근거와 중간 처리 결과를 최종 생성 단계에 연결합니다.",code:"ret, context_str = self.retrieve(query)\ncompletion = self.generate_response(query, context_str)",flow:"query → two retrieval outputs → final response",watch:"tuple 반환은 두 변수로 unpack해야 합니다."}
  ];
  chapter.theory_guide = [
    {title:"Chunking trade-off",concept:"짧은 chunk는 관련 문장을 정밀하게 찾고 긴 chunk는 주변 설명을 더 보존합니다.",flow:"Document → short index / long index → 같은 query 결과 비교",code_signal:"두 SentenceSplitter의 chunk_size와 chunk_overlap 숫자를 비교합니다.",exam_clue:"숫자 자체보다 splitter가 transformations에 들어가는 구조가 핵심입니다."},
    {title:"Retriever 설정",concept:"top-k는 유사도가 높은 node를 몇 개 context 후보로 반환할지 정합니다.",flow:"Index → as_retriever(top_k) → retrieve(query)",code_signal:"similarity_top_k가 as_retriever에 있고 retrieve에는 질문만 전달됩니다.",exam_clue:"검색기 생성 시 설정과 검색 실행 시 입력을 분리하세요."},
    {title:"Prompt grounding",concept:"LLM이 사전지식이 아니라 검색 근거를 우선 사용하도록 context와 질문을 명시합니다.",flow:"nodes → get_content → context_str → PromptTemplate.format",code_signal:"{context_str}, {query_str} 자리표시자와 같은 이름의 keyword를 찾습니다.",exam_clue:"context와 query를 뒤바꾸면 prompt 의미가 깨집니다."},
    {title:"파이프라인 연결",concept:"RAG 클래스의 query는 retrieve의 출력을 generate_response의 입력으로 넘기는 조정자입니다.",flow:"query → self.retrieve → self.generate_response → completion",code_signal:"앞줄의 왼쪽 변수명이 다음 줄의 인자로 재사용됩니다.",exam_clue:"각 함수의 return 값 개수와 unpack 변수 개수를 맞추세요."}
  ];

  const cells = {
    "exam-rag2-wiki": `reader = WikipediaReader()
documents = reader.load_data(city_names, auto_suggest=False)`,
    "exam-rag2-basic-flow": `context_str = self.retrieve(query)
completion = self.generate_response(query, context_str)
return completion`,
    "exam-rag2-chunk": `text_splitter_short = SentenceSplitter(chunk_size=200, chunk_overlap=50)
index_short = VectorStoreIndex.from_documents(
    documents=documents,
    transformations=[text_splitter_short]
)`,
    "exam-rag2-topk": `retriever_short = index_short.as_retriever(similarity_top_k=1)
ret_passages_short = retriever_short.retrieve(question)`,
    "exam-rag2-custom": `nodes = self.retriever.retrieve(query_str)
context_str = "\\n\\n".join([n.node.get_content() for n in nodes])
response = self.llm.complete(
    self.qa_prompt.format(context_str=context_str, query_str=query_str)
)`,
    "exam-rag2-engine": `query_engine_answer = OurCustomQueryEngine(
    retriever=retriever,
    response_synthesizer=synthesizer,
    llm=llm,
    qa_prompt=simple_qa_prompt,
)`,
    "exam-rag2-refine-retrieve": `ret = retriever.retrieve(query)
results = query_engine.query(query)
return ret, results`,
    "exam-rag2-refine-flow": `ret, context_str = self.retrieve(query)
completion = self.generate_response(query, context_str)
return completion`
  };
  Object.entries(cells).forEach(([id, source]) => { course.cells[id] = {source}; });
  const base = {subject:"RAG",chapterId:chapter.id,chapterNumber:chapter.number,chapterTitle:chapter.title,file:chapter.file,occurrence:0,isSourceBlank:false,source_type:"원본 YOUR CODE HERE 셀 기반"};
  const make = (data) => ({...base,accepted_answers:[data.answer],...data});
  chapter.subjective = [
    make({id:"exam-rag02-01",topic:"WikipediaReader",difficulty:"1 · 객체 연결",sourceId:"exam-rag2-wiki",prompt:"Wikipedia reader를 만들고 city_names의 문서를 자동 제목 보정 없이 읽는 두 줄을 작성하세요.",answer:cells["exam-rag2-wiki"],problem_context:`# TODO: 문서 수집기와 입력 목록을 연결하세요.
reader = ????()
documents = reader.????(city_names, auto_suggest=????)`,explanation:"WikipediaReader가 문서 수집 객체이고 load_data가 도시명 목록을 Document 목록으로 바꿉니다. auto_suggest=False는 입력 제목을 임의 교정하지 않습니다.",tensor_flow:"city_names list[str] → documents list[Document]",code_signal:"import된 WikipediaReader, 결과 변수 documents, 제목 보정 옵션 주석을 함께 봅니다.",retry:"클래스 생성과 실제 로드 호출을 두 단계로 나눠 쓰세요."}),
    make({id:"exam-rag02-02",topic:"기본 RAG query",difficulty:"2 · 함수 연결",sourceId:"exam-rag2-basic-flow",prompt:"query 메서드에서 검색 결과를 생성 함수로 전달하고 반환하는 세 줄을 작성하세요.",answer:cells["exam-rag2-basic-flow"],problem_context:`def query(self, query: str) -> str:
    context_str = self.????(query)
    completion = self.????(query, context_str)
    return ????`,explanation:"query는 파이프라인 조정자입니다. retrieve 결과를 context_str에 받고 같은 query와 함께 generate_response로 넘긴 뒤 completion을 반환합니다.",tensor_flow:"query str → retrieved context → generated completion",code_signal:"클래스 안에 이미 정의된 retrieve와 generate_response 메서드, 왼쪽 변수명이 단서입니다.",retry:"앞줄의 출력 변수를 다음 줄 입력으로 그대로 연결해 쓰세요."}),
    make({id:"exam-rag02-03",topic:"짧은 Chunk Index",difficulty:"3 · 구성 구현",sourceId:"exam-rag2-chunk",prompt:"200/50 splitter를 만들고 documents에 적용해 short index를 구성하는 전체 코드를 작성하세요.",answer:cells["exam-rag2-chunk"],problem_context:`# TODO: 짧은 검색 단위를 index 생성 과정에 적용하세요.
text_splitter_short = SentenceSplitter(chunk_size=????, chunk_overlap=????)
index_short = VectorStoreIndex.from_documents(
    documents=documents,
    ????=[text_splitter_short]
)`,explanation:"짧은 splitter를 transformations 목록에 넣으면 문서가 200 크기, 50 중복의 node로 나뉜 뒤 index에 저장됩니다.",tensor_flow:"Documents → short overlapping Nodes → index_short",code_signal:"변수명 short와 바로 아래 원본 숫자 비교, from_documents의 transformations 인자가 단서입니다.",retry:"SentenceSplitter 설정과 index 적용을 각각 한 덩어리로 복원하세요."}),
    make({id:"exam-rag02-04",topic:"Top-k 검색",difficulty:"2 · 설정·실행",sourceId:"exam-rag2-topk",prompt:"short index에서 top-1 검색기를 만들고 question을 검색하는 두 줄을 작성하세요.",answer:cells["exam-rag2-topk"],problem_context:`# TODO: 반환 근거 수를 1개로 제한해 검색하세요.
retriever_short = index_short.????(similarity_top_k=????)
ret_passages_short = retriever_short.????(question)`,explanation:"similarity_top_k는 검색기 생성 옵션이며 retrieve가 질문 embedding과 가까운 node를 반환합니다.",tensor_flow:"index_short → configured retriever; question → top-1 NodeWithScore",code_signal:"'top-1'과 변수명 retriever_short/ret_passages_short가 메서드와 값을 결정합니다.",retry:"설정은 as_retriever, 실행은 retrieve라는 쌍을 다시 쓰세요."}),
    make({id:"exam-rag02-05",topic:"Custom Prompt RAG",difficulty:"3 · 전체 연결",sourceId:"exam-rag2-custom",prompt:"검색 node를 context 문자열로 합치고 qa_prompt를 채워 LLM을 호출하는 코드를 작성하세요.",answer:cells["exam-rag2-custom"],problem_context:`def custom_query(self, query_str: str):
    nodes = self.retriever.????(query_str)
    context_str = "\\n\\n".join([n.node.????() for n in nodes])
    response = self.llm.????(
        self.qa_prompt.????(context_str=context_str, query_str=query_str)
    )`,explanation:"검색 결과 객체에서 get_content로 본문을 꺼내 하나의 context로 합칩니다. PromptTemplate.format 결과를 llm.complete에 전달합니다.",tensor_flow:"query → nodes → context string → formatted prompt → response",code_signal:"qa_prompt 자리표시자명과 self.retriever/self.llm field가 호출 순서를 알려줍니다.",retry:"retrieve → get_content → format → complete 네 동사를 순서대로 적으세요."}),
    make({id:"exam-rag02-06",topic:"Custom Engine 구성",difficulty:"2 · 의존성 주입",sourceId:"exam-rag2-engine",prompt:"검색기, 합성기, LLM, QA prompt를 OurCustomQueryEngine에 연결하는 전체 생성 코드를 작성하세요.",answer:cells["exam-rag2-engine"],problem_context:`query_engine_answer = OurCustomQueryEngine(
    retriever=????,
    response_synthesizer=????,
    llm=????,
    qa_prompt=????,
)`,explanation:"클래스에 선언된 네 field를 같은 역할의 기존 객체에 연결합니다. qa_prompt를 바꾸면 같은 engine 구현으로 답변/요약 동작을 전환할 수 있습니다.",tensor_flow:"Retriever + Synthesizer + LLM + Prompt → CustomQueryEngine",code_signal:"keyword 이름과 바로 위에서 만든 retriever, synthesizer, llm, simple_qa_prompt 변수가 일대일 대응합니다.",retry:"왼쪽 keyword와 같은 역할의 오른쪽 변수명을 선으로 연결하세요."}),
    make({id:"exam-rag02-07",topic:"Refine 두 단계 검색",difficulty:"3 · Tuple 반환",sourceId:"exam-rag2-refine-retrieve",prompt:"Refine_RAG.retrieve에서 원시 passage와 query engine 결과를 모두 구해 tuple로 반환하는 세 줄을 작성하세요.",answer:cells["exam-rag2-refine-retrieve"],problem_context:`def retrieve(self, query: str) -> list:
    ret = retriever.????(query)
    results = query_engine.????(query)
    return ????, ????`,explanation:"retriever.retrieve는 원시 node 목록, query_engine.query는 검색·합성이 반영된 중간 결과입니다. 둘을 함께 반환해 검사와 최종 생성에 활용합니다.",tensor_flow:"query → (raw nodes, intermediate response)",code_signal:"ret/results라는 왼쪽 변수와 바깥 객체 retriever/query_engine의 표준 실행 메서드가 대응합니다.",retry:"각 객체가 검색 전용인지 검색+생성인지 구분해 메서드를 채우세요."}),
    make({id:"exam-rag02-08",topic:"Refine 최종 연결",difficulty:"2 · Tuple unpack",sourceId:"exam-rag2-refine-flow",prompt:"Refine_RAG.query에서 retrieve의 두 결과를 받고 context를 최종 생성 함수로 넘기는 세 줄을 작성하세요.",answer:cells["exam-rag2-refine-flow"],problem_context:`def query(self, query: str) -> str:
    ????, ???? = self.retrieve(query)
    completion = self.????(query, context_str)
    return ????`,explanation:"retrieve가 두 값을 반환하므로 ret와 context_str로 unpack합니다. 최종 답에는 context_str을 사용하고 completion을 반환합니다.",tensor_flow:"query → (ret, context_str) → completion",code_signal:"retrieve의 return ret, results와 query 내부 주석의 intermediate summary를 함께 보면 unpack 구조를 알 수 있습니다.",retry:"반환값 두 개와 받는 변수 두 개의 순서를 먼저 맞추세요."})
  ];
  chapter.mcq = [
    {id:"exam-rag02-m1",source_question_id:"exam-rag02-02",topic:"RAG 호출 순서",prompt:"클래스 query 메서드의 올바른 연결은?",answer_index:1,explanation:"검색 context를 만든 후 생성 함수에 query와 함께 전달합니다.",choices:[{text:"generate_response → retrieve → return query",why:"순서와 반환 대상이 틀립니다."},{text:"context = retrieve(query) → completion = generate_response(query, context) → return completion",why:"검색→생성 흐름이 맞습니다."},{text:"retrieve(generate_response(query))",why:"생성 결과를 검색하는 반대 흐름입니다."},{text:"return retrieve(query)",why:"생성 단계가 없습니다."},{text:"return generate_response(query)",why:"필요한 context 인자가 없습니다."}]},
    {id:"exam-rag02-m2",source_question_id:"exam-rag02-03",topic:"Chunking 역할",prompt:"SentenceSplitter를 실제 index 생성에 적용하는 코드는?",answer_index:4,explanation:"from_documents의 transformations에 splitter를 넣습니다.",choices:[{text:"documents.split(text_splitter)",why:"Document 목록의 메서드가 아닙니다."},{text:"index.as_retriever(text_splitter)",why:"검색기 설정 단계가 아닙니다."},{text:"SentenceSplitter(documents)",why:"생성자에는 문서가 아니라 설정값이 들어갑니다."},{text:"VectorStoreIndex(text_splitter)",why:"문서를 전달하지 않습니다."},{text:"VectorStoreIndex.from_documents(documents=documents, transformations=[text_splitter])",why:"index 생성 중 splitter를 적용합니다."}]},
    {id:"exam-rag02-m3",source_question_id:"exam-rag02-04",topic:"Top-k 위치",prompt:"검색 결과를 2개로 제한하려면 어디에 설정해야 하나?",answer_index:2,explanation:"similarity_top_k는 as_retriever에서 설정합니다.",choices:[{text:"retrieve(query, top_k=2)",why:"이 실습의 retrieve 호출 형태가 아닙니다."},{text:"SentenceSplitter(similarity_top_k=2)",why:"chunker의 설정이 아닙니다."},{text:"index.as_retriever(similarity_top_k=2)",why:"검색기 생성 시 반환 수를 설정합니다."},{text:"VectorStoreIndex.from_documents(top_k=2)",why:"index 생성 옵션이 아닙니다."},{text:"llm.complete(top_k=2)",why:"생성 모델의 출력 수가 아닙니다."}]},
    {id:"exam-rag02-m4",source_question_id:"exam-rag02-05",topic:"Prompt context",prompt:"검색 node를 PromptTemplate의 context에 넣는 올바른 흐름은?",answer_index:0,explanation:"본문을 추출·결합한 뒤 context_str keyword로 format합니다.",choices:[{text:"join(n.node.get_content()) → prompt.format(context_str=context, query_str=query)",why:"근거와 질문을 올바른 자리표시자에 넣습니다."},{text:"prompt.format(context_str=query, query_str=context)",why:"근거와 질문이 뒤바뀝니다."},{text:"llm.complete(nodes)",why:"Node 객체 목록을 prompt 없이 직접 전달합니다."},{text:"prompt.retrieve(query)",why:"PromptTemplate은 검색하지 않습니다."},{text:"retriever.format(context)",why:"Retriever는 prompt를 채우지 않습니다."}]},
    {id:"exam-rag02-m5",source_question_id:"exam-rag02-08",topic:"Tuple 연결",prompt:"retrieve가 return ret, results일 때 올바른 수신은?",answer_index:3,explanation:"반환 순서대로 두 변수에 unpack합니다.",choices:[{text:"context = self.retrieve(query)",why:"tuple 전체가 한 변수에 들어가 이후 context로 바로 쓰기 어렵습니다."},{text:"results, ret = self.retrieve(query)",why:"의미상 순서가 뒤바뀝니다."},{text:"ret = self.retrieve(query)[2]",why:"두 요소 tuple에 index 2는 없습니다."},{text:"ret, context_str = self.retrieve(query)",why:"첫 결과와 둘째 결과를 순서대로 받습니다."},{text:"ret, context_str, answer = self.retrieve(query)",why:"반환값보다 변수가 많습니다."}]}
  ];
  chapter.questionCount = chapter.subjective.length;
  chapter.exam_design = {version:2,style:"원본 YOUR CODE HERE 기반 파이프라인 구현형",difficulty:["객체 연결","검색 설정","Custom·Refine 흐름"],excluded:["API 키","이메일·User-Agent 문자열","질문 문장 암기","설치 명령"]};
})();
