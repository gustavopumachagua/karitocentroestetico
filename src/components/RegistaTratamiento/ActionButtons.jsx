export default function ActionButtons({ onCancel, onSubmit, disabled }) {
  return (
    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
      <button
        type="reset"
        onClick={onCancel}
        className="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition cursor-pointer"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={disabled}
        className={`px-5 py-2 rounded-lg text-white transition ${
          disabled
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
        }`}
      >
        Guardar
      </button>
    </div>
  );
}
