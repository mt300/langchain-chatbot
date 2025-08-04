//server.ts

import { initVectorStore, queryVectorStore } from './vector/vectorStore'
// import { adderTool } from './tools/calculatePrice';

async function main() {
    try {
        await initVectorStore();
        const response = await queryVectorStore("Quanto custa 20 camisas?", 4);
        console.log("Query Response:", response);
        // const result = await adderTool.invoke({ a: 1, b: 2 });
        // console.log("Adder Tool Response:", result);
    } catch (error) {
        console.error("Error initializing vector store:", error);
    }
}

main().catch((error) => console.error("Error in main:", error));