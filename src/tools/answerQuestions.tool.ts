import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import { llm } from "../llm/llama3";
import { faqPrompt } from "../prompts/faq.prompt";

export const answerCustomerQuestionTool = new DynamicStructuredTool({
  name: "answer_customer_question",
  description: "Responde perguntas do cliente usando o histórico e o contexto da empresa.",
  schema: z.object({
    chat_history: z.array(z.string()),
    context: z.string().describe("Trechos da base de conhecimento da empresa relevantes para responder a pergunta"),
    question: z.string().describe("Pergunta feita pelo cliente")
  }),
  func: async ({ chat_history, context, question }) => {
    console.log("Chamada da função de resposta a perguntas");

    const prompt = faqPrompt({chat_history, context, question})
    // console.log('FAQ Prompt Complete', prompt)
    const response = await llm.invoke(prompt);
    return response.content; // Texto simples como resposta
  },
});




