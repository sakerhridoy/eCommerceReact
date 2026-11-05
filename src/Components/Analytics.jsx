import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID;

const injectScript = (id, src) => {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
};

const initGoogleAnalytics = () => {
  if (!GA_MEASUREMENT_ID || window.gtag) return;

  injectScript(
    'ga-script',
    `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
  );

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // Page views are reported manually on every route change.
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
};

const initFacebookPixel = () => {
  if (!FB_PIXEL_ID || window.fbq) return;

  const fbq = function fbq(...args) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue.push(args);
    }
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  injectScript('fb-pixel-script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', FB_PIXEL_ID);
};

const trackPageView = (path) => {
  if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }

  if (FB_PIXEL_ID && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
};

/**
 * Injects Google Analytics (GA4) and Facebook Pixel when their IDs are
 * provided via environment variables, and reports a page view on every
 * client-side route change.
 */
const Analytics = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    initGoogleAnalytics();
    initFacebookPixel();
  }, []);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID && !FB_PIXEL_ID) return;
    trackPageView(`${pathname}${search}`);
  }, [pathname, search]);

  return null;
};

export default Analytics;
