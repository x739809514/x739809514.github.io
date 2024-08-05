## Glove Intro

```python
import torch
import torchtext.vocab as vocab
```
导入库，torch是pytorch, 他是一个深度学习框架，torchtext是pytorch的一个子模块

```python
from torchtext.vocab import Vectors

class newGloVe(Vectors):

    url = {
        "42B": "https://huggingface.co/stanfordnlp/glove/resolve/main/glove.42B.300d.zip",
        "840B": "https://huggingface.co/stanfordnlp/glove/resolve/main/glove.840B.300d.zip",
        "twitter.27B": "https://huggingface.co/stanfordnlp/glove/resolve/main/glove.twitter.27B.zip",
        "6B": "https://huggingface.co/stanfordnlp/glove/resolve/main/glove.6B.zip",
    }
    
    def __init__(self, name="840B", dim=300, **kwargs) -> None:
        url = self.url[name]
        print(f"Downloading from {url}")
        name = "glove.{}.{}d.txt".format(name, str(dim))
        super(newGloVe, self).__init__(name, url=url, **kwargs)
        
glove = newGloVe(name='6B', dim=100)
```
这里加载对应版本的glove，这里采用6B的模型，维度为100

```python
glove.vectors.shape
```
`glove.vectors` 是一个二维的张量，其中每一行表示一个单词的词嵌入向量。 `.shape` 属性返回一个包含两个值的元组，第一个值是词汇表中的单词数量，第二个值是每个词嵌入向量的维度。

```python
def get_embedding_vector(word):
    word_index = glove.stoi[word]
    emb = glove.vectors[word_index]
    return emb

get_embedding_vector('chess').shape
```
这里将传入的word映射到向量空间，也就是词嵌入（Word Embedding）

```python
def get_closest_words_from_word(word, max_n=5):
    word_emb = get_embedding_vector(word)
    distances = [(w, torch.dist(word_emb, get_embedding_vector(w)).cpu().item()) for w in glove.itos]
    dist_sort_filt = sorted(distances, key=lambda x: x[1])[:max_n]
    return dist_sort_filt

get_closest_words_from_word('chess')
```
这里根据获得的word embedding 计算余弦相似度相近的前五个word, 余弦相似度越趋向于1，说明语义越相近

```python
def get_closest_words_from_embedding(word_emb, max_n=5):
    distances = [(w, torch.dist(word_emb, get_embedding_vector(w)).cpu().item()) for w in glove.itos]
    dist_sort_filt = sorted(distances, key=lambda x: x[1])[:max_n]
    return dist_sort_filt
    
def get_word_analogy(word1, word2, word3, max_n=5):
    # logic w1= king, ...
    # w2 - w1 + w3 --> w4
    word1_emb = get_embedding_vector(word1)
    word2_emb = get_embedding_vector(word2)
    word3_emb = get_embedding_vector(word3)
    word4_emb = word2_emb - word1_emb + word3_emb
    analogy = get_closest_words_from_embedding(word4_emb)
    return analogy

get_word_analogy(word1='sister', word2='brother', word3='nephew')
```
这里在做语义分析，但是逻辑跟上面的是一样的，先计算word映射出来的向量，再计算向量的余弦相似度，并根据结果出于word4_emb最相近的一个向量，在转化成word，这样就能预测出我要的与sister，brother关系相近的并基于先决条件nephew的另一个单词了