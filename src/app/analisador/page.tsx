'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAffiliateRouter } from '@/hooks/use-affiliate-router';
import { usePathname } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'; 
import { Checkbox } from '@/components/ui/checkbox';
import YoutubePlayer from '@/components/youtube-player';

import { SignalForm } from '@/components/app/signal-form';
import { SignalResult } from '@/components/app/signal-result';
import { isMarketOpenForAsset } from '@/lib/market-hours';
import { Loader2, AlertTriangle, BarChart, LogOut, ShieldAlert, Cpu, ShieldCheck } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useAppConfig } from '@/firebase/config-provider';
import { Button } from '@/components/ui/button';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import AffiliateLink from '@/components/app/affiliate-link';
import { generateSignal as generateClientSideSignal, Asset, ExpirationTime } from '@/lib/signal-generator';
import { VipUpgradeModal } from '@/components/app/vip-upgrade-modal';
import { VipStatusModal } from '@/components/app/vip-status-modal';
import { AnalysisAnimation } from '@/components/app/analysis-animation';
import TradingViewWidget from '@/components/app/tradingview-widget';
import { BeamField } from '@/components/ui/beam-field';
import { cn } from '@/lib/utils';
import { generateMockNewsEvents, isNewsCurrentlyActive } from '@/lib/news-events';
import { Logo } from '@/components/logo';
import { OtcIntelligence } from '@/components/app/otc-intelligence';
import CelestialOrbHero from '@/components/ui/quantum-grid-hero';
import { SplineScene } from '@/components/ui/splite';
import { PrivacySettingsModal } from '@/components/app/privacy-settings-modal';
import { playSignalSound } from '@/lib/audio';

export type FormData = {
  asset: Asset;
  expirationTime: ExpirationTime;
};

export type OperationStatus = 'pending' | 'active' | 'finished';

export type SignalData = {
  asset: Asset;
  expirationTime: ExpirationTime;
  signal: 'CALL 🔼' | 'PUT 🔽';
  targetTime: string;
  source: 'Price Action';
  targetDate: Date;
  countdown: number | null;
  operationCountdown: number | null;
  operationStatus: OperationStatus;
};

type AppState = 'idle' | 'loading' | 'result' | 'waiting';
type AccessState = 'checking' | 'granted' | 'denied' | 'blocked' | 'disabled';

type SignalUsage = {
  timestamps: number[];
}

const PAGE_METADATA: Record<string, { label: string; path: string }> = {
    analisador: { label: 'ANALISADOR', path: '/analisador/' },
    sessaochinesa: { label: 'SESSÃO CHINESA', path: '/sessaochinesa/' },
    vip: { label: 'PÁGINA VIP', path: '/vip/' },
    descubra: { label: 'VSL', path: '/descubra/' },
    register: { label: 'REGISTRO', path: '/register/' },
    bb: { label: 'BROKER BREAKER', path: 'https://www.brokerbreaker.com.br/' },
    copy: { label: 'COPY TRADE', path: '/copy/' },
};

const EXCLUDED_NAV_IDS = ['register', 'vip', 'descubra', 'vsl'];

