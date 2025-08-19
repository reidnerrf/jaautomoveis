import { Server } from "socket.io";
import http from "http";
import Vehicle from "../models/Vehicle";

export class RealTimeManager {
  private io: Server;

  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join-vehicle-room", (vehicleId: string) => {
        socket.join(`vehicle-${vehicleId}`);
      });

      socket.on("leave-vehicle-room", (vehicleId: string) => {
        socket.leave(`vehicle-${vehicleId}`);
      });

      socket.on("join-admin-room", () => {
        socket.join("admin-room");
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  public emitVehicleUpdate(vehicle: any) {
    this.io
      .to(`vehicle-${vehicle.id || vehicle._id}`)
      .emit("vehicle-updated", vehicle);
    this.io.to("admin-room").emit("vehicle-updated", vehicle);
  }

  public emitVehicleDeleted(vehicleId: string) {
    this.io.to(`vehicle-${vehicleId}`).emit("vehicle-deleted", vehicleId);
    this.io.to("admin-room").emit("vehicle-deleted", vehicleId);
  }

  public emitVehicleCreated(vehicle: any) {
    this.io.to("admin-room").emit("vehicle-created", vehicle);
  }

  public getIO() {
    return this.io;
  }
}
