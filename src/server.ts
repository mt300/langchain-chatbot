//server.ts
import { composedChain } from './chains/detectIntent.chain'
import { initVectorStore } from './vector/vectorStore'

async function main() {
    try {
        await initVectorStore();
        const chatHistory = `
            user: Olá, vim pelo site, tenho interesse em adquirir os produtos da Algo Mais\n
            agent: Olá, tudo bem? Eu sou o assistente virtual da Algo Mais Camisaria e posso te ajudar com orçamentos, dúvidas, alterações no pedido, reclamações ou posso te encaminhar para um de nossos atendentes humanos. Do que você precisa hoje? \n
            user: gostaria de saber o preço para fazer 10 camisas gola V com a logo da minha empresa, 10 shorts com a logo tambem.
        `
        const response = await composedChain.invoke({chatHistory})
        console.log('Response', response)
        const items = response.result;
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
        
        
        
        
    } catch (error) {
        console.error("Error running main store:", error);
    }
}

main().catch((error) => console.error("Error in main:", error));