# gemma-rag-server

使用本地 ollama gemma 模型，实现 RAG 流程，提供 embeddings 和 RAG chat API

---

Using a local Ollama Gemma model to implement the RAG process, providing embeddings and RAG chat APIs

## Setup

克隆仓库：

```sh
git clone git@github.com:Lsnsh/gemma-rag-server.git
cd gemma-rag-server
```

配置本地环境变量：

```
echo "GOOGLE_API_KEY=xxx" >> .env.local
echo "ALIBABA_API_KEY=xxx" >> .env.local
```

## Run

```sh
npm install
npm start
```

## API

### prepare

**注意:** 不同的文本长度，可能需要不同的 chunkSize, chunkOverlap; 当前 `DEFAULT_CHUNK_SIZE`=20, `DEFAULT_CHUNK_OVERLAP`=10

文本向量化，生成 `faiss` 数据库预处理文件，处理成功将返回布尔值的状态

请求参数：

```ts
interface PrepareOptions {
  /* 文本数据 */
  text?: string;
  /* 启用模拟数据 */
  mock?: boolean;
}
```

请求示例：

```sh
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"text": "\n 请仔细阅读说明书并按说明使用或在\n\n 药师指导下购买和使用\n\n 警示语：运动员慎用：本品含生半夏\n\n 【成份】苍术、陈皮、厚朴（姜制）、白\n\n 芷、茯苓、大腹皮、生半夏、甘草浸膏、\n\n 广香油、紫苏叶油；辅料为干姜汁、\n\n 药用乙醇。\n\n 【性状】本品为深棕色的澄清液体\n\n （贮存略有沉淀）；味辛、苦。\n\n 【功能主治】解表化湿，理气和中。用\n\n 于外感风寒、内伤湿滞或夏伤暑湿所\n\n 致的感冒，症见头痛昏重、胸膈痞闷、\n\n 脘腹胀痛、呕吐泄泻；胃肠型感冒见上\n\n 述证候者。\n\n 【规格】每支装10毫升\n\n 【用法用量】口服。一次半支（5毫升）～\n\n 1支（10毫升），一日2次，用时摇匀。\n\n 【不良反应】详见说明书。\n\n 【禁忌】详见说明书。\n\n 【注意事项】详见说明书。\n\n 【贮藏】密封。\n\n 【包装】塑料瓶装，每支装10毫升，每\n\n 盒装10支。\n\n 【批准文号】国药准字Z11020377"}' \
     http://localhost:3000/prepare
```

响应示例：

```json
{ "ok": true, "id": "b1e7b88a-4d72-45da-8bf5-25ca5ae934c5" }
```

### rag

RAG 对话，接收输入的内容，以此前预处理的文本为上下文，进行检索、增强和生成，调用成功将返回结构话的消息回复数据

请求参数：

```ts
interface PrepareOptions {
  /* 会话 ID */
  id: string;
  /* 用户消息 */
  message: string;
}
```

请求示例：

```sh
curl -X POST \
 -H "Content-Type: application/json" \
 -d '{"id": "b1e7b88a-4d72-45da-8bf5-25ca5ae934c5", "message": "这个药品的功能主治"}' \
 http://localhost:3000/rag
```

响应示例

```
该药品的功能主治是解表化湿，理气和中。
```
