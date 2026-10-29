import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Skeleton from "../common/Skeleton";
import { CHART_LABEL_STYLE, CHART_LEGEND_STYLE, CHART_TOOLTIP_STYLE } from "../DashboardDoctor/chartTheme";

export default function IngresosMensuales({ data, filtroAnio, filtroMes, loading }) {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];

  const dataComparativa = meses
    .map((mes, index) => ({
      mes: mes.charAt(0).toUpperCase() + mes.slice(1),
      actual: data[filtroAnio]?.[mes] || 0,
      anterior: data[filtroAnio - 1]?.[mes] || 0,
      numeroMes: index + 1,
    }))
    .filter((item) => !filtroMes || item.numeroMes === filtroMes);

  return (
    <section className="ui-panel ui-chart-card">
      <div className="ui-chart-header flex flex-col gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <h3 className="text-base font-semibold text-white tracking-tight">
            Ingresos por servicios mensuales
          </h3>
        </div>
        <p className="text-slate-400 text-sm">
          Comparativa{" "}
          <span className="font-medium" style={{ color: "var(--chart-slate, #8D9CA9)" }}>{filtroAnio - 1}</span> vs{" "}
          <span className="font-medium" style={{ color: "var(--chart-indigo, #A8B8A4)" }}>{filtroAnio}</span>
        </p>
      </div>

      {loading ? (
        <Skeleton variant="chart" height="370px" />
      ) : (
        <div className="ui-chart-body min-w-0 w-full">
          <div className="min-w-0 h-[280px] sm:h-[340px] md:h-[370px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataComparativa}
                barGap={6}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="2 5"
                  stroke="var(--line-soft, #303238)"
                  vertical={false}
                />

                <XAxis
                  dataKey="mes"
                  stroke="var(--text-secondary, #A1A4AB)"
                  tick={{ fontSize: 12, fill: 'var(--text-secondary, #A1A4AB)' }}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-secondary, #A1A4AB)"
                  tick={{ fontSize: 12, fill: 'var(--text-secondary, #A1A4AB)' }}
                  width={65}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `S/${value.toLocaleString()}`}
                />

                <Tooltip
                  cursor={{ fill: "var(--bg-hover)" }}
                  formatter={(value, name) => [
                    `S/${value.toLocaleString()}`,
                    name,
                  ]}
                  contentStyle={CHART_TOOLTIP_STYLE}
                  labelStyle={CHART_LABEL_STYLE}
                  itemStyle={{ fontSize: "13px" }}
                />

                <Legend
                  wrapperStyle={CHART_LEGEND_STYLE}
                  iconType="circle"
                />

                <Bar
                  dataKey="anterior"
                  fill="var(--chart-slate, #8D9CA9)"
                  name={`Año ${filtroAnio - 1}`}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={20}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="actual"
                  fill="var(--chart-indigo, #A8B8A4)"
                  name={`Año ${filtroAnio}`}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={20}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
