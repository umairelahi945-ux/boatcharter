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
      { name: "description", content: "Manage fleet, bookings, payments and finances." },
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
        label="Fleet"
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
      toast.success(editing ? "Boat updated." : "Boat added to the fleet.");
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
    });
    setOpen(true);
  }

  function submit() {
    if (form.title.trim().length < 2 || form.location.trim().length < 2) {
      toast.error("Title and location are required.");
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
              <TableHead>Capacity</TableHead>
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
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
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
            <Field label="Title">
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
            <Field label="Capacity (guests)">
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
            <Field label="Hourly rate (USD)">
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

function BookingsTab() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(adminListBookings);
  const query = useQuery({ queryKey: ["admin-bookings"], queryFn: () => listFn() });
  const statusFn = useServerFn(updateBookingStatus);

  const mutate = useMutation({
    mutationFn: statusFn,
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
            <TableHead>Reference</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Boat</TableHead>
            <TableHead>Window</TableHead>
            <TableHead>Snacks</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Deposit (20%)</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-mono text-xs">{booking.reference}</TableCell>
              <TableCell>
                <p className="font-medium">{booking.customer_name}</p>
                <p className="text-xs text-muted-foreground">{booking.customer_email}</p>
              </TableCell>
              <TableCell>{booking.boat_title}</TableCell>
              <TableCell className="text-xs">
                {formatDateTime(booking.start_date)}
                <br />
                {formatDateTime(booking.end_date)}
              </TableCell>
              <TableCell className="text-xs whitespace-nowrap">
                {booking.snacks_option === "with_snacks" ? "With Snacks" : "Without Snacks"}
              </TableCell>
              <TableCell>{formatMoney(booking.total_price_cents)}</TableCell>
              <TableCell>{formatMoney(booking.deposit_cents)}</TableCell>
              <TableCell>{formatMoney(booking.amount_paid_cents)}</TableCell>
              <TableCell className="font-medium">
                {formatMoney(booking.balance_due_cents)}
              </TableCell>
              <TableCell>
                <StatusBadge status={booking.payment_status} />
              </TableCell>
              <TableCell>
                <StatusBadge status={booking.status} />
              </TableCell>
              <TableCell className="space-x-2 text-right whitespace-nowrap">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={booking.status === "confirmed" || mutate.isPending}
                  onClick={() => mutate.mutate({ data: { id: booking.id, status: "confirmed" } })}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={booking.status === "cancelled" || mutate.isPending}
                  onClick={() => mutate.mutate({ data: { id: booking.id, status: "cancelled" } })}
                >
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
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
