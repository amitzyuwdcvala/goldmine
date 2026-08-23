import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Aurum Desk",
  description: "Manage gold pricing API providers and credentials.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
