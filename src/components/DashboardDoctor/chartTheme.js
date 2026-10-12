// Presentation only: shared colors and tooltip surfaces for every report.
// CSS custom properties allow the global design system to stay authoritative.
export const CHART_COLORS = [
  "var(--chart-indigo, #818CF8)",
  "var(--chart-teal, #5FB9AE)",
  "var(--chart-amber, #E0B96B)",
  "var(--chart-rose, #D98F9D)",
  "var(--chart-slate, #93A7BF)",
];

export const CHART_TOOLTIP_STYLE = {
  background: "var(--surface-raised, #1E293B)",
  border: "1px solid var(--line-strong, #2B3648)",
  borderRadius: "var(--radius-md, 0.875rem)",
  padding: "12px 16px",
  color: "var(--text-primary, #F1F5F9)",
  boxShadow: "var(--shadow-float)",
  fontSize: "13px",
  lineHeight: 1.5,
  maxWidth: "min(280px, calc(100vw - 40px))",
  overflowWrap: "anywhere",
};

export const CHART_LABEL_STYLE = {
  color: "var(--text-primary, #F1F5F9)",
  fontWeight: 600,
  marginBottom: "6px",
};

export const CHART_LEGEND_STYLE = {
  color: "var(--text-secondary, #94A3B8)",
  fontSize: "12px",
  lineHeight: 1.7,
  paddingTop: "12px",
};
