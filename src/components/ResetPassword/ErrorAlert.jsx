export default function ErrorAlert({ message }) {
  return (
    <div className="p-3 text-sm text-red-400 bg-red-900/40 border border-red-500/40 rounded-lg text-center animate-fadeIn">
      {message}
    </div>
  );
}
