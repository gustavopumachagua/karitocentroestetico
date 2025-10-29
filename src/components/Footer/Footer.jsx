export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 px-6 lg:px-20 py-8 ">
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Karito Centro Estético. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
