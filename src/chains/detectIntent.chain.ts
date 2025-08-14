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

function formatOrderForCustomer(jsonString: string): string {
  let items: any[];
  try {
    items = JSON.parse(jsonString);
  } catch (e) {
    return "⚠️ Não foi possível entender o pedido.";
  }

  if (!Array.isArray(items) || items.length === 0) {
    return "📭 Nenhum item encontrado no pedido.";
  }

  const formatted = items.map((item, index) => {
    const nome = item.item ?? "[Não Informado]";
    const quantidade = item.quantidade ?? "[Não Informado]";
    const malha = item.malha ?? "[Não Informado]";
    const arte = item.arte ?? "[Não Informado]";
    const personalizacao = Array.isArray(item.personalizacao) && item.personalizacao.length > 0
      ? item.personalizacao.join(", ")
      : "[Não Informado]";

    return `🛍️ *Item ${index + 1}*
   - Produto: ${nome}
   - Quantidade: ${quantidade}
   - Malha: ${malha}
   - Arte: ${arte}
   - Personalização: ${personalizacao}`;
  });

  return `📦 Detalhes do seu pedido:\n\n${formatted.join("\n\n")} \n\n✅ Se algo estiver incorreto, por favor me avise.`;
}
const formatUserResponseLambda = new RunnableLambda({
  func: async (input: {
    result?: string | object;
    route?: string;
    error?: string;
  }) => {
    // Caso tenha erro, devolve algo já amigável
    if (input.error) {
      return {
        finalMessage: `Ops! Tivemos um problema: ${input.error}`
      };
    }

    // Se for string, usa direto, se for objeto, transforma em texto
    let rawMessage = typeof input.result === 'string'
      ? input.result
      : JSON.stringify(input.result, null, 2);

    // Regras de formatação por rota
    switch (input.route) {
      case 'orçamento':
        const friendlyData = formatOrderForCustomer(rawMessage)
        rawMessage = `Segue o que encontrei sobre seu orçamento. Verifique se as informações estão corretas, diga o que quer alterar ou confirme para que eu :\n${friendlyData}`;
        console.log("RAW MESSAGE", rawMessage)
        break;
      case 'dúvidas':
        rawMessage = `Aqui está a resposta para sua dúvida:\n${rawMessage}`;
        break;
      case 'reclamação':
        rawMessage = `Recebemos sua reclamação e vamos encaminhar: ${rawMessage}`;
        break;
      case 'falar com humano':
        rawMessage = rawMessage; // já deve estar pronto
        break;
      default:
        rawMessage = rawMessage || 'Posso te ajudar com mais alguma coisa?';
        break;
    }

    // Retorna formato final unificado
    return {
      route: input.route,
      message: rawMessage
    };
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
  executeRouteLambda,
  formatUserResponseLambda
]);
