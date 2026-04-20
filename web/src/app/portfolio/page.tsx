"use client";

import { useEffect, useState } from "react";
import { 
  Zap, 
  ArrowLeft, 
  ExternalLink, 
  Target, 
  Calendar,
  Loader2,
  FolderOpen
} from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  created_at: string;
  objective: string;
  strategy_summary: string;
  data: {
    name: string;
    design: { 
      colors: { primary: string; background: string; }; 
      images: { hero: string; logo: string; };
    };
    content: { hero: { headline: string; }; };
  };
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`);
        const data = await res.json();
        setProjects(data);
      } catch (e) {
        console.error("Erro ao carregar portfólio");
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const getImg = (p: string) => `${process.env.NEXT_PUBLIC_API_URL}/api/image-proxy?prompt=${encodeURIComponent(p)}&seed=123`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600 fill-blue-600" />
            <span className="font-black text-xl tracking-tighter">Portfólio de Sucesso</span>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar para Home
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-16 text-center md:text-left">
           <h1 className="text-4xl font-black tracking-tight mb-4">Suas Landing Pages</h1>
           <p className="text-slate-500 font-medium">Visualize e analise todas as estratégias geradas pela nossa IA.</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
             <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
             <p className="font-bold text-slate-400">Buscando seu histórico...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <FolderOpen className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <h3 className="text-2xl font-bold text-slate-400">Nenhum projeto encontrado</h3>
             <Link href="/create" className="text-blue-600 font-bold hover:underline mt-4 inline-block">Criar minha primeira Landing Page</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
             {projects.map((project) => (
               <Link 
                key={project.id} 
                href={`/preview/${project.id}`}
                className="group bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-100 transition-all overflow-hidden flex flex-col lg:flex-row"
               >
                  {/* Imagem Real Gerada pela IA - Largura Reduzida */}
                  <div className="w-full lg:w-80 h-64 lg:h-auto relative shrink-0 overflow-hidden bg-slate-200">
                     <img 
                        src={getImg(project.data.design.images.hero)} 
                        alt={project.data.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                           <ExternalLink className="w-4 h-4" /> VISUALIZAR PÁGINA
                        </div>
                     </div>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="flex-1 p-8 md:p-12 space-y-6">
                     <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
                              <Target className="w-3 h-3" /> {project.objective}
                           </div>
                           <h3 className="text-3xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                              {project.data.name}
                           </h3>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-black bg-slate-50 px-4 py-2 rounded-full border border-slate-100 uppercase tracking-tighter">
                           <Calendar className="w-4 h-4" />
                           {new Date(project.created_at).toLocaleDateString('pt-BR')}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <p className="text-slate-600 font-bold leading-tight line-clamp-2 text-xl">
                           {project.data.content.hero.headline}
                        </p>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                           <p className="text-sm text-slate-500 font-medium italic line-clamp-3 leading-relaxed">
                              "{project.strategy_summary}"
                           </p>
                        </div>
                     </div>

                     <div className="pt-4 flex items-center gap-2 text-blue-600 font-black text-sm group-hover:gap-4 transition-all">
                        ABRIR PROJETO COMPLETO <ExternalLink className="w-4 h-4" />
                     </div>
                  </div>
               </Link>
             ))}
          </div>
        )}
      </main>
    </div>
  );
}
