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
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-5 sm:p-6 shadow-xl hover:shadow-emerald-900/20 transition-all duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3 border-b border-gray-700 pb-3">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <FaChartLine className="text-emerald-400 text-xl sm:text-2xl drop-shadow" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-100">
            Ingresos por Servicios Mensuales
          </h3>
        </div>
        <p className="text-gray-400 text-sm sm:text-base italic">
          Comparativa {anio - 1} vs {anio}
        </p>
      </div>

      <div className="w-full h-[260px] sm:h-[320px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 15, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2F3542"
              opacity={0.4}
            />
            <XAxis
              dataKey="mes"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              interval={0}
              textAnchor="middle"
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `S/${v.toLocaleString()}`}
            />

            <Tooltip
              cursor={{
                strokeDasharray: "3 3",
                stroke: "#10B981",
                opacity: 0.3,
              }}
              contentStyle={{
                backgroundColor: "#1E293B",
                border: "1px solid #374151",
                borderRadius: "10px",
                color: "#F3F4F6",
                fontSize: "0.85rem",
                padding: "10px 14px",
              }}
              formatter={(value) => [`S/${value.toLocaleString()}`, "Monto"]}
              labelStyle={{ color: "#A5B4FC", fontWeight: "bold" }}
            />

            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{
                fontSize: "13px",
                color: "#E5E7EB",
                paddingTop: "6px",
              }}
              iconType="circle"
            />

            <defs>
              <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <Line
              type="monotone"
              dataKey={anio - 1}
              stroke="url(#colorPrev)"
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2, fill: "#1E293B" }}
              activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
              name={`Año ${anio - 1}`}
              animationDuration={1000}
            />

            <Line
              type="monotone"
              dataKey={anio}
              stroke="url(#colorCurrent)"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2, fill: "#1E293B" }}
              activeDot={{ r: 7, stroke: "#10B981", strokeWidth: 2 }}
              name={`Año ${anio}`}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
