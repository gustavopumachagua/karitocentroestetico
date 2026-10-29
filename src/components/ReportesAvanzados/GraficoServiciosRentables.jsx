import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
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
            color: "var(--text-primary, #F0F0F1)",
            fontWeight: 700,
            fontSize: "14px",
            marginBottom: "6px",
          }}
        >
          {item.name}
        </p>
        <p style={{ color: "var(--text-secondary, #A1A4AB)", fontSize: "13px" }}>
          <span style={{ fontWeight: 700, color: "var(--text-primary, #F0F0F1)", fontSize: "16px" }}>
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
      <div className="ui-chart-header flex-col">
        <div className="flex min-w-0 items-start gap-3">
          <h3 className="text-base font-semibold text-white capitalize tracking-tight">
            Ingresos por servicio ({rol})
          </h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-medium tracking-tight tabular-nums text-slate-100">S/{total.toLocaleString()}</span>
          <span className="text-xs text-slate-400">Total del período</span>
        </div>
      </div>

      <div className="ui-chart-body relative min-w-0 w-full h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="82%"
              innerRadius="57%"
              paddingAngle={2}
              isAnimationActive={false}
              animationDuration={1000}
              stroke="var(--surface-default, #1A1C20)"
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

      </div>
    </div>
  );
}
