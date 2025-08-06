import { sendToHumanTool } from "./sendHuman.tool";
import { extractOrderFromChatHistoryTool } from "./extractOrderFromChatHistory.tool";
// import { RAGTool } from "./RAG.tool";

export const tools = [
  extractOrderFromChatHistoryTool,
  sendToHumanTool,
  // RAGTool
];
