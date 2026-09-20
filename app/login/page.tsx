import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export default function LoginPage() { return <div className="auth-page"><div><p className="eyebrow">Private access</p><h1>Sign in to IGP administration.</h1><p>Catalogue management is restricted to authorised administrators and editors.</p><LoginForm /><Link href="/">Return to public catalogue</Link></div></div>; }
