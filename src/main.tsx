import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { EnvGuard } from "./components/EnvGuard.tsx";
import "./index.css";
import "tippy.js/dist/tippy.css";

createRoot(document.getElementById("root")!).render(
  <EnvGuard>
    <App />
  </EnvGuard>
);
