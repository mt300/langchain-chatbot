// src/llm/gpt-oss.ts
import { ChatOllama } from "@langchain/ollama";

export const llm = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "gpt-oss:20b",
  temperature: 0,
});
