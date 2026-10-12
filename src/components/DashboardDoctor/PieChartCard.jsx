import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { CHART_LEGEND_STYLE, CHART_TOOLTIP_STYLE } from "./chartTheme";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div
        className="ui-chart-tooltip"
        style={CHART_TOOLTIP_STYLE}
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
    <div className="ui-panel ui-chart-card">
      <div className="ui-chart-header">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div
              className="ui-chart-icon"
            >
              <Icon className="text-lg" />
            </div>
          )}
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            {title}
          </h3>
        </div>
      </div>

      <div className="ui-chart-body min-w-0 w-full h-[280px] sm:h-[320px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
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
              stroke="var(--surface-default, #161D29)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={colors[i % colors.length]}
                  className="transition-opacity duration-150 hover:opacity-90"
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />

            {showLegend && (
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={CHART_LEGEND_STYLE}
                iconType="circle"
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
