window.SUBJECTIVE_EXAM_DATA = {
  "cells": [
    {
      "number": 1,
      "code_number": null,
      "type": "markdown",
      "source": "# Base setting"
    },
    {
      "number": 2,
      "code_number": 1,
      "type": "code",
      "source": "!pip install torch # 실습 환경에선 주석처리 가능.\n!pip install torch-geometric"
    },
    {
      "number": 3,
      "code_number": 2,
      "type": "code",
      "source": "import numpy as np\nimport pandas as pd\nimport torch\nimport torch.nn as nn\nfrom torch_geometric.data import download_url, extract_zip\n\nfrom sklearn import model_selection, metrics, preprocessing\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import mean_squared_error\n\nimport random\nfrom tqdm.notebook import tqdm\nimport math\nfrom collections import defaultdict\nimport matplotlib.pyplot as plt\nfrom torch.utils.data import Dataset, DataLoader"
    },
    {
      "number": 4,
      "code_number": 3,
      "type": "code",
      "source": "# url = 'https://files.grouplens.org/datasets/movielens/ml-latest-small.zip'\n# extract_zip(download_url(url, '.'), '.')\n\n# ratings_path = './ml-latest-small/ratings.csv' # need to fix\nratings_path = '/content/ratings.csv'\ndf = pd.read_csv(ratings_path)\n\nprint(len(df)) # number of data\nprint(df['userId'].nunique()) # number of users\nprint(df['movieId'].nunique()) # number of movies"
    },
    {
      "number": 5,
      "code_number": 4,
      "type": "code",
      "source": "# need to fix\ndevice = torch.device('cuda' if torch.cuda.is_available() else 'cpu')\nprint(device)"
    },
    {
      "number": 6,
      "code_number": null,
      "type": "markdown",
      "source": "# Neural Collaborative filtering"
    },
    {
      "number": 7,
      "code_number": null,
      "type": "markdown",
      "source": "## 1. Data_preprocessing"
    },
    {
      "number": 8,
      "code_number": 5,
      "type": "code",
      "source": "# Generate Dataloader object (used as input data for model)\nclass MovieLens:\n  def __init__(self, users, movies, ratings):\n    self.users = users\n    self.movies = movies\n    self.ratings = ratings\n\n  def __len__(self):\n    return len(self.users)\n\n  def __getitem__(self,item):\n    '''\n    item = randomly selected indexes for (user,item) pairs\n    '''\n    users = self.users[item]\n    movies = self.movies[item]\n    ratings = self.ratings[item]\n    return {'users': torch.tensor(users, dtype = torch.long).to(device),\n            'movies': torch.tensor(movies, dtype = torch.long).to(device),\n            'ratings': torch.tensor(ratings, dtype=torch.long).to(device)}"
    },
    {
      "number": 9,
      "code_number": 6,
      "type": "code",
      "source": "# convert actual index for user and items as consecutive integer\nlbl_user = preprocessing.LabelEncoder()\nlbl_movie = preprocessing.LabelEncoder()\n\n# [기출 변형 유력] LabelEncoder(lbl_user)를 사용해 df.userId.values를 0부터 시작하는 연속 정수 인덱스로 적합 및 변환(fit_transform)하세요.\ndf.userId = [[BLANK:blank-ncf-label-enc]]\ndf.movieId = lbl_movie.fit_transform(df.movieId.values)\n\n# devide original dataframe into train, test dataframe (9:1)\ndf_train, df_test = model_selection.train_test_split(df, test_size=0.1, random_state=42, stratify=df.rating.values)\n\ntrain_dataset = MovieLens(users = df_train.userId.values, movies = df_train.movieId.values, ratings = df_train.rating.values)\ntest_dataset = MovieLens(users = df_test.userId.values, movies = df_test.movieId.values, ratings = df_test.rating.values)\n\nprint(len(train_dataset))\nprint(len(test_dataset))"
    },
    {
      "number": 10,
      "code_number": null,
      "type": "markdown",
      "source": "## 2. Model setting"
    },
    {
      "number": 11,
      "code_number": 7,
      "type": "code",
      "source": "### Embedding layer + NCF layer\n# 2-layer(including output layer)\n\n# hidden layer + active layer(RELU) + output\n# latent vector dim: 32\n# input dim: 64\n\nclass Neural_Collaborative_Filtering(nn.Module):\n  def __init__(self, n_users, n_movies):\n    '''\n    n_users = # of users\n    n_movies = # of movies\n    '''\n    super().__init__()\n    # convert all users and items into 32-dim learnable latent factors(vectors)\n    self.user_embedding = [[BLANK:blank-ncf-user-embedding]]\n    self.movie_embedding = nn.Embedding(n_movies, 32)\n\n    # Neural network for rating prediction\n    # [기출 변형 유력] 결합된 사용자+영화 임베딩(64차원)을 32차원 은닉 벡터로 투영하는 nn.Linear를 선언하세요.\n    self.fc1 = [[BLANK:blank-ncf-fc1]] # 64 = user_i embedding + movie_j embedding\n    self.relu = nn.ReLU()\n    self.fc2= nn.Linear(32,1)\n\n  def forward(self, users, movies, ratings = None):\n    # [기출 변형 유력] 입력된 사용자 인덱스 텐서(users)를 self.user_embedding에 통과시켜 잠재 벡터를 조회하세요.\n    user_embedding = [[BLANK:blank-ncf-user-lookup]]\n    movie_embedding = self.movie_embedding(movies)\n    input_embedding = [[BLANK:blank-ncf-concat]]\n\n    hidden_feature = self.fc1(input_embedding)\n    hidden_feature = self.relu(hidden_feature)\n\n    output = self.fc2(hidden_feature) # output is prediction\n\n    return output"
    },
    {
      "number": 12,
      "code_number": null,
      "type": "markdown",
      "source": "## 3. Training"
    },
    {
      "number": 13,
      "code_number": 8,
      "type": "code",
      "source": "# set batch\ntrain_loader = DataLoader(dataset = train_dataset, batch_size=128, shuffle=True, drop_last=False)\ntest_loader = DataLoader(dataset = test_dataset, batch_size=128, shuffle=True, drop_last = False)"
    },
    {
      "number": 14,
      "code_number": 9,
      "type": "code",
      "source": "# model instance generation\nmodel = Neural_Collaborative_Filtering(n_users = len(lbl_user.classes_), n_movies = len(lbl_movie.classes_)).to(device)\n\n# Optimizer, Objective function\noptimizer = torch.optim.Adam(model.parameters(), lr = 0.001)\nloss_func = nn.MSELoss(reduction= 'mean')"
    },
    {
      "number": 15,
      "code_number": 10,
      "type": "code",
      "source": "epochs = 10\ntotal_loss = 0\niter_cnt = 0\nall_losses_list = []\n\nmodel.train()\n\nfor epoch in range(1, epochs+1):\n  total_loss = 0\n  epoch_check = 0\n  for i, train_data in enumerate(train_loader):\n    '''\n    train_data = {'users':[], 'items':[], 'ratings':[]}\n    '''\n    batch_size = len(train_data['users'])\n    prediction = model(train_data['users'], train_data['movies'])\n    # [기출 변형 유력] 정답 평점(train_data['ratings'])을 [batch_size, -1] 모양으로 바꾼 뒤(view) torch.float32 타입으로 변환하세요.\n    ground_truth = [[BLANK:blank-ncf-gt-view]]\n\n    loss = [[BLANK:blank-ncf-loss]]\n    total_loss = total_loss + (loss.item() * batch_size)\n\n    optimizer.zero_grad()\n    loss.backward()\n    optimizer.step()\n\n    iter_cnt = iter_cnt + 1\n    epoch_check += batch_size\n\n    if iter_cnt % 100 == 0 and iter_cnt != 0:\n      avg_iter_loss = loss.item()\n      batch_num = int((iter_cnt/100) % 7) if int((iter_cnt/100) % 7) else 7\n      print(f\"epoch {epoch} - (batch {batch_num}) loss : {(avg_iter_loss)}\")\n\n\n    if epoch_check % (batch_size * len(train_loader)) == 0 and epoch_check != 0:\n      avg_loss = total_loss / epoch_check\n      print(f\"Epoch {epoch} Avg_loss : {avg_loss}\")\n      all_losses_list.append(avg_loss)"
    },
    {
      "number": 16,
      "code_number": 11,
      "type": "code",
      "source": "# Show Loss change\nplt.figure()\n\ntitle_font = {\n    'fontsize': 16,\n    'fontweight': 'bold'\n}\n\nplt.title('Loss change',fontdict=title_font)\nplt.xlabel('Epoch')\nplt.ylabel('Loss')\n\nplt.plot(all_losses_list)\nplt.show()"
    },
    {
      "number": 17,
      "code_number": null,
      "type": "markdown",
      "source": "## 4. Evaluation"
    },
    {
      "number": 18,
      "code_number": null,
      "type": "markdown",
      "source": "### RMSE"
    },
    {
      "number": 19,
      "code_number": 12,
      "type": "code",
      "source": "from sklearn.metrics import mean_squared_error\n\nmodel_output_list = []\ntarget_rating_list = []\n\nmodel.eval()\n\nwith torch.no_grad():\n  for i, batched_data in enumerate(test_loader):\n    model_output = model(batched_data['users'],batched_data['movies'])\n    model_output_batch = model_output.cpu().numpy().squeeze(axis=1).tolist()\n    model_output_list += (model_output_batch)\n\n    target_rating = batched_data['ratings']\n    target_rating_batch = target_rating.cpu().numpy().tolist()\n    target_rating_list += target_rating_batch\n\nmse = mean_squared_error(target_rating_list, model_output_list)\nrms = np.sqrt(mse)\nprint(f\"rms: {rms}\")"
    },
    {
      "number": 20,
      "code_number": null,
      "type": "markdown",
      "source": "### Recall@k & Precision@k"
    },
    {
      "number": 21,
      "code_number": 13,
      "type": "code",
      "source": "from collections import defaultdict\n\nuser_est_true = defaultdict(list)\n\nwith torch.no_grad():\n  for i, batched_data in enumerate(test_loader):\n    users = batched_data['users']\n    movies = batched_data['movies']\n    ratings = batched_data['ratings']\n\n    model_output = model(batched_data['users'], batched_data[\"movies\"])\n\n    for i in range(len(users)):\n      user_id = users[i].item()\n      movie_id = movies[i].item()\n      pred_rating = model_output[i][0].item()\n      true_rating = ratings[i].item()\n\n      user_est_true[user_id].append((pred_rating, true_rating))"
    },
    {
      "number": 22,
      "code_number": 14,
      "type": "code",
      "source": "with torch.no_grad():\n  precisions = dict()\n  recalls = dict()\n\n  # recall@K\n  k= 10\n  threshold = 3.5 # relevant item criterion\n\n  for user_id, user_ratings in user_est_true.items():\n    user_ratings.sort(key=lambda x: x[0], reverse =True)\n\n    # get the number for real relevant items = denominator of recall@k\n    n_real_relevant= sum((true_r >= threshold) for (_, true_r) in user_ratings)\n\n    # k recommended ratings\n    recommended_k = user_ratings[:k]\n\n    # get the number of recommented item that is actually relevant with real relevant.\n    n_real_relevant_in_top_k = sum((true_r >= threshold) for (est, true_r) in recommended_k)\n\n    # precision@k\n    precisions[user_id] = n_real_relevant_in_top_k / 10\n    # recall@k\n    if n_real_relevant:\n      # [기출 변형 유력] Recall@K 정의에 따라 Top-K 내 실제 적합 아이템 수(n_real_relevant_in_top_k)를 전체 실제 적합 아이템 수(n_real_relevant)로 나누세요.\n      recalls[user_id] = [[BLANK:blank-ncf-recall-k]]\n\n    else:\n      recalls[user_id] = 0"
    },
    {
      "number": 23,
      "code_number": 15,
      "type": "code",
      "source": "# Precision and recall can then be averaged over all users\nprint(f\"precision @ {k}: {sum(prec for prec in precisions.values()) / len(precisions)}\")\n\nprint(f\"recall @ {k} : {sum(rec for rec in recalls.values()) / len(recalls)}\")"
    },
    {
      "number": 24,
      "code_number": null,
      "type": "markdown",
      "source": ""
    }
  ],
  "blanks": [
    {
      "id": "blank-ncf-label-enc",
      "label": "🟣 기출 변형 유력 · 사용자 ID를 연속적인 정수 인덱스로 변환 (fit_transform)",
      "instruction": "lbl_user.fit_transform을 호출해 df.userId.values를 정수 인덱스로 변환하세요.",
      "answer": "lbl_user.fit_transform(df.userId.values)"
    },
    {
      "id": "blank-ncf-user-embedding",
      "label": "★ 유력 · 사용자 latent vector 임베딩 선언 (nn.Embedding)",
      "instruction": "사용자 수 n_users를 32차원 잠재 벡터로 매핑하는 nn.Embedding을 선언하세요.",
      "answer": "nn.Embedding(n_users, 32)"
    },
    {
      "id": "blank-ncf-fc1",
      "label": "🟣 기출 변형 유력 · 결합된 64차원(32+32) 임베딩을 32차원으로 축소하는 첫 번째 MLP 레이어 선언",
      "instruction": "입력 64차원, 출력 32차원인 nn.Linear 레이어를 작성하세요.",
      "answer": "nn.Linear(64,32)"
    },
    {
      "id": "blank-ncf-user-lookup",
      "label": "🟣 기출 변형 유력 · 입력 사용자 인덱스 텐서로 사용자 임베딩 조회 (self.user_embedding)",
      "instruction": "self.user_embedding 레이어에 users 텐서를 전달하세요.",
      "answer": "self.user_embedding(users)"
    },
    {
      "id": "blank-ncf-concat",
      "label": "★ 유력 · User·movie embedding 결합 (torch.cat)",
      "instruction": "user_embedding과 movie_embedding을 피처 차원(dim=1)으로 결합하세요.",
      "answer": "torch.cat([user_embedding, movie_embedding], dim = 1)"
    },
    {
      "id": "blank-ncf-gt-view",
      "label": "🟣 기출 변형 유력 · 정답 평점 텐서를 모델 출력과 동일한 [batch_size, -1] float32로 변환",
      "instruction": "train_data['ratings']를 .view(batch_size, -1)로 정렬한 뒤 .to(torch.float32)로 캐스팅하세요.",
      "answer": "train_data['ratings'].view(batch_size,-1).to(torch.float32)"
    },
    {
      "id": "blank-ncf-loss",
      "label": "★ 유력 · 평점 회귀 MSE Loss 계산",
      "instruction": "loss_func를 사용해 prediction과 ground_truth의 회귀 손실을 계산하세요.",
      "answer": "loss_func(prediction, ground_truth)"
    },
    {
      "id": "blank-ncf-recall-k",
      "label": "🟣 기출 변형 유력 · 사용자별 Recall@K 계산 (Top-K 내 적합 아이템 수 / 전체 적합 아이템 수)",
      "instruction": "n_real_relevant_in_top_k를 n_real_relevant로 나눈 식을 작성하세요.",
      "answer": "n_real_relevant_in_top_k / n_real_relevant"
    }
  ]
};
