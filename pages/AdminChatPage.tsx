import React from "react";
import { io, Socket } from "socket.io-client";

interface RoomItem {
	id: string;
	name?: string;
	lastTs?: number;
}

interface ChatMessage {
	user: string;
	message?: string;
	imageUrl?: string;
	ts: number;
}

const AdminChatPage: React.FC = () => {
	const [rooms, setRooms] = React.useState<RoomItem[]>([]);
	const [activeRoom, setActiveRoom] = React.useState<string>("");
	const [messages, setMessages] = React.useState<ChatMessage[]>([]);
	const [input, setInput] = React.useState("");
	const socketRef = React.useRef<Socket | null>(null);
	const lastIncomingTsRef = React.useRef<number>(0);

	React.useEffect(() => {
		const s = io("/chat", { path: "/socket.io", transports: ["websocket"], withCredentials: true });
		socketRef.current = s;
		s.on("connect", () => {
			s.emit("join_admin");
			s.emit("get_rooms");
		});
		s.on("rooms", (list: RoomItem[]) => {
			const sorted = [...list].sort((a, b) => (b.lastTs || 0) - (a.lastTs || 0));
			setRooms(sorted);
		});
		s.on("new_chat", ({ roomId, lastTs }: { roomId: string; lastTs?: number }) => {
			setRooms((prev) => {
				if (prev.some((r) => r.id === roomId)) return prev;
				const next = [{ id: roomId, lastTs }, ...prev];
				return next.sort((a, b) => (b.lastTs || 0) - (a.lastTs || 0));
			});
		});
		s.on("room_updated", (item: RoomItem) => {
			setRooms((prev) => {
				const map = new Map(prev.map((r) => [r.id, r] as const));
				map.set(item.id, { ...map.get(item.id), ...item } as RoomItem);
				const next = Array.from(map.values());
				return next.sort((a, b) => (b.lastTs || 0) - (a.lastTs || 0));
			});
		});
		s.on("room_deleted", ({ roomId }: { roomId: string }) => {
			setRooms((prev) => prev.filter((r) => r.id !== roomId));
			if (activeRoom === roomId) {
				setActiveRoom("");
				setMessages([]);
			}
		});
		s.on("history", (items: ChatMessage[]) => {
			if (!Array.isArray(items)) return;
			const normalized = items.map((m) => ({ ...m, message: m.message || "" }));
			if (normalized.length > 0) {
				lastIncomingTsRef.current = Math.max(lastIncomingTsRef.current, ...normalized.map((m) => m.ts || 0));
				setMessages((prev) => {
					if (prev.length === 0) return normalized;
					const existing = new Set(prev.map((m) => m.ts));
					return [...prev, ...normalized.filter((m) => !existing.has(m.ts))].sort((a, b) => a.ts - b.ts);
				});
			}
		});
		s.on("message", (m: ChatMessage) => {
			if (m.ts && m.ts <= lastIncomingTsRef.current) return;
			lastIncomingTsRef.current = Math.max(lastIncomingTsRef.current, m.ts || 0);
			setMessages((prev) => [...prev, m]);
		});
		return () => {
			s.disconnect();
		};
	}, [activeRoom]);

	const openRoom = (id: string) => {
		setActiveRoom(id);
		setMessages([]);
		lastIncomingTsRef.current = 0;
		// join like a regular participant so we receive events
		socketRef.current?.emit("join", id);
	};

	const send = () => {
		const text = input.trim();
		if (!text || !activeRoom) return;
		// optimistic append so admin sees own message immediately
		const ts = Date.now();
		setMessages((prev) => [...prev, { user: "admin", message: text, ts }]);
		socketRef.current?.emit("message", { roomId: activeRoom, message: text, user: "admin" });
		setInput("");
	};

	const deleteRoom = (id: string) => {
		socketRef.current?.emit("admin_delete_room", { roomId: id });
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold mb-4">Atendimentos</h1>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="border rounded-lg overflow-hidden">
					<div className="px-3 py-2 font-medium border-b">Conversas</div>
					<ul className="max-h-[70vh] overflow-y-auto">
						{rooms.length === 0 && <li className="p-3 text-sm text-gray-500">Nenhuma conversa ativa</li>}
						{rooms.map((r) => (
							<li key={r.id} className="flex items-center">
								<button
									onClick={() => openRoom(r.id)}
									className={`flex-1 text-left px-3 py-2 hover:bg-gray-50 ${activeRoom === r.id ? "bg-gray-100" : ""}`}
								>
									<div className="text-sm font-medium">{r.name ? `${r.name} (${r.id})` : r.id}</div>
									<div className="text-xs text-gray-500">Última atividade {r.lastTs ? new Date(r.lastTs).toLocaleString() : "—"}</div>
								</button>
								<button onClick={() => deleteRoom(r.id)} className="text-red-600 text-xs px-2">Excluir</button>
							</li>
						))}
					</ul>
				</div>
				<div className="md:col-span-2 border rounded-lg flex flex-col overflow-hidden min-h-[60vh]">
					<div className="px-3 py-2 font-medium border-b">{activeRoom ? `Sala ${activeRoom}` : "Selecione uma conversa"}</div>
					<div className="flex-1 p-3 overflow-y-auto space-y-2">
						{messages.map((m, i) => (
							<div key={i} className={`flex ${m.user === "admin" ? "justify-end" : "justify-start"}`}>
								<div className={`${m.user === "admin" ? "bg-blue-600 text-white" : "bg-gray-200"} px-3 py-2 rounded-lg max-w-[80%] text-sm`}>
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
					<div className="p-2 border-t flex gap-2">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Digite sua resposta..."
							className="flex-1 bg-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none"
							onKeyDown={(e) => e.key === "Enter" && send()}
						/>
						<button onClick={send} className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-2 text-sm">Enviar</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminChatPage;