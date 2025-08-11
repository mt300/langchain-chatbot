import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import { llm } from "../llm/llama3";
import { mountOrderPrompt } from "../prompts/mountOrder.prompt";
// import { StructuredOutputParser } from "@langchain/core/output_parsers";

// Defina o schema do objeto esperado
// const orderSchema = z.array(z.object({
//   item: z.string().nullable(),
//   quantidade: z.number().nullable(),
//   malha: z.string().nullable(),
//   arte: z.enum(["Sim", "Não"]).nullable(),
//   personalizacao: z.array(z.string())
// }));

// const parser = StructuredOutputParser.fromZodSchema(orderSchema);

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
    // console.log('Response', (response.content as string).replaceAll('\n',''))
    const match = (response.content as string).replaceAll('\n','').match(/\[([\s\S]*)\]/);
    // console.log('Match', match?.[0])
    if (!match) throw new Error("Nenhum JSON encontrado");
    const jsonResult = await JSON.parse(match[0]);
    // console.log('JSON RESULT', jsonResult)
    // const parsed = await parser.parse(match[0])
    // console.log('Parsed', parsed)
    return jsonResult; // Você pode parsear se quiser
  }
});






