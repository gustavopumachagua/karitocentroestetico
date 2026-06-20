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
import Skeleton from "../common/Skeleton";

export default function IngresosMensuales({ data, filtroAnio, filtroMes, loading }) {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
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
    <section className="glass-card p-4 sm:p-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'rgba(52, 211, 153, 0.10)', border: '1px solid rgba(52, 211, 153, 0.15)' }}
          >
            <FaChartBar className="text-emerald-400 text-lg" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Ingresos por servicios mensuales
          </h3>
        </div>
        <p className="text-slate-400 text-sm">
          Comparativa{" "}
          <span className="text-blue-400 font-medium">{filtroAnio - 1}</span> vs{" "}
          <span className="text-emerald-400 font-medium">{filtroAnio}</span>
        </p>
      </div>

      {loading ? (
        <Skeleton variant="chart" height="370px" />
      ) : (
        <div className="w-full overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="min-w-[650px] sm:min-w-0 h-[280px] sm:h-[340px] md:h-[370px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataComparativa}
                barGap={6}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.06)"
                  opacity={0.5}
                />

                <XAxis
                  dataKey="mes"
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.1)' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `S/${value.toLocaleString()}`}
                />

                <Tooltip
                  cursor={{ fill: "rgba(34, 211, 238, 0.06)" }}
                  formatter={(value, name) => [
                    `S/${value.toLocaleString()}`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(12, 20, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.15)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "#e2e8f0",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                    backdropFilter: "blur(12px)",
                  }}
                  labelStyle={{
                    color: "#a5b4fc",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                  itemStyle={{ fontSize: "13px" }}
                />

                <Legend
                  wrapperStyle={{
                    paddingTop: 10,
                    fontSize: "13px",
                    color: "#94a3b8",
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
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0.15} />
                  </linearGradient>
                  <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
