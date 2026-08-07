"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, ShieldCheck, HeartHandshake, ClipboardCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ===== Left: Brand / Graphic Panel ===== */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative flex-col justify-between overflow-hidden bg-gradient-to-br from-school-950 via-school-900 to-school-800 text-white px-12 py-12">
        {/* Signature crest-lattice graphic */}
        <div className="absolute inset-0 bg-crest-lattice pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-school-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-school-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-school-gold to-school-gold-light flex items-center justify-center shadow-lg">
            <Shield className="h-6 w-6 text-school-900" />
          </div>
          <div>
            <p className="text-lg font-display font-semibold tracking-tight leading-none">SafeGuard</p>
            <p className="text-xs text-school-300 mt-0.5">School Platform</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="font-display text-3xl xl:text-4xl leading-tight font-medium">
            Every student, seen. Every concern, followed through.
          </p>
          <p className="mt-4 text-school-200 text-sm leading-relaxed">
            One place for pastoral teams to log concerns, track wellbeing, and
            keep every safeguarding case moving — with a clear record at every step.
          </p>

          <div className="mt-10 space-y-4">
            <FeaturePoint icon={ShieldCheck} label="Secure, audit-logged case records" />
            <FeaturePoint icon={HeartHandshake} label="Whole-school wellbeing visibility" />
            <FeaturePoint icon={ClipboardCheck} label="Built for DSLs and pastoral teams" />
          </div>
        </div>

        <p className="relative z-10 text-xs text-school-400">
          © {new Date().getFullYear()} Safeguard Platform · Trusted by pastoral teams
        </p>
      </div>

      {/* ===== Right: Sign-in Form ===== */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none lg:hidden" />

        <div className="w-full max-w-sm relative z-10 animate-fade-in">
          {/* Mobile-only brand mark */}
          <div className="flex lg:hidden justify-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-school-600 to-school-800 flex items-center justify-center shadow-xl ring-4 ring-school-100">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-medium tracking-tight text-school-900">
              Welcome back
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Sign in to access your school dashboard
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-5 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-school-900">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@school.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-school-border focus:border-school-500 focus:ring-2 focus:ring-school-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-school-900">Password</Label>
                <a href="#" className="text-xs font-medium text-school-600 hover:text-school-700">Forgot password?</a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-12 rounded-xl border-school-border focus:border-school-500 focus:ring-2 focus:ring-school-500/20 transition-all"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-school-600 to-school-700 hover:from-school-700 hover:to-school-800 text-white font-semibold shadow-lg shadow-school-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-school-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-2 border-school-200 hover:bg-school-50 hover:border-school-300 transition-all duration-200"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google Workspace
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-8">
            Secured by <span className="font-semibold text-school-600">Safeguard Platform</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeaturePoint({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-school-gold" />
      </div>
      <p className="text-sm text-school-100">{label}</p>
    </div>
  );
}
