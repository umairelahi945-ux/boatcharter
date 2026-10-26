import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import horizonLogo from "@/assets/horizon-boat-charters-logo.png";
import { Button } from "@/components/ui/button";
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_HREF } from "@/lib/contact-info";
import { NAVIGATION_SECTIONS } from "@/lib/navigation-content";

const MENU_SECTIONS = ["destinations"] as const;
const navLinkClass =
  "relative whitespace-nowrap py-2 text-[14px] font-medium text-[#102541] transition-colors after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:origin-left after:scale-x-0 after:bg-[#00afd0] after:transition-transform hover:text-[#009fbd] hover:after:scale-x-100 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00afd0] focus-visible:ring-offset-4 focus-visible:ring-offset-white";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Keep the page in place behind the mobile drawer and keep keyboard focus inside it.
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const scrollY = window.scrollY;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    const menuButton = menuButtonRef.current;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        menuButton?.focus();
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.removeEventListener("keydown", onKeyDown);
      window.scrollTo(0, scrollY);
      menuButton?.focus();
    };
  }, [open]);

  const closeDrawer = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-sky-950/10 bg-white/95 backdrop-blur-md">
      <div className="container-page flex h-24 items-center justify-between gap-2 sm:gap-3">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-1.5 sm:gap-2"
          aria-label="Horizon Boat Charters home"
        >
          <img
            src={horizonLogo}
            alt="Horizon Boat Charters logo for boat and yacht charter services"
            title="Horizon Boat Charters – Boat & Yacht Charters"
            className="h-10 w-auto object-contain sm:h-16 xl:h-[5.5rem]"
          />
          <span aria-hidden="true" className="translate-y-1 text-[#064576] sm:translate-y-2">
            <span className="block text-[1rem] leading-none font-bold tracking-[0.025em] sm:text-[1.5rem] xl:text-[2rem]">
              HORIZON
            </span>
            <span className="mt-1 block text-[0.625rem] leading-none font-normal tracking-[0.178em] sm:mt-1.5 sm:text-[0.875rem] xl:text-[1rem]">
              BOAT CHARTERS
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden flex-1 items-center justify-center lg:flex"
        >
          <ul className="flex items-center gap-2">
            <li>
              <Link to="/" className={navLinkClass} activeProps={{ className: "text-primary" }}>
                Home
              </Link>
            </li>
            {MENU_SECTIONS.map((sectionSlug) => (
              <li key={sectionSlug}>
                <DesktopDropdown sectionSlug={sectionSlug} />
              </li>
            ))}
            <li>
              <Link
                to="/gallery"
                className={navLinkClass}
                activeProps={{ className: "text-primary" }}
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                to="/$section"
                params={{ section: "about" }}
                className={navLinkClass}
                activeProps={{ className: "text-primary" }}
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={navLinkClass}
                activeProps={{ className: "text-primary" }}
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={BUSINESS_PHONE_HREF}
            aria-label={`Call Horizon Boat Charters at ${BUSINESS_PHONE_DISPLAY}`}
            className="hidden items-center gap-1.5 whitespace-nowrap rounded-sm text-[13px] font-medium text-[#102541] transition-colors hover:text-[#009fbd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00afd0] focus-visible:ring-offset-4 focus-visible:ring-offset-white md:inline-flex xl:text-sm"
          >
            <Phone aria-hidden="true" className="size-4 shrink-0" />
            <span>{BUSINESS_PHONE_DISPLAY}</span>
          </a>
          <Button
            asChild
            size="sm"
            className="hidden rounded-lg border-0 bg-[#D19413] px-3 font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#C68D15] active:bg-[#BE8512] focus-visible:ring-2 focus-visible:ring-[#D19413] focus-visible:ring-offset-2 sm:inline-flex sm:px-4"
          >
            <Link to="/become-a-partner">Become a Partner</Link>
          </Button>

          <Button
            ref={menuButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls={open ? "mobile-navigation-dialog" : undefined}
            onClick={() => setOpen(true)}
            className="size-11 shrink-0 text-[#102541] hover:bg-sky-50 hover:text-[#009fbd] lg:hidden"
          >
            <Menu className="size-6" />
          </Button>
        </div>
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[100] lg:hidden">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={closeDrawer}
                className="absolute inset-0 z-0 h-full w-full cursor-default bg-slate-950/70 backdrop-blur-sm"
              />
              <div
                ref={drawerRef}
                id="mobile-navigation-dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Site navigation"
                className="absolute inset-y-0 right-0 z-10 flex w-[88%] max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <span className="font-display text-lg font-semibold text-slate-900">
                    Boat Charter
                  </span>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    aria-label="Close navigation"
                    onClick={closeDrawer}
                    className="flex size-11 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <nav aria-label="Mobile navigation" className="flex-1 p-4">
                  <ul className="flex flex-col gap-1">
                    <li>
                      <MobileLink to="/" onClick={closeDrawer}>
                        Home
                      </MobileLink>
                    </li>
                    {MENU_SECTIONS.map((sectionSlug) => (
                      <MobileDisclosure
                        key={sectionSlug}
                        sectionSlug={sectionSlug}
                        onNavigate={closeDrawer}
                      />
                    ))}
                    <li>
                      <MobileLink to="/gallery" onClick={closeDrawer}>
                        Gallery
                      </MobileLink>
                    </li>
                    <li>
                      <MobileLink to="/about" onClick={closeDrawer}>
                        About Us
                      </MobileLink>
                    </li>
                    <li>
                      <MobileLink to="/contact" onClick={closeDrawer}>
                        Contact Us
                      </MobileLink>
                    </li>
                    <li>
                      <MobileLink to="/become-a-partner" onClick={closeDrawer}>
                        Become a Partner
                      </MobileLink>
                    </li>
                  </ul>
                  <a
                    href={BUSINESS_PHONE_HREF}
                    aria-label={`Call Horizon Boat Charters at ${BUSINESS_PHONE_DISPLAY}`}
                    className="mt-4 flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-[#102541] transition-colors hover:bg-sky-50 hover:text-[#009fbd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00afd0]"
                  >
                    <Phone aria-hidden="true" className="size-4 shrink-0" />
                    <span>{BUSINESS_PHONE_DISPLAY}</span>
                  </a>
                  <Button
                    asChild
                    size="lg"
                    className="mt-5 w-full border-0 bg-[#D19413] text-white hover:bg-[#C68D15] active:bg-[#BE8512] focus-visible:ring-[#D19413]"
                  >
                    <Link to="/fleet" onClick={closeDrawer}>
                      Book Now
                    </Link>
                  </Button>
                </nav>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}

