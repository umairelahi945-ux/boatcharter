import { Link } from "@tanstack/react-router";
import { Anchor, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { to: "/fleet", label: "Explore Yachts" },
  { to: "/destinations", label: "Destinations" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock background scrolling (and iOS Safari rubber-banding) while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const scrollY = window.scrollY;
    const returnFocus = menuButtonRef.current;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (
        event.shiftKey &&
        (document.activeElement === first || !panel.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !panel.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    const onBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    window.addEventListener("keydown", onKeyDown);
    desktopQuery.addEventListener("change", onBreakpointChange);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.removeEventListener("keydown", onKeyDown);
      desktopQuery.removeEventListener("change", onBreakpointChange);
      window.scrollTo(0, scrollY);
      if (returnFocus?.isConnected) returnFocus.focus();
    };
  }, [open]);

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
              activeProps={{ className: "text-primary", "aria-current": "page" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild variant="default" size="sm">
            <Link to="/fleet">Book a charter</Link>
          </Button>
        </div>

        <Button
          ref={menuButtonRef}
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(true)}
          className="size-11 text-white hover:bg-white/10 hover:text-primary md:hidden"
        >
          <Menu className="size-6" />
        </Button>
      </div>

      {/* Mobile drawer: backdrop + panel. Both live above the page content and
          swallow every pointer event so the page underneath is inert. */}
      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[100] md:hidden">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="absolute inset-0 z-0 h-full w-full cursor-default bg-slate-950/70 backdrop-blur-sm"
              />
              <div
                ref={panelRef}
                id="mobile-nav"
                role="dialog"
                aria-modal="true"
                aria-label="Site navigation"
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
                className="absolute inset-y-0 right-0 z-10 flex w-[82%] max-w-sm flex-col overflow-y-auto bg-white shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <span className="font-display text-lg font-semibold text-slate-900">
                    Boat Charter
                  </span>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => setOpen(false)}
                    className="flex size-11 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-1 p-4">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[48px] items-center rounded-lg px-4 text-base font-medium text-slate-800 transition-colors hover:bg-slate-100 hover:text-slate-950"
                      activeProps={{
                        className: "bg-slate-100 text-slate-950",
                        "aria-current": "page",
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    to="/fleet"
                    onClick={() => setOpen(false)}
                    className="mt-3 flex min-h-[48px] items-center justify-center rounded-lg bg-slate-900 px-4 text-base font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    Book a charter
                  </Link>
                </nav>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
