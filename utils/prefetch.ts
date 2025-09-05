export const prefetchRoute = (path: string) => {
  const map: Record<string, () => Promise<unknown>> = {
    "/": () => import("../pages/HomePage"),
    "/inventory": () => import("../pages/InventoryPage"),
    "/financing": () => import("../pages/FinancingPage"),
    "/consortium": () => import("../pages/ConsortiumPage"),
    "/about": () => import("../pages/AboutPage"),
    "/contact": () => import("../pages/ContactPage"),
    "/privacy-policy": () => import("../pages/PrivacyPolicyPage"),
    "/terms-of-service": () => import("../pages/TermsOfServicePage"),
    "/admin": () => import("../pages/AdminDashboardPage"),
  };

  try {
    const normalized = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
    const prefetcher = map[normalized];
    if (prefetcher) {
      prefetcher();
    }
  } catch {
    // ignore prefetch errors silently
  }
};
