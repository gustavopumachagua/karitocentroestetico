import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { CHART_TOOLTIP_STYLE } from "./chartTheme";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formatValue = (val) => val.toLocaleString("es-ES");

    return (
      <div
        className="ui-chart-tooltip"
        style={CHART_TOOLTIP_STYLE}
      >
        <p className="font-semibold text-indigo-300 mb-3 text-sm">
          {label.toUpperCase()}
        </p>

        <div className="space-y-2">
          {payload.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: item.color,
                  }}
                ></span>
                <span className="text-slate-300">{item.name}</span>
              </div>
              <span className="text-white font-semibold">
                {formatValue(item.value)}{" "}
                <span className="text-slate-400">citas</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function GraficoCitasEvolucion({ data, anio }) {
  return (
    <div className="ui-panel ui-chart-card">
      <div className="ui-chart-header flex flex-col gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <h3 className="text-base font-semibold text-white tracking-tight">
            Evolución de citas atendidas
          </h3>
        </div>
        <p className="text-sm text-slate-400">
          Comparativa{" "}
          <span className="font-medium" style={{ color: "var(--chart-slate, #8D9CA9)" }}>{anio - 1}</span> vs{" "}
          <span className="font-medium" style={{ color: "var(--chart-indigo, #A8B8A4)" }}>{anio}</span>
        </p>
      </div>

      <div className="ui-chart-body min-w-0 w-full h-[260px] sm:h-[300px] md:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
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
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              stroke="var(--text-secondary, #A1A4AB)"
              tick={{ fontSize: 12, fill: "var(--text-secondary, #A1A4AB)" }}
              tickMargin={5}
              width={40}
              axisLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey={anio}
              name={`Año ${anio}`}
              stroke="var(--chart-indigo, #A8B8A4)"
              strokeWidth={2.5}
              dot={{ r: 4, stroke: "var(--chart-indigo, #A8B8A4)", strokeWidth: 1, fill: "var(--surface-default, #1A1C20)" }}
              activeDot={{ r: 6, fill: "var(--chart-indigo, #A8B8A4)" }}
              isAnimationActive={false}
              animationDuration={1200}
              animationEasing="ease-in-out"
            />

            <Line
              type="monotone"
              dataKey={anio - 1}
              name={`Año ${anio - 1}`}
              stroke="var(--chart-slate, #8D9CA9)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: "var(--surface-default, #1A1C20)" }}
              activeDot={{ r: 5, fill: "var(--chart-slate, #8D9CA9)" }}
              isAnimationActive={false}
              animationDuration={1200}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
