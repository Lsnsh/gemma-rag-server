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

const {
  FAISS_PREPARE_FILE_PATH,
  MOCK_DOCS_PATH,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CHUNK_OVERLAP,
} = require('../config');

/* POST prepare(generate vector db static file) listing. */
router.post('/', async function (req, res, next) {
  try {
    const isMock = req.body?.mock;
    // Get the text from the request body
    const text = req.body?.text;
    if (!text && !isMock) {
      // if body.text is not provided, return 400
      res.status(400).send({ ok: false, message: 'text is required' });
      return;
    }

    // Split the documents into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: DEFAULT_CHUNK_SIZE,
      chunkOverlap: DEFAULT_CHUNK_OVERLAP,
    });
    let splitDocs = null;
    if (text) {
      splitDocs = await splitter.createDocuments([text]);
    } else {
      // fallback to use mock docs
      const loader = new TextLoader(MOCK_DOCS_PATH);
      const docs = await loader.load();
      splitDocs = await splitter.splitDocuments(docs);
    }
    console.log(`[prepare] splitDocs:`, splitDocs);

    // TODO: may switch to use google embeddings
    const embeddings = new AlibabaTongyiEmbeddings({});

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
