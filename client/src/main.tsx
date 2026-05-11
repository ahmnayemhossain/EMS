import { createRoot } from "react-dom/client";
import App from "./core/app/bootstrap/App";
import "./core/styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
