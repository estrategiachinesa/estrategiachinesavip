'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAppConfig } from '@/firebase';
import { 
  ShieldCheck, 
  Zap, 
  BarChart, 
  Clock, 
  Users, 
  Gift, 
  Timer, 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  Flame,
  Sparkles,
  Lock,
  CheckCircle2,
  BadgePercent
} from 'lucide-react';
import AffiliateLink from '@/components/app/affiliate-link';
import VipVslPlayer from '@/components/vip-vsl-player';
import { HotmartButton } from '@/components/app/hotmart-button';
import { useAffiliateRouter } from '@/hooks/use-affiliate-router';
import { cn } from '@/lib/utils';

// Real-time Countdown Timer for Black Friday Urgency targeting Nov 30
function BlackFridayCountdown() {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      // Target: Dia 30 de Novembro às 23:59:59 (Month 10 is November in JS)
      let target = new Date(currentYear, 10, 30, 23, 59, 59, 999);
      
      // If current date is past Nov 30 of the current year, target the 30th of current month or next year's Nov 30
      if (now.getTime() > target.getTime()) {
        target = new Date(currentYear, now.getMonth(), 30, 23, 59, 59, 999);
        if (now.getTime() > target.getTime()) {
          target = new Date(currentYear + 1, 10, 30, 23, 59, 59, 999);
        }
      }

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeRemaining());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 justify-center font-mono font-black">
      {timeLeft.days > 0 && (
        <>
          <div className="flex flex-col items-center bg-black/90 border border-amber-500/50 rounded-lg px-2 sm:px-2.5 py-1 shadow-inner">
            <span className="text-xs sm:text-base text-amber-300 font-extrabold">{pad(timeLeft.days)}</span>
            <span className="text-[0.5rem] sm:text-[0.55rem] text-muted-foreground uppercase font-sans">Dias</span>
          </div>
          <span className="text-amber-400 font-bold text-xs sm:text-sm animate-pulse">:</span>
        </>
      )}
      <div className="flex flex-col items-center bg-black/90 border border-amber-500/50 rounded-lg px-2 sm:px-2.5 py-1 shadow-inner">
        <span className="text-xs sm:text-base text-amber-400">{pad(timeLeft.hours)}</span>
        <span className="text-[0.55rem] sm:text-[0.6rem] text-muted-foreground uppercase font-sans">Horas</span>
      </div>
      <span className="text-amber-400 font-bold text-xs sm:text-sm animate-pulse">:</span>
      <div className="flex flex-col items-center bg-black/90 border border-amber-500/50 rounded-lg px-2 sm:px-2.5 py-1 shadow-inner">
        <span className="text-xs sm:text-base text-amber-400">{pad(timeLeft.minutes)}</span>
        <span className="text-[0.55rem] sm:text-[0.6rem] text-muted-foreground uppercase font-sans">Min</span>
      </div>
      <span className="text-amber-400 font-bold text-xs sm:text-sm animate-pulse">:</span>
      <div className="flex flex-col items-center bg-black/90 border border-amber-500/50 rounded-lg px-2 sm:px-2.5 py-1 shadow-inner">
        <span className="text-xs sm:text-base text-red-500">{pad(timeLeft.seconds)}</span>
        <span className="text-[0.55rem] sm:text-[0.6rem] text-muted-foreground uppercase font-sans">Seg</span>
      </div>
    </div>
  );
}

const Feature = ({ 
  icon: Icon, 
  title, 
  description,
  isBfBonus = false
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  isBfBonus?: boolean;
}) => (
  <div className={cn(
    "flex items-start gap-4 p-2.5 rounded-xl transition-all",
    isBfBonus ? "bg-amber-500/5 border border-amber-500/20" : "bg-transparent"
  )}>
    <div className={cn(
      "p-2 rounded-xl shrink-0",
      isBfBonus 
        ? "bg-gradient-to-br from-amber-500/20 to-red-500/20 text-amber-400 border border-amber-500/30" 
        : "bg-primary/10 text-primary"
    )}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <div className="flex items-center gap-2">
        <h3 className={cn(
          "font-bold text-base md:text-lg",
          isBfBonus ? "text-amber-300 font-black" : "text-foreground"
        )}>
          {title}
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
  </div>
);

