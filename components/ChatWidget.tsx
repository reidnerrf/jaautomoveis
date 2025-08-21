import React from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
	user: string;
	message: string;
	ts: number;
	self?: boolean;
}

const getOrCreateChatId = (): string => {
	const key = "chatId";
	let id = localStorage.getItem(key);
	if (!id) {
		id = Math.random().toString(36).slice(2);
		localStorage.setItem(key, id);
	}
	return id;
};

const ChatWidget: React.FC = () => {
	const [open, setOpen] = React.useState(false);
	const [messages, setMessages] = React.useState<ChatMessage[]>([]);
	const [input, setInput] = React.useState("");
	const socketRef = React.useRef<Socket | null>(null);
	const roomIdRef = React.useRef<string>("");
	const userRef = React.useRef<string>("");

	React.useEffect(() => {
		userRef.current = getOrCreateChatId();
		roomIdRef.current = userRef.current; // one room per visitor
		const s = io("/chat", {
			path: "/socket.io",
			transports: ["websocket"],
			withCredentials: true,
		});
		socketRef.current = s;
		s.on("connect", () => {
			s.emit("join", roomIdRef.current);
		});
		s.on("message", (m: { user: string; message: string; ts: number }) => {
			setMessages((prev) => [...prev, { ...m, self: m.user === userRef.current }]);
		});
		s.on("system", (payload: any) => {
			if (payload?.type === "join" && payload.userId !== s.id) {
				setMessages((prev) => [
					...prev,
					{ user: "system", message: "Um atendente entrou no chat.", ts: Date.now() },
				]);
			}
		});
		return () => {
			s.disconnect();
		};
	}, []);

	const send = () => {
		const text = input.trim();
		if (!text || !socketRef.current) return;
		const msg = { roomId: roomIdRef.current, message: text, user: userRef.current };
		setMessages((prev) => [...prev, { user: userRef.current, message: text, ts: Date.now(), self: true }]);
		setInput("");
		socketRef.current.emit("message", msg);
	};

	return (
		<>
			{/* Floating button */}
			<button
				onClick={() => setOpen((v) => !v)}
				className="fixed bottom-6 right-6 z-40 rounded-full bg-main-red text-white shadow-lg w-14 h-14 flex items-center justify-center hover:bg-red-700 focus:outline-none"
				aria-label="Abrir chat"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
					<path d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75A9.716 9.716 0 0 1 7.5 20.1l-3.284.82A1.125 1.125 0 0 1 2.67 19.5l.82-3.284A9.716 9.716 0 0 1 2.25 12Z" />
				</svg>
			</button>

			{/* Chat panel */}
			{open && (
				<div className="fixed bottom-24 right-6 z-40 w-80 max-w-[90vw] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
					<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
						<div className="text-sm font-semibold">Atendimento</div>
						<button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
							✕
						</button>
					</div>
					<div className="p-3 h-72 overflow-y-auto space-y-2">
						{messages.length === 0 && (
							<div className="text-xs text-gray-500">Como podemos ajudar? Envie sua mensagem.</div>
						)}
						{messages.map((m, idx) => (
							<div key={idx} className={`flex ${m.self ? "justify-end" : "justify-start"}`}>
								<div className={`${m.self ? "bg-main-red text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"} px-3 py-2 rounded-lg max-w-[80%] text-sm`}>{m.message}</div>
							</div>
						))}
					</div>
					<div className="p-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Digite sua mensagem..."
							className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none"
							onKeyDown={(e) => {
								if (e.key === "Enter") send();
							}}
						/>
						<button onClick={send} className="bg-main-red hover:bg-red-700 text-white rounded-md px-3 py-2 text-sm">Enviar</button>
					</div>
				</div>
			)}
		</>
	);
};

export default ChatWidget;