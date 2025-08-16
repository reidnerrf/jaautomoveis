import express from 'express';
import Analytics from '../models/Analytics.js'; // Assuming Analytics model is in '../models/Analytics.js'

export const getMonthlyViews = async (req: express.Request, res: express.Response) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyViews = await Analytics.aggregate([
      {
        $match: {
          event: 'page_view',
          timestamp: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' }
          },
          Visualizações: { $sum: 1 }
        }
      },
      {
        $project: {
          month: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
                { case: { $eq: ['$_id.month', 2] }, then: 'Feb' },
                { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
                { case: { $eq: ['$_id.month', 4] }, then: 'Apr' },
                { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                { case: { $eq: ['$_id.month', 6] }, then: 'Jun' },
                { case: { $eq: ['$_id.month', 7] }, then: 'Jul' },
                { case: { $eq: ['$_id.month', 8] }, then: 'Aug' },
                { case: { $eq: ['$_id.month', 9] }, then: 'Sep' },
                { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
                { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
                { case: { $eq: ['$_id.month', 12] }, then: 'Dec' }
              ],
              default: 'Unknown'
            }
          },
          Visualizações: 1
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

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Total page views
    const totalViews = await Analytics.countDocuments({ event: 'page_view' });

    // Today's views
    const todayViews = await Analytics.countDocuments({
      event: 'page_view',
      timestamp: { $gte: today }
    });

    // WhatsApp clicks
    const whatsappClicks = await Analytics.countDocuments({
      action: 'whatsapp_click'
    });

    // Instagram clicks
    const instagramClicks = await Analytics.countDocuments({
      action: 'instagram_click'
    });

    // Device breakdown
    const deviceStats = await Analytics.aggregate([
      { $match: { event: 'page_view' } },
      {
        $group: {
          _id: '$device.type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Location breakdown
    const locationStats = await Analytics.aggregate([
      { $match: { event: 'page_view' } },
      {
        $group: {
          _id: '$location.city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Browser breakdown
    const browserStats = await Analytics.aggregate([
      { $match: { event: 'page_view' } },
      {
        $group: {
          _id: '$device.browser',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalViews,
      todayViews,
      whatsappClicks,
      instagramClicks,
      deviceStats,
      locationStats,
      browserStats
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

    const realtimeData = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: last24Hours }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$timestamp' },
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          pageViews: {
            $sum: { $cond: [{ $eq: ['$event', 'page_view'] }, 1, 0] }
          },
          actions: {
            $sum: { $cond: [{ $eq: ['$event', 'user_action'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.date': 1, '_id.hour': 1 } }
    ]);

    res.json(realtimeData);
  } catch (error) {
    console.error('Realtime stats error:', error);
    res.status(500).json({ message: 'Erro ao buscar dados em tempo real' });
  }
};