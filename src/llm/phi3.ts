// src/llm/phi3.ts
import { ChatOllama } from "@langchain/ollama";

export const llm = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "phi3.5:latest",
  temperature: 0,
});
