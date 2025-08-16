import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Vehicle from './backend/models/Vehicle';
import User from './backend/models/User';
import { Vehicle as VehicleType } from './types';

dotenv.config();

const SEED_VEHICLES: Omit<VehicleType, 'id'>[] = [
  {
    name: 'Fiat Pulse 1.3',
    price: 95000,
    make: 'Fiat',
    model: 'Pulse',
    year: 2023,
    km: 15000,
    color: 'Vermelho',
    gearbox: 'Automático',
    fuel: 'Flex',
    doors: 4,
    additionalInfo: 'Veículo impecável, único dono, revisões em dia.',
    optionals: ['Ar Condicionado', 'Direção Hidráulica', 'Vidros Elétricos', 'Sistema Multimídia'],
    images: ['https://picsum.photos/seed/car1/800/600', 'https://picsum.photos/seed/car1-2/800/600', 'https://picsum.photos/seed/car1-3/800/600'],
    views: 150,
  },
  {
    name: 'Hyundai HB20',
    price: 78000,
    make: 'Hyundai',
    model: 'HB20',
    year: 2022,
    km: 30000,
    color: 'Branco',
    gearbox: 'Manual',
    fuel: 'Flex',
    doors: 4,
    additionalInfo: 'Ótimo estado, muito econômico.',
    optionals: ['Ar Condicionado', 'Direção Hidráulica', 'Alarme'],
    images: ['https://picsum.photos/seed/car2/800/600', 'https://picsum.photos/seed/car2-2/800/600'],
    views: 250,
  },
  {
    name: 'Chevrolet Onix',
    price: 82000,
    make: 'Chevrolet',
    model: 'Onix',
    year: 2023,
    km: 22000,
    color: 'Preto',
    gearbox: 'Automático',
    fuel: 'Flex',
    doors: 4,
    additionalInfo: 'Modelo completo com motor turbo.',
    optionals: ['Ar Condicionado', 'Direção Hidráulica', 'Vidros Elétricos', 'Rodas de Liga Leve', 'OnStar'],
    images: ['https://picsum.photos/seed/car3/800/600', 'https://picsum.photos/seed/car3-2/800/600', 'https://picsum.photos/seed/car3-3/800/600'],
    views: 220,
  },
   {
    name: 'Toyota Corolla',
    price: 145000,
    make: 'Toyota',
    model: 'Corolla',
    year: 2022,
    km: 45000,
    color: 'Prata',
    gearbox: 'Automático',
    fuel: 'Híbrido',
    doors: 4,
    additionalInfo: 'Versão híbrida topo de linha, extremamente bem cuidado.',
    optionals: ['Bancos de Couro', 'Teto Solar', 'Piloto Automático Adaptativo', 'Assistente de Faixa'],
    images: ['https://picsum.photos/seed/car4/800/600', 'https://picsum.photos/seed/car4-2/800/600', 'https://picsum.photos/seed/car4-3/800/600'],
    views: 350,
  },
   {
    name: 'Jeep Renegade',
    price: 115000,
    make: 'Jeep',
    model: 'Renegade',
    year: 2021,
    km: 50000,
    color: 'Cinza',
    gearbox: 'Automático',
    fuel: 'Diesel',
    doors: 4,
    additionalInfo: 'Versão 4x4 Diesel, pronto para qualquer aventura.',
    optionals: ['Tração 4x4', 'Controle de Descida', 'Rack de Teto', 'Sistema Multimídia'],
    images: ['https://picsum.photos/seed/car5/800/600', 'https://picsum.photos/seed/car5-2/800/600'],
    views: 400,
  },
   {
    name: 'Volkswagen Nivus',
    price: 110000,
    make: 'Volkswagen',
    model: 'Nivus',
    year: 2023,
    km: 10000,
    color: 'Azul',
    gearbox: 'Automático',
    fuel: 'Flex',
    doors: 4,
    additionalInfo: 'Como novo, baixa quilometragem. Versão Highline.',
    optionals: ['Painel Digital', 'Piloto Automático Adaptativo', 'Faróis Full LED', 'VW Play'],
    images: ['https://picsum.photos/seed/car6/800/600', 'https://picsum.photos/seed/car6-2/800/600', 'https://picsum.photos/seed/car6-3/800/600'],
    views: 180,
  }
];

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        const conn = await mongoose.connect(uri as string);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        (process as any).exit(1);
    }
};

const importData = async () => {
    try {
        // Drop collections to ensure a clean state and remove old indexes
        const collections = await mongoose.connection.db!.collections();
        for (const collection of collections) {
            if (collection.collectionName === 'vehicles' || collection.collectionName === 'users') {
                 await collection.drop();
                 console.log(`Dropped ${collection.collectionName} collection.`);
            }
        }
        
        await Vehicle.insertMany(SEED_VEHICLES);
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('adminja2025', salt);

        await User.create({ username: 'admin', password: hashedPassword });

        console.log('Data Imported! Collections recreated and seeded successfully.');
        (process as any).exit();
    } catch (error) {
        console.error(`${error}`);
        (process as any).exit(1);
    }
};

const destroyData = async () => {
    try {
        const collections = await mongoose.connection.db!.collections();
        for (const collection of collections) {
            if (collection.collectionName === 'vehicles' || collection.collectionName === 'users') {
                 await collection.drop();
                 console.log(`Dropped ${collection.collectionName} collection.`);
            }
        }

        console.log('Data Destroyed! All relevant collections dropped.');
        (process as any).exit();
    } catch (error) {
        console.error(`${error}`);
        (process as any).exit(1);
    }
};

connectDB().then(() => {
    if ((process as any).argv[2] === '-d') {
        destroyData();
    } else {
        importData();
    }
});