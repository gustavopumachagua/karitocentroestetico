import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { FaClipboardList } from "react-icons/fa";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formatValue = (val) => val.toLocaleString("es-ES");

    return (
      <div
        style={{
          background: "rgba(12, 20, 42, 0.95)",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          backdropFilter: "blur(12px)",
          minWidth: "160px",
        }}
      >
        <p className="font-semibold text-indigo-300 mb-3 text-sm">
          {label.toUpperCase()}
        </p>

        <div className="space-y-2">
          {payload.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: `0 0 6px ${item.color}40`,
                  }}
                ></span>
                <span className="text-slate-300">{item.name}</span>
              </div>
              <span className="text-white font-semibold">
                {formatValue(item.value)}{" "}
                <span className="text-slate-500">citas</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function GraficoCitasEvolucion({ data, anio }) {
  return (
    <div className="glass-card p-4 sm:p-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center justify-center sm:justify-start gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "rgba(129, 140, 248, 0.10)",
              border: "1px solid rgba(129, 140, 248, 0.15)",
            }}
          >
            <FaClipboardList className="text-indigo-400 text-lg" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Evolución de citas atendidas
          </h3>
        </div>
        <p className="text-sm text-slate-400">
          Comparativa{" "}
          <span className="text-indigo-400 font-medium">{anio - 1}</span> vs{" "}
          <span className="text-emerald-400 font-medium">{anio}</span>
        </p>
      </div>

      <div className="w-full h-[260px] sm:h-[300px] md:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="lineColorGreenDoc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="lineColorBlueDoc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.06)"
              opacity={0.5}
            />

            <XAxis
              dataKey="mes"
              stroke="#64748b"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickMargin={5}
              width={40}
              axisLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey={anio}
              name={`Año ${anio}`}
              stroke="url(#lineColorGreenDoc)"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#fff", strokeWidth: 1, fill: "rgba(12, 20, 42, 0.9)" }}
              activeDot={{ r: 6, fill: "#34d399" }}
              animationDuration={1200}
              animationEasing="ease-in-out"
            />

            <Line
              type="monotone"
              dataKey={anio - 1}
              name={`Año ${anio - 1}`}
              stroke="url(#lineColorBlueDoc)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: "rgba(12, 20, 42, 0.9)" }}
              activeDot={{ r: 5, fill: "#60a5fa" }}
              animationDuration={1200}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
