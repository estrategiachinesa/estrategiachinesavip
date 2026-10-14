import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import Script from 'next/script';
import { DevToolsBlocker } from '@/components/app/dev-tools-blocker';
import { ScriptErrorHandler } from '@/components/app/script-error-handler';
import { FirebaseClientProvider } from '@/firebase';
import { CookieConsentBanner } from '@/components/app/cookie-consent-banner';
import { FloatingSupportButton } from '@/components/app/floating-support-button';

export const metadata: Metadata = {
  title: 'Estratégia Chinesa',
  description: 'Alcance a consistência que você sempre buscou no trading.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="!scroll-smooth dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function shouldSuppress(e) {
                  if (!e) return true;
                  var msg = (typeof e === 'string' ? e : (e.message || (e.reason && (e.reason.message || String(e.reason))) || '')).toLowerCase();
                  var filename = (e.filename || (e.target && e.target.src) || (e.target && e.target.href) || '').toLowerCase();
                  if (!msg || msg.indexOf('script error') !== -1 || msg.indexOf('resizeobserver') !== -1) return true;
                  if (filename.indexOf('tradingview') !== -1 || filename.indexOf('hotmart') !== -1 || filename.indexOf('youtube') !== -1) return true;
                  return false;
                }

                window.addEventListener('error', function(e) {
                  if (shouldSuppress(e)) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return true;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(e) {
                  if (shouldSuppress(e)) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return true;
                  }
                }, true);

                var prevOnError = window.onerror;
                window.onerror = function(msg, url, line, col, error) {
                  if (shouldSuppress({ message: msg, filename: url })) {
                    return true;
                  }
                  if (typeof prevOnError === 'function') {
                    return prevOnError.apply(this, arguments);
                  }
                  return false;
                };
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" type="text/css" href="https://static.hotmart.com/css/hotmart-fb.min.css" />
      </head>
      <body className={cn("font-body antialiased", "bg-background")}>
        <ScriptErrorHandler />
        <DevToolsBlocker />
        <FirebaseClientProvider>
          {children}
          
          <FloatingSupportButton />
          
        </FirebaseClientProvider>
        <Toaster />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
