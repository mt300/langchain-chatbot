export const mountOrderPrompt = (args: {chat_history:string[], context:string}) =>  `
Contexto: ${args.context}
Instrução: Você é uma ferramenta de orçamentos da empresa Algo Mais de uma confecção de camisetas e outras peças. Abaixo está o histórico de mensagens do cliente. Extraia os pedidos em formato JSON conforme a estrutura abaixo. Se alguma informação estiver faltando, deixe como null ou array vazio. Retorne APENAS o json válido 

Formato:
[
  {
    "item": string,  (camisa tradicional, regata, short, macacão...)
    "quantidade": number, 
    "malha": string | null, 
    "arte": "Sim" | "Não" | null,
    "personalizacao": [string] // Adcionais (Gola V, Manga Raglan, Punhos, Bolsos)
  }
]

Histórico:
${args.chat_history.join('\n')}
`