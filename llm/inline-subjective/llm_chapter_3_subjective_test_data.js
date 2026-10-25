/* Generated from the original notebook. */
window.RAG_SUBJECTIVE_CELLS = [
  {
    "number": 1,
    "code_number": 1,
    "type": "code",
    "source": "### 중요: 이 코드는 인과적 어텐션 메커니즘을 구현한 PyTorch 모듈입니다.\nimport torch\nimport torch.nn as nn\n\nclass CausalAttention(nn.Module):\n    def __init__(self, d_in, d_out, context_length, dropout, qkv_bias=False):\n        \"\"\"\n        Args:\n            d_in: 입력 벡터의 차원 크기\n            d_out: 출력(및 쿼리/키/밸류) 벡터의 차원 크기\n            context_length: 모델이 한 번에 처리할 수 있는 최대 문맥 길이 (토큰 수)\n            dropout: 드롭아웃 확률\n            qkv_bias: 선형 레이어에 편향(bias)을 사용할지 여부\n        \"\"\"\n        super().__init__()\n        \n        # 1. 쿼리(Query), 키(Key), 밸류(Value)를 만들기 위한 선형 투영 레이어 정의\n        # 입력 벡터(d_in)를 각각의 목적에 맞는 벡터(d_out)로 변환합니다.\n        # TODO: Q/K/V 투영 레이어 타입과 인자를 채우세요.\n        # 힌트: 입력 d_in, 출력 d_out을 사용하는 Linear 레이어를 선언하세요.\n        # [기출 변형 유력] 입력 차원 d_in을 출력 차원 d_out으로 선형 투영하는 Query 가중치 층 정의 (bias=qkv_bias)\n        self.W_query = [[BLANK:blank-ch3-w-query]]\n        self.W_key   = nn.Linear(d_in, d_out, bias=qkv_bias)\n        self.W_value = nn.Linear(d_in, d_out, bias=qkv_bias)\n\n        # 2. 과적합(Overfitting) 방지를 위한 드롭아웃 설정\n        self.dropout = nn.Dropout(dropout)\n\n        # 3. 인과적 마스크(Causal Mask) 생성 및 버퍼 등록\n        # 'register_buffer'를 사용하면 역전파(학습) 대상은 아니지만, 모델의 상태(state_dict)로 저장됩니다.\n        # torch.triu(..., diagonal=1): 대각선(0) 위쪽 삼각형 부분만 1로 채웁니다.\n        # 즉, '미래의 정보' 위치에 1을 표시하여 나중에 가릴(masking) 준비를 합니다.\n        self.register_buffer(\n            'mask', \n            torch.triu(torch.ones(context_length, context_length), diagonal=1)\n        )\n\n    def forward(self, x):\n        # x.shape: [배치 크기(b), 토큰 개수(num_tokens), 입력 차원(d_in)]\n        b, num_tokens, d_in = x.shape \n\n        # 입력 x를 통과시켜 현재 시점의 관심사(Query), 검색 대상(Key), 정보 내용(Value)을 추출합니다.\n        # region [Q, K, V 벡터 계산]\n        # TODO: Q, K, V 계산 호출 대상을 채우세요.\n        # 힌트: W_query, W_key, W_value를 각각 x에 적용하면 됩니다.\n        keys = [[BLANK:blank-key]]        # Shape: [b, num_tokens, d_out]\n        queries = self.W_query(x)   # Shape: [b, num_tokens, d_out]\n        values = self.W_value(x)    # Shape: [b, num_tokens, d_out]\n        # endregion\n\n        # Query와 Key의 내적(Dot Product)을 통해 각 토큰 간의 관련성을 구합니다.\n        # keys.transpose(1, 2): 행렬 곱을 위해 차원을 뒤집습니다. (d_out 차원끼리 곱해짐)\n        # region [어텐션 스코어(유사도) 계산]\n        # TODO: 어텐션 스코어 행렬곱 피연산자를 채우세요.\n        # 힌트: queries와 keys.transpose(1, 2)를 곱해 유사도 점수를 구합니다.\n        attn_scores = [[BLANK:blank-score]] \n        #endregion\n\n        # mask가 1인 위치(미래 시점의 토큰들)를 -무한대(-inf)로 채웁니다.\n        # 이렇게 하면 나중에 Softmax를 거칠 때 확률이 0이 되어, 미래 정보를 참조하지 못하게 됩니다.\n        # [:num_tokens, :num_tokens]: 입력 길이가 context_length보다 짧을 때를 대비해 크기를 맞춥니다.\n        # region [인과적 마스킹 (Masking) - 미래 정보 차단]\n        # TODO: 미래 시점의 어텐션 스코어를 가릴 값을 채우세요.\n        # 힌트: Softmax를 통과하면 0이 되도록 마이너스 무한대(-torch.inf)를 입력하세요.\n        # [기출 변형 유력] 미래 토큰 위치를 마스킹하기 위해 self.mask.bool()[:num_tokens, :num_tokens] 위치를 -torch.inf로 인플레이스 치환\n        [[BLANK:blank-ch3-causal-mask]] \n        # endregion\n\n        # 스케일링(/ keys.shape[-1]**0.5): 차원이 커질수록 내적 값이 커져 기울기 소실이 오는 것을 방지합니다.\n        # Softmax: 점수를 확률(0~1 사이, 합은 1)로 변환합니다.\n        # region [어텐션 가중치(Weights) 계산 및 스케일링]\n        # TODO: 어텐션 가중치 함수명을 채우세요.\n        # 힌트: 스케일 적용 후 softmax를 사용해 확률로 변환하세요.\n        # [기출 변형 유력] keys의 마지막 차원 제곱근(keys.shape[-1]**0.5)으로 스케일링한 뒤 마지막 차원(dim=-1)에 대해 Softmax 계산\n        attn_weights = [[BLANK:blank-ch3-scaled-softmax]]\n        # endregion\n\n        # 계산된 가중치 중 일부를 무작위로 0으로 만들어 모델이 특정 토큰에만 의존하는 것을 막습니다.\n        # region [드롭아웃 적용]\n        attn_weights = self.dropout(attn_weights)\n        # endregion \n\n        # 어텐션 가중치(확률)를 기반으로 Value(정보)들을 가중 합산합니다.\n        # 결과적으로 \"현재 토큰과 관련이 깊은 과거 토큰들의 정보\"가 진하게 섞인 벡터가 됩니다.\n        # region [문맥 벡터(Context Vector) 생성]\n        # TODO: 컨텍스트 벡터 계산 피연산자를 채우세요.\n        # 힌트: attn_weights와 values를 곱해 최종 컨텍스트 벡터를 얻습니다.\n        context_vec = [[BLANK:blank-context]]\n        # endregion\n        \n        return context_vec"
  },
  {
    "number": 2,
    "code_number": 2,
    "type": "code",
    "source": "import torch\n\ninputs = torch.tensor(\n  [[0.43, 0.15, 0.89], # Your     (x^1)\n   [0.55, 0.87, 0.66], # journey  (x^2)\n   [0.57, 0.85, 0.64], # starts   (x^3)\n   [0.22, 0.58, 0.33], # with     (x^4)\n   [0.77, 0.25, 0.10], # one      (x^5)\n   [0.05, 0.80, 0.55]] # step     (x^6)\n)\n\nd_in = inputs.shape[1]   # 입력 차원 (d=3)\nd_out = 2                # Q, K, V의 출력 차원 (d=2)\n\nbatch = torch.stack((inputs, inputs), dim=0)\n# --- 실행 예시 ---\ntorch.manual_seed(123)\n\n# 가정: batch 변수가 이미 정의되어 있다고 가정 (예: b=2, num_tokens=6, d_in=...)\n# context_length는 모델이 허용하는 최대 길이이므로, 현재 배치의 길이와 같거나 더 길게 설정합니다.\ncontext_length = batch.shape[1] \n\nprint(\"context_length:\", context_length)\n\n# TODO: 어텐션 모듈 호출 대상을 채우세요.\n# 힌트: 직전에 생성한 CausalAttention 인스턴스(ca)를 호출하면 됩니다.\nca = CausalAttention(d_in, d_out, context_length, 0.0)\ncontext_vecs = ca(batch)\n\nprint(context_vecs)\nprint(\"context_vecs.shape:\", context_vecs.shape)"
  },
  {
    "number": 3,
    "code_number": 3,
    "type": "code",
    "source": "class MultiHeadAttentionWrapper(nn.Module):\n\n    def __init__(self, d_in, d_out, context_length, dropout, num_heads, qkv_bias=False):\n        super().__init__()\n        self.heads = nn.ModuleList(\n            [CausalAttention(d_in, d_out, context_length, dropout, qkv_bias) \n             for _ in range(num_heads)]\n        )\n\n    def forward(self, x):\n        return torch.cat([head(x) for head in self.heads], dim=-1)\n\n\ntorch.manual_seed(123)\n\ncontext_length = batch.shape[1] # This is the number of tokens\nd_in, d_out = 3, 2\nmha = MultiHeadAttentionWrapper(\n    d_in, d_out, context_length, 0.0, num_heads=2\n)\n\ncontext_vecs = mha(batch)\n\nprint(context_vecs)\nprint(\"context_vecs.shape:\", context_vecs.shape)"
  },
  {
    "number": 4,
    "code_number": 4,
    "type": "code",
    "source": "class MultiHeadAttention(nn.Module):\n    def __init__(self, d_in, d_out, context_length, dropout, num_heads, qkv_bias=False):\n        super().__init__()\n        assert (d_out % num_heads == 0), \\\n            \"d_out must be divisible by num_heads\"\n\n        self.d_out = d_out\n        self.num_heads = num_heads\n        # [기출 변형 유력] 전체 출력 차원(d_out)을 헤드 수(num_heads)로 정수 나눗셈하여 개별 헤드 차원(head_dim) 계산\n        self.head_dim = [[BLANK:blank-ch3-mha-headdim]]\n\n        self.W_query = nn.Linear(d_in, d_out, bias=qkv_bias)\n        self.W_key = nn.Linear(d_in, d_out, bias=qkv_bias)\n        self.W_value = nn.Linear(d_in, d_out, bias=qkv_bias)\n        self.out_proj = nn.Linear(d_out, d_out)  # Linear layer to combine head outputs\n        self.dropout = nn.Dropout(dropout)\n        self.register_buffer(\n            \"mask\",\n            torch.triu(torch.ones(context_length, context_length),\n                       diagonal=1)\n        )\n\n    def forward(self, x):\n        b, num_tokens, d_in = x.shape\n        # As in `CausalAttention`, for inputs where `num_tokens` exceeds `context_length`, \n        # this will result in errors in the mask creation further below. \n        # In practice, this is not a problem since the LLM (chapters 4-7) ensures that inputs  \n        # do not exceed `context_length` before reaching this forward method.\n\n        keys = self.W_key(x) # Shape: (b, num_tokens, d_out)\n        queries = self.W_query(x)\n        values = self.W_value(x)\n\n        # We implicitly split the matrix by adding a `num_heads` dimension\n        # Unroll last dim: (b, num_tokens, d_out) -> (b, num_tokens, num_heads, head_dim)\n        keys = [[BLANK:blank-mha-keys-view]] \n        values = [[BLANK:blank-mha-values-view]]\n        queries = [[BLANK:blank-mha-queries-view]]\n\n        # Transpose: (b, num_tokens, num_heads, head_dim) -> (b, num_heads, num_tokens, head_dim)\n        keys = [[BLANK:blank-mha-keys-transpose]]\n        queries = queries.transpose(1, 2)\n        values = values.transpose(1, 2)\n\n        # [기출 변형 유력] 헤드별로 분할된 queries(b, num_heads, num_tokens, head_dim)와 keys의 마지막 두 차원 전치(transpose(2, 3))를 행렬곱\n        attn_scores = [[BLANK:blank-ch3-mha-scores]]\n\n        # Original mask truncated to the number of tokens and converted to boolean\n        mask_bool = self.mask.bool()[:num_tokens, :num_tokens]\n\n        # Use the mask to fill attention scores\n        attn_scores.masked_fill_(mask_bool, -torch.inf)\n        \n        attn_weights = torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)\n        attn_weights = self.dropout(attn_weights)\n\n        # Shape: (b, num_tokens, num_heads, head_dim)\n        context_vec = (attn_weights @ values).transpose(1, 2) \n        \n        # Combine heads, where self.d_out = self.num_heads * self.head_dim\n        context_vec = [[BLANK:blank-mha-concat-view]]\n        context_vec = self.out_proj(context_vec) # optional projection\n\n        return context_vec\n\ntorch.manual_seed(123)\n\nbatch_size, context_length, d_in = batch.shape\nd_out = 2\nmha = MultiHeadAttention(d_in, d_out, context_length, 0.0, num_heads=2)\n\ncontext_vecs = mha(batch)\n\nprint(context_vecs)\nprint(\"context_vecs.shape:\", context_vecs.shape)"
  },
  {
    "number": 5,
    "code_number": null,
    "type": "markdown",
    "source": "<img src=\"llm_from_scratch/images/llm_from_scratch/ch03_compressed/26.webp\" width=\"600px\">"
  },
  {
    "number": 6,
    "code_number": null,
    "type": "markdown",
    "source": "## Simulation\n- https://poloclub.github.io/transformer-explainer/\n- https://bbycroft.net/llm"
  },
  {
    "number": 7,
    "code_number": null,
    "type": "markdown",
    "source": ""
  }
];
window.SUBJECTIVE_BLANKS = [
  {
    "id": "blank-ch3-w-query",
    "label": "🟣 기출 변형 유력 · CausalAttention Query 선형 투영 층 정의",
    "hint": "nn.Linear(d_in, d_out, bias=qkv_bias)로 Query 투영 행렬을 정의합니다.",
    "answer": "nn.Linear(d_in, d_out, bias=qkv_bias)"
  },
  {
    "id": "blank-key",
    "label": "Key 투영",
    "answer": "self.W_key(x)"
  },
  {
    "id": "blank-score",
    "label": "Q·K 내적 점수",
    "answer": "queries @ keys.transpose(1, 2)"
  },
  {
    "id": "blank-ch3-causal-mask",
    "label": "🟣 기출 변형 유력 · Causal Mask 인플레이스 적용(masked_fill_)",
    "hint": "attn_scores.masked_fill_(self.mask.bool()[:num_tokens, :num_tokens], -torch.inf)를 호출해 상삼각 영역을 음의 무한대로 채웁니다.",
    "answer": "attn_scores.masked_fill_(self.mask.bool()[:num_tokens, :num_tokens], -torch.inf)"
  },
  {
    "id": "blank-ch3-scaled-softmax",
    "label": "🟣 기출 변형 유력 · Scaled Dot-Product Softmax 가중치 계산",
    "hint": "torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)로 스케일링된 어텐션 확률 분포를 구합니다.",
    "answer": "torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)"
  },
  {
    "id": "blank-context",
    "label": "Value 가중합",
    "answer": "attn_weights @ values"
  },
  {
    "id": "blank-ch3-mha-headdim",
    "label": "🟣 기출 변형 유력 · MultiHeadAttention 개별 헤드 차원(head_dim) 계산",
    "hint": "전체 출력 차원 d_out을 헤드 개수 num_heads로 정수 나눗셈(//)합니다.",
    "answer": "d_out // num_heads"
  },
  {
    "id": "blank-mha-keys-view",
    "label": "🔴 2026-09 기출 1-1 · MHA keys 헤드 분할 (view)",
    "answer": "keys.view(b, num_tokens, self.num_heads, self.head_dim)"
  },
  {
    "id": "blank-mha-values-view",
    "label": "🔴 2026-09 기출 1-2 · MHA values 헤드 분할 (view)",
    "answer": "values.view(b, num_tokens, self.num_heads, self.head_dim)"
  },
  {
    "id": "blank-mha-queries-view",
    "label": "🔴 2026-09 기출 1-3 · MHA queries 헤드 분할 (view)",
    "answer": "queries.view(b, num_tokens, self.num_heads, self.head_dim)"
  },
  {
    "id": "blank-mha-keys-transpose",
    "label": "🔴 2026-09 기출 1-4 · MHA 헤드 축 전치 (transpose)",
    "answer": "keys.transpose(1, 2)"
  },
  {
    "id": "blank-ch3-mha-scores",
    "label": "🟣 기출 변형 유력 · Multi-Head Q·K^T 어텐션 스코어 행렬곱",
    "hint": "4차원 텐서 (b, num_heads, num_tokens, head_dim)에서 마지막 두 차원(2번과 3번)을 전치한 keys.transpose(2, 3)와 queries를 행렬곱(@)합니다.",
    "answer": "queries @ keys.transpose(2, 3)"
  },
  {
    "id": "blank-mha-concat-view",
    "label": "🔴 2026-09 기출 1-5 · MHA 헤드 재결합 (contiguous view)",
    "answer": "context_vec.contiguous().view(b, num_tokens, self.d_out)"
  }
];
window.SUBJECTIVE_EXAM_DATA = {
  "page": "llm_chapter_3_subjective_test",
  "cells": [
    {
      "number": 1,
      "code_number": 1,
      "type": "code",
      "source": "### 중요: 이 코드는 인과적 어텐션 메커니즘을 구현한 PyTorch 모듈입니다.\nimport torch\nimport torch.nn as nn\n\nclass CausalAttention(nn.Module):\n    def __init__(self, d_in, d_out, context_length, dropout, qkv_bias=False):\n        \"\"\"\n        Args:\n            d_in: 입력 벡터의 차원 크기\n            d_out: 출력(및 쿼리/키/밸류) 벡터의 차원 크기\n            context_length: 모델이 한 번에 처리할 수 있는 최대 문맥 길이 (토큰 수)\n            dropout: 드롭아웃 확률\n            qkv_bias: 선형 레이어에 편향(bias)을 사용할지 여부\n        \"\"\"\n        super().__init__()\n        \n        # 1. 쿼리(Query), 키(Key), 밸류(Value)를 만들기 위한 선형 투영 레이어 정의\n        # 입력 벡터(d_in)를 각각의 목적에 맞는 벡터(d_out)로 변환합니다.\n        # TODO: Q/K/V 투영 레이어 타입과 인자를 채우세요.\n        # 힌트: 입력 d_in, 출력 d_out을 사용하는 Linear 레이어를 선언하세요.\n        # [기출 변형 유력] 입력 차원 d_in을 출력 차원 d_out으로 선형 투영하는 Query 가중치 층 정의 (bias=qkv_bias)\n        self.W_query = [[BLANK:blank-ch3-w-query]]\n        self.W_key   = nn.Linear(d_in, d_out, bias=qkv_bias)\n        self.W_value = nn.Linear(d_in, d_out, bias=qkv_bias)\n\n        # 2. 과적합(Overfitting) 방지를 위한 드롭아웃 설정\n        self.dropout = nn.Dropout(dropout)\n\n        # 3. 인과적 마스크(Causal Mask) 생성 및 버퍼 등록\n        # 'register_buffer'를 사용하면 역전파(학습) 대상은 아니지만, 모델의 상태(state_dict)로 저장됩니다.\n        # torch.triu(..., diagonal=1): 대각선(0) 위쪽 삼각형 부분만 1로 채웁니다.\n        # 즉, '미래의 정보' 위치에 1을 표시하여 나중에 가릴(masking) 준비를 합니다.\n        self.register_buffer(\n            'mask', \n            torch.triu(torch.ones(context_length, context_length), diagonal=1)\n        )\n\n    def forward(self, x):\n        # x.shape: [배치 크기(b), 토큰 개수(num_tokens), 입력 차원(d_in)]\n        b, num_tokens, d_in = x.shape \n\n        # 입력 x를 통과시켜 현재 시점의 관심사(Query), 검색 대상(Key), 정보 내용(Value)을 추출합니다.\n        # region [Q, K, V 벡터 계산]\n        # TODO: Q, K, V 계산 호출 대상을 채우세요.\n        # 힌트: W_query, W_key, W_value를 각각 x에 적용하면 됩니다.\n        keys = [[BLANK:blank-key]]        # Shape: [b, num_tokens, d_out]\n        queries = self.W_query(x)   # Shape: [b, num_tokens, d_out]\n        values = self.W_value(x)    # Shape: [b, num_tokens, d_out]\n        # endregion\n\n        # Query와 Key의 내적(Dot Product)을 통해 각 토큰 간의 관련성을 구합니다.\n        # keys.transpose(1, 2): 행렬 곱을 위해 차원을 뒤집습니다. (d_out 차원끼리 곱해짐)\n        # region [어텐션 스코어(유사도) 계산]\n        # TODO: 어텐션 스코어 행렬곱 피연산자를 채우세요.\n        # 힌트: queries와 keys.transpose(1, 2)를 곱해 유사도 점수를 구합니다.\n        attn_scores = [[BLANK:blank-score]] \n        #endregion\n\n        # mask가 1인 위치(미래 시점의 토큰들)를 -무한대(-inf)로 채웁니다.\n        # 이렇게 하면 나중에 Softmax를 거칠 때 확률이 0이 되어, 미래 정보를 참조하지 못하게 됩니다.\n        # [:num_tokens, :num_tokens]: 입력 길이가 context_length보다 짧을 때를 대비해 크기를 맞춥니다.\n        # region [인과적 마스킹 (Masking) - 미래 정보 차단]\n        # TODO: 미래 시점의 어텐션 스코어를 가릴 값을 채우세요.\n        # 힌트: Softmax를 통과하면 0이 되도록 마이너스 무한대(-torch.inf)를 입력하세요.\n        # [기출 변형 유력] 미래 토큰 위치를 마스킹하기 위해 self.mask.bool()[:num_tokens, :num_tokens] 위치를 -torch.inf로 인플레이스 치환\n        [[BLANK:blank-ch3-causal-mask]] \n        # endregion\n\n        # 스케일링(/ keys.shape[-1]**0.5): 차원이 커질수록 내적 값이 커져 기울기 소실이 오는 것을 방지합니다.\n        # Softmax: 점수를 확률(0~1 사이, 합은 1)로 변환합니다.\n        # region [어텐션 가중치(Weights) 계산 및 스케일링]\n        # TODO: 어텐션 가중치 함수명을 채우세요.\n        # 힌트: 스케일 적용 후 softmax를 사용해 확률로 변환하세요.\n        # [기출 변형 유력] keys의 마지막 차원 제곱근(keys.shape[-1]**0.5)으로 스케일링한 뒤 마지막 차원(dim=-1)에 대해 Softmax 계산\n        attn_weights = [[BLANK:blank-ch3-scaled-softmax]]\n        # endregion\n\n        # 계산된 가중치 중 일부를 무작위로 0으로 만들어 모델이 특정 토큰에만 의존하는 것을 막습니다.\n        # region [드롭아웃 적용]\n        attn_weights = self.dropout(attn_weights)\n        # endregion \n\n        # 어텐션 가중치(확률)를 기반으로 Value(정보)들을 가중 합산합니다.\n        # 결과적으로 \"현재 토큰과 관련이 깊은 과거 토큰들의 정보\"가 진하게 섞인 벡터가 됩니다.\n        # region [문맥 벡터(Context Vector) 생성]\n        # TODO: 컨텍스트 벡터 계산 피연산자를 채우세요.\n        # 힌트: attn_weights와 values를 곱해 최종 컨텍스트 벡터를 얻습니다.\n        context_vec = [[BLANK:blank-context]]\n        # endregion\n        \n        return context_vec"
    },
    {
      "number": 2,
      "code_number": 2,
      "type": "code",
      "source": "import torch\n\ninputs = torch.tensor(\n  [[0.43, 0.15, 0.89], # Your     (x^1)\n   [0.55, 0.87, 0.66], # journey  (x^2)\n   [0.57, 0.85, 0.64], # starts   (x^3)\n   [0.22, 0.58, 0.33], # with     (x^4)\n   [0.77, 0.25, 0.10], # one      (x^5)\n   [0.05, 0.80, 0.55]] # step     (x^6)\n)\n\nd_in = inputs.shape[1]   # 입력 차원 (d=3)\nd_out = 2                # Q, K, V의 출력 차원 (d=2)\n\nbatch = torch.stack((inputs, inputs), dim=0)\n# --- 실행 예시 ---\ntorch.manual_seed(123)\n\n# 가정: batch 변수가 이미 정의되어 있다고 가정 (예: b=2, num_tokens=6, d_in=...)\n# context_length는 모델이 허용하는 최대 길이이므로, 현재 배치의 길이와 같거나 더 길게 설정합니다.\ncontext_length = batch.shape[1] \n\nprint(\"context_length:\", context_length)\n\n# TODO: 어텐션 모듈 호출 대상을 채우세요.\n# 힌트: 직전에 생성한 CausalAttention 인스턴스(ca)를 호출하면 됩니다.\nca = CausalAttention(d_in, d_out, context_length, 0.0)\ncontext_vecs = ca(batch)\n\nprint(context_vecs)\nprint(\"context_vecs.shape:\", context_vecs.shape)"
    },
    {
      "number": 3,
      "code_number": 3,
      "type": "code",
      "source": "class MultiHeadAttentionWrapper(nn.Module):\n\n    def __init__(self, d_in, d_out, context_length, dropout, num_heads, qkv_bias=False):\n        super().__init__()\n        self.heads = nn.ModuleList(\n            [CausalAttention(d_in, d_out, context_length, dropout, qkv_bias) \n             for _ in range(num_heads)]\n        )\n\n    def forward(self, x):\n        return torch.cat([head(x) for head in self.heads], dim=-1)\n\n\ntorch.manual_seed(123)\n\ncontext_length = batch.shape[1] # This is the number of tokens\nd_in, d_out = 3, 2\nmha = MultiHeadAttentionWrapper(\n    d_in, d_out, context_length, 0.0, num_heads=2\n)\n\ncontext_vecs = mha(batch)\n\nprint(context_vecs)\nprint(\"context_vecs.shape:\", context_vecs.shape)"
    },
    {
      "number": 4,
      "code_number": 4,
      "type": "code",
      "source": "class MultiHeadAttention(nn.Module):\n    def __init__(self, d_in, d_out, context_length, dropout, num_heads, qkv_bias=False):\n        super().__init__()\n        assert (d_out % num_heads == 0), \\\n            \"d_out must be divisible by num_heads\"\n\n        self.d_out = d_out\n        self.num_heads = num_heads\n        # [기출 변형 유력] 전체 출력 차원(d_out)을 헤드 수(num_heads)로 정수 나눗셈하여 개별 헤드 차원(head_dim) 계산\n        self.head_dim = [[BLANK:blank-ch3-mha-headdim]]\n\n        self.W_query = nn.Linear(d_in, d_out, bias=qkv_bias)\n        self.W_key = nn.Linear(d_in, d_out, bias=qkv_bias)\n        self.W_value = nn.Linear(d_in, d_out, bias=qkv_bias)\n        self.out_proj = nn.Linear(d_out, d_out)  # Linear layer to combine head outputs\n        self.dropout = nn.Dropout(dropout)\n        self.register_buffer(\n            \"mask\",\n            torch.triu(torch.ones(context_length, context_length),\n                       diagonal=1)\n        )\n\n    def forward(self, x):\n        b, num_tokens, d_in = x.shape\n        # As in `CausalAttention`, for inputs where `num_tokens` exceeds `context_length`, \n        # this will result in errors in the mask creation further below. \n        # In practice, this is not a problem since the LLM (chapters 4-7) ensures that inputs  \n        # do not exceed `context_length` before reaching this forward method.\n\n        keys = self.W_key(x) # Shape: (b, num_tokens, d_out)\n        queries = self.W_query(x)\n        values = self.W_value(x)\n\n        # We implicitly split the matrix by adding a `num_heads` dimension\n        # Unroll last dim: (b, num_tokens, d_out) -> (b, num_tokens, num_heads, head_dim)\n        keys = [[BLANK:blank-mha-keys-view]] \n        values = [[BLANK:blank-mha-values-view]]\n        queries = [[BLANK:blank-mha-queries-view]]\n\n        # Transpose: (b, num_tokens, num_heads, head_dim) -> (b, num_heads, num_tokens, head_dim)\n        keys = [[BLANK:blank-mha-keys-transpose]]\n        queries = queries.transpose(1, 2)\n        values = values.transpose(1, 2)\n\n        # [기출 변형 유력] 헤드별로 분할된 queries(b, num_heads, num_tokens, head_dim)와 keys의 마지막 두 차원 전치(transpose(2, 3))를 행렬곱\n        attn_scores = [[BLANK:blank-ch3-mha-scores]]\n\n        # Original mask truncated to the number of tokens and converted to boolean\n        mask_bool = self.mask.bool()[:num_tokens, :num_tokens]\n\n        # Use the mask to fill attention scores\n        attn_scores.masked_fill_(mask_bool, -torch.inf)\n        \n        attn_weights = torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)\n        attn_weights = self.dropout(attn_weights)\n\n        # Shape: (b, num_tokens, num_heads, head_dim)\n        context_vec = (attn_weights @ values).transpose(1, 2) \n        \n        # Combine heads, where self.d_out = self.num_heads * self.head_dim\n        context_vec = [[BLANK:blank-mha-concat-view]]\n        context_vec = self.out_proj(context_vec) # optional projection\n\n        return context_vec\n\ntorch.manual_seed(123)\n\nbatch_size, context_length, d_in = batch.shape\nd_out = 2\nmha = MultiHeadAttention(d_in, d_out, context_length, 0.0, num_heads=2)\n\ncontext_vecs = mha(batch)\n\nprint(context_vecs)\nprint(\"context_vecs.shape:\", context_vecs.shape)"
    },
    {
      "number": 5,
      "code_number": null,
      "type": "markdown",
      "source": "<img src=\"llm_from_scratch/images/llm_from_scratch/ch03_compressed/26.webp\" width=\"600px\">"
    },
    {
      "number": 6,
      "code_number": null,
      "type": "markdown",
      "source": "## Simulation\n- https://poloclub.github.io/transformer-explainer/\n- https://bbycroft.net/llm"
    },
    {
      "number": 7,
      "code_number": null,
      "type": "markdown",
      "source": ""
    }
  ],
  "blanks": [
    {
      "id": "blank-ch3-w-query",
      "label": "🟣 기출 변형 유력 · CausalAttention Query 선형 투영 층 정의",
      "hint": "nn.Linear(d_in, d_out, bias=qkv_bias)로 Query 투영 행렬을 정의합니다.",
      "answer": "nn.Linear(d_in, d_out, bias=qkv_bias)"
    },
    {
      "id": "blank-key",
      "label": "Key 투영",
      "answer": "self.W_key(x)"
    },
    {
      "id": "blank-score",
      "label": "Q·K 내적 점수",
      "answer": "queries @ keys.transpose(1, 2)"
    },
    {
      "id": "blank-ch3-causal-mask",
      "label": "🟣 기출 변형 유력 · Causal Mask 인플레이스 적용(masked_fill_)",
      "hint": "attn_scores.masked_fill_(self.mask.bool()[:num_tokens, :num_tokens], -torch.inf)를 호출해 상삼각 영역을 음의 무한대로 채웁니다.",
      "answer": "attn_scores.masked_fill_(self.mask.bool()[:num_tokens, :num_tokens], -torch.inf)"
    },
    {
      "id": "blank-ch3-scaled-softmax",
      "label": "🟣 기출 변형 유력 · Scaled Dot-Product Softmax 가중치 계산",
      "hint": "torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)로 스케일링된 어텐션 확률 분포를 구합니다.",
      "answer": "torch.softmax(attn_scores / keys.shape[-1]**0.5, dim=-1)"
    },
    {
      "id": "blank-context",
      "label": "Value 가중합",
      "answer": "attn_weights @ values"
    },
    {
      "id": "blank-ch3-mha-headdim",
      "label": "🟣 기출 변형 유력 · MultiHeadAttention 개별 헤드 차원(head_dim) 계산",
      "hint": "전체 출력 차원 d_out을 헤드 개수 num_heads로 정수 나눗셈(//)합니다.",
      "answer": "d_out // num_heads"
    },
    {
      "id": "blank-mha-keys-view",
      "label": "🔴 2026-09 기출 1-1 · MHA keys 헤드 분할 (view)",
      "answer": "keys.view(b, num_tokens, self.num_heads, self.head_dim)"
    },
    {
      "id": "blank-mha-values-view",
      "label": "🔴 2026-09 기출 1-2 · MHA values 헤드 분할 (view)",
      "answer": "values.view(b, num_tokens, self.num_heads, self.head_dim)"
    },
    {
      "id": "blank-mha-queries-view",
      "label": "🔴 2026-09 기출 1-3 · MHA queries 헤드 분할 (view)",
      "answer": "queries.view(b, num_tokens, self.num_heads, self.head_dim)"
    },
    {
      "id": "blank-mha-keys-transpose",
      "label": "🔴 2026-09 기출 1-4 · MHA 헤드 축 전치 (transpose)",
      "answer": "keys.transpose(1, 2)"
    },
    {
      "id": "blank-ch3-mha-scores",
      "label": "🟣 기출 변형 유력 · Multi-Head Q·K^T 어텐션 스코어 행렬곱",
      "hint": "4차원 텐서 (b, num_heads, num_tokens, head_dim)에서 마지막 두 차원(2번과 3번)을 전치한 keys.transpose(2, 3)와 queries를 행렬곱(@)합니다.",
      "answer": "queries @ keys.transpose(2, 3)"
    },
    {
      "id": "blank-mha-concat-view",
      "label": "🔴 2026-09 기출 1-5 · MHA 헤드 재결합 (contiguous view)",
      "answer": "context_vec.contiguous().view(b, num_tokens, self.d_out)"
    }
  ]
};
