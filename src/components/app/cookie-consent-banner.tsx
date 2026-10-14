'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Cookie, ShieldAlert, CheckCircle2 } from 'lucide-react';

// Function to activate marketing or analytics scripts (ex: Google Analytics, Meta Pixel)
const activateMarketingScripts = (analyticsAllowed: boolean, marketingAllowed: boolean) => {
  if (analyticsAllowed) {
    console.log("Analytics scripts activated (LGPD Consent Granted).");
    // Example: window.gtag?.('consent', 'update', { 'analytics_storage': 'granted' });
  }
  if (marketingAllowed) {
    console.log("Marketing scripts activated (LGPD Consent Granted).");
    // Example: window.fbq?.('consent', 'grant');
  }
};

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Cookie states for granular configuration
  const [preferences, setPreferences] = useState({
    necessary: true, // LGPD allow essential cookies automatically
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check local consent status on mount
    const consent = localStorage.getItem("cookie_consentimento");
    const analyticsConsent = localStorage.getItem("cookies_analytics") === "true";
    const marketingConsent = localStorage.getItem("cookies_marketing") === "true";

    if (consent === "aceito") {
      activateMarketingScripts(true, true);
      setIsVisible(false);
    } else if (consent === "personalizado") {
      activateMarketingScripts(analyticsConsent, marketingConsent);
      setIsVisible(false);
    } else if (consent !== "recusado") {
      // If no selection has been made, show the banner
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie_consentimento", "aceito");
    localStorage.setItem("cookies_analytics", "true");
    localStorage.setItem("cookies_marketing", "true");
    activateMarketingScripts(true, true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consentimento", "recusado");
    localStorage.setItem("cookies_analytics", "false");
    localStorage.setItem("cookies_marketing", "false");
    setIsVisible(false);
  };

  const handleOpenConfig = () => {
    const analyticsConsent = localStorage.getItem("cookies_analytics") === "true";
    const marketingConsent = localStorage.getItem("cookies_marketing") === "true";
    
    setPreferences({
      necessary: true,
      analytics: analyticsConsent,
      marketing: marketingConsent,
    });
    setIsModalOpen(true);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookie_consentimento", "personalizado");
    localStorage.setItem("cookies_analytics", preferences.analytics ? "true" : "false");
    localStorage.setItem("cookies_marketing", preferences.marketing ? "true" : "false");
    
    activateMarketingScripts(preferences.analytics, preferences.marketing);
    
    setIsModalOpen(false);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl p-4 rounded-xl shadow-2xl bg-card/90 backdrop-blur-lg border border-border/40",
          "animate-in slide-in-from-bottom-4 duration-500"
        )}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1 animate-pulse" />
            <div className="text-sm">
              <h3 className="font-semibold text-foreground">Este site utiliza cookies</h3>
              <p className="text-muted-foreground mt-1">
                Utilizamos cookies para oferecer uma experiência melhor, personalizar anúncios e analisar tráfego de acordo com a LGPD. Ao clicar em “Aceitar todos”, você concorda com o uso de todos os cookies. Você pode personalizar suas escolhas em "Configurar". Veja nossa{' '}
                <Link href="/legal#privacy" className="underline hover:text-primary font-bold">
                  Política de Privacidade
                </Link>.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={handleAcceptAll} className="w-full sm:w-auto bg-primary text-black font-bold h-10 rounded-lg">
              Aceitar todos
            </Button>
            <Button variant="outline" onClick={handleDecline} className="w-full sm:w-auto border-border h-10 rounded-lg">
              Recusar
            </Button>
            <Button variant="ghost" onClick={handleOpenConfig} className="w-full sm:w-auto text-primary h-10 rounded-lg">
              Configurar
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIGURAÇÃO DE COOKIES GRANULAR */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-headline font-black uppercase text-foreground">
              <Cookie className="h-5 w-5 text-primary" /> Configuração de Cookies
            </DialogTitle>
            <DialogDescription className="text-xs uppercase font-black tracking-wider opacity-60 text-muted-foreground mt-1">
              Ative ou desative de forma independente cada tipo de cookie.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            {/* Necessários */}
            <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
              <div className="pt-0.5">
                <Checkbox id="modal-cookie-necessary" checked={true} disabled />
              </div>
              <div className="space-y-0.5">
                <label className="text-sm font-bold text-foreground cursor-not-allowed">
                  Cookies Necessários (Obrigatórios)
                </label>
                <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                  Essenciais para o login, segurança e funcionamento das funções básicas da plataforma.
                </p>
              </div>
            </div>

            {/* Estatísticas */}
            <div 
              className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
            >
              <div className="pt-0.5">
                <Checkbox 
                  id="modal-cookie-analytics" 
                  checked={preferences.analytics} 
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, analytics: checked as boolean }))} 
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-sm font-bold text-foreground cursor-pointer">
                  Cookies Estatísticos (Opcional)
                </label>
                <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                  Utilizados para medir visitas e origens de tráfego, ajudando a melhorar as análises do WebApp.
                </p>
              </div>
            </div>

            {/* Marketing */}
            <div 
              className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
            >
              <div className="pt-0.5">
                <Checkbox 
                  id="modal-cookie-marketing" 
                  checked={preferences.marketing} 
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketing: checked as boolean }))} 
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-sm font-bold text-foreground cursor-pointer">
                  Cookies de Marketing (Opcional)
                </label>
                <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                  Permitem exibir anúncios ou ofertas personalizadas de acordo com o seu perfil de uso.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="rounded-xl h-10">
              Voltar
            </Button>
            <Button onClick={handleSavePreferences} className="bg-primary text-black font-bold rounded-xl h-10">
              Salvar Preferências
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
