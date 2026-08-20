import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Anchor, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff Sign In — Boat Charter" },
      {
        name: "description",
        content: "Sign in to the Boat Charter operations console to manage fleet, bookings and payments.",
      },
      { property: "og:title", content: "Staff Sign In — Boat Charter" },
      { property: "og:description", content: "Access the Boat Charter operations console." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function afterAuth() {
    await router.invalidate();
    navigate({ to: "/admin", replace: true });
  }

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await afterAuth();
  }

  async function signUp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. You can sign in now.");
    await afterAuth();
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    await afterAuth();
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
          Sign in to manage the fleet, bookings, payments and finances.
        </p>

        <Tabs defaultValue="signin" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={signIn} className="mt-4 space-y-4">
              <Fields
                email={email}
                password={password}
                onEmail={setEmail}
                onPassword={setPassword}
              />
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : null} Sign in
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUp} className="mt-4 space-y-4">
              <Fields
                email={email}
                password={password}
                onEmail={setEmail}
                onPassword={setPassword}
              />
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : null} Create account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <Button variant="outline" size="lg" className="w-full" onClick={google}>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}

function Fields({
  email,
  password,
  onEmail,
  onPassword,
}: {
  email: string;
  password: string;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="auth-email">Email</Label>
        <Input
          id="auth-email"
          type="email"
          required
          value={email}
          onChange={(event) => onEmail(event.target.value)}
          maxLength={255}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="auth-password">Password</Label>
        <Input
          id="auth-password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => onPassword(event.target.value)}
        />
      </div>
    </>
  );
}
