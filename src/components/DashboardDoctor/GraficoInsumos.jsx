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
      <div
        style={{
          background: "rgba(12, 20, 42, 0.95)",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          borderRadius: "12px",
          padding: "10px 14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          backdropFilter: "blur(12px)",
          minWidth: "140px",
          color: "#e2e8f0",
        }}
      >
        <p className="text-sm font-semibold text-indigo-300 mb-1">
          {label}
        </p>
        <p className="text-slate-200 text-sm">
          <span className="font-bold text-white">{item.value}</span> usos
        </p>
      </div>
    );
  }
  return null;
};

export default function GraficoInsumos({ data }) {
  return (
    <div className="glass-card p-4 sm:p-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center justify-center sm:justify-start gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "rgba(139, 92, 246, 0.10)",
              border: "1px solid rgba(139, 92, 246, 0.15)",
            }}
          >
            <FaClipboardList className="text-violet-400 text-lg" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Insumos más usados
          </h3>
        </div>
      </div>
      <div className="w-full h-[260px] sm:h-[300px] md:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.06)"
              opacity={0.5}
            />

            <XAxis
              type="number"
              stroke="#64748b"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#64748b"
              tick={{ fontSize: 13, fill: "#cbd5e1", fontWeight: 500 }}
              width={130}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(139, 92, 246, 0.06)" }}
            />

            <defs>
              <linearGradient id="barGradientInsumos" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.7} />
              </linearGradient>
            </defs>

            <Bar
              dataKey="value"
              fill="url(#barGradientInsumos)"
              radius={[8, 8, 8, 8]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
