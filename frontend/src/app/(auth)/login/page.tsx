"use client";

import type { Metadata } from "next";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AnimatedBackground } from "./components/AnimatedBackground";
import { LoginCard } from "./components/LoginCard";
import { SplashOverlay } from "./components/SplashOverlay";
import { useAnimatedRays } from "./hooks/useAnimatedRays";
import { useBodyClass } from "./hooks/useBodyClass";
import { useSplashSequence } from "./hooks/useSplashSequence";
import { useWaterRippleCleanup } from "./hooks/useWaterRippleCleanup";
import type { LoginError, LoginSuccess } from "./types";
import "./styles.css";

const LOGIN_PATH = "/api/login/";
const shouldUseApiLogin = process.env.NEXT_PUBLIC_ENABLE_LOGIN_API === "true";

export const metadata: Metadata = {
  title: "SERVIGENMAN — Portal Interno",
  description: "Portal interno de SERVIGENMAN para el personal autorizado de la compañía.",
};

export default function LoginPage() {
  useBodyClass();
  useAnimatedRays();
  useSplashSequence();
  useWaterRippleCleanup();

  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<LoginSuccess | null>(null);

  const apiBaseUrl = useMemo(() => {
    const sanitizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

    const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (envUrl) {
      return sanitizeBaseUrl(envUrl);
    }

    if (typeof window !== "undefined") {
      return `${window.location.origin}`;
    }

    return "";
  }, []);

  const loginUrl = `${apiBaseUrl}${LOGIN_PATH}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const sanitizedUsername = username.trim();
    const hasPassword = password.trim().length > 0;

    if (!sanitizedUsername || !hasPassword) {
      setErrorMessage("Por favor ingresa tu usuario y contraseña.");
      setSuccess(null);
      return;
    }

    setErrorMessage(null);

    if (!shouldUseApiLogin) {
      setSuccess({
        message: "Inicio de sesión exitoso.",
        user: {
          username: sanitizedUsername,
          first_name: "",
          last_name: "",
          email: "",
        },
      });
      return;
    }

    setLoading(true);
    setSuccess(null);

    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username: sanitizedUsername, password }),
      });

      let payload: LoginSuccess | LoginError | null = null;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const message =
          (payload && "error" in payload && payload.error) ||
          "No pudimos validar tus credenciales. Inténtalo nuevamente.";
        setErrorMessage(message);
        return;
      }

      if (payload && "message" in payload) {
        setSuccess(payload as LoginSuccess);
        return;
      }

      setSuccess({
        message: "Inicio de sesión exitoso.",
        user: {
          username: sanitizedUsername,
          first_name: "",
          last_name: "",
          email: "",
        },
      });
    } catch {
      setErrorMessage(
        "Ocurrió un error inesperado. Verifica tu conexión e inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!success || typeof window === "undefined") {
      return;
    }

    try {
      const sanitizedTokens = success.tokens
        ? Object.fromEntries(
            Object.entries(success.tokens).filter(([, value]) =>
              value !== undefined && value !== null
            )
          )
        : null;

      if (sanitizedTokens && Object.keys(sanitizedTokens).length > 0) {
        window.localStorage.setItem(
          "auth0Tokens",
          JSON.stringify(sanitizedTokens)
        );
      }

      window.localStorage.setItem("auth0User", JSON.stringify(success.user));
    } catch {
      // Ignored: storage is best-effort only.
    }
  }, [success]);

  useEffect(() => {
    if (success) {
      router.push("/inicio");
    }
  }, [router, success]);

  return (
    <>
      <AnimatedBackground />
      <LoginCard
        username={username}
        password={password}
        loading={loading}
        errorMessage={errorMessage}
        success={success}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
      />
      <SplashOverlay />
    </>
  );
}
