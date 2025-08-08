//server.ts
// import { createAgent } from './agents/routing.agent';
// import { createAgent } from './agents/ollamaRouting.agent'
import { composedChain } from './chains/detectIntent.chain'
// import { initVectorStore, queryVectorStore } from './vector/vectorStore'
// import { HumanMessage, AIMessage } from '@langchain/core/messages';
// import { getRAGChain } from './chains/RAG.chain';
// import { tools } from './tools/index.tools'
// import { adderTool } from './tools/calculatePrice';
// import { ChatOllama } from "@langchain/ollama";
// import { z } from "zod";

async function main() {
    try {

        const chatHistory = `
            user: Olá, vim pelo site, tenho interesse em adquirir os produtos da Algo Mais\n
            agent: Olá, tudo bem? Eu sou o assistente virtual da Algo Mais Camisaria e posso te ajudar com orçamentos, dúvidas, alterações no pedido, reclamações ou posso te encaminhar para um de nossos atendentes humanos. Do que você precisa hoje? \n
            user: gostaria de saber o preço para fazer 10 camisas gola V com a logo da minha empresa, 10 shorts com a logo tambem.
        `
        const response = await composedChain.invoke({chatHistory})
        // console.log('Response', response.result.content)
        const items = JSON.parse(response.result.content);
        items.forEach((p: {item:string, quantidade: number, malha: string, arte: boolean, personalizacao: string[]}, i:number) => {
            console.log(`📦 Item ${i + 1}`);
            console.log(`- Item: ${p.item}`);
            console.log(`- Quantidade: ${p.quantidade}`);
            console.log(`- Malha: ${p.malha ?? '(não informado)'}`);
            console.log(`- Arte: ${p.arte}`);
            console.log(
            `- Personalizações: ${
                p.personalizacao?.length
                ? p.personalizacao.join(", ")
                : "Nenhuma"
            }`
            );
            console.log();
        });
        // await initVectorStore();
        
        // const knowledgeSnippet = await queryVectorStore( lastMessage);
        // const attendanceScript = knowledgeSnippet.filter( (ks: {similarity: string; content: string; metadata: Record<string, any>;}) => ks.metadata.source.includes('script') )
        // const productsServices = knowledgeSnippet.filter( (ks: {similarity: string; content: string; metadata: Record<string, any>;}) => ks.metadata.source.includes('produtos') )

        // console.log('ATENDIMENTO Knowledge Snippet', attendanceScript)
        // console.log('PRODUTOS Knowledge Snippet', productsServices)

        // // const agentPrompt = (input:string, knowledge:string) => `
        // //     Base de conhecimento:\n 
        // //     ${knowledge}\n
        // //     User Input: ${input}
        // // `
        // const chatHistory = [
        //     new HumanMessage("Olá, tudo bem?"),
        //     new AIMessage("Bem vindo a Algo Mais, em que posso ajudar?"),
        //     new HumanMessage(lastMessage),
        // ];
        // // console.log('chat history', chatHistory)
        // const historyAsText = chatHistory.map( msg => 
        //     msg._getType() === 'human'
        //         ? ["Usuário", msg.content as string]
        //         : ["Assistant", msg.content as string]
        // );
        // const agent = await createAgent(historyAsText, attendanceScript.map(a => a.content).join('\n'), productsServices.map(a => a.content).join('\n'))
        // console.log('Agent', agent)
        
        // const response = await agent
        // console.log('Response', response)
        
    } catch (error) {
        console.error("Error running main store:", error);
    }
}

main().catch((error) => console.error("Error in main:", error));