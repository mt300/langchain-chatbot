// src/llm/llama3.ts
import { ChatOllama } from "@langchain/ollama";

export const llm = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "llama3:latest",
  temperature: 0,
});
