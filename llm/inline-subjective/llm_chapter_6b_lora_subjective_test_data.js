/* Generated from the original notebook. */
window.RAG_SUBJECTIVE_CELLS = [
  {
    "number": 1,
    "code_number": 1,
    "type": "code",
    "source": "import math\nimport time\nimport requests\nfrom pathlib import Path\nimport pandas as pd\nimport torch\nimport torch.nn as nn\nimport tiktoken\nfrom torch.utils.data import DataLoader\nimport matplotlib.pyplot as plt # 그래프 저장을 위해 추가\n\n# 로컬 모듈 임포트 (previous_chapters.py가 필요합니다)\nfrom previous_chapters import (\n    download_and_unzip_spam_data,\n    create_balanced_dataset,\n    random_split,\n    SpamDataset,\n    GPTModel,\n    download_model,\n    calc_accuracy_loader,\n    train_classifier_simple,\n    plot_values # 그래프 그리기 함수 추가\n)"
  },
  {
    "number": 2,
    "code_number": 2,
    "type": "code",
    "source": "# -----------------------------------------------------------------------------\n# 1. 설정 및 하이퍼파라미터\n# -----------------------------------------------------------------------------\nBASE_CONFIG = {\n    \"vocab_size\": 50257,\n    \"context_length\": 1024,\n    \"drop_rate\": 0.0,\n    \"qkv_bias\": True,\n    \"emb_dim\": 768, \"n_layers\": 12, \"n_heads\": 12\n}\n\nBATCH_SIZE = 8\nNUM_EPOCHS = 5\nLEARNING_RATE = 8e-4\nLORA_RANK = 16\nLORA_ALPHA = 16"
  },
  {
    "number": 3,
    "code_number": 3,
    "type": "code",
    "source": "###중요: LoRA 구현 부분\n# -----------------------------------------------------------------------------\n# 2. LoRA 클래스 및 함수 정의\n# -----------------------------------------------------------------------------\nclass LoRALayer(nn.Module):\n    def __init__(self, in_dim, out_dim, rank, alpha):\n        \"\"\"\n        LoRA(Low-Rank Adaptation) 레이어 초기화\n        \"\"\"\n        super().__init__()\n        # TODO: LoRA A 행렬의 rank 차원을 채우세요.\n        # 힌트: A 행렬 크기는 (in_dim, rank)입니다.\n        self.A = [[BLANK:blank-ch6b-a]]\n        nn.init.kaiming_uniform_(self.A, a=math.sqrt(5))\n        \n        # [기출 변형 유력] 학습 시작 시 ΔW = AB = 0이 되도록 행렬 B(self.rank, out_dim)를 0으로 초기화한 Parameter 정의\n        self.B = [[BLANK:blank-ch6b-lora-b-zero]]\n        \n        self.alpha = alpha\n        self.rank = rank\n\n    def forward(self, x):\n        # region [LoRA 어댑터 적용]\n        # TODO: LoRA forward 식의 파라미터명을 채우세요.\n        # 힌트: alpha/rank 스케일과 A, B 행렬곱 순서를 맞추세요.\n        x = [[BLANK:blank-ch6b-delta]]\n        # endregion\n        return x\n\nclass LinearWithLoRA(nn.Module):\n    \"\"\"\n    기존의 Linear 레이어를 감싸서 LoRA 어댑터를 추가한 클래스\n    \"\"\"\n    def __init__(self, linear, rank, alpha):\n        super().__init__()\n        self.linear = linear\n        self.lora = LoRALayer(\n            linear.in_features, linear.out_features, rank, alpha\n        )\n\n    def forward(self, x):\n        # region [기존 Linear와 LoRA 출력 합산]\n        # TODO: LoRA 잔차 호출 대상을 채우세요.\n        # 힌트: 기존 linear 출력에 lora(x)를 더해 반환합니다.\n        return [[BLANK:blank-ch6b-residual]]\n        # endregion\n        \ndef replace_linear_with_lora(model, rank, alpha):\n    \"\"\"\n    모델 내의 모든 Linear 레이어를 찾아 LoRA가 적용된 레이어로 교체\n    \"\"\"\n    for name, module in model.named_children():\n        # [기출 변형 유력] 현재 자식 모듈(module)이 torch.nn.Linear 인스턴스인지 확인\n        if [[BLANK:blank-ch6b-isinstance-linear]]:\n            # [기출 변형 유력] setattr를 사용해 model의 해당 모듈(name)을 LinearWithLoRA(module, rank, alpha)로 교체\n            [[BLANK:blank-ch6b-setattr-lora]]\n        else:\n            # 재귀 호출\n            replace_linear_with_lora(module, rank, alpha)"
  },
  {
    "number": 4,
    "code_number": 4,
    "type": "code",
    "source": "def main():\n    # 시드 설정\n    torch.manual_seed(123)\n    \n    # 장치 설정\n    device = torch.device(\"cuda\" if torch.cuda.is_available() else \"cpu\")\n    print(f\"사용 장치: {device}\")\n\n    # --- 데이터셋 준비 ---\n    print(\"데이터셋 준비 중...\")\n    url = \"https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip\"\n    zip_path = \"datas/sms_spam_collection.zip\"\n    extracted_path = \"datas/sms_spam_collection\"\n    data_file_path = Path(extracted_path) / \"SMSSpamCollection.tsv\"\n\n    try:\n        download_and_unzip_spam_data(url, zip_path, extracted_path, data_file_path)\n    except (requests.exceptions.RequestException, TimeoutError):\n        # 백업 URL 시도\n        url = \"https://f001.backblazeb2.com/file/LLMs-from-scratch/sms%2Bspam%2Bcollection.zip\"\n        download_and_unzip_spam_data(url, zip_path, extracted_path, data_file_path)\n\n    df = pd.read_csv(data_file_path, sep=\"\\t\", header=None, names=[\"Label\", \"Text\"])\n    balanced_df = create_balanced_dataset(df)\n    balanced_df[\"Label\"] = balanced_df[\"Label\"].map({\"ham\": 0, \"spam\": 1})\n\n    train_df, validation_df, test_df = random_split(balanced_df, 0.7, 0.1)\n    \n    # 임시 파일 저장 (Dataset 클래스 사용을 위해)\n    train_df.to_csv(\"datas/train.csv\", index=None)\n    validation_df.to_csv(\"datas/validation.csv\", index=None)\n    test_df.to_csv(\"datas/test.csv\", index=None)\n\n    tokenizer = tiktoken.get_encoding(\"gpt2\")\n    train_dataset = SpamDataset(\"datas/train.csv\", max_length=None, tokenizer=tokenizer)\n    val_dataset = SpamDataset(\"datas/validation.csv\", max_length=train_dataset.max_length, tokenizer=tokenizer)\n    test_dataset = SpamDataset(\"datas/test.csv\", max_length=train_dataset.max_length, tokenizer=tokenizer)\n\n    train_loader = DataLoader(dataset=train_dataset, batch_size=BATCH_SIZE, shuffle=True, drop_last=True)\n    val_loader = DataLoader(dataset=val_dataset, batch_size=BATCH_SIZE, drop_last=False)\n    test_loader = DataLoader(dataset=test_dataset, batch_size=BATCH_SIZE, drop_last=False)\n\n    # --- 모델 준비 ---\n    print(\"모델 로드 중...\")\n\n    file_name = \"gpt2-small-124M.pth\"\n    model_path = f\"./models/gpt2/{file_name}\"\n    download_model(file_name, model_path)\n\n    # Policy Model (학습 대상)\n    model = GPTModel(BASE_CONFIG)\n    model.load_state_dict(torch.load(model_path, map_location=\"cpu\", weights_only=True))\n    model.to(device)\n\n    # 출력 헤드 교체 (분류용)\n    num_classes = 2\n    model.out_head = torch.nn.Linear(in_features=768, out_features=num_classes)\n    \n    # --- LoRA 적용 ---\n    print(\"LoRA 레이어 적용 및 파라미터 동결 중...\")\n    # 1. 모든 파라미터 동결\n    # TODO: 파라미터 학습 여부 값을 채우세요.\n    # 힌트: 전체 동결 단계에서는 False를 설정합니다.\n    for param in model.parameters():\n        param.requires_grad = False\n    \n    # 2. Linear 레이어를 LoRA로 교체 (LoRA 파라미터는 새로 생성되므로 requires_grad=True 상태)\n    # [기출 변형 유력] replace_linear_with_lora 함수를 호출해 모델 내 모든 Linear 층을 LoRA 층으로 교체 (rank=LORA_RANK, alpha=LORA_ALPHA)\n    [[BLANK:blank-ch6b-apply-lora]]\n    \n    model.to(device)\n\n    # 학습 가능 파라미터 확인\n    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)\n    print(f\"총 학습 가능 LoRA 파라미터 수: {total_params:,}\")\n\n    # --- 학습 실행 ---\n    print(\"학습 시작...\")\n    optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=0.1)\n    \n    start_time = time.time()\n    # 반환값 캡처 (loss 및 accuracy 기록)\n    train_losses, val_losses, train_accs, val_accs, examples_seen = train_classifier_simple(\n        model, train_loader, val_loader, optimizer, device,\n        num_epochs=NUM_EPOCHS, eval_freq=50, eval_iter=5,\n    )\n    end_time = time.time()\n    print(f\"학습 완료 (소요 시간: {(end_time - start_time) / 60:.2f}분)\")\n\n    # --- 결과 시각화 (Loss) ---\n    print(\"학습 결과 시각화 중...\")\n    epochs_tensor = torch.linspace(0, NUM_EPOCHS, len(train_losses))\n    examples_seen_tensor = torch.linspace(0, examples_seen, len(train_losses))\n    \n    # plot_values 함수 호출\n    plot_values(epochs_tensor, examples_seen_tensor, train_losses, val_losses, label=\"loss\")\n    \n    # --- 최종 평가 ---\n    print(\"최종 모델 평가 중...\")\n    train_acc = calc_accuracy_loader(train_loader, model, device)\n    val_acc = calc_accuracy_loader(val_loader, model, device)\n    test_acc = calc_accuracy_loader(test_loader, model, device)\n\n    print(f\"훈련 정확도: {train_acc*100:.2f}%\")\n    print(f\"검증 정확도: {val_acc*100:.2f}%\")\n    print(f\"테스트 정확도: {test_acc*100:.2f}%\")"
  },
  {
    "number": 5,
    "code_number": 5,
    "type": "code",
    "source": "main()"
  }
];
window.SUBJECTIVE_BLANKS = [
  {
    "id": "blank-ch6b-a",
    "label": "LoRA A down-projection",
    "answer": "nn.Parameter(torch.empty(in_dim, self.rank))"
  },
  {
    "id": "blank-ch6b-lora-b-zero",
    "label": "🟣 기출 변형 유력 · LoRA 행렬 B 영행렬(torch.zeros) 초기화",
    "hint": "nn.Parameter(torch.zeros(self.rank, out_dim))로 행렬 B를 0으로 초기화합니다.",
    "answer": "nn.Parameter(torch.zeros(self.rank, out_dim))"
  },
  {
    "id": "blank-ch6b-delta",
    "label": "LoRA scaled delta",
    "answer": "(self.alpha / self.rank) * (x @ self.A @ self.B)"
  },
  {
    "id": "blank-ch6b-residual",
    "label": "Linear + LoRA 결과 결합",
    "answer": "self.linear(x) + self.lora(x)"
  },
  {
    "id": "blank-ch6b-isinstance-linear",
    "label": "🟣 기출 변형 유력 · LoRA 교체 대상 선형 층 판별(isinstance)",
    "hint": "isinstance(module, torch.nn.Linear)로 현재 자식 모듈이 선형 계층인지 확인합니다.",
    "answer": "isinstance(module, torch.nn.Linear)"
  },
  {
    "id": "blank-ch6b-setattr-lora",
    "label": "🟣 기출 변형 유력 · setattr을 이용한 LinearWithLoRA 계층 교체",
    "hint": "setattr(model, name, LinearWithLoRA(module, rank, alpha))로 기존 선형 계층을 교체합니다.",
    "answer": "setattr(model, name, LinearWithLoRA(module, rank, alpha))"
  },
  {
    "id": "blank-ch6b-apply-lora",
    "label": "🟣 기출 변형 유력 · 모델 전체 LoRA 계층 일괄 적용 호출",
    "hint": "replace_linear_with_lora(model, rank=LORA_RANK, alpha=LORA_ALPHA)를 호출합니다.",
    "answer": "replace_linear_with_lora(model, rank=LORA_RANK, alpha=LORA_ALPHA)"
  }
];
window.SUBJECTIVE_EXAM_DATA = {
  "page": "llm_chapter_6b_lora_subjective_test",
  "cells": [
    {
      "number": 1,
      "code_number": 1,
      "type": "code",
      "source": "import math\nimport time\nimport requests\nfrom pathlib import Path\nimport pandas as pd\nimport torch\nimport torch.nn as nn\nimport tiktoken\nfrom torch.utils.data import DataLoader\nimport matplotlib.pyplot as plt # 그래프 저장을 위해 추가\n\n# 로컬 모듈 임포트 (previous_chapters.py가 필요합니다)\nfrom previous_chapters import (\n    download_and_unzip_spam_data,\n    create_balanced_dataset,\n    random_split,\n    SpamDataset,\n    GPTModel,\n    download_model,\n    calc_accuracy_loader,\n    train_classifier_simple,\n    plot_values # 그래프 그리기 함수 추가\n)"
    },
    {
      "number": 2,
      "code_number": 2,
      "type": "code",
      "source": "# -----------------------------------------------------------------------------\n# 1. 설정 및 하이퍼파라미터\n# -----------------------------------------------------------------------------\nBASE_CONFIG = {\n    \"vocab_size\": 50257,\n    \"context_length\": 1024,\n    \"drop_rate\": 0.0,\n    \"qkv_bias\": True,\n    \"emb_dim\": 768, \"n_layers\": 12, \"n_heads\": 12\n}\n\nBATCH_SIZE = 8\nNUM_EPOCHS = 5\nLEARNING_RATE = 8e-4\nLORA_RANK = 16\nLORA_ALPHA = 16"
    },
    {
      "number": 3,
      "code_number": 3,
      "type": "code",
      "source": "###중요: LoRA 구현 부분\n# -----------------------------------------------------------------------------\n# 2. LoRA 클래스 및 함수 정의\n# -----------------------------------------------------------------------------\nclass LoRALayer(nn.Module):\n    def __init__(self, in_dim, out_dim, rank, alpha):\n        \"\"\"\n        LoRA(Low-Rank Adaptation) 레이어 초기화\n        \"\"\"\n        super().__init__()\n        # TODO: LoRA A 행렬의 rank 차원을 채우세요.\n        # 힌트: A 행렬 크기는 (in_dim, rank)입니다.\n        self.A = [[BLANK:blank-ch6b-a]]\n        nn.init.kaiming_uniform_(self.A, a=math.sqrt(5))\n        \n        # [기출 변형 유력] 학습 시작 시 ΔW = AB = 0이 되도록 행렬 B(self.rank, out_dim)를 0으로 초기화한 Parameter 정의\n        self.B = [[BLANK:blank-ch6b-lora-b-zero]]\n        \n        self.alpha = alpha\n        self.rank = rank\n\n    def forward(self, x):\n        # region [LoRA 어댑터 적용]\n        # TODO: LoRA forward 식의 파라미터명을 채우세요.\n        # 힌트: alpha/rank 스케일과 A, B 행렬곱 순서를 맞추세요.\n        x = [[BLANK:blank-ch6b-delta]]\n        # endregion\n        return x\n\nclass LinearWithLoRA(nn.Module):\n    \"\"\"\n    기존의 Linear 레이어를 감싸서 LoRA 어댑터를 추가한 클래스\n    \"\"\"\n    def __init__(self, linear, rank, alpha):\n        super().__init__()\n        self.linear = linear\n        self.lora = LoRALayer(\n            linear.in_features, linear.out_features, rank, alpha\n        )\n\n    def forward(self, x):\n        # region [기존 Linear와 LoRA 출력 합산]\n        # TODO: LoRA 잔차 호출 대상을 채우세요.\n        # 힌트: 기존 linear 출력에 lora(x)를 더해 반환합니다.\n        return [[BLANK:blank-ch6b-residual]]\n        # endregion\n        \ndef replace_linear_with_lora(model, rank, alpha):\n    \"\"\"\n    모델 내의 모든 Linear 레이어를 찾아 LoRA가 적용된 레이어로 교체\n    \"\"\"\n    for name, module in model.named_children():\n        # [기출 변형 유력] 현재 자식 모듈(module)이 torch.nn.Linear 인스턴스인지 확인\n        if [[BLANK:blank-ch6b-isinstance-linear]]:\n            # [기출 변형 유력] setattr를 사용해 model의 해당 모듈(name)을 LinearWithLoRA(module, rank, alpha)로 교체\n            [[BLANK:blank-ch6b-setattr-lora]]\n        else:\n            # 재귀 호출\n            replace_linear_with_lora(module, rank, alpha)"
    },
    {
      "number": 4,
      "code_number": 4,
      "type": "code",
      "source": "def main():\n    # 시드 설정\n    torch.manual_seed(123)\n    \n    # 장치 설정\n    device = torch.device(\"cuda\" if torch.cuda.is_available() else \"cpu\")\n    print(f\"사용 장치: {device}\")\n\n    # --- 데이터셋 준비 ---\n    print(\"데이터셋 준비 중...\")\n    url = \"https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip\"\n    zip_path = \"datas/sms_spam_collection.zip\"\n    extracted_path = \"datas/sms_spam_collection\"\n    data_file_path = Path(extracted_path) / \"SMSSpamCollection.tsv\"\n\n    try:\n        download_and_unzip_spam_data(url, zip_path, extracted_path, data_file_path)\n    except (requests.exceptions.RequestException, TimeoutError):\n        # 백업 URL 시도\n        url = \"https://f001.backblazeb2.com/file/LLMs-from-scratch/sms%2Bspam%2Bcollection.zip\"\n        download_and_unzip_spam_data(url, zip_path, extracted_path, data_file_path)\n\n    df = pd.read_csv(data_file_path, sep=\"\\t\", header=None, names=[\"Label\", \"Text\"])\n    balanced_df = create_balanced_dataset(df)\n    balanced_df[\"Label\"] = balanced_df[\"Label\"].map({\"ham\": 0, \"spam\": 1})\n\n    train_df, validation_df, test_df = random_split(balanced_df, 0.7, 0.1)\n    \n    # 임시 파일 저장 (Dataset 클래스 사용을 위해)\n    train_df.to_csv(\"datas/train.csv\", index=None)\n    validation_df.to_csv(\"datas/validation.csv\", index=None)\n    test_df.to_csv(\"datas/test.csv\", index=None)\n\n    tokenizer = tiktoken.get_encoding(\"gpt2\")\n    train_dataset = SpamDataset(\"datas/train.csv\", max_length=None, tokenizer=tokenizer)\n    val_dataset = SpamDataset(\"datas/validation.csv\", max_length=train_dataset.max_length, tokenizer=tokenizer)\n    test_dataset = SpamDataset(\"datas/test.csv\", max_length=train_dataset.max_length, tokenizer=tokenizer)\n\n    train_loader = DataLoader(dataset=train_dataset, batch_size=BATCH_SIZE, shuffle=True, drop_last=True)\n    val_loader = DataLoader(dataset=val_dataset, batch_size=BATCH_SIZE, drop_last=False)\n    test_loader = DataLoader(dataset=test_dataset, batch_size=BATCH_SIZE, drop_last=False)\n\n    # --- 모델 준비 ---\n    print(\"모델 로드 중...\")\n\n    file_name = \"gpt2-small-124M.pth\"\n    model_path = f\"./models/gpt2/{file_name}\"\n    download_model(file_name, model_path)\n\n    # Policy Model (학습 대상)\n    model = GPTModel(BASE_CONFIG)\n    model.load_state_dict(torch.load(model_path, map_location=\"cpu\", weights_only=True))\n    model.to(device)\n\n    # 출력 헤드 교체 (분류용)\n    num_classes = 2\n    model.out_head = torch.nn.Linear(in_features=768, out_features=num_classes)\n    \n    # --- LoRA 적용 ---\n    print(\"LoRA 레이어 적용 및 파라미터 동결 중...\")\n    # 1. 모든 파라미터 동결\n    # TODO: 파라미터 학습 여부 값을 채우세요.\n    # 힌트: 전체 동결 단계에서는 False를 설정합니다.\n    for param in model.parameters():\n        param.requires_grad = False\n    \n    # 2. Linear 레이어를 LoRA로 교체 (LoRA 파라미터는 새로 생성되므로 requires_grad=True 상태)\n    # [기출 변형 유력] replace_linear_with_lora 함수를 호출해 모델 내 모든 Linear 층을 LoRA 층으로 교체 (rank=LORA_RANK, alpha=LORA_ALPHA)\n    [[BLANK:blank-ch6b-apply-lora]]\n    \n    model.to(device)\n\n    # 학습 가능 파라미터 확인\n    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)\n    print(f\"총 학습 가능 LoRA 파라미터 수: {total_params:,}\")\n\n    # --- 학습 실행 ---\n    print(\"학습 시작...\")\n    optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=0.1)\n    \n    start_time = time.time()\n    # 반환값 캡처 (loss 및 accuracy 기록)\n    train_losses, val_losses, train_accs, val_accs, examples_seen = train_classifier_simple(\n        model, train_loader, val_loader, optimizer, device,\n        num_epochs=NUM_EPOCHS, eval_freq=50, eval_iter=5,\n    )\n    end_time = time.time()\n    print(f\"학습 완료 (소요 시간: {(end_time - start_time) / 60:.2f}분)\")\n\n    # --- 결과 시각화 (Loss) ---\n    print(\"학습 결과 시각화 중...\")\n    epochs_tensor = torch.linspace(0, NUM_EPOCHS, len(train_losses))\n    examples_seen_tensor = torch.linspace(0, examples_seen, len(train_losses))\n    \n    # plot_values 함수 호출\n    plot_values(epochs_tensor, examples_seen_tensor, train_losses, val_losses, label=\"loss\")\n    \n    # --- 최종 평가 ---\n    print(\"최종 모델 평가 중...\")\n    train_acc = calc_accuracy_loader(train_loader, model, device)\n    val_acc = calc_accuracy_loader(val_loader, model, device)\n    test_acc = calc_accuracy_loader(test_loader, model, device)\n\n    print(f\"훈련 정확도: {train_acc*100:.2f}%\")\n    print(f\"검증 정확도: {val_acc*100:.2f}%\")\n    print(f\"테스트 정확도: {test_acc*100:.2f}%\")"
    },
    {
      "number": 5,
      "code_number": 5,
      "type": "code",
      "source": "main()"
    }
  ],
  "blanks": [
    {
      "id": "blank-ch6b-a",
      "label": "LoRA A down-projection",
      "answer": "nn.Parameter(torch.empty(in_dim, self.rank))"
    },
    {
      "id": "blank-ch6b-lora-b-zero",
      "label": "🟣 기출 변형 유력 · LoRA 행렬 B 영행렬(torch.zeros) 초기화",
      "hint": "nn.Parameter(torch.zeros(self.rank, out_dim))로 행렬 B를 0으로 초기화합니다.",
      "answer": "nn.Parameter(torch.zeros(self.rank, out_dim))"
    },
    {
      "id": "blank-ch6b-delta",
      "label": "LoRA scaled delta",
      "answer": "(self.alpha / self.rank) * (x @ self.A @ self.B)"
    },
    {
      "id": "blank-ch6b-residual",
      "label": "Linear + LoRA 결과 결합",
      "answer": "self.linear(x) + self.lora(x)"
    },
    {
      "id": "blank-ch6b-isinstance-linear",
      "label": "🟣 기출 변형 유력 · LoRA 교체 대상 선형 층 판별(isinstance)",
      "hint": "isinstance(module, torch.nn.Linear)로 현재 자식 모듈이 선형 계층인지 확인합니다.",
      "answer": "isinstance(module, torch.nn.Linear)"
    },
    {
      "id": "blank-ch6b-setattr-lora",
      "label": "🟣 기출 변형 유력 · setattr을 이용한 LinearWithLoRA 계층 교체",
      "hint": "setattr(model, name, LinearWithLoRA(module, rank, alpha))로 기존 선형 계층을 교체합니다.",
      "answer": "setattr(model, name, LinearWithLoRA(module, rank, alpha))"
    },
    {
      "id": "blank-ch6b-apply-lora",
      "label": "🟣 기출 변형 유력 · 모델 전체 LoRA 계층 일괄 적용 호출",
      "hint": "replace_linear_with_lora(model, rank=LORA_RANK, alpha=LORA_ALPHA)를 호출합니다.",
      "answer": "replace_linear_with_lora(model, rank=LORA_RANK, alpha=LORA_ALPHA)"
    }
  ]
};