export default function VipPage() {
  const { config, isConfigLoading, affiliateId } = useAppConfig();
  const router = useAffiliateRouter();

  // Active theme based on admin setting (defaulting to true)
  const isBlackFriday = config?.blackFridayTheme ?? true;

  // Kill Switch Check
  useEffect(() => {
    if (config?.pages?.vip === false) {
      router.replace('/');
    }
  }, [config, router]);

  // Checkout URL determination
  let checkoutUrl = isBlackFriday 
    ? (config?.blackFridayUrl || "https://pay.hotmart.com/E101943327K?checkoutMode=2&off=cy5v5mrr")
    : (config?.vipCheckoutUrl || config?.vipUrl || config?.hotmartUrl || "https://pay.hotmart.com/T101931662P?checkoutMode=2");

  if (affiliateId === 'wm') {
    checkoutUrl = 'https://go.hotmart.com/D103007301M?dp=1';
  } else if (affiliateId && !checkoutUrl.includes('afftrack=')) {
    const separator = checkoutUrl.includes('?') ? '&' : '?';
    checkoutUrl = `${checkoutUrl}${separator}afftrack=${affiliateId}`;
  }

  if (config?.pages?.vip === false) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black p-6">
        <div className="text-center space-y-4 animate-in fade-in duration-500">
          <AlertTriangle className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <h2 className="text-xl font-black uppercase text-white">Oferta Indisponível</h2>
          <p className="text-sm text-muted-foreground">Redirecionando...</p>
          <Button variant="outline" onClick={() => router.replace('/')}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-screen transition-colors duration-500",
      isBlackFriday 
        ? "bg-gradient-to-b from-black via-zinc-950 to-[#0a0505] text-white" 
        : "bg-background text-foreground"
    )}>
      
      {/* BLACK FRIDAY TOP PROMO BAR */}
      {isBlackFriday && (
        <div className="w-full bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-b border-amber-500/30 py-2.5 px-4 sticky top-0 z-50 backdrop-blur-md shadow-[0_4px_25px_rgba(245,158,11,0.15)]">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
                <Flame className="h-4 w-4 text-red-500 fill-red-500" />
                <span>BLACK FRIDAY LIBERADA</span>
                <span className="bg-red-600/40 border border-red-500/50 text-amber-300 text-[0.65rem] sm:text-xs font-black px-2 py-0.5 rounded shadow-sm">
                  ATÉ DIA 30/11
                </span>
                <span className="hidden md:inline text-white/60 font-medium">• MAIOR DESCONTO DO ANO</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-tight text-white/80 hidden sm:inline">
                A OFERTA ENCERRA EM:
              </span>
              <BlackFridayCountdown />
            </div>
          </div>
        </div>
      )}

      {/* HEADER / NAVIGATION */}
      <header className="p-4 w-full max-w-4xl mx-auto flex justify-between items-center">
        <Button variant="ghost" asChild className="hover:bg-white/10 text-white/80 hover:text-white">
          <AffiliateLink href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </AffiliateLink>
        </Button>

        {isBlackFriday && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider animate-pulse">
            <BadgePercent className="h-3.5 w-3.5" />
            <span>Desconto Liberado Até 30/11</span>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 flex-grow pb-12">
        {/* HERO */}
        <div className="text-center mb-8 md:mb-10 space-y-4">
          {isBlackFriday ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600/20 via-amber-500/20 to-red-600/20 border border-amber-500/40 text-amber-300 text-xs md:text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Sparkles className="h-4 w-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>BLACK FRIDAY • VÁLIDO ATÉ DIA 30 DE NOVEMBRO</span>
              <Flame className="h-4 w-4 text-red-500 fill-red-500" />
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <span>Oferta Exclusiva VIP</span>
            </div>
          )}

          <h1 className={cn(
            "text-3xl sm:text-4xl md:text-5xl font-extrabold font-headline tracking-tight",
            isBlackFriday
              ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.3)]"
              : "text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400"
          )}>
            {isBlackFriday 
              ? "BLACK FRIDAY: Domine o Mercado com Inteligência Artificial"
              : "Domine o Mercado com a Inteligência Artificial"}
          </h1>

          <p className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            {isBlackFriday 
              ? "A maior oportunidade do ano para desbloquear seu Acesso Vitalício com mais de 50% de desconto. Ferramenta completa, sinais sem Martingale e sem nenhuma mensalidade."
              : "Você está a um passo de desbloquear o acesso ilimitado à ferramenta que está revolucionando o mercado de opções binárias."}
          </p>
        </div>

        {/* VSL VIDEO SECTION */}
        <div className={cn(
          "mb-10 md:mb-14 rounded-2xl overflow-hidden transition-all duration-300",
          isBlackFriday 
            ? "p-1.5 bg-gradient-to-b from-amber-500/40 via-red-500/20 to-transparent border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
            : ""
        )}>
          {isBlackFriday && (
            <div className="bg-black/80 px-4 py-2 border-b border-amber-500/30 flex items-center justify-between text-xs font-black uppercase text-amber-300 tracking-wider">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span>Vídeo Oficial de Black Friday</span>
              </span>
              <span className="text-[0.65rem] text-muted-foreground font-mono">Assista com o áudio ligado</span>
            </div>
          )}
          <VipVslPlayer videoId={config?.vipVslId || "8RebjHIi7Ok"} />
        </div>

        {/* PRICING & OFFER CARD */}
        <Card className={cn(
          "backdrop-blur-xl transition-all duration-500 shadow-2xl",
          isBlackFriday 
            ? "bg-zinc-950/90 border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30" 
            : "bg-background/50 border-border/50 shadow-primary/10"
        )}>
          <CardHeader className={cn(
            "text-center p-6 md:p-8 border-b",
            isBlackFriday ? "border-amber-500/20 bg-gradient-to-b from-amber-500/10 to-transparent" : "border-border/20"
          )}>
            {isBlackFriday && (
              <div className="inline-block mx-auto mb-2">
                <span className="bg-red-600 text-white font-black uppercase text-xs px-3 py-1 rounded-md tracking-widest shadow-md">
                  OFERTA HISTÓRICA • VÁLIDA ATÉ DIA 30/11
                </span>
              </div>
            )}
            <h2 className={cn(
              "text-2xl md:text-3xl font-black uppercase tracking-tight",
              isBlackFriday ? "text-amber-400 drop-shadow" : "text-primary"
            )}>
              {isBlackFriday ? "Acesso VIP Vitalício • Black Friday" : "Acesso VIP Vitalício"}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-xl mx-auto">
              {isBlackFriday 
                ? "Um único pagamento com desconto especial de Black Friday para acesso para sempre. Sem mensalidades ou renovações."
                : "Um único pagamento para acesso para sempre. Sem mensalidades."}
            </p>
          </CardHeader>

          <CardContent className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
            {/* INCLUDED FEATURES */}
            <div className="space-y-3.5">
              <h3 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>O que você vai receber:</span>
              </h3>

              <Feature
                icon={Clock}
                title="Análise 24/7 com IA"
                description="Analise ativos quando quiser, 24 horas por dia, 7 dias por semana."
              />
              <Feature
                icon={ShieldCheck}
                title="Sinais sem Martingale"
                description="Estratégia segura e direta, sem a necessidade de aumentar sua exposição ao risco."
              />
              <Feature
                icon={BarChart}
                title="Mercado Aberto e OTC"
                description="Funciona tanto no mercado tradicional quanto em OTC, para você operar a qualquer momento."
              />
              <Feature
                icon={Timer}
                title="Expiração em 1m e 5m"
                description="Opere nos tempos de expiração mais populares e lucrativos do mercado."
              />
              <Feature
                icon={Users}
                title="Suporte Exclusivo VIP"
                description="Entre no grupo de membros VIP e tire suas dúvidas diretamente com a equipe."
              />
              <Feature
                icon={Gift}
                title="Conta Treinamento $10.000"
                description="Ao se registrar, você ganha acesso à conta com $10.000 para praticar sem riscos."
                isBfBonus={isBlackFriday}
              />
              {isBlackFriday && (
                <Feature
                  icon={Zap}
                  title="Atualizações Futuras Gratuitas"
                  description="Acesso vitalício garantido a todas as melhorias e novos algoritmos do robô."
                  isBfBonus={true}
                />
              )}
            </div>

            {/* CHECKOUT CARD */}
            <div className={cn(
              "p-6 sm:p-8 rounded-2xl border flex flex-col justify-center text-center relative overflow-hidden",
              isBlackFriday 
                ? "bg-gradient-to-b from-black via-zinc-900 to-black border-amber-500/40 shadow-xl" 
                : "bg-card/50 border-border"
            )}>


              <p className={cn(
                "text-xs font-black uppercase tracking-widest",
                isBlackFriday ? "text-amber-400" : "text-muted-foreground"
              )}>
                {isBlackFriday ? "🔥 CONDIÇÃO EXCLUSIVA DE BLACK FRIDAY (ATÉ DIA 30)" : "OFERTA ESPECIAL POR TEMPO LIMITADO"}
              </p>

              {/* Price Anchor */}
              {isBlackFriday && (
                <div className="mt-3 text-muted-foreground text-sm font-semibold line-through">
                  De R$ 197,00 por apenas
                </div>
              )}

              {/* Final Price */}
              {isConfigLoading ? (
                <div className="flex justify-center items-center my-4 h-14">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </div>
              ) : (
                <div className="my-2">
                  <p className={cn(
                    "text-4xl sm:text-5xl md:text-6xl font-black tracking-tight",
                    isBlackFriday 
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200" 
                      : "text-foreground"
                  )}>
                    {isBlackFriday ? (config?.blackFridayPrice || "R$ 97") : (config?.price || "R$ 197")}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    ou em até 12x no cartão de crédito
                  </p>
                </div>
              )}

              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Pagamento único • Acesso vitalício para sempre
              </p>

              {/* CTA BUTTON */}
              <div className="w-full mt-6">
                {isBlackFriday ? (
                  <HotmartButton url={checkoutUrl} className="w-full">
                    <div className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:via-orange-400 hover:to-red-500 text-black font-black uppercase text-sm sm:text-base tracking-tight shadow-[0_0_35px_rgba(245,158,11,0.45)] hover:shadow-[0_0_45px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 transition-all cursor-pointer">
                      <Flame className="h-5 w-5 fill-black text-black shrink-0 animate-bounce" />
                      <span>QUERO MEU ACESSO BLACK FRIDAY</span>
                    </div>
                  </HotmartButton>
                ) : (
                  <HotmartButton url={checkoutUrl} />
                )}
              </div>

              {/* GUARANTEE & SECURITY BADGES */}
              <div className="space-y-2 mt-5">
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Garantia incondicional de 7 dias ou seu dinheiro de volta.</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[0.65rem] text-muted-foreground opacity-75">
                  <Lock className="h-3 w-3 text-amber-400 shrink-0" />
                  <span>Ambiente criptografado e checkout 100% seguro via Hotmart.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* FOOTER */}
      <footer className="w-full text-center text-xs text-foreground/50 p-4 border-t border-white/5">
        <p>© 2026 ESTRATÉGIA CHINESA. Todos os direitos reservados.</p>
        <div className="flex justify-center gap-4 mt-2">
          <AffiliateLink href="/legal#terms" className="underline underline-offset-2 hover:text-foreground">Termos de Uso</AffiliateLink>
          <AffiliateLink href="/legal#privacy" className="underline underline-offset-2 hover:text-foreground">Política de Privacidade</AffiliateLink>
          <AffiliateLink href="/legal#cookies" className="underline underline-offset-2 hover:text-foreground">Política de Cookies</AffiliateLink>
        </div>
        <p className="max-w-xl mx-auto text-[0.6rem] mt-2 opacity-60">
          Aviso Legal: Todas as estratégias e investimentos envolvem risco de perda. Nenhuma informação contida neste produto deve ser interpretada como uma garantia de resultados.
        </p>
      </footer>
    </div>
  );
}
