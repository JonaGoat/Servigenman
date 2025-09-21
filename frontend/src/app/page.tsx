"use client";

import { FormEvent, useState } from "react";

type LoginSuccess = {
  message: string;
  user: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
};

type LoginError = {
  error?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<LoginSuccess | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      let payload: LoginSuccess | LoginError | null = null;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const error =
          (payload as LoginError | null)?.error ??
          "No se pudo iniciar sesión. Verifica tus datos e inténtalo nuevamente.";
        setErrorMessage(error);
        return;
      }

      if (payload && "message" in payload) {
        setSuccess(payload as LoginSuccess);
      }
    } catch {
      setErrorMessage(
        "Ocurrió un error inesperado. Verifica tu conexión e inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-semibold text-slate-900 text-center">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Ingresa tus credenciales para acceder a la plataforma.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-600"
              htmlFor="username"
            >
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="tu.usuario"
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-600"
              htmlFor="password"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="••••••••"
            />
          </div>

          {errorMessage && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              <p>{success.message}</p>
              <p className="mt-1">
                Bienvenido, {success.user.first_name || success.user.username}.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          ¿Tienes problemas? Contacta a soporte de la empresa para recuperar tu
          acceso.
        </p>
      </div>
    </main>
  );
}
