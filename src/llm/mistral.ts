// src/llm/mistral.ts
import { ChatOllama } from "@langchain/ollama";

export const llm = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "mistral",
  temperature: 0.7,
});
