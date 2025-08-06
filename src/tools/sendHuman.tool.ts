import { DynamicStructuredTool } from "langchain/tools";
import { z } from 'zod';

export const sendToHumanTool = new DynamicStructuredTool({
    name: "SendToHumanTool",
    description: "Quando o agente não souber qual tool usar ele deve usar essa tool para escalar o atendimento para um atendente humano",
    schema: z.object({}),
    func: async () => {
      return "Encaminhei sua solicitação para um de nossos atendentes.";
    }
})