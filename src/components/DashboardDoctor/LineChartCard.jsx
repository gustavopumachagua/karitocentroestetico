import { createElement } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { CHART_LABEL_STYLE, CHART_TOOLTIP_STYLE } from "./chartTheme";

export default function LineChartCard({
  title,
  icon,
  data,
  dataKey,
  color,
}) {
  return (
    <div className="ui-panel ui-chart-card flex flex-col">
      <div className="ui-chart-header flex min-w-0 items-start gap-3">
        <div className="ui-chart-icon">
          {icon && createElement(icon, { className: "text-lg" })}
        </div>
        <span className="text-lg font-medium text-white">{title}</span>
      </div>
      <div className="ui-chart-body min-w-0 w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--line-soft, #2B3648)"
              vertical={false}
            />
            <XAxis dataKey="mes" stroke="var(--text-secondary, #94A3B8)" axisLine={false} tickLine={false} />
            <YAxis stroke="var(--text-secondary, #94A3B8)" axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_LABEL_STYLE}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
