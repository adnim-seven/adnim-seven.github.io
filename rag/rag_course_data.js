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

  const task1ChunkP = ["### YOUR CODE HERE ###","def parse_htmls(search_results):","    all_documents = []","    for html_text in search_results:","        soup = BeautifulSoup(html_text[????], features=????)","        text = soup.????(\" \", strip=True)","        all_documents.????(text)","    return all_documents","","def extract_chunks(all_documents):","    all_chunks = []","    for document in all_documents:","        if not document:","            all_chunks.append(\"\")","        else:","            _, offsets = ????(document)","            for start, end in offsets:","                chunk = document[????][:MAX_CONTEXT_SENTENCE_LENGTH]","                all_chunks.????(chunk)","    return all_chunks"];
  const task1ChunkA = fill(task1ChunkP,{4:'        soup = BeautifulSoup(html_text["page_result"], features="lxml")',5:'        text = soup.get_text(" ", strip=True)',6:"        all_documents.append(text)",15:"            _, offsets = text_to_sentences_and_offsets(document)",17:"                chunk = document[start:end][:MAX_CONTEXT_SENTENCE_LENGTH]",18:"                all_chunks.append(chunk)"});

  const baseRetP = ["### YOUR CODE HERE ###","class BaseRetriever:","    def __init__(self,):","        self.client = openai.????(api_key = os.environ[\"OPENAI_API_KEY\"])","    def embed_text(self, texts):","        if isinstance(texts, str):","            texts = [texts]","        response = self.client.embeddings.????(","            model=\"text-embedding-3-small\", input=texts)","        embeddings = [np.array(item.embedding) for item in response.data]","        return np.array(embeddings)","    def retrieve(self, query, search_results, topk):","        all_documents = parse_htmls(search_results)","        all_chunks = extract_chunks(all_documents)","        all_embeddings = self.????(all_chunks)","        query_embedding = self.????(query)[0]","        cosine_scores = np.????(all_embeddings, query_embedding) / (","            np.linalg.????(all_embeddings, axis=1) * np.linalg.????(query_embedding)","        )","        top_k_indices = (-cosine_scores).????()[:topk]","        top_k_chunks = np.array(all_chunks)[top_k_indices]","        return top_k_chunks"];
  const baseRetA = fill(baseRetP,{3:'        self.client = openai.OpenAI(api_key = os.environ["OPENAI_API_KEY"])',7:"        response = self.client.embeddings.create(",14:"        all_embeddings = self.embed_text(all_chunks)",15:"        query_embedding = self.embed_text(query)[0]",16:"        cosine_scores = np.dot(all_embeddings, query_embedding) / (",17:"            np.linalg.norm(all_embeddings, axis=1) * np.linalg.norm(query_embedding)",19:"        top_k_indices = (-cosine_scores).argsort()[:topk]"});

  const llamaRetP = ["### YOUR CODE HERE ###","class LlamaIndexRetriever:","  def __init__(self):","      self.parser = SentenceSplitter(chunk_size=512, chunk_overlap=0)","  def retrieve(self, query, search_results, topk):","      documents = []","      for document in parse_htmls(search_results):","        if not document:","            documents.append(Document(text=\"\"))","        else:","            documents.append(Document(text=document))","      # Split documents into chunks & Create vector index","      base_index = VectorStoreIndex.????(documents = documents, transformations=[self.parser])","      # Execute query","      base_retriever = base_index.????(similarity_top_k=topk)","      retrieved_nodes = base_retriever.????(query)","      retrieved_results = [retrieved_node.node.????().strip() for retrieved_node in retrieved_nodes]","      return retrieved_results"];
  const llamaRetA = fill(llamaRetP,{12:"      base_index = VectorStoreIndex.from_documents(documents = documents, transformations=[self.parser])",14:"      base_retriever = base_index.as_retriever(similarity_top_k=topk)",15:"      retrieved_nodes = base_retriever.retrieve(query)",16:"      retrieved_results = [retrieved_node.node.get_content().strip() for retrieved_node in retrieved_nodes]"});

  const promptP = ["### YOUR CODE HERE ###","def prompt_generator(query, top_k_chunks, system_prompt):","    user_message = \"\"","    references = \"\"","    if len(top_k_chunks) > 0:","        references += \"# References \\n\"","        # Format the top sentences as references in the model's prompt template.","        for chunk_id, chunk in enumerate(top_k_chunks):","            references += f\"- {chunk.????()}\\n\"","    references = references[:????]","    # Limit the length of references to fit the model's input size.","    user_message += f\"{references}\\n------\\n\\n\"","    user_message += f\"Using only the references listed above, answer the following question: \\n\"","    user_message += f\"Question: {query}\\n\"","    llm_input = [","      {\"role\": \"system\", \"content\": ????},","      {\"role\": \"user\", \"content\": ????},","    ]","    return ????"];
  const promptA = fill(promptP,{8:'            references += f"- {chunk.strip()}\\n"',9:"    references = references[:MAX_CONTEXT_REFERENCES_LENGTH]",15:'      {"role": "system", "content": system_prompt},',16:'      {"role": "user", "content": user_message},',18:"    return llm_input"});

  const readerP = ["### YOUR CODE HERE ###","class Reader:","  def __init__(self):","    self.system_prompt = system_prompt","  def generate_response(self, query: str, top_k_chunks: list) -> str:","      llm_input = self.????(query, top_k_chunks)","      completion = oai_client.chat.completions.????(","          model=\"gpt-3.5-turbo\", temperature=0, messages=????","      ).choices[0].message.????","      return completion","  def prompt_generator(self, query, top_k_chunks):","      references = \"\"","      for chunk_id, chunk in enumerate(top_k_chunks):","          references += f\"- {chunk.strip()}\\n\"","      references = references[:MAX_CONTEXT_REFERENCES_LENGTH]","      user_message = f\"{references}\\n------\\nQuestion: {query}\\n\"","      llm_input = [","        {\"role\": \"system\", \"content\": self.system_prompt},","        {\"role\": \"user\", \"content\": user_message},","      ]","      return llm_input"];
  const readerA = fill(readerP,{5:"      llm_input = self.prompt_generator(query, top_k_chunks)",6:"      completion = oai_client.chat.completions.create(",7:'          model="gpt-3.5-turbo", temperature=0, messages=llm_input',8:"      ).choices[0].message.content"});

  const ragPipeP = ["### YOUR CODE HERE ###","class RAG:","    def __init__(self):","        self.retriever = ????()","        self.reader = ????()","    def inference(self, query, search_results, topk):","        # 1. retrieve relevant chunks","        retrieved_results = self.retriever.????(query, search_results, topk)","        # 2. answer the question based on the retrieved chunks","        answer = self.reader.????(query, retrieved_results)","        return ????, ????"];
  const ragPipeA = fill(ragPipeP,{3:"        self.retriever = LlamaIndexRetriever()",4:"        self.reader = Reader()",7:"        retrieved_results = self.retriever.retrieve(query, search_results, topk)",9:"        answer = self.reader.generate_response(query, retrieved_results)",10:"        return answer, retrieved_results"});

  const apiP = ["### YOUR CODE HERE ###","class CRAG(object):","    def __init__(self, server = None):","        self.server = os.environ.????('CRAG_SERVER', \"http://10.2.0.165:8000\")","    def finance_get_company_name(self, query:str):","        url = self.server + ????","        headers={'accept': \"application/json\"}","        data = {'query': query}","        result = requests.????(url, json=data, headers=headers)","        return json.????(result.text)","    def finance_get_ticker_by_name(self, query:str):","        url = self.server + '/finance/get_ticker_by_name'","        result = requests.post(url, json={'query': query}, headers={'accept': \"application/json\"})","        return json.loads(result.text)"];
  const apiA = fill(apiP,{3:'        self.server = os.environ.get(\'CRAG_SERVER\', "http://10.2.0.165:8000")',5:"        url = self.server + '/finance/get_company_name'",8:"        result = requests.post(url, json=data, headers=headers)",9:"        return json.loads(result.text)"});

  const queryGenP = ["### YOUR CODE HERE ###","def prompt_generator(query):","    user_message = \"\"","    user_message += f\"Query: {query}\\n\"","    llm_input = [","      {\"role\": \"system\", \"content\": ????},","      {\"role\": \"user\", \"content\": ????},","    ]","    return llm_input","","def generate_query(query):","    llm_input = ????(query)","    completion = oai_client.chat.completions.create(","        model=\"gpt-3.5-turbo\", temperature=0, messages=????","    ).choices[0].message.content","    try:","        completion = json.????(completion)","    except:","        completion = ????(completion)","    if \"domain\" in completion.????:","        domain = completion[\"domain\"]","        is_finance = domain == ????","    else:","        is_finance = False","    return completion, is_finance"];
  const queryGenA = fill(queryGenP,{5:'      {"role": "system", "content": entity_extract_template},',6:'      {"role": "user", "content": user_message},',11:"    llm_input = prompt_generator(query)",13:"        model=\"gpt-3.5-turbo\", temperature=0, messages=llm_input",16:"        completion = json.loads(completion)",18:"        completion = extract_json_objects(completion)",19:'    if "domain" in completion.keys():',21:'        is_finance = domain == "finance"'});

  const financeP = ["### YOUR CODE HERE ###","def normalize_key(key):","    return re.????(r'[^a-zA-Z0-9]', '', key).lower()","def get_metric_from_response(response, metric):","    normalized_metric = normalize_key(metric)","    if response != None:","        for key, value in response.????:","            if normalize_key(key) == normalized_metric:","                return value","    return None","","def get_finance_kg_results(generated_query):","    company_names = generated_query[\"market_identifier\"]","    if isinstance(company_names, str):","        company_names = company_names.????(\",\")","    for company_name in company_names:","        res = api.finance_get_company_name(company_name)[\"result\"]","        ticker_name = api.finance_get_ticker_by_name(res[0])[\"result\"]","        if generated_query['metric'].lower().strip() == 'eps':","            response = api.????(ticker_name)[\"result\"]","    kg_results = \"<DOC>\\n\".????([str(res) for res in kg_results]) if len(kg_results) > 0 else \"\"","    return kg_results"];
  const financeA = fill(financeP,{2:"    return re.sub(r'[^a-zA-Z0-9]', '', key).lower()",6:"        for key, value in response.items():",14:'        company_names = generated_query["market_identifier"].split(",")',19:'            response = api.finance_get_eps(ticker_name)["result"]',20:'    kg_results = "<DOC>\\n".join([str(res) for res in kg_results]) if len(kg_results) > 0 else ""'});

  const kgRagP = ["### YOUR CODE HERE ###","class KGQueryEngine:","    def query(self, query):","        generated_query, is_finance = self.????(query)","        if is_finance:","            kg_results = self.????(generated_query)","        else:","            kg_results = \"\"","        return ????, ????","","class RAGWithKG:","    def __init__(self):","        self.kg_query_engine = ????()","        self.reader = ????()","    def inference(self, query):","        # 1. retrieve relevant kg results","        kg_results, is_finance = self.kg_query_engine.????(query)","        # 2. answer the question based on the retrieved chunks","        answer = self.reader.????(query, [kg_results])","        return answer, kg_results"];
  const kgRagA = fill(kgRagP,{3:"        generated_query, is_finance = self.generate_query(query)",5:"            kg_results = self.get_finance_kg_results(generated_query)",8:"        return kg_results, is_finance",12:"        self.kg_query_engine = KGQueryEngine()",13:"        self.reader = Reader()",16:"        kg_results, is_finance = self.kg_query_engine.query(query)",18:"        answer = self.reader.generate_response(query, [kg_results])"});

  const hybridP = ["### YOUR CODE HERE ###","class RAGWithSRKG:","    def __init__(self):","        self.retriever = ????()","        self.kg_query_engine = ????()","        self.reader = ????()","    def inference(self, query, search_results, topk):","        # 1. retrieve relevant chunks","        retrieved_results = self.retriever.????(query, search_results, topk)","        # 2. retrieve relevant kg results","        kg_results, is_finance = self.kg_query_engine.????(query)","        # combined_results = [kg_results]","        # combined_results.extend(retrieved_results)","        if is_finance:","          combined_results = ????","        else:","          combined_results = ????","        # 3. answer the question based on the retrieved chunks","        answer = self.reader.????(query, combined_results)","        return ????, ????"];
  const hybridA = fill(hybridP,{3:"        self.retriever = LlamaIndexRetriever()",4:"        self.kg_query_engine = KGQueryEngine()",5:"        self.reader = Reader()",8:"        retrieved_results = self.retriever.retrieve(query, search_results, topk)",10:"        kg_results, is_finance = self.kg_query_engine.query(query)",14:"          combined_results = [kg_results]",16:"          combined_results = retrieved_results",18:"        answer = self.reader.generate_response(query, combined_results)",19:"        return answer, combined_results"});

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
      "prep-q13":{source:"example_data['search_results']"},"prep-q14":{source:'html_text["page_result"]'},"prep-q15":{source:'features="lxml"'},"prep-q16":{source:'soup.get_text(" ", strip=True)'},"prep-q17":{source:"text_to_sentences_and_offsets(text)"},"prep-q18":{source:"text[start:end][:4000]"},"prep-q19":{source:"all_chunks.append(chunk)"},
      "t1-q1":{source:'html_text["page_result"]'},"t1-q2":{source:'features="lxml"'},"t1-q3":{source:'soup.get_text(" ", strip=True)'},"t1-q4":{source:"text_to_sentences_and_offsets(document)"},"t1-q5":{source:"document[start:end][:MAX_CONTEXT_SENTENCE_LENGTH]"},
      "t1-q6":{source:"openai.OpenAI"},"t1-q7":{source:"self.client.embeddings.create"},"t1-q8":{source:"self.embed_text(all_chunks)"},"t1-q9":{source:"np.dot(all_embeddings, query_embedding)"},"t1-q10":{source:"np.linalg.norm"},"t1-q11":{source:"(-cosine_scores).argsort()[:topk]"},
      "t1-q12":{source:"VectorStoreIndex.from_documents"},"t1-q13":{source:"base_index.as_retriever"},"t1-q14":{source:"base_retriever.retrieve(query)"},"t1-q15":{source:"retrieved_node.node.get_content().strip()"},
      "t1-q16":{source:"chunk.strip()"},"t1-q17":{source:"MAX_CONTEXT_REFERENCES_LENGTH"},"t1-q18":{source:"system_prompt"},"t1-q19":{source:"user_message"},"t1-q20":{source:"llm_input"},
      "t1-q21":{source:"self.prompt_generator(query, top_k_chunks)"},"t1-q22":{source:"messages=llm_input"},"t1-q23":{source:"LlamaIndexRetriever()"},"t1-q24":{source:"Reader()"},"t1-q25":{source:"self.retriever.retrieve(query, search_results, topk)"},"t1-q26":{source:"self.reader.generate_response(query, retrieved_results)"},"t1-q27":{source:"return answer, retrieved_results"},
      "t2-q1":{source:"os.environ.get('CRAG_SERVER'"},"t2-q2":{source:"requests.post(url, json=data, headers=headers)"},"t2-q3":{source:"json.loads(result.text)"},
      "t2-q4":{source:"entity_extract_template"},"t2-q5":{source:"prompt_generator(query)"},"t2-q6":{source:"json.loads(completion)"},"t2-q7":{source:"extract_json_objects(completion)"},"t2-q8":{source:"completion.keys()"},"t2-q9":{source:'domain == "finance"'},
      "t2-q10":{source:"re.sub(r'[^a-zA-Z0-9]', '', key).lower()"},"t2-q11":{source:"response.items()"},"t2-q12":{source:'generated_query["market_identifier"].split(",")'},"t2-q13":{source:"api.finance_get_eps(ticker_name)"},"t2-q14":{source:'"<DOC>\\n".join'},
      "t2-q15":{source:"self.generate_query(query)"},"t2-q16":{source:"self.get_finance_kg_results(generated_query)"},"t2-q17":{source:"return kg_results, is_finance"},"t2-q18":{source:"KGQueryEngine()"},"t2-q19":{source:"self.reader.generate_response(query, [kg_results])"},
      "t2-q20":{source:"LlamaIndexRetriever()"},"t2-q21":{source:"self.retriever.retrieve(query, search_results, topk)"},"t2-q22":{source:"self.kg_query_engine.query(query)"},"t2-q23":{source:"combined_results = [kg_results]"},"t2-q24":{source:"combined_results = retrieved_results"},"t2-q25":{source:"self.reader.generate_response(query, combined_results)"},"t2-q26":{source:"return answer, combined_results"}
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
    }, {
      id:"rag-04",number:"04",title:"Task 1 · Web Retrieval Summarization",file:"2. Task_1.ipynb",
      capability:"HTML 검색 결과를 문장 chunk로 만들고 cosine similarity 또는 LlamaIndex로 Top-k 근거를 검색해 Reader prompt와 연결할 수 있다.",
      summary:"웹 HTML이 plain text와 문장 chunk로 정제되고, query와 chunk embedding의 cosine similarity로 근거를 고른 뒤 Reader가 근거 제한 prompt로 짧은 답을 생성합니다.",
      notebook_goal:"CRAG Task 1용 Retriever·Prompt Generator·Reader를 구현하고 하나의 RAG inference pipeline으로 결합한다.",
      key_points:[
        {title:"HTML→Chunk",purpose:"page_result의 태그를 제거하고 문장 경계에 맞춰 검색 단위를 만듭니다.",code:"BeautifulSoup → get_text → sentence offsets → slice",flow:"HTML pages → documents → chunks",watch:"빈 문서는 빈 문자열 placeholder로 유지합니다."},
        {title:"Embedding 검색",purpose:"query와 모든 chunk를 같은 vector 공간으로 바꾸고 cosine similarity가 큰 Top-k를 고릅니다.",code:"embeddings.create\nnp.dot/(norm*norm)\nargsort()[:topk]",flow:"text → vectors → scores → top chunks",watch:"점수 내림차순은 -cosine_scores를 정렬합니다."},
        {title:"LlamaIndex Retriever",purpose:"Document 분할·index·검색 과정을 framework로 간결하게 구성합니다.",code:"from_documents → as_retriever(top_k) → retrieve",flow:"Documents → index → Nodes",watch:"NodeWithScore에서 node.get_content()를 호출합니다."},
        {title:"Prompt Generator",purpose:"검색 근거를 길이 제한 안에서 user message로 만들고 system/user role을 구성합니다.",code:"references[:MAX_CONTEXT_REFERENCES_LENGTH]\nllm_input=[system,user]",flow:"chunks → references → messages",watch:"근거가 없으면 I don't know를 답하도록 system prompt에 지정합니다."},
        {title:"RAG Pipeline",purpose:"Retriever 결과를 Reader 입력에 그대로 연결하고 답과 근거를 함께 반환합니다.",code:"retrieve → generate_response → return answer, results",flow:"query+search_results → answer+evidence",watch:"오답 분석 때 retrieved_results를 함께 확인해야 원인을 나눌 수 있습니다."}
      ],
      theory_guide:[
        {title:"1. Cosine similarity",concept:"두 vector 방향의 유사도를 내적을 각 vector 크기로 나누어 측정합니다.",flow:"dot(q,c)/(||q||·||c||)",code_signal:"np.dot과 np.linalg.norm이 같은 식에 있습니다.",exam_clue:"가장 큰 점수부터 고르기 위해 음수로 바꿔 argsort합니다."},
        {title:"2. Top-k retrieval",concept:"Top-k는 질문과 가장 관련된 검색 단위 k개만 Reader에 전달하는 절차입니다.",flow:"all chunks → scores → indices → selected chunks",code_signal:"np.array(all_chunks)[top_k_indices]입니다.",exam_clue:"topk는 chunk 길이가 아니라 반환 개수입니다."},
        {title:"3. Reader",concept:"Reader는 검색하지 않고 전달받은 근거와 질문을 prompt로 만들어 LLM 답을 생성합니다.",flow:"query+chunks → llm_input → completion",code_signal:"prompt_generator 결과가 messages 인자로 들어갑니다.",exam_clue:"Retriever와 Reader의 책임을 섞지 않습니다."},
        {title:"4. End-to-end RAG",concept:"RAG inference는 검색 실패와 생성 실패를 분리해서 확인할 수 있도록 답과 근거를 함께 반환합니다.",flow:"retrieve → read → answer,evidence",code_signal:"RAG 클래스가 LlamaIndexRetriever와 Reader를 소유합니다.",exam_clue:"generate_response의 context는 원본 search_results가 아니라 retrieved_results입니다."}
      ],
      full_code_cells:[cell(7,task1ChunkP,task1ChunkA,[4,5,6,15,17,18]),cell(12,baseRetP,baseRetA,[3,7,14,15,16,17,19]),cell(16,llamaRetP,llamaRetA,[12,14,15,16]),cell(23,promptP,promptA,[8,9,15,16,18]),cell(25,readerP,readerA,[5,6,7,8]),cell(29,ragPipeP,ragPipeA,[3,4,7,9,10])],
      subjective:[
        S("t1-q1",'html_text["page_result"]',"HTML 본문","검색 결과에서 전체 HTML field를 선택하세요."),S("t1-q2",'features="lxml"',"Parser","BeautifulSoup parser 인자를 쓰세요."),S("t1-q3",'soup.get_text(" ", strip=True)',"Text 추출","태그를 제거한 text를 얻는 호출을 쓰세요."),S("t1-q4","text_to_sentences_and_offsets(document)","문장 분할","문장 offset을 얻는 호출을 쓰세요."),S("t1-q5","document[start:end][:MAX_CONTEXT_SENTENCE_LENGTH]","Chunk","문장 범위를 추출하고 최대 길이를 제한하세요."),
        S("t1-q6","openai.OpenAI","Client","OpenAI client 생성 클래스까지 쓰세요."),S("t1-q7","self.client.embeddings.create","Embedding API","embedding 생성 메서드까지 쓰세요."),S("t1-q8","self.embed_text(all_chunks)","Chunk embedding","모든 chunk를 embedding하는 호출을 쓰세요."),S("t1-q9","np.dot(all_embeddings, query_embedding)","내적","모든 chunk와 query vector의 내적을 계산하세요."),S("t1-q10","np.linalg.norm","Vector norm","cosine 분모의 vector 크기 함수까지 쓰세요."),S("t1-q11","(-cosine_scores).argsort()[:topk]","Top-k","유사도 내림차순 상위 index를 고르세요."),
        S("t1-q12","VectorStoreIndex.from_documents","Index","Document로 index를 만드는 메서드까지 쓰세요."),S("t1-q13","base_index.as_retriever","Retriever","index에서 retriever를 만드는 메서드까지 쓰세요."),S("t1-q14","base_retriever.retrieve(query)","검색 실행","query로 Node를 검색하는 호출을 쓰세요."),S("t1-q15","retrieved_node.node.get_content().strip()","Node text","검색 Node의 정제된 text를 얻으세요."),
        S("t1-q16","chunk.strip()","Reference 정제","각 chunk 양끝 공백을 제거하세요."),S("t1-q17","MAX_CONTEXT_REFERENCES_LENGTH","Prompt 길이","reference 최대 길이 상수를 쓰세요."),S("t1-q18","system_prompt","System role","system message content에 넣을 변수를 쓰세요."),S("t1-q19","user_message","User role","user message content에 넣을 변수를 쓰세요."),S("t1-q20","llm_input","Prompt 반환","완성된 messages 목록을 반환하세요."),
        S("t1-q21","self.prompt_generator(query, top_k_chunks)","Reader prompt","Reader에서 messages를 만드는 호출을 쓰세요."),S("t1-q22","messages=llm_input","LLM messages","생성 API에 llm_input을 전달하는 인자를 쓰세요."),S("t1-q23","LlamaIndexRetriever()","RAG 구성","RAG의 retriever 객체를 생성하세요."),S("t1-q24","Reader()","RAG 구성","RAG의 reader 객체를 생성하세요."),S("t1-q25","self.retriever.retrieve(query, search_results, topk)","Inference 검색","inference에서 Top-k 근거를 검색하는 호출을 쓰세요."),S("t1-q26","self.reader.generate_response(query, retrieved_results)","Inference 생성","검색 결과로 답을 생성하는 호출을 쓰세요."),S("t1-q27","return answer, retrieved_results","검증 가능 반환","답과 근거를 함께 반환하세요.")
      ],
      mcq:[
        {id:"t1-m1",source_question_id:"t1-q11",topic:"Top-k 정렬",prompt:"cosine score가 큰 순서의 상위 k index를 고르는 코드는?",answer_index:2,explanation:"argsort는 오름차순이므로 점수에 음수를 붙여 내림차순 효과를 냅니다.",choices:[{text:"cosine_scores.argsort()[:topk]",why:"가장 작은 점수를 고릅니다."},{text:"cosine_scores.argmax()[:topk]",why:"argmax는 scalar라 slice할 수 없습니다."},{text:"(-cosine_scores).argsort()[:topk]",why:"정답입니다."},{text:"cosine_scores.sort(topk)",why:"NumPy 사용법과 목적이 다릅니다."},{text:"np.norm(cosine_scores)",why:"정렬하지 않습니다."}]},
        {id:"t1-m2",source_question_id:"t1-q15",topic:"LlamaIndex 결과",prompt:"NodeWithScore에서 실제 chunk text를 얻는 표현은?",answer_index:1,explanation:"wrapper의 node에서 get_content를 호출합니다.",choices:[{text:"retrieved_node.text",why:"이 객체 구조의 안전한 접근이 아닙니다."},{text:"retrieved_node.node.get_content().strip()",why:"정답입니다."},{text:"retrieved_node.embedding",why:"vector 값입니다."},{text:"retrieved_node.query",why:"질문 속성이 아닙니다."},{text:"base_index.content",why:"개별 검색 Node가 아닙니다."}]},
        {id:"t1-m3",source_question_id:"t1-q22",topic:"Reader",prompt:"prompt_generator의 반환값을 Chat Completions에 연결하는 인자는?",answer_index:4,explanation:"role/content dict 목록은 messages로 전달합니다.",choices:[{text:"input=llm_input",why:"이 notebook의 Chat Completions 인자가 아닙니다."},{text:"prompt=llm_input",why:"messages API 구조와 다릅니다."},{text:"context=llm_input",why:"해당 인자가 없습니다."},{text:"references=llm_input",why:"직접 API 인자가 아닙니다."},{text:"messages=llm_input",why:"정답입니다."}]},
        {id:"t1-m4",source_question_id:"t1-q26",topic:"RAG 연결",prompt:"검색된 chunks를 최종 답으로 만드는 올바른 호출은?",answer_index:0,explanation:"Reader에 query와 retrieved_results를 함께 전달합니다.",choices:[{text:"reader.generate_response(query, retrieved_results)",why:"정답입니다."},{text:"retriever.retrieve(query, answer)",why:"생성 대신 다시 검색합니다."},{text:"reader.generate_response(search_results, topk)",why:"원본 결과와 정수를 전달합니다."},{text:"index.from_documents(query)",why:"index 재생성 단계가 아닙니다."},{text:"prompt_generator(answer, query)",why:"인자 역할과 순서가 다릅니다."}]},
        {id:"t1-m5",source_question_id:"t1-q27",topic:"오답 분석",prompt:"RAG가 answer와 retrieved_results를 함께 반환해야 하는 가장 중요한 이유는?",answer_index:3,explanation:"잘못된 답이 검색 문제인지 생성 문제인지 근거를 보고 구분할 수 있습니다.",choices:[{text:"API 호출 수를 늘리기 위해",why:"목적이 아닙니다."},{text:"embedding을 학습하기 위해",why:"모델 학습이 아닙니다."},{text:"HTML을 다시 저장하기 위해",why:"저장 기능과 무관합니다."},{text:"검색 오류와 생성 오류를 분리하기 위해",why:"정답입니다."},{text:"topk를 자동 증가시키기 위해",why:"반환만으로 값이 바뀌지 않습니다."}]}
      ]
    }, {
      id:"rag-05",number:"05",title:"Task 2 · Knowledge Graph & Web",file:"3. Task_2.ipynb",
      capability:"자연어 질문을 finance 구조화 JSON으로 변환해 KG API를 실행하고, 질문 domain에 따라 KG 또는 Web 검색 근거를 선택해 답변할 수 있다.",
      summary:"LLM이 질문에서 domain·entity·metric·datetime을 추출하고 KG API 호출로 정형 정보를 얻은 뒤, finance는 KG를 사용하고 나머지는 Web Retriever를 사용하는 hybrid RAG로 연결됩니다.",
      notebook_goal:"CRAG Task 2용 Query Generator·KG Executor를 구현하고 Web 검색과 결합한 domain-routing RAG를 구성한다.",
      key_points:[
        {title:"Mock KG API",purpose:"정해진 endpoint에 JSON query를 POST하고 JSON 응답을 Python 객체로 바꿉니다.",code:"requests.post(url,json=data,headers=headers)\njson.loads(result.text)",flow:"entity/ticker → HTTP API → structured result",watch:"환경변수 CRAG_SERVER 앞뒤 공백과 endpoint 경로를 확인합니다."},
        {title:"Query Generator",purpose:"자연어 질문에서 domain과 finance entity·metric·datetime을 구조화합니다.",code:"prompt_generator → chat completion → json.loads",flow:"question → flat JSON + is_finance",watch:"LLM이 설명을 섞을 때 extract_json_objects로 복구합니다."},
        {title:"Finance Executor",purpose:"회사명을 ticker로 바꾸고 metric별 API를 호출한 뒤 시간 조건에 맞는 값을 고릅니다.",code:"company name → ticker → metric endpoint → date filter",flow:"structured query → KG evidence",watch:"metric 문자열을 lower/strip한 뒤 분기합니다."},
        {title:"KG RAG",purpose:"KG 결과를 Reader가 사용할 reference 목록으로 감싸 답을 만듭니다.",code:"kg_query_engine.query\nreader.generate_response(query,[kg_results])",flow:"query → KG evidence → answer",watch:"Reader 입력은 list이므로 문자열 결과를 [kg_results]로 감쌉니다."},
        {title:"Domain Routing",purpose:"finance 질문은 KG, 그 외 질문은 Web chunk를 사용합니다.",code:"if is_finance: [kg_results]\nelse: retrieved_results",flow:"query → both retrievals → select evidence → Reader",watch:"현재 코드는 결합이 아니라 domain별 선택입니다."}
      ],
      theory_guide:[
        {title:"1. Query parsing",concept:"Query parsing은 자연어 질문을 API가 처리할 수 있는 구조화 field로 바꾸는 단계입니다.",flow:"text → domain/entity/metric/time JSON",code_signal:"entity_extract_template과 json.loads가 앞뒤를 이룹니다.",exam_clue:"domain이 finance인지 별도 boolean으로 반환합니다."},
        {title:"2. Tool execution",concept:"Executor는 구조화 query의 metric에 맞는 KG endpoint를 선택해 실제 값을 가져옵니다.",flow:"company → ticker → metric API",code_signal:"if/elif가 price·dividend·P/E·EPS·marketCap을 나눕니다.",exam_clue:"API response의 result field를 꺼냅니다."},
        {title:"3. Routing",concept:"Routing은 질문 특성에 따라 사용할 검색원을 선택하는 절차입니다.",flow:"finance → KG, non-finance → Web",code_signal:"is_finance가 combined_results를 결정합니다.",exam_clue:"KG 문자열은 list로 감싸고 Web 결과는 이미 list입니다."},
        {title:"4. Hybrid RAG",concept:"Hybrid RAG는 서로 다른 retrieval source를 하나의 Reader 앞에서 조정합니다.",flow:"Web retriever + KG engine → evidence policy → Reader",code_signal:"RAGWithSRKG가 세 component를 생성합니다.",exam_clue:"최종 반환은 answer와 실제 사용한 combined_results입니다."}
      ],
      full_code_cells:[cell(8,apiP,apiA,[3,5,8,9]),cell(15,queryGenP,queryGenA,[5,6,11,13,16,18,19,21]),cell(21,financeP,financeA,[2,6,14,19,20]),cell(31,kgRagP,kgRagA,[3,5,8,12,13,16,18]),cell(36,hybridP,hybridA,[3,4,5,8,10,14,16,18,19])],
      subjective:[
        S("t2-q1","os.environ.get('CRAG_SERVER'","Server 설정","CRAG server 환경변수를 읽는 호출 시작을 쓰세요."),S("t2-q2","requests.post(url, json=data, headers=headers)","API 요청","JSON body와 header로 POST하는 호출을 쓰세요."),S("t2-q3","json.loads(result.text)","API 응답","response text를 Python JSON 객체로 바꾸세요."),
        S("t2-q4","entity_extract_template","System prompt","구조화 query 생성용 system template 변수를 쓰세요."),S("t2-q5","prompt_generator(query)","Query prompt","자연어 질문의 messages를 만드는 호출을 쓰세요."),S("t2-q6","json.loads(completion)","JSON parsing","LLM 문자열을 JSON으로 파싱하세요."),S("t2-q7","extract_json_objects(completion)","JSON 복구","직접 파싱 실패 시 JSON 객체를 추출하는 호출을 쓰세요."),S("t2-q8","completion.keys()","Domain 확인","파싱 결과에 domain key가 있는지 확인할 호출을 쓰세요."),S("t2-q9",'domain == "finance"',"Finance routing","finance domain 여부를 계산하는 비교식을 쓰세요."),
        S("t2-q10","re.sub(r'[^a-zA-Z0-9]', '', key).lower()","Key 정규화","영숫자만 남기고 소문자로 만드는 표현을 쓰세요."),S("t2-q11","response.items()","Metric 검색","API response의 key와 value를 순회하는 호출을 쓰세요."),S("t2-q12",'generated_query["market_identifier"].split(",")',"복수 회사","쉼표로 구분된 market_identifier를 회사 목록으로 나누세요."),S("t2-q13","api.finance_get_eps(ticker_name)","EPS API","ticker의 EPS를 조회하는 호출을 쓰세요."),S("t2-q14",'"<DOC>\\n".join',"KG 문서화","여러 KG 결과를 DOC 구분자로 연결하는 호출 시작을 쓰세요."),
        S("t2-q15","self.generate_query(query)","KG query","KGQueryEngine에서 질문을 구조화하는 호출을 쓰세요."),S("t2-q16","self.get_finance_kg_results(generated_query)","KG 실행","구조화 finance query를 실행하는 호출을 쓰세요."),S("t2-q17","return kg_results, is_finance","KG 반환","근거와 routing flag를 함께 반환하세요."),S("t2-q18","KGQueryEngine()","KG RAG 구성","KG query engine 객체를 생성하세요."),S("t2-q19","self.reader.generate_response(query, [kg_results])","KG Reader","KG 문자열을 reference 목록으로 감싸 답을 생성하세요."),
        S("t2-q20","LlamaIndexRetriever()","Web Retriever","Hybrid RAG의 Web retriever를 생성하세요."),S("t2-q21","self.retriever.retrieve(query, search_results, topk)","Web 검색","질문의 Top-k Web chunk를 검색하세요."),S("t2-q22","self.kg_query_engine.query(query)","KG 검색","질문으로 KG 결과와 domain flag를 얻으세요."),S("t2-q23","combined_results = [kg_results]","Finance 근거","finance 질문에서 사용할 근거를 지정하세요."),S("t2-q24","combined_results = retrieved_results","Web 근거","비-finance 질문에서 사용할 근거를 지정하세요."),S("t2-q25","self.reader.generate_response(query, combined_results)","Hybrid 생성","선택된 근거로 답을 생성하세요."),S("t2-q26","return answer, combined_results","검증 반환","답과 실제 사용 근거를 함께 반환하세요.")
      ],
      mcq:[
        {id:"t2-m1",source_question_id:"t2-q2",topic:"KG API",prompt:"Mock KG endpoint에 구조화 query를 보내는 호출은?",answer_index:1,explanation:"data를 JSON body로, accept를 header로 POST합니다.",choices:[{text:"requests.get(url, params=data)",why:"노트북 API는 POST JSON을 사용합니다."},{text:"requests.post(url, json=data, headers=headers)",why:"정답입니다."},{text:"json.post(url, data)",why:"json 모듈은 HTTP client가 아닙니다."},{text:"requests.post(data)",why:"URL과 header가 빠집니다."},{text:"api.query(headers)",why:"wrapper method 호출 구조가 아닙니다."}]},
        {id:"t2-m2",source_question_id:"t2-q7",topic:"LLM JSON 복구",prompt:"LLM 출력 전체를 json.loads하지 못했을 때 다음 단계는?",answer_index:3,explanation:"문자열 안의 JSON 객체만 찾아 decode하는 helper를 사용합니다.",choices:[{text:"completion.lower()",why:"대소문자만 바꿉니다."},{text:"requests.post(completion)",why:"네트워크 요청과 무관합니다."},{text:"json.dumps(completion)",why:"문자열을 다시 직렬화합니다."},{text:"extract_json_objects(completion)",why:"정답입니다."},{text:"completion.keys()",why:"아직 문자열이면 keys가 없습니다."}]},
        {id:"t2-m3",source_question_id:"t2-q19",topic:"Reader 입력",prompt:"KG 결과 문자열을 Reader references로 전달하는 올바른 형태는?",answer_index:0,explanation:"Reader는 chunk 목록을 기대하므로 문자열을 list로 감쌉니다.",choices:[{text:"[kg_results]",why:"정답입니다."},{text:"kg_results[0]",why:"첫 문자만 전달될 수 있습니다."},{text:"{kg_results}",why:"set이며 순서와 중복 의미가 다릅니다."},{text:"str([kg_results])",why:"목록이 아니라 문자열이 됩니다."},{text:"None",why:"근거를 버립니다."}]},
        {id:"t2-m4",source_question_id:"t2-q23",topic:"Routing",prompt:"finance 질문일 때 Hybrid RAG가 사용할 근거는?",answer_index:4,explanation:"is_finance가 true면 KG 결과를 reference list로 선택합니다.",choices:[{text:"빈 목록",why:"검색 근거를 버립니다."},{text:"항상 Web 결과",why:"finance routing을 무시합니다."},{text:"query 문자열",why:"근거 문서가 아닙니다."},{text:"Web과 KG를 무조건 concat",why:"주석에는 대안이지만 현재 실행 코드는 선택입니다."},{text:"[kg_results]",why:"정답입니다."}]},
        {id:"t2-m5",source_question_id:"t2-q26",topic:"Hybrid 검증",prompt:"inference가 combined_results까지 반환해야 하는 이유는?",answer_index:2,explanation:"실제로 선택된 KG/Web 근거를 확인해 routing·retrieval 오류를 진단할 수 있습니다.",choices:[{text:"API key를 숨기기 위해",why:"반환값과 무관합니다."},{text:"모델을 재학습하기 위해",why:"학습 코드가 아닙니다."},{text:"사용 근거와 routing을 검증하기 위해",why:"정답입니다."},{text:"HTML을 다운로드하기 위해",why:"다운로드 단계가 아닙니다."},{text:"날짜를 자동 변환하기 위해",why:"별도 helper 역할입니다."}]}
      ]
    }]
  };
})();
