// src/llm/llama3-groq-tool.ts
import { ChatOllama } from "@langchain/ollama";

export const llm = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "llama3-groq-tool-use:70b",
});
