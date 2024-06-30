const {
  AlibabaTongyiEmbeddings,
} = require('@langchain/community/embeddings/alibaba_tongyi');
const { FaissStore } = require('@langchain/community/vectorstores/faiss');
const { FAISS_PREPARE_FILE_PATH } = require('../../config');

const loadVectorStore = async (storeId) => {
  const embeddings = new AlibabaTongyiEmbeddings({});
  const directory = join(FAISS_PREPARE_FILE_PATH, storeId);
  const vectorstore = await FaissStore.load(directory, embeddings);
  return vectorstore;
};

module.exports = {
  loadVectorStore,
};
