import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../api";
import { useAuth } from "../auth";
import { PageLayout } from "../components/PageLayout";

type AuthMode = "login" | "register";

function AuthPage({ mode }: { mode: AuthMode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const authSwitchPath = mode === "login" ? "/auth/register" : "/auth/login";
  const authSwitchWithReturnPath = returnTo
    ? `${authSwitchPath}?returnTo=${encodeURIComponent(returnTo)}`
    : authSwitchPath;
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries()) as Record<string, unknown>;

    try {
      if (mode === "login") {
        await login(String(values.email), String(values.password));
      } else {
        await register(values);
      }
      const destination = returnTo?.startsWith("/") ? returnTo : "/profile";
      navigate(destination);
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        const details = Object.entries(error.errors)
          .flatMap(([field, messages]) => messages.map((text) => `${field}: ${text}`))
          .join("\n");

        setMessage(`${error.message}\n${details}`);
      } else {
        setMessage(error instanceof Error ? error.message : "Request failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <section className="simple-page auth-card">
        <p className="eyebrow">HOTEL TATOLI</p>
        <h1>{mode === "login" ? "Login" : "Create your profile"}</h1>
        <form className="simple-form" onSubmit={submit}>
          {mode === "register" && <><label>First name<input name="firstName" required /></label><label>Last name<input name="lastName" required /></label><label>Phone<input name="phone" /></label></>}
          <label>Email<input name="email" type="email" required /></label>
          <label>Password<input name="password" type="password" required /></label>
          <button className="search-button" type="submit" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}</button>
        </form>
        {message && <p className="page-message form-error-message">{message}</p>}
        <p className="auth-switch">{mode === "login" ? "No profile yet? " : "Already registered? "}<Link to={authSwitchWithReturnPath}>{mode === "login" ? "Register" : "Login"}</Link></p>
      </section>
    </PageLayout>
  );
}

export function LoginPage() {
  return <AuthPage mode="login" />;
}

export function RegisterPage() {
  return <AuthPage mode="register" />;
}
