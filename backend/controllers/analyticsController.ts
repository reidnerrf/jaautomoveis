import express from 'express';
import ViewLog from '../models/ViewLog';

export const getMonthlyViews = async (req: express.Request, res: express.Response) => {
  try {
    const sixMonthsAgo = new Date();
    // Set to the first day of the month, 6 months ago
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const monthlyData = await ViewLog.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    // Create a map of the last 6 months to ensure all months are present, even with 0 views
    const resultsMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.getMonth(); // 0-11
        const year = d.getFullYear();
        const key = `${year}-${month + 1}`;
        resultsMap.set(key, 0);
    }
    
    // Populate the map with data from the database
    monthlyData.forEach(item => {
        const key = `${item._id.year}-${item._id.month}`;
        resultsMap.set(key, item.count);
    });

    // Convert map to the array format expected by the chart
    const chartData = Array.from(resultsMap.entries()).map(([key, count]) => {
        const [year, monthNum] = key.split('-').map(Number);
        return {
            month: monthNames[monthNum - 1],
            Visualizações: count,
        };
    });

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching monthly views:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};