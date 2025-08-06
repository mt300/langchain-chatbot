//server.ts
// import { createAgent } from './agents/routing.agent';
import { llmWithTools as ollamaAgent } from './agents/ollamaRouting.agent'

import { initVectorStore, queryVectorStore } from './vector/vectorStore'
// import { HumanMessage, AIMessage } from '@langchain/core/messages';
// import { getRAGChain } from './chains/RAG.chain';
// import { tools } from './tools/index.tools'
// import { adderTool } from './tools/calculatePrice';
// import { ChatOllama } from "@langchain/ollama";
// import { z } from "zod";

async function main() {
    try {

        
        await initVectorStore();
        // const agent = await createAgent();
        // console.log('Agent', agent)
        // console.log('Tools', agent.tools.map((t:any) => t.name))
        
        
        const knowledgeSnippet = await queryVectorStore( `Quero fazer um orçamento de 10 camisas com a minha logo`);
        console.log('Knowledge Snippet', knowledgeSnippet)
        const agentPrompt = (input:string, knowledge:string) => `
            Base de conhecimento:\n 
            ${knowledge}\n
            User Input: ${input}
        `
        // With chat history
        // const result = await agent.invoke({
        //     input: agentPrompt("As malhas eu não conheco nem sei o que é silk e sublimação.", knowledgeSnippet.map( (k:any) => k.content).join('\n')),
        //     chat_history: [
        //         new HumanMessage("Olá, tudo bem?"),
        //         new AIMessage("Bem vindo a Algo Mais, em que posso ajudar?"),
        //         new HumanMessage("Quanto custa 4 camisas com logo da minha empresa?"),
        //         new AIMessage(`Para te passar um orçamento, preciso saber alguns detalhes adicionais:
        //             - Qual é o tipo de impressão que você gostaria (sublimação, silk)?
        //             - Você já tem a arte pronta ou precisa de ajuda para criar?
        //             - Qual é o tipo de tecido ou malha que você prefere?

        //             Com essas informações, posso te fornecer um orçamento mais preciso!`),
        //     ],
        // });
        // const response = result.output;
        const response = await ollamaAgent.invoke(agentPrompt('Quero fazer um orçamento de 10 camisas com a minha logo', knowledgeSnippet.map( (k:any) => k.content).join('\n')))
        console.log('Response', response)
        // const toolMatch = response.match(/(extractOrderFromChatHistoryTool|sendToHumanTool|RAGTool)/);
        // console.log('Tool', toolMatch)
        // console.log('Tool', agent.tools.find((t:any) => response.includes(t.name)))

        // console.log('Tools Matcheds',toolMatch)
        // if (toolMatch) {
        //     const toolName = toolMatch[1];
        //     const jsonMatch = response.match(/{.*}/s); // captura JSON params
        //     const params = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

        //     const tool = tools.find(t => t.name === toolName);
        //     if (tool) {
        //         const toolResponse = await tool.func(params);
        //         console.log("Resposta da Tool:", toolResponse);
        //     }
        // }
    } catch (error) {
        console.error("Error running main store:", error);
    }
}

main().catch((error) => console.error("Error in main:", error));