export default function AnalisadorPage() {
  const router = useAffiliateRouter();
  const pathname = usePathname();
  const { auth, user, isUserLoading, firestore } = useFirebase();
  const { config, isConfigLoading } = useAppConfig();

  const [accessState, setAccessState] = useState<AccessState>('checking');
  const [appState, setAppState] = useState<AppState>('idle');
  const [signalData, setSignalData] = useState<SignalData | null>(null);
  const [lastStatus, setLastStatus] = useState<'pending' | 'active' | 'finished' | undefined>(undefined);
  const [showOTC, setShowOTC] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [isNewsWarningModalOpen, setIsNewsWarningModalOpen] = useState(false);
  const [isPrivacyModalOpen, setPrivacyModalOpen] = useState(false);
  
  const [hasAgreedToNewsWarning, setHasAgreedToNewsWarning] = useState(false);
  const [currentDateInfo, setCurrentDateInfo] = useState('');
  const [currentTimeInfo, setCurrentTimeInfo] = useState('');

  const usageStorageKey = user ? `signalUsage_${user.uid}` : null;

  const vipRequestRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'vipRequests', user.uid);
  }, [firestore, user]);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const sessionStatusRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'session', 'status');
  }, [firestore]);

  const { data: vipData, isLoading: isVipLoading } = useDoc(vipRequestRef);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);
  const { data: sessionStatus } = useDoc(sessionStatusRef);
  const isSessionOnline = (sessionStatus as any)?.isOnline;

  const [formData, setFormData] = useState<FormData>({
    asset: 'EUR/JPY',
    expirationTime: '1m',
  });

  const navigationItems = useMemo(() => {
    const validMetaIds = Object.keys(PAGE_METADATA).filter(id => !EXCLUDED_NAV_IDS.includes(id));

    let orderList: string[] = [];
    if (config?.pagesOrder && Array.isArray(config.pagesOrder)) {
      orderList = [...config.pagesOrder];
      validMetaIds.forEach(id => {
        if (!orderList.includes(id)) {
          const scIdx = orderList.indexOf('sessaochinesa');
          if (id === 'bb' && scIdx !== -1) {
            orderList.splice(scIdx + 1, 0, id);
          } else {
            orderList.push(id);
          }
        }
      });
    } else {
      orderList = validMetaIds;
    }

    return orderList
      .filter((id: string) => !EXCLUDED_NAV_IDS.includes(id) && config?.pages?.[id] !== false && PAGE_METADATA[id])
      .map((id: string) => ({
        id,
        ...PAGE_METADATA[id]
      }))
      .filter((p: any) => p && p.label);
  }, [config]);

  useEffect(() => {
    if (isUserLoading || isProfileLoading) {
        setAccessState('checking');
        return;
    }

    if (!user) {
        setAccessState('denied');
        return;
    }

    if (userProfile?.accountStatus === 'DISABLED') {
      setAccessState('blocked');
      auth.signOut();
      return;
    }

    if (config?.pages?.analisador === false) {
        router.replace('/');
        setAccessState('disabled');
        return;
    }

    const loginTime = localStorage.getItem('loginTimestamp');
    if (!loginTime || (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60) >= 1) {
        auth.signOut();
        setAccessState('denied');
    } else {
        setAccessState('granted');
    }
  }, [user, isUserLoading, isProfileLoading, userProfile, auth, config, router]);

   useEffect(() => {
    const isPremiumUser = vipData && ['PREMIUM', 'APPROVED'].includes((vipData as any).status);
    setIsPremium(!!isPremiumUser);
    
    if (isPremiumUser) {
      document.documentElement.classList.add('theme-premium');
      const hasSeenWelcome = localStorage.getItem('hasSeenVipWelcome');
      if (!hasSeenWelcome) {
        setStatusModalOpen(true);
      }
    } else {
      document.documentElement.classList.remove('theme-premium');
    }
     return () => {
      document.documentElement.classList.remove('theme-premium');
    };
  }, [vipData]);

  useEffect(() => {
    if (isPremium || !usageStorageKey || !config) {
      setHasReachedLimit(false);
      return;
    }
    const usageString = localStorage.getItem(usageStorageKey);
    if (usageString) {
      const usage: Partial<SignalUsage> = JSON.parse(usageString);
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const recentTimestamps = (usage.timestamps || []).filter(ts => ts > oneHourAgo);
      setHasReachedLimit(recentTimestamps.length >= config.hourlySignalLimit);
    }
  }, [appState, isPremium, usageStorageKey, config]);

  const [lastMarketOpen, setLastMarketOpen] = useState(true);

  useEffect(() => {
    const checkMarketStatus = () => {
      const baseAsset = formData.asset.replace(' (OTC)', '') as Asset;
      const open = isMarketOpenForAsset(baseAsset, config?.marketSchedules);
      setIsMarketOpen(open);

      if (!open && lastMarketOpen && !showOTC) {
        setShowOTC(true);
      }
      setLastMarketOpen(open);
    };
    
    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 10000); 
    return () => clearInterval(interval);
  }, [formData.asset, lastMarketOpen, showOTC, config?.marketSchedules]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateInfo(now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }));
      setCurrentTimeInfo(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' BRT');
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (appState === 'result' && signalData) {
      const updateCountdowns = () => {
        setSignalData(prevData => {
          if (!prevData) return null;
          const now = new Date();
          if (prevData.operationStatus === 'pending') {
            const newCountdown = Math.max(0, Math.floor((prevData.targetDate.getTime() - now.getTime()) / 1000));
            if (newCountdown > 0) return { ...prevData, countdown: newCountdown };
            const operationDuration = prevData.expirationTime === '1m' ? 60 : 300;
            return { ...prevData, countdown: 0, operationStatus: 'active', operationCountdown: operationDuration };
          }
          if (prevData.operationStatus === 'active') {
              const operationDuration = prevData.expirationTime === '1m' ? 60 : 300;
              const operationEndTime = prevData.targetDate.getTime() + (operationDuration * 1000);
              const newOpCountdown = Math.max(0, Math.floor((operationEndTime - now.getTime()) / 1000));
              if (newOpCountdown > 0) return { ...prevData, operationCountdown: newOpCountdown };
              return { ...prevData, operationCountdown: 0, operationStatus: 'finished' };
          }
          return prevData;
        });
      };
      updateCountdowns(); 
      timer = setInterval(updateCountdowns, 1000);
    }
    return () => clearInterval(timer);
  }, [appState, signalData?.operationStatus]);

  useEffect(() => {
    if (appState !== 'result' || !signalData) {
      setLastStatus(undefined);
      return;
    }
    
    const currentStatus = signalData.operationStatus;
    if (lastStatus !== undefined && currentStatus !== lastStatus) {
      if (currentStatus === 'active') {
        playSignalSound('active');
      } else if (currentStatus === 'finished') {
        playSignalSound('finished');
      }
    }
    setLastStatus(currentStatus);
  }, [signalData?.operationStatus, appState, lastStatus]);

  useEffect(() => {
    if (isNewsWarningModalOpen) {
      playSignalSound('warning');
    }
  }, [isNewsWarningModalOpen]);

 const proceedWithAnalysis = async () => {
    setIsNewsWarningModalOpen(false);

    if (!config || !user || !firestore) return;

    if (!isPremium && usageStorageKey) {
      const usageString = localStorage.getItem(usageStorageKey) || '{ "timestamps": [] }';
      const currentUsage: SignalUsage = JSON.parse(usageString);
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const recentTimestamps = (currentUsage.timestamps || []).filter(ts => ts > oneHourAgo);

      if (recentTimestamps.length >= config.hourlySignalLimit) {
          setHasReachedLimit(true);
          setStatusModalOpen(true);
          return;
      }
    }

    setAppState('loading');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      const result = generateClientSideSignal({
        asset: formData.asset,
        expirationTime: formData.expirationTime,
        userTier: isPremium ? 'PREMIUM' : 'VIP',
        invertSignal: config.invertSignal,
      });
      
      const newSignalData: SignalData = {
        ...formData,
        signal: result.signal,
        targetTime: result.targetTime,
        source: result.source,
        targetDate: result.targetDate,
        countdown: null,
        operationCountdown: null,
        operationStatus: 'pending'
      };
      
      setSignalData(newSignalData);

      if (!isPremium && usageStorageKey) {
        const usageString = localStorage.getItem(usageStorageKey) || '{ "timestamps": [] }';
        const currentUsage: SignalUsage = JSON.parse(usageString);
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        const recentTimestamps = (currentUsage.timestamps || []).filter(ts => ts > oneHourAgo);
        const newUsage = { timestamps: [...recentTimestamps, Date.now()] };
        localStorage.setItem(usageStorageKey, JSON.stringify(newUsage));
        if(newUsage.timestamps.length >= config.hourlySignalLimit) setHasReachedLimit(true);
      }

      setAppState('result');
    } catch (error) {
        setAppState('idle');
    }
  };

  const handleAnalyze = () => {
    const newsEvents = generateMockNewsEvents();
    const isNewsActive = isNewsCurrentlyActive(newsEvents, config?.newsWarningDuration || 60);

    if (isNewsActive && !showOTC) {
      setHasAgreedToNewsWarning(false);
      setIsNewsWarningModalOpen(true);
    } else {
      proceedWithAnalysis();
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('loginTimestamp');
    router.push('/login');
  }

  if (accessState === 'checking' || isVipLoading || isConfigLoading || isProfileLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-black">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  if (accessState === 'disabled' || accessState === 'blocked') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-6">
        <div className={cn("max-w-md w-full bg-card border rounded-3xl p-10 text-center space-y-6 shadow-2xl animate-in zoom-in-95", accessState === 'blocked' ? "border-destructive/20" : "border-primary/20")}>
           <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto", accessState === 'blocked' ? "bg-destructive/10" : "bg-primary/10")}>
             {accessState === 'blocked' ? <ShieldAlert className="h-10 w-10 text-destructive" /> : <AlertTriangle className="h-10 w-10 text-primary" />}
           </div>
           <h2 className="text-3xl font-headline font-black uppercase tracking-tight">
                {accessState === 'blocked' ? 'Acesso Bloqueado' : 'Manutenção'}
           </h2>
           <p className="text-muted-foreground leading-relaxed">
                {accessState === 'blocked' ? 'Sua conta foi suspensa.' : 'O Analisador está temporariamente indisponível.'}
           </p>
           <Button variant="outline" onClick={() => router.replace('/')} className="w-full h-12 rounded-xl font-bold">Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  if (accessState === 'denied') {
    return (
      <Dialog open={true}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sessão Expirada</DialogTitle>
            <DialogDescription>Por favor, faça login novamente.</DialogDescription>
          </DialogHeader>
          <DialogFooter><Button className="w-full" onClick={() => router.push('/login')}>Ir para Login</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const currentAsset = appState === 'result' && signalData ? signalData.asset : formData.asset;
  const currentExpirationTime = appState === 'result' && signalData ? signalData.expirationTime : formData.expirationTime;
  const isOtcAsset = currentAsset.includes('(OTC)');

  return (
    <>
      <div className="fixed inset-0 -z-20 h-full w-full grid-bg" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background/90 to-background" />

      <div className="flex flex-col h-[100dvh] overflow-hidden">
        <header className="h-[50px] md:h-[60px] px-4 md:px-8 flex justify-between items-center border-b border-border/10 bg-card/30 backdrop-blur-md shrink-0 z-50">
          <div className="flex items-center gap-3">
             <Logo size={32} isPremium={isPremium} />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[70%] md:max-w-none">
            <nav className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5 shrink-0">
               {navigationItems.map((item) => (
                  <Button key={item.id} asChild variant="ghost" size="sm" className={cn("h-6 md:h-9 px-2 md:px-4 rounded-md text-[0.6rem] md:text-[0.65rem] font-black uppercase tracking-widest transition-all", pathname === item.path ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary")} onClick={() => playSignalSound('click')}>
                      <AffiliateLink 
                          href={item.path} 
                          target={item.path.startsWith('http') ? '_blank' : undefined}
                          rel={item.path.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="flex items-center gap-1"
                      >
                          {item.label}
                          {item.id === 'sessaochinesa' && (
                              <span className={cn(
                                  "w-1 h-1 rounded-full",
                                  isSessionOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
                              )} />
                          )}
                      </AffiliateLink>
                  </Button>
               ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                playSignalSound('click');
                setPrivacyModalOpen(true);
              }}
              className="text-[0.6rem] font-black text-muted-foreground hover:text-primary transition-all rounded-full border border-white/5 w-6 h-6 p-0 flex items-center justify-center shrink-0"
              title="Privacy"
            >
              <ShieldCheck className="h-3 w-3 text-primary" />
              <span className="sr-only">Privacy</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                playSignalSound('click');
                handleLogout();
              }}
              className="text-[0.6rem] font-black text-muted-foreground hover:text-destructive transition-all rounded-full px-2 border border-white/5 h-6 uppercase tracking-widest hidden md:flex"
            >
              <LogOut className="h-3 w-3 mr-1" /> Sair
            </Button>
          </div>
        </header>

        <main className="flex-grow overflow-hidden">
            {/* VERSÃO DESKTOP (MANTIDA 100% INTACTA) */}
            <div className="hidden md:flex flex-row h-full overflow-hidden no-scrollbar">
                <div className="w-[420px] h-full shrink-0">
                    <div className="w-full h-full bg-card/40 backdrop-blur-xl border-r border-white/10 flex flex-col items-center justify-center overflow-hidden relative glass-panel">
                        {appState === 'loading' ? (
                            <div className="w-full h-full flex items-center justify-center p-4"><AnalysisAnimation /></div>
                        ) : appState === 'result' && signalData ? (
                            <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto no-scrollbar"><SignalResult data={signalData} onReset={() => setAppState('idle')} /></div>
                        ) : (
                            <div className="w-full h-full p-4 overflow-hidden">
                                <SignalForm
                                    formData={formData}
                                    setFormData={setFormData}
                                    onSubmit={handleAnalyze}
                                    isLoading={appState === 'loading'}
                                    showOTC={showOTC}
                                    setShowOTC={setShowOTC}
                                    isMarketOpen={isMarketOpen}
                                    hasReachedLimit={hasReachedLimit}
                                    user={user}
                                    firestore={firestore}
                                    isPremium={isPremium}
                                    vipStatus={(vipData as any)?.status}
                                    isVipModalOpen={isStatusModalOpen}
                                    setVipModalOpen={setStatusModalOpen}
                                    setUpgradeModalOpen={setUpgradeModalOpen}
                                    rejectedBrokerId={(vipData as any)?.brokerId}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-grow h-full relative overflow-hidden bg-black">
                    {isOtcAsset ? (
                        <div className="w-full h-full flex items-center justify-center bg-black/20 relative overflow-hidden">
                            {/* Orbit effect (CelestialOrbHero) when analyzing, or SplineScene robot when idle/result */}
                            {appState === 'loading' ? (
                                <CelestialOrbHero />
                            ) : (
                                <div className={cn(
                                    "absolute inset-0 w-full h-full z-0 transition-all duration-1000 ease-in-out",
                                    appState === 'result' && signalData ? (
                                        signalData.signal.includes('CALL') 
                                            ? "bg-green-500/5 shadow-[inset_0_0_80px_rgba(34,197,94,0.15)]" 
                                            : "bg-red-500/5 shadow-[inset_0_0_80px_rgba(239,68,68,0.15)]"
                                    ) : ""
                                )}>
                                    <SplineScene 
                                        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                                        className={cn(
                                            "w-full h-full transition-all duration-1000 ease-in-out",
                                            appState === 'result' && signalData ? (
                                                signalData.signal.includes('CALL')
                                                    ? "hue-rotate-[120deg] saturate-[1.8] brightness-[1.1] drop-shadow-[0_0_30px_rgba(34,197,94,0.35)]"
                                                    : "hue-rotate-[-30deg] saturate-[2] brightness-[1.1] drop-shadow-[0_0_30px_rgba(239,68,68,0.35)]"
                                            ) : ""
                                        )}
                                    />
                                </div>
                            )}
                            
                            <div className={cn(
                                "text-center max-w-md relative z-10 flex flex-col items-center justify-center pointer-events-none select-none bg-black/60 p-6 rounded-3xl border backdrop-blur-md transition-all duration-1000",
                                appState === 'result' && signalData ? (
                                    signalData.signal.includes('CALL')
                                        ? "border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.15)]"
                                        : "border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
                                ) : "border-white/10"
                            )}>
                                <h3 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-widest text-center leading-tight">
                                    IA SCANNER:
                                    <br />
                                    <span className={cn(
                                        "text-sm md:text-base uppercase tracking-normal block mt-1 font-bold transition-all duration-1000",
                                        appState === 'result' && signalData ? (
                                            signalData.signal.includes('CALL')
                                                ? "text-green-400 font-extrabold"
                                                : "text-red-400 font-extrabold"
                                        ) : "text-primary"
                                    )}>
                                        {currentAsset.toUpperCase().trim()}
                                    </span>
                                </h3>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-black relative">
                            <TradingViewWidget asset={currentAsset} interval={currentExpirationTime.replace('m', '')} />
                            {appState === 'loading' && <BeamField />}
                        </div>
                    )}
                </div>
            </div>

            {/* VERSÃO MOBILE (LAYOUT HUD 40/60 e 50/50 - SEM SCROLL) */}
            <div className="md:hidden flex flex-col h-full overflow-hidden relative">
                
                {/* TOPO: VISUAL (GRÁFICO OU IA METRICS) */}
                <div className={cn(
                    "w-full transition-all duration-700 relative overflow-hidden bg-black shrink-0 border-b border-white/10 z-10",
                    isOtcAsset ? "h-[50%]" : "h-[40%]"
                )}>
                    {isOtcAsset ? (
                        <div className="w-full h-full flex flex-col p-4 animate-in slide-in-from-top duration-700">
                            <OtcIntelligence asset={currentAsset} />
                        </div>
                    ) : (
                        <div className="h-full w-full relative flex flex-col">
                            <div className="h-[25px] shrink-0 px-4 border-b border-white/5 flex items-center justify-between bg-black/50 absolute top-0 left-0 w-full z-20">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[0.45rem] font-black text-muted-foreground uppercase tracking-widest">Market Live Stream</span>
                                </div>
                                <span className="text-[0.45rem] font-black text-primary bg-primary/10 px-1 rounded uppercase">{currentExpirationTime}</span>
                            </div>
                            <div className="flex-grow h-full pt-[25px] relative">
                                <TradingViewWidget asset={currentAsset} interval={currentExpirationTime.replace('m', '')} />
                                {appState === 'loading' && <BeamField />}
                            </div>
                        </div>
                    )}
                </div>

                {/* BASE: CONTROLES E RESULTADOS */}
                <div className={cn(
                    "w-full flex flex-col bg-card/60 backdrop-blur-2xl overflow-hidden z-0",
                    isOtcAsset ? "h-[50%]" : "h-[60%]"
                )}>
                    {appState === 'loading' ? (
                        <div className="flex-grow flex items-center justify-center p-6"><AnalysisAnimation /></div>
                    ) : appState === 'result' && signalData ? (
                        <div className="flex-grow flex flex-col items-center justify-center p-2.5 md:p-4 animate-in fade-in duration-500 w-full overflow-hidden">
                            <SignalResult data={signalData} onReset={() => setAppState('idle')} />
                        </div>
                    ) : (
                        <div className="flex-grow p-0 overflow-hidden">
                            <SignalForm
                                formData={formData}
                                setFormData={setFormData}
                                onSubmit={handleAnalyze}
                                isLoading={appState === 'loading'}
                                showOTC={showOTC}
                                setShowOTC={setShowOTC}
                                isMarketOpen={isMarketOpen}
                                hasReachedLimit={hasReachedLimit}
                                user={user}
                                firestore={firestore}
                                isPremium={isPremium}
                                vipStatus={(vipData as any)?.status}
                                isVipModalOpen={isStatusModalOpen}
                                setVipModalOpen={setStatusModalOpen}
                                setUpgradeModalOpen={setUpgradeModalOpen}
                                rejectedBrokerId={(vipData as any)?.brokerId}
                            />
                        </div>
                    )}
                </div>
            </div>
        </main>
      </div>

      <VipUpgradeModal isOpen={isUpgradeModalOpen} onOpenChange={setUpgradeModalOpen} user={user} firestore={firestore} config={config} />
      <VipStatusModal isOpen={isStatusModalOpen} onOpenChange={setStatusModalOpen} vipStatus={(vipData as any)?.status} rejectedBrokerId={(vipData as any)?.brokerId} />
      <PrivacySettingsModal isOpen={isPrivacyModalOpen} onOpenChange={setPrivacyModalOpen} userProfile={userProfile} vipData={vipData} />

      <Dialog open={isNewsWarningModalOpen} onOpenChange={setIsNewsWarningModalOpen}>
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-2xl border-white/10 rounded-3xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl font-headline">
                <AlertTriangle className="text-yellow-400 h-6 w-6" /> Notícia no Momento
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <p className="text-sm leading-relaxed text-zinc-300">
                    O mercado está a passar por um evento económico de impacto. As análises estatísticas podem ser invalidadas pela volatilidade extrema.
                  </p>
                </div>
                <YoutubePlayer videoId="81HihzJWVwk" />
                <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setHasAgreedToNewsWarning(!hasAgreedToNewsWarning)}>
                    <Checkbox id="news-agreement" checked={hasAgreedToNewsWarning} onCheckedChange={(checked) => setHasAgreedToNewsWarning(checked as boolean)} />
                    <label htmlFor="news-agreement" className="text-[0.65rem] font-black uppercase leading-tight cursor-pointer opacity-80">Estou ciente dos riscos e desejo operar.</label>
                </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="secondary" onClick={() => setIsNewsWarningModalOpen(false)} className="h-11 rounded-xl">Cancelar</Button>
              <Button 
                onClick={proceedWithAnalysis} 
                disabled={!hasAgreedToNewsWarning} 
                className="h-11 rounded-xl bg-primary text-black font-black uppercase tracking-tighter"
              >
                Analisar mesmo assim
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
