import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaCreditCard } from "react-icons/fa";
import Skeleton from "../common/Skeleton";

const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f472b6", "#a78bfa"];

export default function MetodosPagoChart({ data, loading }) {
  return (
    <section className="glass-card p-6 transition-all duration-300">
      <div className="flex flex-col items-center mb-6 text-center space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'rgba(251, 191, 36, 0.10)', border: '1px solid rgba(251, 191, 36, 0.15)' }}
          >
            <FaCreditCard className="text-amber-400 text-lg" />
          </div>
          <h3 className="text-lg font-semibold text-white tracking-tight">
            Métodos de Pago Más Usados
          </h3>
        </div>
        <p className="text-slate-500 text-sm max-w-sm">
          Distribución de los métodos de pago utilizados por los pacientes.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Skeleton variant="chart" height="340px" width="100%" />
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <div className="w-full max-w-md h-[280px] sm:h-[340px] md:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  innerRadius="50%"
                  paddingAngle={3}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="rgba(5, 10, 24, 0.8)"
                      strokeWidth={2}
                      className="cursor-pointer transition-all duration-300 hover:opacity-90"
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(12, 20, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.12)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "#e2e8f0",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                  }}
                  labelStyle={{
                    color: "#fbbf24",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                  itemStyle={{
                    fontSize: "13px",
                    color: "#e2e8f0",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: 12,
                    fontSize: "13px",
                    color: "#94a3b8",
                    lineHeight: "1.6",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
