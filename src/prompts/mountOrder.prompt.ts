export const mountOrderPrompt = (CHAT_HISTORY:string) =>  `
Contexto: Você é um assistente de vendas de uma confecção de camisetas. Abaixo está o histórico de mensagens do cliente. Extraia os pedidos em formato JSON conforme a estrutura abaixo. Se alguma informação estiver faltando, deixe como null ou array vazio.

Formato:
[
  {
    "item": string,
    "quantidade": number,
    "malha": string | null,
    "arte": "Sim" | "Não" | null,
    "personalizacao": [string]
  }
]

Histórico:
${CHAT_HISTORY}
`