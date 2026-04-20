import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { config } from "dotenv";

config();

// Schema Completo da Landing Page para Renderização
const landingPageSchema = z.object({
  name: z.string().describe("Nome comercial do projeto"),
  design: z.object({
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
      background: z.string(),
      text: z.string()
    }),
    images: z.object({
      logo: z.string().describe("Prompt da Logo"),
      hero: z.string().describe("Prompt da Imagem Hero"),
      features: z.array(z.string()).describe("Prompts das Imagens de Features")
    })
  }),
  content: z.object({
    hero: z.object({
      headline: z.string(),
      subheadline: z.string(),
      cta: z.string()
    }),
    features: z.array(z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string().describe("Nome do ícone Lucide (ex: Rocket, Zap, Shield)")
    })).length(3),
    socialProof: z.string(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).length(3),
    footerText: z.string()
  })
});

const parser = StructuredOutputParser.fromZodSchema(landingPageSchema);

export class AssemblerAgent {
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
      temperature: 0.3,
    });
  }

  async assemble(objective: string, strategy: string, design: any, copy: any) {
    const template = `
    Você é o Orquestrador Final de Projetos de Landing Page.
    Sua missão é consolidar os dados de design e copywriting em um único JSON estruturado para renderização.
    
    OBJETIVO: {objective}
    ESTRATÉGIA: {strategy}
    DESIGN: {design}
    COPYWRITING: {copy}

    Certifique-se de que os ícones das features façam sentido com o texto.
    
    {format_instructions}
    `.trim();

    const prompt = new PromptTemplate({
      template,
      inputVariables: ["objective", "strategy", "design", "copy"],
      partialVariables: { format_instructions: parser.getFormatInstructions() },
    });

    const input = await prompt.format({ 
      objective, 
      strategy, 
      design: JSON.stringify(design), 
      copy: JSON.stringify(copy) 
    });

    try {
      const response = await this.model.invoke([
        { role: "system", content: "Você é um Assembler JSON rigoroso." },
        { role: "user", content: input }
      ]);
      
      const content = response.content.toString().replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(content);
    } catch (error) {
      console.error("Erro no Agente Assembler:", error);
      throw new Error("Falha ao consolidar projeto");
    }
  }
}
