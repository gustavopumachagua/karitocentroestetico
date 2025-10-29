import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaCreditCard } from "react-icons/fa";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];

export default function MetodosPagoChart({ data }) {
  return (
    <section className="bg-gradient-to-br from-gray-800/70 via-gray-900/70 to-gray-800/70 border border-gray-700/60 rounded-3xl p-6 shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
      <div className="flex flex-col items-center mb-6 text-center space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <FaCreditCard className="text-amber-400 text-xl" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white tracking-wide">
            Métodos de Pago Más Usados
          </h3>
        </div>
        <p className="text-gray-400 text-sm max-w-sm">
          Distribución de los métodos de pago utilizados por los pacientes.
        </p>
      </div>

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
                    stroke="#1F2937"
                    className="cursor-pointer transition-all duration-300 hover:opacity-90"
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17,24,39,0.95)",
                  border: "1px solid rgba(55,65,81,0.5)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "#E5E7EB",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                }}
                labelStyle={{
                  color: "#FBBF24",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
                itemStyle={{
                  fontSize: "13px",
                  color: "#E5E7EB",
                }}
              />

              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{
                  paddingTop: 12,
                  fontSize: "13px",
                  color: "#D1D5DB",
                  lineHeight: "1.6",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
