import mongoose, { Schema, Document } from "mongoose";

export interface IViewLog extends Document {
  vehicle: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ViewLogSchema: Schema = new Schema(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // We only care about when the view was created
  },
);

// Create indexes for better query performance
ViewLogSchema.index({ createdAt: 1 });
ViewLogSchema.index({ vehicle: 1, createdAt: 1 }); // Compound index for aggregation
ViewLogSchema.index({ vehicle: 1 }); // Single index for vehicle lookups

const ViewLog = mongoose.model<IViewLog>("ViewLog", ViewLogSchema);

export default ViewLog;
