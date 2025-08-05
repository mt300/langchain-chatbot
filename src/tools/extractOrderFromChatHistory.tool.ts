import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import { llm } from "../llm/mistral";
import { mountOrderPrompt } from "../prompts/mountOrder.prompt";

export const extractOrderFromChatHistoryTool = new DynamicStructuredTool({
  name: "extract_order_from_history",
  description: "Extrai pedidos de orçamento a partir do histórico de mensagens do cliente.",
  schema: z.object({
    chat_history: z.array(z.string())
  }),
  func: async ({ chat_history }) => {
    const prompt = mountOrderPrompt(chat_history.join('\n'));
    const response = await llm.invoke(prompt);
    return response; // Você pode parsear se quiser
  }
});