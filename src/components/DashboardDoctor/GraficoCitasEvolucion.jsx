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
        className="animate-fade-in scale-95 animate-in fade-in-0 zoom-in-75
          bg-gray-900/80 backdrop-blur-md border border-indigo-500/30
          p-4 rounded-2xl shadow-2xl min-w-[160px] transition-all"
      >
        <p className="font-semibold text-indigo-300 mb-3 text-sm tracking-wide">
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
                  className="w-3 h-3 rounded-full ring-1 ring-white/30"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-gray-300">{item.name}</span>
              </div>
              <span className="text-white font-semibold">
                {formatValue(item.value)}{" "}
                <span className="text-gray-400">citas</span>
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
    <div className="bg-gradient-to-br from-gray-800/70 via-gray-900/70 to-gray-800/70 p-6 rounded-3xl border border-gray-700/60 shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <FaClipboardList className="text-indigo-400 text-2xl" />
          <h3 className="text-lg md:text-xl font-semibold text-white">
            Evolución de Citas Atendidas
          </h3>
        </div>
        <p className="text-sm text-gray-400">
          Comparativa{" "}
          <span className="text-indigo-400 font-medium">{anio - 1}</span> vs{" "}
          <span className="text-emerald-400 font-medium">{anio}</span>
        </p>
      </div>

      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="lineColorGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="lineColorBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1F2937"
              opacity={0.3}
            />

            <XAxis
              dataKey="mes"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickMargin={5}
              width={40}
              axisLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey={anio}
              name={`Año ${anio}`}
              stroke="url(#lineColorGreen)"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#fff", strokeWidth: 1 }}
              activeDot={{ r: 6 }}
              animationDuration={1200}
              animationEasing="ease-in-out"
            />

            <Line
              type="monotone"
              dataKey={anio - 1}
              name={`Año ${anio - 1}`}
              stroke="url(#lineColorBlue)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              animationDuration={1200}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
