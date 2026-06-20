import { FaClipboardList } from "react-icons/fa";
import PieChartCard from "./PieChartCard";

export default function GraficoTratamientos({ data, colors }) {
  return (
    <PieChartCard
      title="Distribución de Servicios"
      icon={FaClipboardList}
      data={data}
      dataKey="value"
      nameKey="name"
      colors={colors}
    />
  );
}
