var express = require('express');
var router = express.Router();

const { ChatOllama } = require('@langchain/community/chat_models/ollama');
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require('@langchain/core/prompts');
const { RunnableWithMessageHistory } = require('@langchain/core/runnables');
const { ChatMessageHistory } = require('langchain/stores/message/in_memory');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { OLLAMA_MODEL } = require('../../config');

const DEFAULT_SYSTEM_MESSAGE = [
  'system',
  'You are a helpful assistant. Answer all questions to the best of your ability. Please alaways use Chinese to communicate.',
];
const DEFAULT_SESSION_ID = 'none';

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

    // Chat with Ollama
    const model = new ChatOllama({
      model: OLLAMA_MODEL,
    });
    const prompt = ChatPromptTemplate.fromMessages([
      DEFAULT_SYSTEM_MESSAGE,
      new MessagesPlaceholder('history_message'),
      ['human', '{input}'],
    ]);
    const history = new ChatMessageHistory();
    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);
    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: (_sessionId) => history,
      inputMessagesKey: 'input',
      historyMessagesKey: 'history_message',
    });
    const sessionId = storeId || DEFAULT_SESSION_ID;
    console.log(`[rag] sessionId: ${sessionId}`);
    const chatRes = await chainWithHistory.invoke(
      {
        input: message,
      },
      {
        configurable: { sessionId: sessionId },
      }
    );

    // TODO: implement RAG

    res.send({ ok: true, message: chatRes });
  } catch (err) {
    console.log(`[rag failed] ${err}`);
    res.send({ ok: false });
  }
});

module.exports = router;
