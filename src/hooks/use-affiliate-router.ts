'use client';

import { useAppConfig } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

type NavigateOptions = Parameters<ReturnType<typeof useRouter>['push']>[1];
type Route = Parameters<ReturnType<typeof useRouter>['push']>[0];


export function useAffiliateRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const { affiliateId } = useAppConfig();

  const isExternal = (url: string) => /^(https|http|www)/.test(url);

  const generateHref = useCallback((url: string) => {
    if (isExternal(url)) {
      return url;
    }

    // Split path and query parameters / hash
    const [pathPart, queryPart] = url.split('?');
    const [cleanPath, hashPart] = pathPart.split('#');

    let normalizedPath = cleanPath;
    if (normalizedPath.startsWith('/') && !normalizedPath.endsWith('/') && !normalizedPath.includes('.')) {
      normalizedPath = `${normalizedPath}/`;
    }

    let finalUrl = normalizedPath;
    if (hashPart) {
      finalUrl = `${finalUrl}#${hashPart}`;
    }

    if (!affiliateId) {
      if (queryPart) {
        finalUrl = `${finalUrl}?${queryPart}`;
      }
      return finalUrl;
    }

    const separator = queryPart ? '&' : '?';
    const queryAppend = queryPart ? `?${queryPart}${separator}aff=${affiliateId}` : `?aff=${affiliateId}`;
    
    return `${normalizedPath}${queryAppend}${hashPart ? `#${hashPart}` : ''}`;
  }, [affiliateId]);

  const push = useCallback(
    (href: Route, options?: NavigateOptions) => {
      const finalHref = typeof href === 'string' ? generateHref(href) : href;
      router.push(finalHref, options);
    },
    [generateHref, router]
  );

  const replace = useCallback(
    (href: Route, options?: NavigateOptions) => {
      const finalHref = typeof href === 'string' ? generateHref(href) : href;
      router.replace(finalHref, options);
    },
    [generateHref, router]
  );

  return {
    ...router,
    push,
    replace,
  };
}
