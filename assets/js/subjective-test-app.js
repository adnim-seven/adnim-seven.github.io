const STORAGE_KEY = document.body.dataset.storageKey || 'ai-coding-recall-subjective-v1';
const BLANKS_BY_STORAGE_KEY = {
  "llm_chapter_2_subjective_test-history-v1": [{"id": "blank-token-encode", "label": "문자열을 token ID로 인코딩", "answer": "encode"}, {"id": "blank-token-decode", "label": "token ID를 문자열로 디코딩", "answer": "decode"}, {"id": "blank-next-token-start", "label": "next-token 시작 인덱스", "answer": "1"}, {"id": "blank-next-token-end", "label": "next-token 끝 인덱스 보정", "answer": "1"}, {"id": "blank-input-start", "label": "입력 윈도우 시작 인덱스", "answer": "i"}, {"id": "blank-input-end", "label": "입력 윈도우 끝 인덱스 기준", "answer": "i"}, {"id": "blank-target-start-i", "label": "target 시작 위치 기준", "answer": "i"}, {"id": "blank-target-start-offset", "label": "target 시작 한 칸 이동", "answer": "1"}, {"id": "blank-target-end-i", "label": "target 끝 위치 기준", "answer": "i"}, {"id": "blank-target-end-offset", "label": "target 끝 한 칸 보정", "answer": "1"}, {"id": "blank-dataloader-dataset", "label": "DataLoader에 전달할 Dataset", "answer": "dataset"}, {"id": "blank-embedding-vocab", "label": "Embedding vocab_size", "answer": "vocab_size"}, {"id": "blank-embedding-dim", "label": "Embedding output_dim", "answer": "output_dim"}, {"id": "blank-embedding-input", "label": "Embedding 입력 token ID", "answer": "input_ids"}, {"id": "blank-input-embeddings", "label": "GPT 입력 임베딩 합산", "answer": "token_embeddings + pos_embeddings"}],
  "llm_chapter_3_subjective_test-history-v1": [{"id": "blank-key", "label": "Key 투영", "answer": "self.W_key(x)"}, {"id": "blank-score", "label": "Q·K 내적 점수", "answer": "queries @ keys.transpose(1, 2)"}, {"id": "blank-context", "label": "Value 가중합", "answer": "attn_weights @ values"}],
  "llm_chapter_4_subjective_test-history-v1": [{"id": "blank-layernorm", "label": "LayerNorm 정규화식", "answer": "(x - mean) / torch.sqrt(var + self.eps)"}, {"id": "blank-pos-embedding", "label": "위치 임베딩 레이어", "answer": "nn.Embedding(cfg[\"context_length\"], cfg[\"emb_dim\"])"}, {"id": "blank-output-head", "label": "Vocabulary 출력 Head", "answer": "nn.Linear(cfg[\"emb_dim\"], cfg[\"vocab_size\"], bias=False)"}],
  "llm_chapter_5_subjective_test-history-v1": [{"id": "blank-cross-entropy", "label": "Token 단위 Cross Entropy", "answer": "torch.nn.functional.cross_entropy(\n    logits.flatten(0, 1),\n    target_batch.flatten()\n)"}, {"id": "blank-zero-grad", "label": "Gradient 초기화", "answer": "optimizer.zero_grad()"}, {"id": "blank-backward", "label": "역전파", "answer": "loss.backward()"}, {"id": "blank-step", "label": "Optimizer 갱신", "answer": "optimizer.step()"}],
  "llm_chapter_6a_classification_subjective_test-history-v1": [{"id": "blank-ch6a-truncate", "label": "최대 길이 truncation", "answer": "encoded_text[:self.max_length]"}, {"id": "blank-ch6a-padding", "label": "Padding token ID", "answer": "[pad_token_id]"}, {"id": "blank-ch6a-label", "label": "정답 Label column", "answer": "[\"Label\"]"}],
  "llm_chapter_6b_lora_subjective_test-history-v1": [{"id": "blank-ch6b-a", "label": "LoRA A down-projection", "answer": "nn.Parameter(torch.empty(in_dim, self.rank))"}, {"id": "blank-ch6b-delta", "label": "LoRA scaled delta", "answer": "(self.alpha / self.rank) * (x @ self.A @ self.B)"}, {"id": "blank-ch6b-residual", "label": "Linear + LoRA 결과 결합", "answer": "self.linear(x) + self.lora(x)"}],
  "llm_chapter_7a_instruction_subjective_test-history-v1": [{"id": "blank-ch7a-eos", "label": "Sequence 끝 pad token", "answer": "pad_token_id"}, {"id": "blank-ch7a-padding", "label": "Batch padding token", "answer": "pad_token_id"}, {"id": "blank-ch7a-input-shift", "label": "Input 마지막 token 제외", "answer": "-1"}],
  "llm_chapter_7b_dpo_subjective_test-history-v1": [{"id": "blank-ch7b-chosen", "label": "Chosen response 연결", "answer": "entry[\"chosen\"]"}, {"id": "blank-ch7b-rejected", "label": "Rejected response 연결", "answer": "entry[\"rejected\"]"}, {"id": "blank-ch7b-label-shift", "label": "DPO label next-token shift", "answer": "1"}],
  "vision_ddpm_subjective_test-history-v1": [{"id": "blank-ddpm-qkv", "label": "Conv 기반 QKV 투영", "answer": "nn.Conv2d(dim, hidden_dim * 3, 1, bias=False)"}, {"id": "blank-ddpm-scores", "label": "Pixel 간 Attention 점수", "answer": "torch.einsum(\"b h d i, b h d j -> b h i j\", q, k)"}, {"id": "blank-ddpm-softmax", "label": "Attention 가중치 정규화", "answer": "sim.softmax(dim=-1)"}],
  "vision_detr_subjective_test-history-v1": [{"id": "blank-detr-resize", "label": "DETR 입력 크기 조정", "answer": "T.Resize(800)"}, {"id": "blank-detr-normalize", "label": "ImageNet 정규화", "answer": "T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])"}, {"id": "blank-detr-model", "label": "사전학습 DETR 로드", "answer": "torch.hub.load('facebookresearch/detr', 'detr_resnet50', pretrained=True)"}],
  "vision_resnet18_subjective_test-history-v1": [{"id": "blank-random-crop", "label": "학습 이미지 Random Crop", "answer": "T.RandomCrop(32, padding=4)"}, {"id": "blank-normalize", "label": "CIFAR 채널 정규화", "answer": "T.Normalize(CIFAR10_MEAN, CIFAR10_STD)"}, {"id": "blank-cifar-stem", "label": "CIFAR 입력용 Conv Stem", "answer": "nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)"}],
  "vision_stable_diffusion_subjective_test-history-v1": [{"id": "blank-sd-pipeline", "label": "사전학습 Pipeline 로드", "answer": "StableDiffusionPipeline.from_pretrained"}, {"id": "blank-sd-generator", "label": "재현 가능한 CUDA seed", "answer": "torch.Generator(\"cuda\").manual_seed(seed)"}, {"id": "blank-sd-image", "label": "Pipeline 이미지 추출", "answer": "pipe(prompt, guidance_scale=cfg, generator=generator).images[0]"}],
  "vision_unet_subjective_test-history-v1": [{"id": "blank-unet-up", "label": "학습 가능한 업샘플링", "answer": "nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2)"}, {"id": "blank-unet-skip", "label": "Skip feature 채널 결합", "answer": "torch.cat([x2, x1], dim=1)"}, {"id": "blank-unet-loss", "label": "Mask 예측 손실", "answer": "loss = criterion(logits, masks)"}],
  "vision_vit_subjective_test-history-v1": [{"id": "blank-vit-qkv", "label": "QKV 동시 투영", "answer": "nn.Linear(dim, inner_dim * 3, bias = False)"}, {"id": "blank-vit-scores", "label": "Head별 QK 유사도", "answer": "einsum('b h i d, b h j d -> b h i j', q, k) * self.scale"}, {"id": "blank-vit-weighted-sum", "label": "Attention Value 가중합", "answer": "einsum('b h i j, b h j d -> b h i d', attn, v)"}],
  "ondevice_distillation_subjective_test-history-v1": [{"id": "blank-teacher-logits", "label": "Teacher forward", "answer": "teacher(inputs)"}, {"id": "blank-student-prob", "label": "Temperature softmax", "answer": "nn.functional.softmax(student_logits / T, dim=-1)"}, {"id": "blank-distill-loss", "label": "Soft-target + label loss 결합", "answer": "soft_target_loss_weight * soft_targets_loss + ce_loss_weight * label_loss"}],
  "ondevice_pruning_cnn_subjective_test-history-v1": [{"id": "blank-prune-count", "label": "제거할 가중치 개수", "answer": "round(weight.numel() * sparsity)"}, {"id": "blank-prune-threshold", "label": "k번째 중요도 threshold", "answer": "torch.kthvalue(importance.flatten(), num_pruned_elements)[0]"}, {"id": "blank-prune-mask", "label": "유지할 weight mask", "answer": "importance > threshold"}],
  "ondevice_pruning_llm_subjective_test-history-v1": [{"id": "blank-llm-prune-importance", "label": "Magnitude 중요도", "answer": "torch.abs(W)"}, {"id": "blank-llm-prune-threshold", "label": "제거 개수 기준 threshold", "answer": "torch.kthvalue(importance.flatten(), num_zeros)[0]"}, {"id": "blank-llm-prune-mask", "label": "남길 weight mask", "answer": "importance > threshold"}],
  "ondevice_quantization_cnn_subjective_test-history-v1": [{"id": "blank-quant-round", "label": "Scaled float 반올림", "answer": "torch.round(scaled_tensor)"}, {"id": "blank-quant-shift", "label": "Zero point 이동", "answer": "rounded_tensor + zero_point"}, {"id": "blank-quant-output-scale", "label": "Linear output 재스케일", "answer": "output*(input_scale * weight_scale / output_scale)"}],
  "ondevice_quantization_llm_subjective_test-history-v1": [{"id": "blank-outlier-mask", "label": "상위 1% 중요 채널 선택", "answer": "torch.topk(importance, int(len(importance) * 0.01))[1]"}, {"id": "blank-scaleup", "label": "Quantization 전 중요 채널 확장", "answer": "m.weight.data[:, outlier_mask] *= scale_factor"}, {"id": "blank-scaledown", "label": "Quantization 후 원래 scale 복원", "answer": "m.weight.data[:, outlier_mask] /= scale_factor"}],
  "rag_2_subjective_test-history-v1": [{"id": "blank-documents", "label": "Wikipedia 문서 로드", "answer": "reader.load_data(city_names, auto_suggest=False)"}, {"id": "blank-index", "label": "Vector Index 생성", "answer": "VectorStoreIndex.from_documents(documents)"}, {"id": "blank-query-engine", "label": "Query Engine 생성", "answer": "index.as_query_engine()"}],
  "rag_data_preprocessing_subjective_test-history-v1": [{"id": "blank-json-load", "label": "JSON 레코드 파싱", "answer": "json.loads(line.strip())"}, {"id": "blank-html-parse", "label": "HTML 본문 파싱", "answer": "BeautifulSoup(html_text[\"page_result\"], features=\"lxml\")"}, {"id": "blank-sentence-offsets", "label": "문장 경계 추출", "answer": "text_to_sentences_and_offsets(text)"}],
  "rag_mcp_evaluation_subjective_test-history-v1": [{"id": "blank-mcp-client", "label": "MCP Client 생성", "answer": "BasicMCPClient(external_mcp_server)"}, {"id": "blank-mcp-spec", "label": "MCP Tool Spec 생성", "answer": "McpToolSpec(client=mcp_client)"}, {"id": "blank-mcp-tools", "label": "비동기 도구 목록 로드", "answer": "mcp_tool.to_tool_list_async()"}],
  "rag-inline-subjective-history-v1": [{id:'blank-documents',label:'문서 로드',answer:'SimpleDirectoryReader("data").load_data()'},{id:'blank-index',label:'Index 생성',answer:'VectorStoreIndex.from_documents(documents)'},{id:'blank-query',label:'Query Engine 생성',answer:'index.as_query_engine()'}],
  "rag_task_1_subjective_test-history-v1": [{"id": "blank-vector-index", "label": "문서 기반 Vector Index", "answer": "VectorStoreIndex.from_documents(documents = documents, transformations=[self.parser])"}, {"id": "blank-retrieve", "label": "관련 청크 검색", "answer": "self.retriever.retrieve(query, search_results, topk)"}, {"id": "blank-reader", "label": "검색 결과 기반 답변", "answer": "self.reader.generate_response(query, retrieved_results)"}],
  "rag_task_2_subjective_test-history-v1": [{"id": "blank-llm-input", "label": "질문 메시지 생성", "answer": "prompt_generator(query)"}, {"id": "blank-kg-query", "label": "KG 결과 조회", "answer": "self.kg_query_engine.query(query)"}, {"id": "blank-combined-reader", "label": "결합 문맥 답변", "answer": "self.reader.generate_response(query, combined_results)"}],
  "data_ncf_subjective_test-history-v1": [{"id": "blank-ncf-user-embedding", "label": "사용자 latent vector", "answer": "nn.Embedding(n_users, 32)"}, {"id": "blank-ncf-concat", "label": "User·movie embedding 결합", "answer": "torch.cat([user_embedding, movie_embedding], dim = 1)"}, {"id": "blank-ncf-loss", "label": "평점 회귀 loss", "answer": "loss_func(prediction, ground_truth)"}],
  "data_ngcf_subjective_test-history-v1": [{"id": "blank-ngcf-norm", "label": "대칭 차수 정규화 계수 norm", "answer": "1.0/torch.sqrt(deg[src]*deg[dst])"}, {"id": "blank-ngcf-edge-dst", "label": "아이템 노드 전달 메시지", "answer": "self.W1(src_feat) + self.W2(src_feat*dst_feat)"}, {"id": "blank-ngcf-concat", "label": "전체 레이어 표현 결합", "answer": "torch.concat(layer_outputs,dim=-1)"}],
  "data_timeseries_subjective_test-history-v1": [{"id": "blank-ts-train-pred", "label": "마지막 시점 예측값 슬라이싱", "answer": "model(batch_x)[:, -1, 0]"}, {"id": "blank-ts-rnn", "label": "Batch-first RNN 계층", "answer": "nn.RNN(input_size, hidden_size, num_layers, batch_first=True)"}, {"id": "blank-ts-forward", "label": "RNN sequence output projection", "answer": "return self.fc(out)"}]
};
const blanks = window.SUBJECTIVE_BLANKS || BLANKS_BY_STORAGE_KEY[STORAGE_KEY] || [];
const storageKey = STORAGE_KEY;
const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'), drafts = {};
let active = 0, activeView = 'exam';
const canonical = v => String(v).trim().replace(/\s+/g, '').replace(/'/g, '"');
const $ = s => document.querySelector(s);
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"}[char]));

function renderCodeCells() {
  const blankMarkup = item => `<textarea id="${item.id}" class="inline-code-input" aria-label="${item.label}" rows="1" placeholder="### 공개 제한 ###" spellcheck="false">${escapeHtml(drafts[item.id] || '')}</textarea><button id="mark-${item.id}" class="review-mark" type="button" title="나중에 복습할 문제로 표시">☆ 복습 표시</button><div id="feedback-${item.id}" class="inline-feedback" aria-live="polite"></div>`;
  const cells = activeView === 'exam' ? window.RAG_SUBJECTIVE_CELLS.filter(cell => cell.type === 'code') : window.RAG_SUBJECTIVE_CELLS;
  $('#codeCells').innerHTML = cells.map(cell => {
    let source = escapeHtml(cell.source);
    if (cell.type === 'code') {
      blanks.forEach(item => {
        source = source.replace(`[[BLANK:${item.id}]]`, blankMarkup(item));
      });
      return `<section class="code-cell" data-cell-number="${cell.number}" data-code-number="${cell.code_number}"><div class="cell-title">코드 Cell ${cell.code_number} · 원본 Notebook Cell ${cell.number}</div><pre><code>${source}</code></pre></section>`;
    }
    return `<section class="code-cell markdown-cell" data-cell-number="${cell.number}"><div class="cell-title">원본 Notebook Cell ${cell.number} · 설명</div><div class="markdown-source">${source || '(빈 마크다운 셀)'}</div></section>`;
  }).join('');
}

function statusText() {
  if (!blanks.length) return;
  const item = blanks[active], h = history[item.id] || {}, cell = document.getElementById(item.id)?.closest('.code-cell'), codeNumber = cell?.dataset.codeNumber, notebookNumber = cell?.dataset.cellNumber;
  $('#status').innerHTML = `<strong>빈칸 ${active + 1} / ${blanks.length} · ${item.label}</strong> · ${h.correct ? '정답 확인됨' : `오답 ${h.wrongCount || 0}회`}`;
  $('#cellNumber').textContent = codeNumber ? `코드 ${codeNumber} · 원본 ${notebookNumber}` : `빈칸 ${active + 1}`;
  $('#progress').style.width = `${(active + 1) / blanks.length * 100}%`;
}

function renderList() {
  $('#blankList').innerHTML = blanks.map((item, index) => {
    const h = history[item.id] || {}, state = h.correct ? 'correct' : h.wrongCount ? 'wrong' : h.starred ? 'starred' : '';
    return `<button class="${index === active ? 'active' : ''} ${state}" data-index="${index}" type="button">${index + 1}. ${item.label}${h.starred ? ' ★' : ''}${h.wrongCount ? ` · 오답 ${h.wrongCount}` : ''}</button>`;
  }).join('');
  document.querySelectorAll('[data-index]').forEach(b => b.addEventListener('click', () => focusBlank(Number(b.dataset.index))));
  const wrongTotal = blanks.reduce((sum, item) => sum + (history[item.id]?.wrongCount || 0), 0), starTotal = blanks.filter(item => history[item.id]?.starred).length;
  $('#review').textContent = `오답·복습 리뷰 (${wrongTotal} / ★${starTotal})`;
}

function focusBlank(index) {
  if (!blanks.length) return;
  active = (index + blanks.length) % blanks.length;
  const item = blanks[active], input = document.getElementById(item.id);
  renderList();
  statusText();
  input.focus({preventScroll: true});
  input.closest('.code-cell').scrollIntoView({behavior: 'smooth', block: 'center'});
}

function checkCurrent() {
  if (!blanks.length) return;
  const item = blanks[active], input = document.getElementById(item.id), feedback = document.getElementById(`feedback-${item.id}`), h = history[item.id] || {wrongCount: 0, attempts: 0}, correct = canonical(input.value) === canonical(item.answer);
  h.attempts += 1;
  h.lastAttempt = new Date().toISOString();
  if (correct) {
    h.correct = true;
    input.className = 'inline-code-input correct';
    feedback.className = 'inline-feedback show correct';
    feedback.textContent = '정답입니다. 다음 구현으로 넘어가세요.';
  } else {
    h.wrongCount += 1;
    h.correct = false;
    input.className = 'inline-code-input wrong';
    feedback.className = 'inline-feedback show wrong';
    feedback.textContent = `오답입니다. 오답 이력에 ${h.wrongCount}회 기록했습니다.\n정답: ${item.answer}\n직전 변수와 다음 줄에서 요구하는 객체 타입을 다시 확인하세요.`;
  }
  history[item.id] = h;
  save();
  renderList();
  statusText();
}

function toggleStar(index) {
  const item = blanks[index], h = history[item.id] || {wrongCount: 0, attempts: 0};
  h.starred = !h.starred;
  history[item.id] = h;
  save();
  const button = document.getElementById(`mark-${item.id}`);
  button.className = `review-mark${h.starred ? ' starred' : ''}`;
  button.textContent = h.starred ? '★ 복습 표시됨' : '☆ 복습 표시';
  renderList();
}

function showReview() {
  const rows = blanks.map((item, index) => ({item, index, h: history[item.id] || {wrongCount: 0, attempts: 0}})).filter(r => r.h.wrongCount || r.h.starred).sort((a, b) => Number(b.h.starred) - Number(a.h.starred) || b.h.wrongCount - a.h.wrongCount);
  $('#reviewRows').innerHTML = rows.length ? rows.map(({item, index, h}) => `<div class="review-row"><strong>${index + 1}. ${item.label}</strong><span class="${h.starred ? 'starred' : ''}">${h.starred ? '★ 복습 표시 · ' : ''}오답 ${h.wrongCount || 0}회 · 시도 ${h.attempts || 0}회</span><button class="button" data-review-index="${index}" type="button">다시 풀기</button></div>`).join('') : '<p class="empty">별표 또는 오답으로 기록된 문제가 없습니다.</p>';
  document.querySelectorAll('[data-review-index]').forEach(b => b.addEventListener('click', () => {
    $('#reviewModal').classList.remove('open');
    focusBlank(Number(b.dataset.reviewIndex));
  }));
  $('#reviewModal').classList.add('open');
}

function autoGrow(input) {
  input.style.height = 'auto';
  input.style.height = `${input.scrollHeight}px`;
}

function bindBlankControls() {
  blanks.forEach((item, index) => {
    const input = document.getElementById(item.id), mark = document.getElementById(`mark-${item.id}`), h = history[item.id] || {};
    input.addEventListener('focus', () => { active = index; renderList(); statusText(); });
    input.addEventListener('input', () => { drafts[item.id] = input.value; autoGrow(input); });
    autoGrow(input);
    if (h.starred) {
      mark.classList.add('starred');
      mark.textContent = '★ 복습 표시됨';
    }
    mark.addEventListener('click', () => toggleStar(index));
  });
}

function switchView(view) {
  blanks.forEach(item => {
    const input = document.getElementById(item.id);
    if (input) drafts[item.id] = input.value;
  });
  activeView = view;
  $('#examTab').classList.toggle('active', view === 'exam');
  $('#examTab').setAttribute('aria-selected', view === 'exam');
  $('#fullTab').classList.toggle('active', view === 'full');
  $('#fullTab').setAttribute('aria-selected', view === 'full');
  renderCodeCells();
  bindBlankControls();
  renderList();
  statusText();
}

renderCodeCells();
bindBlankControls();
$('#examTab').addEventListener('click', () => switchView('exam'));
$('#fullTab').addEventListener('click', () => switchView('full'));
$('#prev').addEventListener('click', () => focusBlank(active - 1));
$('#next').addEventListener('click', () => focusBlank(active + 1));
$('#check').addEventListener('click', checkCurrent);
$('#review').addEventListener('click', showReview);
$('#closeReview').addEventListener('click', () => $('#reviewModal').classList.remove('open'));
$('#reviewModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    checkCurrent();
  }
});
renderList();
statusText();
