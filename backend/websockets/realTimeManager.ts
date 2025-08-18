import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import Vehicle from '../models/Vehicle';
import User from '../models/User';

interface SocketUser {
  id: string;
  email: string;
  role: string;
  socketId: string;
}

interface RoomData {
  users: SocketUser[];
  vehicleId?: string;
  page: string;
  lastActivity: Date;
}

class RealTimeManager {
  private io: SocketIOServer;
  private rooms: Map<string, RoomData> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startPeriodicCleanup();
  }

  private setupMiddleware() {
    // Autenticação via JWT
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
          const user = await User.findById(decoded.id).select('-password');
          
          if (user) {
            socket.data.user = user;
            this.userSockets.set(user.id, socket.id);
          }
        }
        next();
      } catch (error) {
        next();
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join page room
      socket.on('join-page', (data: { page: string; vehicleId?: string }) => {
        this.handleJoinPage(socket, data);
      });

      // Leave page room
      socket.on('leave-page', (data: { page: string }) => {
        this.handleLeavePage(socket, data);
      });

      // Vehicle interaction
      socket.on('vehicle-view', (data: { vehicleId: string }) => {
        this.handleVehicleView(socket, data);
      });

      socket.on('vehicle-like', (data: { vehicleId: string }) => {
        this.handleVehicleLike(socket, data);
      });

      socket.on('vehicle-share', (data: { vehicleId: string; platform: string }) => {
        this.handleVehicleShare(socket, data);
      });

      // Chat functionality
      socket.on('join-chat', (data: { vehicleId: string }) => {
        this.handleJoinChat(socket, data);
      });

      socket.on('chat-message', (data: { vehicleId: string; message: string }) => {
        this.handleChatMessage(socket, data);
      });

      // Admin notifications
      socket.on('admin-notification', (data: { type: string; message: string }) => {
        this.handleAdminNotification(socket, data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private handleJoinPage(socket: any, data: { page: string; vehicleId?: string }) {
    const roomId = data.vehicleId ? `${data.page}-${data.vehicleId}` : data.page;
    const {user} = socket.data;

    socket.join(roomId);

    // Update room data
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        users: [],
        vehicleId: data.vehicleId,
        page: data.page,
        lastActivity: new Date()
      });
    }

    const room = this.rooms.get(roomId)!;
    if (user && !room.users.find(u => u.id === user.id)) {
      room.users.push({
        id: user.id,
        email: user.email,
        role: user.role,
        socketId: socket.id
      });
    }

    // Emit updated user count
    this.io.to(roomId).emit('page-viewers', {
      page: data.page,
      vehicleId: data.vehicleId,
      count: room.users.length,
      users: room.users.map(u => ({ id: u.id, role: u.role }))
    });

    console.log(`User joined ${roomId}, total users: ${room.users.length}`);
  }

  private handleLeavePage(socket: any, data: { page: string }) {
    const roomId = data.page;
    const {user} = socket.data;

    socket.leave(roomId);

    const room = this.rooms.get(roomId);
    if (room && user) {
      room.users = room.users.filter(u => u.id !== user.id);
      
      this.io.to(roomId).emit('page-viewers', {
        page: data.page,
        count: room.users.length,
        users: room.users.map(u => ({ id: u.id, role: u.role }))
      });
    }
  }

  private async handleVehicleView(socket: any, data: { vehicleId: string }) {
    try {
      // Increment view count
      await Vehicle.findByIdAndUpdate(data.vehicleId, { $inc: { views: 1 } });

      // Emit to all users viewing this vehicle
      this.io.to(`vehicle-${data.vehicleId}`).emit('vehicle-viewed', {
        vehicleId: data.vehicleId,
        viewer: socket.data.user ? {
          id: socket.data.user.id,
          role: socket.data.user.role
        } : null,
        timestamp: new Date()
      });

      // Notify admins
      this.io.to('admin').emit('vehicle-viewed', {
        vehicleId: data.vehicleId,
        viewer: socket.data.user,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling vehicle view:', error);
    }
  }

  private handleVehicleLike(socket: any, data: { vehicleId: string }) {
    const {user} = socket.data;
    if (!user) return;

    this.io.to(`vehicle-${data.vehicleId}`).emit('vehicle-liked', {
      vehicleId: data.vehicleId,
      user: {
        id: user.id,
        role: user.role
      },
      timestamp: new Date()
    });
  }

  private handleVehicleShare(socket: any, data: { vehicleId: string; platform: string }) {
    const {user} = socket.data;

    this.io.to(`vehicle-${data.vehicleId}`).emit('vehicle-shared', {
      vehicleId: data.vehicleId,
      platform: data.platform,
      user: user ? {
        id: user.id,
        role: user.role
      } : null,
      timestamp: new Date()
    });
  }

  private handleJoinChat(socket: any, data: { vehicleId: string }) {
    const chatRoom = `chat-${data.vehicleId}`;
    socket.join(chatRoom);

    // Notify others in chat
    socket.to(chatRoom).emit('user-joined-chat', {
      vehicleId: data.vehicleId,
      user: socket.data.user ? {
        id: socket.data.user.id,
        role: socket.data.user.role
      } : null
    });
  }

  private handleChatMessage(socket: any, data: { vehicleId: string; message: string }) {
    const chatRoom = `chat-${data.vehicleId}`;
    const {user} = socket.data;

    this.io.to(chatRoom).emit('chat-message', {
      vehicleId: data.vehicleId,
      message: data.message,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : null,
      timestamp: new Date()
    });
  }

  private handleAdminNotification(socket: any, data: { type: string; message: string }) {
    const {user} = socket.data;
    if (!user || user.role !== 'admin') return;

    this.io.to('admin').emit('admin-notification', {
      type: data.type,
      message: data.message,
      from: {
        id: user.id,
        email: user.email
      },
      timestamp: new Date()
    });
  }

  private handleDisconnect(socket: any) {
    const {user} = socket.data;
    if (user) {
      this.userSockets.delete(user.id);
    }

    // Remove user from all rooms
    this.rooms.forEach((room, roomId) => {
      if (user) {
        room.users = room.users.filter(u => u.id !== user.id);
        
        this.io.to(roomId).emit('page-viewers', {
          page: room.page,
          vehicleId: room.vehicleId,
          count: room.users.length,
          users: room.users.map(u => ({ id: u.id, role: u.role }))
        });
      }
    });

    console.log(`User disconnected: ${socket.id}`);
  }

  private startPeriodicCleanup() {
    setInterval(() => {
      const now = new Date();
      const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

      this.rooms.forEach((room, roomId) => {
        if (now.getTime() - room.lastActivity.getTime() > inactiveThreshold) {
          this.rooms.delete(roomId);
          console.log(`Cleaned up inactive room: ${roomId}`);
        }
      });
    }, 10 * 60 * 1000); // Check every 10 minutes
  }

  // Public methods for external use
  public emitToVehicle(vehicleId: string, event: string, data: any) {
    this.io.to(`vehicle-${vehicleId}`).emit(event, data);
  }

  public emitToAdmins(event: string, data: any) {
    this.io.to('admin').emit(event, data);
  }

  public emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  public getRoomStats() {
    const stats = {
      totalRooms: this.rooms.size,
      totalUsers: 0,
      rooms: [] as any[]
    };

    this.rooms.forEach((room, roomId) => {
      stats.totalUsers += room.users.length;
      stats.rooms.push({
        roomId,
        page: room.page,
        vehicleId: room.vehicleId,
        userCount: room.users.length,
        lastActivity: room.lastActivity
      });
    });

    return stats;
  }
}

export default RealTimeManager;