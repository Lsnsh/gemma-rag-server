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
const {
  OLLAMA_MODEL,
  FAISS_PREPARE_FILE_PATH,
  DEFAULT_REPHRASE_SYSTEM_MESSAGE,
  DEFAULT_HUMAN_MESSAGE_CONTENT_PREFIX,
  REPHRASE_CHAT_TEMPERATURE,
  CHAT_HISTORY_DIR
} = require('../../config');

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
  const chatHistoryPath = join(__dirname, `../../${CHAT_HISTORY_DIR}`);
  // 检查目录是否存在
  if (!fs.existsSync(chatHistoryPath)) {
    // 如果目录不存在，则创建目录
    fs.mkdirSync(chatHistoryPath, { recursive: true });
    console.log('[rag getMessageHistory] Directory created:', chatHistoryPath);
  }

  return new JSONChatHistory({ sessionId, dir: chatHistoryPath });
};

async function getRephraseChain() {
  const rephraseChainPrompt = ChatPromptTemplate.fromMessages([
    DEFAULT_REPHRASE_SYSTEM_MESSAGE,
    new MessagesPlaceholder('history'),
    ['human', `${DEFAULT_HUMAN_MESSAGE_CONTENT_PREFIX}{question}`],
  ]);

  const rephraseChain = RunnableSequence.from([
    rephraseChainPrompt,
    new ChatOllama({
      model: OLLAMA_MODEL,
      temperature: REPHRASE_CHAT_TEMPERATURE,
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
