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
      className="public-navbar sticky top-0 z-50"
    >
      <div
        className={`mx-auto flex max-w-7xl gap-3 px-5 py-3 sm:px-8 sm:py-3.5 lg:px-12
          ${
            isAuthPage
              ? "justify-center"
              : "items-center justify-between"
          }`}
      >
        <div>
          <Logo />
        </div>

        {!isAuthPage && (
          <nav aria-label="Acceso al sistema" className="flex shrink-0 justify-end">
            <AccessButton />
          </nav>
        )}
      </div>
    </header>
  );
}
