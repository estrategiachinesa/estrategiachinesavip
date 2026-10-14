
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function DevToolsBlocker() {
  const router = useRouter();

  useEffect(() => {
    // Disable dev tools blocker in development mode or inside iframe preview
    if (process.env.NODE_ENV === 'development' || typeof window === 'undefined' || window.self !== window.top) {
      return;
    }

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable keyboard shortcuts for developer tools
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // The 'debugger' statement will pause execution only when dev tools are open in standalone window
    const interval = setInterval(() => {
      try {
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
          const start = performance.now();
          // eslint-disable-next-line no-debugger
          debugger;
          const end = performance.now();
          if (end - start > 1000) {
            router.push('/blocked');
          }
        }
      } catch {
        // Ignore debugger errors
      }
    }, 2000);

    // Cleanup listeners on component unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, [router]);

  return null;
}
