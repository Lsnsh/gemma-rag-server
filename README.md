# gemma-rag-server

使用本地 ollama gemma 模型，实现 RAG 流程，提供 embeddings 和 RAG chat API

---

Using a local Ollama Gemma model to implement the RAG process, providing embeddings and RAG chat APIs

## Run

```
npm install
npm start
```

## API

### prepare

文本向量化，生成 `faiss` 数据库预处理文件，处理成功将返回布尔值的状态

### rag

RAG 对话，接收输入的内容，以此前预处理的文本为上下文，进行检索、增强和生成，调用成功将返回结构话的消息回复数据
