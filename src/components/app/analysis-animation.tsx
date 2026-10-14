'use client';

import { useEffect, useState, useId } from 'react';
import { cn } from '@/lib/utils';
import { Cpu, Zap, Activity, ShieldCheck, Search, Database } from 'lucide-react';

const analysisSteps = [
  'INICIALIZANDO ANÁLISE...',
  'FILTRANDO RUÍDO DO MERCADO...',
  'MAPEANDO FLUXO INSTITUCIONAL...',
  'IDENTIFICANDO CONFLUÊNCIAS...',
  'CALCULANDO ASSERTIVIDADE...',
  'SINCRONIZANDO SINAL...',
];

export function AnalysisAnimation({ showProgressBar = true }: { showProgressBar?: boolean }) {
  const [currentText, setCurrentText] = useState(analysisSteps[0]);
  const [progress, setProgress] = useState(0);
  const uniqueId = useId().replace(/:/g, '');
  const geggaId = `gegga-${uniqueId}`;
  const linearId = `linear-${uniqueId}`;
  const gradientId = `gradient-${uniqueId}`;

  useEffect(() => {
    let textIndex = 0;
    const interval = setInterval(() => {
      textIndex++;
      if (textIndex < analysisSteps.length) {
        setCurrentText(analysisSteps[textIndex]);
        setProgress((textIndex / (analysisSteps.length - 1)) * 100);
      } else {
        clearInterval(interval);
      }
    }, 850);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full max-w-md overflow-hidden rounded-2xl md:rounded-3xl bg-black/40 backdrop-blur-xl border border-primary/20 flex flex-col items-center justify-center p-4 md:p-6 gap-4 md:gap-6 transition-all duration-500 shadow-2xl shadow-primary/5 min-h-0">
      
      {/* Background Elements */}
      <div className="absolute inset-0 grid-bg opacity-10 animate-pulse" />
      
      {/* Visual Core Analysis */}
      <div className="relative flex items-center justify-center mb-4 w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden bg-black/60 shadow-[0_0_50px_rgba(247,0,168,0.35)] shrink-0 border border-white/5">
        <style>{`
          .gegga {
            width: 0;
            height: 0;
            position: absolute;
          }

          .snurra-${uniqueId} {
            filter: url(#${geggaId});
          }

          .stopp1-${uniqueId} {
            stop-color: #f700a8;
          }

          .stopp2-${uniqueId} {
            stop-color: #ff8000;
          }

          .halvan-${uniqueId} {
            animation: Snurra1-${uniqueId} 10s infinite linear;
            stroke-dasharray: 180 800;
            fill: none;
            stroke: url(#${gradientId});
            stroke-width: 23;
            stroke-linecap: round;
          }

          .strecken-${uniqueId} {
            animation: Snurra1-${uniqueId} 3s infinite linear;
            stroke-dasharray: 26 54;
            fill: none;
            stroke: url(#${gradientId});
            stroke-width: 23;
            stroke-linecap: round;
          }

          .skugga-${uniqueId} {
            filter: blur(8px);
            opacity: 0.55;
            position: absolute;
            transform: translate(0px, 0px);
            animation: pulse-glow-${uniqueId} 2.5s infinite ease-in-out;
          }

          @keyframes pulse-glow-${uniqueId} {
            0%, 100% {
              opacity: 0.4;
              filter: blur(6px);
              transform: scale(0.96);
            }
            50% {
              opacity: 0.85;
              filter: blur(12px);
              transform: scale(1.04);
            }
          }

          @keyframes Snurra1-${uniqueId} {
            0% {
              stroke-dashoffset: 0;
            }

            100% {
              stroke-dashoffset: -403px;
            }
          }
        `}</style>

        <div className="relative flex items-center justify-center w-full h-full">
          <svg className="gegga">
            <defs>
              <filter id={geggaId}>
                <feGaussianBlur in="SourceGraphic" stdDeviation={7} result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10" result="inreGegga" />
                <feComposite in="SourceGraphic" in2="inreGegga" operator="atop" />
              </filter>
            </defs>
          </svg>
          
          {/* Shadow layer */}
          <svg className={`skugga-${uniqueId} w-28 h-28 md:w-36 md:h-36`} viewBox="0 0 200 200">
            <path className={`halvan-${uniqueId}`} d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64" />
            <circle className={`strecken-${uniqueId}`} cx={100} cy={100} r={64} />
          </svg>

          {/* Active spinner layer */}
          <svg className={`snurra-${uniqueId} w-28 h-28 md:w-36 md:h-36`} viewBox="0 0 200 200">
            <defs>
              <linearGradient id={linearId}>
                <stop className={`stopp1-${uniqueId}`} offset={0} />
                <stop className={`stopp2-${uniqueId}`} offset={1} />
              </linearGradient>
              <linearGradient y2={160} x2={160} y1={40} x1={40} gradientUnits="userSpaceOnUse" id={gradientId} href={`#${linearId}`} xlinkHref={`#${linearId}`} />
            </defs>
            <path className={`halvan-${uniqueId}`} d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64" />
            <circle className={`strecken-${uniqueId}`} cx={100} cy={100} r={64} />
          </svg>
        </div>
      </div>

      {/* Dynamic Analysis Text */}
      <div className="w-full space-y-3 md:space-y-5 z-10 text-center shrink-0">
        <div className="flex flex-col items-center gap-1.5 md:gap-3">
            <div className="flex items-center gap-2 md:gap-3 bg-black/40 px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-white/5">
                <Search className="h-3.5 w-3.5 text-primary/60 animate-bounce" />
                <span className="text-[0.6rem] md:text-[0.7rem] font-black text-primary uppercase tracking-[0.3em] font-mono">
                    {currentText}
                </span>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6 opacity-40">
                <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-primary" />
                    <span className="text-[0.55rem] font-bold uppercase tracking-tighter">Fluxo: Ativo</span>
                </div>
                <div className="h-3 w-px bg-white/10" />
                <div className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    <span className="text-[0.55rem] font-bold uppercase tracking-tighter">Sync: Seguro</span>
                </div>
            </div>
        </div>

        {showProgressBar && (
          <div className="w-full max-w-[260px] md:max-w-sm mx-auto space-y-1.5 md:space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex justify-between items-end px-1">
                <div className="flex flex-col items-start">
                  <span className="text-[0.45rem] md:text-[0.5rem] font-black text-muted-foreground uppercase tracking-widest opacity-40 leading-none">Processamento Deep-Scan</span>
                  <span className="text-[0.55rem] md:text-[0.6rem] font-bold text-white/60 uppercase">Motor V.2026</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-base md:text-lg font-mono font-black text-primary leading-none">{Math.round(progress)}%</span>
                </div>
            </div>
            
            <div className="relative h-1.5 md:h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                    className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(255,0,0,0.4)] relative"
                    style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-[-20deg]" />
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Interface Corner Ornaments (HUD Style) */}
      <div className="absolute top-5 left-5 h-6 w-6 border-t-[3px] border-l-[3px] border-primary/40 rounded-tl-lg" />
      <div className="absolute top-5 right-5 h-6 w-6 border-t-[3px] border-r-[3px] border-primary/40 rounded-tr-lg" />
      <div className="absolute bottom-5 left-5 h-6 w-6 border-b-[3px] border-l-[3px] border-primary/40 rounded-bl-lg" />
      <div className="absolute bottom-5 right-5 h-6 w-6 border-b-[3px] border-r-[3px] border-primary/40 rounded-br-lg" />
      
      {/* Decorative vertical lines */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 w-0.5 h-12 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      <div className="absolute top-1/2 right-4 -translate-y-1/2 w-0.5 h-12 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      
    </div>
  );
}