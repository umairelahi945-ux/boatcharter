import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";

import horizonLogo from "@/assets/horizon-boat-charters-logo.png";
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_HREF } from "@/lib/contact-info";

export function SiteFooter() {
  return (
    <footer className="mt-24 surface-navy">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src={horizonLogo}
              alt=""
              aria-hidden="true"
              className="h-9 w-auto object-contain brightness-0 invert"
            />
            <span className="flex flex-col items-start whitespace-nowrap text-white">
              <span className="block text-[1.125rem] leading-none font-bold tracking-[0.025em]">
                HORIZON
              </span>
              <span className="mt-1 block text-[0.625rem] leading-none font-normal tracking-[0.178em]">
                BOAT CHARTERS
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/60">
            High Tech Services LLC
            <br />
            1001 S Main St STE 500
            <br />
            Kalispell, MT 59901
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li>
              <Link to="/fleet" className="hover:text-primary">
                Explore Yachts
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-primary">
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/become-a-partner" className="hover:text-primary">
                Become a Partner
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
            <li>
              <a
                href={BUSINESS_PHONE_HREF}
                aria-label={`Call Horizon Boat Charters at ${BUSINESS_PHONE_DISPLAY}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]"
              >
                <Phone aria-hidden="true" className="size-4 text-primary" />
                {BUSINESS_PHONE_DISPLAY}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              <a href="mailto:contact@horizonboatcharters.com">contact@horizonboatcharters.com</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">Good to know</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li>Secure card payments only</li>
            <li>20% deposit at booking, balance due before departure</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-6 text-center text-xs text-white/45">
          © {new Date().getFullYear()} Horizon Boat Charter. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
