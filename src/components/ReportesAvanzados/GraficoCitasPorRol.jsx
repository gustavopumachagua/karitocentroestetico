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

export default function GraficoCitasPorRol({
  rol,
  data,
  colores,
  profesionales = [],
  seleccionado = "",
  onSeleccionar,
}) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-5 sm:p-6 shadow-xl hover:shadow-indigo-900/20 transition-all duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3 border-b border-gray-700 pb-3">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <FaChartBar className="text-indigo-400 text-xl sm:text-2xl drop-shadow" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 capitalize">
            Citas por {rol} y servicio
          </h3>
        </div>
        <select
          value={seleccionado}
          onChange={(e) => onSeleccionar(rol, e.target.value)}
          className="bg-gray-700 text-gray-200 px-3 py-2 rounded-lg border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-gray-600 transition"
        >
          {profesionales.map((nombre) => (
            <option key={nombre} value={nombre}>
              {nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full h-[260px] sm:h-[320px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 25, left: -10, bottom: 25 }}
            barCategoryGap="20%"
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2F3542"
              opacity={0.4}
            />
            <XAxis
              dataKey="nombre"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              angle={-25}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(99,102,241,0.1)" }}
              contentStyle={{
                backgroundColor: "#1E293B",
                border: "1px solid #4B5563",
                borderRadius: "10px",
                color: "#F3F4F6",
                fontSize: "0.85rem",
              }}
              labelStyle={{ color: "#A5B4FC", fontWeight: "bold" }}
            />

            {data.length > 0 &&
              Object.keys(data[0])
                .filter((key) => key !== "nombre")
                .map((serv, idx) => (
                  <Bar
                    key={serv}
                    dataKey={serv}
                    fill={`url(#color-${idx})`}
                    radius={[10, 10, 0, 0]}
                    animationDuration={800}
                    animationEasing="ease-out"
                    barSize={Math.max(12, 40 - data.length * 2)}
                  />
                ))}

            <defs>
              {colores.map((color, idx) => (
                <linearGradient
                  key={idx}
                  id={`color-${idx}`}
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
