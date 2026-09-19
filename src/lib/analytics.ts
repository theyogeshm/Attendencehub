import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    __gaInitialized?: boolean;
  }
}

export const GA_MEASUREMENT_ID =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() || 'G-E9Z2L0GXZQ';

/**
 * Checks if current environment is localhost or development.
 * Prevents polluting production analytics with local testing data.
 * Can be temporarily bypassed for testing in console with:
 *   localStorage.setItem('ENABLE_GA_TEST', 'true'); location.reload();
 */
export function isLocalOrDev(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.localStorage.getItem('ENABLE_GA_TEST') === 'true') {
    return false;
  }
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.local')
  );
}

/**
 * Initializes GA4. If tag is already present in index.html, ensures gtag is defined.
 * If not present, injects the script asynchronously.
 */
export function initGA(): boolean {
  if (typeof window === 'undefined') return false;
  if (isLocalOrDev()) return false;
  if (window.__gaInitialized) return true;

  // Set up dataLayer and gtag function if not already created
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
  }

  // If the script is not already in index.html, inject it dynamically
  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.__gaInitialized = true;
  return true;
}

/**
 * Sends an anonymous page_view event to GA4 on route change.
 * Automatically skips sensitive admin pages and transmits no PII.
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined') return;
  if (!GA_MEASUREMENT_ID || isLocalOrDev()) return;

  // Exclude admin routes completely from analytics tracking
  if (path.startsWith('/admin')) {
    return;
  }

  // Ensure GA is initialized
  initGA();

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  }
}

/**
 * React Router hook to track page views across client-side navigations.
 */
export function usePageTracking(): void {
  const location = useLocation();

  useEffect(() => {
    initGA();
    const fullPath = location.pathname + location.search;
    trackPageView(fullPath);
  }, [location.pathname, location.search]);
}
