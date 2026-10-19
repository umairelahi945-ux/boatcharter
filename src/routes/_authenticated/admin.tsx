import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Anchor,
  BadgeDollarSign,
  CalendarCheck,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Ship,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListBoats,
  adminListBookings,
  adminListFinancialHistory,
  adminListFinancialRecords,
  adminListPayments,
  adminGetSettings,
  adminUpdateSettings,
  adminListDestinations,
  adminSaveDestination,
  ADMIN_BOOKING_STATUSES,
  PAYMENT_TRACKING_STATUSES,
  updateBookingTracking,
  createAdjustment,
  createBoat,
  deleteBoat,
  getAdminContext,
  getDashboardStats,
  refundPayment,
  setBoatAvailability,
  updateBoat,
  updateBookingStatus,
  updatePaymentStatus,
} from "@/lib/admin.functions";
import { BOAT_CATEGORIES, formatDateTime, formatMoney } from "@/lib/money";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Boat Charter" },
      { name: "description", content: "Manage yachts, bookings, payments and finances." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type BoatRow = {
  id: string;
  title: string;
  category: string;
  capacity: number;
  length_ft: number;
  hourly_rate_cents: number;
  daily_rate_cents: number;
  location: string;
  description: string;
  amenities: string[];
  image_urls: string[];
  is_available: boolean;
  extra_passenger_charge_cents: number;
  with_snacks_price_cents: number;
  without_snacks_price_cents: number;
  min_booking_hours: number;
  captain_name: string;
  company_name: string;
  contact_email: string;
  contact_phone: string;
};

const emptyForm = {
  title: "",
  category: "Yacht",
  capacity: "8",
  lengthFt: "40",
  hourlyRate: "250",
  dailyRate: "1600",
  location: "",
  description: "",
  amenities: "",
  imageUrls: "",
  isAvailable: true,
  extraPassengerCharge: "0",
  withSnacksPrice: "0",
  withoutSnacksPrice: "0",
  minBookingHours: "2",
  captainName: "",
  companyName: "",
  contactEmail: "",
  contactPhone: "",
};

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const contextFn = useServerFn(getAdminContext);
  const contextQuery = useQuery({ queryKey: ["admin-context"], queryFn: () => contextFn() });




  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (contextQuery.isPending) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (contextQuery.isError) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-destructive">We could not verify your access.</p>
        <Button className="mt-4" onClick={() => contextQuery.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const context = contextQuery.data;

  if (!context.isAdmin) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-14">
        <Card className="max-w-md p-8 text-center">
          <ShieldCheck className="mx-auto size-8 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account is not authorized to access the administrator dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button variant="outline" onClick={signOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Signed in as {context.email}</p>
        </Card>
      </div>
    );
  }


  return (
    <div className="container-page py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Operations
          </p>
          <h1 className="mt-1 text-3xl font-semibold">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {context.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
            <RefreshCcw className="size-4" /> Refresh
          </Button>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </header>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="boats">Boats</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="terms">Terms &amp; Location</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="boats" className="mt-6">
          <BoatsTab />
        </TabsContent>
        <TabsContent value="bookings" className="mt-6">
          <BookingsTab />
        </TabsContent>
        <TabsContent value="payments" className="mt-6">
          <PaymentsTab />
        </TabsContent>
        <TabsContent value="finance" className="mt-6">
          <FinanceTab />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <HistoryTab />
        </TabsContent>
        <TabsContent value="terms" className="mt-6">
          <TermsTab />
        </TabsContent>
        <TabsContent value="destinations" className="mt-6">
          <DestinationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Ship;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

function OverviewTab() {
  const statsFn = useServerFn(getDashboardStats);
  const query = useQuery({ queryKey: ["admin-stats"], queryFn: () => statsFn() });

  if (query.isPending) return <PanelLoading />;
  if (query.isError) return <PanelError onRetry={() => query.refetch()} />;
  const s = query.data;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Net revenue"
        value={formatMoney(s.netRevenueCents)}
        hint="Captured − refunds + adjustments"
        icon={TrendingUp}
      />
      <StatCard
        label="Deposits captured (20%)"
        value={formatMoney(s.paidRevenueCents)}
        hint={`${s.totalPayments} transactions`}
        icon={BadgeDollarSign}
      />
      <StatCard
        label="Outstanding balance (80%)"
        value={formatMoney(s.outstandingBalanceCents)}
        hint={`Deposits due ${formatMoney(s.depositsDueCents)}`}
        icon={Wallet}
      />
      <StatCard
        label="Pending payments"
        value={formatMoney(s.pendingPaymentsCents)}
        hint={`${formatMoney(s.failedPaymentsCents)} failed`}
        icon={Wallet}
      />
      <StatCard
        label="Refunds"
        value={formatMoney(s.refundsCents)}
        hint={`Adjustments ${formatMoney(s.adjustmentsCents)}`}
        icon={RefreshCcw}
      />
      <StatCard
        label="Bookings"
        value={String(s.totalBookings)}
        hint={`${s.confirmedBookings} confirmed · ${s.pendingRequests} pending`}
        icon={CalendarCheck}
      />
      <StatCard
        label="Yachts"
        value={String(s.totalBoats)}
        hint={`${s.availableBoats} available`}
        icon={Ship}
      />
      <StatCard
        label="Booked value"
        value={formatMoney(s.estimatedRevenueCents)}
        hint="Excludes cancellations"
        icon={Anchor}
      />
      <StatCard
        label="Pending requests"
        value={String(s.pendingRequests)}
        hint="Awaiting approval"
        icon={ShieldCheck}
      />
    </div>
  );
}

function BoatsTab() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(adminListBoats);
  const query = useQuery({ queryKey: ["admin-boats"], queryFn: () => listFn() });

  const createFn = useServerFn(createBoat);
  const updateFn = useServerFn(updateBoat);
  const availabilityFn = useServerFn(setBoatAvailability);
  const deleteFn = useServerFn(deleteBoat);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BoatRow | null>(null);
  const [form, setForm] = useState(emptyForm);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-boats"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["boats"] });
  };

  const save = useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      editing
        ? updateFn({ data: { ...payload, id: editing.id } as never })
        : createFn({ data: payload as never }),
    onSuccess: () => {
      toast.success(editing ? "Boat updated." : "Boat added to the yacht listings.");
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "We could not save this boat."),
  });

  const availability = useMutation({
    mutationFn: availabilityFn,
    onSuccess: () => invalidate(),
    onError: () => toast.error("We could not update availability."),
  });

  const remove = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      toast.success("Boat archived.");
      invalidate();
    },
    onError: () => toast.error("We could not archive this boat."),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(boat: BoatRow) {
    setEditing(boat);
    setForm({
      title: boat.title,
      category: boat.category,
      capacity: String(boat.capacity),
      lengthFt: String(boat.length_ft),
      hourlyRate: String(boat.hourly_rate_cents / 100),
      dailyRate: String(boat.daily_rate_cents / 100),
      location: boat.location,
      description: boat.description ?? "",
      amenities: (boat.amenities ?? []).join(", "),
      imageUrls: (boat.image_urls ?? []).join("\n"),
      isAvailable: boat.is_available,
      extraPassengerCharge: String((boat.extra_passenger_charge_cents ?? 0) / 100),
      withSnacksPrice: String((boat.with_snacks_price_cents ?? 0) / 100),
      withoutSnacksPrice: String((boat.without_snacks_price_cents ?? 0) / 100),
      minBookingHours: String(boat.min_booking_hours ?? 2),
      captainName: boat.captain_name ?? "",
      companyName: boat.company_name ?? "",
      contactEmail: boat.contact_email ?? "",
      contactPhone: boat.contact_phone ?? "",
    });
    setOpen(true);
  }

  function submit() {
    if (form.title.trim().length < 2 || form.location.trim().length < 2) {
      toast.error("Title and location are required.");
      return;
    }
    const money = [form.hourlyRate, form.dailyRate, form.extraPassengerCharge, form.withSnacksPrice, form.withoutSnacksPrice];
    if (money.some((v) => !Number.isFinite(Number(v)) || Number(v) < 0)) {
      toast.error("Prices must be zero or more.");
      return;
    }
    if (!Number.isInteger(Number(form.minBookingHours)) || Number(form.minBookingHours) < 1) {
      toast.error("Minimum booking hours must be a whole number of at least 1.");
      return;
    }
    if (form.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.contactEmail.trim())) {
      toast.error("Please enter a valid email.");
      return;
    }
    save.mutate({
      title: form.title.trim(),
      category: form.category,
      capacity: Number(form.capacity),
      lengthFt: Number(form.lengthFt),
      hourlyRateCents: Math.round(Number(form.hourlyRate) * 100),
      dailyRateCents: Math.round(Number(form.dailyRate) * 100),
      location: form.location.trim(),
      description: form.description.trim(),
      amenities: form.amenities
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      imageUrls: form.imageUrls
        .split(/\s*\n\s*/)
        .map((value) => value.trim())
        .filter(Boolean),
      isAvailable: form.isAvailable,
      extraPassengerChargeCents: Math.round(Number(form.extraPassengerCharge) * 100),
      withSnacksPriceCents: Math.round(Number(form.withSnacksPrice) * 100),
      withoutSnacksPriceCents: Math.round(Number(form.withoutSnacksPrice) * 100),
      minBookingHours: Number(form.minBookingHours),
      captainName: form.captainName.trim(),
      companyName: form.companyName.trim(),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
    });
  }

  if (query.isPending) return <PanelLoading />;
  if (query.isError) return <PanelError onRetry={() => query.refetch()} />;
  const boats = (query.data ?? []) as BoatRow[];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Add boat
        </Button>
      </div>

      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Boat</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Passengers</TableHead>
              <TableHead>Captain / Company</TableHead>
              <TableHead>Hourly</TableHead>
              <TableHead>Daily</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boats.map((boat) => (
              <TableRow key={boat.id}>
                <TableCell>
                  <p className="font-medium">{boat.title}</p>
                  <p className="text-xs text-muted-foreground">{boat.location}</p>
                </TableCell>
                <TableCell>{boat.category}</TableCell>
                <TableCell>{boat.capacity}</TableCell>
                <TableCell className="text-xs">
                  <p>{boat.captain_name || "—"}</p>
                  <p className="text-muted-foreground">{boat.company_name}</p>
                </TableCell>
                <TableCell>{formatMoney(boat.hourly_rate_cents)}</TableCell>
                <TableCell>{formatMoney(boat.daily_rate_cents)}</TableCell>
                <TableCell>
                  <Switch
                    checked={boat.is_available}
                    onCheckedChange={(checked) =>
                      availability.mutate({ data: { id: boat.id, isAvailable: checked } })
                    }
                  />
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(boat)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove.mutate({ data: { id: boat.id } })}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {boats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No boats yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogTitle>{editing ? "Edit boat" : "Add boat"}</DialogTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Boat title">
              <Input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </Field>
            <Field label="Category">
              <Select
                value={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOAT_CATEGORIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Number of passengers">
              <Input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(event) => setForm({ ...form, capacity: event.target.value })}
              />
            </Field>
            <Field label="Length (ft)">
              <Input
                type="number"
                min={1}
                value={form.lengthFt}
                onChange={(event) => setForm({ ...form, lengthFt: event.target.value })}
              />
            </Field>
            <Field label="Per-hour charges (USD)">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.hourlyRate}
                onChange={(event) => setForm({ ...form, hourlyRate: event.target.value })}
              />
            </Field>
            <Field label="Daily rate (USD)">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.dailyRate}
                onChange={(event) => setForm({ ...form, dailyRate: event.target.value })}
              />
            </Field>
            <Field label="Additional passenger charge per person (USD)">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.extraPassengerCharge}
                onChange={(event) => setForm({ ...form, extraPassengerCharge: event.target.value })}
              />
            </Field>
            <Field label="Booking with snacks (USD)">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.withSnacksPrice}
                onChange={(event) => setForm({ ...form, withSnacksPrice: event.target.value })}
              />
            </Field>
            <Field label="Booking without snacks (USD)">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.withoutSnacksPrice}
                onChange={(event) => setForm({ ...form, withoutSnacksPrice: event.target.value })}
              />
            </Field>
            <Field label="Minimum booking hours">
              <Input
                type="number"
                min={0}
                step="1"
                value={form.minBookingHours}
                onChange={(event) => setForm({ ...form, minBookingHours: event.target.value })}
              />
            </Field>
            <Field label="Captain name">
              <Input
                type="text"
                value={form.captainName}
                onChange={(event) => setForm({ ...form, captainName: event.target.value })}
              />
            </Field>
            <Field label="Company name">
              <Input
                type="text"
                value={form.companyName}
                onChange={(event) => setForm({ ...form, companyName: event.target.value })}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(event) => setForm({ ...form, contactEmail: event.target.value })}
              />
            </Field>
            <Field label="Contact number">
              <Input
                type="tel"
                value={form.contactPhone}
                onChange={(event) => setForm({ ...form, contactPhone: event.target.value })}
              />
            </Field>
            <Field label="Location" className="sm:col-span-2">
              <Input
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
              />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea
                rows={3}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </Field>
            <Field label="Amenities (comma separated)" className="sm:col-span-2">
              <Input
                value={form.amenities}
                onChange={(event) => setForm({ ...form, amenities: event.target.value })}
              />
            </Field>
            <Field label="Image URLs (one per line)" className="sm:col-span-2">
              <Textarea
                rows={3}
                value={form.imageUrls}
                onChange={(event) => setForm({ ...form, imageUrls: event.target.value })}
              />
            </Field>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                checked={form.isAvailable}
                onCheckedChange={(checked) => setForm({ ...form, isAvailable: checked })}
              />
              <span className="text-sm">Available for booking</span>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={save.isPending}>
              {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save boat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ADMIN_STATUS_LABELS: Record<(typeof ADMIN_BOOKING_STATUSES)[number], string> = {
  inquiry_sent_to_captain: "Inquiry Sent to Captain",
  refused_by_captain: "Refused by the Captain",
  booking_sent_to_customer: "Booking Sent to Customer",
  refused_by_customer: "Refused by the Customer",
  confirmed: "Confirmed",
  confirmation_sent_to_customer: "Confirmation Sent to Customer",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};
const PAYMENT_TRACKING_LABELS: Record<(typeof PAYMENT_TRACKING_STATUSES)[number], string> = {
  pending: "Pending",
  paid: "Paid",
  unpaid: "Unpaid",
};

function DepositInput({
  cents,
  disabled,
  onSave,
}: {
  cents: number;
  disabled: boolean;
  onSave: (cents: number) => void;
}) {
  const [value, setValue] = useState((Number(cents) / 100).toFixed(2));
  const commit = () => {
    const parsed = Math.round(Number(value) * 100);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast.error("Enter a valid deposit amount.");
      setValue((Number(cents) / 100).toFixed(2));
      return;
    }
    if (parsed !== Number(cents)) onSave(parsed);
  };
  return (
    <Input
      type="number"
      min={0}
      step="0.01"
      value={value}
      disabled={disabled}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className="h-8 w-[110px]"
      aria-label="Deposit amount"
    />
  );
}

