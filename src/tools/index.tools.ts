import { sendToHumanTool } from "./sendHuman.tool";
import { extractOrderFromChatHistoryTool } from "./extractOrderFromChatHistory.tool";
import { RAGTool } from "./RAG.tool";
import { registerClientTool } from "./registerClient.tool";
import { checkOrderStatusTool } from "./checkOrderStatus.tool";

export const tools = [
  extractOrderFromChatHistoryTool,
  registerClientTool,
  checkOrderStatusTool,
  sendToHumanTool,
  RAGTool
];
