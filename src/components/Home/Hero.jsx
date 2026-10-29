import heroImage from "../../assets/Home.avif";
import AccessButton from "../AccesButon/AccessButton";

const highlights = [
  {
    label: "Agenda",
    value: "Citas activas",
  },
  {
    label: "Reportes",
    value: "Ingresos claros",
  },
  {
    label: "Acceso",
    value: "Roles seguros",
  },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="public-hero relative flex items-center px-5 py-12 text-slate-100 sm:px-8 sm:py-16 lg:px-12"
    >
      <div className="mx-auto grid min-w-0 w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
        <div className="min-w-0 max-w-3xl">
          <p className="ui-eyebrow mb-5">Gestión estética y clínica</p>

          <h1 className="break-words text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
            <span className="text-slate-100">
              Karito Centro
            </span>
            <br />
            <span className="text-indigo-300">
              Estético
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
            Citas, tratamientos, pagos y reportes en un mismo espacio de trabajo
            para el equipo de Karito.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <AccessButton />

            <span className="text-sm leading-relaxed text-slate-400">
              Panel privado para el personal autorizado.
            </span>
          </div>

          <div className="public-capabilities">
            {highlights.map((item) => (
                <div key={item.label} className="min-w-0">
                  <p className="text-sm font-medium text-slate-100">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{item.value}</p>
                </div>
            ))}
          </div>
        </div>
        <div className="public-hero-image min-w-0 p-4 sm:p-5">
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
