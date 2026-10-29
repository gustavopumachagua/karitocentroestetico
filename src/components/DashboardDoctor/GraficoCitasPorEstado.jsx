import PieChartCard from "./PieChartCard";

export default function GraficoCitasPorEstado({ data }) {
  const estadoColors = {
    Atendido: "var(--chart-teal, #82A99F)",
    Cancelado: "var(--chart-rose, #BD9698)",
    Aplazado: "var(--chart-amber, #C0AD87)",
  };

  const colors = data.map((d) => estadoColors[d.name] || "var(--chart-slate, #8D9CA9)");

  return (
    <PieChartCard
      title="Citas por estado"
      data={data}
      dataKey="value"
      nameKey="name"
      colors={colors}
      showLegend={false}
    />
  );
}
