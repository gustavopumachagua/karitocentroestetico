import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_LABEL_STYLE, CHART_LEGEND_STYLE, CHART_TOOLTIP_STYLE } from "../DashboardDoctor/chartTheme";

export default function GraficoIngresosComparativos({ data, anio }) {
  return (
    <div className="ui-panel ui-chart-card">
      <div className="ui-chart-header flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <h3 className="text-base font-semibold text-white tracking-tight">
            Ingresos por servicios mensuales
          </h3>
        </div>
        <p className="text-slate-400 text-sm">
          Comparativa{" "}
          <span className="font-medium" style={{ color: "var(--chart-slate, #8D9CA9)" }}>{anio - 1}</span> vs{" "}
          <span className="font-medium" style={{ color: "var(--chart-indigo, #A8B8A4)" }}>{anio}</span>
        </p>
      </div>

      <div className="ui-chart-body min-w-0 w-full overflow-x-auto custom-scroll">
        <div className="min-w-[480px] sm:min-w-0 h-[280px] sm:h-[320px] md:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 15, right: 20, left: 5, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="2 5"
                stroke="var(--line-soft, #303238)"
                vertical={false}
              />
              <XAxis
                dataKey="mes"
                stroke="var(--text-secondary, #A1A4AB)"
                tick={{ fontSize: 12, fill: "var(--text-secondary, #A1A4AB)" }}
                interval={0}
                textAnchor="middle"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-secondary, #A1A4AB)"
                tick={{ fontSize: 12, fill: "var(--text-secondary, #A1A4AB)" }}
                width={70}
                tickFormatter={(v) => `S/${v.toLocaleString()}`}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{
                  strokeDasharray: "3 3",
                  stroke: "var(--chart-slate, #8D9CA9)",
                }}
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(value) => [`S/${value.toLocaleString()}`, "Monto"]}
                labelStyle={CHART_LABEL_STYLE}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={CHART_LEGEND_STYLE}
                iconType="circle"
              />

              <Line
                type="monotone"
                dataKey={anio - 1}
                stroke="var(--chart-slate, #8D9CA9)"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 3, strokeWidth: 2, fill: "var(--surface-default, #1A1C20)" }}
                activeDot={{ r: 6, stroke: "var(--chart-slate, #8D9CA9)", strokeWidth: 2 }}
                name={`Año ${anio - 1}`}
                animationDuration={1000}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey={anio}
                stroke="var(--chart-indigo, #A8B8A4)"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: "var(--surface-default, #1A1C20)" }}
                activeDot={{ r: 7, stroke: "var(--chart-indigo, #A8B8A4)", strokeWidth: 2 }}
                name={`Año ${anio}`}
                animationDuration={1000}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
