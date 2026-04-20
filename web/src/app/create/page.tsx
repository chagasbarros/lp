"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Target, 
  Lightbulb, 
  Palette, 
  Eye, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Zap,
  Sparkles,
  Loader2,
  AlertCircle,
  TrendingUp,
  XCircle,
  Upload,
  Image as ImageIcon,
  Type,
  Wand2,
  RefreshCw,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, name: "Objetivo", icon: Target, description: "O que você quer alcançar?" },
  { id: 2, name: "Estratégia", icon: Lightbulb, description: "Validar sua ideia com IA" },
  { id: 3, name: "Identidade", icon: Palette, description: "Cores e imagens" },
  { id: 4, name: "Prévia", icon: Eye, description: "Resultado final" },
];

const OBJECTIVES = [
  { id: 'leads', label: 'Captar Leads', desc: 'Newsletter, formulário de contato' },
  { id: 'venda', label: 'Vender Produto/Serviço', desc: 'Foco direto em conversão paga' },
  { id: 'eventos', label: 'Inscrições em Eventos', desc: 'Webinars, palestras, cursos' },
  { id: 'materiais', label: 'Entregar Materiais', desc: 'E-books, templates, checklists' },
  { id: 'mvp', label: 'Testar MVP/Ideia', desc: 'Validar demanda de mercado' },
];

const QUESTIONS_MAP: Record<string, { q: string, placeholder: string }[]> = {
  leads: [
    { q: "Qual o principal benefício que você oferece em troca do contato?", placeholder: "Ex: Uma consultoria gratuita de 15 min" },
    { q: "Quem é o seu público-alvo ideal?", placeholder: "Ex: Donos de pequenas empresas" },
    { q: "Qual a maior dor que você resolve para eles?", placeholder: "Ex: Falta de tempo para organizar finanças" }
  ],
  venda: [
    { q: "O que exatamente você está vendendo e qual o diferencial?", placeholder: "Ex: Mentoria de carreira com foco em recolocação" },
    { q: "Qual transformação que o cliente terá?", placeholder: "Ex: Conseguir um novo emprego em até 3 meses" },
    { q: "Qual a maior objeção que seus clientes costumam ter?", placeholder: "Ex: Acham que o investimento é muito alto" }
  ],
  eventos: [
    { q: "Qual o nome, data e formato do evento?", placeholder: "Ex: Workshop Finanças Pro, 15/05, Online" },
    { q: "Quais os 3 principais tópicos que serão abordados?", placeholder: "Ex: Planejamento, Investimentos e Aposentadoria" },
    { q: "Por que este evento é indispensável para o seu público?", placeholder: "Ex: É a única chance de aprender direto com especialistas" }
  ],
  materiais: [
    { q: "Qual o título do material e o que a pessoa vai aprender?", placeholder: "Ex: E-book Guia do Investidor Iniciante" },
    { q: "Qual transformação imediata esse material entrega?", placeholder: "Ex: Aprender a investir os primeiros R$ 100,00" },
    { q: "Por que baixar esse material agora?", placeholder: "Ex: O mercado está mudando e quem não souber isso vai perder dinheiro" }
  ],
  mvp: [
    { q: "Qual a hipótese principal que você quer validar?", placeholder: "Ex: Se as pessoas pagariam por um app de marmitas fitness" },
    { q: "Como funciona a sua solução em uma frase?", placeholder: "Ex: Um app que conecta cozinheiros locais a clientes" },
    { q: "Qual ação você quer que o usuário tome (CTA)?", placeholder: "Ex: Entrar na lista de espera exclusiva" }
  ]
};

interface AIEvaluation {
  status: 'accepted' | 'needs_improvement' | 'rejected';
  feedback: string;
  suggestions: string[];
  score: number;
}

interface AIIdentity {
  colors: { primary: string; secondary: string; background: string; text: string; };
  logoPrompt: string;
  imagePrompts: string[];
  visualStyle: string;
}

interface AIPageContent {
  hero: { headline: string; subheadline: string; cta: string; };
  features: { title: string; description: string; icon: string; }[];
  socialProof: string;
  faq: { question: string; answer: string; }[];
  footerText: string;
}

