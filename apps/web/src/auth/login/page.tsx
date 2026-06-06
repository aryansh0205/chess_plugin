import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../AuthLayout";
import { login } from "@/lib/authApi";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-[hsl(var(--color-fg))]">Sign in</h1>
        <p className="mt-1 text-sm text-[hsl(var(--color-fg-muted))]">
          Use the account you created. Your session is stored in cookies.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-200"
            >
              {error}
            </div>
          ) : null}

          <div>
            <label htmlFor="login-email" className="mb-1 block text-xs font-medium text-[hsl(var(--color-fg-muted))]">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-page))] px-3 py-2 text-sm text-[hsl(var(--color-fg))] outline-none ring-[hsl(var(--color-accent))] focus:border-transparent focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-xs font-medium text-[hsl(var(--color-fg-muted))]">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-page))] px-3 py-2 text-sm text-[hsl(var(--color-fg))] outline-none ring-[hsl(var(--color-accent))] focus:border-transparent focus:ring-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[hsl(var(--color-accent))] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[hsl(var(--color-fg-muted))]">
          No account?{" "}
          <Link to="/auth/signup" className="font-medium text-[hsl(var(--color-accent))] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
