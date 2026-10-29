import logo from "../../assets/Logo.jpg";

function HighlightCard({ icon, title, text }) {
  return (
    <div className="auth-highlight min-w-0">
      <span className="auth-highlight-icon" aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-100">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function LogoBox({ className = "" }) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden ${className}`}
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <img
        src={logo}
        alt="Karito"
        className="h-full w-full object-cover"
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
            <p className="ui-eyebrow">
              {subtitle}
            </p>
            <h1 className="mt-4 max-w-lg font-semibold text-slate-100">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
              {description}
            </p>
          </div>

          {highlights.length > 0 && (
            <div className="auth-highlights">
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
          <div className="auth-card-brand">
            <LogoBox />
            <div>
              <p className="text-sm font-semibold text-slate-100">Karito</p>
              <p className="text-xs text-slate-400">Centro Estético</p>
            </div>
          </div>
          <div className="mb-7 text-left">
            <p className="ui-eyebrow">
              {cardSubtitle}
            </p>
            <h2 className="mt-2 font-semibold text-slate-100">
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
