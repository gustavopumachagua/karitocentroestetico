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
      <div
        ref={componentRef}
        className="text-xs sm:text-sm font-sans print:w-full"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 border-b border-[#6b7280] pb-4 gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a8a]">
              CENTRO ESTÉTICO KARITO
            </h1>
            <p className="text-[#111827] text-xs sm:text-sm">
              RUC: 20601234567
            </p>
            <p className="text-[#374151] text-xs sm:text-sm">
              Av. Los Olivos 123 - Lima, Perú
            </p>
            <p className="text-[#374151] text-xs sm:text-sm">
              Tel: (01) 555-1234
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm sm:text-lg font-semibold text-[#111827]">
              Factura de Venta
            </p>
            <p className="text-[#374151] text-xs sm:text-sm">
              Fecha: {dayjs(pago.fecha).format("DD/MM/YYYY HH:mm")}
            </p>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <h2 className="font-semibold text-[#111827] mb-1 text-sm sm:text-base">
            Datos del Cliente
          </h2>
          <p className="text-[#374151]">
            <strong>Nombre:</strong> {cita.cliente}
          </p>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#dbeafe] text-left border-b border-[#9ca3af]">
                <th className="border p-2 text-[#111827]">Servicio</th>
                <th className="border p-2 text-center text-[#111827]">
                  Precio (S/)
                </th>
              </tr>
            </thead>
            <tbody>
              {pago.servicios.map((s, i) => (
                <tr key={i} className="hover:bg-[#f3f4f6] text-[#374151]">
                  <td className="border p-2">{s.nombre}</td>
                  <td className="border p-2 text-center">
                    {s.precio.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-6">
          <div className="w-full sm:w-1/2 md:w-1/3 text-sm">
            <div className="flex justify-between font-bold py-2 text-base sm:text-lg text-[#111827]">
              <span>Total:</span>
              <span>S/ {pago.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 text-xs sm:text-sm text-[#374151]">
          <p>
            <strong>Método de Pago:</strong> {pago.metodoPago}
          </p>
        </div>

        <div className="text-center text-[#374151] mt-6 sm:mt-8 border-t pt-4 text-xs sm:text-sm">
          <p className="font-medium">¡Gracias por confiar en nosotros!</p>
          <p className="text-[#6b7280]">
            Centro Estético Karito © {new Date().getFullYear()}
          </p>
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
