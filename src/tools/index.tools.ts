import { tool } from "@langchain/core/tools";
import { getRAGChain } from '../chains/RAG.chain'

export const tools = [
  {
    name: "GenerateQuoteTool",
    description: "Gera um orçamento com base nos dados do cliente",
    func: async (input: string) => {
      // lógica de cálculo de orçamento
      console.log('Input', input);
      const valor = 10
      return `Orçamento gerado: R$ ${valor}`;
    }
  },
  {
    name: "RegisterClientTool",
    description: "Faz o cadastro do cliente no sistema",
    func: async (input: string) => {
      // lógica de cadastro
      console.log('input', input)
      return "Cadastro realizado com sucesso!";
    }
  },
  {
    name: "CheckOrderStatusTool",
    description: "Verifica o status de um pedido",
    func: async (input: {id:number}) => {
      // lógica de status
      return `Pedido #${input.id} está em produção.`;
    }
  },
  tool(async () => {
      return "Encaminhei sua solicitação para um de nossos atendentes.";
    },
    {
    name: "SendToHumanTool",
    description: "Escala o atendimento para um atendente humano",
  
  }),
  tool(async (input:string) => {
      const ragChainInstance = await getRAGChain();
      const response = await ragChainInstance.call({ query: input });
      return response.text;
    },
    {
    name: "RAGFAQTool",
    description: "Busca informações no banco de conhecimento da empresa.",
  
  })
];
