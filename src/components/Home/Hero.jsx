import heroImage from "../../assets/Home.avif";
import logo from "../../assets/Logo.jpg";
import AccessButton from "../AccesButon/AccessButton";
import {
  FaCalendarCheck,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";

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
    bg: "rgba(34, 211, 238, 0.08)",
    border: "rgba(34, 211, 238, 0.15)",
    borderHover: "rgba(34, 211, 238, 0.35)",
    iconBg: "rgba(34, 211, 238, 0.12)",
    iconColor: "text-cyan-300",
  },
  violet: {
    bg: "rgba(139, 92, 246, 0.08)",
    border: "rgba(139, 92, 246, 0.12)",
    borderHover: "rgba(139, 92, 246, 0.30)",
    iconBg: "rgba(139, 92, 246, 0.12)",
    iconColor: "text-violet-300",
  },
  emerald: {
    bg: "rgba(52, 211, 153, 0.08)",
    border: "rgba(52, 211, 153, 0.12)",
    borderHover: "rgba(52, 211, 153, 0.30)",
    iconBg: "rgba(52, 211, 153, 0.12)",
    iconColor: "text-emerald-300",
  },
};

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-screen items-center overflow-hidden px-6 py-20 text-slate-100 sm:px-8 lg:px-24"
    >
      {/* Base background */}
      <div className="absolute inset-0 -z-30" style={{ background: 'var(--bg-primary)' }} />

      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full -z-20 animate-float"
        style={{ background: 'radial-gradient(circle, rgba(34, 211, 238, 0.06), transparent 70%)' }}
      />
      <div className="absolute bottom-32 right-20 w-96 h-96 rounded-full -z-20"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05), transparent 70%)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      {/* Hero image */}
      <img
        src={heroImage}
        alt="Centro estético Karito"
        className="
          absolute
          bottom-0
          right-0
          -z-20
          w-full
          max-w-[700px]
          object-contain
          opacity-30
          saturate-125

          sm:opacity-50
          md:w-[48%]
          md:opacity-80
          lg:w-[45%]
          xl:w-[42%]
        "
        style={{ filter: 'brightness(0.9) contrast(1.05)' }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 -z-10" style={{
        background: 'linear-gradient(90deg, rgba(5, 10, 24, 0.98) 0%, rgba(5, 10, 24, 0.92) 40%, rgba(5, 10, 24, 0.30) 100%)',
      }} />

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40" style={{
        background: 'linear-gradient(to top, var(--bg-primary), transparent)',
      }} />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div className="max-w-3xl lg:pr-12 animate-slide-up">
          {/* Badge with logo */}
          <div
            className="mb-6 inline-flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-300"
            style={{
              background: 'rgba(34, 211, 238, 0.06)',
              border: '1px solid rgba(34, 211, 238, 0.15)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <img
              src={logo}
              alt="Karito"
              className="h-7 w-7 rounded-lg object-cover"
              style={{ border: '1px solid rgba(34, 211, 238, 0.2)' }}
            />
            Centro Estético Karito
          </div>

          {/* Title with gradient */}
          <h1 className="text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl tracking-tight">
            <span style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Karito Centro
            </span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #22d3ee 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Estético
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Gestión interna para citas, tratamientos, pagos y reportes con una
            experiencia más limpia, rápida y enfocada en el equipo.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <AccessButton />

            <span className="text-sm text-slate-500">
              Panel privado para el personal autorizado.
            </span>
          </div>

          {/* Highlight cards */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {highlights.map((item, index) => {
              const colors = colorMap[item.color];
              return (
                <div
                  key={item.label}
                  className="group rounded-xl p-4 transition-all duration-300 cursor-default hover:-translate-y-1"
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    backdropFilter: 'blur(16px)',
                    animationDelay: `${index * 100}ms`,
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
                    transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.borderHover;
                    e.currentTarget.style.boxShadow = '0 8px 40px rgba(0, 0, 0, 0.20)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.12)';
                  }}
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${colors.iconColor}`}
                    style={{ background: colors.iconBg }}
                  >
                    {item.icon}
                  </div>

                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="hidden lg:block" />
      </div>
    </section>
  );
}
