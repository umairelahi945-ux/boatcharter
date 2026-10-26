import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Anchor,
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  LifeBuoy,
  LoaderCircle,
  MessageCircle,
  SlidersHorizontal,
} from "lucide-react";
import { useRef, useState } from "react";

import heroYacht from "@/assets/hero-yacht.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BOAT_CATEGORIES } from "@/lib/money";
import { submitPartnerApplication } from "@/lib/partner.functions";

const pageUrl = "https://horizonboatcharters.com/become-a-partner";
const pageTitle = "Become a Boat Charter Partner | Horizon Boat Charters";
const pageDescription =
  "Partner with Horizon Boat Charters to showcase your boat, share your charter rates and services, and explore boat charter partnership opportunities.";

export const Route = createFileRoute("/become-a-partner")({
  head: () => {
    const heroImageUrl = new URL(heroYacht, "https://horizonboatcharters.com/").href;
    return {
      meta: [
        { title: pageTitle },
        { name: "description", content: pageDescription },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: pageTitle },
        { property: "og:description", content: pageDescription },
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Horizon Boat Charters" },
        { property: "og:image", content: heroImageUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: pageTitle },
        { name: "twitter:description", content: pageDescription },
        { name: "twitter:image", content: heroImageUrl },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: pageTitle,
            description: pageDescription,
            url: pageUrl,
            isPartOf: {
              "@type": "WebSite",
              name: "Horizon Boat Charters",
              url: "https://horizonboatcharters.com/",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://horizonboatcharters.com/",
              },
              { "@type": "ListItem", position: 2, name: "Become a Partner", item: pageUrl },
            ],
          }),
        },
      ],
    };
  },
  component: BecomePartnerPage,
});

type ApplicationForm = {
  boatTitle: string;
  category: string;
  capacity: string;
  additionalPaxCharge: string;
  hourlyCharge: string;
  bookingWithSnacks: string;
  bookingWithoutSnacks: string;
  minimumBookingHours: string;
  captainName: string;
  companyName: string;
  email: string;
  contactNumber: string;
  website: string;
};

const emptyForm: ApplicationForm = {
  boatTitle: "",
  category: "",
  capacity: "",
  additionalPaxCharge: "",
  hourlyCharge: "",
  bookingWithSnacks: "",
  bookingWithoutSnacks: "",
  minimumBookingHours: "",
  captainName: "",
  companyName: "",
  email: "",
  contactNumber: "",
  website: "",
};

const benefits = [
  {
    icon: Anchor,
    title: "Showcase your boat",
    description:
      "Share your vessel and charter services with people exploring boat rental options.",
  },
  {
    icon: CalendarCheck2,
    title: "Explore booking opportunities",
    description: "Make your boat visible for relevant charter enquiries and booking requests.",
  },
  {
    icon: SlidersHorizontal,
    title: "Share your charter options",
    description: "Tell us your capacity, hourly rate, snack options, and minimum booking time.",
  },
  {
    icon: MessageCircle,
    title: "Connect with our team",
    description: "Send your details directly to our team for partnership review and follow-up.",
  },
];

const requiredText: Partial<Record<keyof ApplicationForm, string>> = {
  boatTitle: "Enter your boat's title.",
  category: "Choose a boat category.",
  bookingWithSnacks: "Choose whether you offer bookings with snacks.",
  bookingWithoutSnacks: "Choose whether you offer bookings without snacks.",
  captainName: "Enter the captain's name.",
  companyName: "Enter your company name.",
};

function validateForm(form: ApplicationForm) {
  const errors: Record<string, string> = {};
  for (const [field, error] of Object.entries(requiredText)) {
    if (!form[field as keyof ApplicationForm].trim()) errors[field] = error!;
  }
  if (form.boatTitle.trim().length > 120) errors["boatTitle"] = "Use 120 characters or fewer.";
  if (form.captainName.trim().length > 120) errors["captainName"] = "Use 120 characters or fewer.";
  if (form.companyName.trim().length > 160) errors["companyName"] = "Use 160 characters or fewer.";

  const capacity = Number(form.capacity);
  if (
    !/^\d+$/.test(form.capacity) ||
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 500
  ) {
    errors["capacity"] = "Enter a whole number between 1 and 500.";
  }
  for (const field of ["additionalPaxCharge", "hourlyCharge"] as const) {
    const value = form[field];
    const amount = Number(value);
    if (!/^\d+(?:\.\d{1,2})?$/.test(value) || !Number.isFinite(amount) || amount > 1_000_000) {
      errors[field] = "Enter a non-negative USD amount with up to two decimal places.";
    }
  }
  const minimumHours = Number(form.minimumBookingHours);
  if (!/^\d+$/.test(form.minimumBookingHours) || minimumHours < 1 || minimumHours > 168) {
    errors["minimumBookingHours"] = "Enter a whole number of hours between 1 and 168.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()) || form.email.length > 255) {
    errors["email"] = "Enter a valid email address.";
  }
  if (
    form.contactNumber.trim().length < 7 ||
    form.contactNumber.trim().length > 30 ||
    !/^[+]?[-\d\s().]+$/.test(form.contactNumber.trim())
  ) {
    errors["contactNumber"] =
      "Enter a valid contact number, including area or country code if needed.";
  }
  return errors;
}

