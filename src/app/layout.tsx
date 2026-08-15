import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

// Matches the original design system's type pairing: Barlow Condensed for
// headings/kickers, plain Barlow for body text.
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "IT Asset Registry",
  description: "IT asset management tool",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="flex min-h-full bg-background text-foreground">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
