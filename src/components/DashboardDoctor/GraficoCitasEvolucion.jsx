import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { FaClipboardList } from "react-icons/fa";
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
          <div className="ui-chart-icon">
            <FaClipboardList className="text-lg" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Evolución de citas atendidas
          </h3>
        </div>
        <p className="text-sm text-slate-400">
          Comparativa{" "}
          <span className="font-medium" style={{ color: "var(--chart-slate, #93A7BF)" }}>{anio - 1}</span> vs{" "}
          <span className="font-medium" style={{ color: "var(--chart-indigo, #818CF8)" }}>{anio}</span>
        </p>
      </div>

      <div className="ui-chart-body min-w-0 w-full h-[260px] sm:h-[300px] md:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="lineColorGreenDoc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-indigo, #818CF8)" />
                <stop offset="100%" stopColor="var(--chart-indigo, #818CF8)" />
              </linearGradient>
              <linearGradient id="lineColorBlueDoc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-slate, #93A7BF)" />
                <stop offset="100%" stopColor="var(--chart-slate, #93A7BF)" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--line-soft, #2B3648)"
              vertical={false}
            />

            <XAxis
              dataKey="mes"
              stroke="var(--text-secondary, #94A3B8)"
              tick={{ fontSize: 12, fill: "var(--text-secondary, #94A3B8)" }}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              stroke="var(--text-secondary, #94A3B8)"
              tick={{ fontSize: 12, fill: "var(--text-secondary, #94A3B8)" }}
              tickMargin={5}
              width={40}
              axisLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey={anio}
              name={`Año ${anio}`}
              stroke="url(#lineColorGreenDoc)"
              strokeWidth={3}
              dot={{ r: 4, stroke: "var(--chart-indigo, #818CF8)", strokeWidth: 1, fill: "var(--surface-default, #161D29)" }}
              activeDot={{ r: 6, fill: "var(--chart-indigo, #818CF8)" }}
              isAnimationActive={false}
              animationDuration={1200}
              animationEasing="ease-in-out"
            />

            <Line
              type="monotone"
              dataKey={anio - 1}
              name={`Año ${anio - 1}`}
              stroke="url(#lineColorBlueDoc)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: "var(--surface-default, #161D29)" }}
              activeDot={{ r: 5, fill: "var(--chart-slate, #93A7BF)" }}
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
