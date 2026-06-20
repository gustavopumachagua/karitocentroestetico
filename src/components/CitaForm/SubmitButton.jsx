export default function SubmitButton({ disabled, children }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`col-span-1 md:col-span-2 font-semibold py-3 rounded-xl shadow-md transition transform hover:scale-[1.01] ${
        disabled
          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
          : "bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white cursor-pointer shadow-cyan-950/30"
      }`}
    >
      {children}
    </button>
  );
}
