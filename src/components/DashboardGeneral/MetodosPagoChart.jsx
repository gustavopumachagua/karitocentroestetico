import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaCreditCard } from "react-icons/fa";
import Skeleton from "../common/Skeleton";
import { CHART_COLORS, CHART_LABEL_STYLE, CHART_LEGEND_STYLE, CHART_TOOLTIP_STYLE } from "../DashboardDoctor/chartTheme";

const COLORS = CHART_COLORS;

export default function MetodosPagoChart({ data, loading }) {
  return (
    <section className="ui-panel ui-chart-card">
      <div className="ui-chart-header space-y-2">
        <div className="flex min-w-0 items-start gap-3">
          <div className="ui-chart-icon">
            <FaCreditCard className="text-lg" />
          </div>
          <h3 className="text-lg font-semibold text-white tracking-tight">
            Métodos de Pago Más Usados
          </h3>
        </div>
        <p className="text-slate-400 text-sm max-w-sm">
          Distribución de los métodos de pago utilizados por los pacientes.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Skeleton variant="chart" height="340px" width="100%" />
        </div>
      ) : (
        <div className="ui-chart-body flex min-w-0 justify-center items-center">
          <div className="min-w-0 w-full max-w-md h-[280px] sm:h-[340px] md:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  innerRadius="50%"
                  paddingAngle={3}
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="var(--surface-default, #161D29)"
                      strokeWidth={2}
                      className="transition-opacity duration-150 hover:opacity-90"
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  labelStyle={CHART_LABEL_STYLE}
                  itemStyle={{
                    fontSize: "13px",
                    color: "var(--text-primary, #F1F5F9)",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={CHART_LEGEND_STYLE}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
