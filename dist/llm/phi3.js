"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.llm = void 0;
// src/llm/phi3.ts
const ollama_1 = require("@langchain/ollama");
exports.llm = new ollama_1.ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "phi3.5:latest", // ou "phi3.5:latest"
    temperature: 0.7,
});
