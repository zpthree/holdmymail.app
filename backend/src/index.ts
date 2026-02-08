import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";
import { senderRoutes } from "./routes/sender";
import { emailRoutes } from "./routes/email";
import { mailRoutes } from "./routes/mail";
import { digestRoutes } from "./routes/digest";
import { linkRoutes } from "./routes/link";
import { tagRoutes } from "./routes/tag";
import { buildDigestHtml } from "./emails/digest";

const app = new Hono();

// CORS — allow the SvelteKit frontend and Chrome extension
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

// Base routes
app.get("/", (c) => c.text("Welcome to Hold My Mail!"));
app.get("/health", (c) => c.json({ status: "ok" }));

// Email template preview (dev only)
app.get("/preview/digest", (c) => {
  const sampleEmails = [
    {
      subject: "🚀 This Week in JavaScript",
      fromName: "Syntax.fm",
      fromEmail: "crew@syntax.fm",
      date: new Date().toISOString(),
      tags: ["dev"],
    },
    {
      subject: "Your Weekly Design Digest",
      fromName: "Sidebar",
      fromEmail: "newsletter@sidebar.io",
      date: new Date(Date.now() - 3600000).toISOString(),
      tags: ["design"],
    },
    {
      subject: "Node.js Security Update",
      fromName: "Node Weekly",
      fromEmail: "peter@cooperpress.com",
      date: new Date(Date.now() - 7200000).toISOString(),
      tags: ["dev"],
    },
    {
      subject: "Important: Confirm your subscription",
      fromName: "Adam Wathan",
      fromEmail: "adam@tailwindcss.com",
      date: new Date(Date.now() - 86400000).toISOString(),
      tags: ["design"],
    },
    {
      subject: "Fwd: Shop cordless tools from Festool",
      fromName: "Zach Patrick",
      fromEmail: "zach@example.com",
      date: new Date(Date.now() - 172800000).toISOString(),
      tags: [],
    },
  ];

  const html = buildDigestHtml(sampleEmails, new Date(), "weekly");
  return c.html(html);
});

// Mount route groups
app.route("/auth", authRoutes);
app.route("/sender", senderRoutes);
app.route("/email", emailRoutes);
app.route("/mail", mailRoutes);
app.route("/digest", digestRoutes);
app.route("/link", linkRoutes);
app.route("/tag", tagRoutes);

export default {
  port: 3000,
  fetch: app.fetch.bind(app),
};

console.log("🚀 Server running at http://localhost:3000");
