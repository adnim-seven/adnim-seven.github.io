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
