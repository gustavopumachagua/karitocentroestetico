import PieChartCard from "./PieChartCard";

export default function GraficoTratamientos({ data, colors }) {
  return (
    <PieChartCard
      title="Distribución de servicios"
      data={data}
      dataKey="value"
      nameKey="name"
      colors={colors}
      showLegend={false}
    />
  );
}
