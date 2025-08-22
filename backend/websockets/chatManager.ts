import { getSocketServer } from "../socket";
import { notifyChatReply } from "../controllers/pushController";

interface RoomMeta {
	name?: string;
	lastTs: number;
}

const rooms = new Map<string, RoomMeta>();

export const initChatNamespace = () => {
	const io = getSocketServer();
	if (!io) return;
	const chat = io.of("/chat");

	const emitRoomsSnapshotTo = (socket: any) => {
		const list = Array.from(rooms.entries()).map(([id, meta]) => ({ id, ...meta }));
		list.sort((a, b) => (b.lastTs || 0) - (a.lastTs || 0));
		socket.emit("rooms", list);
	};

	const emitRoomsSnapshotToAdmins = () => {
		const list = Array.from(rooms.entries()).map(([id, meta]) => ({ id, ...meta }));
		list.sort((a, b) => (b.lastTs || 0) - (a.lastTs || 0));
		chat.to("admin").emit("rooms", list);
	};

	chat.on("connection", (socket) => {
		socket.on("join", (roomId: string) => {
			if (!roomId) return;
			socket.join(roomId);
			const now = Date.now();
			if (!rooms.has(roomId)) {
				rooms.set(roomId, { lastTs: now });
				chat.to("admin").emit("new_chat", { roomId, lastTs: now });
			} else {
				const meta = rooms.get(roomId)!;
				meta.lastTs = now;
				rooms.set(roomId, meta);
			}
			chat.to(roomId).emit("system", { type: "join", userId: socket.id });
		});

		socket.on(
			"message",
			async (payload: { roomId: string; message?: string; imageUrl?: string; user?: string }) => {
				const { roomId, message, imageUrl, user } = payload || ({} as any);
				if (!roomId || (!message && !imageUrl)) return;
				const ts = Date.now();
				chat.to(roomId).emit("message", { user: user || socket.id, message: message || "", imageUrl, ts });
				// update room last activity
				const meta = rooms.get(roomId) || { lastTs: ts };
				meta.lastTs = ts;
				rooms.set(roomId, meta);
				// If admin replied, try to send push to that visitor (roomId is the visitor chatId)
				if ((user || "").toLowerCase() === "admin" && message) {
					try {
						await notifyChatReply(roomId, message);
					} catch {}
				}
				chat.to("admin").emit("room_updated", { id: roomId, ...meta });
			}
		);

		socket.on("set_name", (payload: { roomId: string; name: string }) => {
			const { roomId, name } = payload || ({} as any);
			if (!roomId || !name) return;
			const meta = rooms.get(roomId) || { lastTs: Date.now() };
			meta.name = String(name).slice(0, 100);
			rooms.set(roomId, meta);
			chat.to("admin").emit("room_updated", { id: roomId, ...meta });
		});

		socket.on("leave", (roomId: string) => {
			socket.leave(roomId);
			chat.to(roomId).emit("system", { type: "leave", userId: socket.id });
		});

		socket.on("join_admin", () => {
			socket.join("admin");
			emitRoomsSnapshotTo(socket);
		});

		socket.on("get_rooms", () => {
			emitRoomsSnapshotTo(socket);
		});

		socket.on("admin_delete_room", ({ roomId }: { roomId: string }) => {
			if (!roomId) return;
			if (rooms.has(roomId)) {
				rooms.delete(roomId);
				chat.to("admin").emit("room_deleted", { roomId });
				chat.to(roomId).emit("system", { type: "closed" });
			}
		});
	});
};