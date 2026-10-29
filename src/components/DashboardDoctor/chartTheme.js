// Presentation only: shared colors and tooltip surfaces for every report.
// CSS custom properties allow the global design system to stay authoritative.
export const CHART_COLORS = [
  "var(--chart-indigo, #A8B8A4)",
  "var(--chart-teal, #82A99F)",
  "var(--chart-amber, #C0AD87)",
  "var(--chart-rose, #BD9698)",
  "var(--chart-slate, #8D9CA9)",
];

export const CHART_TOOLTIP_STYLE = {
  background: "var(--surface-raised, #22252A)",
  border: "1px solid var(--line-strong, #303238)",
  borderRadius: "var(--radius-md, 0.5rem)",
  padding: "10px 14px",
  color: "var(--text-primary, #F0F0F1)",
  boxShadow: "var(--shadow-float)",
  fontSize: "13px",
  lineHeight: 1.5,
  maxWidth: "min(280px, calc(100vw - 40px))",
  overflowWrap: "anywhere",
};

export const CHART_LABEL_STYLE = {
  color: "var(--text-primary, #F0F0F1)",
  fontWeight: 600,
  marginBottom: "6px",
};

export const CHART_LEGEND_STYLE = {
  color: "var(--text-secondary, #A1A4AB)",
  fontSize: "12px",
  lineHeight: 1.8,
  paddingTop: "12px",
  maxHeight: "96px",
  overflowY: "auto",
};
