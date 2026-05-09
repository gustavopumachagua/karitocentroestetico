export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/85 px-6 py-6 text-slate-400 lg:px-20">
      <div className="mx-auto max-w-7xl text-center text-sm">
        © {new Date().getFullYear()} Karito Centro Estético. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
