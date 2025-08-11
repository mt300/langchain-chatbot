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

                // Loga e adiciona a resposta no histórico
                console.log("🤖 Bot:", response.result);
                chatHistory.push(`agent: ${response.result}`);

            } catch (err) {
                console.error("Erro no chatbot:", err);
            }

            askQuestion();
        });
    }

    askQuestion();
}

main().catch(console.error);
