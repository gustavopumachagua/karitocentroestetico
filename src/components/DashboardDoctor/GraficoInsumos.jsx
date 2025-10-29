import { FaClipboardList } from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-gray-900/90 backdrop-blur-md border border-indigo-500/30 p-3 rounded-xl shadow-lg min-w-[140px] animate-fade-in">
        <p className="text-sm font-semibold text-indigo-400 mb-1 tracking-wide">
          {label}
        </p>
        <p className="text-gray-200 text-sm">
          <span className="font-bold text-white">{item.value}</span> usos
        </p>
      </div>
    );
  }
  return null;
};

export default function GraficoInsumos({ data }) {
  return (
    <div className="bg-gradient-to-br from-gray-800/70 via-gray-900/70 to-gray-800/70 p-6 rounded-3xl border border-gray-700/60 shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <FaClipboardList className="text-indigo-400 text-2xl" />
          <h3 className="text-lg md:text-xl font-semibold text-white tracking-wide">
            Insumos más Usados
          </h3>
        </div>
      </div>
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1F2937"
              opacity={0.4}
            />

            <XAxis
              type="number"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#9CA3AF"
              tick={{ fontSize: 13, fill: "#D1D5DB", fontWeight: 500 }}
              width={130}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(99,102,241,0.05)" }}
            />

            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.8} />
              </linearGradient>
            </defs>

            <Bar
              dataKey="value"
              fill="url(#barGradient)"
              radius={[8, 8, 8, 8]}
              barSize={20}
              className="transition-all duration-200 hover:opacity-90 hover:translate-x-1"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
