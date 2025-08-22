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
			// only join if user has provided a name
			if (displayName.trim()) {
				s.emit("join", roomIdRef.current);
				s.emit("set_name", { roomId: roomIdRef.current, name: displayName.trim() });
			}
		});
		s.on("history", (items: { user: string; message?: string; imageUrl?: string; ts: number }[]) => {
			const mapped = items.map((m) => ({ ...m, message: m.message || "", self: m.user === userRef.current }));
			if (mapped.length > 0) {
				lastIncomingTsRef.current = Math.max(lastIncomingTsRef.current, ...mapped.map((m) => m.ts || 0));
				setMessages((prev) => {
					// avoid duplicating if we already have some history
					if (prev.length === 0) return mapped;
					const existingTs = new Set(prev.map((m) => m.ts));
					const merged = [...prev, ...mapped.filter((m) => !existingTs.has(m.ts))];
					merged.sort((a, b) => a.ts - b.ts);
					return merged;
				});
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
		s.on("message_rejected", (p: { reason: string }) => {
			if (p?.reason === "missing_name") {
				toast.error("Informe seu nome para enviar mensagens");
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
		if (!displayName.trim()) {
			toast.error("Informe seu nome antes de enviar mensagens");
			return;
		}
		// ensure join happens if not already
		socketRef.current.emit("join", roomIdRef.current);
		socketRef.current.emit("set_name", { roomId: roomIdRef.current, name: displayName.trim() });
		const msg = { roomId: roomIdRef.current, message: text, user: userRef.current };
		// optimistic add with a unique ts; server will broadcast its own copy with different ts
		const now = Date.now();
		setMessages((prev) => [...prev, { user: userRef.current, message: text, ts: now, self: true }]);
		setInput("");
		socketRef.current.emit("message", msg);
	};

	const uploadAndSendImage = async (file: File) => {
		try {
			if (!displayName.trim()) {
				toast.error("Informe seu nome antes de enviar imagens");
				return;
			}
			setUploading(true);
			const form = new FormData();
			form.append("image", file);
			form.append("roomId", roomIdRef.current);
			const resp = await fetch("/api/chat/upload", { method: "POST", body: form });
			if (!resp.ok) throw new Error("Falha no upload");
			const data = await resp.json();
			const imageUrl = data.url as string;
			setMessages((prev) => [
				...prev,
				{ user: userRef.current, message: "", imageUrl, ts: Date.now(), self: true },
			]);
			// ensure join happens if not already
			socketRef.current?.emit("join", roomIdRef.current);
			socketRef.current?.emit("set_name", { roomId: roomIdRef.current, name: displayName.trim() });
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
		if (!name) {
			toast.error("Por favor, informe seu nome para iniciar o chat");
			return;
		}
		localStorage.setItem("chatDisplayName", name);
		socketRef.current?.emit("join", roomIdRef.current);
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
	className="fixed bottom-6 left-6 z-[9999] w-14 h-14 flex items-center justify-center rounded-full 
    bg-gradient-to-r from-main-red to-red-600 
    text-white shadow-lg hover:shadow-2xl transition-all duration-300 
    hover:scale-110 active:scale-95 focus:outline-none"
	aria-label="Abrir chat"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		className="w-7 h-7 drop-shadow-sm"
	>
		<path d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75A9.716 9.716 0 0 1 7.5 20.1l-3.284.82A1.125 1.125 0 0 1 2.67 19.5l.82-3.284A9.716 9.716 0 0 1 2.25 12Z" />
	</svg>

	{unread > 0 && (
		<span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] 
        leading-none px-1.5 py-1 rounded-full shadow-md animate-bounce">
			{unread}
		</span>
	)}
</button>

			{/* Chat panel */}
{open && (
  <div
    className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 
      w-[92vw] max-w-sm bg-white dark:bg-gray-800 
      rounded-3xl shadow-2xl shadow-red-500/10 border 
      border-gray-200 dark:border-gray-700 flex flex-col 
      overflow-hidden transition-all duration-300 ease-out"
  >
    {/* Header */}
    <div className="px-4 py-3 bg-gradient-to-r from-main-red to-red-600 
      text-white flex items-center justify-between">
      <div className="text-sm font-semibold">💬 Atendimento</div>
      <button
        onClick={() => setOpen(false)}
        className="p-1 rounded-full hover:bg-white/20 transition"
      >
        ✕
      </button>
    </div>

    {/* Nome e ações */}
    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex gap-2 items-center">
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Seu nome"
        className="w-1/2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 
          rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main-red/50"
      />
      <button
        onClick={saveName}
        className="px-3 py-2 rounded-md bg-gray-800 text-white text-xs hover:bg-gray-900 transition"
      >
        Salvar
      </button>
      <button
        onClick={newChat}
        className="px-3 py-2 rounded-md bg-blue-600 text-white text-xs hover:bg-blue-700 transition"
      >
        Novo
      </button>
      <button
        onClick={deleteChat}
        className="px-3 py-2 rounded-md bg-red-100 text-red-600 text-xs hover:bg-red-200 
          dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-800/60 flex items-center gap-1 transition"
      >
        🗑 Deletar
      </button>
    </div>

    {/* Messages */}
    <div className="p-3 h-72 overflow-y-auto overscroll-contain space-y-2 scrollbar-thin">
      {!displayName.trim() && (
        <div className="text-xs text-red-600">Informe seu nome acima para iniciar o chat.</div>
      )}
      {messages.length === 0 && displayName.trim() && (
        <div className="text-xs text-gray-500">Como podemos ajudar? Envie sua mensagem.</div>
      )}
      {messages.map((m, idx) => (
        <div key={idx} className={`flex ${m.self ? "justify-end" : "justify-start"}`}>
          <div
            className={`${m.self
              ? "bg-main-red text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              } px-3 py-2 rounded-xl max-w-[80%] text-sm shadow-sm`}
          >
            {m.imageUrl ? (
              <img src={m.imageUrl} alt="imagem" className="max-w-full rounded-md" />
            ) : (
              <span>{m.message}</span>
            )}
            <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 text-right">
              {new Date(m.ts).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Input */}
    <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex gap-2 items-center">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Digite sua mensagem..."
        className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 
          rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main-red/50"
        onKeyDown={(e) => {
          if (e.key === "Enter") sendText();
        }}
        disabled={!displayName.trim()}
      />
      <button
        onClick={sendText}
        disabled={!displayName.trim()}
        className="bg-main-red hover:bg-red-700 disabled:opacity-50 
          text-white rounded-md px-3 py-2 text-sm transition"
      >
        Enviar
      </button>
      <input
        ref={fileInputRef}
        onChange={handleFileChange}
        type="file"
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || !displayName.trim()}
        className="bg-gray-700 hover:bg-gray-800 disabled:opacity-50 
          text-white rounded-md px-3 py-2 text-sm flex items-center gap-1 transition"
      >
        {uploading ? "⏳" : "📷"} {uploading ? "Enviando" : "Imagem"}
      </button>
    </div>
  </div>
)}


		</>
	);
};

export default ChatWidget;