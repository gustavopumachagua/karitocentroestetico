import { FaClipboardList } from "react-icons/fa";
import PieChartCard from "./PieChartCard";

export default function GraficoCitasPorEstado({ data }) {
  const estadoColors = {
    Atendido: "#10B981",
    Cancelado: "#EF4444",
    Aplazado: "#F59E0B",
  };

  const colors = data.map((d) => estadoColors[d.name] || "#9CA3AF");

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
