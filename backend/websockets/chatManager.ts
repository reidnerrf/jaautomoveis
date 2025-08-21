import { getSocketServer } from "../socket";

export const initChatNamespace = () => {
	const io = getSocketServer();
	if (!io) return;
	const chat = io.of("/chat");

	chat.on("connection", (socket) => {
		socket.on("join", (roomId: string) => {
			socket.join(roomId);
			chat.to(roomId).emit("system", { type: "join", userId: socket.id });
		});

		socket.on("message", (payload: { roomId: string; message: string; user?: string }) => {
			const { roomId, message, user } = payload || ({} as any);
			if (!roomId || !message) return;
			chat.to(roomId).emit("message", { user: user || socket.id, message, ts: Date.now() });
		});

		socket.on("leave", (roomId: string) => {
			socket.leave(roomId);
			chat.to(roomId).emit("system", { type: "leave", userId: socket.id });
		});
	});
};