function BookingsTab() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(adminListBookings);
  const query = useQuery({ queryKey: ["admin-bookings"], queryFn: () => listFn() });
  const trackingFn = useServerFn(updateBookingTracking);

  const mutate = useMutation({
    mutationFn: trackingFn,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("We could not update this booking."),
  });

  if (query.isPending) return <PanelLoading />;
  if (query.isError) return <PanelError onRetry={() => query.refetch()} />;
  const bookings = query.data ?? [];

  return (
    <Card className="overflow-x-auto p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Inquiry #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Boat</TableHead>
            <TableHead>Captain / Company</TableHead>
            <TableHead>Passengers</TableHead>
            <TableHead>Additional Pax</TableHead>
            <TableHead>Window</TableHead>
            <TableHead>Snacks</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Deposit amount</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Remaining balance</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Payment link sent</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-mono text-xs">{booking.reference}</TableCell>
              <TableCell>
                <p className="font-medium">{booking.customer_name}</p>
              </TableCell>
              <TableCell className="text-xs">
                <p>{booking.customer_email}</p>
                <p className="text-muted-foreground">{booking.customer_phone}</p>
              </TableCell>
              <TableCell>
                <p>{booking.boat_title}</p>
                <p className="text-xs text-muted-foreground">{booking.boat_category}</p>
              </TableCell>
              <TableCell className="text-xs">
                <p>{booking.captain_name || "—"}</p>
                <p className="text-muted-foreground">{booking.company_name}</p>
              </TableCell>
              <TableCell className="text-xs whitespace-nowrap">{booking.guest_count}</TableCell>
              <TableCell>
                <Select
                  value={booking.additional_passengers > 0 ? String(booking.additional_passengers) : undefined}
                  disabled={mutate.isPending}
                  onValueChange={(value) =>
                    mutate.mutate({ data: { id: booking.id, additionalPassengers: Number(value) } })
                  }
                >
                  <SelectTrigger className="h-8 w-[80px]">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-xs">
                {formatDateTime(booking.start_date)}
                <br />
                {formatDateTime(booking.end_date)}
              </TableCell>
              <TableCell className="text-xs whitespace-nowrap">
                {booking.snacks_option === "with_snacks" ? "With Snacks" : "Without Snacks"}
              </TableCell>
              <TableCell>{formatMoney(booking.total_price_cents)}</TableCell>
              <TableCell>
                <DepositInput
                  key={`${booking.id}-${booking.deposit_cents}`}
                  cents={booking.deposit_cents}
                  disabled={mutate.isPending}
                  onSave={(cents) => mutate.mutate({ data: { id: booking.id, depositCents: cents } })}
                />
              </TableCell>
              <TableCell>{formatMoney(booking.paid_to_date_cents)}</TableCell>
              <TableCell className="font-medium">
                {formatMoney(booking.remaining_balance_cents)}
              </TableCell>
              <TableCell>
                <Select
                  value={booking.payment_tracking_status}
                  disabled={mutate.isPending}
                  onValueChange={(value) =>
                    mutate.mutate({
                      data: {
                        id: booking.id,
                        paymentTrackingStatus: value as (typeof PAYMENT_TRACKING_STATUSES)[number],
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TRACKING_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {PAYMENT_TRACKING_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-xs whitespace-nowrap">
                  <Switch
                    checked={booking.payment_link_sent}
                    disabled={mutate.isPending}
                    onCheckedChange={(checked) =>
                      mutate.mutate({ data: { id: booking.id, paymentLinkSent: checked } })
                    }
                    aria-label="Payment link sent"
                  />
                  {booking.payment_link_sent ? "Sent" : "Not sent"}
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={booking.admin_status ?? undefined}
                  disabled={mutate.isPending}
                  onValueChange={(value) =>
                    mutate.mutate({
                      data: { id: booking.id, adminStatus: value as (typeof ADMIN_BOOKING_STATUSES)[number] },
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-[220px]">
                    <SelectValue placeholder="Not set" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_BOOKING_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {ADMIN_STATUS_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={16} className="py-10 text-center text-muted-foreground">
                No bookings yet.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Card>
  );
}

function PaymentsTab() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(adminListPayments);
  const query = useQuery({ queryKey: ["admin-payments"], queryFn: () => listFn() });
  const statusFn = useServerFn(updatePaymentStatus);
  const refundFn = useServerFn(refundPayment);

  const onDone = (result: { ok: boolean; message: string }) => {
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    queryClient.invalidateQueries();
  };

  const status = useMutation({
    mutationFn: statusFn,
    onSuccess: onDone,
    onError: () => toast.error("We could not update this payment."),
  });
  const refund = useMutation({
    mutationFn: refundFn,
    onSuccess: onDone,
    onError: () => toast.error("We could not refund this payment."),
  });

  if (query.isPending) return <PanelLoading />;
  if (query.isError) return <PanelError onRetry={() => query.refetch()} />;
  const payments = query.data ?? [];

  return (
    <Card className="overflow-x-auto p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction</TableHead>
            <TableHead>Booking</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="max-w-40 truncate font-mono text-xs">
                {payment.transaction_id}
              </TableCell>
              <TableCell className="font-mono text-xs">{payment.booking_reference}</TableCell>
              <TableCell>{payment.customer_name}</TableCell>
              <TableCell className="text-xs">
                {payment.payment_method_type} •••• {payment.last_four_digits ?? "----"}
              </TableCell>
              <TableCell>{formatMoney(payment.amount_cents)}</TableCell>
              <TableCell>
                <StatusBadge status={payment.payment_status} />
              </TableCell>
              <TableCell className="text-xs">{formatDateTime(payment.created_at)}</TableCell>
              <TableCell className="space-x-2 text-right whitespace-nowrap">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={payment.payment_status === "paid" || status.isPending}
                  onClick={() =>
                    status.mutate({
                      data: { transactionId: payment.transaction_id, status: "paid" },
                    })
                  }
                >
                  Mark paid
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={payment.payment_status !== "paid" || refund.isPending}
                  onClick={() => refund.mutate({ data: { transactionId: payment.transaction_id } })}
                >
                  Refund
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                No payments recorded.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Card>
  );
}

function FinanceTab() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(adminListFinancialRecords);
  const query = useQuery({ queryKey: ["admin-finance"], queryFn: () => listFn() });
  const adjustFn = useServerFn(createAdjustment);

  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"adjustment" | "other">("adjustment");

  const adjust = useMutation({
    mutationFn: adjustFn,
    onSuccess: (result) => {
      toast.success(result.message);
      setAmount("");
      setNotes("");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("We could not record this entry."),
  });

  if (query.isPending) return <PanelLoading />;
  if (query.isError) return <PanelError onRetry={() => query.refetch()} />;
  const records = query.data ?? [];

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="text-base font-semibold">Record a manual entry</h3>
        <p className="text-sm text-muted-foreground">
          Use negative amounts for costs. Entries feed straight into net revenue.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[10rem_10rem_1fr_auto] sm:items-end">
          <Field label="Type">
            <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adjustment">Adjustment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Amount (USD)">
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </Field>
          <Field label="Notes">
            <Input value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} />
          </Field>
          <Button
            disabled={adjust.isPending || !amount || notes.trim().length < 3}
            onClick={() =>
              adjust.mutate({
                data: {
                  amountCents: Math.round(Number(amount) * 100),
                  notes: notes.trim(),
                  type,
                },
              })
            }
          >
            Record
          </Button>
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="text-xs">{formatDateTime(record.transaction_date)}</TableCell>
                <TableCell className="font-mono text-xs">{record.booking_reference}</TableCell>
                <TableCell>{record.customer_name}</TableCell>
                <TableCell className="text-xs capitalize">
                  {String(record.transaction_type).replace("_", " ")}
                </TableCell>
                <TableCell>
                  <StatusBadge status={record.payment_status} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatMoney(record.amount_cents)}
                </TableCell>
                <TableCell className="max-w-64 truncate text-xs text-muted-foreground">
                  {record.notes}
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No financial records yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function HistoryTab() {
  const listFn = useServerFn(adminListFinancialHistory);
  const query = useQuery({ queryKey: ["admin-history"], queryFn: () => listFn() });

  if (query.isPending) return <PanelLoading />;
  if (query.isError) return <PanelError onRetry={() => query.refetch()} />;
  const history = query.data ?? [];

  return (
    <Card className="overflow-x-auto p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Booking</TableHead>
            <TableHead>Boat</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-xs">{formatDateTime(entry.created_at)}</TableCell>
              <TableCell className="font-medium">{entry.event}</TableCell>
              <TableCell className="font-mono text-xs">{entry.booking_reference}</TableCell>
              <TableCell>{entry.boat_title}</TableCell>
              <TableCell>
                <StatusBadge status={entry.status} />
              </TableCell>
              <TableCell className="text-right">{formatMoney(entry.amount_cents)}</TableCell>
              <TableCell className="max-w-64 truncate text-xs text-muted-foreground">
                {entry.notes}
              </TableCell>
            </TableRow>
          ))}
          {history.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                No activity recorded yet.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Card>
  );
}

function TermsTab() {
  const getFn = useServerFn(adminGetSettings);
  const saveFn = useServerFn(adminUpdateSettings);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin-settings"], queryFn: () => getFn() });
  const [draft, setDraft] = useState<{ cancellationPolicy: string; mapLocation: string; mapEmbedUrl: string } | null>(null);
  const save = useMutation({
    mutationFn: saveFn,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setDraft(null);
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (error: Error) => toast.error(error.message || "We could not save these settings."),
  });
  if (query.isPending) return <PanelLoading />;
  if (query.isError) return <PanelError onRetry={() => query.refetch()} />;
  const form = draft ?? query.data;
  return (
    <Card className="space-y-5 p-6">
      <Field label="Cancellation and refund policy">
        <Textarea
          rows={8}
          value={form.cancellationPolicy}
          onChange={(e) => setDraft({ ...form, cancellationPolicy: e.target.value })}
        />
      </Field>
      <Field label="Location (address or place name)">
        <Input value={form.mapLocation} onChange={(e) => setDraft({ ...form, mapLocation: e.target.value })} />
      </Field>
      <Field label="Google Maps embed link">
        <Input
          placeholder="https://www.google.com/maps/embed?pb=..."
          value={form.mapEmbedUrl}
          onChange={(e) => setDraft({ ...form, mapEmbedUrl: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          In Google Maps choose Share → Embed a map, then paste only the link inside src="…".
        </p>
      </Field>
      <div className="flex justify-end">
        <Button disabled={save.isPending} onClick={() => save.mutate({ data: form })}>
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save
        </Button>
      </div>
    </Card>
  );
}

type DestinationRow = {
  id?: string;
  name: string;
  season_start: string;
  season_end: string;
  sort_order: number;
  is_active: boolean;
};

function DestinationsTab() {
  const listFn = useServerFn(adminListDestinations);
  const saveFn = useServerFn(adminSaveDestination);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin-destinations"], queryFn: () => listFn() });
  const [editing, setEditing] = useState<DestinationRow | null>(null);
  const save = useMutation({
    mutationFn: saveFn,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin-destinations"] });
    },
    onError: (error: Error) => toast.error(error.message || "We could not save this destination."),
  });
  if (query.isPending) return <PanelLoading />;
  if (query.isError) return <PanelError onRetry={() => query.refetch()} />;
  const rows = query.data as DestinationRow[];
  const submit = (row: DestinationRow) =>
    save.mutate({
      data: {
        id: row.id,
        name: row.name,
        seasonStart: row.season_start,
        seasonEnd: row.season_end,
        sortOrder: Number(row.sort_order) || 0,
        isActive: row.is_active,
      },
    });
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() =>
            setEditing({ name: "", season_start: "", season_end: "", sort_order: rows.length + 1, is_active: true })
          }
        >
          <Plus className="size-4" /> Add destination
        </Button>
      </div>
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Season</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.sort_order}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  {row.season_start} to {row.season_end}
                </TableCell>
                <TableCell>
                  <Switch checked={row.is_active} onCheckedChange={(checked) => submit({ ...row, is_active: checked })} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(row)}>
                    <Pencil className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No destinations yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogTitle>{editing?.id ? "Edit destination" : "Add destination"}</DialogTitle>
          {editing ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Destination name" className="sm:col-span-2">
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </Field>
              <Field label="Season starts (e.g. December)">
                <Input value={editing.season_start} onChange={(e) => setEditing({ ...editing, season_start: e.target.value })} />
              </Field>
              <Field label="Season ends (e.g. May/June)">
                <Input value={editing.season_end} onChange={(e) => setEditing({ ...editing, season_end: e.target.value })} />
              </Field>
              <Field label="Display order">
                <Input
                  type="number"
                  min={0}
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                />
              </Field>
            </div>
          ) : null}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button disabled={save.isPending} onClick={() => editing && submit(editing)}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const value = status ?? "unknown";
  const className =
    value === "paid" || value === "confirmed"
      ? "bg-success text-success-foreground"
      : value === "failed" || value === "cancelled"
        ? "bg-destructive text-destructive-foreground"
        : value === "refunded"
          ? "bg-secondary text-secondary-foreground"
          : "bg-warning text-warning-foreground";
  return <Badge className={`${className} capitalize`}>{value}</Badge>;
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function PanelLoading() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="size-6 animate-spin text-primary" />
    </div>
  );
}

function PanelError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
      <p className="font-medium text-destructive">We could not load this data.</p>
      <Button variant="outline" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