function BecomePartnerPage() {
  const [form, setForm] = useState<ApplicationForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  function update<K extends keyof ApplicationForm>(field: K, value: ApplicationForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setFeedback(null);
  }

  function scrollToForm() {
    const section = document.getElementById("partner-registration");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(
      () => formRef.current?.querySelector<HTMLElement>("input,button")?.focus(),
      400,
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    setFeedback(null);
    if (Object.keys(nextErrors).length) {
      window.requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    setPending(true);
    try {
      const result = await submitPartnerApplication({
        data: {
          ...form,
          boatTitle: form.boatTitle.trim(),
          captainName: form.captainName.trim(),
          companyName: form.companyName.trim(),
          email: form.email.trim(),
          contactNumber: form.contactNumber.trim(),
        },
      });
      if (!result.success) {
        if ("errors" in result && result.errors) {
          const serverErrors: Record<string, string> = {};
          for (const [field, messages] of Object.entries(result.errors)) {
            if (messages?.[0]) serverErrors[field] = messages[0];
          }
          setErrors(serverErrors);
        }
        setFeedback({
          kind: "error",
          message:
            "error" in result
              ? result.error
              : "Please review the highlighted fields and try again.",
        });
        return;
      }

      setForm(emptyForm);
      setErrors({});
      setFeedback({
        kind: "success",
        message:
          "Thank you for your interest in partnering with Horizon Boat Charters. Your application has been submitted successfully. Our team will review your details and contact you if further information is needed.",
      });
    } catch {
      setFeedback({
        kind: "error",
        message:
          "We couldn't submit your application right now. Your details are still here; please try again shortly.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <section className="container-page pt-6 sm:pt-8">
        <div className="relative isolate flex min-h-[34rem] items-center overflow-hidden rounded-3xl bg-[#102541] px-6 py-14 shadow-luxe sm:min-h-[39rem] sm:px-12 lg:px-16">
          <img
            src={heroYacht}
            alt="A yacht cruising on open blue water"
            width={1600}
            height={900}
            fetchPriority="high"
            className="absolute inset-0 -z-20 size-full object-cover object-center"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071629]/95 via-[#0a2340]/80 to-[#0a2340]/30" />
          <div className="max-w-3xl text-white">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-[0.16em] text-white/90 uppercase backdrop-blur-sm">
              <Anchor className="size-3.5" aria-hidden="true" /> Partner with Horizon
            </p>
            <h1 className="mt-6 font-display text-4xl leading-tight font-semibold text-white sm:text-5xl lg:text-6xl">
              Become a Boat Charter Partner with Horizon Boat Charters
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-relaxed font-medium text-white sm:text-2xl">
              Grow Your Boat Charter Business with More Booking Opportunities
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Partner with Horizon Boat Charters to showcase your boat, share your charter
              experiences, and connect with customers looking for memorable boating experiences.
              Submit your vessel and charter details to start your partnership enquiry.
            </p>
            <Button
              type="button"
              size="lg"
              onClick={scrollToForm}
              className="mt-8 h-12 rounded-xl bg-[#D19413] px-7 font-semibold text-white shadow-lg transition hover:bg-[#C68D15] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#102541]"
            >
              Register Your Boat <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20" aria-labelledby="partner-benefits-heading">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            A thoughtful partnership
          </p>
          <h2
            id="partner-benefits-heading"
            className="mt-3 font-display text-3xl font-semibold sm:text-4xl"
          >
            A clear way to introduce your charter
          </h2>
          <p className="mt-4 text-muted-foreground">
            Share the details that help our team understand your boat, your services, and the
            charter options you offer.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="partner-registration"
        className="scroll-mt-8 bg-[#eef4f7] py-16 sm:py-20"
        aria-labelledby="partner-form-heading"
      >
        <div className="container-page grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Start a conversation
            </p>
            <h2
              id="partner-form-heading"
              className="mt-3 font-display text-3xl font-semibold sm:text-4xl"
            >
              Register Your Boat with Horizon Boat Charters
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Tell us about your boat and charter services. Our team will review your submission and
              contact you regarding potential partnership opportunities.
            </p>
            <div className="mt-7 space-y-4 text-sm text-muted-foreground">
              <p className="flex items-start gap-3">
                <BadgeCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />{" "}
                Provide your boat details and charter options.
              </p>
              <p className="flex items-start gap-3">
                <LifeBuoy className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /> Our
                team will review your partnership enquiry.
              </p>
              <p className="flex items-start gap-3">
                <CircleDollarSign
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />{" "}
                Share rates in USD, consistent with our charter listings.
              </p>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              Want to ask a question first?{" "}
              <Link
                to="/contact"
                className="font-semibold text-[#007f9c] underline underline-offset-4"
              >
                Contact our team
              </Link>{" "}
              or{" "}
              <Link
                to="/fleet"
                className="font-semibold text-[#007f9c] underline underline-offset-4"
              >
                explore our boat listings
              </Link>
              .
            </p>
          </div>

          <form
            ref={formRef}
            onSubmit={submit}
            noValidate
            className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8"
          >
            <p className="mb-6 text-sm text-muted-foreground">
              <span className="text-destructive">*</span> Required fields
            </p>
            {feedback ? (
              <p
                className={`mb-6 rounded-xl border p-4 text-sm leading-6 ${feedback.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-destructive/25 bg-destructive/5 text-destructive"}`}
                role={feedback.kind === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {feedback.kind === "success" ? (
                  <CheckCircle2
                    className="mr-2 inline size-5 align-text-bottom"
                    aria-hidden="true"
                  />
                ) : null}
                {feedback.message}
              </p>
            ) : null}

            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <FormField label="Boat Title" name="boatTitle" error={errors["boatTitle"]}>
                <Input
                  id="boatTitle"
                  name="boatTitle"
                  value={form.boatTitle}
                  onChange={(event) => update("boatTitle", event.target.value)}
                  placeholder="e.g. Sea Breeze"
                  maxLength={120}
                  required
                  aria-invalid={Boolean(errors["boatTitle"])}
                  aria-describedby={errors["boatTitle"] ? "boatTitle-error" : undefined}
                />
              </FormField>

              <FormField label="Category" name="category" error={errors["category"]}>
                <Select value={form.category} onValueChange={(value) => update("category", value)}>
                  <SelectTrigger
                    id="category"
                    aria-label="Category"
                    aria-required="true"
                    aria-invalid={Boolean(errors["category"])}
                    aria-describedby={errors["category"] ? "category-error" : undefined}
                  >
                    <SelectValue placeholder="Select a boat category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOAT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="No. of Pax (Max)" name="capacity" error={errors["capacity"]}>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="500"
                  step="1"
                  value={form.capacity}
                  onChange={(event) => update("capacity", event.target.value)}
                  placeholder="e.g. 8"
                  required
                  aria-invalid={Boolean(errors["capacity"])}
                  aria-describedby={errors["capacity"] ? "capacity-error" : undefined}
                />
              </FormField>

              <FormField
                label="Additional Pax Charges per Person (USD)"
                name="additionalPaxCharge"
                error={errors["additionalPaxCharge"]}
              >
                <Input
                  id="additionalPaxCharge"
                  name="additionalPaxCharge"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="1000000"
                  step="0.01"
                  value={form.additionalPaxCharge}
                  onChange={(event) => update("additionalPaxCharge", event.target.value)}
                  placeholder="e.g. 25.00"
                  required
                  aria-invalid={Boolean(errors["additionalPaxCharge"])}
                  aria-describedby={
                    errors["additionalPaxCharge"] ? "additionalPaxCharge-error" : undefined
                  }
                />
              </FormField>

              <FormField
                label="Per Hour Charges (USD)"
                name="hourlyCharge"
                error={errors["hourlyCharge"]}
              >
                <Input
                  id="hourlyCharge"
                  name="hourlyCharge"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="1000000"
                  step="0.01"
                  value={form.hourlyCharge}
                  onChange={(event) => update("hourlyCharge", event.target.value)}
                  placeholder="e.g. 250.00"
                  required
                  aria-invalid={Boolean(errors["hourlyCharge"])}
                  aria-describedby={errors["hourlyCharge"] ? "hourlyCharge-error" : undefined}
                />
              </FormField>

              <FormField
                label="Booking with Snacks"
                name="bookingWithSnacks"
                error={errors["bookingWithSnacks"]}
              >
                <AvailabilitySelect
                  id="bookingWithSnacks"
                  value={form.bookingWithSnacks}
                  onChange={(value) => update("bookingWithSnacks", value)}
                  error={errors["bookingWithSnacks"]}
                />
              </FormField>

              <FormField
                label="Booking without Snacks"
                name="bookingWithoutSnacks"
                error={errors["bookingWithoutSnacks"]}
              >
                <AvailabilitySelect
                  id="bookingWithoutSnacks"
                  value={form.bookingWithoutSnacks}
                  onChange={(value) => update("bookingWithoutSnacks", value)}
                  error={errors["bookingWithoutSnacks"]}
                />
              </FormField>

              <FormField
                label="Minimum Booking Hours"
                name="minimumBookingHours"
                error={errors["minimumBookingHours"]}
              >
                <Input
                  id="minimumBookingHours"
                  name="minimumBookingHours"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="168"
                  step="1"
                  value={form.minimumBookingHours}
                  onChange={(event) => update("minimumBookingHours", event.target.value)}
                  placeholder="e.g. 2"
                  required
                  aria-invalid={Boolean(errors["minimumBookingHours"])}
                  aria-describedby={
                    errors["minimumBookingHours"] ? "minimumBookingHours-error" : undefined
                  }
                />
              </FormField>

              <FormField label="Captain Name" name="captainName" error={errors["captainName"]}>
                <Input
                  id="captainName"
                  name="captainName"
                  autoComplete="name"
                  value={form.captainName}
                  onChange={(event) => update("captainName", event.target.value)}
                  placeholder="Captain's full name"
                  maxLength={120}
                  required
                  aria-invalid={Boolean(errors["captainName"])}
                  aria-describedby={errors["captainName"] ? "captainName-error" : undefined}
                />
              </FormField>

              <FormField label="Company Name" name="companyName" error={errors["companyName"]}>
                <Input
                  id="companyName"
                  name="companyName"
                  autoComplete="organization"
                  value={form.companyName}
                  onChange={(event) => update("companyName", event.target.value)}
                  placeholder="Your company or charter business"
                  maxLength={160}
                  required
                  aria-invalid={Boolean(errors["companyName"])}
                  aria-describedby={errors["companyName"] ? "companyName-error" : undefined}
                />
              </FormField>

              <FormField label="Email" name="email" error={errors["email"]}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="you@example.com"
                  maxLength={255}
                  required
                  aria-invalid={Boolean(errors["email"])}
                  aria-describedby={errors["email"] ? "email-error" : undefined}
                />
              </FormField>

              <FormField label="Contact No." name="contactNumber" error={errors["contactNumber"]}>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  autoComplete="tel"
                  value={form.contactNumber}
                  onChange={(event) => update("contactNumber", event.target.value)}
                  placeholder="Include your country or area code"
                  maxLength={30}
                  required
                  aria-invalid={Boolean(errors["contactNumber"])}
                  aria-describedby={errors["contactNumber"] ? "contactNumber-error" : undefined}
                />
              </FormField>
            </div>

            <div className="absolute -left-[10000px]" aria-hidden="true">
              <Label htmlFor="partner-website">Leave this field blank</Label>
              <Input
                id="partner-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(event) => update("website", event.target.value)}
              />
            </div>

            <p className="mt-6 text-xs leading-5 text-muted-foreground">
              We’ll use the details you submit to review your partnership enquiry and contact you
              about it. By submitting this form, you confirm these details are accurate and that we
              may contact you about this application.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={pending}
              className="mt-6 h-12 w-full rounded-xl bg-[#D19413] font-semibold text-white hover:bg-[#C68D15] focus-visible:ring-2 focus-visible:ring-[#D19413] focus-visible:ring-offset-2 sm:w-auto sm:min-w-72"
            >
              {pending ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden="true" />{" "}
                  Submitting application...
                </>
              ) : (
                <>
                  Submit Partnership Application{" "}
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>
        </div>
      </section>

      <section
        className="container-page py-12 text-center"
        aria-label="More about Horizon Boat Charters"
      >
        <p className="mx-auto max-w-3xl text-sm leading-6 text-muted-foreground">
          Interested in a boat owners partnership or learning how charter bookings work? Read{" "}
          <Link
            to="/how-it-works"
            className="font-medium text-[#007f9c] underline underline-offset-4"
          >
            how it works
          </Link>
          , browse our{" "}
          <Link to="/fleet" className="font-medium text-[#007f9c] underline underline-offset-4">
            boat charter listings
          </Link>
          , or{" "}
          <Link to="/contact" className="font-medium text-[#007f9c] underline underline-offset-4">
            contact our team
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

function FormField({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}{" "}
        <span className="text-destructive" aria-hidden="true">
          *
        </span>
      </Label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function AvailabilitySelect({
  id,
  value,
  onChange,
  error,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error: string | undefined;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        aria-label={id === "bookingWithSnacks" ? "Booking with Snacks" : "Booking without Snacks"}
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <SelectValue placeholder="Choose availability" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Available">Available</SelectItem>
        <SelectItem value="Not Available">Not Available</SelectItem>
      </SelectContent>
    </Select>
  );
}
