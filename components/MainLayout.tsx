import React from "react";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import { Outlet, useLocation } from "react-router-dom";
import FloatingSocialButtons from "./FloatingSocialButtons.tsx";
import { analytics } from "../utils/analytics.ts";
const ChatWidget = React.lazy(() => import("./ChatWidget.tsx"));
const CookieConsent = React.lazy(() => import("./CookieConsent.tsx"));

const MainLayout: React.FC = () => {
	const location = useLocation();
	const isHome = location.pathname === "/";

	React.useEffect(() => {
		analytics.trackPageView(location.pathname);
		try {
			// GA4 SPA page_view
			// @ts-ignore
			if (typeof window !== "undefined" && typeof window.gtag === "function") {
				// @ts-ignore
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
			<Footer />
			<FloatingSocialButtons page={location.pathname} />
			<React.Suspense fallback={null}>
				<ChatWidget />
			</React.Suspense>
			<React.Suspense fallback={null}>
				<CookieConsent />
			</React.Suspense>
		</div>
	);
};

export default MainLayout;
