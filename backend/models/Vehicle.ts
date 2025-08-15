
import mongoose from 'mongoose';
import { Vehicle as IVehicle } from '../../types';

const vehicleSchema = new mongoose.Schema<Omit<IVehicle, 'id'>>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  km: { type: Number, required: true },
  color: { type: String, required: true },
  gearbox: { type: String, enum: ['Manual', 'Automático'], required: true },
  fuel: { type: String, enum: ['Gasolina', 'Etanol', 'Flex', 'Diesel', 'Elétrico', 'Híbrido'], required: true },
  doors: { type: Number, required: true },
  additionalInfo: { type: String, default: '' },
  optionals: [{ type: String }],
  images: [{ type: String }],
  views: { type: Number, default: 0 },
}, { 
  id: false, // Disable the default virtual id
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Vehicle = mongoose.model<Omit<IVehicle, 'id'>>('Vehicle', vehicleSchema);

export default Vehicle;