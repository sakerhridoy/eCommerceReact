/**
 * Vercel Routing Middleware (file convention: `middleware.js` at project root).
 *
 * Social crawlers (Facebook, Messenger, WhatsApp, Twitter/X, LinkedIn, …) never
 * execute JavaScript, so the Open Graph tags injected at runtime by
 * react-helmet-async are invisible to them — shared product links show up as
 * plain URLs. This middleware intercepts product URLs for those crawlers and
 * returns a small HTML document carrying the product's real OG / Twitter Card
 * metadata, fetched from the backend API.
 *
 * Regular visitors and real search engines are passed straight through to the
 * SPA with next().
 */

import { next } from '@vercel/functions';

const API_BASE_URL = (
  process.env.BACKEND_API_URL || 'https://exclucive-backend.onrender.com'
).replace(/\/api\/?$/, '');

const SITE_NAME = 'Exclusive';
const DEFAULT_IMAGE = '/og-image.jpg';
const FALLBACK_DESCRIPTION =
  'Shop the latest electronics, fashion, and home appliances at Exclusive. Genuine products, best prices, and fast delivery.';

// Social / link-preview crawlers that do not run JavaScript.
const CRAWLER_PATTERN =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|TelegramBot|Slackbot|Slack-ImgProxy|Discordbot|Pinterest|vkShare|W3C_Validator|redditbot|Embedly|Quora Link Preview|Outbrain|SkypeUriPreview|Iframely|MetaInspector|kakaotalk-scrap|LinePoker/i;

const PRODUCT_PATH = /^\/product\/([^/]+)\/?$/;

const escapeHtml = value =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Mirrors getImageUrl() in src/api/catalog.js so preview images resolve to the
// same URLs the storefront uses.
const toImageUrl = image => {
  const raw = typeof image === 'string' ? image : image?.url || '';
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;

  const cleanPath = raw.startsWith('/') ? raw : `/${raw}`;
  return cleanPath.startsWith('/uploads')
    ? `${API_BASE_URL}${cleanPath}`
    : `${API_BASE_URL}/uploads${cleanPath}`;
};

// Backend responses nest the product differently per endpoint; unwrap until we
// reach the object that actually holds the product.
const unwrap = payload => {
  let value = payload;
  while (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value.data !== undefined
  ) {
    value = value.data;
  }
  return value;
};

const fetchProduct = async id => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/products/${encodeURIComponent(id)}`,
  );
  if (!response.ok) return null;

  const payload = unwrap(await response.json());
  return payload?.product ?? payload ?? null;
};

const buildProductHtml = (product, requestUrl) => {
  const { origin, pathname } = new URL(requestUrl);

  const rawTitle = product?.seo?.title || product?.title || product?.name;
  const title = rawTitle ? `${rawTitle} | ${SITE_NAME}` : SITE_NAME;
  const description = (
    product?.seo?.description ||
    product?.shortDescription ||
    product?.description ||
    FALLBACK_DESCRIPTION
  ).slice(0, 300);
  const keywords =
    Array.isArray(product?.seo?.keywords) && product.seo.keywords.length
      ? product.seo.keywords.join(', ')
      : [rawTitle, SITE_NAME].filter(Boolean).join(', ');

  const rawImage =
    product?.thumbnail ||
    (Array.isArray(product?.images) ? product.images[0] : '') ||
    product?.img ||
    product?.image;
  const image = toImageUrl(rawImage) || `${origin}${DEFAULT_IMAGE}`;
  const canonical = `${origin}${pathname}`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${escapeHtml(canonical)}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
  </head>
  <body></body>
</html>`;
};

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  if (!CRAWLER_PATTERN.test(userAgent)) return next();

  const { pathname } = new URL(request.url);
  const match = pathname.match(PRODUCT_PATH);
  if (!match) return next();

  try {
    const product = await fetchProduct(decodeURIComponent(match[1]));
    if (!product) return next();

    return new Response(buildProductHtml(product, request.url), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control':
          'public, max-age=0, s-maxage=600, stale-while-revalidate=86400',
      },
    });
  } catch {
    // Never block a share preview on an upstream failure — fall back to the SPA.
    return next();
  }
}

export const config = {
  matcher: ['/product/:id'],
};
