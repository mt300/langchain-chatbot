import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tools } from '../tools/index.tools'
import { llm } from '../llm/phi3'

export async function createAgent(){

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Você é um assistente da Algo Mais Camisaria. Decida a melhor forma de ajudar o cliente chamando uma das funções disponíveis."],
    ["human", "{input}"],
    ["ai", "{agent_scratchpad}"]
  ]);
  
  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
  });
  
    
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });

  return agentExecutor;  
}