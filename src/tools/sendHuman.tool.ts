import { DynamicStructuredTool } from "langchain/tools";
import { z } from 'zod';

export const sendToHumanTool = new DynamicStructuredTool({
    name: "SendToHumanTool",
    description: "Escala o atendimento para um atendente humano",
    schema: z.object({}),
    func: async () => {
      return "Encaminhei sua solicitação para um de nossos atendentes.";
    }
})