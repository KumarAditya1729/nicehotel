const BRAND = "Nice Hotel & Restaurant";
const GOLD = "#bfa15a";
const CHARCOAL = "#2b2b2b";
const ADDRESS = "Near Chugli Ghar, Mansa, Punjab 151505";
const PHONE = "+91 92164 00005";

function shell(title: string, bodyRows: string, intro: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f1e8;font-family:Georgia,'Times New Roman',serif;color:${CHARCOAL}">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:${CHARCOAL};color:#fff;padding:28px 32px;border-radius:14px 14px 0 0;text-align:center">
      <div style="letter-spacing:3px;font-size:12px;color:${GOLD};text-transform:uppercase">Premium Hospitality · Mansa, Punjab</div>
      <div style="font-size:26px;margin-top:6px">${BRAND}</div>
    </div>
    <div style="background:#fff;padding:32px;border:1px solid #ece3cf">
      <h1 style="font-size:22px;margin:0 0 8px;color:${CHARCOAL}">${title}</h1>
      <p style="font-size:15px;line-height:1.6;color:#555;margin:0 0 20px">${intro}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${bodyRows}</table>
    </div>
    <div style="background:#faf6ec;padding:20px 32px;border:1px solid #ece3cf;border-top:none;border-radius:0 0 14px 14px;text-align:center;font-size:12px;color:#888">
      <div style="color:${GOLD};font-size:13px;letter-spacing:1px">${BRAND}</div>
      <div style="margin-top:6px">${ADDRESS}</div>
      <div>${PHONE} · nicehotelandrestaurant@gmail.com</div>
    </div>
  </div></body></html>`;
}

function row(label: string, value?: string) {
  if (!value) return "";
  return `<tr><td style="padding:8px 0;color:#999;width:40%;vertical-align:top;text-transform:uppercase;font-size:11px;letter-spacing:1px">${label}</td><td style="padding:8px 0;color:${CHARCOAL}">${value}</td></tr>`;
}

export type BookingData = {
  name: string; email: string; phone: string;
  checkIn?: string; checkOut?: string; guests?: string; roomType?: string; requests?: string;
};

export function bookingGuestEmail(d: BookingData) {
  const rows = row("Guest", d.name) + row("Room", d.roomType) + row("Check-in", d.checkIn) +
    row("Check-out", d.checkOut) + row("Guests", d.guests) + row("Phone", d.phone) + row("Requests", d.requests);
  return shell("Your reservation request is received",
    `Dear ${d.name}, thank you for choosing ${BRAND}. We have received your reservation request and our concierge will contact you shortly at ${d.phone} to confirm availability.`,
    rows);
}

export function bookingAdminEmail(d: BookingData) {
  const rows = row("Guest", d.name) + row("Email", d.email) + row("Phone", d.phone) +
    row("Room", d.roomType) + row("Check-in", d.checkIn) + row("Check-out", d.checkOut) +
    row("Guests", d.guests) + row("Requests", d.requests);
  return shell("New booking request", "A new reservation request was submitted on the website.", rows);
}

export type ContactData = { name: string; email: string; phone?: string; message: string };

export function contactGuestEmail(d: ContactData) {
  return shell("We received your message",
    `Dear ${d.name}, thank you for reaching out to ${BRAND}. Our team will respond to you soon.`,
    row("Your message", d.message));
}

export function contactAdminEmail(d: ContactData) {
  const rows = row("Name", d.name) + row("Email", d.email) + row("Phone", d.phone) + row("Message", d.message);
  return shell("New contact enquiry", "A new message was submitted via the contact form.", rows);
}

export type ReceiptData = {
  name: string; email: string; amount: string; reference?: string; description?: string;
};

export function paymentReceiptEmail(d: ReceiptData) {
  const rows = row("Name", d.name) + row("Amount Paid", d.amount) + row("Reference", d.reference) + row("Details", d.description);
  return shell("Payment receipt",
    `Dear ${d.name}, thank you for your payment to ${BRAND}. This email confirms your transaction.`,
    rows);
}

export function paymentAdminEmail(d: ReceiptData) {
  const rows = row("Name", d.name) + row("Email", d.email) + row("Amount", d.amount) + row("Reference", d.reference) + row("Details", d.description);
  return shell("New payment received", "A payment was completed on the website.", rows);
}
