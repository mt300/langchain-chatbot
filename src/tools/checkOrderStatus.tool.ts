import { z } from 'zod';
import { DynamicStructuredTool } from 'langchain/tools';

export const checkOrderStatusTool = new DynamicStructuredTool({
    name: "CheckOrderStatusTool",
    description: "Verifica o status de um pedido",
    schema: z.object({
      id: z.number().describe("ID do pedido")
    }),
    func: async ({ id }) => {
      return `Pedido #${id} está em produção.`;
    }
})