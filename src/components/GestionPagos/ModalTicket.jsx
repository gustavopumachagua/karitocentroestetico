import { useRef } from "react";
import Modal from "react-modal";
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";

Modal.setAppElement("#root");

export default function ModalTicket({ isOpen, onClose, ticket }) {
  const componentRef = useRef();

  if (!ticket) return null;

  const { cita, pago } = ticket;

  const nombreCliente = cita.cliente?.replace(/\s+/g, "_") || "Cliente";
  const nombreServicio =
    pago.servicios?.[0]?.nombre?.replace(/\s+/g, "_") || "Servicio";
  const nombreArchivo = `${nombreCliente}_${nombreServicio}.pdf`;

  const handleDownloadPDF = async () => {
    const element = componentRef.current;
    const options = {
      margin: [10, 10, 10, 10],
      filename: nombreArchivo,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: 0,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const worker = html2pdf().set(options).from(element).toPdf();
    const pdf = await worker.get("pdf");

    pdf.save(nombreArchivo);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white text-black p-4 sm:p-6 md:p-8 rounded-xl w-[95%] max-w-[800px] mx-auto mt-6 shadow-2xl"
      overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-center px-2 z-[9999]"
    >
      <div ref={componentRef} className="text-[11px] font-sans text-black">
        <div className="flex justify-between border-b pb-3 mb-3">
          <div>
            <h1 className="font-bold text-sm">
              KARITO BEAUTY ESTHETIC CENTER S.A.C.
            </h1>
            <p>RUC: 20609021366</p>
            <p>Av. Carlos Izaguirre 1211 - Los Olivos</p>
          </div>

          <div className="border px-4 py-2 text-center">
            <p className="font-bold">BOLETA DE VENTA ELECTRÓNICA</p>
            <p>
              {pago.serie}-{String(pago.numeroBoleta).padStart(8, "0")}
            </p>
          </div>
        </div>

        <div className="mb-3 space-y-1">
          <p>
            <strong>Fecha de emisión:</strong>{" "}
            {dayjs(pago.fecha).format("YYYY-MM-DD")}
          </p>
          <p>
            <strong>Cliente:</strong> {cita.cliente}
          </p>
        </div>

        <table className="w-full border-collapse mb-3">
          <thead>
            <tr className="border-t border-b">
              <th className="text-left p-1">CANT</th>
              <th className="text-left p-1">DESCRIPCIÓN</th>
              <th className="text-right p-1">P. UNIT</th>
              <th className="text-right p-1">TOTAL</th>
            </tr>
          </thead>

          <tbody>
            {pago.servicios.map((s, i) => (
              <tr key={i}>
                <td className="p-1">1</td>
                <td className="p-1">{s.nombre}</td>
                <td className="text-right p-1">{s.precio.toFixed(2)}</td>
                <td className="text-right p-1">{s.precio.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between">
              <span>OP. GRAVADAS:</span>
              <span>S/ {(pago.total / 1.18).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IGV:</span>
              <span>S/ {(pago.total - pago.total / 1.18).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t mt-1 pt-1">
              <span>TOTAL A PAGAR:</span>
              <span>S/ {pago.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <p className="mt-3">
          <strong>SON:</strong> {pago.total.toFixed(2)} SOLES
        </p>

        <div className="mt-3">
          <p>
            <strong>Condición de pago:</strong> Contado
          </p>
          <p>
            <strong>Método:</strong> {pago.metodoPago}
          </p>
        </div>

        <div className="text-center mt-6 text-[10px] border-t pt-2">
          <p>Representación impresa de la boleta electrónica</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 print:hidden">
        <button
          onClick={onClose}
          className="bg-[#9ca3af] hover:bg-[#6b7280] px-4 py-2 rounded-lg text-sm font-medium cursor-pointer text-white"
        >
          Cerrar
        </button>
        <button
          onClick={handleDownloadPDF}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
        >
          Guardar PDF
        </button>
      </div>
    </Modal>
  );
}
