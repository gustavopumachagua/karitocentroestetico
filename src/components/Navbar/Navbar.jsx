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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div
        className={`mx-auto flex max-w-7xl px-5 py-3 transition-all sm:px-6 lg:px-20
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
