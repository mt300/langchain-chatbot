// server.ts
import readline from "readline";
import { composedChain } from "./chains/detectIntent.chain";
import { initVectorStore } from "./vector/vectorStore";

async function main() {
    await initVectorStore();

    let chatHistory: string[] = [];

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("💬 Chat iniciado. Digite 'sair' para encerrar.\n");

    function askQuestion() {
        rl.question("Você: ", async (userInput) => {
            if (userInput.toLowerCase() === "sair") {
                rl.close();
                return;
            }

            // Adiciona a mensagem do usuário no histórico
            chatHistory.push(`user: ${userInput}`);

            try {
                const response = await composedChain.invoke({
                    chatHistory: chatHistory.join("\n")
                });

                let resultToStore = response.result;
                // Verifica se é um objeto/array serializável
                if (typeof resultToStore === 'object' && resultToStore !== null) {
                    try {
                        resultToStore = JSON.stringify(resultToStore);
                    } catch (err) {
                        console.error("Erro ao converter resultado para JSON:", err);
                        // Se der erro na stringificação, mantém como estava
                    }
                }
                // Loga e adiciona a resposta no histórico
                console.log("🤖 Bot:", resultToStore);
                chatHistory.push(`agent: ${resultToStore}`);

            } catch (err) {
                console.error("Erro no chatbot:", err);
            }

            askQuestion();
        });
    }

    askQuestion();
}

main().catch(console.error);
