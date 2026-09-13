/*
 * 빈칸이 적은 노트북을 위한 공통 확장 문제.
 * 원본 코드에서 의미 있는 대입문의 오른쪽만 빈칸으로 바꾼다.
 * 따라서 변수명, 함수 목적, 앞뒤 구현 문맥은 시험 화면에 남는다.
 */
(() => {
  const set = window.LLM_INLINE_EXAMS || window.INLINE_EXAM_MAP;
  if (!set) return;
  // 이미 과목별로 정교하게 지정된 문제 줄은 여기서 다시 비우지 않는다.
  // 그렇지 않으면 뒤에서 적용되는 기존 빈칸 ID가 코드 위치를 잃을 수 있다.
  const reservedLines = Object.values(window.INLINE_EXAM_OVERRIDES || {})
    .flatMap((patch) => (patch.replacements || []).map((item) => item.from));
  const isReserved = (line) => reservedLines.some((source) => line.includes(source));

  const ruleSets = {
    // LLM: 구조ㆍ학습ㆍ데이터 구성 흐름
    "Chapter_3_Excercise_Attention.ipynb": ["self.head_dim =", "keys = keys.view", "context_vec = context_vec.contiguous"],
    "Chapter_4_Excercise_GPT.ipynb": ["self.tok_emb =", "self.pos_emb =", "self.out_head ="],
    "Chapter_5_Excercise_Pretraining.ipynb": ["optimizer.zero_grad", "loss.backward", "optimizer.step"],
    "Chapter_6_Excercise_Finetuning_Classification.ipynb": ["self.encoded_texts =", "label =", "return torch.tensor"],
    "Chapter_6_Excercise_Finetuning_Classification_LoRA.ipynb": ["self.B =", "return self.alpha", "model ="],
    "Chapter_7_Exercise_Follow_Instructions.ipynb": ["instruction_plus_input =", "response_text =", "self.encoded_texts.append"],
    "Chapter_7_Exercise_Follow_Instructions_dpo.ipynb": ["instruction_text =", "input_text =", "train_portion ="],

    // RAG: 로드 → 청킹 → 인덱스 → 검색 → 답변 흐름
    "2. RAG.ipynb": ["documents =", "index =", "query_engine ="],
    "1. Data_preprocessing.ipynb": ["documents =", "parser =", "nodes ="],
    "2. Task_1.ipynb": ["retriever =", "response =", "prompt"],
    "3. Task_2.ipynb": ["retriever =", "query_engine =", "response ="],
    "4_RAG_framework_evaluation_with_MCP.ipynb": ["mcp", "evaluator =", "response ="],

    // Data: 시계열/추천의 데이터 구성 → 모델 → 손실/평가
    "ts_practice.ipynb": ["features.append", "labels.append", "optimizer.step"],
    "RecSys_GCF_practice.ipynb": ["pos_scores =", "neg_scores =", "loss ="],

    // Vision: 모델 구성ㆍ데이터 변환ㆍ손실/평가
    "06_Stable_Diffusion_v1_4.ipynb": ["vae =", "unet =", "noise_scheduler ="],

    // On-device: 각 압축 방식의 핵심 계산
    "2. Quantization for CNN.ipynb": ["scale =", "zero_point =", "output ="],
    "1. Pruning for CNN.ipynb": ["importance =", "threshold =", "mask ="],
    "3. Knowledge Distillation.ipynb": ["teacher.eval", "ce_loss =", "optimizer.step"],
    "4. Pruning for LLM.ipynb": ["importance =", "threshold =", "W["],
    "5. Quantization for LLM.ipynb": ["max_int =", "scales =", "outlier_mask ="]
  };

  const toBlank = (exam, needle, number) => {
    for (const cell of exam.cells.filter((item) => item.type === "code")) {
      const lines = cell.source.split("\n");
      const lineIndex = lines.findIndex((line) => line.includes(needle) && !line.includes("[[BLANK:"));
      if (lineIndex < 0) continue;
      const line = lines[lineIndex];
      if (isReserved(line)) continue;
      const indent = line.match(/^\s*/)[0];
      const equal = line.indexOf("=");
      let answer = "";
      let replacement = "";
      if (equal > -1 && !/=>|==|>=|<=/.test(line)) {
        const lhs = line.slice(0, equal + 1);
        answer = line.slice(equal + 1).trim();
        if (!answer || answer.startsWith("#")) continue;
        replacement = `${lhs} [[BLANK:auto-${exam.page}-${number}]]`;
      } else if (/\)$/.test(line.trim())) {
        answer = line.trim();
        replacement = `${indent}[[BLANK:auto-${exam.page}-${number}]]`;
      } else {
        continue;
      }
      const id = `auto-${exam.page}-${number}`;
      lines[lineIndex] = replacement;
      cell.source = lines.join("\n");
      exam.blanks.push({
        id,
        label: `★ 구현 ${number}: ${needle} 뒤의 핵심 호출/계산`,
        instruction: "위 코드의 목적과 앞뒤 텐서 흐름을 보고, 비어 있는 오른쪽 식 또는 호출을 완성하세요.",
        answer
      });
      return true;
    }
    return false;
  };

  // 노트북별 최소 6개를 보장한다. 선택 규칙이 원본 버전 차이로
  // 일치하지 않을 때에도, 학습 흐름에서 쓰이는 대입문만 후보로 삼는다.
  const fillToSix = (exam) => {
    const useful = /\b(tokenizer|dataset|dataloader|documents|nodes|index|retriever|query_engine|response|parser|model|optimizer|loss|inputs|targets|logits|labels|features|train|test|device|scale|mask|weight|output|latent|noise|scheduler|teacher|student|importance|threshold|scores)\b/i;
    let serial = exam.blanks.length + 1;
    for (const cell of exam.cells.filter((item) => item.type === "code")) {
      if (exam.blanks.length >= 6) break;
      const lines = cell.source.split("\n");
      for (let i = 0; i < lines.length && exam.blanks.length < 6; i += 1) {
        const line = lines[i];
        if (isReserved(line)) continue;
        if (!useful.test(line) || line.includes("[[BLANK:") || !line.includes("=")) continue;
        const equal = line.indexOf("=");
        if (equal < 1 || /==|>=|<=|!=|=>/.test(line)) continue;
        const answer = line.slice(equal + 1).trim();
        if (!answer || answer.startsWith("#") || answer.endsWith("[") || answer.endsWith("(")) continue;
        const id = `auto-${exam.page}-fallback-${serial}`;
        lines[i] = `${line.slice(0, equal + 1)} [[BLANK:${id}]]`;
        cell.source = lines.join("\n");
        exam.blanks.push({
          id,
          label: `★ 구현 ${serial}: ${line.slice(0, equal).trim()}의 계산`,
          instruction: "이 변수의 역할과 바로 아래 코드에서 사용되는 방식을 보고, 오른쪽 구현식을 완성하세요.",
          answer
        });
        serial += 1;
      }
    }
  };

  for (const [file, exam] of Object.entries(set)) {
    const wanted = ruleSets[file] || [];
    wanted.forEach((needle, index) => toBlank(exam, needle, index + 1));
    fillToSix(exam);
  }
})();
