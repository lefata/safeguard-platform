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
import { Shield } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-school flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-school-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-school-300/20 rounded-full blur-3xl" />
      </div>
      
      <Card className="w-full max-w-md shadow-school-elevated border-0 animate-fade-in relative z-10 backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-school-600 to-school-800 flex items-center justify-center shadow-xl ring-4 ring-school-100">
              <Shield className="h-9 w-9 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight text-school-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to access your school dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4 border border-red-100">
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
              <Label htmlFor="password" className="text-sm font-medium text-school-900">Password</Label>
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
              <span className="bg-white px-3 text-muted-foreground font-medium">
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
        </CardContent>
        <CardFooter className="justify-center border-t border-school-border pt-6">
          <p className="text-xs text-muted-foreground text-center">
            Secured by <span className="font-semibold text-school-600">Safeguard Platform</span>
            <br />
            © {new Date().getFullYear()} All rights reserved
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
