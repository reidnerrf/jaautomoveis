import mongoose, { Document, Types } from "mongoose";

export interface ISeller extends Document {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String },
    phone: { type: String },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

sellerSchema.index({ name: 1 });

const Seller = mongoose.model<ISeller>("Seller", sellerSchema);

export default Seller;

