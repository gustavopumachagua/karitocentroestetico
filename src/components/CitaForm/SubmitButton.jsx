export default function SubmitButton({ disabled, children }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`col-span-1 md:col-span-2 font-semibold py-3 rounded-xl shadow-md transition transform hover:scale-[1.01] ${
        disabled
          ? "bg-gray-600 text-gray-300 cursor-not-allowed"
          : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
      }`}
    >
      {children}
    </button>
  );
}
