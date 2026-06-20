import { createElement } from "react";
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
  icon,
  data,
  dataKey,
  color,
}) {
  return (
    <div className="page-panel p-6 transition flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10">
          {icon && createElement(icon, { className: "text-cyan-300 text-lg" })}
        </div>
        <span className="text-lg font-medium text-white">{title}</span>
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.14)"
            />
            <XAxis dataKey="mes" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                background: "rgba(12, 20, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.16)",
                borderRadius: "12px",
                color: "#e2e8f0",
              }}
            />
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
