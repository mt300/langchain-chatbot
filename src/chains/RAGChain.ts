// src/chains/ragChain.ts
import { RetrievalQAChain } from "langchain/chains";
import { llm } from "../llm/openai";
import { initVectorStore } from "../vector/vectorStore";

export const createRagChain = async () => {
  const vectorStore = await initVectorStore();

  return RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever());
};
