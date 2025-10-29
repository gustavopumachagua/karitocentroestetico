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
      <div className="bg-gray-900/95 backdrop-blur-md border border-indigo-500/30 p-3 rounded-xl shadow-lg text-gray-200 min-w-[140px] animate-fade-in">
        <p className="text-sm font-semibold text-indigo-400 mb-1 tracking-wide">
          {item.name}
        </p>
        <p className="text-gray-300 text-sm">
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
    <div className="bg-gradient-to-br from-gray-800/70 via-gray-900/70 to-gray-800/70 p-6 rounded-3xl border border-gray-700/60 shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          {Icon && <Icon className="text-indigo-400 text-2xl" />}
          <h3 className="text-lg md:text-xl font-semibold text-white tracking-wide">
            {title}
          </h3>
        </div>
      </div>

      <div className="w-full h-64 sm:h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
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
              stroke="#111827"
              strokeWidth={2}
            >
              {data.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={colors[i % colors.length]}
                  filter="url(#shadow)"
                  className="cursor-pointer transition-all duration-200 hover:opacity-80 hover:scale-105"
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
                  color: "#E5E7EB",
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
