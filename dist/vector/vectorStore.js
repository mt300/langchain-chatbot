"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorStore = void 0;
// src/vector/vectorStore.ts
const chroma_1 = require("@langchain/community/vectorstores/chroma");
const ollama_1 = require("@langchain/ollama");
const embeddings = new ollama_1.OllamaEmbeddings({
    model: "mxbai-embed-large", // Default value
    baseUrl: "http://localhost:11434", // Default value
});
exports.vectorStore = new chroma_1.Chroma(embeddings, {
    collectionName: "a-test-collection",
});
