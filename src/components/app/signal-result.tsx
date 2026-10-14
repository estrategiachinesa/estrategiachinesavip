'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, Clock, Timer, Target, Zap, Activity } from 'lucide-react';
import type { SignalData } from '@/app/analisador/page';
import { CurrencyFlags } from './currency-flags';
import { cn } from '@/lib/utils';
import { playSignalSound } from '@/lib/audio';

type SignalResultProps = {
  data: SignalData;
  onReset: () => void;
};

export function SignalResult({ data, onReset }: SignalResultProps) {
  const isCall = data.signal.includes('CALL');
  const isFinished = data.operationStatus === 'finished';
  const isActive = data.operationStatus === 'active';
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const renderStatus = () => {
    if (data.operationStatus === 'pending' && data.countdown !== null && data.countdown > 0) {
      return (
        <div className="flex flex-col items-center gap-1.5 animate-pulse">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[0.65rem] md:text-[0.7rem] font-black uppercase tracking-[0.22em] text-amber-500/80">Sinal em Espera</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-1.5 md:px-5 md:py-2 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.12)] backdrop-blur-md">
            <Timer className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-amber-500 font-mono font-black text-base md:text-lg tracking-tight">{formatTime(data.countdown)}</span>
          </div>
        </div>
      );
    }
    if (data.operationStatus === 'active' && data.operationCountdown !== null && data.operationCountdown > 0) {
        const isPurchaseTimeOver = data.operationCountdown <= 29;
        const isBlinking = data.operationCountdown <= 3;

        return (
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full animate-ping", 
                isPurchaseTimeOver ? "bg-rose-500" : "bg-emerald-500"
              )} />
              <span className={cn(
                "text-[0.65rem] md:text-[0.7rem] font-black uppercase tracking-[0.22em]",
                isPurchaseTimeOver ? "text-rose-500/80" : "text-emerald-500/80"
              )}>
                {isPurchaseTimeOver ? "Janela Expirando" : "Sinal Ativo"}
              </span>
            </div>
            <div className={cn(
                "flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-xl border transition-all duration-500 backdrop-blur-md shadow-lg",
                isPurchaseTimeOver 
                  ? 'bg-rose-500/10 border-rose-500/25 shadow-[0_0_15px_rgba(244,63,94,0.12)]' 
                  : 'bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.12)]'
            )}>
              <Activity className={cn("h-3.5 w-3.5 animate-pulse", isPurchaseTimeOver ? 'text-rose-500' : 'text-emerald-400')} />
              <span className={cn(
                "font-mono font-black text-base md:text-lg tracking-tight",
                isPurchaseTimeOver ? 'text-rose-500' : 'text-emerald-400',
                isBlinking && 'scale-105'
              )}>
                {formatTime(data.operationCountdown)}
              </span>
            </div>
          </div>
        );
    }
    if (data.operationStatus === 'finished') {
        return (
            <div className="flex items-center justify-center gap-2.5 bg-emerald-500/10 px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl border border-emerald-500/20 animate-in zoom-in-95 duration-700 shadow-lg shadow-emerald-500/5 backdrop-blur-md">
                <div className="bg-emerald-500 p-0.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-black stroke-[3]" />
                </div>
                <span className="text-[0.65rem] md:text-xs font-black uppercase tracking-[0.12em] text-emerald-400">Processo Finalizado</span>
            </div>
        );
    }
     return (
       <div className="flex items-center gap-1.5 text-white/40 animate-pulse">
         <RefreshCw className="h-3 w-3 md:h-3.5 md:w-3.5 animate-spin text-primary/60" />
         <p className="text-[0.55rem] md:text-[0.6rem] font-black uppercase tracking-[0.18em]">Sincronizando Engine...</p>
       </div>
     );
  };


  return (
    <div className="w-full max-w-md md:max-w-[380px] space-y-2 md:space-y-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Card
        className={cn(
          'border border-white/10 bg-black/80 backdrop-blur-3xl rounded-[1.6rem] md:rounded-[2rem] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative group transition-all duration-700',
          isActive && (isCall ? 'border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]' : 'border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.15)]')
        )}
      >
        {/* Decorator HUD Lines */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        {/* Top Status Bar indicator */}
        <div className={cn(
            "h-1.5 w-full transition-all duration-1000 relative",
            isActive ? "animate-pulse" : "",
            isCall 
              ? "bg-gradient-to-r from-emerald-500/80 via-emerald-400 to-emerald-500/80 shadow-[0_1px_15px_rgba(16,185,129,0.5)]" 
              : "bg-gradient-to-r from-rose-500/80 via-rose-400 to-rose-500/80 shadow-[0_1px_15px_rgba(244,63,94,0.5)]"
        )}>
          {/* Active light sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2.5s_infinite] pointer-events-none" />
        </div>

        <CardHeader className="pt-3.5 md:pt-6 pb-1 md:pb-2 relative z-10">
          <CardTitle className="flex items-center justify-center gap-2">
             <Zap className={cn("h-3 w-3 md:h-3.5 md:w-3.5 animate-pulse", isCall ? "text-emerald-400" : "text-rose-400")} />
             <span className="text-[0.6rem] md:text-[0.65rem] font-black uppercase tracking-[0.35em] text-white/40">ANÁLISE PROTOCOLAR</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3.5 md:space-y-5 px-4.5 md:px-8 pb-5 md:pb-8 relative z-10">
          
          {/* Technical Info Grid */}
          <div className="grid grid-cols-3 gap-2 md:gap-2.5">
              {/* Asset Capsule */}
              <div className="flex flex-col items-center justify-center bg-white/[0.06] py-2.5 px-1.5 md:p-3.5 rounded-xl md:rounded-2xl border border-white/10 hover:border-primary/30 hover:bg-white/[0.1] transition-all duration-300 shadow-sm">
                <span className="text-[0.55rem] md:text-[0.6rem] font-bold text-zinc-400 uppercase tracking-widest mb-1">Ativo</span>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1">
                      <CurrencyFlags asset={data.asset} />
                      <span className="font-extrabold text-[0.7rem] md:text-xs text-white uppercase tracking-tight">{data.asset.replace(' (OTC)', '')}</span>
                  </div>
                  {data.asset.includes('OTC') && (
                    <span className="text-[0.5rem] font-black bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 tracking-wider uppercase">OTC</span>
                  )}
                </div>
              </div>

              {/* Time Capsule */}
              <div className="flex flex-col items-center justify-center bg-white/[0.06] py-2.5 px-1.5 md:p-3.5 rounded-xl md:rounded-2xl border border-white/10 hover:border-primary/30 hover:bg-white/[0.1] transition-all duration-300 shadow-sm">
                <span className="text-[0.55rem] md:text-[0.6rem] font-bold text-zinc-400 uppercase tracking-widest mb-1">Tempo</span>
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
                    <span className="font-extrabold text-[0.7rem] md:text-xs text-white tracking-wide">{data.expirationTime}</span>
                </div>
              </div>

              {/* Entry Capsule */}
              <div className="flex flex-col items-center justify-center bg-white/[0.06] py-2.5 px-1.5 md:p-3.5 rounded-xl md:rounded-2xl border border-white/10 hover:border-primary/30 hover:bg-white/[0.1] transition-all duration-300 shadow-sm">
                <span className="text-[0.55rem] md:text-[0.6rem] font-bold text-zinc-400 uppercase tracking-widest mb-1">Entrada</span>
                <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
                    <span className="font-extrabold text-[0.7rem] md:text-xs text-white font-mono tracking-wider">{data.targetTime}</span>
                </div>
              </div>
          </div>
          
          {/* Action Box Panel */}
          <div
            className={cn(
                "relative flex flex-col items-center justify-center py-3.5 md:py-5 px-4 rounded-[1rem] md:rounded-[1.5rem] border shadow-xl transition-all duration-700 overflow-hidden",
                isCall 
                    ? "bg-gradient-to-b from-emerald-950/20 to-emerald-900/10 border-emerald-500/20 text-emerald-400 shadow-emerald-950/20" 
                    : "bg-gradient-to-b from-rose-950/20 to-rose-900/10 border-rose-500/20 text-rose-400 shadow-rose-950/20"
            )}
          >
            {/* Gloss Reflection overlay */}
            <div className="absolute inset-x-0 top-0 h-[50%] bg-white/[0.02] rounded-t-[1rem] md:rounded-t-[1.5rem] pointer-events-none" />
            
            {/* Glowing spotlight inside */}
            <div className={cn(
                "absolute inset-0 opacity-15 blur-xl transition-opacity duration-1000",
                isCall ? "bg-emerald-500" : "bg-rose-500"
            )} />

            <span className="text-[0.5rem] md:text-[0.55rem] font-black uppercase tracking-[0.35em] mb-1 md:mb-1.5 opacity-50 relative z-10">AÇÃO RECOMENDADA</span>
            
            <div className="relative z-10 flex items-center gap-2">
              <span className={cn(
                "text-2xl md:text-3xl font-black uppercase tracking-tight",
                isCall ? "drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-400" : "drop-shadow-[0_0_15px_rgba(244,63,94,0.3)] text-rose-400"
              )}>
                {data.signal}
              </span>
            </div>

            {/* Futuristic Corner Brackets HUD */}
            <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 border-t border-l border-current opacity-30" />
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 border-t border-r border-current opacity-30" />
            <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 border-b border-l border-current opacity-30" />
            <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 border-b border-r border-current opacity-30" />
          </div>

          {/* Dynamic Status Section with custom heights */}
          <div className="pt-0.5 min-h-[35px] flex flex-col items-center justify-center relative z-10 space-y-3">
             {renderStatus()}
             
             {isFinished && (
                 <div className="w-full px-0.5 pb-0.5 animate-in slide-in-from-bottom-4 duration-700 space-y-1.5">
                   <Button 
                     onClick={() => {
                       playSignalSound('click');
                       onReset();
                     }} 
                     className="w-full h-10 md:h-11 rounded-xl text-[0.7rem] md:text-xs font-black uppercase tracking-[0.18em] bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.25)] hover:shadow-[0_0_30px_rgba(225,29,72,0.45)] transition-all duration-300"
                   >
                       <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-[spin_4s_linear_infinite]" />
                       NOVA ANÁLISE
                   </Button>
                   <p className="text-[0.45rem] font-bold text-white/10 uppercase tracking-[0.25em]">ENGINE DE FLUXO ATIVA • V.2026</p>
                 </div>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
