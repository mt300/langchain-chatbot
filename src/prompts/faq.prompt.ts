export const faqPrompt = ({chat_history, context, question}:{chat_history:string[], context:string, question:string}) => `
        Contexto da empresa:
        ${context}

        Histórico do cliente:
        ${chat_history.join("\n")}

        Pergunta do cliente:
        ${question}

        
        Use todo o contexto acima para responder a pergunta do cliente de forma clara, completa e objetiva.
        Se for conveniente responda em tópicos, mas evite deixar informações relacionadas a pergunta de fora da resposta.
        Ignore informações que não forem relacionadas a malhas.
`;