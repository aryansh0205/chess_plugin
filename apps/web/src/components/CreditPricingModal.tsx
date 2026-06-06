export function CreditPricingModal({ open }: { open?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">CreditPricingModal</h2>
        <p className="mt-2 text-sm text-slate-600">Placeholder modal shell.</p>
      </div>
    </div>
  );
}
