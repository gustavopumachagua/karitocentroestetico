import { FaClipboardList } from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { CHART_TOOLTIP_STYLE } from "./chartTheme";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div
        className="ui-chart-tooltip"
        style={CHART_TOOLTIP_STYLE}
      >
        <p className="text-sm font-semibold text-indigo-300 mb-1">
          {label}
        </p>
        <p className="text-slate-200 text-sm">
          <span className="font-bold text-white">{item.value}</span> usos
        </p>
      </div>
    );
  }
  return null;
};

export default function GraficoInsumos({ data }) {
  return (
    <div className="ui-panel ui-chart-card">
      <div className="ui-chart-header">
        <div className="flex min-w-0 items-start gap-3">
          <div className="ui-chart-icon">
            <FaClipboardList className="text-lg" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Insumos más usados
          </h3>
        </div>
      </div>
      <div className="ui-chart-body w-full overflow-x-auto custom-scroll">
        <div className="min-w-[360px] sm:min-w-0 h-[280px] sm:h-[320px] md:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--line-soft, #2B3648)"
                horizontal={false}
              />

              <XAxis
                type="number"
                stroke="var(--text-secondary, #94A3B8)"
                tick={{ fontSize: 12, fill: "var(--text-secondary, #94A3B8)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="var(--text-secondary, #94A3B8)"
                tick={{ fontSize: 12, fill: "var(--text-secondary, #94A3B8)", fontWeight: 500 }}
                width={145}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--bg-hover)" }}
              />

              <defs>
                <linearGradient id="barGradientInsumos" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--chart-indigo, #818CF8)" />
                  <stop offset="100%" stopColor="var(--chart-indigo, #818CF8)" />
                </linearGradient>
              </defs>

              <Bar
                dataKey="value"
                fill="url(#barGradientInsumos)"
                radius={[8, 8, 8, 8]}
                barSize={20}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
