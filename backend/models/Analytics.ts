
import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  sessionId: string;
  userId?: string;
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  page: string;
  userAgent: string;
  device: {
    type: string;
    browser: string;
    os: string;
    isMobile: boolean;
  };
  location: {
    country?: string;
    region?: string;
    city?: string;
    ip: string;
  };
  timestamp: Date;
}

const AnalyticsSchema: Schema = new Schema({
  sessionId: { type: String, required: true },
  userId: { type: String },
  event: { type: String, required: true },
  category: { type: String, required: true },
  action: { type: String, required: true },
  label: { type: String },
  value: { type: Number },
  page: { type: String, required: true },
  userAgent: { type: String, required: true },
  device: {
    type: { type: String, required: true },
    browser: { type: String, required: true },
    os: { type: String, required: true },
    isMobile: { type: Boolean, required: true }
  },
  location: {
    country: { type: String },
    region: { type: String },
    city: { type: String },
    ip: { type: String, required: true }
  },
  timestamp: { type: Date, default: Date.now }
});

// Indexes for performance
AnalyticsSchema.index({ timestamp: -1 });
AnalyticsSchema.index({ event: 1 });
AnalyticsSchema.index({ page: 1 });
AnalyticsSchema.index({ sessionId: 1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
