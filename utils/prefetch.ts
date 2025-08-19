export const prefetchRoute = (path: string) => {
  const map: Record<string, () => Promise<unknown>> = {
    "/": () => import("../pages/HomePage.tsx"),
    "/inventory": () => import("../pages/InventoryPage.tsx"),
    "/financing": () => import("../pages/FinancingPage.tsx"),
    "/consortium": () => import("../pages/ConsortiumPage.tsx"),
    "/about": () => import("../pages/AboutPage.tsx"),
    "/contact": () => import("../pages/ContactPage.tsx"),
    "/privacy-policy": () => import("../pages/PrivacyPolicyPage.tsx"),
    "/terms-of-service": () => import("../pages/TermsOfServicePage.tsx"),
    "/admin": () => import("../pages/AdminDashboardPage.tsx"),
  };

  try {
    const normalized =
      path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
    const prefetcher = map[normalized];
    if (prefetcher) {
      prefetcher();
    }
  } catch {
    // ignore prefetch errors silently
  }
};
