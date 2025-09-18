import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import { Outlet, useLocation } from "react-router-dom";
import FloatingSocialButtons from "./FloatingSocialButtons.tsx";
import { analytics } from "../utils/analytics.ts";
const CookieConsent = React.lazy(() => import("./CookieConsent.tsx"));
const JivoSite = React.lazy(() => import("./JivoSite.tsx"));

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  React.useEffect(() => {
    analytics.trackPageView(location.pathname);
    try {
      // GA4 SPA page_view
      // @ts-expect-error gtag may not be present in some environments
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        // @ts-expect-error gtag may not be present in some environments
        window.gtag("event", "page_view", {
          page_title: document.title,
          page_location: window.location.href,
          page_path: location.pathname,
        });
      }
    } catch {}
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col bg-comp-light-gray dark:bg-gray-900 font-sans antialiased overflow-x-hidden">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "JA Automóveis",
            url:
              typeof window !== "undefined"
                ? window.location.origin
                : "https://jaautomoveisresende.com.br",
            potentialAction: {
              "@type": "SearchAction",
              target:
                typeof window !== "undefined"
                  ? `${window.location.origin}/inventory?q={search_term_string}`
                  : "https://jaautomoveisresende.com.br/inventory?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          })}
        </script>
      </Helmet>
      {/* Decorative gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40 dark:opacity-30">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full" />
      </div>
      <Header />
      {/* Sem padding no topo na Home para o vídeo encostar no header transparente */}
      <main className={`relative flex-grow ${isHome ? "pt-0" : "pt-20"}`}>
        <Outlet />
      </main>
      {/* CTA fixo mobile */}

      <Footer />
      <FloatingSocialButtons page={location.pathname} />
      <React.Suspense fallback={null}>
        <CookieConsent />
        {/* Oculta o JivoChat em rotas administrativas */}
        {!location.pathname.startsWith("/admin") && <JivoSite />}
      </React.Suspense>
    </div>
  );
};

export default MainLayout;