export default function CreateLandingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState<AIEvaluation | null>(null);

  const [colors, setColors] = useState(["#3b82f6", "#6366f1", "#ffffff"]);
  const [isGeneratingIdentity, setIsGeneratingIdentity] = useState(false);
  const [brandVibe, setBrandVibe] = useState("");
  const [generatedIdentity, setGeneratedIdentity] = useState<AIIdentity | null>(null);

  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [pageContent, setPageContent] = useState<AIPageContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Requisitos de cada etapa
  const isStep1Complete = !!selectedObjective;
  const isStep2Complete = aiEvaluation && aiEvaluation.score >= 70;
  const isStep3Complete = !!generatedIdentity;

  const canAccessStep = (stepId: number) => {
    if (stepId === 1) return true;
    if (stepId === 2) return isStep1Complete;
    if (stepId === 3) return isStep1Complete && isStep2Complete;
    if (stepId === 4) return isStep1Complete && isStep2Complete && isStep3Complete;
    return false;
  };

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({ ...prev, [`${selectedObjective}_${index}`]: value }));
  };

  const getSummary = () => {
    if (!selectedObjective) return "";
    const questions = QUESTIONS_MAP[selectedObjective];
    return questions.map((q, i) => `P: ${q.q}\nR: ${answers[`${selectedObjective}_${i}`] || ""}`).join("\n\n");
  };

  const evaluateStrategy = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategy/evaluate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: selectedObjective, strategy: getSummary() }),
      });
      setAiEvaluation(await res.json());
    } catch (e) { alert("Erro na avaliação."); } finally { setIsEvaluating(false); }
  };

  const generateAIIdentity = async () => {
    if (!brandVibe) return;
    setIsGeneratingIdentity(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/design/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: selectedObjective, strategy: getSummary(), vibe: brandVibe }),
      });
      const data = await res.json();
      setGeneratedIdentity(data);
      setColors([data.colors.primary, data.colors.secondary, data.colors.background]);
    } catch (e) { alert("Erro ao gerar identidade visual."); } finally { setIsGeneratingIdentity(false); }
  };

  const generateCopy = async () => {
    setIsGeneratingCopy(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/copy/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: selectedObjective, strategy: getSummary(), visualStyle: generatedIdentity?.visualStyle || "Moderno" }),
      });
      setPageContent(await res.json());
    } catch (e) { alert("Erro no copywriting."); } finally { setIsGeneratingCopy(false); }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: selectedObjective, strategy: getSummary(),
          design: generatedIdentity,
          copy: pageContent
        }),
      });
      const data = await res.json();
      router.push(`/preview/${data.id}`);
    } catch (e) { alert("Erro ao salvar."); } finally { setIsSaving(false); }
  };

  const getImageUrl = (prompt: string) => {
    const cleanPrompt = prompt.replace(/["']/g, "").trim();
    return `${process.env.NEXT_PUBLIC_API_URL}/api/image-proxy?prompt=${encodeURIComponent(cleanPrompt)}&seed=123`;
  };

  const nextStep = () => {
    const next = Math.min(currentStep + 1, STEPS.length);
    if (next === 4 && !pageContent) generateCopy();
    setCurrentStep(next);
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-72 bg-white border-r border-slate-200 p-10 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-16"><Zap className="w-10 h-10 text-blue-600 fill-blue-600" /><span className="font-black text-2xl tracking-tighter">LandingAI</span></div>
        <nav className="flex-1 ml-2">
          <ul className="space-y-10">
            {STEPS.map((step) => {
              const Icon = step.icon; 
              const isActive = currentStep === step.id; 
              const isCompleted = currentStep > step.id;
              const isLocked = !canAccessStep(step.id);

              return (
                <li key={step.id} className="relative">
                  <button 
                    onClick={() => !isLocked && setCurrentStep(step.id)}
                    disabled={isLocked}
                    className={cn(
                      "flex items-center gap-5 transition-all group w-full text-left outline-none",
                      isActive ? "translate-x-2" : isLocked ? "opacity-40 cursor-not-allowed" : "hover:translate-x-1"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm",
                      isActive ? "border-blue-600 bg-blue-600 text-white shadow-blue-200 shadow-lg scale-110" : 
                      isCompleted ? "border-green-500 bg-green-500 text-white shadow-green-100" : "border-slate-200 bg-white text-slate-400")}>
                      {isLocked ? <Lock className="w-5 h-5" /> : isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div><p className={cn("text-lg font-bold tracking-tight", isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-slate-400")}>{step.name}</p></div>
                  </button>
                  {step.id !== STEPS.length && <div className={cn("absolute left-6 top-12 w-0.5 h-10 -ml-px", isCompleted ? "bg-green-500/30" : "bg-slate-200")} />}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col p-6 md:p-12 overflow-y-auto items-center">
        <div className="max-w-5xl w-full flex-1 flex flex-col">
          <div className="bg-white rounded-[3rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-slate-200/60 p-10 md:p-16 flex-1 flex flex-col relative overflow-hidden transition-all">
            <div className="flex-1 pt-4">
              
              {currentStep === 1 && (
                <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8 text-center">
                  <h2 className="text-3xl font-black tracking-tight mb-10">Escolha o objetivo da sua Landing Page</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                    {OBJECTIVES.map((obj) => {
                      const isSelected = selectedObjective === obj.id;
                      return (
                        <button key={obj.id} onClick={() => setSelectedObjective(obj.id)} className={cn("group p-8 border-2 rounded-[2.5rem] transition-all relative overflow-hidden", isSelected ? "border-blue-600 bg-blue-50/50 shadow-lg ring-4 ring-blue-50" : "border-slate-100 bg-white hover:border-slate-200")}>
                          <p className={cn("font-black text-xl mb-2", isSelected ? "text-blue-700" : "text-slate-900")}>{obj.label}</p>
                          <p className="text-sm font-medium leading-relaxed opacity-70">{obj.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 2 && selectedObjective && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
                  <header className="mb-4 text-center"><h2 className="text-3xl font-black tracking-tight">Defina sua Estratégia</h2></header>
                  <div className="space-y-8">
                    {QUESTIONS_MAP[selectedObjective].map((item, index) => (
                      <div key={index} className="space-y-3">
                        <label className="text-lg font-bold text-slate-800 ml-2">{item.q}</label>
                        <input type="text" value={answers[`${selectedObjective}_${index}`] || ""} onChange={(e) => handleAnswerChange(index, e.target.value)} placeholder={item.placeholder} className="w-full p-6 rounded-3xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all text-slate-700 font-medium bg-slate-50/50" />
                      </div>
                    ))}
                    <button onClick={evaluateStrategy} disabled={isEvaluating} className="w-full p-6 bg-indigo-600 text-white rounded-3xl font-black text-xl hover:bg-indigo-700 shadow-xl disabled:opacity-50 transition-all">
                       {isEvaluating ? <><Loader2 className="w-6 h-6 animate-spin inline mr-2" /> Analisando...</> : "Avaliar Estratégia com IA"}
                    </button>
                    {aiEvaluation && (
                      <div className={cn("p-8 rounded-[2.5rem] border-2 animate-in zoom-in-95", aiEvaluation.score >= 70 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100")}>
                        <h4 className="font-black text-xl mb-4">{aiEvaluation.score}/100</h4>
                        <p className="italic text-slate-700">"{aiEvaluation.feedback}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12">
                  <header className="text-center">
                    <h2 className="text-3xl font-black tracking-tight mb-2">Identidade Visual</h2>
                    <p className="text-slate-400 font-medium italic">Defina as cores e a logomarca da sua página</p>
                  </header>

                  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-6">
                       <label className="text-sm font-black uppercase tracking-widest text-slate-400 block text-center md:text-left">Logomarca</label>
                       <div className="grid grid-cols-1 gap-4">
                          <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:border-blue-400 transition-colors cursor-pointer group h-48">
                             <Upload className="w-10 h-10 text-slate-300 group-hover:text-blue-500 mb-4" />
                             <span className="text-sm font-bold text-slate-400 group-hover:text-blue-600 text-center">Fazer Upload Manual</span>
                          </div>
                          
                          <div className="relative h-48">
                             <button 
                                onClick={generateAIIdentity}
                                disabled={isGeneratingIdentity || !brandVibe}
                                className={cn(
                                  "w-full h-full border-2 rounded-[2.5rem] p-6 flex flex-col items-center justify-center transition-all group overflow-hidden",
                                  brandVibe ? "bg-blue-50/50 border-blue-200 hover:border-blue-500" : "bg-slate-50/30 border-slate-100 opacity-50 cursor-not-allowed"
                                )}
                             >
                                {isGeneratingIdentity ? <Loader2 className="w-10 h-10 text-blue-600 animate-spin" /> : (
                                  <>
                                    <Sparkles className="w-10 h-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold text-blue-600">Gerar Logo com IA</span>
                                  </>
                                )}
                                {generatedIdentity && (
                                  <div className="absolute inset-0 bg-white p-4">
                                     <img src={getImageUrl(generatedIdentity.logoPrompt)} className="w-full h-full object-contain" />
                                     <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg"><CheckCircle2 className="w-4 h-4" /></div>
                                  </div>
                                )}
                             </button>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <label className="text-sm font-black uppercase tracking-widest text-slate-400 block text-center md:text-left">Cores da Marca</label>
                       <div className="space-y-6 flex flex-col items-center md:items-start">
                          <div className="flex gap-6">
                            {colors.map((color, i) => (
                              <div key={i} className="flex flex-col items-center gap-3">
                                 <input type="color" value={color} onChange={(e) => { const c = [...colors]; c[i] = e.target.value; setColors(c); }} className="w-20 h-20 rounded-[1.5rem] cursor-pointer border-4 border-white shadow-xl hover:scale-110 transition-transform" />
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{i === 0 ? 'Primária' : i === 1 ? 'Secundária' : 'Fundo'}</span>
                              </div>
                            ))}
                          </div>
                          {generatedIdentity && (
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in max-w-[280px]">
                               <p className="text-xs text-blue-800 font-bold flex items-center gap-2">
                                  <Sparkles className="w-3 h-3" /> IA aplicou cores baseadas no seu estilo!
                               </p>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>

                  <div className="max-w-2xl mx-auto pt-10 border-t border-slate-100 space-y-4">
                     <label className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4"><Type className="w-4 h-4 text-blue-600" /> Descreva o "tom" visual (vibe) da sua marca:</label>
                     <textarea value={brandVibe} onChange={(e) => setBrandVibe(e.target.value)} placeholder="Ex: Minimalista moderno, cores vibrantes, elegante e luxuoso..." className="w-full h-24 p-5 rounded-[1.5rem] border-2 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-medium resize-none bg-slate-50/30" />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="animate-in fade-in zoom-in-95 duration-700 flex flex-col h-full min-h-[500px] items-center justify-center text-center max-w-2xl mx-auto">
                   {isGeneratingCopy ? (
                     <div className="space-y-4"><Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" /><p className="font-black text-xl">Criando Copywriting...</p></div>
                   ) : (
                     <div className="space-y-8">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100 mx-auto"><CheckCircle2 className="w-12 h-12 text-green-500" /></div>
                        <h2 className="text-4xl font-black tracking-tight">Sua Landing Page está pronta!</h2>
                        <p className="text-xl text-slate-500 font-medium">Consolidamos seu design e textos em uma estrutura de alta performance.</p>
                     </div>
                   )}
                </div>
              )}
            </div>

            <footer className="mt-16 flex items-center justify-between pt-8 border-t border-slate-50">
              <button onClick={prevStep} disabled={currentStep === 1} className={cn("flex items-center gap-2 px-8 py-4 font-bold rounded-2xl transition-all", currentStep === 1 ? "opacity-0" : "text-slate-400 hover:text-slate-900")}><ChevronLeft className="w-6 h-6" /> Voltar</button>
              {currentStep === 4 ? (
                <button onClick={handleFinish} disabled={isSaving || !pageContent} className="flex items-center gap-3 px-12 py-5 bg-green-600 text-white font-black text-xl rounded-3xl shadow-xl hover:bg-green-700 active:scale-95 disabled:opacity-50 transition-all">
                  {isSaving ? <><Loader2 className="w-6 h-6 animate-spin" /> Finalizando...</> : <><Eye className="w-6 h-6" /> Ver Landing Page</>}
                </button>
              ) : (
                <button 
                  onClick={nextStep} 
                  disabled={!canAccessStep(currentStep + 1)} 
                  className={cn(
                    "flex items-center gap-3 px-12 py-5 bg-blue-600 text-white font-black text-lg rounded-3xl shadow-xl transition-all hover:bg-blue-700 active:scale-95",
                    !canAccessStep(currentStep + 1) ? "bg-slate-200 opacity-50 cursor-not-allowed" : ""
                  )}
                >
                   Próximo passo <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
