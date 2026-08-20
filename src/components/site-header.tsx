import { Link } from "@tanstack/react-router";
import { Anchor, Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { to: "/fleet", label: "Explore Fleet" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 surface-navy backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/40">
            <Anchor className="size-4.5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight md:text-xl">
            Boat Charter
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-white/70 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild variant="default" size="sm">
            <Link to="/admin">
              <ShieldCheck className="size-4" />
              Admin Dashboard
            </Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              className="text-white hover:bg-white/10 hover:text-primary"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="surface-navy border-white/10">
            <SheetTitle className="px-4 pt-4 font-display text-lg text-white">
              Boat Charter
            </SheetTitle>
            <nav className="mt-6 flex flex-col gap-1 px-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-4 py-3 text-base font-medium text-white/80 hover:bg-white/5 hover:text-primary"
                  activeProps={{ className: "text-primary" }}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="mt-4 mx-2" onClick={() => setOpen(false)}>
                <Link to="/admin">
                  <ShieldCheck className="size-4" />
                  Admin Dashboard
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
