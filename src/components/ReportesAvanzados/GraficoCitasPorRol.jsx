import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
          <h3 className="text-base font-semibold text-white capitalize tracking-tight">
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
          buttonClassName="min-h-11 border-slate-700 bg-slate-950/45"
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
              strokeDasharray="2 5"
              stroke="var(--line-soft, #303238)"
              vertical={false}
            />
            <XAxis
              dataKey="nombre"
              stroke="var(--text-secondary, #A1A4AB)"
              tick={{ fontSize: 12, fill: "var(--text-secondary, #A1A4AB)" }}
              angle={-25}
              textAnchor="end"
              interval={0}
              axisLine={false}
              tickLine={false}
              height={55}
            />
            <YAxis
              stroke="var(--text-secondary, #A1A4AB)"
              tick={{ fontSize: 12, fill: "var(--text-secondary, #A1A4AB)" }}
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
                    fill={colores[idx % colores.length]}
                    radius={[3, 3, 0, 0]}
                    animationDuration={800}
                    animationEasing="ease-out"
                    isAnimationActive={false}
                    barSize={Math.max(12, 40 - data.length * 2)}
                  />
                ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
