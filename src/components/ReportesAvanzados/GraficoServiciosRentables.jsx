import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { FaChartPie } from "react-icons/fa";

export default function GraficoServiciosRentables({ rol, data, colores }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-5 sm:p-6 shadow-xl hover:shadow-yellow-900/20 transition-all duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3 border-b border-gray-700 pb-3">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <FaChartPie className="text-yellow-400 text-xl sm:text-2xl drop-shadow" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 capitalize">
            Servicios más Rentables ({rol})
          </h3>
        </div>
      </div>

      <div className="relative w-full h-[260px] sm:h-[320px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {colores.map((color, idx) => (
                <radialGradient
                  key={idx}
                  id={`grad-${idx}`}
                  cx="50%"
                  cy="50%"
                  r="65%"
                >
                  <stop offset="10%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.3} />
                </radialGradient>
              ))}
            </defs>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="70%"
              innerRadius="45%"
              paddingAngle={2}
              isAnimationActive={true}
              animationDuration={1000}
              stroke="#111827"
              strokeWidth={2}
            >
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={`url(#grad-${i % colores.length})`}
                  className="cursor-pointer transition-transform duration-300 hover:scale-105"
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name) => [`S/${value.toLocaleString()}`, name]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #374151",
                borderRadius: "10px",
                color: "#F3F4F6",
                fontSize: "0.85rem",
                padding: "10px 14px",
              }}
              labelStyle={{ color: "#FACC15", fontWeight: "bold" }}
              cursor={{ fill: "rgba(250, 204, 21, 0.1)" }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-gray-400 text-xs uppercase tracking-wide">
            Total
          </span>
          <span className="text-yellow-400 text-lg sm:text-xl font-semibold">
            S/{total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
