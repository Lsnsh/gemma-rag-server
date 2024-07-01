var express = require('express');
var router = express.Router();

const { ChatOllama } = require('@langchain/community/chat_models/ollama');
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require('@langchain/core/prompts');
const {
  RunnableWithMessageHistory,
  RunnableSequence,
  RunnablePassthrough,
} = require('@langchain/core/runnables');
const { ChatMessageHistory } = require('langchain/stores/message/in_memory');
const { StringOutputParser } = require('@langchain/core/output_parsers');

const {
  OLLAMA_MODEL,
  DEFAULT_SYSTEM_MESSAGE,
  DEFAULT_SESSION_ID,
} = require('../../config');
const {
  loadVectorStore,
  getContextRetrieverChain,
  getMessageHistory,
  getRephraseChain,
} = require('./shared');

/* POST RAG listing. */
router.post('/', async function (req, res, next) {
  try {
    // Get the id from request body
    const storeId = req.body?.id;
    // Get the message from request body
    const message = req.body?.message;
    if (!message) {
      // if body.message is not provided, return 400
      res.status(400).send({ ok: false, message: 'message is required' });
      return;
    }
    console.log(`[rag] id: ${storeId}, message: ${message}`);

    const vectorStore = await loadVectorStore(storeId);
    const vectorStoreRetriever = vectorStore.asRetriever(2);
    const contextRetrieverChain =
      getContextRetrieverChain(vectorStoreRetriever);

    // Chat with Ollama
    const model = new ChatOllama({
      model: OLLAMA_MODEL,
      verbose: true,
    });
    const prompt = ChatPromptTemplate.fromMessages([
      DEFAULT_SYSTEM_MESSAGE,
      new MessagesPlaceholder('history'),
      ['human', '{standalone_question}'],
    ]);
    const history = new ChatMessageHistory();
    const rephraseChain = await getRephraseChain(history);
    const chain = RunnableSequence.from([
      RunnablePassthrough.assign({
        standalone_question: rephraseChain,
      }),
      RunnablePassthrough.assign({
        context: contextRetrieverChain,
      }),
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory,
      historyMessagesKey: 'history',
      inputMessagesKey: 'question',
    });
    const sessionId = storeId || DEFAULT_SESSION_ID;
    console.log(`[rag] sessionId: ${sessionId}`);
    const chatRes = await chainWithHistory.invoke(
      {
        question: message,
      },
      {
        configurable: { sessionId: sessionId },
      }
    );

    // TODO: support stream response and no stream response
    for await (const chunk of chatRes) {
      console.log(`[rag response] chunk: ${chunk}`);
      res.write(chunk);
    }
    res.end();

    // res.send({ ok: true, message: chatRes });
  } catch (err) {
    console.log(`[rag failed] ${err}`);
    res.send({ ok: false });
  }
});

module.exports = router;
