import express from 'express';
import Analytics from '../models/Analytics';
import ViewLog from '../models/ViewLog';
//import { ObjectId } from 'mongodb';

export const getMonthlyViews = async (req: express.Request, res: express.Response) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyViews = await ViewLog.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          views: { $sum: 1 }
        }
      },
      {
        $project: {
          month: { $let: { vars: { monthNum: { $subtract: ['$_id.month', 1] } }, in: { $arrayElemAt: ['$$months', '$monthNum'] } } },
          views: 1
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json(monthlyViews);
  } catch (error) {
    console.error('Error fetching monthly views:', error);
    res.status(500).json({ message: 'Erro ao buscar visualizações mensais' });
  }
};

export const getDashboardStats = async (req: express.Request, res: express.Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

    // Total vehicle views (acessos ao veículo)
    const totalViews = await ViewLog.countDocuments({});

    // Today's vehicle views
    const todayViews = await ViewLog.countDocuments({ createdAt: { $gte: today } });

    // WhatsApp clicks
    const whatsappClicks = await Analytics.countDocuments({ action: 'whatsapp_click' });

    // Instagram clicks
    const instagramClicks = await Analytics.countDocuments({ action: 'instagram_click' });

    // Likes breakdown
    const likedVehiclesAgg = await Analytics.aggregate([
      { $match: { action: 'like_vehicle' } },
      { $group: { _id: '$label', count: { $sum: 1 } } },
      { $group: { _id: null, vehicles: { $push: { label: '$_id', count: '$count' } } } },
      { $project: { _id: 0, vehicles: 1 } }
    ]);

    const totalLikesAgg = await Analytics.countDocuments({ action: 'like_vehicle' });

    res.json({
      totalViews,
      todayViews,
      whatsappClicks,
      instagramClicks,
      deviceStats: [],
      locationStats: [],
      browserStats: [],
      likedVehicles: likedVehiclesAgg[0]?.vehicles || [],
      totalLikes: totalLikesAgg || 0
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
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
            hour: { $hour: '$createdAt' },
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          pageViews: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1, '_id.hour': 1 } }
    ]);

    res.json(pageViewsByHour);
  } catch (error) {
    console.error('Realtime stats error:', error);
    res.status(500).json({ message: 'Erro ao buscar dados em tempo real' });
  }
};

