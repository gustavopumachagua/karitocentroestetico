import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FaChartLine } from "react-icons/fa";

export default function GraficoIngresosComparativos({ data, anio }) {
  return (
    <div className="glass-card p-4 sm:p-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "rgba(52, 211, 153, 0.10)",
              border: "1px solid rgba(52, 211, 153, 0.15)",
            }}
          >
            <FaChartLine className="text-emerald-400 text-lg" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Ingresos por servicios mensuales
          </h3>
        </div>
        <p className="text-slate-400 text-sm">
          Comparativa{" "}
          <span className="text-blue-400 font-medium">{anio - 1}</span> vs{" "}
          <span className="text-emerald-400 font-medium">{anio}</span>
        </p>
      </div>

      <div className="w-full h-[240px] sm:h-[300px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 15, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.06)"
              opacity={0.5}
            />
            <XAxis
              dataKey="mes"
              stroke="#64748b"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              interval={0}
              textAnchor="middle"
              axisLine={{ stroke: "rgba(148, 163, 184, 0.1)" }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickFormatter={(v) => `S/${v.toLocaleString()}`}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{
                strokeDasharray: "3 3",
                stroke: "rgba(52, 211, 153, 0.3)",
              }}
              contentStyle={{
                backgroundColor: "rgba(12, 20, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.15)",
                borderRadius: "12px",
                color: "#e2e8f0",
                fontSize: "0.85rem",
                padding: "10px 14px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              }}
              formatter={(value) => [`S/${value.toLocaleString()}`, "Monto"]}
              labelStyle={{ color: "#a5b4fc", fontWeight: "bold" }}
            />

            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{
                fontSize: "13px",
                color: "#94a3b8",
                paddingTop: "6px",
              }}
              iconType="circle"
            />

            <defs>
              <linearGradient id="colorPrevAdv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorCurrentAdv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <Line
              type="monotone"
              dataKey={anio - 1}
              stroke="url(#colorPrevAdv)"
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2, fill: "rgba(12, 20, 42, 0.9)" }}
              activeDot={{ r: 6, stroke: "#60a5fa", strokeWidth: 2 }}
              name={`Año ${anio - 1}`}
              animationDuration={1000}
            />

            <Line
              type="monotone"
              dataKey={anio}
              stroke="url(#colorCurrentAdv)"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2, fill: "rgba(12, 20, 42, 0.9)" }}
              activeDot={{ r: 7, stroke: "#34d399", strokeWidth: 2 }}
              name={`Año ${anio}`}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
