import Vehicle from "../models/Vehicle";
import Analytics from "../models/Analytics";

export const resolvers = {
	Query: {
		vehicles: async (_: any, args: any) => {
			const { filter = {}, pagination = {} } = args || {};
			const { first = 20, after } = pagination;
			const query: any = {};
			if (filter.make) query.make = filter.make;
			if (filter.model) query.model = filter.model;
			if (filter.year) query.year = filter.year;
			if (filter.fuel) query.fuel = filter.fuel;
			if (filter.gearbox) query.gearbox = filter.gearbox;
			if (filter.minPrice || filter.maxPrice) {
				query.price = {};
				if (filter.minPrice) query.price.$gte = filter.minPrice;
				if (filter.maxPrice) query.price.$lte = filter.maxPrice;
			}
			if (filter.search) {
				query.$or = [
					{ name: { $regex: filter.search, $options: "i" } },
					{ make: { $regex: filter.search, $options: "i" } },
					{ model: { $regex: filter.search, $options: "i" } },
				];
			}

			const limit = Math.min(Math.max(first, 1), 100);
			const cursorQuery = after ? { _id: { $gt: after } } : {};
			const finalQuery = { ...query, ...cursorQuery };
			const items = await Vehicle.find(finalQuery).sort({ _id: 1 }).limit(limit + 1).lean();
			const hasNextPage = items.length > limit;
			const sliced = hasNextPage ? items.slice(0, -1) : items;
			const edges = sliced.map((v: any) => ({ node: v, cursor: String(v._id) }));
			const pageInfo = {
				hasNextPage,
				hasPreviousPage: false,
				startCursor: edges[0]?.cursor || null,
				endCursor: edges[edges.length - 1]?.cursor || null,
			};
			const totalCount = await Vehicle.countDocuments(query);
			return { edges, pageInfo, totalCount };
		},
		vehicle: async (_: any, { id }: any) => {
			return Vehicle.findById(id).lean();
		},
		analytics: async () => {
			const [totalVehicles, totalUsers, totalViews] = await Promise.all([
				Vehicle.countDocuments({}),
				Promise.resolve(0),
				Analytics.countDocuments({ action: "vehicle_view" }),
			]);
			const averagePriceAgg = await Vehicle.aggregate([
				{ $group: { _id: null, avg: { $avg: "$price" } } },
			]);
			const averagePrice = averagePriceAgg[0]?.avg || 0;
			const topVehicles = await Vehicle.find({}).sort({ views: -1 }).limit(5).lean();
			const recentActivityRaw = await Analytics.find({}).sort({ timestamp: -1 }).limit(10).lean();
			const recentActivity = recentActivityRaw.map((a: any) => ({
				id: String(a._id),
				type: a.event,
				description: `${a.category}:${a.action}`,
				timestamp: a.timestamp.toISOString(),
				userId: a.userId,
				vehicleId: undefined,
			}));
			return { totalVehicles, totalViews, totalUsers, averagePrice, topVehicles, recentActivity };
		},
	},
	Mutation: {},
	Subscription: {},
};

export default resolvers;