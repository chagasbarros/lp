import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { config } from "dotenv";

config();

// Schema de saída estruturada para o Agente
const strategySchema = z.object({
  status: z.enum(["accepted", "needs_improvement", "rejected"]),
  feedback: z.string().describe("Feedback detalhado sobre a estratégia"),
  suggestions: z.array(z.string()).describe("Lista de melhorias concretas"),
  score: z.number().min(0).max(100).describe("Nota da estratégia de conversão")
});

const parser = StructuredOutputParser.fromZodSchema(strategySchema);

const SYSTEM_PROMPT = `
Você é um Especialista Sênior em Marketing de Resposta Direta e Growth Hacker.
Sua missão é ser um CRÍTICO FEROZ de estratégias de Landing Page.

Seu objetivo é garantir que o usuário não crie uma página genérica que não converte.
Você avalia com base em 3 pilares:
1. CLAREZA: O objetivo está óbvio?
2. DOR: A dor do público-alvo foi tocada?
3. DIFERENCIAL: O que separa isso do resto do mercado?

Se a estratégia for fraca, seja direto e peça melhorias.
Se for boa, dê nota acima de 80 e aceite.

Formato de Resposta Obrigatório: JSON seguindo o schema.
`.trim();

export class StrategistAgent {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Landing Page Generator TCC",
        },
      },
      modelName: "google/gemini-2.0-flash-001", // Ou outro modelo disponível no OpenRouter
      temperature: 0.7,
    });
  }

  async evaluate(objective: string, strategy: string) {
    const template = `
    OBJETIVO SELECIONADO: {objective}
    RESPOSTAS DO FORMULÁRIO:
    {strategy}

    {format_instructions}
    `.trim();

    const prompt = new PromptTemplate({
      template,
      inputVariables: ["objective", "strategy"],
      partialVariables: { format_instructions: parser.getFormatInstructions() },
    });

    const input = await prompt.format({
      objective,
      strategy,
    });

    try {
      const response = await this.model.invoke([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: input }
      ]);
      
      // Limpeza básica para garantir JSON puro (OpenRouter às vezes manda markdown)
      const content = response.content.toString().replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(content);
    } catch (error) {
      console.error("Erro no Agente Estrategista:", error);
      throw new Error("Falha ao analisar estratégia com IA");
    }
  }
}
