import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { getRAGChain } from "../chains/RAG.chain";

export const tools = [
  new DynamicStructuredTool({
    name: "GenerateQuoteTool",
    description: "Gera um orçamento com base nos dados do cliente",
    schema: z.object({
      input: z.string().describe("Dados do cliente para gerar orçamento")
    }),
    func: async ({ input }) => {
      console.log("Input", input);
      const valor = 10;
      return `Orçamento gerado: R$ ${valor}`;
    }
  }),

  new DynamicStructuredTool({
    name: "RegisterClientTool",
    description: "Faz o cadastro do cliente no sistema",
    schema: z.object({
      input: z.string().describe("Dados do cliente para cadastro")
    }),
    func: async ({ input }) => {
      console.log("Input", input);
      return "Cadastro realizado com sucesso!";
    }
  }),

  new DynamicStructuredTool({
    name: "CheckOrderStatusTool",
    description: "Verifica o status de um pedido",
    schema: z.object({
      id: z.number().describe("ID do pedido")
    }),
    func: async ({ id }) => {
      return `Pedido #${id} está em produção.`;
    }
  }),

  new DynamicStructuredTool({
    name: "SendToHumanTool",
    description: "Escala o atendimento para um atendente humano",
    schema: z.object({}),
    func: async () => {
      return "Encaminhei sua solicitação para um de nossos atendentes.";
    }
  }),

  new DynamicStructuredTool({
    name: "RAGTool",
    description: "Busca informações no banco de dados da empresa",
    schema: z.object({
      input: z.string().describe("Consulta a ser feita no banco de dados")
    }),
    func: async ({ input }) => {
      const ragChainInstance = await getRAGChain();
      const response = await ragChainInstance.call({ query: input });
      return response.text;
    }
  })
];
