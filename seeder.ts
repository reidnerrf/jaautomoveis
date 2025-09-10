import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Vehicle from "./backend/models/Vehicle";
import User from "./backend/models/User";
import Seller from "./backend/models/Seller";
import { Vehicle as VehicleType } from "./types";

dotenv.config();

const SEED_SELLERS = [
  {
    name: "João Silva",
    email: "joao.silva@jaautomoveis.com",
    phone: "(11) 99999-1111",
    active: true,
  },
  {
    name: "Maria Santos",
    email: "maria.santos@jaautomoveis.com",
    phone: "(11) 99999-2222",
    active: true,
  },
  {
    name: "Pedro Oliveira",
    email: "pedro.oliveira@jaautomoveis.com",
    phone: "(11) 99999-3333",
    active: true,
  },
  {
    name: "Ana Costa",
    email: "ana.costa@jaautomoveis.com",
    phone: "(11) 99999-4444",
    active: false,
  },
];

const SEED_VEHICLES: Omit<VehicleType, "id">[] = [
  {
    name: "Fiat Pulse 1.3",
    price: 95000,
    cost: 85000,
    make: "Fiat",
    model: "Pulse",
    year: 2023,
    km: 15000,
    color: "Vermelho",
    gearbox: "Automático",
    fuel: "Flex",
    doors: 4,
    additionalInfo: "Veículo impecável, único dono, revisões em dia.",
    optionals: ["Ar Condicionado", "Direção Hidráulica", "Vidros Elétricos", "Sistema Multimídia"],
    images: [
      "https://picsum.photos/seed/car1/800/600",
      "https://picsum.photos/seed/car1-2/800/600",
      "https://picsum.photos/seed/car1-3/800/600",
    ],
    views: 150,
    status: "disponivel",
  },
  {
    name: "Hyundai HB20",
    price: 78000,
    cost: 70000,
    make: "Hyundai",
    model: "HB20",
    year: 2022,
    km: 30000,
    color: "Branco",
    gearbox: "Manual",
    fuel: "Flex",
    doors: 4,
    additionalInfo: "Ótimo estado, muito econômico.",
    optionals: ["Ar Condicionado", "Direção Hidráulica", "Alarme"],
    images: [
      "https://picsum.photos/seed/car2/800/600",
      "https://picsum.photos/seed/car2-2/800/600",
    ],
    views: 250,
    status: "disponivel",
  },
  {
    name: "Chevrolet Onix",
    price: 82000,
    cost: 75000,
    make: "Chevrolet",
    model: "Onix",
    year: 2023,
    km: 22000,
    color: "Preto",
    gearbox: "Automático",
    fuel: "Flex",
    doors: 4,
    additionalInfo: "Modelo completo com motor turbo.",
    optionals: [
      "Ar Condicionado",
      "Direção Hidráulica",
      "Vidros Elétricos",
      "Rodas de Liga Leve",
      "OnStar",
    ],
    images: [
      "https://picsum.photos/seed/car3/800/600",
      "https://picsum.photos/seed/car3-2/800/600",
      "https://picsum.photos/seed/car3-3/800/600",
    ],
    views: 220,
    status: "disponivel",
  },
  {
    name: "Toyota Corolla",
    price: 145000,
    cost: 130000,
    make: "Toyota",
    model: "Corolla",
    year: 2022,
    km: 45000,
    color: "Prata",
    gearbox: "Automático",
    fuel: "Híbrido",
    doors: 4,
    additionalInfo: "Versão híbrida topo de linha, extremamente bem cuidado.",
    optionals: [
      "Bancos de Couro",
      "Teto Solar",
      "Piloto Automático Adaptativo",
      "Assistente de Faixa",
    ],
    images: [
      "https://picsum.photos/seed/car4/800/600",
      "https://picsum.photos/seed/car4-2/800/600",
      "https://picsum.photos/seed/car4-3/800/600",
    ],
    views: 350,
    status: "disponivel",
  },
  {
    name: "Jeep Renegade",
    price: 115000,
    cost: 105000,
    make: "Jeep",
    model: "Renegade",
    year: 2021,
    km: 50000,
    color: "Cinza",
    gearbox: "Automático",
    fuel: "Diesel",
    doors: 4,
    additionalInfo: "Versão 4x4 Diesel, pronto para qualquer aventura.",
    optionals: ["Tração 4x4", "Controle de Descida", "Rack de Teto", "Sistema Multimídia"],
    images: [
      "https://picsum.photos/seed/car5/800/600",
      "https://picsum.photos/seed/car5-2/800/600",
    ],
    views: 400,
    status: "disponivel",
  },
  {
    name: "Volkswagen Nivus",
    price: 110000,
    cost: 100000,
    make: "Volkswagen",
    model: "Nivus",
    year: 2023,
    km: 10000,
    color: "Azul",
    gearbox: "Automático",
    fuel: "Flex",
    doors: 4,
    additionalInfo: "Como novo, baixa quilometragem. Versão Highline.",
    optionals: ["Painel Digital", "Piloto Automático Adaptativo", "Faróis Full LED", "VW Play"],
    images: [
      "https://picsum.photos/seed/car6/800/600",
      "https://picsum.photos/seed/car6-2/800/600",
      "https://picsum.photos/seed/car6-3/800/600",
    ],
    views: 180,
    status: "disponivel",
  },
  // Adicionando alguns veículos vendidos para demonstrar funcionalidade
  {
    name: "Honda Civic",
    price: 120000,
    cost: 110000,
    make: "Honda",
    model: "Civic",
    year: 2022,
    km: 35000,
    color: "Branco",
    gearbox: "Automático",
    fuel: "Flex",
    doors: 4,
    additionalInfo: "Veículo vendido - exemplo de histórico.",
    optionals: ["Bancos de Couro", "Sistema Multimídia", "Câmera de Ré"],
    images: [
      "https://picsum.photos/seed/car7/800/600",
      "https://picsum.photos/seed/car7-2/800/600",
    ],
    views: 300,
    status: "vendido",
    soldPrice: 115000,
    soldAt: "2024-01-15T00:00:00.000Z",
    sellerId: "seller1", // Será atualizado após criar os vendedores
  },
  {
    name: "Ford Ka",
    price: 45000,
    cost: 40000,
    make: "Ford",
    model: "Ka",
    year: 2020,
    km: 60000,
    color: "Prata",
    gearbox: "Manual",
    fuel: "Flex",
    doors: 4,
    additionalInfo: "Veículo vendido - exemplo de histórico.",
    optionals: ["Ar Condicionado", "Direção Hidráulica"],
    images: ["https://picsum.photos/seed/car8/800/600"],
    views: 180,
    status: "vendido",
    soldPrice: 42000,
    soldAt: "2024-02-10T00:00:00.000Z",
    sellerId: "seller2", // Será atualizado após criar os vendedores
  },
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
      if (
        collection.collectionName === "vehicles" ||
        collection.collectionName === "users" ||
        collection.collectionName === "sellers"
      ) {
        await collection.drop();
        console.log(`Dropped ${collection.collectionName} collection.`);
      }
    }

    // Criar vendedores primeiro
    const createdSellers = await Seller.insertMany(SEED_SELLERS);
    console.log(`Created ${createdSellers.length} sellers.`);

    // Atualizar os IDs dos vendedores nos veículos vendidos
    const vehiclesWithSellerIds = SEED_VEHICLES.map((vehicle) => {
      if (vehicle.status === "vendido" && vehicle.sellerId) {
        const sellerIndex = vehicle.sellerId === "seller1" ? 0 : 1;
        return {
          ...vehicle,
          sellerId: createdSellers[sellerIndex]._id.toString(),
        };
      }
      return vehicle;
    });

    await Vehicle.insertMany(vehiclesWithSellerIds);
    console.log(`Created ${vehiclesWithSellerIds.length} vehicles.`);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("adminja2025", salt);

    await User.create({
      username: "admin",
      email: "contato@jaautomoveisresende.com.br",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Data Imported! Collections recreated and seeded successfully.");
    console.log("Admin user created:");
    console.log("  Username: admin");
    console.log("  Password: adminja2025");
    console.log("  Email: contato@jaautomoveisresende.com.br");
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
      if (
        collection.collectionName === "vehicles" ||
        collection.collectionName === "users" ||
        collection.collectionName === "sellers"
      ) {
        await collection.drop();
        console.log(`Dropped ${collection.collectionName} collection.`);
      }
    }

    console.log("Data Destroyed! All relevant collections dropped.");
    (process as any).exit();
  } catch (error) {
    console.error(`${error}`);
    (process as any).exit(1);
  }
};

connectDB().then(() => {
  if ((process as any).argv[2] === "-d") {
    destroyData();
  } else {
    importData();
  }
});
