import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tools } from '../tools/index.tools'
import { llm } from '../llm/llama3-groq-tool'

export async function createAgent(){

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Você é um agente de IA para atendimento ao cliente e vendas da Algo Mais Camisaria. Você receberá mensagens dos clientes com historico de mensagens relevantes e snippets da base de conhecimento da empresa ('produtos e servicos' e 'script de atendimento') relevantes, você sempre DEVE consultar as tools disponíveis (extractOrderFromChatHistoryTool, sendToHumanTool) e ver qual a mais adequada para ajudar o cliente. O seu trabalho é chamar a função mais apropriada e usar o output da tool para gerar a resposta do cliente. Caso nao ache uma tool apropriada execute a tool sendToHumanTool."],
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
    verbose: true
  });

  return agentExecutor;  
}