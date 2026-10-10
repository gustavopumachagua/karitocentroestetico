import { createRoot } from "react-dom/client";
import { CitasProvider } from "./context/CitasContext.jsx";
import "./index.css";
import App from "./App.jsx";
import { registerSW } from "virtual:pwa-register";
import { clearSensitivePwaCaches } from "./utils/pwaCache.js";
import { purgeLegacyClinicalHistoryStorage } from "./utils/clinicalHistoryStorage.js";

// Remove the legacy broad API cache without delaying the application shell.
void clearSensitivePwaCaches();
// v1 clinical drafts were global to the browser. They cannot be safely
// attributed to the current session, so remove them during the v2 migration.
purgeLegacyClinicalHistoryStorage();
registerSW();

createRoot(document.getElementById("root")).render(
  <CitasProvider>
    <App />
  </CitasProvider>
);
