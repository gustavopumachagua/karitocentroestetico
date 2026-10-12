import FechaCita from "../TablaCitas/FechaCita";

export default function FechaField({ fecha }) {
  return (
    <div className="ui-field">
      <label className="ui-label">Fecha</label>
      <div
        className="ui-control flex items-center"
      >
        <FechaCita fecha={fecha} />
      </div>
    </div>
  );
}
