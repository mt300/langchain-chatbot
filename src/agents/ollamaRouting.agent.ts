import { llm } from '../llm/llama3-groq-tool';
// import { extractOrderFromChatHistoryTool } from '../tools/extractOrderFromChatHistory.tool';
import { tools } from '../tools/index.tools'
// import { z } from 'zod';

export const llmWithTools = llm.bindTools(tools)


// export const schemaForWSO = z.object({
//     chat_history: z.array(z.string()),
//     context: z.string().describe('Trechos da base de conhecimento da empresa relevantes para montar o pedido')
// })

// export const agent = llm.withStructuredOutput(schemaForWSO, {
//     name: extractOrderFromChatHistoryTool.name,
// })


