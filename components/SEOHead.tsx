import React from "react";
import { Helmet } from "react-helmet-async";
import { SEOData } from "../utils/seo";

interface SEOHeadProps extends SEOData {
  children?: React.ReactNode;
  robots?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  children,
  robots,
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

  const safeTitle = title || "JA Automóveis";
  const safeDescription =
    description ||
    "JA Automóveis em Resende (RJ): carros seminovos e usados com garantia, financiamento facilitado e atendimento premium.";

  return (
    <Helmet prioritizeSeoTags>
      <html lang="pt-BR" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />
      {Boolean(keywords) && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={safeTitle} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="JA Automóveis" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Additional meta tags */}
      <meta name="robots" content={robots || "index, follow"} />
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
