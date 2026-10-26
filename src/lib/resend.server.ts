type OutgoingEmail = {
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendResendEmail(email: OutgoingEmail) {
  const apiKey = process.env["RESEND_API_KEY"]?.trim();
  const from = process.env["EMAIL_FROM"]?.trim();
  if (!apiKey || !from) return { ok: false as const, status: 503 };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email.to],
        reply_to: email.replyTo,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok ? { ok: true as const } : { ok: false as const, status: 502 };
  } catch {
    return { ok: false as const, status: 502 };
  }
}
