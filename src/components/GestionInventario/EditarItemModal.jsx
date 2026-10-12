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
    <div className="ui-modal-backdrop">
      <div role="dialog" aria-modal="true" aria-label="Editar ítem del catálogo" className="ui-modal max-w-lg p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-700/50 pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/10">
            <span className="text-lg font-semibold text-indigo-300">+</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            Editar {item.tipo === "insumo" ? "Insumo" : "Servicio"}
          </h3>
        </div>

        <form className="flex flex-col gap-4 sm:gap-5">
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Nombre</label>
            <input
              name="nombre"
              aria-label="Nombre del insumo o servicio"
              aria-invalid={Boolean(errors.nombre)}
              type="text"
              value={form.nombre}
              onChange={handleChange}
              className={`ui-control ${
                errors.nombre ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20" : "border-slate-700 focus:border-indigo-400/60 focus:ring-indigo-400/15"
              } focus:ring-2`}
            />
            {errors.nombre && (
              <p className="text-rose-300 text-xs mt-1">{errors.nombre}</p>
            )}
            {item.tipo === "servicio" &&
              form.nombre.trim() === nombreOriginal.trim() && (
                <p className="text-amber-300 text-xs mt-1">
                  Debe modificar el nombre antes de guardar.
                </p>
              )}
          </div>

          {item.tipo === "insumo" && (
            <>
              <div>
                <label className="text-slate-300 text-sm mb-2 block">
                  Stock actual:{" "}
                  <span className="text-emerald-300 font-semibold">
                    {item.stock}
                  </span>
                </label>
                <input
                  name="stock"
                  aria-label="Cantidad de stock que se añadirá"
                  aria-invalid={Boolean(errors.stock)}
                  type="number"
                  min="1"
                  placeholder="Ingrese cantidad a añadir"
                  value={form.stock}
                  onChange={handleChange}
                  className={`ui-control ${
                    errors.stock ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20" : "border-slate-700 focus:border-indigo-400/60 focus:ring-indigo-400/15"
                  } focus:ring-2`}
                />
                {errors.stock && (
                  <p className="text-rose-300 text-xs mt-1">{errors.stock}</p>
                )}

                {form.stock && incremento > 0 && (
                  <p className="text-sm text-slate-400 mt-2">
                    Se añadirá{" "}
                    <span className="text-emerald-300 font-semibold">
                      {incremento}
                    </span>{" "}
                    unidades →{" "}
                    <span className="text-indigo-300 font-semibold">
                      Nuevo total: {nuevoTotal}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-slate-300 text-sm mb-2 block">
                  Umbral
                </label>
                <input
                  name="umbral"
                  aria-label="Umbral de stock"
                  aria-invalid={Boolean(errors.umbral)}
                  type="number"
                  min="1"
                  value={form.umbral}
                  onChange={handleChange}
                  className={`ui-control ${
                    errors.umbral ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20" : "border-slate-700 focus:border-indigo-400/60 focus:ring-indigo-400/15"
                  } focus:ring-2`}
                />
                {errors.umbral && (
                  <p className="text-rose-300 text-xs mt-1">{errors.umbral}</p>
                )}
              </div>
            </>
          )}
        </form>

        <div className="flex justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 flex-wrap">
          <button
            onClick={onClose}
            className="ui-button ui-button-secondary w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!isValid}
            className={`ui-button w-full sm:w-auto ${
              isValid
                ? "ui-button-primary"
                : "ui-button-secondary cursor-not-allowed"
            }`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
