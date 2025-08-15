import mongoose, { Schema, Document } from 'mongoose';

export interface IViewLog extends Document {
  vehicle: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ViewLogSchema: Schema = new Schema({
  vehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false }, // We only care about when the view was created
});

// Create an index on createdAt for faster time-based queries
ViewLogSchema.index({ createdAt: 1 });

const ViewLog = mongoose.model<IViewLog>('ViewLog', ViewLogSchema);

export default ViewLog;
