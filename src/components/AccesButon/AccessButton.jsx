import { FaSignInAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function AccessButton() {
  return (
    <Link
      to="/login"
      className="inline-flex items-center bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium text-sm md:text-base shadow hover:bg-indigo-700 transition"
    >
      <FaSignInAlt className="mr-2" />
      Acceder
    </Link>
  );
}
