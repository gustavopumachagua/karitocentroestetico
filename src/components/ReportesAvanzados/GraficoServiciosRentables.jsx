import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from "recharts";
import { FaChartPie } from "react-icons/fa";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div
        style={{
          background: "rgba(15, 23, 48, 0.98)",
          border: `2px solid ${item.payload.fill || item.color || "#fbbf24"}`,
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          backdropFilter: "blur(16px)",
          minWidth: "160px",
        }}
      >
        <p style={{ color: item.color || "#fbbf24", fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>
          {item.name}
        </p>
        <p style={{ color: "#e2e8f0", fontSize: "13px" }}>
          <span style={{ fontWeight: 700, color: "#ffffff", fontSize: "16px" }}>
            S/{item.value.toLocaleString()}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

// Colores más vibrantes y diferenciados para distinguirse del fondo oscuro
const CHART_COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f472b6", "#a78bfa"];

export default function GraficoServiciosRentables({ rol, data, colores }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const chartColors = CHART_COLORS;

  return (
    <div className="glass-card p-4 sm:p-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "rgba(251, 191, 36, 0.10)",
              border: "1px solid rgba(251, 191, 36, 0.15)",
            }}
          >
            <FaChartPie className="text-amber-400 text-lg" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white capitalize tracking-tight">
            Servicios más rentables ({rol})
          </h3>
        </div>
      </div>

      <div className="relative w-full h-[280px] sm:h-[340px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius="65%"
              innerRadius="40%"
              paddingAngle={3}
              isAnimationActive={true}
              animationDuration={1000}
              stroke="rgba(5, 10, 24, 0.9)"
              strokeWidth={2}
            >
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={chartColors[i % chartColors.length]}
                  fillOpacity={0.85}
                  className="cursor-pointer transition-all duration-300"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-slate-500 text-[10px] uppercase tracking-widest font-medium">
            Total
          </span>
          <span className="text-amber-400 text-xl sm:text-2xl font-bold">
            S/{total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
