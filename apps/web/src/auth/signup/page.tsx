import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../AuthLayout";
import { signup } from "@/lib/authApi";

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
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
        <h1 className="text-xl font-semibold text-[hsl(var(--color-fg))]">Create account</h1>
        <p className="mt-1 text-sm text-[hsl(var(--color-fg-muted))]">
          We&apos;ll save your profile in MongoDB and set secure cookies for your session.
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
            <label htmlFor="signup-name" className="mb-1 block text-xs font-medium text-[hsl(var(--color-fg-muted))]">
              Name
            </label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-page))] px-3 py-2 text-sm text-[hsl(var(--color-fg))] outline-none ring-[hsl(var(--color-accent))] focus:border-transparent focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="mb-1 block text-xs font-medium text-[hsl(var(--color-fg-muted))]">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-page))] px-3 py-2 text-sm text-[hsl(var(--color-fg))] outline-none ring-[hsl(var(--color-accent))] focus:border-transparent focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="mb-1 block text-xs font-medium text-[hsl(var(--color-fg-muted))]">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-page))] px-3 py-2 text-sm text-[hsl(var(--color-fg))] outline-none ring-[hsl(var(--color-accent))] focus:border-transparent focus:ring-2"
            />
            <p className="mt-1 text-xs text-[hsl(var(--color-fg-muted))]">At least 8 characters.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[hsl(var(--color-accent))] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[hsl(var(--color-fg-muted))]">
          Already have an account?{" "}
          <Link to="/auth/login" className="font-medium text-[hsl(var(--color-accent))] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
