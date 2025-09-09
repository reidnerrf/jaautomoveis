import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";

interface Props {
  data: Array<{ name: string; value: number }>;
  formatDuration: (ms: number) => string;
}

const ResponseTimeChart: React.FC<Props> = ({ data, formatDuration }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => formatDuration(Number(value))} />
        <Bar dataKey="value" fill="#3B82F6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ResponseTimeChart;


