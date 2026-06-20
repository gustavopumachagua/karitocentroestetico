import Logo from "../Logo/Logo";
import AccessButton from "../AccesButon/AccessButton";
import { useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/update-email" ||
    location.pathname === "/new-password";

  return (
    <header
      className="sticky top-0 z-50 shadow-2xl shadow-black/20"
      style={{
        background: 'rgba(5, 10, 24, 0.80)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Decorative glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.15), transparent)',
        }}
      />

      <div
        className={`mx-auto flex max-w-7xl px-5 py-3.5 transition-all sm:px-6 lg:px-20
          ${
            isAuthPage
              ? "justify-center"
              : "flex-col md:flex-row md:justify-between md:items-center"
          }`}
      >
        <div>
          <Logo />
        </div>

        {!isAuthPage && (
          <nav className="hidden md:flex justify-center md:justify-end">
            <AccessButton />
          </nav>
        )}
      </div>
    </header>
  );
}
