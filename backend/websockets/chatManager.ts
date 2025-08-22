import { getSocketServer } from "../socket";
import { notifyChatReply } from "../controllers/pushController";

const activeRooms = new Set<string>();

export const initChatNamespace = () => {
	const io = getSocketServer();
	if (!io) return;
	const chat = io.of("/chat");

	chat.on("connection", (socket) => {
		socket.on("join", (roomId: string) => {
			if (!roomId) return;
			socket.join(roomId);
			activeRooms.add(roomId);
			chat.to(roomId).emit("system", { type: "join", userId: socket.id });
			// notify admins about new/active chat
			chat.to("admin").emit("new_chat", { roomId });
		});

		socket.on("message", async (payload: { roomId: string; message: string; user?: string }) => {
			const { roomId, message, user } = (payload || ({} as any));
			if (!roomId || !message) return;
			chat.to(roomId).emit("message", { user: user || socket.id, message, ts: Date.now() });
			// If admin replied, try to send push to that visitor (roomId is the visitor chatId)
			if ((user || "").toLowerCase() === "admin") {
				try {
					await notifyChatReply(roomId, message);
				} catch {}
			}
		});

		socket.on("leave", (roomId: string) => {
			socket.leave(roomId);
			chat.to(roomId).emit("system", { type: "leave", userId: socket.id });
		});

		socket.on("join_admin", () => {
			socket.join("admin");
			// send current rooms snapshot
			socket.emit("rooms", Array.from(activeRooms));
		});

		socket.on("get_rooms", () => {
			socket.emit("rooms", Array.from(activeRooms));
		});
	});
};