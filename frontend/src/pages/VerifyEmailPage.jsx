import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resendVerificationCode, verifyEmailCode } from "../api/authApi";

export default function VerifyEmailPage({ onAuthSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = useMemo(() => location.state?.email || "", [location.state]);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setIsSubmitting(true);

    try {
      const result = await verifyEmailCode({
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });

      if (result?.token) {
        onAuthSuccess(result.token);
      }

      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.data?.error || err.message || "Bestätigung fehlgeschlagen");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    setIsResending(true);

    try {
      await resendVerificationCode({
        email: email.trim().toLowerCase(),
      });

      setInfo("Neuer Code wurde gesendet.");
    } catch (err) {
      setError(err?.data?.error || err.message || "Code konnte nicht erneut gesendet werden");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">E-Mail bestätigen</h1>
      <p className="mt-2 text-sm text-slate-500">
        Gib den 6-stelligen Code ein, den wir dir geschickt haben.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">E-Mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 p-3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="mt-2 w-full rounded-xl border border-slate-300 p-3 tracking-[0.35em]"
            placeholder="123456"
            required
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {info ? <p className="text-sm text-green-600">{info}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Bestätigt..." : "Bestätigen"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={isResending}
        className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 disabled:opacity-50"
      >
        {isResending ? "Sendet erneut..." : "Code erneut senden"}
      </button>
    </div>
  );
}