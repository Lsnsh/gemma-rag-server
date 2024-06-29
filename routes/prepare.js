var express = require('express');
var router = express.Router();

const { TextLoader } = require('langchain/document_loaders/fs/text');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const {
  AlibabaTongyiEmbeddings,
} = require('@langchain/community/embeddings/alibaba_tongyi');

// TODO: switch to POST method
/* GET prepare(generate vector db static file) listing. */
router.get('/', async function (req, res, next) {
  // TODO: use input from request
  const loader = new TextLoader('logs/su.txt');
  const docs = await loader.load();

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

  // TODO: response json instead of text
  res.send('ok');
});

module.exports = router;
