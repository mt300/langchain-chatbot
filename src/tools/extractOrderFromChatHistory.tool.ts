import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import { llm } from "../llm/mistral";
import { mountOrderPrompt } from "../prompts/mountOrder.prompt";

export const extractOrderFromChatHistoryTool = new DynamicStructuredTool({
  name: "extract_order_from_history",
  description: "Tenta extrair as informações necessárias para montar um orçamento",
  schema: z.object({
    chat_history: z.array(z.string()),
    context: z.string().describe('Trechos da base de conhecimento da empresa relevantes para montar o pedido')
    
  }),
  func: async ({chat_history, context }) => {
    console.log('Chamada da função de orçamento')
    const prompt = mountOrderPrompt({chat_history,context});
    const response = await llm.invoke(prompt);
    return response; // Você pode parsear se quiser
  }
});