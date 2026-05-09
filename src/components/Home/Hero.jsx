import heroImage from "../../assets/Home.avif";
import AccessButton from "../AccesButon/AccessButton";
import {
  FaCalendarCheck,
  FaChartLine,
  FaShieldAlt,
  FaSpa,
} from "react-icons/fa";

const highlights = [
  {
    icon: <FaCalendarCheck />,
    label: "Agenda",
    value: "Citas activas",
  },
  {
    icon: <FaChartLine />,
    label: "Reportes",
    value: "Ingresos claros",
  },
  {
    icon: <FaShieldAlt />,
    label: "Acceso",
    value: "Roles seguros",
  },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-screen items-center overflow-hidden px-6 py-20 text-slate-100 sm:px-8 lg:px-24"
    >
      <div className="absolute inset-0 -z-30 bg-slate-950" />

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
          opacity-40
          saturate-125

          sm:opacity-60
          md:w-[48%]
          md:opacity-90
          lg:w-[45%]
          xl:w-[42%]
        "
      />

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,6,23,0.98)_0%,rgba(2,6,23,0.90)_45%,rgba(2,6,23,0.35)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-slate-950 to-transparent" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div className="max-w-3xl lg:pr-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 bg-slate-950/45 px-3 py-2 text-xs font-semibold uppercase text-cyan-200 backdrop-blur">
            <FaSpa className="text-cyan-300" />
            Centro Estético Karito
          </div>

          <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Karito Centro Estético
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Gestión interna para citas, tratamientos, pagos y reportes con una
            experiencia más limpia, rápida y enfocada en el equipo.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <AccessButton />

            <span className="text-sm text-slate-400">
              Panel privado para el personal autorizado.
            </span>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="dark-surface rounded-xl border border-white/5 p-4 transition duration-300 hover:border-cyan-300/35"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300/12 text-cyan-200">
                  {item.icon}
                </div>

                <p className="text-sm font-semibold text-white">{item.label}</p>

                <p className="mt-1 text-sm text-slate-400">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:block" />
      </div>
    </section>
  );
}
