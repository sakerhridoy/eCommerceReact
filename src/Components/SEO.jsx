import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Exclusive';
const DEFAULT_TITLE = `${SITE_NAME} | Premium Online Shopping`;
const DEFAULT_DESCRIPTION =
  'Shop the latest electronics, fashion, and home appliances at Exclusive. Genuine products, best prices, and fast delivery.';
const DEFAULT_IMAGE = '/og-image.jpg';

const toAbsoluteUrl = (value) => {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  return `${window.location.origin}${value.startsWith('/') ? value : `/${value}`}`;
};

/**
 * Renders per-page SEO and Open Graph / Twitter Card meta tags.
 * Sharing any page (e.g. a product link) always produces a rich preview card.
 */
const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noIndex = false,
  children,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const metaKeywords = Array.isArray(keywords)
    ? keywords.join(', ')
    : keywords || 'ecommerce, online shopping, electronics, fashion, Exclusive';
  const metaImage = toAbsoluteUrl(image || DEFAULT_IMAGE);
  const canonicalUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta
        name="robots"
        content={noIndex ? 'noindex, nofollow' : 'index, follow'}
      />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {children}
    </Helmet>
  );
};

export default SEO;
