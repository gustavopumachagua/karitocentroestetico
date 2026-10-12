import heroImage from "../../assets/Home.avif";
import logo from "../../assets/Logo.jpg";
import AccessButton from "../AccesButon/AccessButton";
import { FaCalendarCheck, FaChartLine, FaShieldAlt } from "react-icons/fa";

const highlights = [
  {
    icon: <FaCalendarCheck />,
    label: "Agenda",
    value: "Citas activas",
    color: "cyan",
  },
  {
    icon: <FaChartLine />,
    label: "Reportes",
    value: "Ingresos claros",
    color: "violet",
  },
  {
    icon: <FaShieldAlt />,
    label: "Acceso",
    value: "Roles seguros",
    color: "emerald",
  },
];

const colorMap = {
  cyan: {
    bg: "var(--bg-card)",
    border: "var(--border-subtle)",
    borderHover: "rgba(129, 140, 248, 0.4)",
    iconBg: "rgba(129, 140, 248, 0.1)",
    iconColor: "text-indigo-300",
  },
  violet: {
    bg: "var(--bg-card)",
    border: "var(--border-subtle)",
    borderHover: "rgba(129, 140, 248, 0.4)",
    iconBg: "rgba(129, 140, 248, 0.1)",
    iconColor: "text-indigo-300",
  },
  emerald: {
    bg: "var(--bg-card)",
    border: "var(--border-subtle)",
    borderHover: "rgba(129, 140, 248, 0.4)",
    iconBg: "rgba(129, 140, 248, 0.1)",
    iconColor: "text-indigo-300",
  },
};

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100dvh-10rem)] items-center px-4 py-12 text-slate-100 sm:px-6 sm:py-16 lg:px-12 lg:py-20"
    >
      <div className="mx-auto grid min-w-0 w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-12">
        <div className="min-w-0 max-w-3xl">
          {/* Badge with logo */}
          <div
            className="mb-6 inline-flex max-w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium leading-relaxed text-slate-300"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <img
              src={logo}
              alt="Karito"
              className="h-7 w-7 shrink-0 rounded-lg object-cover"
              style={{ border: "1px solid var(--border-subtle)" }}
            />
            Karito Centro Estético
          </div>

          <h1 className="break-words text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-slate-100">
              Karito Centro
            </span>
            <br />
            <span className="text-indigo-300">
              Estético
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Gestión interna para citas, tratamientos, pagos y reportes con una
            experiencia más limpia, rápida y enfocada en el equipo.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <AccessButton />

            <span className="text-sm leading-relaxed text-slate-400">
              Panel privado para el personal autorizado.
            </span>
          </div>

          {/* Highlight cards */}
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {highlights.map((item, index) => {
              const colors = colorMap[item.color];
              return (
                <div
                  key={item.label}
                  className="ui-card ui-card-interactive group cursor-default"
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    animationDelay: `${index * 100}ms`,
                    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12)",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.borderHover;
                    e.currentTarget.style.boxShadow =
                      "0 8px 40px rgba(0, 0, 0, 0.20)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow =
                      "0 4px 24px rgba(0, 0, 0, 0.12)";
                  }}
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${colors.iconColor}`}
                    style={{ background: colors.iconBg }}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                  </div>

                  <p className="text-sm font-semibold text-white">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-6" style={{ background: "var(--bg-card)" }}>
          <img
            src={heroImage}
            alt="Centro estético Karito"
            className="mx-auto h-auto w-full max-w-md object-contain"
          />
        </div>
      </div>
    </section>
  );
}
