import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLambda } from '@langchain/core/runnables';
import { detectIntent } from '../prompts/detectIntent.prompt';
import { llm } from '../llm/phi3';


const prompt = ChatPromptTemplate.fromTemplate(detectIntent);

const chain = prompt.pipe(llm).pipe(new StringOutputParser());

const analysisPrompt = ChatPromptTemplate.fromTemplate("Essa piada é engraçada? {piada}");

export const composedChain = new RunnableLambda({
    func: async (input:{chatHistory: string}) => {
        const result = await chain.invoke(input);
        return { piada: result }
    }
})
    .pipe(analysisPrompt)
    .pipe(llm)
    .pipe(new StringOutputParser)

// export const chain = prompt.pipe(llm).pipe(new StringOutputParser())