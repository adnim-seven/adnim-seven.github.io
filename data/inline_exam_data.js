window.INLINE_EXAM_MAP = {
  "ts_practice.ipynb": {
    "page": "data_timeseries_subjective_test",
    "cells": [
      {
        "number": 1,
        "code_number": null,
        "type": "markdown",
        "source": "# Setup"
      },
      {
        "number": 2,
        "code_number": null,
        "type": "markdown",
        "source": "## Experimental Setup"
      },
      {
        "number": 3,
        "code_number": 1,
        "type": "code",
        "source": "# Math and data preprocessing libraries\nimport math\nimport pandas as pd\nimport numpy as np\nfrom sklearn.preprocessing import MinMaxScaler\n\n# For handling dataset\nimport yfinance as yf\nfrom datetime import date\n\n# For visualization\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\n# For deep learning\nimport torch\nimport torch.nn as nn\nimport torch.optim as optim\nfrom torch.utils.data import DataLoader, TensorDataset\n\n# For evaluation\nfrom sklearn.metrics \\\nimport root_mean_squared_error, mean_absolute_percentage_error"
      },
      {
        "number": 4,
        "code_number": null,
        "type": "markdown",
        "source": "## Configure GPU Settings"
      },
      {
        "number": 5,
        "code_number": 2,
        "type": "code",
        "source": "device = torch.device('cuda' if \\\n                      torch.cuda.is_available() else 'cpu')\n\nprint(device)"
      },
      {
        "number": 6,
        "code_number": null,
        "type": "markdown",
        "source": "# Data Preprocessing"
      },
      {
        "number": 7,
        "code_number": null,
        "type": "markdown",
        "source": "## Dataset Preparation"
      },
      {
        "number": 8,
        "code_number": 3,
        "type": "code",
        "source": "start_date = '2020-01-01'\nend_date = '2024-12-31'\n\ndf = yf.download('GOOG', start=start_date, end=end_date)\n\n# Inspect the data\nprint()\nprint(df.head())\nprint(df.info())"
      },
      {
        "number": 9,
        "code_number": null,
        "type": "markdown",
        "source": "## Data Visualization"
      },
      {
        "number": 10,
        "code_number": 4,
        "type": "code",
        "source": "ncols = 1\nnrows = int(round(df.shape[1] / ncols, 0))\nfig, ax = plt.subplots(nrows=nrows, ncols=ncols, \\\n                       sharex=True, figsize=(14, 7))\nfor i, ax in enumerate(fig.axes):\n    sns.lineplot(data=df.iloc[:, i], ax=ax)\n    ax.tick_params(axis=\"x\", rotation=30, \\\n                   labelsize=10, length=0)\nfig.tight_layout()\nplt.show()"
      },
      {
        "number": 11,
        "code_number": null,
        "type": "markdown",
        "source": "## Train-Test Split"
      },
      {
        "number": 12,
        "code_number": 5,
        "type": "code",
        "source": "# Train test split\ntrain_ratio = 0.8\ntraining_data_len = math.ceil(len(df) * train_ratio)\n\n# Splitting the dataset\ntrain_data = df[:training_data_len][['Open']]\ntest_data = df[training_data_len:][['Open']]\nprint(train_data.shape)\nprint(test_data.shape)\n\n# (1006, 1)\n# (251, 1)"
      },
      {
        "number": 13,
        "code_number": null,
        "type": "markdown",
        "source": "## Scaling the Data"
      },
      {
        "number": 14,
        "code_number": 6,
        "type": "code",
        "source": "# Scaling dataset\nscaler = MinMaxScaler(feature_range=(0, 1))\ntrain_scaled = scaler.fit_transform(train_data.values)\ntest_scaled = scaler.transform(test_data.values)\n\nfor v in train_data.values[:5, 0]:\n  print(f'{v:6.3f}', end=' ')\nprint()\n# 66.681 66.995 67.101 69.484 69.193\n\nfor v in train_scaled[:5, 0]:\n  print(f'{v:6.3f}', end=' ')\nprint()\n# 0.144  0.147  0.148  0.172  0.169"
      },
      {
        "number": 15,
        "code_number": null,
        "type": "markdown",
        "source": "## Sliding Window"
      },
      {
        "number": 16,
        "code_number": 7,
        "type": "code",
        "source": "sequence_length = 50  # Number of time steps to look back\n\ndef convert_data_into_tensors(data_seq):\n  features, labels = [], []\n  for i in range(len(data_seq) - sequence_length):\n      features.append(data_seq[i:i + sequence_length])\n      labels.append(data_seq[i + sequence_length, 0])\n  features, labels = np.array(features), np.array(labels)\n\n  features = torch.tensor(features, dtype=torch.float32)\n  labels = torch.tensor(labels, dtype=torch.float32)\n  return features, labels\n\nX_train, y_train = convert_data_into_tensors(train_scaled)\nX_test, y_test = convert_data_into_tensors(test_scaled)\n\nprint(X_train.shape)\nprint(y_train.shape)\nprint(X_test.shape)\nprint(y_test.shape)\n\n# torch.Size([956, 50, 1])\n# torch.Size([956])\n# torch.Size([201, 50, 1])\n# torch.Size([201])"
      },
      {
        "number": 17,
        "code_number": null,
        "type": "markdown",
        "source": "## Batching the Data"
      },
      {
        "number": 18,
        "code_number": 8,
        "type": "code",
        "source": "batch_size = 32\n\ndef to_loader(x, y, batch_size, shuffle):\n  dataset = torch.utils.data.TensorDataset(x, y)\n  return torch.utils.data.DataLoader(dataset, batch_size, shuffle)\n\ntrain_loader = to_loader(X_train, y_train, batch_size, shuffle=True)\ntest_loader = to_loader(X_test, y_test, batch_size, shuffle=False)\n\nprint(train_loader)\nprint(test_loader)\n\n# <torch.utils.data.dataloader.DataLoader object at 0x78eacd13fdd0>\n# <torch.utils.data.dataloader.DataLoader object at 0x78eacd13fd50>"
      },
      {
        "number": 19,
        "code_number": null,
        "type": "markdown",
        "source": "# Practice"
      },
      {
        "number": 20,
        "code_number": 9,
        "type": "code",
        "source": "# set random seed\n\nmanual_seed = 42\ntorch.manual_seed(manual_seed)\nnp.random.seed(manual_seed)"
      },
      {
        "number": 21,
        "code_number": null,
        "type": "markdown",
        "source": "## Model: LSTM"
      },
      {
        "number": 22,
        "code_number": 10,
        "type": "code",
        "source": "input_size = X_train.shape[-1]\nnum_layers = 2\nhidden_size = 64\n\nclass LSTMModel(nn.Module):\n    def __init__(self, input_size, hidden_size, num_layers):\n        super(LSTMModel, self).__init__()\n        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)\n        # (lstm): LSTM(1, 64, num_layers=2, batch_first=True)\n\n        self.linear = nn.Linear(hidden_size, 1)\n        # (linear): Linear(in_features=64, out_features=1, bias=True)\n\n    def forward(self, x):\n        out, _ = self.lstm(x)\n        return self.linear(out)\n\nmodel = LSTMModel(input_size, hidden_size, num_layers).to(device)\nprint(model)"
      },
      {
        "number": 23,
        "code_number": null,
        "type": "markdown",
        "source": "### Training"
      },
      {
        "number": 24,
        "code_number": 11,
        "type": "code",
        "source": "def train(model, train_loader, test_loader):\n  train_hist = []\n  test_hist = []\n  num_epochs = 10\n  loss_fn = nn.MSELoss(reduction='mean')\n  optimizer = optim.Adam(model.parameters(), lr=1e-3)\n\n  for epoch in range(num_epochs):\n    total_train_loss = 0.0\n    total_test_loss = 0.0\n\n    # train\n    model.train()\n    for batch_x, batch_y in train_loader:\n      # (1) Move input and target tensors to the device (e.g., GPU)\n      batch_x, batch_y = batch_x.to(device), batch_y.to(device)\n\n      # (2) Pass the input (batch_x) through the model\n      #     The model outputs shape [batch_size, sequence_length, 1]\n      #     Take the prediction at the last timestep (index -1) and feature index 0\n      #     👉 model(batch_x)[:, -1, 0]\n      pred = [[BLANK:blank-ts-train-pred]]\n\n      # (3) Compute the loss between pred and batch_y by using loss_fn\n      loss = loss_fn(pred, batch_y)\n\n      # (4) Clear previous gradients to avoid accumulation\n      optimizer.zero_grad()\n\n      # (5) Perform backpropagation to compute gradients\n      loss.backward()\n\n      # (6) Update the model parameters using the optimizer\n      optimizer.step()\n\n      total_train_loss += loss.item()\n\n    avg_loss = total_train_loss / len(train_loader)\n    train_hist.append(avg_loss)\n\n    # evaluate\n    model.eval()\n    with torch.no_grad():\n      for test_x, test_y in test_loader:\n        # TODO\n        # (1) Move input and target tensors to the device (e.g., GPU)\n        test_x, test_y = test_x.to(device), test_y.to(device)\n\n        # (2) Pass the input (test_x) through the model\n        #     The model outputs shape [batch_size, sequence_length, 1]\n        #     Take the prediction at the last timestep (index -1) and feature index 0\n        #     👉 model(test_x)[:, -1, 0]\n        test_pred = model(test_x)[:, -1, 0]\n\n        # (3) Compute the loss between test_pred and test_y by using loss_fn\n        test_loss = loss_fn(test_pred, test_y)\n        total_test_loss += test_loss.item()\n\n    avg_test_loss = total_test_loss / len(test_loader)\n    test_hist.append(avg_test_loss)\n\n    print(f'Epoch {epoch + 1:2d}/{num_epochs} - Training Loss: {avg_loss:.4f}, Test Loss: {avg_test_loss:.4f}')\n\n  x = np.linspace(1, num_epochs, num_epochs)\n  plt.plot(x, train_hist, scalex=True, label=\"Training loss\")\n  plt.plot(x, test_hist, label=\"Test loss\")\n  plt.legend()\n\ntrain(model, train_loader, test_loader)\n\n# Epoch  1/10 - Training Loss: 0.1736, Test Loss: 0.4874\n# Epoch  2/10 - Training Loss: 0.0388, Test Loss: 0.0877\n# Epoch  3/10 - Training Loss: 0.0078, Test Loss: 0.0072\n# Epoch  4/10 - Training Loss: 0.0031, Test Loss: 0.0097\n# Epoch  5/10 - Training Loss: 0.0023, Test Loss: 0.0123\n# Epoch  6/10 - Training Loss: 0.0020, Test Loss: 0.0188\n# Epoch  7/10 - Training Loss: 0.0020, Test Loss: 0.0111\n# Epoch  8/10 - Training Loss: 0.0021, Test Loss: 0.0165\n# Epoch  9/10 - Training Loss: 0.0018, Test Loss: 0.0225\n# Epoch 10/10 - Training Loss: 0.0017, Test Loss: 0.0177"
      },
      {
        "number": 25,
        "code_number": null,
        "type": "markdown",
        "source": "### Forecasting Visualization"
      },
      {
        "number": 26,
        "code_number": 12,
        "type": "code",
        "source": "def plot_forecasting(model, X_test, y_test):\n  model.eval()\n  num_forecast_steps = 30\n  input_data = X_test[-num_forecast_steps].cpu().numpy().squeeze()\n\n  forecasted_values = []\n  with torch.no_grad():\n    for i in range(2 * num_forecast_steps):\n      input_tensor = torch.as_tensor(input_data).view(1, -1, 1).to(device)\n      predicted = model(input_tensor)[0, -1, 0].item()\n\n      forecasted_values.append(predicted)\n      input_data = np.roll(input_data, shift=-1)\n\n      if i < num_forecast_steps:\n        input_data[-1] = y_test[-num_forecast_steps + i]\n      else:\n        input_data[-1] = predicted\n\n  df_out = df.copy()\n  last_date = df_out.index[-1]\n  future_dates = pd.date_range(start=last_date + pd.DateOffset(1), periods=num_forecast_steps)\n  combined_dates = df_out.index.append(future_dates)\n  plt.rcParams['figure.figsize'] = [14, 4]\n  plt.plot(test_data.index[-100:-30], test_data[-100:-30], label = \"test_data\", color = \"b\")\n  plt.plot(test_data.index[-30:], test_data.iloc[-30:], label='actual values', color='green')\n\n  forecasted_cases = scaler.inverse_transform(np.expand_dims(forecasted_values, axis=0)).flatten()\n  plt.plot(combined_dates[-60:], forecasted_cases, label='forecasted values', color='red')\n\n  plt.xlabel('Time Step')\n  plt.ylabel('Value')\n  plt.legend()\n  plt.title('Time Series Forecasting')\n  plt.grid(True)\n\nplot_forecasting(model, X_test, y_test)"
      },
      {
        "number": 27,
        "code_number": null,
        "type": "markdown",
        "source": "### Test"
      },
      {
        "number": 28,
        "code_number": 13,
        "type": "code",
        "source": "def test(model, X_test, y_test):\n  model.eval()\n  with torch.no_grad():\n    X_test = X_test.to(device)                     # (N, seq_len, 1)\n    y_hat = model(X_test)                          # (N, seq_len, 1)\n    test_predictions = y_hat[:, -1, 0]\n\n  test_predictions = test_predictions.cpu().numpy()\n  y_test = y_test.cpu().numpy()\n\n  rmse = root_mean_squared_error(y_test, test_predictions)\n  mape = mean_absolute_percentage_error(y_test, test_predictions)\n\n  return rmse, mape\n\nrmse, mape = test(model, X_test, y_test)\nprint(f'RMSE: {rmse:.4f}')\nprint(f'MAPE: {mape:.4f}')\n\n# RMSE: 0.1194\n# MAPE: 0.0847"
      },
      {
        "number": 29,
        "code_number": null,
        "type": "markdown",
        "source": "#Other Models: CNN, RNN"
      },
      {
        "number": 30,
        "code_number": 14,
        "type": "code",
        "source": "class Conv1DModel(nn.Module):\n  def __init__(self, input_size, hidden_size):\n    super(Conv1DModel, self).__init__()\n    self.conv1d = nn.Conv1d(in_channels=input_size, \\\n                            out_channels=hidden_size, \\\n                            kernel_size=2, stride=1)\n    self.fc = nn.Linear(hidden_size, 1)\n\n  def forward(self, x):\n    x = x.transpose(1, 2)\n    x = self.conv1d(x)\n    x = x.transpose(1, 2)\n    return self.fc(x)"
      },
      {
        "number": 31,
        "code_number": 15,
        "type": "code",
        "source": "input_size = X_train.shape[-1]\nnum_layers = 2\nhidden_size = 64\n\nmodel = Conv1DModel(input_size, hidden_size).to(device)\n\nprint(model)"
      },
      {
        "number": 32,
        "code_number": 16,
        "type": "code",
        "source": "train(model, train_loader, test_loader)"
      },
      {
        "number": 33,
        "code_number": 17,
        "type": "code",
        "source": "plot_forecasting(model, X_test, y_test)"
      },
      {
        "number": 34,
        "code_number": 18,
        "type": "code",
        "source": "rmse, mape = test(model, X_test, y_test)\nprint(f'RMSE: {rmse:.4f}')\nprint(f'MAPE: {mape:.4f}')"
      },
      {
        "number": 35,
        "code_number": 19,
        "type": "code",
        "source": "class RNNModel(nn.Module):\n  def __init__(self, input_size, hidden_size, num_layers):\n      super(RNNModel, self).__init__()\n      # TODO\n      self.rnn = [[BLANK:blank-ts-rnn]]\n      self.fc = nn.Linear(hidden_size, 1)\n\n  def forward(self, x):\n      # TODO\n      out, _ = self.rnn(x)\n      [[BLANK:blank-ts-forward]]"
      },
      {
        "number": 36,
        "code_number": 20,
        "type": "code",
        "source": "input_size = X_train.shape[-1]\nnum_layers = 2\nhidden_size = 64\n\nmodel = RNNModel(input_size, hidden_size, num_layers).to(device)\n\nprint(model)"
      },
      {
        "number": 37,
        "code_number": 21,
        "type": "code",
        "source": "train(model, train_loader, test_loader)"
      },
      {
        "number": 38,
        "code_number": 22,
        "type": "code",
        "source": "plot_forecasting(model, X_test, y_test)"
      },
      {
        "number": 39,
        "code_number": 23,
        "type": "code",
        "source": "rmse, mape = test(model, X_test, y_test)\nprint(f'RMSE: {rmse:.4f}')\nprint(f'MAPE: {mape:.4f}')\n\n# RMSE: 0.0862\n# MAPE: 0.0606"
      },
      {
        "number": 40,
        "code_number": null,
        "type": "markdown",
        "source": "# Optional (Encoder-Decoder)"
      },
      {
        "number": 41,
        "code_number": null,
        "type": "markdown",
        "source": "## Data Preprocessing"
      },
      {
        "number": 42,
        "code_number": 24,
        "type": "code",
        "source": "sequence_length = 50\ntarget_len = 10\n\ndef create_enc_dec_sequences(data):\n    features, labels = [], []\n    for i in range(len(data) - sequence_length - target_len):\n        # TODO: [2026-09 기출 1-1] 현재 시점 i부터 sequence_length 길이의 입력 시퀀스를 슬라이싱해 features에 추가하세요.\n        features.append([[BLANK:blank-ts-encdec-feat]])\n        # TODO: [2026-09 기출 1-2] 입력 시퀀스 직후(i + sequence_length)부터 target_len 길이의 타깃 구간을 슬라이싱해 labels에 추가하세요.\n        labels.append([[BLANK:blank-ts-encdec-label]])\n\n    features = np.array(features, dtype=np.float32)\n    labels = np.array(labels, dtype=np.float32)\n\n    features = torch.tensor(features, dtype=torch.float32)\n    labels = torch.tensor(labels, dtype=torch.float32)\n    return features, labels\n\nX_train_, y_train_ = create_enc_dec_sequences(train_scaled)\nX_test_, y_test_ = create_enc_dec_sequences(test_scaled)\nprint(X_train_.shape)\nprint(y_train_.shape)\nprint(X_test_.shape)\nprint(y_test_.shape)\n\ntrain_loader_ = to_loader(X_train_, y_train_, batch_size, shuffle=True)\ntest_loader_ = to_loader(X_test_, y_test_, batch_size, shuffle=False)"
      },
      {
        "number": 43,
        "code_number": null,
        "type": "markdown",
        "source": "## Encoder-Decoder Structure"
      },
      {
        "number": 44,
        "code_number": 25,
        "type": "code",
        "source": "class EncoderRNN(nn.Module):\n  def __init__(self, input_size, hidden_size, num_layers):\n    super(EncoderRNN, self).__init__()\n    self.rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)\n\n  def forward(self, x):\n    _, h = self.rnn(x)\n    return h\n\nclass DecoderRNN(nn.Module):\n  def __init__(self, input_size, hidden_size, num_layers):\n    super(DecoderRNN, self).__init__()\n    self.rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)\n    self.fc = nn.Linear(hidden_size, input_size)\n\n  def forward(self, x, h):\n    out, h = self.rnn(x, h)\n    out = self.fc(out)\n    return out, h\n\nclass RNNRNN(nn.Module):\n  def __init__(self, input_size, hidden_size, num_layers):\n    super(RNNRNN, self).__init__()\n    self.encoder = EncoderRNN(input_size, hidden_size, num_layers)\n    self.decoder = DecoderRNN(input_size, hidden_size, num_layers)\n\n  def forward(self, source, target_len):\n    # TODO: [2026-09 기출 2-1] 인코더(self.encoder)에 source를 통과시켜 문맥 은닉 상태 h를 구하세요.\n    h = [[BLANK:blank-ts-rnnrnn-enc]]\n    predictions = []\n    # TODO: [2026-09 기출 2-2] source의 마지막 타임스텝(source[:, -1, :])에 시간축(dim=1)을 추가(unsqueeze(1))해 디코더 첫 입력 [B, 1, F]을 만드세요.\n    input = [[BLANK:blank-ts-rnnrnn-init-input]]\n    for t in range(target_len):\n      # TODO: [2026-09 기출 2-3] 디코더(self.decoder)에 현재 input과 은닉 상태 h를 넣어 예측 out과 다음 은닉 상태 h를 구하세요.\n      out, h = [[BLANK:blank-ts-rnnrnn-dec-step]]\n      # TODO: [2026-09 기출 2-4] out [B, 1, F]에서 길이 1인 시간축(dim=1)을 squeeze(1)로 제거해 predictions 리스트에 추가하세요.\n      predictions.append([[BLANK:blank-ts-rnnrnn-pred-append]])\n      # TODO: [2026-09 기출 2-5] 방금 예측한 out을 다음 시점 디코더 입력 input으로 넘기세요 (Autoregressive).\n      input = [[BLANK:blank-ts-rnnrnn-autoreg]]\n    # TODO: [2026-09 기출 2-6] target_len개의 예측 텐서 리스트 predictions를 시간축(dim=1)으로 쌓아(torch.stack) [B, target_len, F] 텐서를 만드세요.\n    outputs = [[BLANK:blank-ts-rnnrnn-stack]]\n\n    return outputs\n\nmodel_ = RNNRNN(input_size, hidden_size, num_layers).to(device)\nprint(model_)\n\n# RNNRNN(\n#   (encoder): EncoderRNN(\n#     (rnn): RNN(1, 64, num_layers=2, batch_first=True)\n#   )\n#   (decoder): DecoderRNN(\n#     (rnn): RNN(1, 64, num_layers=2, batch_first=True)\n#     (fc): Linear(in_features=64, out_features=1, bias=True)\n#   )\n# )"
      },
      {
        "number": 45,
        "code_number": null,
        "type": "markdown",
        "source": "## Train"
      },
      {
        "number": 46,
        "code_number": 26,
        "type": "code",
        "source": "def train_(model, train_loader, test_loader):\n  train_hist = []\n  test_hist = []\n  num_epochs = 10\n  loss_fn = nn.MSELoss(reduction='mean')\n  optimizer = optim.Adam(model.parameters(), lr=1e-3)\n\n  for epoch in range(num_epochs):\n    total_train_loss = 0.0\n    total_test_loss = 0.0\n\n    # train\n    model.train()\n    for batch_x, batch_y in train_loader:\n      batch_x, batch_y = batch_x.to(device), batch_y.to(device)\n      pred = model(batch_x, batch_y.shape[1])\n      loss = loss_fn(pred, batch_y)\n      optimizer.zero_grad()\n      loss.backward()\n      optimizer.step()\n\n      total_train_loss += loss.item()\n\n    avg_loss = total_train_loss / len(train_loader)\n    train_hist.append(avg_loss)\n\n    # evaluate\n    model.eval()\n    with torch.no_grad():\n      for test_x, test_y in test_loader:\n        test_x, test_y = test_x.to(device), test_y.to(device)\n        test_pred = model(test_x, target_len)\n        test_loss = loss_fn(test_pred, test_y)\n        total_test_loss += test_loss.item()\n\n    avg_test_loss = total_test_loss / len(test_loader)\n    test_hist.append(avg_test_loss)\n\n    print(f'Epoch {epoch + 1:2d}/{num_epochs} - Training Loss: {avg_loss:.4f}, Test Loss: {avg_test_loss:.4f}')\n\n  x = np.linspace(1, num_epochs, num_epochs)\n  plt.plot(x, train_hist, scalex=True, label=\"Training loss\")\n  plt.plot(x, test_hist, label=\"Test loss\")\n  plt.legend()\n\ntrain_(model_, train_loader_, test_loader_)\n\n# Epoch  1/10 - Training Loss: 0.0848, Test Loss: 0.2910\n# Epoch  2/10 - Training Loss: 0.0299, Test Loss: 0.0976\n# Epoch  3/10 - Training Loss: 0.0046, Test Loss: 0.0499\n# Epoch  4/10 - Training Loss: 0.0033, Test Loss: 0.0441\n# Epoch  5/10 - Training Loss: 0.0028, Test Loss: 0.0395\n# Epoch  6/10 - Training Loss: 0.0027, Test Loss: 0.0311\n# Epoch  7/10 - Training Loss: 0.0040, Test Loss: 0.0500\n# Epoch  8/10 - Training Loss: 0.0031, Test Loss: 0.0451\n# Epoch  9/10 - Training Loss: 0.0025, Test Loss: 0.0283\n# Epoch 10/10 - Training Loss: 0.0025, Test Loss: 0.0330"
      },
      {
        "number": 47,
        "code_number": null,
        "type": "markdown",
        "source": "## Plot Forecasting"
      },
      {
        "number": 48,
        "code_number": 27,
        "type": "code",
        "source": "def plot_forecasting(model, X_test, y_test):\n    model.eval()\n    num_forecast_steps = 30\n\n    with torch.no_grad():\n        for i in range(1, min(num_forecast_steps, len(X_test)) + 1):\n            input_tensor = X_test[-i].unsqueeze(0).to(device)\n            predicted = model(input_tensor, target_len)\n            forecasted_values = predicted.squeeze(0).cpu().numpy()\n            forecasted_values = scaler.inverse_transform(\n                forecasted_values.reshape(-1, 1)\n            ).flatten()\n            idx = test_data.index[-i - target_len + 1 : -i + 1 if i > 1 else None]\n            plt.plot(idx, forecasted_values, color=\"red\", alpha=0.6,\n                     label=\"forecasted values\" if i == 1 else \"\")\n\n    plt.plot(test_data.index[-100:-39], test_data[-100:-39],\n             label=\"test_data\", color=\"b\")\n    plt.plot(test_data.index[-39:], test_data.iloc[-39:],\n             label=\"actual values\", color=\"green\")\n\n    plt.xlabel('Time Step')\n    plt.ylabel('Value')\n    plt.legend()\n    plt.title('Time Series Forecasting')\n    plt.grid(True)\n    plt.show()\n\n\nplot_forecasting(model_, X_test_, y_test_)"
      },
      {
        "number": 49,
        "code_number": null,
        "type": "markdown",
        "source": "## Test"
      },
      {
        "number": 50,
        "code_number": 28,
        "type": "code",
        "source": "def test_(model, X_test, y_test):\n  model.eval()\n  with torch.no_grad():\n    X_test = X_test.to(device)\n    y_hat = model(X_test, target_len)\n    test_predictions = y_hat[:, :, 0]\n\n  test_predictions = test_predictions.cpu().numpy()\n  y_test = y_test.cpu().numpy().reshape(-1, target_len)\n\n  rmse = root_mean_squared_error(y_test, test_predictions)\n  mape = mean_absolute_percentage_error(y_test, test_predictions)\n\n  return rmse, mape\n\nrmse, mape = test_(model_, X_test_, y_test_)\nprint(f'RMSE: {rmse:.4f}')\nprint(f'MAPE: {mape:.4f}')\n\n# RMSE: 0.2088\n# MAPE: 0.1593"
      },
      {
        "number": 51,
        "code_number": 29,
        "type": "code",
        "source": ""
      }
    ],
    "blanks": [
      {
        "id": "blank-ts-train-pred",
        "label": "마지막 시점 예측값 슬라이싱",
        "answer": "model(batch_x)[:, -1, 0]"
      },
      {
        "id": "blank-ts-rnn",
        "label": "Batch-first RNN 계층",
        "answer": "nn.RNN(input_size, hidden_size, num_layers, batch_first=True)"
      },
      {
        "id": "blank-ts-forward",
        "label": "RNN sequence output projection",
        "answer": "return self.fc(out)"
      },
      {
        "id": "blank-ts-encdec-feat",
        "label": "🔴 2026-09 기출 1-1 · Encoder 입력 시퀀스 슬라이싱 (i ~ i + sequence_length)",
        "instruction": "현재 인덱스 i부터 sequence_length 길이만큼 data를 슬라이싱해 features에 추가할 식을 작성하세요.",
        "answer": "data[i:i + sequence_length]"
      },
      {
        "id": "blank-ts-encdec-label",
        "label": "🔴 2026-09 기출 1-2 · Decoder 타깃 시퀀스 슬라이싱 (i + sequence_length ~ + target_len)",
        "instruction": "입력 시퀀스 직후(i + sequence_length)부터 target_len 길이만큼 data를 슬라이싱해 labels에 추가할 식을 작성하세요.",
        "answer": "data[i + sequence_length : i + sequence_length + target_len]"
      },
      {
        "id": "blank-ts-rnnrnn-enc",
        "label": "🔴 2026-09 기출 2-1 · RNNRNN 인코더 은닉 상태 추출 (self.encoder(source))",
        "instruction": "self.encoder에 입력 시퀀스 source를 통과시켜 초기 은닉 상태 h를 구하는 식을 작성하세요.",
        "answer": "self.encoder(source)"
      },
      {
        "id": "blank-ts-rnnrnn-init-input",
        "label": "🔴 2026-09 기출 2-2 · RNNRNN 디코더 첫 입력 생성 (source[:, -1, :].unsqueeze(1))",
        "instruction": "source의 마지막 타임스텝([:, -1, :])을 선택하고 시간축(dim=1)을 추가(.unsqueeze(1))해 [B, 1, F] 텐서를 만드세요.",
        "answer": "source[:, -1, :].unsqueeze(1)"
      },
      {
        "id": "blank-ts-rnnrnn-dec-step",
        "label": "🔴 2026-09 기출 2-3 · RNNRNN 디코더 1스텝 실행 (self.decoder(input, h))",
        "instruction": "self.decoder에 현재 입력(input)과 은닉 상태(h)를 전달해 (out, h)를 반환받는 호출식을 작성하세요.",
        "answer": "self.decoder(input, h)"
      },
      {
        "id": "blank-ts-rnnrnn-pred-append",
        "label": "🔴 2026-09 기출 2-4 · RNNRNN 예측값 시간축 제거 (out.squeeze(1))",
        "instruction": "디코더 출력 out [B, 1, F]에서 길이 1인 시간축(dim=1)을 제거(.squeeze(1))해 predictions에 추가할 식을 작성하세요.",
        "answer": "out.squeeze(1)"
      },
      {
        "id": "blank-ts-rnnrnn-autoreg",
        "label": "🔴 2026-09 기출 2-5 · RNNRNN 자기회귀 다음 입력 갱신 (input = out)",
        "instruction": "현재 타임스텝의 예측 텐서 out을 다음 타임스텝의 디코더 입력 input으로 대입할 우변 변수를 작성하세요.",
        "answer": "out"
      },
      {
        "id": "blank-ts-rnnrnn-stack",
        "label": "🔴 2026-09 기출 2-6 · RNNRNN 전체 시점 예측 병합 (torch.stack(predictions, dim=1))",
        "instruction": "target_len개의 [B, F] 텐서가 담긴 predictions 리스트를 시간축(dim=1)으로 쌓아 [B, target_len, F] 텐서를 만드는 식을 작성하세요.",
        "answer": "torch.stack(predictions, dim=1)"
      }
    ]
  },
  "RecSys_GCF_practice.ipynb": {
    "page": "data_ngcf_subjective_test",
    "cells": [
      {
        "number": 1,
        "code_number": null,
        "type": "markdown",
        "source": "# Setup"
      },
      {
        "number": 2,
        "code_number": 1,
        "type": "code",
        "source": "import torch\nimport torch.nn.functional as F\nfrom torch import nn\n\ndef format_pytorch_version(version):\n  return version.split('+')[0]\n\nTORCH_version = torch.__version__\nTORCH = format_pytorch_version(TORCH_version)\n\ndef format_cuda_version(version):\n  return 'cu' + version.replace('.', '')\n\nCUDA_version = torch.version.cuda\nCUDA = format_cuda_version(CUDA_version)\n\n!pip install torch-geometric"
      },
      {
        "number": 3,
        "code_number": 2,
        "type": "code",
        "source": "import numpy as np\nimport pandas as pd\nfrom sklearn.model_selection import train_test_split\nimport random\nfrom tqdm.notebook import tqdm\nfrom torch_geometric.data import download_url, extract_zip\nimport math\nfrom collections import defaultdict"
      },
      {
        "number": 4,
        "code_number": 3,
        "type": "code",
        "source": "device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')"
      },
      {
        "number": 5,
        "code_number": null,
        "type": "markdown",
        "source": "# Data Preprocessing"
      },
      {
        "number": 6,
        "code_number": 4,
        "type": "code",
        "source": "url = 'https://files.grouplens.org/datasets/movielens/ml-latest-small.zip'\nextract_zip(download_url(url, '.'), '.')\n\nratings_path = './ml-latest-small/ratings.csv'\nrating_df = pd.read_csv(ratings_path)\nprint(len(rating_df))\nprint(rating_df['userId'].nunique())\nprint(rating_df['movieId'].nunique())"
      },
      {
        "number": 7,
        "code_number": 5,
        "type": "code",
        "source": "# Transform UserID and MovieID into sequential indices\nuser_encoder = {user: idx for idx, user in enumerate(rating_df['userId'].unique())}\nmovie_encoder = {movie: idx for idx, movie in enumerate(rating_df['movieId'].unique())}\n\nrating_df['userId'] = rating_df['userId'].map(user_encoder)\nrating_df['movieId'] = rating_df['movieId'].map(movie_encoder)\n\nnum_users = len(user_encoder)\nnum_movies = len(movie_encoder)"
      },
      {
        "number": 8,
        "code_number": 6,
        "type": "code",
        "source": "# Set seed for better replication\ndef set_seed(seed):\n    torch.manual_seed(seed)\n    torch.cuda.manual_seed(seed)\n    torch.cuda.manual_seed_all(seed)\n    np.random.seed(seed)\n    random.seed(seed)\n    torch.backends.cudnn.deterministic = True\n    torch.backends.cudnn.benchmark = False\n\nset_seed(2025)"
      },
      {
        "number": 9,
        "code_number": null,
        "type": "markdown",
        "source": "# Create Graph from Data"
      },
      {
        "number": 10,
        "code_number": 7,
        "type": "code",
        "source": "# Create Edge for Graph\n# We generate edge between user and movie when user rates movie higher than (or equal to) 1\n# Adjacency matrix 대신 edge_index를 넣어서도 진행가능하다.\ndef create_edge_index(df, rating_threshold=1.0):\n    src, dst = [], []\n    for _, row in df.iterrows():\n        if row['rating'] >= rating_threshold:\n            src.append(row['userId'])\n            # item indices after user indices\n            dst.append(row['movieId'] + num_users)\n    return torch.tensor([src, dst], dtype=torch.long)\n\nedge_index = create_edge_index(rating_df)\nprint(edge_index)"
      },
      {
        "number": 11,
        "code_number": 8,
        "type": "code",
        "source": "# Split indices into train/val/test set (label for train/val/test set)\ntrain_indices, test_indices = train_test_split(range(edge_index.size(1)), test_size=0.2)\nval_indices, test_indices = train_test_split(test_indices, test_size=0.5)\n\ntrain_edge_index = edge_index[:, train_indices]\nval_edge_index = edge_index[:, val_indices]\ntest_edge_index = edge_index[:, test_indices]"
      },
      {
        "number": 12,
        "code_number": null,
        "type": "markdown",
        "source": "# Model: NGCF"
      },
      {
        "number": 13,
        "code_number": null,
        "type": "markdown",
        "source": "### Model Structure of NGCF\n\n<table>\n  <tr>\n    <td style=\"text-align: center;\">\n      <img src=\"https://drive.google.com/uc?id=1J0FBPjW8IhYF87hIkuLEKH6gKIlZaRI3\" height=\"200\" width=\"300\">\n      <br>\n      <span>NGCF Model</span>\n    </td>\n  </tr>\n</table>"
      },
      {
        "number": 14,
        "code_number": 9,
        "type": "code",
        "source": "### TODO : NGCF Layer 완성 ###\n\nclass NGCFLayer(nn.Module):\n    def __init__(self, input_dim, output_dim, dropout=0.1):\n        super().__init__()\n        self.W1 = nn.Linear(input_dim, output_dim)\n        self.W2 = nn.Linear(input_dim, output_dim)\n        # self.dropout = nn.Dropout(dropout)\n        self.leaky_relu = nn.LeakyReLU(0.2)\n\n    def forward(self, edge_index, node_features, user_num, item_num):\n        '''\n        edge_index : 엣지 정보 (src, dst)의 집합.\n        node_features: node별 이전 layer에서 생성된 벡터 정보가 담긴 matrix (H^(l-1)) (|V| * d)\n        '''\n\n        src, dst = edge_index # src : user, dst : movie\n\n        # calculate node degree\n        deg = torch.zeros(node_features.size(0), device=node_features.device)\n        # calculate user degree\n        deg.index_add_(0, src, torch.ones_like(src, dtype=torch.float))\n        # calculate movie degree\n        deg.index_add_(0, dst, torch.ones_like(dst, dtype=torch.float))\n\n        # calculate 1/(root(deg(u)) * root(deg(i))) for all edge\n        norm = [[BLANK:blank-ngcf-norm]]\n\n        src_feat = node_features[src] # H_u\n        dst_feat = node_features[dst] # H_i\n\n        # edge_messages for user(src) = m_(u<-i)) 결과 저장.\n        # Hint: step1. self.W1(h_i) + self.W2(h_u * h_i) 계산\n        # Hint: step2. 최종 m_(u<-i)를 위해선 앞선 norm을 앞서 계산한 message에 곱하기\n        edge_messages_for_src = self.W1(dst_feat) + self.W2(src_feat * dst_feat)\n        edge_messages_for_src *= norm.unsqueeze(1)\n\n        # edge_messages for movie(dst) = m_(i<-u)) 결과 저장.\n        # Hint: step1. self.W1(h_u) + self.W2(h_i * h_u) 계산\n        # Hint: step2. 최종 m_(i<-u)를 위해선 앞선 norm을 앞서 계산한 message에 곱하기\n        edge_messages_for_dst = [[BLANK:blank-ngcf-edge-dst]]\n        edge_messages_for_dst *= norm.unsqueeze(1)\n\n        aggregated_messages = torch.zeros_like(node_features)\n        aggregated_messages.index_add(0, src, edge_messages_for_src)\n        aggregated_messages[:user_num] += self.W1(node_features[:user_num])\n\n        # m_(i<-i) = self.W1(h_i) 계산해 더해주기\n        ## Fill this part ##\n        aggregated_messages.index_add_(0, dst, edge_messages_for_dst)\n        aggregated_messages[user_num:] += self.W1(node_features[user_num:])\n\n        aggregated_features = self.leaky_relu(aggregated_messages)\n\n        # engineering approach\n        # aggregated_features = self.dropout(aggregated_features)\n        return aggregated_features"
      },
      {
        "number": 15,
        "code_number": 10,
        "type": "code",
        "source": "### TODO: NGCF 모델 완성.\n\nclass NGCF(nn.Module):\n    def __init__(self, num_users, num_items, embedding_dim, layer_dims, dropout=0.1):\n        super().__init__()\n        self.num_users = num_users\n        self.num_items = num_items\n        self.embedding_dim = embedding_dim\n        self.node_embeddings = nn.Embedding(self.num_users+self.num_items,self.embedding_dim)\n        nn.init.xavier_uniform_(self.node_embeddings.weight)\n\n        self.layers = nn.ModuleList([\n            NGCFLayer(input_dim=(embedding_dim if i == 0 else layer_dims[i - 1]),\n                      output_dim=layer_dims[i], dropout=dropout)\n            for i in range(len(layer_dims))\n        ])\n\n    def forward(self, edge_index):\n        node_features = self.node_embeddings.weight\n        layer_outputs = [node_features]\n        for layer in self.layers:\n            node_features = layer(edge_index, node_features,self.num_users, self.num_items)\n            layer_outputs.append(node_features)\n\n        # Hint: NGCF의 final feature(representation)은 layer 별 feature에 대한 concatenated vector\n        # Hint: 최종 final feature matrix에는 [feuture_vector for users + feature_vector for items]가 들어있음.\n\n        # Hint: NGCF의 final feature(representation)은 layer 별 feature에 대한 concatenated vector\n        # Hint: 최종 final feature matrix에는 [feuture_vector for users + feature_vector for items]가 들어있음.\n        final_features = [[BLANK:blank-ngcf-concat]]\n        user_features = final_features[:self.num_users]\n        item_features = final_features[self.num_users:]\n        return user_features, item_features\n\n    def bpr_loss(self, user_emb, pos_item_emb, neg_item_emb, reg_weight=1e-4):\n        pos_scores = torch.sum(user_emb * pos_item_emb, dim=1)\n        neg_scores = torch.sum(user_emb * neg_item_emb, dim=1)\n        loss = -torch.mean(F.logsigmoid(pos_scores - neg_scores))\n        reg_loss = reg_weight * (user_emb.norm(2).pow(2) + pos_item_emb.norm(2).pow(2) \\\n                                 + neg_item_emb.norm(2).pow(2)) / user_emb.size(0)\n        return loss + reg_loss"
      },
      {
        "number": 16,
        "code_number": null,
        "type": "markdown",
        "source": "# Evaluation Function"
      },
      {
        "number": 17,
        "code_number": 11,
        "type": "code",
        "source": "def evaluate(user_features, item_features, test_edge_index, k):\n    user_pos_items = defaultdict(list)\n    E_test = test_edge_index.size(1)\n    for i in range(E_test):\n        u = test_edge_index[0, i].item()\n        it = test_edge_index[1, i].item() - num_users\n        user_pos_items[u].append(it)\n\n    recalls, precisions, ndcgs = [], [], []\n    for user, pos_items in user_pos_items.items():\n        user_emb = user_features[user]\n        scores = torch.matmul(item_features, user_emb)\n        topk_scores, topk_indices = torch.topk(scores, k=k)\n        topk_indices = topk_indices.cpu().numpy().tolist()\n\n        hits = 0\n        dcg = 0.0\n        idcg = 0.0\n        n_pos = len(pos_items)\n\n        for rank, item_idx in enumerate(topk_indices):\n            if item_idx in pos_items:\n                hits += 1\n                dcg += 1.0 / math.log2(rank + 2)\n        for rank in range(min(n_pos, k)):\n            idcg += 1.0 / math.log2(rank + 2)\n\n        recall_u = hits / n_pos\n        precision_u = hits / k\n        ndcg_u = dcg / idcg if idcg > 0 else 0.0\n\n        recalls.append(recall_u)\n        precisions.append(precision_u)\n        ndcgs.append(ndcg_u)\n\n    recall = np.mean(recalls)\n    precision = np.mean(precisions)\n    ndcg = np.mean(ndcgs)\n    return recall, precision, ndcg"
      },
      {
        "number": 18,
        "code_number": null,
        "type": "markdown",
        "source": "# Train"
      },
      {
        "number": 19,
        "code_number": 12,
        "type": "code",
        "source": "def train(model, optimizer, train_edge_index, val_edge_index, num_epochs, batch_size, device, k):\n    model.to(device)\n    train_edge_index = train_edge_index.to(device)\n    val_edge_index = val_edge_index.to(device)\n\n    for epoch in range(num_epochs):\n        model.train()\n        total_loss = 0\n        num_batches = len(train_edge_index[0]) // batch_size\n\n        for _ in range(num_batches):\n            indices = torch.randint(0, train_edge_index.size(1), (batch_size,), device=device)\n            user_indices = train_edge_index[0, indices]\n            pos_item_indices = train_edge_index[1, indices] - num_users\n            neg_item_indices = torch.randint(0, num_movies, (batch_size,), device=device)\n\n            user_features, item_features = model(train_edge_index)\n            u_emb = user_features[user_indices]\n            pos_emb = item_features[pos_item_indices]\n            neg_emb = item_features[neg_item_indices]\n\n            loss = model.bpr_loss(u_emb, pos_emb, neg_emb)\n            optimizer.zero_grad()\n            loss.backward()\n            optimizer.step()\n\n            total_loss += loss.item()\n\n        print(f\"Epoch {epoch + 1}/{num_epochs}, Training Loss: {total_loss / num_batches:.4f}\")\n\n        if (epoch + 1) % 5 == 0:\n            model.eval()\n            with torch.no_grad():\n                user_features, item_features = model(train_edge_index)\n                recall, precision, ndcg = evaluate(user_features.cpu(), item_features.cpu(), val_edge_index, k)\n                print(f\"[Validation] Epoch {epoch + 1}: Recall@{k}: {recall:.4f}, Precision@{k}: {precision:.4f}, NDCG@{k}: {ndcg:.4f}\")"
      },
      {
        "number": 20,
        "code_number": null,
        "type": "markdown",
        "source": "# Test"
      },
      {
        "number": 21,
        "code_number": 13,
        "type": "code",
        "source": "def test(model, train_edge_index, test_edge_index, k, device):\n    model.eval()\n    train_edge_index = train_edge_index.to(device)\n    test_edge_index = test_edge_index.to(device)\n\n    with torch.no_grad():\n        user_features, item_features = model(train_edge_index)\n\n    user_features = user_features.cpu()\n    item_features = item_features.cpu()\n\n    recall, precision, ndcg = evaluate(user_features, item_features, test_edge_index, k)\n    recall = round(recall, 4)\n    precision = round(precision, 4)\n    ndcg = round(ndcg, 4)\n\n    print(f\"Recall@{k}: {recall:.4f}, Precision@{k}: {precision:.4f}, NDCG@{k}: {ndcg:.4f}\")\n    return recall, precision, ndcg"
      },
      {
        "number": 22,
        "code_number": null,
        "type": "markdown",
        "source": "# Check Model Performace"
      },
      {
        "number": 23,
        "code_number": 14,
        "type": "code",
        "source": "ngcf_model = NGCF(num_users, num_movies, embedding_dim=64, layer_dims=[64, 64], dropout=0.1)\noptimizer_ngcf = torch.optim.Adam(ngcf_model.parameters(), lr=1e-3)\n\nprint(\"===== Train NGCF =====\")\ntrain(\n    model=ngcf_model,\n    optimizer=optimizer_ngcf,\n    train_edge_index=train_edge_index,\n    val_edge_index=val_edge_index,\n    num_epochs=30,\n    batch_size=1024,\n    device=device,\n    k=10\n)\n\nprint(\"===== Test NGCF =====\")\ntest(\n    model=ngcf_model,\n    train_edge_index=train_edge_index,\n    test_edge_index=test_edge_index,\n    k=10,\n    device=device\n)"
      }
    ],
    "blanks": [
      {
        "id": "blank-ngcf-norm",
        "label": "대칭 차수 정규화 계수 norm",
        "answer": "1.0/torch.sqrt(deg[src]*deg[dst])"
      },
      {
        "id": "blank-ngcf-edge-dst",
        "label": "아이템 노드 전달 메시지",
        "answer": "self.W1(src_feat) + self.W2(src_feat*dst_feat)"
      },
      {
        "id": "blank-ngcf-concat",
        "label": "전체 레이어 표현 결합",
        "answer": "torch.concat(layer_outputs,dim=-1)"
      }
    ]
  },
  "RecSys_NCF.ipynb": {
    "page": "data_ncf_subjective_test",
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
        "source": "# convert actual index for user and items as consecutive integer\nlbl_user = preprocessing.LabelEncoder()\nlbl_movie = preprocessing.LabelEncoder()\n\ndf.userId = lbl_user.fit_transform(df.userId.values)\ndf.movieId = lbl_movie.fit_transform(df.movieId.values)\n\n# devide original dataframe into train, test dataframe (9:1)\ndf_train, df_test = model_selection.train_test_split(df, test_size=0.1, random_state=42, stratify=df.rating.values)\n\ntrain_dataset = MovieLens(users = df_train.userId.values, movies = df_train.movieId.values, ratings = df_train.rating.values)\ntest_dataset = MovieLens(users = df_test.userId.values, movies = df_test.movieId.values, ratings = df_test.rating.values)\n\nprint(len(train_dataset))\nprint(len(test_dataset))"
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
        "source": "### Embedding layer + NCF layer\n# 2-layer(including output layer)\n\n# hidden layer + active layer(RELU) + output\n# latent vector dim: 32\n# input dim: 64\n\nclass Neural_Collaborative_Filtering(nn.Module):\n  def __init__(self, n_users, n_movies):\n    '''\n    n_users = # of users\n    n_movies = # of movies\n    '''\n    super().__init__()\n    # convert all users and items into 32-dim learnable latent factors(vectors)\n    self.user_embedding = [[BLANK:blank-ncf-user-embedding]]\n    self.movie_embedding = nn.Embedding(n_movies, 32)\n\n    # Neural network for rating prediction\n    self.fc1 = nn.Linear(64,32) # 64 = user_i embedding + movie_j embedding\n    self.relu = nn.ReLU()\n    self.fc2= nn.Linear(32,1)\n\n  def forward(self, users, movies, ratings = None):\n    user_embedding = self.user_embedding(users)\n    movie_embedding = self.movie_embedding(movies)\n    input_embedding = [[BLANK:blank-ncf-concat]]\n\n    hidden_feature = self.fc1(input_embedding)\n    hidden_feature = self.relu(hidden_feature)\n\n    output = self.fc2(hidden_feature) # output is prediction\n\n    return output"
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
        "source": "epochs = 10\ntotal_loss = 0\niter_cnt = 0\nall_losses_list = []\n\nmodel.train()\n\nfor epoch in range(1, epochs+1):\n  total_loss = 0\n  epoch_check = 0\n  for i, train_data in enumerate(train_loader):\n    '''\n    train_data = {'users':[], 'items':[], 'ratings':[]}\n    '''\n    batch_size = len(train_data['users'])\n    prediction = model(train_data['users'], train_data['movies'])\n    ground_truth = train_data['ratings'].view(batch_size,-1).to(torch.float32)\n\n    loss = [[BLANK:blank-ncf-loss]]\n    total_loss = total_loss + (loss.item() * batch_size)\n\n    optimizer.zero_grad()\n    loss.backward()\n    optimizer.step()\n\n    iter_cnt = iter_cnt + 1\n    epoch_check += batch_size\n\n    if iter_cnt % 100 == 0 and iter_cnt != 0:\n      avg_iter_loss = loss.item()\n      batch_num = int((iter_cnt/100) % 7) if int((iter_cnt/100) % 7) else 7\n      print(f\"epoch {epoch} - (batch {batch_num}) loss : {(avg_iter_loss)}\")\n\n\n    if epoch_check % (batch_size * len(train_loader)) == 0 and epoch_check != 0:\n      avg_loss = total_loss / epoch_check\n      print(f\"Epoch {epoch} Avg_loss : {avg_loss}\")\n      all_losses_list.append(avg_loss)"
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
        "source": "with torch.no_grad():\n  precisions = dict()\n  recalls = dict()\n\n  # recall@K\n  k= 10\n  threshold = 3.5 # relevant item criterion\n\n  for user_id, user_ratings in user_est_true.items():\n    user_ratings.sort(key=lambda x: x[0], reverse =True)\n\n    # get the number for real relevant items = denominator of recall@k\n    n_real_relevant= sum((true_r >= threshold) for (_, true_r) in user_ratings)\n\n    # k recommended ratings\n    recommended_k = user_ratings[:k]\n\n    # get the number of recommented item that is actually relevant with real relevant.\n    n_real_relevant_in_top_k = sum((true_r >= threshold) for (est, true_r) in recommended_k)\n\n    # precision@k\n    precisions[user_id] = n_real_relevant_in_top_k / 10\n    # recall@k\n    if n_real_relevant:\n      recalls[user_id] = n_real_relevant_in_top_k / n_real_relevant\n\n    else:\n      recalls[user_id] = 0"
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
        "id": "blank-ncf-user-embedding",
        "label": "사용자 latent vector",
        "answer": "nn.Embedding(n_users, 32)"
      },
      {
        "id": "blank-ncf-concat",
        "label": "User·movie embedding 결합",
        "answer": "torch.cat([user_embedding, movie_embedding], dim = 1)"
      },
      {
        "id": "blank-ncf-loss",
        "label": "평점 회귀 loss",
        "answer": "loss_func(prediction, ground_truth)"
      }
    ]
  }
};
