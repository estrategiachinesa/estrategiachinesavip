'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAppConfig } from '@/firebase';
import { Button } from '@/components/ui/button';

export default function GhostDescubraPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { config, isConfigLoading } = useAppConfig();

  useEffect(() => {
    if (!isConfigLoading && config?.pages?.cf_descubra === false) {
      router.replace('/');
      return;
    }

    const handleFirstMove = () => {
      setIsRedirecting(true);
      router.replace('/descubra');
      // Remove o listener após o primeiro movimento para evitar múltiplos redirecionamentos
      window.removeEventListener('mousemove', handleFirstMove);
      window.removeEventListener('touchstart', handleFirstMove);
    };

    // Adiciona listeners para movimento do rato e toque em dispositivos móveis
    window.addEventListener('mousemove', handleFirstMove, { once: true });
    window.addEventListener('touchstart', handleFirstMove, { once: true });

    return () => {
      window.removeEventListener('mousemove', handleFirstMove);
      window.removeEventListener('touchstart', handleFirstMove);
    };
  }, [router, config, isConfigLoading]);

  if (isConfigLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-lg font-semibold">A carregar...</p>
      </div>
    );
  }

  if (config?.pages?.cf_descubra === false) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black p-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <h2 className="text-xl font-black uppercase text-white">Ferramenta Offline</h2>
          <p className="text-sm text-muted-foreground">Redirecionando...</p>
          <Button variant="outline" onClick={() => router.replace('/')}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-lg font-semibold">A carregar a sua experiência...</p>
    </div>
  );
}
