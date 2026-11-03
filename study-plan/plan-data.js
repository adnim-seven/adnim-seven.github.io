// Generated from the approved Vault curriculum by tools/build-study-plan.cjs
window.STUDY_PLAN = {
  "examDate": "2026-11-17",
  "startDate": "2026-11-04",
  "firstPassEnd": "2026-11-13",
  "source": "NOV17_STUDY_CURRICULUM.md + NOV17_REVIEW_SCHEDULE.md",
  "days": [
    {
      "date": "2026-11-04",
      "phase": "learn",
      "subject": "LLM",
      "title": "Dataset에서 Attention까지",
      "minutes": 180,
      "timeLabel": "3시간",
      "range": "LLM Ch1 벡터 짧은 복습 → Ch2 Dataset·DataLoader·Embedding → Ch3 Attention 전체, Viz 보조",
      "target": "next-token 슬라이스, Dataset 반환, 토큰+위치 임베딩, QKV·헤드 축·마스크·가중합",
      "completion": "raw_text→ID→[B,T,D]→Attention 출력 흐름 설명, 핵심 5곳 중 4곳 복원",
      "review": "진단: 정수 ID→Embedding의 입출력, Linear 입력/출력 인자, transpose와 cat의 차이",
      "notebooks": [
        "1. llm_hands_on-main/llm_hands_on-main/Chapter_1_Exercise_Vector Space.ipynb",
        "1. llm_hands_on-main/llm_hands_on-main/Chapter_2_Exercise_Dataset.ipynb",
        "1. llm_hands_on-main/llm_hands_on-main/Chapter_3_Excercise_Attention.ipynb",
        "1. llm_hands_on-main/llm_hands_on-main/Chapter_3_Excercise_Viz_Multi_head_attention.ipynb"
      ],
      "links": [
        {
          "href": "../llm/",
          "label": "LLM 과목 학습 열기"
        }
      ],
      "priority": "Ch1과 Viz는 짧게 확인하고 Ch2·Ch3 구현에 집중."
    },
    {
      "date": "2026-11-05",
      "phase": "learn",
      "subject": "LLM",
      "title": "GPT 조립·생성·학습",
      "minutes": 180,
      "timeLabel": "3시간",
      "range": "LLM Ch4 LayerNorm부터 GPTModel·generate_text_simple까지 → Ch5 Cross Entropy 보조 → Pretraining 학습·평가",
      "target": "LayerNorm, FFN/residual, cfg 기반 생성, 마지막 logits·argmax·cat, CE flatten, 학습 3단계",
      "completion": "GPT 생성과 가중치 학습을 구분, 두 흐름의 코드 각 1개 독립 복원",
      "review": "Ch2 입력/정답 한 칸 shift, QKV 헤드 분리·가중합",
      "notebooks": [
        "1. llm_hands_on-main/llm_hands_on-main/Chapter_4_Excercise_GPT.ipynb",
        "1. llm_hands_on-main/llm_hands_on-main/Chapter_5_Excercise_Pretraining.ipynb",
        "1. llm_hands_on-main/llm_hands_on-main/llm_from_scratch/Chapter_5_Excercise_Pretraining_Cross_Entropy.ipynb"
      ],
      "links": [
        {
          "href": "../llm/",
          "label": "LLM 과목 학습 열기"
        }
      ],
      "priority": ""
    },
    {
      "date": "2026-11-06",
      "phase": "learn",
      "subject": "LLM",
      "title": "분류·LoRA·Instruction·DPO",
      "minutes": 180,
      "timeLabel": "3시간",
      "range": "LLM Ch6 분류 Dataset·head·학습 → LoRA → Ch7 instruction collate → DPO Dataset·mask·loss",
      "target": "패딩·분류 head·freeze, LoRA 차원·합산, SFT 입력/정답 shift, prompt/chosen/rejected·마스킹",
      "completion": "분류/SFT/DPO 정답 형태 구분, 10월 LLM 구현 3묶음의 핵심 설명",
      "review": "GPTModel 생성자, generate_text_simple, loss flatten과 학습 순서",
      "notebooks": [
        "1. llm_hands_on-main/llm_hands_on-main/Chapter_6_Excercise_Finetuning_Classification.ipynb",
        "1. llm_hands_on-main/llm_hands_on-main/Chapter_6_Excercise_Finetuning_Classification_LoRA.ipynb",
        "1. llm_hands_on-main/llm_hands_on-main/Chapter_7_Exercise_Follow_Instructions.ipynb",
        "1. llm_hands_on-main/llm_hands_on-main/Chapter_7_Exercise_Follow_Instructions_dpo.ipynb"
      ],
      "links": [
        {
          "href": "../llm/",
          "label": "LLM 과목 학습 열기"
        }
      ],
      "priority": "DPO·LoRA를 우선하되 분류·SFT를 생략하지 않기."
    },
    {
      "date": "2026-11-07",
      "phase": "learn",
      "subject": "Data",
      "title": "시계열 입력부터 미래 예측까지",
      "minutes": 150,
      "timeLabel": "2.5시간",
      "range": "Data ts_practice 전체 구현 흐름: 데이터 분리·스케일링 → sliding window → LSTM/Conv1D/RNN → Encoder–Decoder → 학습·평가",
      "target": "train fit/test transform, 과거/미래 슬라이스, float32, 모델 생성·forward, hidden 전달·예측 재입력·stack",
      "completion": "RNN [B,T,F]와 Conv1D [B,F,T] 구분, 단일/다중 미래 정답 생성",
      "review": "분류 head와 패딩, LoRA 차원, DPO chosen/rejected·prompt mask 중 3개",
      "notebooks": [
        "4. Data model 의 이해/20260114/3_4-ts-practice/ts_practice.ipynb"
      ],
      "links": [
        {
          "href": "../data/",
          "label": "Data 과목 학습 열기"
        }
      ],
      "priority": ""
    },
    {
      "date": "2026-11-08",
      "phase": "learn",
      "subject": "Data",
      "title": "NCF·NGCF 추천 모델",
      "minutes": 150,
      "timeLabel": "2.5시간",
      "range": "Data RecSys_NCF 전체 모델 → RecSys_GCF_practice의 그래프·NGCF·loss·평가",
      "target": "Embedding/Linear/ReLU 선언·concat, item offset, 이웃 집계, pos/neg 점수·BPR, Hit@K/NDCG@K",
      "completion": "NCF concat과 내적 추천 구분, NCF 생성자와 NGCF 핵심 집계·loss 각 1곳 복원",
      "review": "시계열 입력/정답 구간, Conv1D 축, Encoder hidden 전달",
      "notebooks": [
        "4. Data model 의 이해/20260114/7_8-recsys-practice/RecSys_NCF.ipynb",
        "4. Data model 의 이해/20260114/7_8-recsys-practice/RecSys_GCF_practice.ipynb"
      ],
      "links": [
        {
          "href": "../data/",
          "label": "Data 과목 학습 열기"
        }
      ],
      "priority": ""
    },
    {
      "date": "2026-11-09",
      "phase": "learn",
      "subject": "Vision",
      "title": "ResNet18·ViT",
      "minutes": 150,
      "timeLabel": "2.5시간",
      "range": "Vision 01 ResNet18 전처리→모델 교체→학습·평가 → 02 ViT patch부터 분류 출력까지",
      "target": "train/test Compose, model.conv1/maxpool/fc, CE·argmax, patch/position/class token, Attention·FFN residual",
      "completion": "CIFAR 모델 생성·전처리 독립 복원, CNN/ViT 입력 흐름 비교",
      "review": "NCF 생성자·concat, NGCF item offset·BPR 중 3개",
      "notebooks": [
        "2. vision/AI_Specialist_Vision/01_ResNet18_CIFAR10.ipynb",
        "2. vision/AI_Specialist_Vision/02_ViT_CIFAR10.ipynb"
      ],
      "links": [
        {
          "href": "../vision/",
          "label": "Vision 과목 학습 열기"
        }
      ],
      "priority": ""
    },
    {
      "date": "2026-11-10",
      "phase": "learn",
      "subject": "Vision",
      "title": "DETR·U-Net·Diffusion",
      "minutes": 150,
      "timeLabel": "2.5시간",
      "range": "Vision 03 DETR → 04 U-Net → 05 DDPM → 06 Stable Diffusion의 핵심 호출 흐름",
      "target": "DETR transformer 연결·class/box 출력, U-Net channel concat·IoU/Dice, DDPM noise/손실, SD conditioning·생성 호출",
      "completion": "DETR/U-Net 핵심 각 1곳 복원. DDPM/SD는 입출력·핵심 호출 1곳씩 기록",
      "review": "Compose 전체, ResNet conv1, ViT/Transformer residual",
      "notebooks": [
        "2. vision/AI_Specialist_Vision/03_DETR.ipynb",
        "2. vision/AI_Specialist_Vision/04_Unet.ipynb",
        "2. vision/AI_Specialist_Vision/05_DDPM.ipynb",
        "2. vision/AI_Specialist_Vision/06_Stable_Diffusion_v1_4.ipynb"
      ],
      "links": [
        {
          "href": "../vision/",
          "label": "Vision 과목 학습 열기"
        }
      ],
      "priority": "새 학습 시간 약 2/3는 DETR·U-Net, 약 1/3는 DDPM·Stable Diffusion."
    },
    {
      "date": "2026-11-11",
      "phase": "learn",
      "subject": "On-device",
      "title": "Pruning·Quantization·Distillation",
      "minutes": 180,
      "timeLabel": "3시간",
      "range": "On-device 1 CNN Pruning → 2 CNN Quantization → 3 KD → 4 LLM Pruning → 5 LLM Quantization",
      "target": "중요도·합산 축·mask, scale/zero point·linear/conv 환산, teacher 고정·soft/hard loss, WANDA 축, pseudo quantize·복원",
      "completion": "CNN 3주제는 직접 구현. LLM 2개는 대표 중요도/양자화 식 한 곳씩 복원",
      "review": "U-Net concat 또는 DETR 출력 흐름 + 7일 전 LLM 입력/Attention 핵심 2개",
      "notebooks": [
        "3. On-Device AI/On-Device AI 강의자료/실습/1. Pruning for CNN.ipynb",
        "3. On-Device AI/On-Device AI 강의자료/실습/2. Quantization for CNN.ipynb",
        "3. On-Device AI/On-Device AI 강의자료/실습/3. Knowledge Distillation.ipynb",
        "3. On-Device AI/On-Device AI 강의자료/실습/4. Pruning for LLM.ipynb",
        "3. On-Device AI/On-Device AI 강의자료/실습/5. Quantization for LLM.ipynb"
      ],
      "links": [
        {
          "href": "../on-device/",
          "label": "On-device 과목 학습 열기"
        }
      ],
      "priority": "이미 공부한 On-device 압축 복습. CNN 3주제를 우선 구현하고 LLM 2주제의 대표 식도 확인."
    },
    {
      "date": "2026-11-12",
      "phase": "learn",
      "subject": "RAG",
      "title": "LlamaIndex·Custom RAG",
      "minutes": 180,
      "timeLabel": "3시간",
      "range": "RAG 1 Llama_index: load/index→chunk→retriever/synthesizer→CRUD→Custom Engine → 2 RAG prototype/refinement",
      "target": "문서 로드·인덱스·query, 청킹 연결, 문맥 추출·PromptTemplate, role/content, Custom Engine 부품 연결",
      "completion": "질문→검색→문맥→LLM→답변 흐름을 코드로 연결",
      "review": "channel/kernel 중요도 축, quantized_conv2d 배율 + 7일 전 GPT 생성 한 곳",
      "notebooks": [
        "5. LLM Application/1일차/실습 자료/Code/1. Llama_index.ipynb",
        "5. LLM Application/1일차/실습 자료/Code/2. RAG.ipynb"
      ],
      "links": [
        {
          "href": "../rag/",
          "label": "RAG 과목 학습 열기"
        }
      ],
      "priority": ""
    },
    {
      "date": "2026-11-13",
      "phase": "learn",
      "subject": "RAG",
      "title": "Web·KG·MCP Agent",
      "minutes": 180,
      "timeLabel": "3시간",
      "range": "RAG 1 Data_preprocessing → 2 Task_1 → 3 Task_2 → 4 evaluation_with_MCP의 client·Agent·query",
      "target": "자료에서 query/reference 읽기, retrieval·prompt_generator, KG+웹 결과 연결, MCP Client/ToolSpec/await/Agent/Context",
      "completion": "MCP 실행 흐름과 웹·KG 문맥 연결 각 1곳 복원. 모든 과목 미확인 범위 체크",
      "review": "RAG 문서→index→retriever→prompt 연결 + 7일 전 LoRA/DPO 한 곳",
      "notebooks": [
        "5. LLM Application/2일차/십습자료/Code/1. Data_preprocessing.ipynb",
        "5. LLM Application/2일차/십습자료/Code/2. Task_1.ipynb",
        "5. LLM Application/2일차/십습자료/Code/3. Task_2.ipynb",
        "5. LLM Application/2일차/십습자료/Code/4_RAG_framework_evaluation_with_MCP.ipynb"
      ],
      "links": [
        {
          "href": "../rag/",
          "label": "RAG 과목 학습 열기"
        }
      ],
      "priority": "Data preprocessing은 필드·입력 구성만 짧게 보고 Task 1·2와 MCP에 집중. 미확인 범위 확정."
    },
    {
      "date": "2026-11-14",
      "phase": "practice",
      "subject": "기출 복원",
      "title": "10월 실제 기출 61칸",
      "minutes": 180,
      "timeLabel": "3시간",
      "range": "10월 실제 기출 복원 전체 61칸",
      "target": "120분 독립 풀이 → 60분 채점·원본 대조·오답 재작성. 제한시간 내 못 푼 칸도 미완료로 기록",
      "completion": "풀이·채점을 마치고 미완료와 오답을 기록",
      "review": "10월 기출 풀이 뒤 오답 정리 60분 중 MCP와 시계열 구간(7일 경과)도 짧게 확인. 시계열은 10월 기출이 아닌 누적 복습",
      "notebooks": [],
      "links": [
        {
          "href": "../exam-recall-october/",
          "label": "10월 실제 기출 풀기"
        }
      ],
      "priority": ""
    },
    {
      "date": "2026-11-15",
      "phase": "practice",
      "subject": "혼합 평가",
      "title": "5과목 3시간 실전 풀이",
      "minutes": 180,
      "timeLabel": "3시간",
      "range": "4·5·6·9월 복기에서 구체 코드가 있는 범위를 섞은 5과목 모의평가",
      "target": "3시간 연속, 자료 없이 풀이. 세부 코드가 없는 월별 항목은 ‘주제 참고’, 새로 만든 문제는 ‘기출 변형’으로 구분. 10월 답안 암기만으로 풀지 못하게 축·변수·빈칸 위치 변경",
      "completion": "자료 없이 3시간 풀이 완료. 분석은 11/16에 진행",
      "review": "추천(7일 경과)을 포함해 5과목 혼합 모의평가에 통합",
      "notebooks": [],
      "links": [
        {
          "href": "../mock-exam-1/",
          "label": "보조 혼합 모의 1회 · 예상·변형"
        },
        {
          "href": "../exam-recall-october/",
          "label": "10월 실제 기출"
        }
      ],
      "priority": "기출 주제 참고와 실제 복원·변형을 구분. 3시간 연속 시간을 확보하고 채점·분석은 다음 날."
    },
    {
      "date": "2026-11-16",
      "phase": "practice",
      "subject": "오답 재시험",
      "title": "틀린 문제만 다시 풀기",
      "minutes": 180,
      "timeLabel": "3시간",
      "range": "14·15일 오답 + 반복 혼동 + 마지막 미확인 범위",
      "target": "90분 오답 원인·원본 확인 → 60분 답 가리고 재시험 → 30분 최종 체크. 새 대단원 학습은 금지",
      "completion": "오답을 답 가리고 재작성하고 마지막 체크 완료",
      "review": "Vision 전처리·모델 교체(7일 경과) + 14/15일 오답을 독립 재시험",
      "notebooks": [],
      "links": [
        {
          "href": "../exam-recall-october/",
          "label": "10월 기출 오답 이력 보기"
        }
      ],
      "priority": "새 대단원 학습은 하지 않기. 확신했지만 틀린 항목부터 재시험."
    },
    {
      "date": "2026-11-17",
      "phase": "exam",
      "subject": "시험 전",
      "title": "오답 한 장 최종 확인",
      "minutes": 30,
      "timeLabel": "20~30분",
      "range": "개인 오답 한 장만",
      "target": "Attention 축, RAG 연결, Data 구간·shape, Vision 전처리·conv1, 양자화/가지치기 축 확인. 새 문제·밤샘 금지",
      "completion": "개인 오답만 확인하고 시험 준비",
      "review": "전날에도 틀린 것만 20~30분. DETR/U-Net 축은 짧게 확인",
      "notebooks": [],
      "links": [
        {
          "href": "../",
          "label": "전체 과목 홈"
        }
      ],
      "priority": "새 문제·새 개념·밤샘 없이 개인 오답만 확인."
    }
  ]
};
