
import React from 'react';
import { Helmet } from 'react-helmet';
import { SEOData } from '../utils/seo';

interface SEOHeadProps extends SEOData {
  children?: React.ReactNode;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  children
}) => {
  const siteUrl = window.location.origin;
  const fullUrl = url ? `${siteUrl}${url}` : window.location.href;
  const imageUrl = image?.startsWith('http') ? image : `${siteUrl}${image || '/assets/logo.png'}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {Boolean(keywords) && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="JA Automóveis" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Additional meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="JA Automóveis" />
      <link rel="canonical" href={fullUrl} />
      
      {children}
    </Helmet>
  );
};

export default SEOHead;
