const OLLAMA_MODEL = 'gemma:2b';
const FAISS_PREPARE_DIR = 'db';
const TONGYI_EMBEDDINGS_MODEL_NAME = 'tongyi-text-embedding-v2';
const FAISS_PREPARE_FILE_PATH = `${FAISS_PREPARE_DIR}/${TONGYI_EMBEDDINGS_MODEL_NAME}`;
const MOCK_DOCS_PATH = 'mock/su.txt';
const DEFAULT_CHUNK_SIZE = 20;
const DEFAULT_CHUNK_OVERLAP = 10;
const DEFAULT_SYSTEM_MESSAGE = [
  'system',
  `
    你是个乐于助人的助手，精通根据作品原文详细解释和回答问题，你在回答时会引用原文。
    并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答“原文中没有相关内容”。
    请务必用中文交流。
    
    以下是原文中跟用户回答相关的内容：
    {context}
  `,
];
const DEFAULT_SESSION_ID = 'none';
const DEFAULT_REPHRASE_SYSTEM_MESSAGE = [
  'system',
  '给定以下对话和一个后续问题，请将后续问题重述为一个独立的问题。请注意，重述的问题应该包含足够的信息，使得没有看过对话历史的人也能理解。',
];
const DEFAULT_HUMAN_MESSAGE_CONTENT_PREFIX =
  '将以下问题重述为一个独立的问题：\n';
const REPHRASE_CHAT_TEMPERATURE = 0.4;

module.exports = {
  OLLAMA_MODEL,
  FAISS_PREPARE_DIR,
  TONGYI_EMBEDDINGS_MODEL_NAME,
  FAISS_PREPARE_FILE_PATH,
  MOCK_DOCS_PATH,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CHUNK_OVERLAP,
  DEFAULT_SYSTEM_MESSAGE,
  DEFAULT_SESSION_ID,
  DEFAULT_REPHRASE_SYSTEM_MESSAGE,
  DEFAULT_HUMAN_MESSAGE_CONTENT_PREFIX,
  REPHRASE_CHAT_TEMPERATURE,
};
