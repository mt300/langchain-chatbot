import { BaseOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import { detectIntent } from '../prompts/detectIntent.prompt';
import { llm } from '../llm/llama3';
import { queryVectorStore } from '../vector/vectorStore';
import { extractOrderFromChatHistoryTool } from '../tools/extractOrderFromChatHistory.tool';
import { answerCustomerQuestionTool } from '../tools/answerQuestions.tool';

// ==== Utils ====
const getLastUserMessage = (chatHistory: string) => {
  const lines = chatHistory.split('\n');
  const userMessages = lines.filter(line => line.trim().toLowerCase().startsWith('user:'));
  return (userMessages.length > 0 && userMessages[userMessages.length - 1])
    ? userMessages[userMessages.length - 1]?.replace(/^user:\s*/i, '').trim()
    : '';
};

const handleErrorTool = {
  invoke: async (data: any) => {
    console.error('Erro capturado no fluxo:', data);
    return { error: 'Ocorreu um problema ao processar sua solicitação.' };
  }
};

// ==== Intent Parser ====
const prompt = ChatPromptTemplate.fromTemplate(detectIntent);

class IntentEnumParser extends BaseOutputParser<string> {
  static override lc_name() {
    return "IntentEnumParser";
  }
  lc_namespace = ["chatbot", "parsers"];
  private readonly enumValues = [
    "ORÇAMENTO",
    "DÚVIDAS",
    "RECLAMAÇÃO",
    "FALAR COM HUMANO",
    "INDEFINIDO",
  ];
  async parse(text: string): Promise<string> {
    const cleaned = text.trim().toLowerCase();
    const matched = this.enumValues.find(value => cleaned.includes(value.toLowerCase()));
    return matched ?? 'INDEFINIDO';
  }
  getFormatInstructions(): string {
    return `Deve retornar exatamente uma das intenções válidas: ${this.enumValues.join(', ')}`;
  }
}

const detectIntentChain = prompt.pipe(llm).pipe(new IntentEnumParser());

// ==== Roteamento ====
const routingLambda = new RunnableLambda({
  func: async (input: {
    chatHistory: string;
    lastUserMessage: string;
    intent: string;
  }) => {
    const { chatHistory, lastUserMessage, intent } = input;

    switch (intent.toLowerCase()) {
      case 'orçamento': {
        const context = await queryVectorStore(lastUserMessage || chatHistory, 3);
        return {
          ...input,
          retrievedContext: context.map(c => c.content).join('\n'),
          route: 'orçamento',
          action: extractOrderFromChatHistoryTool
        };
      }

      case 'dúvidas': {
        if (!lastUserMessage) {
          return {
            ...input,
            retrievedContext: '',
            route: 'error',
            action: handleErrorTool,
            error: 'Última mensagem não encontrada. Query ao vector store não pode ser vazia.'
          };
        }
        const context = await queryVectorStore(lastUserMessage, 3);
        return {
          ...input,
          retrievedContext: context.map(c => c.content).join('\n'),
          route: 'dúvidas',
          action: answerCustomerQuestionTool
        };
      }

      case 'reclamação': {
        return {
          ...input,
          route: 'reclamação',
          action: handleErrorTool, // placeholder até implementar
          error: 'Fluxo de reclamações não implementado ainda.'
        };
      }

      case 'falar com humano': {
        return {
          ...input,
          route: 'falar com humano',
          finalResponse: 'Está bem! Estou te encaminhando para um atendente humano.'
        };
      }

      default: {
        return {
          ...input,
          route: 'indefinido',
          finalResponse: 'Olá, em que posso te ajudar hoje?'
        };
      }
    }
  }
});

// ==== Execução final ====
const executeRouteLambda = new RunnableLambda({
  func: async (input: {
    chatHistory: string;
    lastUserMessage: string;
    retrievedContext?: string;
    route: string;
    finalResponse?: string;
    action?: any;
    error?: string;
  }) => {
    try {
      if (input.finalResponse) {
        return { result: input.finalResponse };
      }

      if (input.action) {
        const payload: any = {
          chat_history: input.chatHistory.split('\n'),
          context: input.retrievedContext || ''
        };

        if (input.route === 'dúvidas') {
          payload.question = input.lastUserMessage;
        }

        const result = await input.action.invoke(payload);
        return { result };
      }

      return { message: `Nenhuma ação executada para rota ${input.route}` };
    } catch (err) {
      console.error(`Erro na rota ${input.route}:`, err);
      return { error: 'Falha ao executar ação da rota.' };
    }
  }
});

// ==== Runnable Sequence ====
export const composedChain = RunnableSequence.from([
  // Detecta intent e última mensagem logo no início
  new RunnableLambda({
    func: async (input: { chatHistory: string }) => {
      const intent = await detectIntentChain.invoke({ chatHistory: input.chatHistory });
      const lastUserMessage = getLastUserMessage(input.chatHistory);
      return { chatHistory: input.chatHistory, lastUserMessage, intent };
    }
  }),
  routingLambda,
  executeRouteLambda
]);
