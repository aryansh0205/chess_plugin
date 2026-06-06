import { Link } from "react-router-dom";
import { CreditPricingModal } from "../components/CreditPricingModal";
import { ResearchDashboard } from "../components/ResearchDashboard";
import { SignOutButton } from "./SignOutButton";
import { useState } from "react";

export function ResearchPage() {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Link className="text-sm text-blue-600 hover:underline" to="/">
            ← Home
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
              onClick={() => setShowPricing((v) => !v)}
            >
              Toggle pricing modal
            </button>
            <SignOutButton />
          </div>
        </div>
        <ResearchDashboard />
        <CreditPricingModal open={showPricing} />
      </div>
    </div>
  );
}
