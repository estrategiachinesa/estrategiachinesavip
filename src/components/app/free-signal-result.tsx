
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, HelpCircle, Clock, Target, Timer, Zap, Activity } from 'lucide-react';
import { CurrencyFlags } from './currency-flags';
import AffiliateLink from './affiliate-link';
import { SignalData } from '@/app/demo/page';
import { cn } from '@/lib/utils';
import { Asset } from '@/app/analisador/page';
import { useAppConfig } from '@/firebase';
import { playSignalSound } from '@/lib/audio';

type FreeSignalResultProps = {
  data: SignalData;
  onReset: () => void;
  isMarketMode: boolean;
  isSignalFinished: boolean;
};

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function FreeSignalResult({ data, onReset, isMarketMode, isSignalFinished }: FreeSignalResultProps) {
  const { asset, expirationTime, targetTime, signal } = data;
  const { config } = useAppConfig();
  const isCall = signal?.includes('CALL');

  const renderStatus = () => {
    if (data.operationStatus === 'pending' && data.countdown !== null && data.countdown > 0) {
      return (
        <div className="flex flex-col items-center gap-1 animate-pulse">
          <span className="text-[0.55rem] font-bold tracking-widest text-amber-500/80 uppercase">Iniciando Em</span>
          <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
            <Timer className="h-3 w-3 text-amber-500" />
            <span className="text-amber-400 font-mono font-bold text-sm">{formatTime(data.countdown)}</span>
          </div>
        </div>
      );
    }
    if (data.operationStatus === 'active' && data.operationCountdown !== null && data.operationCountdown > 0) {
        const isPurchaseTimeOver = data.operationCountdown <= 29;
        const isBlinking = data.operationCountdown <= 3;

        return (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.55rem] font-bold tracking-widest text-white/40 uppercase">Tempo de Operação</span>
            <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-xl border transition-all duration-300",
                isPurchaseTimeOver ? 'bg-rose-500/10 border-rose-500/20' : 'bg-blue-500/10 border-blue-500/20'
            )}>
              <Activity className={cn("h-3.5 w-3.5", isPurchaseTimeOver ? 'text-rose-500' : 'text-blue-400')} />
              <span className={cn(
                "font-mono font-bold text-sm",
                isPurchaseTimeOver ? 'text-rose-500' : 'text-blue-400',
                isBlinking && 'animate-pulse'
              )}>
                {formatTime(data.operationCountdown)}
              </span>
            </div>
          </div>
        );
    }
    if (data.operationStatus === 'finished') {
        return (
            <div className="flex items-center justify-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-xl border border-emerald-500/20">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">✅ Operação Finalizada</span>
            </div>
        );
    }
     return (
       <div className="flex items-center gap-1.5 text-white/30">
         <Timer className="h-3.5 w-3.5 animate-pulse" />
         <span className="text-[0.55rem] font-black uppercase tracking-widest">Aguardando Início...</span>
       </div>
     );
  };

  const actionContent = () => {
    if (isMarketMode && signal && signal !== '?') {
      return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center py-4 px-4 rounded-[1.5rem] border shadow-2xl transition-all duration-700 overflow-hidden",
                isCall 
                    ? "bg-gradient-to-b from-emerald-950/20 to-emerald-900/10 border-emerald-500/20 text-emerald-400 shadow-emerald-950/20" 
                    : "bg-gradient-to-b from-rose-950/20 to-rose-900/10 border-rose-500/20 text-rose-400 shadow-rose-950/20"
            )}
          >
            <div className="absolute inset-x-0 top-0 h-[50%] bg-white/[0.02] rounded-t-[1.5rem] pointer-events-none" />
            <div className={cn(
                "absolute inset-0 opacity-10 blur-xl",
                isCall ? "bg-emerald-500" : "bg-rose-500"
            )} />
            
            <span className="text-[0.5rem] font-black uppercase tracking-[0.35em] mb-1.5 opacity-50 relative z-10">AÇÃO RECOMENDADA</span>
            <span className="text-2xl font-black uppercase tracking-tight relative z-10">
              {signal}
            </span>

            <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-current opacity-35" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-current opacity-35" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-current opacity-35" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-current opacity-35" />
          </div>
      );
    }
    return (
      <div className="space-y-4">
        <div className="relative flex justify-between items-center text-lg font-black p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-white/50">
          <span className="text-xs uppercase tracking-widest text-white/30">Ação:</span>
          <div className="flex items-center gap-1.5 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 text-rose-400">
            <HelpCircle className="h-4 w-4 animate-bounce" />
            <span className="text-xs uppercase font-black tracking-widest">SINAL BLOQUEADO</span>
          </div>
        </div>
      
        <div className="pt-2 space-y-2.5">
          <p className="text-xs text-primary font-black uppercase tracking-widest animate-pulse">Revele este sinal e tenha acesso ILIMITADO!</p>
          <Button asChild className="w-full h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-wider shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all">
            <AffiliateLink href="/vip">
              Adquirir Licença VIP
            </AffiliateLink>
          </Button>
          <Button asChild variant="outline" className="w-full h-11 rounded-2xl border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-wider text-xs">
            <AffiliateLink href={config?.exnovaUrl || '#'} target="_blank">
              Revelar Sinal Grátis (Via Cadastro)
            </AffiliateLink>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-sm space-y-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className={cn(
          'border border-white/10 bg-black/80 backdrop-blur-3xl rounded-[2rem] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative group transition-all duration-700',
          isMarketMode && isCall && signal !== '?' && 'border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]',
          isMarketMode && !isCall && signal !== '?' && 'border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.15)]'
        )}>
        {/* Decorator Lines */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <CardHeader className="pt-5 pb-2">
          <CardTitle className="text-xs font-black flex items-center justify-center gap-2 text-white/40 uppercase tracking-[0.3em]">
            <Zap className="h-3 w-3 text-primary animate-pulse" />
            <span>Sinal Processado</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 px-6 pb-6">
          {/* Tech capsules */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center bg-white/[0.08] p-3 rounded-2xl border border-white/15 hover:border-primary/30 hover:bg-white/[0.12] transition-all duration-300 shadow-md">
              <span className="text-[0.6rem] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Ativo</span>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <CurrencyFlags asset={asset as Asset} />
                  <span className="font-extrabold text-[0.75rem] text-white uppercase tracking-tight">{asset.replace(' (OTC)', '')}</span>
                </div>
                {asset.includes('OTC') && (
                  <span className="text-[0.55rem] font-black bg-amber-500/20 text-amber-400 px-1.5 py-0.25 rounded border border-amber-500/30 tracking-wider uppercase">OTC</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center bg-white/[0.08] p-3 rounded-2xl border border-white/15 hover:border-primary/30 hover:bg-white/[0.12] transition-all duration-300 shadow-md">
              <span className="text-[0.6rem] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Expiração</span>
              <div className="flex items-center gap-1.5 text-white">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="font-extrabold text-[0.75rem]">{expirationTime}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center bg-white/[0.08] p-3 rounded-2xl border border-white/15 hover:border-primary/30 hover:bg-white/[0.12] transition-all duration-300 shadow-md">
              <span className="text-[0.6rem] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Entrada</span>
              <div className="flex items-center gap-1.5 text-white">
                <Target className="h-3.5 w-3.5 text-primary" />
                <span className="font-extrabold text-[0.75rem] font-mono tracking-wider">{targetTime}</span>
              </div>
            </div>
          </div>
          
          {actionContent()}

          {isMarketMode && (
             <div className="pt-1 min-h-[40px] flex items-center justify-center">
                {renderStatus()}
             </div>
          )}
        </CardContent>
      </Card>

      <div className="px-1">
        <Button 
          variant="ghost" 
          onClick={() => {
            playSignalSound('click');
            onReset();
          }} 
          className="w-full h-11 rounded-2xl text-xs font-black uppercase tracking-wider text-white/40 hover:text-white/80 hover:bg-white/5"
          disabled={isMarketMode && !isSignalFinished}
        >
            <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
            Analisar Outro Ativo
        </Button>
      </div>
    </div>
  );
}
