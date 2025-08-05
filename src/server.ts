//server.ts
import { createAgent } from './agents/routing.agent';
import { initVectorStore } from './vector/vectorStore'
import { HumanMessage, AIMessage } from '@langchain/core/messages';
// import { adderTool } from './tools/calculatePrice';

async function main() {
    try {
        await initVectorStore();
        const agent = await createAgent();
        const result = await agent.invoke({
          input: "Que produtos voces vendem?",
        });

        // With chat history
        const result2 = await agent.invoke({
            input: "Quanto custa 4 camisas com logo da minha empresa?",
            chat_history: [
                new HumanMessage("Olá, tudo bem?"),
                new AIMessage("Bem vindo a Algo Mais, em que posso ajudar?"),
            ],
        });
        console.log('Result 1', result);
        console.log('Result 2', result2);
    } catch (error) {
        console.error("Error initializing vector store:", error);
    }
}

main().catch((error) => console.error("Error in main:", error));