import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    // <div className="mx-auto flex min-h-[40vh] max-w-lg flex-col justify-center px-4">
    //   {children}
    <div className="min-h-screen bg-[hsl(var(--color-page))] px-4 py-12">
      <div className="mx-auto flex w-full max-w-lg flex-col justify-center">{children}</div>
    </div>
  );
}
