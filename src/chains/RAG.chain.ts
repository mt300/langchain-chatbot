import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { vectorStore } from "../vector/vectorStore";
import { llm } from '../llm/mistral'


let ragChainInstance: any = null;

export async function getRAGChain() {
  if(!ragChainInstance){

    const prompt = ChatPromptTemplate.fromTemplate(`Você é um assistente da Algo Mais Camisaria. Responda a pergunta do usuário de forma objetiva, usando exclusivamente as informações fornecidas no contexto.\n Mensagem: {input} \n Contexto: {context}`);
    const combineDocsChain = await createStuffDocumentsChain({
      llm,
      prompt,
    });
    const retriever = vectorStore.asRetriever();
    
    ragChainInstance = await createRetrievalChain({
      combineDocsChain,
      retriever,
    });
  }

  return ragChainInstance
}