import mongoose from "mongoose";
import type { Vehicle as IVehicle } from "../../types";

// Interface for the Mongoose document (with proper types for MongoDB)
interface IVehicleDocument {
  name: string;
  price: number;
  make: string;
  model: string;
  year: number;
  km: number;
  color: string;
  gearbox: "Manual" | "Automático";
  fuel: "Gasolina" | "Etanol" | "Flex" | "Diesel" | "Elétrico" | "Híbrido";
  doors: number;
  additionalInfo?: string;
  optionals?: string[];
  images?: string[];
  views?: number;
  status?: "disponivel" | "vendido";
  cost?: number;
  soldAt?: Date;
  soldPrice?: number;
  sellerId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const vehicleSchema = new mongoose.Schema<IVehicleDocument>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    km: { type: Number, required: true },
    color: { type: String, required: true },
    gearbox: { type: String, enum: ["Manual", "Automático"], required: true },
    fuel: {
      type: String,
      enum: ["Gasolina", "Etanol", "Flex", "Diesel", "Elétrico", "Híbrido"],
      required: true,
    },
    doors: { type: Number, required: true },
    additionalInfo: { type: String, default: "" },
    optionals: [{ type: String }],
    images: [{ type: String }],
    views: { type: Number, default: 0 },
    status: { type: String, enum: ["disponivel", "vendido"], default: "disponivel", index: true },
    cost: { type: Number, default: 0 },
    soldAt: { type: Date, required: false },
    soldPrice: { type: Number, required: false },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: false },
  },
  {
    id: false, // Disable the default virtual id
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Create indexes for better query performance
vehicleSchema.index({ make: 1, model: 1 });
vehicleSchema.index({ year: 1 });
vehicleSchema.index({ price: 1 });
vehicleSchema.index({ fuel: 1 });
vehicleSchema.index({ gearbox: 1 });
vehicleSchema.index({ views: -1 });
vehicleSchema.index({ createdAt: -1 });
vehicleSchema.index({ make: 1, model: 1, year: 1, price: 1 }); // Compound index for common filters

const Vehicle = mongoose.model<IVehicleDocument>("Vehicle", vehicleSchema);

export default Vehicle;
