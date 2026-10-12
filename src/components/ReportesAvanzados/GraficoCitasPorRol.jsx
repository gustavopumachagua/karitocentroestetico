import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaChartBar } from "react-icons/fa";
import CustomSelect from "../common/CustomSelect";
import { CHART_LABEL_STYLE, CHART_TOOLTIP_STYLE } from "../DashboardDoctor/chartTheme";

export default function GraficoCitasPorRol({
  rol,
  data,
  colores,
  profesionales = [],
  seleccionado = "",
  onSeleccionar,
}) {
  return (
    <div className="ui-panel ui-chart-card">
      <div className="ui-chart-header flex flex-col gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="ui-chart-icon">
            <FaChartBar className="text-lg" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white capitalize tracking-tight">
            Citas por {rol} y servicio
          </h3>
        </div>
        <CustomSelect
          value={seleccionado}
          onValueChange={(value) => onSeleccionar(rol, value)}
          accent="indigo"
          size="sm"
          disabled={profesionales.length === 0}
          placeholder={
            profesionales.length > 0 ? "Seleccionar profesional" : "Sin profesionales"
          }
          className="min-w-0 w-full"
          buttonClassName="min-h-11 rounded-xl border-slate-700 bg-slate-950/45"
          options={profesionales}
        />
      </div>

      <div className="ui-chart-body min-w-0 w-full h-[280px] sm:h-[320px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 15, left: 0, bottom: 45 }}
            barCategoryGap="20%"
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--line-soft, #2B3648)"
              vertical={false}
            />
            <XAxis
              dataKey="nombre"
              stroke="var(--text-secondary, #94A3B8)"
              tick={{ fontSize: 12, fill: "var(--text-secondary, #94A3B8)" }}
              angle={-25}
              textAnchor="end"
              interval={0}
              axisLine={false}
              tickLine={false}
              height={55}
            />
            <YAxis
              stroke="var(--text-secondary, #94A3B8)"
              tick={{ fontSize: 12, fill: "var(--text-secondary, #94A3B8)" }}
              width={45}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--bg-hover)" }}
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_LABEL_STYLE}
            />

            {data.length > 0 &&
              Object.keys(data[0])
                .filter((key) => key !== "nombre")
                .map((serv, idx) => (
                  <Bar
                    key={serv}
                    dataKey={serv}
                    fill={`url(#color-rol-${rol}-${idx})`}
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                    animationEasing="ease-out"
                    isAnimationActive={false}
                    barSize={Math.max(12, 40 - data.length * 2)}
                  />
                ))}

            <defs>
              {colores.map((color, idx) => (
                <linearGradient
                  key={idx}
                  id={`color-rol-${rol}-${idx}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} />
                  <stop offset="95%" stopColor={color} />
                </linearGradient>
              ))}
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
