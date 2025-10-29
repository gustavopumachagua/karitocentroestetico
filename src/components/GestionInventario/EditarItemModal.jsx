import { useState, useEffect } from "react";

export default function EditarItemModal({ show, item, onClose, onSave }) {
  const [form, setForm] = useState({ nombre: "", stock: "", umbral: "" });
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [nombreOriginal, setNombreOriginal] = useState("");

  useEffect(() => {
    if (item) {
      setForm({
        nombre: item.nombre || "",
        stock: "",
        umbral: item.umbral?.toString() || "",
      });
      setNombreOriginal(item.nombre || "");
    }
  }, [item]);

  if (!show) return null;

  const validate = (f) => {
    const newErrors = {};
    const regexNombre = /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ().,/-]+$/;

    if (!f.nombre.trim()) {
      newErrors.nombre = "El nombre no puede estar vacío.";
    } else if (!regexNombre.test(f.nombre.trim())) {
      newErrors.nombre = "Nombre contiene caracteres no válidos.";
    }

    if (item.tipo === "insumo") {
      const stockNum = Number(f.stock);
      const umbralNum = Number(f.umbral);

      if (f.stock.trim() === "") {
        newErrors.stock = "Debe ingresar una cantidad.";
      } else if (isNaN(stockNum) || stockNum <= 0) {
        newErrors.stock = "El stock debe ser un número mayor que 0.";
      }

      if (f.umbral.trim() === "" || isNaN(umbralNum) || umbralNum <= 0) {
        newErrors.umbral = "El umbral debe ser mayor que cero.";
      }
    }

    setErrors(newErrors);

    if (item.tipo === "servicio") {
      const nombreCambio = f.nombre.trim() !== nombreOriginal.trim();
      setIsValid(Object.keys(newErrors).length === 0 && nombreCambio);
    } else {
      setIsValid(Object.keys(newErrors).length === 0);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = name === "nombre" ? value : value.replace(/[^\d]/g, "");
    const updatedForm = { ...form, [name]: cleanValue };
    setForm(updatedForm);
    validate(updatedForm);
  };

  const handleGuardar = () => {
    if (!isValid) return;

    let datos = { ...form };

    if (item.tipo === "insumo") {
      const incremento = Number(form.stock);
      datos.stock = item.stock + incremento;
      datos.umbral = Number(form.umbral);
    }

    onSave(datos);
  };

  const incremento = Number(form.stock) || 0;
  const nuevoTotal = item?.stock + incremento;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4 sm:p-6">
      <div className="bg-gray-800 w-full max-w-lg sm:rounded-2xl rounded-xl p-6 sm:p-8 shadow-2xl border border-gray-700 transition-all">
        <h3 className="text-lg sm:text-xl font-semibold text-green-400 mb-4 sm:mb-6 text-center">
          Editar {item.tipo === "insumo" ? "Insumo" : "Servicio"}
        </h3>

        <form className="flex flex-col gap-4 sm:gap-5">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Nombre</label>
            <input
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg bg-gray-900 border ${
                errors.nombre ? "border-red-500" : "border-gray-600"
              } text-gray-200 focus:border-green-500 focus:ring focus:ring-green-500/30 outline-none`}
            />
            {errors.nombre && (
              <p className="text-red-400 text-xs mt-1">{errors.nombre}</p>
            )}
            {item.tipo === "servicio" &&
              form.nombre.trim() === nombreOriginal.trim() && (
                <p className="text-yellow-400 text-xs mt-1">
                  Debe modificar el nombre antes de guardar.
                </p>
              )}
          </div>

          {item.tipo === "insumo" && (
            <>
              <div>
                <label className="text-gray-300 text-sm mb-1 block">
                  Stock actual:{" "}
                  <span className="text-green-400 font-semibold">
                    {item.stock}
                  </span>
                </label>
                <input
                  name="stock"
                  type="number"
                  min="1"
                  placeholder="Ingrese cantidad a añadir"
                  value={form.stock}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg bg-gray-900 border ${
                    errors.stock ? "border-red-500" : "border-gray-600"
                  } text-gray-200 focus:border-green-500 focus:ring focus:ring-green-500/30 outline-none`}
                />
                {errors.stock && (
                  <p className="text-red-400 text-xs mt-1">{errors.stock}</p>
                )}

                {form.stock && incremento > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    Se añadirá{" "}
                    <span className="text-green-400 font-semibold">
                      {incremento}
                    </span>{" "}
                    unidades →{" "}
                    <span className="text-green-300 font-semibold">
                      Nuevo total: {nuevoTotal}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-1 block">
                  Umbral
                </label>
                <input
                  name="umbral"
                  type="number"
                  min="1"
                  value={form.umbral}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg bg-gray-900 border ${
                    errors.umbral ? "border-red-500" : "border-gray-600"
                  } text-gray-200 focus:border-green-500 focus:ring focus:ring-green-500/30 outline-none`}
                />
                {errors.umbral && (
                  <p className="text-red-400 text-xs mt-1">{errors.umbral}</p>
                )}
              </div>
            </>
          )}
        </form>

        <div className="flex justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 flex-wrap">
          <button
            onClick={onClose}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition w-full sm:w-auto cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!isValid}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-semibold transition w-full sm:w-auto ${
              isValid
                ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                : "bg-green-900 text-gray-400 cursor-not-allowed"
            }`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
