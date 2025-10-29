import { createRoot } from "react-dom/client";
import { CitasProvider } from "./context/CitasContext.jsx";
import "./index.css";
import App from "./App.jsx";
import { registerSW } from "virtual:pwa-register";

registerSW();

createRoot(document.getElementById("root")).render(
  <CitasProvider>
    <App />
  </CitasProvider>
);
