import { Link } from "@tanstack/react-router";
import { Anchor, Mail, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 surface-navy">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/40">
              <Anchor className="size-4.5" />
            </span>
            <span className="font-display text-lg font-semibold">Boat Charter</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/60">
            Curated yachts, catamarans and speedboats with vetted captains across the coast.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li>
              <Link to="/fleet" className="hover:text-primary">
                Explore Fleet
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-primary">
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">Charter desk</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-primary" /> +1 (305) 555 0100
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-primary" /> concierge@boatcharter.example
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">Operations</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li>
              <Link to="/admin" className="hover:text-primary">
                Admin Dashboard
              </Link>
            </li>
            <li>Secure card payments only</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-6 text-xs text-white/45">
          © {new Date().getFullYear()} Boat Charter. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
