import { Link } from "@tanstack/react-router";
import { Anchor } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 surface-navy">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/40">
              <Anchor className="size-4.5" />
            </span>
            <span className="font-display text-lg font-semibold">Boat Charter</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/65">
            Compare vessel details and rates, then send a booking request for your chosen dates.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li>
              <Link to="/fleet" className="hover:text-primary">
                Explore yachts
              </Link>
            </li>
            <li>
              <Link to="/destinations" className="hover:text-primary">
                Destinations
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-primary">
                How it works
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
            Booking details
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li>Hourly and daily rates are shown by vessel.</li>
            <li>The quote includes the service fee and deposit split.</li>
            <li>Review the booking and payment result after you submit.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-6 text-xs text-white/55">
          Copyright © {new Date().getFullYear()} Boat Charter. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
