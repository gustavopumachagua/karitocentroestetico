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
    <header className="sticky top-0 z-50 bg-gray-900 shadow-md">
      <div
        className={`max-w-7xl mx-auto flex px-6 lg:px-20 py-4 transition-all
          ${
            isAuthPage
              ? "justify-center"
              : "flex-col md:flex-row md:justify-between md:items-center"
          }`}
      >
        <div className="cursor-default">
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
