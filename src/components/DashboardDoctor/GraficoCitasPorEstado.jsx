import { FaClipboardList } from "react-icons/fa";
import PieChartCard from "./PieChartCard";

export default function GraficoCitasPorEstado({ data }) {
  const estadoColors = {
    Atendido: "var(--chart-teal, #5FB9AE)",
    Cancelado: "var(--chart-rose, #D98F9D)",
    Aplazado: "var(--chart-amber, #E0B96B)",
  };

  const colors = data.map((d) => estadoColors[d.name] || "var(--chart-slate, #93A7BF)");

  return (
    <PieChartCard
      title="Citas por Estado"
      icon={FaClipboardList}
      data={data}
      dataKey="value"
      nameKey="name"
      colors={colors}
      showLegend={true}
    />
  );
}
