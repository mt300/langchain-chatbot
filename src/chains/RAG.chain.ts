import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { vectorStore } from "../vector/vectorStore";
import { llm } from '../llm/mistral'


let ragChainInstance: any = null;

const promptTemplate = `
Contexto:
{context}

Entrada:
{input}

Baseando-se estritamente no contexto acima, responda de maneira direta e objetiva.
Se a resposta não estiver no contexto, diga: "Informação não encontrada no contexto".
`;
export async function getRAGChain() {
  if(!ragChainInstance){

    const prompt = ChatPromptTemplate.fromTemplate(promptTemplate);
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