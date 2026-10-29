import { Link } from "react-router-dom";

export default function AccessButton() {
  return (
    <Link
      to="/login"
      className="ui-button ui-button-primary group min-h-11 px-4 sm:px-6"
    >
      Acceder
    </Link>
  );
}
