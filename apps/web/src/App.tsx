import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { useEmbedUserContext } from "./embed/EmbedUserProvider";
import { captureEmbedQueryFromUrl } from "./embed/relmesEmbed";
import { ChessPage } from "./chess/ChessPage";
import { HomePage } from "./pages/HomePage";
import { ResearchPage } from "./research/ResearchPage";
import LoginPage from "./auth/login/page";
import SignupPage from "./auth/signup/page";

function EmbedShell({ children }: { children: ReactNode }) {
  const { hideBoilerplateAuth } = useEmbedUserContext();
  const location = useLocation();

  const blocked =
    hideBoilerplateAuth &&
    ["/auth", "/login", "/signup"].some(
      (prefix) =>
        location.pathname === prefix || location.pathname.startsWith(`${prefix}/`),
    );

  if (blocked) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    captureEmbedQueryFromUrl(location.search);
  }, [location.search]);

  return (
    <EmbedShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chess" element={<ChessPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </EmbedShell>
  );
}
