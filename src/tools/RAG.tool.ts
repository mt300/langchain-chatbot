import { DynamicStructuredTool } from "langchain/tools";
import { getRAGChain } from "../chains/RAG.chain";
import { z } from 'zod'
export const RAGTool = new DynamicStructuredTool({
    name: "RAGTool",
    description: "Busca informações nos arquivos de 'produtos-e-servicos' e 'script-de-atendimento' no vectorstore da empresa para auxiliar o agente com o contexto necessário para realizar a tarefa",
    schema: z.object({
      input: z.string().describe("Consulta a ser feita no banco de dados")
    }),
    func: async ({ input }) => {
      const ragChainInstance = await getRAGChain();
      const response = await ragChainInstance.call({ query: input });
      return response.text;
    }
})