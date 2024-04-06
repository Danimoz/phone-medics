import type { Metadata } from "next";
import SideNav from "@/components/elements/sidebar";

export const metadata: Metadata = {
  title: "Dashboard - Phone Medics",
  description: "Generated by create next app",
};

export default function DahsboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-1 flex flex-col gap-4 p-4 min-h-screen">{children}</div>
    </div>
  );
}
