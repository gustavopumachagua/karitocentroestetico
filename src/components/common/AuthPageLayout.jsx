import logo from "../../assets/Logo.jpg";

function HighlightCard({ icon, title, text }) {
  return (
    <div
      className="flex min-w-0 gap-3 rounded-xl p-4"
      style={{
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-card)",
      }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{
          background: "rgba(129, 140, 248, 0.1)",
          border: "1px solid rgba(129, 140, 248, 0.2)",
        }}
      >
        <span className="text-indigo-300" aria-hidden="true">{icon}</span>
      </div>
      <div className="min-w-0">
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
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
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
      <div className="auth-grid min-w-0">
        <div className="auth-visual">
          <div>
            <LogoBox className="mb-6" />
            <p className="ui-eyebrow">
              {subtitle}
            </p>
            <h1 className="mt-3 max-w-lg text-3xl font-semibold leading-tight tracking-tight text-slate-100 xl:text-4xl">
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

        <div className="auth-card min-w-0">
          <div className="mb-7 text-left">
            <LogoBox className="mb-5" />
            <p className="ui-eyebrow">
              {cardSubtitle}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
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
