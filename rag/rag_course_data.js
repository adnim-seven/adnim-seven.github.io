(() => {
  const line = (text, highlight=false) => ({text,highlight});
  const cell = (cell_number, problem, answer, marked) => ({cell_number,blank_count:marked.length,problem_lines:problem.map((x,i)=>line(x,marked.includes(i))),answer_lines:answer.map((x,i)=>line(x,marked.includes(i)))});
  const fill = (problem, replacements) => problem.map((x,i)=>replacements[i] ?? x);
  const S = (id,answer,topic,prompt,accepted=[answer]) => ({id,sourceId:id,occurrence:0,answer,accepted_answers:accepted,topic,prompt,isSourceBlank:true});

  const buildP = [
    "### YOUR CODE HERE ###",
    "documents = ????(\"data\").????()",
    "",
    "### YOUR CODE HERE ###",
    "for i in range(len(documents)):",
    "  print(documents[i].text)",
    "",
    "### YOUR CODE HERE ###",
    "index = ????.????(documents)",
    "",
    "### YOUR CODE HERE ###",
    "query_engine = index.????()",
    "response = query_engine.????(\"What is the first programs the author tried writing?\")",
    "print(response)",
  ];
  const buildA = fill(buildP,{1:'documents = SimpleDirectoryReader("data").load_data()',8:'index = VectorStoreIndex.from_documents(documents)',11:'query_engine = index.as_query_engine()',12:'response = query_engine.query("What is the first programs the author tried writing?")'});

  const splitP = [
    "### YOUR CODE HERE ###",
    "from llama_index.core.node_parser import SentenceSplitter",
    "parser = SentenceSplitter(chunk_size=1024, chunk_overlap=200)",
    "# you can change chunk_size, chunk_overlap",
    "nodes = parser.????(documents)",
    "print(len(nodes))",
    "",
    "text_splitter = SentenceSplitter(chunk_size=200, chunk_overlap=50)",
    "index = VectorStoreIndex.from_documents(documents=documents, ????=[text_splitter])",
    "node_id = index.index_struct.????",
    "print(\"The number of nodes: \", len(node_id.values()))",
  ];
  const splitA = fill(splitP,{4:'nodes = parser.get_nodes_from_documents(documents)',8:'index = VectorStoreIndex.from_documents(documents=documents, transformations=[text_splitter])',9:'node_id = index.index_struct.nodes_dict'});

  const retrieveP = [
    "### YOUR CODE HERE ###",
    "retriever = index.????()",
    "ret_passages = retriever.????(\"Who is the author?\")",
    "for i in range(len(ret_passages)):",
    "  print(\"###Retrieved Passage\\n\", ret_passages[i].text)",
    "",
    "ret_context = \"\"",
    "for ret_result in ret_passages:",
    "  ret_context += ret_result.text",
    "",
    "question = f\"\"\"Context information is below.",
    "---------------------",
    "{????}",
    "---------------------",
    "Given the context information and not prior knowledge,",
    "answer the query and the reasons of answer.",
    "Query: Who is the author?",
    "Answer:",
    "\"\"\"",
    "print(generate_answer(question))",
  ];
  const retrieveA = fill(retrieveP,{1:'retriever = index.as_retriever()',2:'ret_passages = retriever.retrieve("Who is the author?")',12:'{ret_context}'});

  const crudP = [
    "### YOUR CODE HERE ###",
    "docu = Document(text=data_text, ????=\"new_doc_id\")",
    "index.????(docu)",
    "new_query_engine = index.as_query_engine()",
    "",
    "docu.????(value=updated_text)",
    "output = index.????(",
    "    docu,",
    "    update_kwargs={\"delete_kwargs\": {\"delete_from_docstore\": True}},",
    ")",
    "",
    "id = docu.????",
    "index.????(id, delete_from_docstore=True)",
  ];
  const crudA = fill(crudP,{1:'docu = Document(text=data_text, id_="new_doc_id")',2:'index.insert(docu)',5:'docu.set_content(value=updated_text)',6:'output = index.update_ref_doc(',11:'id = docu.doc_id',12:'index.delete_ref_doc(id, delete_from_docstore=True)'});

  const standardP = [
    "### YOUR CODE HERE ###",
    "class StandardQueryEngine(CustomQueryEngine):",
    "    retriever: BaseRetriever",
    "    response_synthesizer: BaseSynthesizer",
    "    def custom_query(self, query_str: str):",
    "        nodes = self.retriever.????(query_str)",
    "        response_obj = self.response_synthesizer.????(query_str, nodes)",
    "        return response_obj",
    "",
    "retriever = index.as_retriever()",
    "synthesizer = get_response_synthesizer(response_mode=\"compact\")",
    "query_engine = StandardQueryEngine(",
    "    retriever=????, response_synthesizer=????",
    ")",
  ];
  const standardA = fill(standardP,{5:'        nodes = self.retriever.retrieve(query_str)',6:'        response_obj = self.response_synthesizer.synthesize(query_str, nodes)',12:'    retriever=retriever, response_synthesizer=synthesizer'});

  const customP = [
    "### YOUR CODE HERE ###",
    "class OurCustomQueryEngine(CustomQueryEngine):",
    "    retriever: BaseRetriever",
    "    response_synthesizer: BaseSynthesizer",
    "    llm: OpenAI",
    "    qa_prompt: PromptTemplate = simple_qa_prompt",
    "    def custom_query(self, query_str: str):",
    "        nodes = self.retriever.????(query_str)",
    "        context_str = \"\\n\\n\".join([n.node.????() for n in nodes])",
    "        response = self.llm.????(",
    "            self.qa_prompt.????(context_str=context_str, query_str=query_str)",
    "        )",
    "        return str(response)",
  ];
  const customA = fill(customP,{7:'        nodes = self.retriever.retrieve(query_str)',8:'        context_str = "\\n\\n".join([n.node.get_content() for n in nodes])',9:'        response = self.llm.complete(',10:'            self.qa_prompt.format(context_str=context_str, query_str=query_str)'});

  const answerP = ["### YOUR CODE HERE ###","def generate_answer(question):","    messages = [","        {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},","        {\"role\": \"user\", \"content\": question},","    ]","    response = openai.chat.completions.????(","        model=\"gpt-3.5-turbo\", messages=????,","    )","    return response.choices[0].message.????"];
  const answerA = fill(answerP,{6:"    response = openai.chat.completions.create(",7:'        model="gpt-3.5-turbo", messages=messages,',9:"    return response.choices[0].message.content"});

  const wikiP = ["### YOUR CODE HERE ###","import wikipedia","wikipedia.????(\"my-rag-project (test@example.com)\")","reader = ????()","documents = reader.????(city_names, auto_suggest=False)","","index = VectorStoreIndex.????(documents)","query_engine = index.????()","response = query_engine.????(\"What's the arts and culture scene in Berlin?\")"];
  const wikiA = fill(wikiP,{2:'wikipedia.set_user_agent("my-rag-project (test@example.com)")',3:"reader = WikipediaReader()",4:"documents = reader.load_data(city_names, auto_suggest=False)",6:"index = VectorStoreIndex.from_documents(documents)",7:"query_engine = index.as_query_engine()",8:'response = query_engine.query("What\'s the arts and culture scene in Berlin?")'});

  const scratchP = ["### YOUR CODE HERE ###","class RAG_from_scratch:","    def retrieve(self, query: str) -> list:","        # Retrieve relevant text from vector store.","        results = query_engine.????(query)","        return results","    def generate_response(self, query: str, context_str: list) -> str:","        completion = oai_client.chat.completions.????(","            model=\"gpt-3.5-turbo\", temperature=0,","            messages=[{\"role\": \"user\", \"content\": f\"Context: {context_str}\\nQuestion: {query}\"}]","        ).choices[0].message.content","        return completion","    def query(self, query: str) -> str:","        context_str = self.????(query)","        completion = self.????(query, context_str)","        return completion"];
  const scratchA = fill(scratchP,{4:"        results = query_engine.query(query)",7:"        completion = oai_client.chat.completions.create(",13:"        context_str = self.retrieve(query)",14:"        completion = self.generate_response(query, context_str)"});

  const configP = ["### YOUR CODE HERE ###","text_splitter_short = SentenceSplitter(chunk_size=????, chunk_overlap=????)","index_short = VectorStoreIndex.from_documents(documents=documents, transformations=[????])","text_splitter_long = SentenceSplitter(chunk_size=????, chunk_overlap=????)","index_long = VectorStoreIndex.from_documents(documents=documents, transformations=[????])","","retriever_short = index_short.as_retriever(similarity_top_k=????)","retriever_long = index_long.as_retriever(similarity_top_k=????)","","retriever = index_short.as_retriever(similarity_top_k=2)","# retriever = index_long.as_retriever(similarity_top_k=2)","index = index_short #If you want to use this, remove #","# index = index_long #If you want to use this, remove #"];
  const configA = fill(configP,{1:"text_splitter_short = SentenceSplitter(chunk_size=200, chunk_overlap=50)",2:"index_short = VectorStoreIndex.from_documents(documents=documents, transformations=[text_splitter_short])",3:"text_splitter_long = SentenceSplitter(chunk_size=1024, chunk_overlap=200)",4:"index_long = VectorStoreIndex.from_documents(documents=documents, transformations=[text_splitter_long])",6:"retriever_short = index_short.as_retriever(similarity_top_k=1)",7:"retriever_long = index_long.as_retriever(similarity_top_k=1)"});

  const custom2P = ["### YOUR CODE HERE ###","class OurCustomQueryEngine(CustomQueryEngine):","    retriever: BaseRetriever","    response_synthesizer: BaseSynthesizer","    llm: OpenAI","    qa_prompt: PromptTemplate = simple_qa_prompt","    def custom_query(self, query_str: str):","        nodes = self.retriever.????(query_str)","        context_str = \"\\n\\n\".join([n.node.????() for n in nodes])","        response = self.llm.????(","            self.qa_prompt.????(context_str=context_str, query_str=query_str)","        )","        return str(response)","","query_engine_answer = OurCustomQueryEngine(","    retriever=retriever, response_synthesizer=synthesizer,","    llm=llm, qa_prompt=????,",")"];
  const custom2A = fill(custom2P,{7:"        nodes = self.retriever.retrieve(query_str)",8:'        context_str = "\\n\\n".join([n.node.get_content() for n in nodes])',9:"        response = self.llm.complete(",10:"            self.qa_prompt.format(context_str=context_str, query_str=query_str)",16:"    llm=llm, qa_prompt=simple_qa_prompt,"});

  const refineP = ["### YOUR CODE HERE ###","class Refine_RAG:","    def retrieve(self, query: str) -> list:","        ret = retriever.????(query)","        results = query_engine.????(query)","        return ????, ????","    def generate_response(self, query: str, context_str: list) -> str:","        messages = [{\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},","                    {\"role\": \"user\", \"content\": f\"Question: {query}\\nContext: {context_str}\"}]","        response = oai_client.chat.completions.????(","            model=\"gpt-3.5-turbo\", temperature=0, messages=messages,","        )","        return response.choices[0].message.????","    def query(self, query: str) -> str:","        ret, context_str = self.????(query)","        completion = self.????(query, context_str)","        return completion"];
  const refineA = fill(refineP,{3:"        ret = retriever.retrieve(query)",4:"        results = query_engine.query(query)",5:"        return ret, results",9:"        response = oai_client.chat.completions.create(",12:"        return response.choices[0].message.content",14:"        ret, context_str = self.retrieve(query)",15:"        completion = self.generate_response(query, context_str)"});

  const loadDataP = ["### YOUR CODE HERE ###","import json","import bz2","dataset = []","with bz2.????(file_path, 'rt') as file:","    for line in file:","        try:","            data = json.????(line.strip())","            dataset.????(data)","        except json.???? as e:","            print(f\"Error decoding JSON: {e}\")"];
  const loadDataA = fill(loadDataP,{4:"with bz2.open(file_path, 'rt') as file:",7:"            data = json.loads(line.strip())",8:"            dataset.append(data)",9:"        except json.JSONDecodeError as e:"});

  const inspectP = ["### YOUR CODE HERE ###","unique_domains = {}","for item in dataset:","    if 'domain' in item:","        domain_value = item['domain']","        if domain_value not in unique_domains:","            unique_domains[domain_value] = ????","","for domain, example_item in unique_domains.????:","    question = example_item[????]","    answer = example_item[????]","    print(f\"Domain: {domain}\")","    print(f\"Example question: {question}\")","    print(f\"Example answer: {answer}\\n\")"];
  const inspectA = fill(inspectP,{6:"            unique_domains[domain_value] = item",8:"for domain, example_item in unique_domains.items():",9:"    question = example_item['query']",10:"    answer = example_item['answer']"});

  const statsP = ["### YOUR CODE HERE ###","from collections import Counter","domain_counts = Counter(item[????] for item in dataset if 'domain' in item)","question_type_counts = Counter([item[????] for item in dataset])","dynamism_counts = Counter([item[????] for item in dataset])","","plt.bar(domain_counts.????, domain_counts.????)","plt.xticks(rotation=45, ha='right')","plt.tight_layout()","plt.show()"];
  const statsA = fill(statsP,{2:"domain_counts = Counter(item['domain'] for item in dataset if 'domain' in item)",3:"question_type_counts = Counter([item['question_type'] for item in dataset])",4:"question_type_counts = Counter([item['static_or_dynamic'] for item in dataset])",6:"plt.bar(domain_counts.keys(), domain_counts.values())"});

  const schemaP = ["### YOUR CODE HERE ###","data_index = 2617","example_data = dataset[????]","print(example_data[????])","print(example_data[????])","pretty_json_print(example_data[????])","","for page in example_data['search_results']:","  print(f\"Length of title: {len(page['page_name'])}\")","  print(f\"Length of snippet: {len(page['page_snippet'])}\")","  print(f\"Length of result: {len(page['page_result'])}\")"];
  const schemaA = fill(schemaP,{2:"example_data = dataset[2617]",3:"print(example_data['query'])",4:"print(example_data['answer'])",5:"pretty_json_print(example_data['search_results'])"});

  const parseP = ["### YOUR CODE HERE ###","from bs4 import BeautifulSoup","from blingfire import text_to_sentences_and_offsets","all_chunks = []","for html_text in example_data['search_results']:","    soup = BeautifulSoup(html_text[????], features=????)","    text = soup.????(\" \", strip=True)","    if not text:","        all_chunks.append(\"\")","    else:","        _, offsets = ????(text)","        chunks = []","        for start, end in offsets:","            chunk = text[????][:4000]","            all_chunks.????(chunk)","print(all_chunks[:1])"];
  const parseA = fill(parseP,{5:'    soup = BeautifulSoup(html_text["page_result"], features="lxml")',6:'    text = soup.get_text(" ", strip=True)',10:"        _, offsets = text_to_sentences_and_offsets(text)",13:"            chunk = text[start:end][:4000]",14:"            all_chunks.append(chunk)"});

  window.LLM_COURSE = {
    subject:"2. RAG", sample_mode:false,
    cells:{
      "rag1-q1":{source:'SimpleDirectoryReader("data").load_data()'},"rag1-q2":{source:"VectorStoreIndex.from_documents(documents)"},"rag1-q3":{source:"index.as_query_engine()"},"rag1-q4":{source:"query_engine.query"},
      "rag1-q5":{source:"parser.get_nodes_from_documents(documents)"},"rag1-q6":{source:"transformations=[text_splitter]"},"rag1-q7":{source:"index.index_struct.nodes_dict"},
      "rag1-q8":{source:"index.as_retriever()"},"rag1-q9":{source:"retriever.retrieve"},"rag1-q10":{source:"ret_context"},
      "rag1-q11":{source:'id_="new_doc_id"'},"rag1-q12":{source:"index.insert(docu)"},"rag1-q13":{source:"docu.set_content"},"rag1-q14":{source:"index.update_ref_doc"},"rag1-q15":{source:"docu.doc_id"},"rag1-q16":{source:"index.delete_ref_doc"},
      "rag1-q17":{source:"self.response_synthesizer.synthesize(query_str, nodes)"},"rag1-q18":{source:"n.node.get_content()"},"rag1-q19":{source:"self.llm.complete"},"rag1-q20":{source:"self.qa_prompt.format"},
      "rag2-q1":{source:"openai.chat.completions.create"},"rag2-q2":{source:"messages=messages"},"rag2-q3":{source:"response.choices[0].message.content"},
      "rag2-q4":{source:"wikipedia.set_user_agent"},"rag2-q5":{source:"WikipediaReader()"},"rag2-q6":{source:"reader.load_data(city_names, auto_suggest=False)"},
      "rag2-q7":{source:"query_engine.query(query)"},"rag2-q8":{source:"self.retrieve(query)"},"rag2-q9":{source:"self.generate_response(query, context_str)"},
      "rag2-q10":{source:"SentenceSplitter(chunk_size=200, chunk_overlap=50)"},"rag2-q11":{source:"transformations=[text_splitter_short]"},"rag2-q12":{source:"similarity_top_k=1"},
      "rag2-q13":{source:"self.retriever.retrieve(query_str)"},"rag2-q14":{source:"n.node.get_content()"},"rag2-q15":{source:"self.llm.complete"},"rag2-q16":{source:"self.qa_prompt.format"},
      "rag2-q17":{source:"return ret, results"},"rag2-q18":{source:"response.choices[0].message.content"},
      "prep-q1":{source:"bz2.open(file_path, 'rt')"},"prep-q2":{source:"json.loads(line.strip())"},"prep-q3":{source:"dataset.append(data)"},"prep-q4":{source:"json.JSONDecodeError"},
      "prep-q5":{source:"unique_domains[domain_value] = item"},"prep-q6":{source:"unique_domains.items()"},"prep-q7":{source:"example_item['query']"},"prep-q8":{source:"example_item['answer']"},
      "prep-q9":{source:"item['domain']"},"prep-q10":{source:"item['question_type']"},"prep-q11":{source:"item['static_or_dynamic']"},"prep-q12":{source:"domain_counts.keys(), domain_counts.values()"},
      "prep-q13":{source:"example_data['search_results']"},"prep-q14":{source:'html_text["page_result"]'},"prep-q15":{source:'features="lxml"'},"prep-q16":{source:'soup.get_text(" ", strip=True)'},"prep-q17":{source:"text_to_sentences_and_offsets(text)"},"prep-q18":{source:"text[start:end][:4000]"},"prep-q19":{source:"all_chunks.append(chunk)"}
    },
    chapters:[{
      id:"rag-01",number:"01",title:"LlamaIndex Query Engine",file:"1. Llama_index.ipynb",
      capability:"문서를 load·chunk·index한 뒤 retrieve와 response synthesis를 연결하고 index 문서를 추가·수정·삭제할 수 있다.",
      summary:"텍스트 파일이 Document와 Node로 분할되어 embedding index에 저장되고, 질문은 관련 Node 검색과 LLM 응답 합성을 거쳐 답변이 됩니다.",
      notebook_goal:"LlamaIndex의 문서 로딩부터 VectorStoreIndex, QueryEngine, 검색·합성, 문서 CRUD까지 RAG의 전체 흐름을 구현한다.",
      key_points:[
        {title:"Load와 Index",purpose:"폴더의 파일을 Document로 읽고 embedding 기반 검색 index를 만듭니다.",code:'SimpleDirectoryReader("data").load_data()\nVectorStoreIndex.from_documents(documents)',flow:"files → Documents → Nodes → embeddings → index",watch:"API key 문자열은 코드에 저장하지 말고 환경변수를 사용합니다."},
        {title:"Chunking",purpose:"긴 문서를 검색 가능한 작은 Node로 나누되 문맥 단절을 줄이기 위해 overlap을 둡니다.",code:"SentenceSplitter(chunk_size=200, chunk_overlap=50)",flow:"Document → overlapping Nodes",watch:"transformations에 splitter 목록을 전달해야 index 생성에 반영됩니다."},
        {title:"Retrieve와 Query",purpose:"retriever는 관련 문맥을 찾고 query engine은 검색 결과로 답을 합성합니다.",code:"retriever.retrieve(query)\nquery_engine.query(query)",flow:"query → retrieved Nodes → prompt → LLM answer",watch:"retrieve 결과 자체와 최종 response를 구분합니다."},
        {title:"Index CRUD",purpose:"새 지식을 반영하거나 오래된 문서를 갱신·삭제합니다.",code:"insert / update_ref_doc / delete_ref_doc",flow:"Document id → index mutation → new query engine",watch:"참조 문서 작업에는 doc_id가 필요합니다."},
        {title:"Custom Query Engine",purpose:"검색과 응답 합성 또는 직접 prompt 호출의 순서를 명시적으로 구성합니다.",code:"retrieve → synthesize\nretrieve → context join → prompt.format → llm.complete",flow:"query string → Nodes → response",watch:"PromptTemplate의 context_str와 query_str 변수를 모두 채웁니다."}
      ],
      theory_guide:[
        {title:"1. RAG",concept:"RAG는 질문과 관련된 외부 문서를 먼저 검색하고 그 문맥을 LLM 입력에 넣어 답하게 하는 방식입니다.",flow:"load → split → embed/index → retrieve → synthesize",code_signal:"from_documents 뒤 as_retriever 또는 as_query_engine이 이어집니다.",exam_clue:"기출 핵심 두 줄은 문서 load와 VectorStoreIndex 생성입니다."},
        {title:"2. Document와 Node",concept:"Document는 원본 단위, Node는 검색을 위해 나눈 chunk 단위입니다.",flow:"1 Document → many Nodes",code_signal:"get_nodes_from_documents가 Document 목록을 Node 목록으로 바꿉니다.",exam_clue:"chunk_overlap은 인접 Node 사이 문맥을 일부 중복합니다."},
        {title:"3. Retriever와 Synthesizer",concept:"Retriever는 근거를 고르고 Synthesizer는 질문과 근거를 이용해 자연어 답을 만듭니다.",flow:"query → retrieve nodes → synthesize response",code_signal:"StandardQueryEngine의 custom_query 두 줄이 역할을 분리합니다.",exam_clue:"retrieve의 입력은 query_str, synthesize의 입력은 query_str과 nodes입니다."},
        {title:"4. Prompt 기반 직접 합성",concept:"검색 Node의 content를 합친 뒤 PromptTemplate 변수에 넣고 LLM complete를 호출할 수 있습니다.",flow:"nodes → context_str → format → complete",code_signal:"get_content → join → format → complete 순서입니다.",exam_clue:"prior knowledge를 막고 싶으면 prompt에 context만 사용하라고 명시합니다."}
      ],
      full_code_cells:[cell(12,buildP,buildA,[1,8,11,12]),cell(21,splitP,splitA,[4,8,9]),cell(49,retrieveP,retrieveA,[1,2,12]),cell(59,crudP,crudA,[1,2,5,6,11,12]),cell(75,standardP,standardA,[5,6,12]),cell(80,customP,customA,[7,8,9,10])],
      subjective:[
        S("rag1-q1",'SimpleDirectoryReader("data").load_data()',"문서 로딩","data 폴더의 문서를 읽는 한 줄을 쓰세요."),S("rag1-q2","VectorStoreIndex.from_documents(documents)","Index 생성","documents로 vector index를 만드는 표현을 쓰세요."),S("rag1-q3","index.as_query_engine()","Query engine","index에서 query engine을 만드는 표현을 쓰세요."),S("rag1-q4","query_engine.query","질의","질문을 실행하는 메서드까지 쓰세요."),
        S("rag1-q5","parser.get_nodes_from_documents(documents)","Chunking","parser로 documents를 Node로 분할하는 호출을 쓰세요."),S("rag1-q6","transformations=[text_splitter]","Transformation","index 생성 시 splitter를 적용하는 인자를 쓰세요."),S("rag1-q7","index.index_struct.nodes_dict","Index 구조","index의 Node ID 사전을 가져오는 표현을 쓰세요."),
        S("rag1-q8","index.as_retriever()","Retriever","index에서 retriever를 만드는 표현을 쓰세요."),S("rag1-q9","retriever.retrieve","검색","관련 passage를 검색하는 메서드까지 쓰세요."),S("rag1-q10","ret_context","Prompt context","f-string의 context 자리에 들어갈 변수를 쓰세요."),
        S("rag1-q11",'id_="new_doc_id"',"Document ID","Document 생성자에서 문서 ID를 지정하세요."),S("rag1-q12","index.insert(docu)","Insert","Document를 index에 추가하는 한 줄을 쓰세요."),S("rag1-q13","docu.set_content","Update content","Document 내용을 바꾸는 메서드까지 쓰세요."),S("rag1-q14","index.update_ref_doc","Update index","변경된 참조 문서를 index에 반영하는 메서드까지 쓰세요."),S("rag1-q15","docu.doc_id","Document ID","삭제에 사용할 문서 ID 표현을 쓰세요."),S("rag1-q16","index.delete_ref_doc","Delete","참조 문서를 index에서 삭제하는 메서드까지 쓰세요."),
        S("rag1-q17","self.response_synthesizer.synthesize(query_str, nodes)","응답 합성","검색 Node와 질문으로 response를 합성하는 호출을 쓰세요."),S("rag1-q18","n.node.get_content()","Node content","검색 결과에서 실제 Node text를 얻는 호출을 쓰세요."),S("rag1-q19","self.llm.complete","LLM 호출","완성된 prompt를 실행하는 LLM 메서드까지 쓰세요."),S("rag1-q20","self.qa_prompt.format","Prompt formatting","context와 query를 PromptTemplate에 넣는 메서드까지 쓰세요.")
      ],
      mcq:[
        {id:"rag1-m1",source_question_id:"rag1-q2",topic:"RAG index",prompt:"documents를 검색 가능한 vector index로 만드는 표현은?",answer_index:2,explanation:"from_documents가 Document를 Node로 나누고 embedding index를 구성합니다.",choices:[{text:"SimpleDirectoryReader(documents)",why:"경로를 읽는 loader입니다."},{text:"Document.from_index(documents)",why:"해당 생성 흐름이 아닙니다."},{text:"VectorStoreIndex.from_documents(documents)",why:"정답입니다."},{text:"index.as_query_engine(documents)",why:"index 생성 이후 단계입니다."},{text:"retriever.retrieve(documents)",why:"질문 검색 단계입니다."}]},
        {id:"rag1-m2",source_question_id:"rag1-q6",topic:"Chunk 적용",prompt:"custom SentenceSplitter를 index 생성에 적용하는 인자는?",answer_index:1,explanation:"LlamaIndex는 변환 pipeline 목록을 transformations로 받습니다.",choices:[{text:"documents=[text_splitter]",why:"문서 자리에 splitter를 넣습니다."},{text:"transformations=[text_splitter]",why:"정답입니다."},{text:"retriever=text_splitter",why:"retriever가 아닙니다."},{text:"embedding=text_splitter",why:"embedding model이 아닙니다."},{text:"query_engine=[text_splitter]",why:"query engine 인자가 아닙니다."}]},
        {id:"rag1-m3",source_question_id:"rag1-q17",topic:"검색과 합성",prompt:"StandardQueryEngine에서 retrieve 다음 단계는?",answer_index:4,explanation:"검색된 nodes와 query를 synthesizer가 답변으로 합성합니다.",choices:[{text:"index.insert(nodes)",why:"문서 추가 작업입니다."},{text:"nodes.load_data()",why:"Node는 loader가 아닙니다."},{text:"retriever.query(nodes)",why:"검색을 반복하는 호출이 아닙니다."},{text:"llm.delete(nodes)",why:"삭제 작업이 아닙니다."},{text:"response_synthesizer.synthesize(query_str, nodes)",why:"정답입니다."}]},
        {id:"rag1-m4",source_question_id:"rag1-q16",topic:"Index CRUD",prompt:"doc_id로 참조 문서를 완전히 삭제할 때 사용하는 호출은?",answer_index:0,explanation:"delete_ref_doc에 doc_id와 docstore 삭제 옵션을 전달합니다.",choices:[{text:"index.delete_ref_doc(id, delete_from_docstore=True)",why:"정답입니다."},{text:"docu.set_content(None)",why:"내용 변경이지 index 삭제가 아닙니다."},{text:"index.update_ref_doc(id)",why:"갱신 메서드입니다."},{text:"index.insert(id)",why:"추가 메서드입니다."},{text:"del query_engine[id]",why:"query engine을 dict처럼 지울 수 없습니다."}]},
        {id:"rag1-m5",source_question_id:"rag1-q18",topic:"Custom context",prompt:"검색 결과 n에서 prompt용 실제 text를 얻는 표현은?",answer_index:3,explanation:"NodeWithScore 안의 node에서 get_content를 호출합니다.",choices:[{text:"n.text()",why:"이 객체 구조의 호출이 아닙니다."},{text:"n.get_embedding()",why:"embedding을 가져옵니다."},{text:"n.query_str",why:"질문 문자열 속성이 아닙니다."},{text:"n.node.get_content()",why:"정답입니다."},{text:"n.index_struct",why:"index 구조가 아닙니다."}]}
      ]
    }, {
      id:"rag-02",number:"02",title:"RAG Prototype & Refinement",file:"2. RAG.ipynb",
      capability:"Wikipedia 문서를 기반으로 RAG를 구성하고 chunk 크기·검색 개수·prompt를 바꾸며 검색과 생성 단계를 직접 연결할 수 있다.",
      summary:"도시 문서를 WikipediaReader로 수집해 vector index를 만들고, Retriever와 Generator를 연결한 뒤 chunk와 prompt 구성에 따라 답변 근거와 길이를 조정합니다.",
      notebook_goal:"LLM 단독 응답의 한계를 확인하고 Wikipedia 기반 RAG를 직접 구성·비교·개선한다.",
      key_points:[
        {title:"LLM 호출",purpose:"system·user message를 모델에 전달하고 생성된 text를 꺼냅니다.",code:"chat.completions.create(... messages=messages)\nchoices[0].message.content",flow:"question → messages → completion text",watch:"API key는 소스에 직접 기록하지 않습니다."},
        {title:"Wikipedia 문서화",purpose:"도시 이름 목록을 Wikipedia Document 목록으로 읽습니다.",code:"WikipediaReader().load_data(city_names, auto_suggest=False)",flow:"city names → Documents → VectorStoreIndex",watch:"외부 서비스 요청에는 user agent 설정이 필요합니다."},
        {title:"RAG 연결",purpose:"질문으로 context를 검색한 뒤 그 context와 질문을 generator에 전달합니다.",code:"retrieve(query) → generate_response(query, context)",flow:"query → retrieved context → prompt → answer",watch:"검색 결과가 없는 LLM 단독 호출과 구분합니다."},
        {title:"검색 설정 비교",purpose:"chunk size와 top-k를 바꿔 문맥 완결성과 잡음의 균형을 확인합니다.",code:"SentenceSplitter\nas_retriever(similarity_top_k=k)",flow:"documents → chunks → top-k nodes",watch:"큰 chunk는 문맥이 넓지만 불필요한 내용도 늘 수 있습니다."},
        {title:"Refined RAG",purpose:"원문 passage와 중간 요약을 함께 관리하고 최종 prompt 정책을 적용합니다.",code:"return ret, results\ngenerate_response(query, context_str)",flow:"query → raw passages + summary → final answer",watch:"query_engine_sum과 query_engine_answer의 prompt 목적이 다릅니다."}
      ],
      theory_guide:[
        {title:"1. Grounding",concept:"Grounding은 답변을 검색한 외부 근거에 묶는 것입니다. 최신·전문 지식 오류를 줄이는 데 사용합니다.",flow:"external documents → retrieval → grounded prompt",code_signal:"context_str와 query가 같은 user message에 들어갑니다.",exam_clue:"generate_response 전에 retrieve가 호출되어야 합니다."},
        {title:"2. Chunk·Top-k",concept:"Chunk는 검색 단위이고 top-k는 질문마다 가져올 chunk 수입니다.",flow:"small chunk=정밀/단절 위험, large chunk=문맥/잡음 위험",code_signal:"SentenceSplitter와 as_retriever 인자를 함께 봅니다.",exam_clue:"splitter는 transformations 목록으로 index에 적용합니다."},
        {title:"3. Prompt 역할",concept:"같은 검색 결과도 QA prompt는 답변을, summary prompt는 압축된 문맥을 만듭니다.",flow:"nodes → prompt.format → llm.complete",code_signal:"qa_prompt에 simple_qa_prompt 또는 short_sum_prompt를 전달합니다.",exam_clue:"QueryEngine 클래스보다 주입한 prompt가 출력 목적을 결정합니다."},
        {title:"4. 두 단계 RAG",concept:"Refine_RAG는 raw passage와 query engine 결과를 함께 얻고 최종 LLM 호출로 답변을 다듬습니다.",flow:"retrieve → intermediate result → final generation",code_signal:"retrieve가 tuple(ret, results)을 반환합니다.",exam_clue:"query에서 tuple을 두 변수로 unpack한 뒤 generate_response를 호출합니다."}
      ],
      full_code_cells:[cell(7,answerP,answerA,[6,7,9]),cell(25,wikiP,wikiA,[2,3,4,6,7,8]),cell(38,scratchP,scratchA,[4,7,13,14]),cell(45,configP,configA,[1,2,3,4,6,7]),cell(56,custom2P,custom2A,[7,8,9,10,16]),cell(64,refineP,refineA,[3,4,5,9,12,14,15])],
      subjective:[
        S("rag2-q1","openai.chat.completions.create","OpenAI 호출","chat completions 생성 메서드까지 쓰세요."),S("rag2-q2","messages=messages","Messages","준비한 messages를 API에 전달하는 인자를 쓰세요."),S("rag2-q3","response.choices[0].message.content","응답 추출","첫 번째 생성 답변 text를 꺼내는 표현을 쓰세요."),
        S("rag2-q4","wikipedia.set_user_agent","Wikipedia 설정","Wikipedia 요청의 user agent를 지정하는 메서드까지 쓰세요."),S("rag2-q5","WikipediaReader()","Reader","Wikipedia 문서 reader를 생성하세요."),S("rag2-q6","reader.load_data(city_names, auto_suggest=False)","문서 로딩","도시 목록을 Document로 읽는 호출을 쓰세요."),
        S("rag2-q7","query_engine.query(query)","RAG 검색·응답","query engine에 질문을 전달하는 호출을 쓰세요."),S("rag2-q8","self.retrieve(query)","RAG 순서","query 메서드에서 context를 먼저 가져오는 호출을 쓰세요."),S("rag2-q9","self.generate_response(query, context_str)","RAG 생성","질문과 검색 context로 답을 만드는 호출을 쓰세요."),
        S("rag2-q10","SentenceSplitter(chunk_size=200, chunk_overlap=50)","Chunk 설정","짧은 chunk splitter 생성 표현을 쓰세요."),S("rag2-q11","transformations=[text_splitter_short]","Index 변환","짧은 splitter를 index에 적용하는 인자를 쓰세요."),S("rag2-q12","similarity_top_k=1","Top-k","검색 결과를 Node 1개로 제한하는 인자를 쓰세요."),
        S("rag2-q13","self.retriever.retrieve(query_str)","Custom 검색","custom_query에서 Node를 검색하는 호출을 쓰세요."),S("rag2-q14","n.node.get_content()","Context 구성","검색 결과의 Node 내용을 얻는 표현을 쓰세요."),S("rag2-q15","self.llm.complete","LLM 합성","format된 prompt를 실행하는 메서드까지 쓰세요."),S("rag2-q16","self.qa_prompt.format","Prompt 주입","context와 query를 template에 넣는 메서드까지 쓰세요."),
        S("rag2-q17","return ret, results","두 단계 검색","raw passage와 query engine 결과를 함께 반환하세요."),S("rag2-q18","response.choices[0].message.content","최종 응답","Refine_RAG의 최종 text를 반환하는 표현을 쓰세요.")
      ],
      mcq:[
        {id:"rag2-m1",source_question_id:"rag2-q8",topic:"RAG 순서",prompt:"RAG_from_scratch.query의 올바른 순서는?",answer_index:1,explanation:"먼저 관련 context를 검색한 뒤 질문과 context로 생성합니다.",choices:[{text:"generate → retrieve",why:"근거 없이 먼저 생성합니다."},{text:"retrieve → generate_response",why:"정답입니다."},{text:"insert → delete",why:"index 관리 흐름입니다."},{text:"complete → split",why:"문서 준비보다 생성이 앞섭니다."},{text:"evaluate → train",why:"모델 학습 흐름입니다."}]},
        {id:"rag2-m2",source_question_id:"rag2-q11",topic:"Chunk 적용",prompt:"text_splitter_short를 index 생성에 반영하는 코드는?",answer_index:3,explanation:"splitter는 transformations 목록으로 전달합니다.",choices:[{text:"documents=text_splitter_short",why:"문서 인자와 바뀌었습니다."},{text:"retriever=[text_splitter_short]",why:"retriever 설정이 아닙니다."},{text:"chunk_size=documents",why:"타입과 역할이 다릅니다."},{text:"transformations=[text_splitter_short]",why:"정답입니다."},{text:"query_engine=text_splitter_short",why:"query engine 인자가 아닙니다."}]},
        {id:"rag2-m3",source_question_id:"rag2-q12",topic:"검색 개수",prompt:"비교를 위해 검색 Node를 하나만 반환하려면?",answer_index:0,explanation:"as_retriever의 similarity_top_k를 1로 설정합니다.",choices:[{text:"similarity_top_k=1",why:"정답입니다."},{text:"chunk_size=1",why:"chunk token 크기를 바꿉니다."},{text:"num_documents=1",why:"이 API의 인자가 아닙니다."},{text:"top_p=1",why:"LLM sampling 설정입니다."},{text:"temperature=1",why:"생성 다양성 설정입니다."}]},
        {id:"rag2-m4",source_question_id:"rag2-q16",topic:"Prompt 구성",prompt:"context_str와 query_str를 PromptTemplate에 넣는 단계는?",answer_index:4,explanation:"template.format으로 변수를 채운 뒤 llm.complete에 전달합니다.",choices:[{text:"retriever.retrieve",why:"Node 검색 단계입니다."},{text:"reader.load_data",why:"문서 로딩입니다."},{text:"index.as_query_engine",why:"engine 생성입니다."},{text:"response.content",why:"이미 생성된 답을 꺼냅니다."},{text:"self.qa_prompt.format",why:"정답입니다."}]},
        {id:"rag2-m5",source_question_id:"rag2-q17",topic:"Refined RAG",prompt:"Refine_RAG.retrieve가 두 값을 반환하는 이유는?",answer_index:2,explanation:"원문 검색 passage와 query engine의 중간 결과를 모두 확인·활용하기 위해서입니다.",choices:[{text:"API key 두 개를 쓰기 위해",why:"인증과 무관합니다."},{text:"train/test를 나누기 위해",why:"학습 데이터 분할이 아닙니다."},{text:"raw passage와 중간 결과를 함께 쓰기 위해",why:"정답입니다."},{text:"두 모델을 학습하기 위해",why:"모델 학습 코드가 아닙니다."},{text:"문서를 삭제하기 위해",why:"CRUD 작업이 아닙니다."}]}
      ]
    }, {
      id:"rag-03",number:"03",title:"CRAG Data Preprocessing",file:"1. Data_preprocessing.ipynb",
      capability:"압축 JSONL 데이터를 안전하게 읽고 질문 속성 분포와 검색 결과 schema를 확인한 뒤 HTML page_result를 문장 chunk로 정제할 수 있다.",
      summary:"bz2 압축 파일의 각 줄을 JSON 객체로 만들고 domain·question type·dynamism을 분석한 뒤 검색 결과 HTML에서 text를 추출해 문장 단위 검색 재료로 바꿉니다.",
      notebook_goal:"CRAG 데이터 구조를 파악하고 RAG가 사용할 검색 결과를 깨끗한 문장 chunk로 전처리한다.",
      key_points:[
        {title:"압축 JSONL 로딩",purpose:"압축을 풀어 별도 저장하지 않고 text mode로 한 줄씩 JSON을 읽습니다.",code:"bz2.open(path,'rt')\njson.loads(line.strip())",flow:".jsonl.bz2 → line → dict → dataset",watch:"json.load가 아니라 각 line에 json.loads를 적용합니다."},
        {title:"Schema 분류",purpose:"domain·question_type·static_or_dynamic별 대표 예제와 개수를 파악합니다.",code:"unique[key]=item\nCounter(item[field] for item in dataset)",flow:"list[dict] → category map/count",watch:"query가 질문, answer가 정답 field입니다."},
        {title:"Search result 구조",purpose:"각 질문에 연결된 page_name·page_snippet·page_result의 역할과 길이를 확인합니다.",code:"example_data['search_results']",flow:"question record → list[search page]",watch:"실제 근거 본문은 page_result에 있습니다."},
        {title:"HTML text 추출",purpose:"태그와 navigation noise를 제거해 순수 text를 만듭니다.",code:'BeautifulSoup(html, features="lxml").get_text(" ", strip=True)',flow:"HTML → parsed tree → plain text",watch:"page_snippet만 사용하면 근거가 부족할 수 있습니다."},
        {title:"문장 Chunk",purpose:"긴 page text를 문장 경계 offset으로 나누고 길이를 제한합니다.",code:"text_to_sentences_and_offsets(text)\ntext[start:end][:4000]",flow:"plain text → offsets → chunks",watch:"offset은 원문 slice의 start와 end입니다."}
      ],
      theory_guide:[
        {title:"1. JSONL",concept:"JSONL은 한 줄에 JSON 객체 하나를 저장하는 형식이라 큰 파일을 순차 처리할 수 있습니다.",flow:"one line → one record",code_signal:"for line in file 안에서 json.loads를 호출합니다.",exam_clue:"파싱 실패는 JSONDecodeError로 처리합니다."},
        {title:"2. 데이터 Schema",concept:"Schema는 record가 가진 field 구조입니다. 이 데이터는 query·answer와 분류 field, search_results를 포함합니다.",flow:"record → metadata + target + evidence",code_signal:"item['field'] 접근을 반복합니다.",exam_clue:"질문/정답 key를 query/answer로 혼동하지 않습니다."},
        {title:"3. HTML parsing",concept:"Parsing은 HTML 구조를 해석해 검색에 필요한 text만 추출하는 과정입니다.",flow:"page_result HTML → BeautifulSoup → get_text",code_signal:"features='lxml'과 strip=True를 함께 사용합니다.",exam_clue:"page_result를 parser에 넣고 soup에서 text를 얻습니다."},
        {title:"4. Sentence offsets",concept:"문장 offset은 각 문장이 원문에서 시작·끝나는 위치입니다.",flow:"text → [(start,end)] → text[start:end]",code_signal:"BlingFire 함수의 두 번째 반환값이 offsets입니다.",exam_clue:"각 offset을 순회하며 chunk를 all_chunks에 추가합니다."}
      ],
      full_code_cells:[cell(16,loadDataP,loadDataA,[4,7,8,9]),cell(21,inspectP,inspectA,[6,8,9,10]),cell(25,statsP,statsA,[2,3,4,6]),cell(39,schemaP,schemaA,[2,3,4,5]),cell(44,parseP,parseA,[5,6,10,13,14])],
      subjective:[
        S("prep-q1","bz2.open(file_path, 'rt')","압축 파일","bz2 파일을 text read mode로 여는 표현을 쓰세요."),S("prep-q2","json.loads(line.strip())","JSON 파싱","한 줄을 JSON 객체로 변환하는 표현을 쓰세요."),S("prep-q3","dataset.append(data)","Dataset 구성","파싱한 record를 dataset에 추가하세요."),S("prep-q4","json.JSONDecodeError","예외 처리","잘못된 JSON line을 잡는 예외 클래스를 쓰세요."),
        S("prep-q5","unique_domains[domain_value] = item","대표 예제","domain별 첫 record를 저장하는 대입문을 쓰세요."),S("prep-q6","unique_domains.items()","Dictionary 순회","domain과 example을 함께 순회할 호출을 쓰세요."),S("prep-q7","example_item['query']","질문 field","대표 record에서 질문을 가져오세요."),S("prep-q8","example_item['answer']","정답 field","대표 record에서 정답을 가져오세요."),
        S("prep-q9","item['domain']","Domain 집계","Counter가 집계할 domain 표현을 쓰세요."),S("prep-q10","item['question_type']","Question type","질문 유형 field 접근을 쓰세요."),S("prep-q11","item['static_or_dynamic']","Dynamism","정적·동적 구분 field 접근을 쓰세요."),S("prep-q12","domain_counts.keys(), domain_counts.values()","막대그래프","bar chart의 x와 height 인자를 순서대로 쓰세요."),
        S("prep-q13","example_data['search_results']","검색 결과","record에서 검색 결과 목록을 가져오세요."),S("prep-q14",'html_text["page_result"]',"본문 HTML","검색 결과에서 전체 본문 HTML을 선택하세요."),S("prep-q15",'features="lxml"',"HTML parser","BeautifulSoup의 parser 선택 인자를 쓰세요."),S("prep-q16",'soup.get_text(" ", strip=True)',"Text 추출","태그를 제거하고 공백으로 연결한 text를 얻으세요."),S("prep-q17","text_to_sentences_and_offsets(text)","문장 분할","text의 문장 경계 offset을 얻는 호출을 쓰세요."),S("prep-q18","text[start:end][:4000]","Chunk slice","문장 범위를 자르고 최대 4000자로 제한하세요."),S("prep-q19","all_chunks.append(chunk)","Chunk 저장","완성된 chunk를 결과 목록에 추가하세요.")
      ],
      mcq:[
        {id:"prep-m1",source_question_id:"prep-q2",topic:"JSONL 읽기",prompt:"JSONL의 각 line을 dict로 바꾸는 올바른 호출은?",answer_index:1,explanation:"문자열 한 줄은 json.loads로 파싱합니다.",choices:[{text:"json.load(line)",why:"load는 file 객체용입니다."},{text:"json.loads(line.strip())",why:"정답입니다."},{text:"json.dumps(line)",why:"객체를 문자열로 직렬화합니다."},{text:"bz2.loads(line)",why:"bz2는 JSON parser가 아닙니다."},{text:"line.to_json()",why:"문자열 메서드가 아닙니다."}]},
        {id:"prep-m2",source_question_id:"prep-q7",topic:"Schema",prompt:"CRAG record에서 질문 text가 저장된 key는?",answer_index:3,explanation:"노트북이 확인한 질문 key는 query입니다.",choices:[{text:"question",why:"일반적 이름이지만 이 schema에는 다릅니다."},{text:"prompt",why:"LLM prompt key가 아닙니다."},{text:"page_name",why:"검색 결과 제목입니다."},{text:"query",why:"정답입니다."},{text:"answer",why:"정답 text key입니다."}]},
        {id:"prep-m3",source_question_id:"prep-q14",topic:"검색 근거",prompt:"RAG가 전체 검색 본문을 사용하려면 어느 field를 파싱해야 하나요?",answer_index:2,explanation:"page_result에 전체 페이지 HTML이 들어 있습니다.",choices:[{text:"page_name",why:"제목뿐입니다."},{text:"page_snippet",why:"짧은 요약이라 근거가 부족할 수 있습니다."},{text:"page_result",why:"정답입니다."},{text:"domain",why:"질문 분류입니다."},{text:"static_or_dynamic",why:"시간 특성 분류입니다."}]},
        {id:"prep-m4",source_question_id:"prep-q16",topic:"HTML 정제",prompt:"BeautifulSoup 객체에서 태그를 제거한 text를 얻는 호출은?",answer_index:0,explanation:"get_text에 separator와 strip 옵션을 지정합니다.",choices:[{text:'soup.get_text(" ", strip=True)',why:"정답입니다."},{text:"soup.page_result()",why:"해당 메서드가 없습니다."},{text:"soup.loads()",why:"JSON parser와 혼동했습니다."},{text:"soup.text_to_html()",why:"방향이 반대이며 메서드도 없습니다."},{text:"BeautifulSoup.get_json()",why:"HTML을 JSON으로 읽는 단계가 아닙니다."}]},
        {id:"prep-m5",source_question_id:"prep-q18",topic:"문장 Chunk",prompt:"offset (start,end)로 원문 문장을 추출하고 길이를 제한하는 표현은?",answer_index:4,explanation:"먼저 문장 범위를 slice하고 다시 최대 길이를 slice합니다.",choices:[{text:"text[:start][end:]",why:"범위가 뒤집힙니다."},{text:"text[start+end]",why:"한 문자 index가 됩니다."},{text:"text.split(start,end)",why:"split 인자가 아닙니다."},{text:"text[offsets][:4000]",why:"offset 목록으로 직접 문자열을 index할 수 없습니다."},{text:"text[start:end][:4000]",why:"정답입니다."}]}
      ]
    }]
  };
})();
