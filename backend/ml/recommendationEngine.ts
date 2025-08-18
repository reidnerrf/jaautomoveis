import Vehicle from '../models/Vehicle';
import ViewLog from '../models/ViewLog';

interface UserPreferences {
  userId: string;
  preferredMakes: string[];
  preferredPriceRange: { min: number; max: number };
  preferredYears: number[];
  preferredFuelTypes: string[];
  preferredGearbox: string[];
  viewHistory: string[];
  likes: string[];
  shares: string[];
}

interface VehicleFeatures {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  km: number;
  fuel: string;
  gearbox: string;
  color: string;
  doors: number;
  views: number;
  likes: number;
  shares: number;
}

class RecommendationEngine {
  private userPreferences: Map<string, UserPreferences> = new Map();
  private vehicleFeatures: Map<string, VehicleFeatures> = new Map();

  async initialize() {
    await this.loadUserPreferences();
    await this.loadVehicleFeatures();
  }

  private async loadUserPreferences() {
    try {
      // Carregar histórico de visualizações
      const viewLogs = await ViewLog.find({}).populate('vehicle');
      
      viewLogs.forEach(log => {
        const vehicleId = log.vehicle.toString();
        // Since ViewLog doesn't have userId, we'll use a default user or skip user-specific logic
        const userId = 'default';
        
        if (!this.userPreferences.has(userId)) {
          this.userPreferences.set(userId, {
            userId,
            preferredMakes: [],
            preferredPriceRange: { min: 0, max: 1000000 },
            preferredYears: [],
            preferredFuelTypes: [],
            preferredGearbox: [],
            viewHistory: [],
            likes: [],
            shares: []
          });
        }

        const userPref = this.userPreferences.get(userId)!;
        userPref.viewHistory.push(vehicleId);
      });

      console.log(`Loaded preferences for ${this.userPreferences.size} users`);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }

  private async loadVehicleFeatures() {
    try {
      const vehicles = await Vehicle.find({});
      
      vehicles.forEach(vehicle => {
        this.vehicleFeatures.set(vehicle.id, {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          price: vehicle.price,
          km: vehicle.km,
          fuel: vehicle.fuel,
          gearbox: vehicle.gearbox,
          color: vehicle.color,
          doors: vehicle.doors,
          views: vehicle.views || 0,
          likes: 0, // TODO: Implement likes count
          shares: 0  // TODO: Implement shares count
        });
      });

      console.log(`Loaded features for ${this.vehicleFeatures.size} vehicles`);
    } catch (error) {
      console.error('Error loading vehicle features:', error);
    }
  }

  // Algoritmo de recomendação baseado em conteúdo
  async getContentBasedRecommendations(userId: string, limit: number = 10): Promise<string[]> {
    const userPref = this.userPreferences.get(userId);
    if (!userPref) {
      return this.getPopularVehicles(limit);
    }

    const recommendations: Array<{ vehicleId: string; score: number }> = [];

    this.vehicleFeatures.forEach((vehicle, vehicleId) => {
      if (userPref.viewHistory.includes(vehicleId)) {
        return; // Skip already viewed vehicles
      }

      let score = 0;

      // Score baseado em marca preferida
      if (userPref.preferredMakes.includes(vehicle.make)) {
        score += 3;
      }

      // Score baseado em faixa de preço
      if (vehicle.price >= userPref.preferredPriceRange.min && 
          vehicle.price <= userPref.preferredPriceRange.max) {
        score += 2;
      }

      // Score baseado em ano
      if (userPref.preferredYears.includes(vehicle.year)) {
        score += 2;
      }

      // Score baseado em combustível
      if (userPref.preferredFuelTypes.includes(vehicle.fuel)) {
        score += 1;
      }

      // Score baseado em câmbio
      if (userPref.preferredGearbox.includes(vehicle.gearbox)) {
        score += 1;
      }

      // Score baseado em popularidade
      score += Math.min(vehicle.views / 100, 2);

      if (score > 0) {
        recommendations.push({ vehicleId, score });
      }
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.vehicleId);
  }

  // Algoritmo de recomendação colaborativa
  async getCollaborativeRecommendations(userId: string, limit: number = 10): Promise<string[]> {
    const userPref = this.userPreferences.get(userId);
    if (!userPref) {
      return this.getPopularVehicles(limit);
    }

    // Encontrar usuários similares
    const similarUsers = this.findSimilarUsers(userId);
    
    // Coletar veículos vistos por usuários similares
    const vehicleScores: Map<string, number> = new Map();
    
    similarUsers.forEach(similarUser => {
      const similarUserPref = this.userPreferences.get(similarUser.userId);
      if (similarUserPref) {
        similarUserPref.viewHistory.forEach(vehicleId => {
          if (!userPref.viewHistory.includes(vehicleId)) {
            const currentScore = vehicleScores.get(vehicleId) || 0;
            vehicleScores.set(vehicleId, currentScore + similarUser.similarity);
          }
        });
      }
    });

    return Array.from(vehicleScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([vehicleId]) => vehicleId);
  }

  // Encontrar usuários similares
  private findSimilarUsers(userId: string, limit: number = 5): Array<{ userId: string; similarity: number }> {
    const userPref = this.userPreferences.get(userId);
    if (!userPref) return [];

    const similarities: Array<{ userId: string; similarity: number }> = [];

    this.userPreferences.forEach((otherUserPref, otherUserId) => {
      if (otherUserId === userId) return;

      let similarity = 0;
      let commonItems = 0;

      // Calcular similaridade baseada em histórico de visualizações
      userPref.viewHistory.forEach(vehicleId => {
        if (otherUserPref.viewHistory.includes(vehicleId)) {
          similarity += 1;
          commonItems += 1;
        }
      });

      // Calcular similaridade baseada em preferências
      if (userPref.preferredMakes.some(make => otherUserPref.preferredMakes.includes(make))) {
        similarity += 0.5;
      }

      if (Math.abs(userPref.preferredPriceRange.min - otherUserPref.preferredPriceRange.min) < 10000) {
        similarity += 0.3;
      }

      // Normalizar similaridade
      if (commonItems > 0) {
        similarity = similarity / (userPref.viewHistory.length + otherUserPref.viewHistory.length - commonItems);
      }

      if (similarity > 0) {
        similarities.push({ userId: otherUserId, similarity });
      }
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Recomendações baseadas em popularidade
  async getPopularVehicles(limit: number = 10): Promise<string[]> {
    const vehicles = Array.from(this.vehicleFeatures.values());
    
    return vehicles
      .sort((a, b) => {
        // Score baseado em views, likes e shares
        const scoreA = a.views + (a.likes * 10) + (a.shares * 5);
        const scoreB = b.views + (b.likes * 10) + (b.shares * 5);
        return scoreB - scoreA;
      })
      .slice(0, limit)
      .map(v => v.id);
  }

  // Recomendações baseadas em contexto (localização, tempo, etc.)
  async getContextualRecommendations(userId: string, context: any, limit: number = 10): Promise<string[]> {
    const recommendations: Array<{ vehicleId: string; score: number }> = [];

    this.vehicleFeatures.forEach((vehicle, vehicleId) => {
      let score = 0;

      // Score baseado em contexto temporal
      if (context.timeOfDay) {
        // Veículos mais populares em diferentes horários
        const hour = new Date().getHours();
        if (hour >= 9 && hour <= 17) {
          // Horário comercial - veículos mais caros
          if (vehicle.price > 50000) score += 1;
        } else {
          // Horário não comercial - veículos mais baratos
          if (vehicle.price < 50000) score += 1;
        }
      }

      // Score baseado em contexto de localização
      if (context.location) {
        // TODO: Implementar lógica baseada em localização
        score += 0.5;
      }

      // Score baseado em contexto de dispositivo
      if (context.device) {
        if (context.device === 'mobile' && vehicle.price < 30000) {
          score += 1; // Veículos mais baratos em mobile
        }
      }

      if (score > 0) {
        recommendations.push({ vehicleId, score });
      }
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.vehicleId);
  }

  // Atualizar preferências do usuário
  async updateUserPreferences(userId: string, action: 'view' | 'like' | 'share', vehicleId: string) {
    if (!this.userPreferences.has(userId)) {
      this.userPreferences.set(userId, {
        userId,
        preferredMakes: [],
        preferredPriceRange: { min: 0, max: 1000000 },
        preferredYears: [],
        preferredFuelTypes: [],
        preferredGearbox: [],
        viewHistory: [],
        likes: [],
        shares: []
      });
    }

    const userPref = this.userPreferences.get(userId)!;
    const vehicle = this.vehicleFeatures.get(vehicleId);

    if (!vehicle) return;

    switch (action) {
      case 'view':
        if (!userPref.viewHistory.includes(vehicleId)) {
          userPref.viewHistory.push(vehicleId);
        }
        break;
      case 'like':
        if (!userPref.likes.includes(vehicleId)) {
          userPref.likes.push(vehicleId);
        }
        break;
      case 'share':
        if (!userPref.shares.includes(vehicleId)) {
          userPref.shares.push(vehicleId);
        }
        break;
    }

    // Atualizar preferências baseadas em histórico
    this.updateUserPreferencesFromHistory(userId);
  }

  // Atualizar preferências baseadas no histórico
  private updateUserPreferencesFromHistory(userId: string) {
    const userPref = this.userPreferences.get(userId);
    if (!userPref) return;

    const makes = new Map<string, number>();
    const prices: number[] = [];
    const years: number[] = [];
    const fuels = new Map<string, number>();
    const gearboxes = new Map<string, number>();

    userPref.viewHistory.forEach(vehicleId => {
      const vehicle = this.vehicleFeatures.get(vehicleId);
      if (!vehicle) return;

      // Contar marcas
      makes.set(vehicle.make, (makes.get(vehicle.make) || 0) + 1);
      
      // Coletar preços
      prices.push(vehicle.price);
      
      // Coletar anos
      years.push(vehicle.year);
      
      // Contar combustíveis
      fuels.set(vehicle.fuel, (fuels.get(vehicle.fuel) || 0) + 1);
      
      // Contar câmbios
      gearboxes.set(vehicle.gearbox, (gearboxes.get(vehicle.gearbox) || 0) + 1);
    });

    // Atualizar preferências
    userPref.preferredMakes = Array.from(makes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([make]) => make);

    if (prices.length > 0) {
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      userPref.preferredPriceRange = {
        min: Math.max(0, avgPrice * 0.7),
        max: avgPrice * 1.3
      };
    }

    userPref.preferredYears = [...new Set(years)].sort((a, b) => b - a).slice(0, 5);

    userPref.preferredFuelTypes = Array.from(fuels.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([fuel]) => fuel);

    userPref.preferredGearbox = Array.from(gearboxes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([gearbox]) => gearbox);
  }

  // Obter recomendações híbridas
  async getHybridRecommendations(userId: string, limit: number = 10): Promise<string[]> {
    const contentBased = await this.getContentBasedRecommendations(userId, limit);
    const collaborative = await this.getCollaborativeRecommendations(userId, limit);
    const popular = await this.getPopularVehicles(limit);

    // Combinar recomendações com pesos
    const scores = new Map<string, number>();

    contentBased.forEach((vehicleId, index) => {
      scores.set(vehicleId, (scores.get(vehicleId) || 0) + (limit - index) * 3);
    });

    collaborative.forEach((vehicleId, index) => {
      scores.set(vehicleId, (scores.get(vehicleId) || 0) + (limit - index) * 2);
    });

    popular.forEach((vehicleId, index) => {
      scores.set(vehicleId, (scores.get(vehicleId) || 0) + (limit - index) * 1);
    });

    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([vehicleId]) => vehicleId);
  }
}

export const recommendationEngine = new RecommendationEngine();
export default recommendationEngine;