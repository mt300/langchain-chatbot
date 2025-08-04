import { RunnableAgent } from "@langchain/core/agents";

const agent = RunnableAgent.fromLLMAndTools({
  llm: chatOllama,
  tools: [calcTool],
});

const response = await agent.invoke("Qual a soma de 12 e 30?");
