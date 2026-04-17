// frontend/src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";

export default function RegisterPage() {
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
      const normalizedEmail = email.trim().toLowerCase();

      await registerUser({
        email: normalizedEmail,
        password,
      });

      navigate("/verify-email", {
        state: { email: normalizedEmail },
      });
    } catch (err) {
      setError(err?.data?.error || err.message || "Registrierung fehlgeschlagen");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Konto erstellen</h1>
      <p className="mt-2 text-sm text-slate-500">
        Wir schicken dir einen Bestätigungscode per E-Mail.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">E-Mail</label>
          <input
            type="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 p-3"
            placeholder="Mindestens 6 Zeichen"
            required
            minLength={6}
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Sendet Code..." : "Code senden"}
        </button>
      </form>
    </div>
  );
}