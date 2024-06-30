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

文本向量化，生成 `faiss` 数据库预处理文件，处理成功将返回布尔值的状态

请求参数：

```json
{ "text": "速效救心丸使用说明书概要" }

{ "text": "", "mock": true }
```

```sh
curl -X POST \
 -H "Content-Type: application/json" \
 -d '{"text": "速效救心丸使用说明书概要：\n\n 药品名称\n 通用名称：速效救心丸\n 汉语拼音：Suxiao Jiuxin Wan\n\n 成分\n 主要成分包括川芎和冰片。\n\n 性状\n 本品通常为棕黄色的滴丸，气味清凉，味道微苦。\n\n 功能主治\n 行气活血，祛瘀止痛，增加冠脉血流量，适用于气滞血瘀型冠心病，心绞痛的治疗。\n\n 用法用量\n\n 日常预防与治疗：含服，一次 4-6 粒，一日 3 次。\n 急性发作时：一次 10-15 粒，舌下含服。\n 不良反应\n 具体不良反应尚不完全明确，但应警惕可能的个体差异反应，如出现不适应立即停药并咨询医生。\n\n 禁忌\n\n 孕妇禁用。\n 对本品过敏者禁用。\n 寒凝血瘀、阴虚血瘀、胸痹心痛等患者不宜单独使用。\n 注意事项\n\n 过敏体质者慎用。\n 药品性状发生改变时禁止使用。\n 忌食辛辣刺激性食物。\n 请放置在儿童接触不到的地方。\n 如正在使用其他药品，使用本品前需咨询医师或药师，以避免药物相互作用。\n 伴有中重度心力衰竭的心肌缺血患者慎用。\n 如果心绞痛持续发作，应及时加用硝酸酯类药物。\n 贮藏方法\n 密封，置于阴凉干燥处保存。\n\n 生产企业\n 天津中新药业集团股份有限公司第六中药厂。\n\n 批准文号\n 国药准字 Z12020025。\n\n 有效期\n 通常为 36 个月，具体以包装上标注的有效期为准。\n\n 特别提示\n\n 使用任何药物前，最好在医生指导下进行，确保安全性和适用性。\n 若有用药过量或其他紧急情况，请立即寻求医疗帮助。\n 请记住，上述信息为一般性指导，实际使用时应遵循药品包装内详细的说明书或遵医嘱。"}' \
 http://192.0.0.2:3000/prepare
```

### rag

RAG 对话，接收输入的内容，以此前预处理的文本为上下文，进行检索、增强和生成，调用成功将返回结构话的消息回复数据

请求参数：

```json
{ "id": "", "message": "你是谁？" }
```

请求示例：

```sh
curl -X POST \
 -H "Content-Type: application/json" \
 -d '{"id": "", "message": "你是谁？"}' \
 http://192.0.0.2:3000/rag
```
