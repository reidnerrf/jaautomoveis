import React from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

interface ChatMessage {
	user: string;
	message: string;
	imageUrl?: string;
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
	const [unread, setUnread] = React.useState<number>(0);
	const [displayName, setDisplayName] = React.useState<string>(() => localStorage.getItem("chatDisplayName") || "");
	const [uploading, setUploading] = React.useState(false);
	const fileInputRef = React.useRef<HTMLInputElement | null>(null);
	const socketRef = React.useRef<Socket | null>(null);
	const roomIdRef = React.useRef<string>("");
	const userRef = React.useRef<string>("");
	const lastIncomingTsRef = React.useRef<number>(0);

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
			if (displayName) {
				s.emit("set_name", { roomId: roomIdRef.current, name: displayName });
			}
		});
		s.on("message", (m: { user: string; message?: string; imageUrl?: string; ts: number }) => {
			const isSelf = m.user === userRef.current;
			// de-dupe by timestamp ordering and equality guard
			if (m.ts && m.ts <= lastIncomingTsRef.current && !isSelf) return;
			lastIncomingTsRef.current = Math.max(lastIncomingTsRef.current, m.ts || 0);
			setMessages((prev) => [...prev, { ...m, message: m.message || "", self: isSelf }]);
			if (!open && !isSelf) {
				setUnread((u) => u + 1);
				toast((t) => (
					<div className="text-sm">
						<strong>Nova resposta:</strong> {m.message || "Imagem"}
						<div className="mt-2 flex gap-2">
							<button
								onClick={() => {
									setOpen(true);
									setUnread(0);
									toast.dismiss(t.id);
								}}
								className="bg-main-red text-white px-2 py-1 rounded-md text-xs"
							>
								Abrir chat
							</button>
							<button onClick={() => toast.dismiss(t.id)} className="text-gray-300 hover:text-white text-xs">
								Fechar
							</button>
						</div>
					</div>
				));
			}
		});
		s.on("system", (payload: any) => {
			if (payload?.type === "join" && payload.userId !== s.id) {
				setMessages((prev) => [
					...prev,
					{ user: "system", message: "Um atendente entrou no chat.", ts: Date.now() },
				]);
			}
			if (payload?.type === "closed") {
				toast("Este chat foi encerrado.");
			}
		});
		return () => {
			s.disconnect();
		};
	}, []);

	const sendText = () => {
		const text = input.trim();
		if (!text || !socketRef.current) return;
		const msg = { roomId: roomIdRef.current, message: text, user: userRef.current };
		setMessages((prev) => [...prev, { user: userRef.current, message: text, ts: Date.now(), self: true }]);
		setInput("");
		socketRef.current.emit("message", msg);
	};

	const uploadAndSendImage = async (file: File) => {
		try {
			setUploading(true);
			const form = new FormData();
			form.append("image", file);
			const resp = await fetch("/api/chat/upload", { method: "POST", body: form });
			if (!resp.ok) throw new Error("Falha no upload");
			const data = await resp.json();
			const imageUrl = data.url as string;
			setMessages((prev) => [
				...prev,
				{ user: userRef.current, message: "", imageUrl, ts: Date.now(), self: true },
			]);
			socketRef.current?.emit("message", { roomId: roomIdRef.current, imageUrl, user: userRef.current });
		} catch (e) {
			toast.error("Não foi possível enviar a imagem");
		} finally {
			setUploading(false);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files && e.target.files[0];
		if (f) uploadAndSendImage(f);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const saveName = () => {
		const name = displayName.trim();
		if (!name) return;
		localStorage.setItem("chatDisplayName", name);
		socketRef.current?.emit("set_name", { roomId: roomIdRef.current, name });
		toast.success("Nome salvo");
	};

	const newChat = () => {
		localStorage.removeItem("chatId");
		userRef.current = getOrCreateChatId();
		roomIdRef.current = userRef.current;
		setMessages([]);
		socketRef.current?.emit("join", roomIdRef.current);
		if (displayName) socketRef.current?.emit("set_name", { roomId: roomIdRef.current, name: displayName });
	};

	const deleteChat = () => {
		localStorage.removeItem("chatId");
		setMessages([]);
		toast("Chat deletado localmente");
	};

	return (
		<>
			{/* Floating button - positioned just below Instagram floater */}
			<button
				onClick={() => {
					setOpen((v) => !v);
					setUnread(0);
				}}
				className="fixed bottom-[6rem] right-6 z-40 rounded-full bg-main-red text-white shadow-lg w-14 h-14 flex items-center justify-center hover:bg-red-700 focus:outline-none relative"
				aria-label="Abrir chat"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
					<path d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75A9.716 9.716 0 0 1 7.5 20.1l-3.284.82A1.125 1.125 0 0 1 2.67 19.5l.82-3.284A9.716 9.716 0 0 1 2.25 12Z" />
				</svg>
				{unread > 0 && (
					<span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] leading-none px-1.5 py-1 rounded-full shadow">{unread}</span>
				)}
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
					<div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex gap-2 items-center">
						<input
							type="text"
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
							placeholder="Seu nome"
							className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none"
						/>
						<button onClick={saveName} className="bg-gray-900 dark:bg-gray-700 text-white rounded-md px-2 py-2 text-xs">Salvar</button>
						<button onClick={newChat} className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-2 py-2 text-xs">Novo</button>
						<button onClick={deleteChat} className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md px-2 py-2 text-xs">Deletar</button>
					</div>
					<div className="p-3 h-72 overflow-y-auto space-y-2">
						{messages.length === 0 && (
							<div className="text-xs text-gray-500">Como podemos ajudar? Envie sua mensagem.</div>
						)}
						{messages.map((m, idx) => (
							<div key={idx} className={`flex ${m.self ? "justify-end" : "justify-start"}`}>
								<div className={`${m.self ? "bg-main-red text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"} px-3 py-2 rounded-lg max-w-[80%] text-sm`}>
									{m.imageUrl ? (
										<img src={m.imageUrl} alt="imagem" className="max-w-full rounded" />
									) : (
										<span>{m.message}</span>
									)}
									<div className="mt-1 text-[10px] opacity-70 text-right">{new Date(m.ts).toLocaleString()}</div>
								</div>
							</div>
						))}
					</div>
					<div className="p-2 border-t border-gray-200 dark:border-gray-700 flex gap-2 items-center">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Digite sua mensagem..."
							className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none"
							onKeyDown={(e) => {
								if (e.key === "Enter") sendText();
							}}
						/>
						<button onClick={sendText} className="bg-main-red hover:bg-red-700 text-white rounded-md px-3 py-2 text-sm">Enviar</button>
						<input ref={fileInputRef} onChange={handleFileChange} type="file" accept="image/*" className="hidden" />
						<button
							onClick={() => fileInputRef.current?.click()}
							disabled={uploading}
							className="bg-gray-700 disabled:opacity-50 text-white rounded-md px-2 py-2 text-xs"
						>
							{uploading ? "Enviando..." : "Imagem"}
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default ChatWidget;