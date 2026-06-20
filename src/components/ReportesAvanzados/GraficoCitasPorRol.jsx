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

export default function GraficoCitasPorRol({
  rol,
  data,
  colores,
  profesionales = [],
  seleccionado = "",
  onSeleccionar,
}) {
  return (
    <div className="glass-card p-4 sm:p-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "rgba(129, 140, 248, 0.10)",
              border: "1px solid rgba(129, 140, 248, 0.15)",
            }}
          >
            <FaChartBar className="text-indigo-400 text-lg" />
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
          className="w-full sm:w-60"
          buttonClassName="rounded-xl border-slate-700/60 bg-slate-950/45"
          options={profesionales.map((nombre) => ({
            value: nombre,
            label: nombre,
          }))}
        />
      </div>

      <div className="w-full h-[240px] sm:h-[300px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 25, left: -10, bottom: 25 }}
            barCategoryGap="20%"
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.06)"
              opacity={0.5}
            />
            <XAxis
              dataKey="nombre"
              stroke="#64748b"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              angle={-25}
              textAnchor="end"
              interval={0}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.1)" }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(129, 140, 248, 0.06)" }}
              contentStyle={{
                backgroundColor: "rgba(12, 20, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.15)",
                borderRadius: "12px",
                color: "#e2e8f0",
                fontSize: "0.85rem",
                padding: "10px 14px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              }}
              labelStyle={{ color: "#a5b4fc", fontWeight: "bold" }}
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
                  <stop offset="5%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.2} />
                </linearGradient>
              ))}
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
