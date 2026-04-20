import { Rocket, Layout, Target, Zap, FolderOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation Simples */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-10 h-10 text-blue-600 fill-blue-600" />
            <span className="font-black text-2xl tracking-tighter">LandingAI</span>
          </div>
          <Link 
            href="/create" 
            className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-blue-600 transition-all active:scale-95"
          >
            Começar Agora
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
             <Zap className="w-3 h-3 fill-blue-700" /> IA de Alta Performance
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-[1.05] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-600 bg-clip-text text-transparent max-w-4xl mx-auto">
            Gere Landing Pages que vendem, em segundos.
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Nossa Inteligência Artificial cuida da estratégia, do design e do copywriting. Tudo o que você precisa é de um objetivo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
            <Link
              href="/create"
              className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <Rocket className="w-6 h-6" />
              Criar com IA
            </Link>
            <Link
              href="/portfolio"
              className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-slate-200 hover:border-blue-600 text-slate-700 hover:text-blue-600 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3"
            >
              <FolderOpen className="w-6 h-6" />
              Ver Portfólio
            </Link>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="grid md:grid-cols-3 gap-16">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Target className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">O que é Landing Page?</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Diferente de um site comum, uma LP tem foco em uma única ação (conversão). É a ferramenta mais poderosa do marketing digital.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Layout className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">IA Generativa</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Utilizamos modelos de ponta para gerar cores harmônicas, logomarcas vetoriais e textos persuasivos baseados em frameworks reais.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <FolderOpen className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">Seu Portfólio</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Salve todas as suas criações, visualize em tela cheia e use como inspiração para novos negócios.
                  </p>
                </div>
             </div>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center">
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
          IA Academy - Trabalho de Conclusão de Curso
        </p>
      </footer>
    </div>
  );
}
