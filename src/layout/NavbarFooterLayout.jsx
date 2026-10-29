import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import "../styles/shell.css";

export default function Layout({ children }) {
  return (
    <div className="public-shell min-h-dvh min-w-0 flex flex-col text-slate-100">
      <Navbar />
      <main className="min-w-0 flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
