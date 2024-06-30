const {
  AlibabaTongyiEmbeddings,
} = require('@langchain/community/embeddings/alibaba_tongyi');
const { FaissStore } = require('@langchain/community/vectorstores/faiss');
const { RunnableSequence } = require('@langchain/core/runnables');
const { JSONChatHistory } = require('./json-chat-history');
const { ChatOllama } = require('@langchain/community/chat_models/ollama');
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { OLLAMA_MODEL, FAISS_PREPARE_FILE_PATH } = require('../../config');

const fs = require('fs');
const path = require('path');
const join = path.posix.join;

const loadVectorStore = async (storeId) => {
  const embeddings = new AlibabaTongyiEmbeddings({});
  const directory = join(FAISS_PREPARE_FILE_PATH, storeId);
  console.log(`[rag] loadVectorStore: ${directory}`);
  const vectorstore = await FaissStore.load(directory, embeddings);
  return vectorstore;
};

const getContextRetrieverChain = (retriever) => {
  console.log(`[rag] getContextRetrieverChain`, !!retriever);
  const convertDocsToString = (documents) => {
    return documents.map((document) => document.pageContent).join('\n');
  };
  const contextRetrieverChain = RunnableSequence.from([
    (input) => input.standalone_question,
    retriever,
    convertDocsToString,
  ]);

  return contextRetrieverChain;
};

const getMessageHistory = (sessionId) => {
  const chatHistoryDir = join(__dirname, '../../chat_data');
  // 检查目录是否存在
  if (!fs.existsSync(chatHistoryDir)) {
    // 如果目录不存在，则创建目录
    fs.mkdirSync(chatHistoryDir, { recursive: true });
    console.log('[rag getMessageHistory] Directory created:', chatHistoryDir);
  }

  return new JSONChatHistory({ sessionId, dir: chatHistoryDir });
};

async function getRephraseChain() {
  const rephraseChainPrompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      '给定以下对话和一个后续问题，请将后续问题重述为一个独立的问题。请注意，重述的问题应该包含足够的信息，使得没有看过对话历史的人也能理解。',
    ],
    new MessagesPlaceholder('history'),
    ['human', '将以下问题重述为一个独立的问题：\n{question}'],
  ]);

  const rephraseChain = RunnableSequence.from([
    rephraseChainPrompt,
    new ChatOllama({
      model: OLLAMA_MODEL,
      temperature: 1,
    }),
    new StringOutputParser(),
  ]);

  return rephraseChain;
}

module.exports = {
  loadVectorStore,
  getContextRetrieverChain,
  getMessageHistory,
  getRephraseChain,
};
