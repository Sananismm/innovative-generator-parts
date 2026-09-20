"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {} as FormState);
  return <form className="login-form" action={action}><label>Email<input type="email" name="email" autoComplete="email" required /></label><label>Password<input type="password" name="password" autoComplete="current-password" required /></label>{state.error && <p role="alert" className="form-message error">{state.error}</p>}<button className="button button-primary" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button><p>Password reset delivery is available once an approved email provider is configured.</p></form>;
}
