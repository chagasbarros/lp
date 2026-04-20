import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { config } from "dotenv";

config();

// Schema para a Identidade Visual
const identitySchema = z.object({
  colors: z.object({
    primary: z.string().describe("Cor principal em HEX (ex: #3b82f6)"),
    secondary: z.string().describe("Cor secundária em HEX"),
    background: z.string().describe("Cor de fundo suave em HEX"),
    text: z.string().describe("Cor do texto em HEX")
  }),
  logoPrompt: z.string().describe("Prompt detalhado para gerar a logomarca no Pollinations"),
  imagePrompts: z.array(z.string().describe("Prompt detalhado para imagem de contexto")).length(3),
  visualStyle: z.string().describe("Descrição do estilo visual escolhido (ex: Minimalista moderno)")
});

const parser = StructuredOutputParser.fromZodSchema(identitySchema);

const SYSTEM_PROMPT = `
Você é um Diretor de Arte e Especialista em UI/UX.
Sua missão é traduzir uma estratégia de marketing em uma identidade visual de alta conversão.

Regras de Cores:
- Escolha cores baseadas na psicologia: azul para confiança, verde para saúde/dinheiro, laranja para ação, etc.
- Garanta contraste entre texto e fundo.

Regras de Imagens (Pollinations.ai):
- Os prompts de imagem devem ser em INGLÊS.
- Devem ser específicos: "High quality, professional photography, 8k, modern office, happy people".
- O logoPrompt deve ser para um "Minimalist vector logo, white background, clean lines".

Formato de Resposta Obrigatório: JSON seguindo o schema.
`.trim();

export class DesignerAgent {
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
      temperature: 0.7,
    });
  }

  async generate(objective: string, strategy: string, vibe: string) {
    const template = `
    OBJETIVO: {objective}
    ESTRATÉGIA APROVADA: {strategy}
    VIBE DESEJADA: {vibe}

    {format_instructions}
    `.trim();

    const prompt = new PromptTemplate({
      template,
      inputVariables: ["objective", "strategy", "vibe"],
      partialVariables: { format_instructions: parser.getFormatInstructions() },
    });

    const input = await prompt.format({ objective, strategy, vibe });

    try {
      const response = await this.model.invoke([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: input }
      ]);
      
      const content = response.content.toString().replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(content);
    } catch (error) {
      console.error("Erro no Agente Designer:", error);
      throw new Error("Falha ao gerar identidade visual com IA");
    }
  }
}
