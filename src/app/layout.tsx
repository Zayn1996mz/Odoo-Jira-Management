import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Odoo 16 Project Board Generator | Jira/Trello-like Module",
  description:
    "Generate a ready-to-install Odoo 16 Project Management module with Kanban boards, sprints, time tracking, and more — like Jira or Trello.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
