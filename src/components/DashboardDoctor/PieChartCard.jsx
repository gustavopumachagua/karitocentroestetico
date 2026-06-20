import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div
        style={{
          background: "rgba(12, 20, 42, 0.95)",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          borderRadius: "12px",
          padding: "10px 14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          backdropFilter: "blur(12px)",
          minWidth: "140px",
          color: "#e2e8f0",
        }}
      >
        <p className="text-sm font-semibold text-indigo-300 mb-1">
          {item.name}
        </p>
        <p className="text-slate-300 text-sm">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
            style={{ backgroundColor: item.color }}
          ></span>
          <span className="font-bold text-white">{item.value}</span> registros
        </p>
      </div>
    );
  }
  return null;
};

export default function PieChartCard({
  title,
  icon: Icon,
  data,
  dataKey,
  nameKey,
  colors,
  showLegend = false,
}) {
  return (
    <div className="glass-card p-4 sm:p-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center justify-center sm:justify-start gap-3">
          {Icon && (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: "rgba(129, 140, 248, 0.10)",
                border: "1px solid rgba(129, 140, 248, 0.15)",
              }}
            >
              <Icon className="text-indigo-400 text-lg" />
            </div>
          )}
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            {title}
          </h3>
        </div>
      </div>

      <div className="w-full h-[240px] sm:h-[280px] md:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <filter id="pieShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor="#000"
                  floodOpacity="0.3"
                />
              </filter>
            </defs>

            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius="75%"
              innerRadius="45%"
              paddingAngle={3}
              blendStroke
              stroke="rgba(5, 10, 24, 0.8)"
              strokeWidth={2}
            >
              {data.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={colors[i % colors.length]}
                  filter="url(#pieShadow)"
                  className="cursor-pointer transition-all duration-200 hover:opacity-80"
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />

            {showLegend && (
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  fontSize: "13px",
                  color: "#94a3b8",
                  marginTop: "12px",
                }}
                iconType="circle"
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
