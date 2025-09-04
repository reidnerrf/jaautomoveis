import express from "express";
import Analytics from "../models/Analytics";
import ViewLog from "../models/ViewLog";
import Vehicle from "../models/Vehicle";
import Seller from "../models/Seller";
//import { ObjectId } from 'mongodb';

export const getMonthlyViews = async (req: express.Request, res: express.Response) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const monthlyViews = await ViewLog.aggregate([
      { $match: { createdAt: { $gte: threeMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          views: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  [
                    "Jan",
                    "Fev",
                    "Mar",
                    "Abr",
                    "Mai",
                    "Jun",
                    "Jul",
                    "Ago",
                    "Set",
                    "Out",
                    "Nov",
                    "Dez",
                  ],
                  { $subtract: ["$_id.month", 1] },
                ],
              },
              " ",
              { $toString: "$_id.year" },
            ],
          },
          views: 1,
        },
      },
    ]);

    res.json(monthlyViews);
  } catch (error) {
    console.error("Error fetching monthly views:", error);
    res.status(500).json({ message: "Erro ao buscar visualizações mensais" });
  }
};

export const getDashboardStats = async (req: express.Request, res: express.Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

    // Total vehicle views (acessos ao veículo)
    const totalViews = await ViewLog.countDocuments({});

    // Today's vehicle views
    const todayViews = await ViewLog.countDocuments({
      createdAt: { $gte: today },
    });

    // WhatsApp clicks
    const whatsappClicks = await Analytics.countDocuments({
      action: "whatsapp_click",
    });

    // Instagram clicks
    const instagramClicks = await Analytics.countDocuments({
      action: "instagram_click",
    });

    // Total likes
    const totalLikesAgg = await Analytics.countDocuments({ action: "like_vehicle" });

    // Count distinct vehicles that received at least one like
    const likeDocs = await Analytics.find({ action: "like_vehicle" }).select("label").lean();
    const likedVehicleIds = new Set<string>();
    likeDocs.forEach((doc: any) => {
      try {
        const parsed = doc?.label ? JSON.parse(doc.label) : null;
        const vehicleId = parsed?.vehicleId || doc?.label;
        if (vehicleId) likedVehicleIds.add(String(vehicleId));
      } catch {
        if (doc?.label) likedVehicleIds.add(String(doc.label));
      }
    });

    res.json({
      totalViews,
      todayViews,
      whatsappClicks,
      instagramClicks,
      deviceStats: [],
      locationStats: [],
      browserStats: [],
      likedVehicles: likedVehicleIds.size,
      totalLikes: totalLikesAgg || 0,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Erro ao buscar estatísticas" });
  }
};

// Lista de likes por veículo para ordenação/filtro no frontend
export const getLikesByVehicle = async (req: express.Request, res: express.Response) => {
  try {
    const docs = await Analytics.find({ action: "like_vehicle" }).select("label").lean();
    const counts = new Map<string, { name: string; count: number }>();
    for (const d of docs) {
      try {
        const parsed = d?.label ? JSON.parse(d.label) : {};
        const vehicleId = String(parsed?.vehicleId || d?.label || "");
        if (!vehicleId) continue;
        const name = String(parsed?.name || "");
        const entry = counts.get(vehicleId) || { name, count: 0 };
        entry.count += 1;
        if (name) entry.name = name;
        counts.set(vehicleId, entry);
      } catch {
        const vehicleId = String(d?.label || "");
        if (!vehicleId) continue;
        const entry = counts.get(vehicleId) || { name: "", count: 0 };
        entry.count += 1;
        counts.set(vehicleId, entry);
      }
    }

    const result = Array.from(counts.entries())
      .map(([vehicleId, { name, count }]) => ({ vehicleId, name, count }))
      .sort((a, b) => b.count - a.count);

    res.json(result);
  } catch (error) {
    console.error("Likes by vehicle error:", error);
    res.status(500).json({ message: "Erro ao buscar likes por veículo" });
  }
};

export const getRealtimeStats = async (req: express.Request, res: express.Response) => {
  try {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const pageViewsByHour = await ViewLog.aggregate([
      { $match: { createdAt: { $gte: last24Hours } } },
      {
        $group: {
          _id: {
            hour: { $hour: "$createdAt" },
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          pageViews: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1, "_id.hour": 1 } },
    ]);

    res.json(pageViewsByHour);
  } catch (error) {
    console.error("Realtime stats error:", error);
    res.status(500).json({ message: "Erro ao buscar dados em tempo real" });
  }
};

export const getDailyViewsLast30Days = async (req: express.Request, res: express.Response) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const daily = await ViewLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          views: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          views: 1,
        },
      },
    ]);

    res.json(daily);
  } catch (error) {
    console.error("Error fetching daily views:", error);
    res.status(500).json({ message: "Erro ao buscar visualizações diárias" });
  }
};

