import React from "react";

const CookieConsent: React.FC = () => {
	const [visible, setVisible] = React.useState(false);
	const [personalization, setPersonalization] = React.useState(true);
	const [analytics, setAnalytics] = React.useState(true);

	React.useEffect(() => {
		const consent = localStorage.getItem("cookieConsentV1");
		if (!consent) setVisible(true);
	}, []);

	const accept = () => {
		localStorage.setItem("cookieConsentV1", JSON.stringify({ personalization, analytics }));
		setVisible(false);
	};

	if (!visible) return null;

	return (
		<div className="fixed bottom-0 inset-x-0 z-50 bg-gray-900 text-white p-4 shadow-2xl">
			<div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
				<div className="flex-1 text-sm">
					Usamos cookies para melhorar sua experiência e personalizar anúncios de veículos.
				</div>
				<div className="flex items-center gap-4">
					<label className="text-xs flex items-center gap-2">
						<input type="checkbox" checked={personalization} onChange={(e) => setPersonalization(e.target.checked)} />
						Personalização
					</label>
					<label className="text-xs flex items-center gap-2">
						<input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
						Analytics
					</label>
					<button onClick={accept} className="bg-main-red hover:bg-red-700 text-white text-sm px-4 py-2 rounded-md">Aceitar</button>
				</div>
			</div>
		</div>
	);
};

export default CookieConsent;