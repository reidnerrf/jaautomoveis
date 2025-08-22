import React from "react";
import { io, Socket } from "socket.io-client";

interface RoomItem {
	id: string;
	lastTs?: number;
}

interface ChatMessage {
	user: string;
	message: string;
	ts: number;
}

const AdminChatPage: React.FC = () => {
	const [rooms, setRooms] = React.useState<RoomItem[]>([]);
	const [activeRoom, setActiveRoom] = React.useState<string>("");
	const [messages, setMessages] = React.useState<ChatMessage[]>([]);
	const [input, setInput] = React.useState("");
	const socketRef = React.useRef<Socket | null>(null);

	React.useEffect(() => {
		const s = io("/chat", { path: "/socket.io", transports: ["websocket"], withCredentials: true });
		socketRef.current = s;
		s.on("connect", () => {
			s.emit("join_admin");
			s.emit("get_rooms");
		});
		s.on("rooms", (list: string[]) => {
			setRooms(list.map((id) => ({ id })));
		});
		s.on("new_chat", ({ roomId }: { roomId: string }) => {
			setRooms((prev) => {
				if (prev.some((r) => r.id === roomId)) return prev;
				return [{ id: roomId }, ...prev];
			});
		});
		s.on("message", (m: ChatMessage) => {
			setMessages((prev) => [...prev, m]);
		});
		return () => {
			s.disconnect();
		};
	}, []);

	const openRoom = (id: string) => {
		setActiveRoom(id);
		setMessages([]);
		// join like a regular participant so we receive events
		socketRef.current?.emit("join", id);
	};

	const send = () => {
		const text = input.trim();
		if (!text || !activeRoom) return;
		socketRef.current?.emit("message", { roomId: activeRoom, message: text, user: "admin" });
		setInput("");
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
							<li key={r.id}>
								<button
									onClick={() => openRoom(r.id)}
									className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${activeRoom === r.id ? "bg-gray-100" : ""}`}
								>
									<div className="text-sm font-medium">{r.id}</div>
									<div className="text-xs text-gray-500">Última atividade {r.lastTs ? new Date(r.lastTs).toLocaleTimeString() : "—"}</div>
								</button>
							</li>
						))}
					</ul>
				</div>
				<div className="md:col-span-2 border rounded-lg flex flex-col overflow-hidden min-h-[60vh]">
					<div className="px-3 py-2 font-medium border-b">{activeRoom ? `Sala ${activeRoom}` : "Selecione uma conversa"}</div>
					<div className="flex-1 p-3 overflow-y-auto space-y-2">
						{messages.map((m, i) => (
							<div key={i} className={`flex ${m.user === "admin" ? "justify-end" : "justify-start"}`}>
								<div className={`${m.user === "admin" ? "bg-blue-600 text-white" : "bg-gray-200"} px-3 py-2 rounded-lg max-w-[80%] text-sm`}>{m.message}</div>
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