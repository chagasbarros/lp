"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface LandingPageData {
  name: string;
  design: {
    colors: { primary: string; secondary: string; background: string; text: string; };
    images: { logo: string; hero: string; features: string[]; };
  };
  content: {
    hero: { headline: string; subheadline: string; cta: string; };
    features: { title: string; description: string; icon: string; }[];
    socialProof: string;
    faq: { question: string; answer: string; }[];
    footerText: string;
  };
}

export default function PreviewPage() {
  const { id } = useParams();
  const [project, setProject] = useState<{ data: LandingPageData } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProject(data);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="font-bold text-slate-600">Carregando sua Landing Page...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
        <AlertTriangle className="w-16 h-16 text-amber-500" />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Projeto não encontrado</h2>
          <p className="text-slate-500">Verifique se o ID está correto ou se o backend está rodando.</p>
        </div>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Voltar para Home</Link>
      </div>
    );
  }

  const { data } = project;
  const getImg = (p: string) => `${process.env.NEXT_PUBLIC_API_URL}/api/image-proxy?prompt=${encodeURIComponent(p)}&seed=123`;

  return (
    <div className="min-h-screen font-sans selection:bg-blue-100" style={{ backgroundColor: data.design.colors.background, color: data.design.colors.text }}>
      
      {/* Header */}
      <nav className="p-6 md:px-12 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-40 border-b border-black/5">
        <div className="flex items-center gap-3">
          <img src={getImg(data.design.images.logo)} alt="Logo" className="h-10 w-10 object-contain" />
          <span className="font-black text-2xl tracking-tighter">{data.name}</span>
        </div>
        <button className="hidden md:block px-6 py-3 rounded-full font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: data.design.colors.primary }}>
          {data.content.hero.cta}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-6 overflow-hidden">
         <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-in slide-in-from-left duration-1000">
               <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-slate-900">
                  {data.content.hero.headline}
               </h1>
               <p className="text-xl md:text-2xl opacity-80 leading-relaxed font-medium">
                  {data.content.hero.subheadline}
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-10 py-5 rounded-2xl font-black text-xl text-white shadow-2xl transition-all hover:-translate-y-1" style={{ backgroundColor: data.design.colors.primary }}>
                     {data.content.hero.cta}
                  </button>
               </div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <LucideIcons.ShieldCheck className="w-4 h-4 text-green-500" />
                  {data.content.socialProof}
               </p>
            </div>
            <div className="relative animate-in zoom-in duration-1000 delay-200">
               <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-2xl" />
               <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white">
                  <img src={getImg(data.design.images.hero)} alt="Hero" className="w-full aspect-[4/3] object-cover" />
               </div>
            </div>
         </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white/30 border-y border-black/5">
         <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
               <h2 className="text-4xl font-black tracking-tight text-slate-900">Por que escolher o {data.name}?</h2>
               <p className="text-lg font-medium opacity-60">Soluções pensadas estrategicamente para o seu sucesso.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
               {data.content.features.map((feature, i) => {
                  const Icon = (LucideIcons as any)[feature.icon] || LucideIcons.Sparkles;
                  return (
                    <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 transition-all hover:-translate-y-2 group">
                       <div className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center transition-colors" style={{ backgroundColor: data.design.colors.secondary + '15' }}>
                          <Icon className="w-8 h-8" style={{ color: data.design.colors.secondary }} />
                       </div>
                       <h3 className="text-2xl font-black mb-4 text-slate-900">{feature.title}</h3>
                       <p className="text-slate-500 leading-relaxed font-medium">{feature.description}</p>
                    </div>
                  );
               })}
            </div>
         </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
         <h2 className="text-3xl font-black text-center mb-16 text-slate-900">Dúvidas Frequentes</h2>
         <div className="space-y-6">
            {data.content.faq.map((item, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm">
                 <h4 className="text-xl font-bold mb-3 flex items-start gap-3">
                    <span className="text-blue-600 text-2xl leading-none">?</span>
                    {item.question}
                 </h4>
                 <p className="text-slate-500 font-medium pl-6 border-l-2 border-slate-100">{item.answer}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Final CTA / Footer */}
      <footer className="py-20 px-6 text-center space-y-10 border-t border-black/5" style={{ backgroundColor: 'white' }}>
         <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Dê o primeiro passo hoje.</h2>
         <button className="px-12 py-6 rounded-2xl font-black text-2xl text-white shadow-2xl shadow-blue-200" style={{ backgroundColor: data.design.colors.primary }}>
            {data.content.hero.cta}
         </button>
         <div className="pt-12">
            <p className="text-sm font-black uppercase tracking-widest opacity-30">{data.content.footerText}</p>
            <p className="mt-4 text-xs font-bold text-slate-400">© 2026 {data.name}. Todos os direitos reservados.</p>
         </div>
      </footer>
    </div>
  );
}
