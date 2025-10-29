import { Link } from "react-router-dom";
import logo from "../../assets/Logo.jpg";

export default function Logo() {
  return (
    <div className="flex justify-center md:justify-start mb-4 md:mb-0">
      <Link to="/">
        <img
          src={logo}
          alt="Admin Logo"
          className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-indigo-500 cursor-pointer"
        />
      </Link>
    </div>
  );
}
