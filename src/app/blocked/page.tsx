
import { ShieldAlert } from 'lucide-react';

export default function BlockedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
       <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-4xl font-bold text-destructive mb-2">Acesso Negado</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        Você não tem permissão para acessar este recurso. Se você acredita que isso é um erro, entre em contato com o suporte.
      </p>
    </div>
  );
}
