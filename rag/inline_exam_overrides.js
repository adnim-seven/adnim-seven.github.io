/* RAG Chapter 1: 시험 범위(흐름 + llama-index 활용)에 맞춘 인라인 빈칸 확장 */
window.INLINE_EXAM_OVERRIDES = {
  "1. Llama_index.ipynb": {
    replacements: [
      {cell: 22, id: "rag-chunk-nodes", from: "nodes = parser.get_nodes_from_documents(documents)"},
      {cell: 28, id: "rag-index-transform", from: "index = VectorStoreIndex.from_documents(documents=documents, transformations=[text_splitter])"},
      {cell: 37, id: "rag-query-run", from: "response = query_engine.query(\"What is the first programs the author tried writing?\")"},
      {cell: 50, id: "rag-retriever-run", from: "ret_passages = retriever.retrieve(\"Who is the author?\")"},
      {cell: 60, id: "rag-index-insert", from: "index.insert(docu)"},
      {cell: 64, id: "rag-index-update", from: "index.update_ref_doc"},
      {cell: 71, id: "rag-index-delete", from: "index.delete_ref_doc"},
      {cell: 76, id: "rag-synthesize", from: "response_obj = self.response_synthesizer.synthesize(query_str, nodes)"},
      {cell: 81, id: "rag-node-content", from: "n.node.get_content()"},
      {cell: 81, id: "rag-llm-complete", from: "self.llm.complete"},
      {cell: 81, id: "rag-prompt-format", from: "self.qa_prompt.format(context_str=context_str, query_str=query_str)"},
      {cell: 83, id: "rag-custom-engine", from: "query_engine = OurCustomQueryEngine(\n    retriever=retriever,\n    response_synthesizer=synthesizer,\n    llm=llm,\n    qa_prompt=simple_qa_prompt,\n)"},
    ],
    blanks: [
      {id: "rag-chunk-nodes", label: "Document → Node 청킹", answer: "nodes = parser.get_nodes_from_documents(documents)"},
      {id: "rag-index-transform", label: "Splitter를 적용한 Index 생성", answer: "index = VectorStoreIndex.from_documents(documents=documents, transformations=[text_splitter])"},
      {id: "rag-query-run", label: "Query Engine 실행", answer: "response = query_engine.query(\"What is the first programs the author tried writing?\")"},
      {id: "rag-retriever-run", label: "Retriever로 근거 passage 검색", answer: "ret_passages = retriever.retrieve(\"Who is the author?\")"},
      {id: "rag-index-insert", label: "새 Document를 Index에 추가", answer: "index.insert(docu)"},
      {id: "rag-index-update", label: "참조 문서 갱신 API", answer: "index.update_ref_doc"},
      {id: "rag-index-delete", label: "참조 문서 삭제 API", answer: "index.delete_ref_doc"},
      {id: "rag-synthesize", label: "검색 Node로 답변 합성", answer: "response_obj = self.response_synthesizer.synthesize(query_str, nodes)"},
      {id: "rag-node-content", label: "검색 Node의 본문 추출", answer: "n.node.get_content()"},
      {id: "rag-llm-complete", label: "LLM completion 실행", answer: "self.llm.complete"},
      {id: "rag-prompt-format", label: "context와 질문을 PromptTemplate에 주입", answer: "self.qa_prompt.format(context_str=context_str, query_str=query_str)"},
      {id: "rag-custom-engine", label: "Custom Query Engine 부품 연결", answer: "query_engine = OurCustomQueryEngine(\n    retriever=retriever,\n    response_synthesizer=synthesizer,\n    llm=llm,\n    qa_prompt=simple_qa_prompt,\n)"},
    ],
  },
};
