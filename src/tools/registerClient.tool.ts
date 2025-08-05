import { DynamicStructuredTool } from "langchain/tools";
import { z } from 'zod';

export const registerClientTool = new DynamicStructuredTool({
    name: "RegisterClientTool",
    description: "Faz o cadastro do cliente no sistema",
    schema: z.object({
      input: z.string().describe("Dados do cliente para cadastro")
    }),
    func: async ({ input }) => {
      console.log("Input", input);
      return "Cadastro realizado com sucesso!";
    }
  })