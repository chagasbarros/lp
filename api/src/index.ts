import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { StrategistAgent } from './agents/StrategistAgent.js';
import { DesignerAgent } from './agents/DesignerAgent.js';
import { CopywriterAgent } from './agents/CopywriterAgent.js';
import { AssemblerAgent } from './agents/AssemblerAgent.js';
import { z } from 'zod';

config();

const fastify = Fastify({ logger: true });
await fastify.register(cors, { origin: true });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const strategist = new StrategistAgent();
const designer = new DesignerAgent();
const copywriter = new CopywriterAgent();
const assembler = new AssemblerAgent();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response> {
  try {
    const response = await fetch(url);
    if (response.status === 429 && retries > 0) {
      await sleep(delay);
      return fetchWithRetry(url, retries - 1, delay * 2);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return fetchWithRetry(url, retries - 1, delay * 2);
    }
    throw error;
  }
}

fastify.get('/health', async () => ({ status: 'ok' }));

fastify.post('/api/strategy/evaluate', async (request) => {
  const { objective, strategy } = request.body as any;
  return await strategist.evaluate(objective, strategy);
});

fastify.post('/api/design/generate', async (request) => {
  const { objective, strategy, vibe } = request.body as any;
  return await designer.generate(objective, strategy, vibe);
});

fastify.post('/api/copy/generate', async (request) => {
  const { objective, strategy, visualStyle } = request.body as any;
  return await copywriter.generate(objective, strategy, visualStyle);
});

fastify.post('/api/projects/save', async (request, reply) => {
  const { objective, strategy, design, copy } = request.body as any;
  try {
    const finalPage = await assembler.assemble(objective, strategy, design, copy);
    const { data, error } = await supabase
      .from('projects')
      .insert([{ objective, strategy_summary: strategy, data: finalPage }])
      .select().single();
    if (error) throw error;
    return { id: data.id, page: finalPage };
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao salvar projeto' });
  }
});

// Listar todos os projetos para o Portfólio
fastify.get('/api/projects', async (request, reply) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao buscar portfólio' });
  }
});

fastify.get('/api/projects/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  try {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } catch (error) {
    return reply.status(404).send({ error: 'Projeto não encontrado' });
  }
});

fastify.get('/api/image-proxy', async (request, reply) => {
  const { prompt, seed } = request.query as { prompt: string, seed?: string };
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed || '123'}`;
  try {
    const response = await fetchWithRetry(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    reply.header('Content-Type', 'image/png').send(buffer);
  } catch (error) {
    return reply.status(500).send({ error: 'Erro no proxy' });
  }
});

const start = async () => {
  const port = Number(process.env.PORT) || 3333;
  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(`🚀 Server running at http://0.0.0.0:${port}`);
};
start();
