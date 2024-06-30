const {
  AlibabaTongyiEmbeddings,
} = require('@langchain/community/embeddings/alibaba_tongyi');
const { FaissStore } = require('@langchain/community/vectorstores/faiss');
const { RunnableSequence } = require('@langchain/core/runnables');
const { JSONChatHistory } = require('./json-chat-history');
const { FAISS_PREPARE_FILE_PATH } = require('../../config');

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
  return new JSONChatHistory({ sessionId, dir: chatHistoryDir });
};

module.exports = {
  loadVectorStore,
  getContextRetrieverChain,
  getMessageHistory,
};
