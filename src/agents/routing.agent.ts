import { OpenAIFunctionsAgent } from "langchain/agents/openai_functions";
import { RunnableWithMessageHistory } from "langchain/schema/runnable";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Tool } from "langchain/tools";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { tools } from '../tools/index.tools'
import { llm } from '../llm/phi3'

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "Você é um assistente da Algo Mais Camisaria. Decida a melhor forma de ajudar o cliente chamando uma das funções disponíveis."],
  ["human", "{input}"],
]);

const agent = new OpenAIFunctionsAgent({
  llm,
  tools,
  prompt,
});

// const messageHistory = []; // Você deve gerenciar esse histórico de forma persistente por usuário/session.
function getMessageHistory(id:string){
  return [{'user': 'Oi, tudo bem?'}, {'bot': 'bem vindo a algo mais em que posso ajudar?'}]
}

export const runnableAgent = new RunnableWithMessageHistory({
  runnable: agent,
  getMessageHistory: async (sessionId:string) => getMessageHistory(sessionId),
  inputMessagesKey: "input",
  historyMessagesKey: "history",
});
