import type { ReactNode } from "react";
import { ThemeProvider } from "./design";
import { EmbedUserProvider } from "./embed/EmbedUserProvider";
import { RelmesEmbedAuthSync } from "./embed/RelmesEmbedAuthSync";
import { RelmesEmbedThemeSync } from "./embed/RelmesEmbedThemeSync";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <RelmesEmbedThemeSync />
      <EmbedUserProvider>
        <RelmesEmbedAuthSync />
        {children}
      </EmbedUserProvider>
    </ThemeProvider>
  );
}
