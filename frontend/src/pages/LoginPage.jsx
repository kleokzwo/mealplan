import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";

export default function LoginPage({ onAuthSuccess }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.token) {
        onAuthSuccess(result.token);
      }

      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      navigate("/");
    } catch (err) {
      setError(err?.data?.error || err.message || "Login fehlgeschlagen");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Einloggen</h1>
      <p className="mt-2 text-sm text-slate-500">
        Schön, dass du wieder da bist.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">E-Mail</label>
          <input
            type="email"
            autoComplete="email"
            data-testid="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 p-3"
            placeholder="name@beispiel.de"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Passwort</label>
          <input
            type="password"
            autoComplete="current-password"
            data-testid="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 p-3"
            placeholder="Dein Passwort"
            required
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="login-submit"
          className="w-full rounded-2xl bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Loggt ein..." : "Einloggen"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Noch kein Konto?{" "}
        <Link to="/register" className="font-medium text-black underline">
          Konto erstellen
        </Link>
      </div>
    </div>
  );
}