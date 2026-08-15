import logo from "../../assets/Logo.jpg";

function HighlightCard({ icon, title, text }) {
  return (
    <div
      className="flex gap-3 rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.02]"
      style={{
        border: "1px solid rgba(148, 163, 184, 0.08)",
        background: "rgba(255, 255, 255, 0.02)",
      }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{
          background: "rgba(34, 211, 238, 0.08)",
          border: "1px solid rgba(34, 211, 238, 0.12)",
        }}
      >
        <span className="text-cyan-300">{icon}</span>
      </div>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-5 text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function LogoBox({ className = "" }) {
  return (
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-xl overflow-hidden ${className}`}
      style={{
        background: "rgba(34, 211, 238, 0.08)",
        border: "1px solid rgba(34, 211, 238, 0.15)",
      }}
    >
      <img
        src={logo}
        alt="Karito"
        className="h-12 w-12 rounded-lg object-cover"
      />
    </div>
  );
}

export default function AuthPageLayout({
  subtitle,
  title,
  description,
  highlights = [],
  cardSubtitle,
  cardTitle,
  cardDescription,
  children,
}) {
  return (
    <section className="auth-screen">
      <div className="auth-grid">
        <div className="auth-visual">
          <div>
            <LogoBox className="mb-6" />
            <p className="text-sm font-semibold uppercase text-cyan-200">
              {subtitle}
            </p>
            <h1 className="mt-3 max-w-lg text-4xl font-black leading-tight text-white">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
              {description}
            </p>
          </div>

          {highlights.length > 0 && (
            <div className="mt-8 grid gap-3">
              {highlights.map((item) => (
                <HighlightCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  text={item.text}
                />
              ))}
            </div>
          )}
        </div>

        <div className="auth-card">
          <div className="mb-7 text-center">
            <LogoBox className="mx-auto mb-4" />
            <p className="text-xs font-semibold uppercase text-cyan-200">
              {cardSubtitle}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              {cardTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {cardDescription}
            </p>
          </div>

          {children}
        </div>
      </div>
    </section>
  );
}
