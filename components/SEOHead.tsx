import React from "react";
import { Helmet } from "react-helmet-async";
import { SEOData } from "../utils/seo";

interface SEOHeadProps extends SEOData {
  children?: React.ReactNode;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  children,
}) => {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl =
    typeof window !== "undefined"
      ? url
        ? url.startsWith("http")
          ? url
          : `${siteUrl}${url}`
        : window.location.href
      : url || "";
  const imageUrl = image?.startsWith("http") ? image : `${siteUrl}${image || "/assets/logo.png"}`;

  const alternateLocales: Array<{ hrefLang: string; href: string }> = [
    { hrefLang: "pt-BR", href: fullUrl },
    { hrefLang: "x-default", href: fullUrl },
  ];

  return (
    <Helmet prioritizeSeoTags>
      <html lang="pt-BR" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
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
      {alternateLocales.map((alt, idx) => (
        <link key={idx} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />
      ))}

      {/* Open Graph defaults */}
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="JA Automóveis" />

      {/* Twitter defaults */}
      <meta name="twitter:site" content="@jaautomoveis" />

      {children}
    </Helmet>
  );
};

export default SEOHead;
