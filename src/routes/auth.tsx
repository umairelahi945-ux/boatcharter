import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Anchor, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { checkAdminEmailEligible } from "@/lib/admin.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Administrator Sign In — Boat Charter" },
      {
        name: "description",
        content:
          "Sign in to the Boat Charter operations console to manage yachts, bookings and payments.",
      },
      { property: "og:title", content: "Administrator Sign In — Boat Charter" },
      { property: "og:description", content: "Access the Boat Charter operations console." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function describeError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  if (normalized.includes("failed to fetch") || normalized.includes("network")) {
    return "Network error — check your connection and try again.";
  }
  return message || "Unable to sign in right now. Please try again later.";
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-4.5">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.8l7.8 6.1C12.3 13.7 17.6 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4.1 7.1-10.2 7.1-17.4z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.1a14.6 14.6 0 0 1 0-8.2l-7.8-6.1a24 24 0 0 0 0 20.4l7.8-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 47.5c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.4 0-11.7-4.2-13.6-10.1l-7.8 6.1C6.5 42.1 14.6 47.5 24 47.5z"
      />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "setup">("signin");

  // If a session already exists (e.g. returning from Google OAuth), go to /admin.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: "/admin", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: "/admin", replace: true });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  async function signInWithGoogle() {
    if (googleLoading || loading) return;
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth`,
        extraParams: { prompt: "select_account" },
      });
      if (result.error) {
        const friendly = describeError(String(result.error.message ?? result.error));
        setError(friendly);
        toast.error(friendly);
        return;
      }
      if (result.redirected) return;
      await router.invalidate();
      navigate({ to: "/admin", replace: true });
    } catch (cause) {
      const friendly = describeError(cause instanceof Error ? cause.message : "");
      setError(friendly);
      toast.error(friendly);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    if (loading || googleLoading) return;
    setError(null);
    setLoading(true);
    try {
      if (mode === "setup") {
        const { eligible } = await checkAdminEmailEligible({ data: { email: email.trim() } });
        if (!eligible) {
          const msg = "This email is not authorized for administrator access.";
          setError(msg);
          toast.error(msg);
          return;
        }
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (signUpError) {
          const friendly = describeError(signUpError.message);
          setError(friendly);
          toast.error(friendly);
          return;
        }
        if (!signUpData.session) {
          toast.success("Check your inbox to confirm your email, then sign in.");
          setMode("signin");
          return;
        }
        await router.invalidate();
        navigate({ to: "/admin", replace: true });
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        const friendly = describeError(signInError.message);
        setError(friendly);
        toast.error(friendly);
        return;
      }
      await router.invalidate();
      navigate({ to: "/admin", replace: true });
    } catch (cause) {
      const friendly = describeError(cause instanceof Error ? cause.message : "");
      setError(friendly);
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-luxe)]">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Anchor className="size-4.5" />
          </span>
          <h1 className="font-display text-2xl font-semibold">Operations console</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Administrator sign in. Access is restricted to authorized accounts.
        </p>

        <form onSubmit={signIn} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={255}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={loading || googleLoading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}{" "}
            {mode === "setup" ? "Create admin password" : "Sign in"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full gap-2.5"
          disabled={loading || googleLoading}
          onClick={signInWithGoogle}
        >
          {googleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </Button>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          {mode === "signin" ? "Authorized administrator without a password? " : "Already set a password? "}
          <button
            type="button"
            className="text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setError(null);
              setMode(mode === "signin" ? "setup" : "signin");
            }}
          >
            {mode === "signin" ? "Set up your account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
