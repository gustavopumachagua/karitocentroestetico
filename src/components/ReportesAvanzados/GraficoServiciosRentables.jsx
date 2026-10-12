import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { FaChartPie } from "react-icons/fa";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "../DashboardDoctor/chartTheme";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div
        className="ui-chart-tooltip"
        style={CHART_TOOLTIP_STYLE}
      >
        <p
          style={{
            color: "var(--text-primary, #F1F5F9)",
            fontWeight: 700,
            fontSize: "14px",
            marginBottom: "6px",
          }}
        >
          {item.name}
        </p>
        <p style={{ color: "var(--text-secondary, #94A3B8)", fontSize: "13px" }}>
          <span style={{ fontWeight: 700, color: "var(--text-primary, #F1F5F9)", fontSize: "16px" }}>
            S/{item.value.toLocaleString()}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function GraficoServiciosRentables({ rol, data }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const chartColors = CHART_COLORS;

  return (
    <div className="ui-panel ui-chart-card">
      <div className="ui-chart-header">
        <div className="flex min-w-0 items-start gap-3">
          <div className="ui-chart-icon">
            <FaChartPie className="text-lg" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white capitalize tracking-tight">
            Servicios más rentables ({rol})
          </h3>
        </div>
      </div>

      <div className="ui-chart-body relative min-w-0 w-full h-[280px] sm:h-[340px] md:h-[400px]">
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
              isAnimationActive={false}
              animationDuration={1000}
              stroke="var(--surface-default, #161D29)"
              strokeWidth={2}
            >
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={chartColors[i % chartColors.length]}
                  fillOpacity={1}
                  className="transition-opacity duration-150 hover:opacity-90"
                />
              ))}
            </Pie>

            <Tooltip
              content={<CustomTooltip />}
              position={{ x: 12, y: 12 }}
              wrapperStyle={{ pointerEvents: "none", zIndex: 5 }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none ">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-medium">
            Total
          </span>
          <span className="text-slate-100 text-xl sm:text-2xl font-semibold tabular-nums">
            S/{total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
