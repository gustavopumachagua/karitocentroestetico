import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function LineChartCard({
  title,
  icon: Icon,
  data,
  dataKey,
  color,
}) {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-indigo-500 transition flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="text-indigo-400 text-xl" />
        <span className="text-lg font-medium">{title}</span>
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="mes" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