// Lucro líquido por mês (últimos 6 meses) considerando veículos vendidos
export const getNetSalesLastSixMonths = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 5); // inclusive month
    since.setDate(1);

    const agg = await Vehicle.aggregate([
      { $match: { status: "vendido", soldAt: { $gte: since } } },
      {
        $project: {
          year: { $year: "$soldAt" },
          month: { $month: "$soldAt" },
          net: { $subtract: ["$soldPrice", { $ifNull: ["$cost", 0] }] },
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          net: { $sum: "$net" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const data = agg.map((d: any) => ({
      month: `${String(d._id.month).padStart(2, "0")}/${d._id.year}`,
      net: d.net,
    }));
    res.json(data);
  } catch (error) {
    console.error("Error fetching net sales:", error);
    res.status(500).json({ message: "Erro ao buscar vendas líquidas" });
  }
};

// Top vendedores por valor vendido (últimos 6 meses) e vendedor do mês
export const getTopSellersLastSixMonths = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);

    const sales = await Vehicle.aggregate([
      { $match: { status: "vendido", soldAt: { $gte: since } } },
      {
        $group: {
          _id: "$sellerId",
          totalSoldValue: { $sum: "$soldPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalSoldValue: -1 } },
    ]);

    // Join seller names
    const sellerIds = sales.map((s: any) => s._id).filter(Boolean);
    const sellers = await Seller.find({ _id: { $in: sellerIds } })
      .select("name")
      .lean();
    const idToName = new Map(sellers.map((s: any) => [String(s._id), s.name]));
    const ranking = sales.map((s: any) => ({
      sellerId: s._id,
      sellerName: idToName.get(String(s._id)) || "Desconhecido",
      totalSoldValue: s.totalSoldValue,
      totalSoldCount: s.count,
    }));

    // Vendedor do mês (maior quantidade no mês atual)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthRanking = await Vehicle.aggregate([
      { $match: { status: "vendido", soldAt: { $gte: startOfMonth } } },
      { $group: { _id: "$sellerId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    let sellerOfTheMonth: any = null;
    if (monthRanking.length > 0) {
      const top = monthRanking[0];
      const sellerDoc = await Seller.findById(top._id).select("name").lean();
      sellerOfTheMonth = {
        sellerId: top._id,
        sellerName: sellerDoc?.name || "Desconhecido",
        soldCount: top.count,
      };
    }

    res.json({ ranking, sellerOfTheMonth });
  } catch (error) {
    console.error("Error fetching top sellers:", error);
    res.status(500).json({ message: "Erro ao buscar vendedores" });
  }
};

export const purgeOldAnalytics = async (req: express.Request, res: express.Response) => {
  try {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 3);
    const result = await Analytics.deleteMany({ timestamp: { $lt: cutoff } });
    res.json({ deleted: result?.deletedCount || 0, before: cutoff.toISOString() });
  } catch (error) {
    console.error("Error purging analytics:", error);
    res.status(500).json({ message: "Erro ao limpar analytics antigos" });
  }
};
