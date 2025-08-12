import { BaseOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import { detectIntent } from '../prompts/detectIntent.prompt';
// import { getRAGChain } from './RAG.chain';
import { llm } from '../llm/llama3';
import { queryVectorStore } from '../vector/vectorStore';
import { extractOrderFromChatHistoryTool } from '../tools/extractOrderFromChatHistory.tool';
import { answerCustomerQuestionTool } from '../tools/answerQuestions.tool';


const handleError = {
    invoke: () => console.log('Erro do handleErro')
}
const getLastUserMessage = (chatHistory: string) => {
    // Extrair a última mensagem do usuário
    const lines = chatHistory.split('\n');
    // Filtra as linhas que começam com 'user:'
    const userMessages = lines.filter(line => line.trim().toLowerCase().startsWith('user:'));
    // Pega a última mensagem do usuário e remove o prefixo
    const lastUserMessage = userMessages.length > 0 
        ? userMessages?.[userMessages?.length - 1]?.replace(/^user:\s*/i, '').trim() 
        : '';
    return lastUserMessage
}
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

    const matched = this.enumValues.find((value) =>
      cleaned.includes(value.toLowerCase())
    );

    return matched ?? 'INDEFINIDO';
  }

  getFormatInstructions(): string {
    return `Deve retornar exatamente uma das intenções válidas: ${this.enumValues.join(', ')}`;
  }
}
const detectIntentChain =  prompt.pipe(llm).pipe(new IntentEnumParser);


async function fetchSnippets(chatHistory:string, intent: string){
    console.log('intent', intent)
    const context = await queryVectorStore(`${intent}. ${chatHistory}`, 2);
    const script = await queryVectorStore(`${intent}. ${chatHistory}`, 2);
    const response = context.map( c => c.content).join('\n') + script.map( s => s.content).join('\n') 
    return response;
}

const routingLambda = new RunnableLambda({
    func: async (input: {
        chatHistory: string,
        intent: string,
        snippets: string
    }) => {
        const { intent, chatHistory} = input; //{ intent, chatHistory, snippets }
        
        switch ( intent.toLowerCase()){
            case 'orçamento':

                return { 
                    ...input,
                    route: 'orçamento',
                    action: extractOrderFromChatHistoryTool
                };
            case 'dúvidas':
                const lastUserMessage = getLastUserMessage(chatHistory)??''
                if(lastUserMessage === '') {
                    return { 
                        intent,
                        chatHistory,
                        snippets: '',
                        route: 'error',
                        action: handleError,
                        error: 'Ultima mensagem não encontrada. Query ao vectorstore nao pode ser vazia'
                    }; 
                }
                const updatedContext = await queryVectorStore(lastUserMessage, 3)
                const parsedContext = updatedContext.map( c => c.content).join('\n')
                // console.log('Updated Context', parsedContext);
                return { 
                    intent,
                    chatHistory,
                    snippets: parsedContext,
                    route: 'dúvidas',
                    action: answerCustomerQuestionTool
                };
            // case 'alteração':
            //     return { 
            //         route: 'alteração'
            //     };
            case 'reclamação':
                return { 
                    route: 'reclamação'
                };
            case 'falar com humano':
                return { 
                    route: 'falar com humano',
                    finalResponse: 'Está bem! Estou te encaminhando para um atendente humano.'
                };
            default:
                return { 
                    route: 'indefinido',
                    finalResponse: 'Olá, em que posso te ajudar hoje?'
                };
            
        }
    }
})

// {
//     func: async (input:{chatHistory: string}) => {
//         const result = await chain.invoke(input);
//         return { piada: result }
//     }
// }
export const composedChain = RunnableSequence.from([
    new RunnableLambda({
        func: async (input: { chatHistory:string}) => {
            const intent = await detectIntentChain.invoke({ chatHistory: input.chatHistory})
            return { chatHistory: input.chatHistory, intent}
        }
    }),
    new RunnableLambda({
        func: async (input: { chatHistory: string; intent: string }) => {
            const snippets = await fetchSnippets(input.chatHistory, input.intent);
            return { ...input, snippets };
        }
    }),
    routingLambda,
    new RunnableLambda({
        func: async (input: {
            chatHistory: string,
            snippets: string,
            route: string,
            finalResponse?: string,
            action?: any, // Pode ser a tool ou não
        }) => {
            if (input.finalResponse) {
                // Retorna direto a resposta pronta, sem chamar action
                return { result: input.finalResponse };
            }
            if (input.route === 'orçamento' && input.action) {
                const result = await input.action.invoke({
                    chat_history: input.chatHistory.split('\n'),
                    context: input.snippets
                });
                return { result };
            }
            if(input.route === 'dúvidas' && input.action) {
                
                const lastUserMessage = getLastUserMessage(input.chatHistory)
                
                const result = await input.action.invoke({
                    chat_history: input.chatHistory.split('\n'),
                    context: input.snippets,
                    question: lastUserMessage
                });
                return { result };
            }
            if(input.route === 'error' && input.action) {
                
                const result = await input.action.invoke({
                    chat_history: input.chatHistory.split('\n'),
                    context: input.snippets,
                });
                return { result };
            }


            return { message: `Nenhuma ação executada para rota ${input.route}` };
        }
    })

])

// export const chain = prompt.pipe(llm).pipe(new StringOutputParser())