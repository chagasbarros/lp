import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { config } from "dotenv";

config();

const pageContentSchema = z.object({
  hero: z.object({
    headline: z.string().describe("Título persuasivo e impactante"),
    subheadline: z.string().describe("Subtítulo que reforça a proposta de valor"),
    cta: z.string().describe("Texto do botão de ação principal")
  }),
  features: z.array(z.object({
    title: z.string(),
    description: z.string()
  })).length(3),
  socialProof: z.string().describe("Uma frase curta de prova social ou autoridade"),
  faq: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).length(3),
  footerText: z.string()
});

const parser = StructuredOutputParser.fromZodSchema(pageContentSchema);

export class CopywriterAgent {
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
      modelName: "google/gemini-2.0-flash-001",
      temperature: 0.8,
    });
  }

  async generate(objective: string, strategy: string, visualStyle: string) {
    const template = `
    Você é um Copywriter de elite focado em conversão.
    Use os frameworks AIDA ou PAS para criar o conteúdo desta Landing Page.

    OBJETIVO: {objective}
    ESTRATÉGIA: {strategy}
    ESTILO VISUAL: {visualStyle}

    {format_instructions}
    `.trim();

    const prompt = new PromptTemplate({
      template,
      inputVariables: ["objective", "strategy", "visualStyle"],
      partialVariables: { format_instructions: parser.getFormatInstructions() },
    });

    const input = await prompt.format({ objective, strategy, visualStyle });

    try {
      const response = await this.model.invoke([
        { role: "system", content: "Escreva sempre em Português do Brasil de forma persuasiva." },
        { role: "user", content: input }
      ]);
      
      const content = response.content.toString().replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(content);
    } catch (error) {
      console.error("Erro no Agente Copywriter:", error);
      throw new Error("Falha ao gerar copy com IA");
    }
  }
}
