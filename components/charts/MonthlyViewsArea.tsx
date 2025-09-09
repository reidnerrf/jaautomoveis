import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface Props {
  data: Array<{ [key: string]: number | string }>;
  dataKey: string;
  xKey?: string;
  color?: string; // hex
  gradientId?: string;
}

const MonthlyViewsArea: React.FC<Props> = ({ data, dataKey, xKey = "month", color = "#3C50E0", gradientId = "areaGradient" }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey={xKey} tick={{ fill: "#6B7280" }} />
        <YAxis tick={{ fill: "#6B7280" }} />
        <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: 8, color: "white" }} />
        <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={1} fill={`url(#${gradientId})`} strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MonthlyViewsArea;


