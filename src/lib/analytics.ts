import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    __gaInitialized?: boolean;
  }
}

export const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim();

/**
 * Checks if current environment is localhost or development.
 * Prevents polluting production analytics with local testing data.
 */
export function isLocalOrDev(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname;
  return (
    import.meta.env.DEV ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.local')
  );
}

/**
 * Initializes GA4 by injecting the gtag script asynchronously.
 * Skips execution in local development or if no measurement ID is configured.
 */
export function initGA(): boolean {
  if (typeof window === 'undefined') return false;
  if (!GA_MEASUREMENT_ID) return false;
  if (isLocalOrDev()) return false;
  if (window.__gaInitialized) return true;

  // Set up dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  };

  window.gtag('js', new Date());
  // Disable automatic page view on initial config to prevent duplicate views in SPA
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
  });

  // Inject gtag.js script asynchronously so it never blocks rendering
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

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
