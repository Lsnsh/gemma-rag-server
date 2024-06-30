const express = require('express');
const router = express.Router();

const path = require('path');
const join = path.posix.join;

const { v4: uuidv4 } = require('uuid');

const { TextLoader } = require('langchain/document_loaders/fs/text');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const {
  AlibabaTongyiEmbeddings,
} = require('@langchain/community/embeddings/alibaba_tongyi');
const { FaissStore } = require('@langchain/community/vectorstores/faiss');

const MOCK_DOCS_PATH = 'mock/su.txt';
const FAISS_PREPARE_DIR = 'db';
const TONGYI_EMBEDDINGS_MODEL_NAME = 'tongyi-text-embedding-v2';
const FAISS_PREPARE_FILE_PATH = `${FAISS_PREPARE_DIR}/${TONGYI_EMBEDDINGS_MODEL_NAME}`;

// TODO: switch to POST method
/* GET prepare(generate vector db static file) listing. */
router.get('/', async function (req, res, next) {
  try {
    // TODO: use input from request
    const loader = new TextLoader(MOCK_DOCS_PATH);
    const docs = await loader.load();

    // Split the documents into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 20,
      chunkOverlap: 10,
    });
    const splitDocs = await splitter.splitDocuments(docs);
    console.log(splitDocs);

    // TODO: may switch to use google embeddings
    const embeddings = new AlibabaTongyiEmbeddings({});
    const embeddingsRes = await embeddings.embedQuery(splitDocs[0].pageContent);
    console.log(embeddingsRes);

    // Save the vector store
    const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
    const storeId = uuidv4();
    const directory = join(FAISS_PREPARE_FILE_PATH, storeId);
    await vectorStore.save(directory);

    res.send({ ok: true, id: storeId });
  } catch (err) {
    console.log(`[prepare failed] ${err}`);
    res.send({ ok: false });
  }
});

module.exports = router;
