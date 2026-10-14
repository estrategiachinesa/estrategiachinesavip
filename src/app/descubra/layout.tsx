
import { FirebaseClientProvider } from '@/firebase';

export default function DescubraLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FirebaseClientProvider>
      <div className="dark font-headline bg-[#0e0e0e] text-white">
        {children}
      </div>
    </FirebaseClientProvider>
  );
}
