import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { RelmesEmbedNavSync } from "./embed/RelmesEmbedNavSync";
import "./index.css";
import { Providers } from "./providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <BrowserRouter>
        <RelmesEmbedNavSync />
        <App />
      </BrowserRouter>
    </Providers>
  </StrictMode>,
);
