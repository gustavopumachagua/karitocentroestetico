import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FaChartBar } from "react-icons/fa";

export default function IngresosMensuales({ data, filtroAnio, filtroMes }) {
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const dataComparativa = meses
    .map((mes, index) => ({
      mes: mes.charAt(0).toUpperCase() + mes.slice(1),
      actual: data[filtroAnio]?.[mes] || 0,
      anterior: data[filtroAnio - 1]?.[mes] || 0,
      numeroMes: index + 1,
    }))
    .filter((item) => !filtroMes || item.numeroMes === filtroMes);

  return (
    <section className="bg-gradient-to-br from-gray-800/70 via-gray-900/70 to-gray-800/70 rounded-3xl border border-gray-700/60 p-6 shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
            <FaChartBar className="text-emerald-400 text-xl" />
          </div>
          <h3 className="text-xl font-semibold text-white tracking-wide">
            Ingresos por Servicios Mensuales
          </h3>
        </div>
        <p className="text-gray-400 text-sm">
          Comparativa{" "}
          <span className="text-blue-400 font-medium">{filtroAnio - 1}</span> vs{" "}
          <span className="text-emerald-400 font-medium">{filtroAnio}</span>
        </p>
      </div>

      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="min-w-[650px] sm:min-w-0 h-[320px] sm:h-[370px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dataComparativa}
              barGap={6}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1F2937"
                opacity={0.3}
              />

              <XAxis
                dataKey="mes"
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                angle={-25}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `S/${value.toLocaleString()}`}
              />

              <Tooltip
                formatter={(value, name) => [
                  `S/${value.toLocaleString()}`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "rgba(31,41,55,0.95)",
                  border: "1px solid rgba(55,65,81,0.5)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "#E5E7EB",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                }}
                labelStyle={{
                  color: "#A5B4FC",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
                itemStyle={{ fontSize: "13px" }}
              />

              <Legend
                wrapperStyle={{
                  paddingTop: 10,
                  fontSize: "13px",
                  color: "#D1D5DB",
                }}
                iconType="circle"
              />

              <Bar
                dataKey="anterior"
                fill="url(#barBlue)"
                name={`Año ${filtroAnio - 1}`}
                radius={[6, 6, 0, 0]}
                maxBarSize={20}
              />
              <Bar
                dataKey="actual"
                fill="url(#barGreen)"
                name={`Año ${filtroAnio}`}
                radius={[6, 6, 0, 0]}
                maxBarSize={20}
              />

              <defs>
                <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