function DesktopDropdown({ sectionSlug }: { sectionSlug: (typeof MENU_SECTIONS)[number] }) {
  const section = NAVIGATION_SECTIONS[sectionSlug];
  const [expanded, setExpanded] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);
  const menuId = `desktop-${sectionSlug}-submenu`;
  if (!section) return null;

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setExpanded(false);
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setExpanded(false);
      groupRef.current?.querySelector("button")?.focus();
    }
  }

  return (
    <div
      ref={groupRef}
      className="relative flex items-center gap-0.5"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setExpanded(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setExpanded(false);
      }}
      onFocusCapture={() => setExpanded(true)}
      onBlurCapture={onBlur}
      onKeyDown={onKeyDown}
    >
      <Link
        to={`/${sectionSlug}` as never}
        className={navLinkClass}
        activeProps={{ className: "text-primary" }}
        onClick={() => setExpanded(false)}
      >
        {section.label}
      </Link>
      <button
        type="button"
        aria-label={`${section.label} menu`}
        aria-expanded={expanded}
        aria-controls={menuId}
        onClick={() => setExpanded((value) => !value)}
        className="flex size-6 items-center justify-center rounded text-[#476078] transition-colors hover:text-[#009fbd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00afd0]"
      >
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <ul
        id={menuId}
        aria-label={`${section.label} links`}
        className={`absolute top-full left-1/2 z-50 grid w-[42rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/10 transition duration-150 sm:grid-cols-3 ${expanded ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}
      >
        {section.categories.map((category) => (
          <li key={category.slug}>
            <Link
              to={`/${sectionSlug}/${category.slug}` as never}
              onClick={() => setExpanded(false)}
              className="block rounded-lg px-3 py-2 text-sm text-[#243a52] transition-colors hover:bg-sky-50 hover:text-[#008eaa] focus-visible:bg-sky-50 focus-visible:text-[#008eaa] focus-visible:outline-none"
            >
              {category.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileDisclosure({
  sectionSlug,
  onNavigate,
}: {
  sectionSlug: (typeof MENU_SECTIONS)[number];
  onNavigate: () => void;
}) {
  const section = NAVIGATION_SECTIONS[sectionSlug];
  if (!section) return null;
  return (
    <li>
      <details className="group rounded-lg">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-lg px-4 text-base font-medium text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 [&::-webkit-details-marker]:hidden">
          {section.label}
          <ChevronDown className="size-4 text-slate-500 transition-transform group-open:rotate-180" />
        </summary>
        <ul className="pb-2 pl-3">
          <li>
            <MobileLink to={`/${sectionSlug}` as never} onClick={onNavigate}>
              Explore {section.label}
            </MobileLink>
          </li>
          {section.categories.map((category) => (
            <li key={category.slug}>
              <MobileLink
                to={`/${sectionSlug}/${category.slug}` as never}
                onClick={onNavigate}
                nested
              >
                {category.label}
              </MobileLink>
            </li>
          ))}
        </ul>
      </details>
    </li>
  );
}

function MobileLink({
  to,
  onClick,
  children,
  nested = false,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
  nested?: boolean;
}) {
  return (
    <Link
      to={to as never}
      onClick={onClick}
      className={`flex min-h-11 items-center rounded-lg px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${nested ? "pl-7" : ""}`}
    >
      {children}
    </Link>
  );
}
