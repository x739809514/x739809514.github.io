## HuggingFace 是什么
Hugging Face 是一家致力于自然语言处理（NLP）技术的公司，同时也是一个广受欢迎的开源社区平台。它提供了多种工具和库，帮助开发者和研究人员构建、训练和部署机器学习模型，特别是用于处理文本数据的模型。
- **🤗 Transformers 库**：这是 Hugging Face 最著名的库之一，提供了许多预训练的 Transformer 模型，例如 BERT、GPT、T5 等。它们可以用于各种 NLP 任务，如文本分类、生成、翻译、问答等。
- **🔧 Datasets 库**：这个库提供了大量预处理好的数据集，可以方便地用于训练和评估模型。它支持多种数据格式，并且可以轻松与 Transformers 库集成。
- **🛠️ Tokenizers 库**：用于处理文本数据的分词库，支持快速和高效的文本预处理。这对于处理大型数据集非常有用。
- **📦 Model Hub**：Hugging Face 提供了一个模型仓库，用户可以在上面发布和分享他们训练的模型，也可以从中下载他人分享的预训练模型。这个仓库包括了各种各样的模型，适用于不同的任务和语言。
- **🌐 Hub API**：Hugging Face 提供了一个简单易用的 API，可以直接在应用程序中使用预训练模型，进行推理和预测。
- **👥 社区和支持**：Hugging Face 拥有一个活跃的社区，用户可以在论坛、GitHub 和其他平台上互相交流和分享经验。

### 使用案例（一）

```python
#%% packages
from transformers import pipeline

# %% only provide task
pipe = pipeline(task="text-classification")
# %% run pipe
pipe("I like it very much.")
# %% provide model
pipe = pipeline(task="text-classification",
                model="nlptown/bert-base-multilingual-uncased-sentiment")
# %% run pipe
# consume just a string
pipe("I like it very much.")
# %% consume a list
pipe(["I like it very much.", "I hate it."])
```
`pipeline` 函数会根据你指定的任务自动加载合适的预训练模型和分词器。你只需提供任务名称和输入文本即可，这里使用pipeline加载了一个情感分析的模型，最后会通过star的个数来表示情感极性。
```
[{'label': '5 stars', 'score': 0.5000861883163452}]

[
{'label': '5 stars', 'score': 0.5000861883163452}, 
{'label': '1 star', 'score': 0.7190805077552795}
]
```

### 使用案例（二）

```python
#%% packages
from transformers import pipeline

# %% Named Entity Recognition
pipe = pipeline(task="ner")
pipe("Apple Inc. was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne on April 1, 1976, in Cupertino, California.")
```
`ner`模型可以对词性进行分类
```
[{'entity': 'I-ORG',
  'score': 0.99959284,
  'index': 1,
  'word': 'Apple',
  'start': 0,
  'end': 5},
 {'entity': 'I-ORG',
  'score': 0.9994708,
  'index': 2,
  'word': 'Inc',
  'start': 6,
  'end': 9},
 {'entity': 'I-PER',
  'score': 0.9993297,
  'index': 7,
  'word': 'Steve',
  'start': 26,
  'end': 31},
 ......
 {'entity': 'I-LOC',
  'score': 0.998528,
  'index': 31,
  'word': 'California',
  'start': 102,
  'end': 112}]
```

### 使用案例（三）

```python
#%% packages
from transformers import pipeline

# %% Question Answering
pipe = pipeline("question-answering")
pipe(context="The Big Apple is a nickname for New York City.", question="What is the Big Apple?")
```
问答模型，output：
```
{
 'score': 0.6228488683700562,
 'start': 17,
 'end': 45,
 'answer': 'a nickname for New York City'
 }
```