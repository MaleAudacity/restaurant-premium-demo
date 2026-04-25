import type { Metadata } from "next";

import { LiveRefresh } from "@/components/ui/live-refresh";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mirch Masala | Premium Restaurant Platform Demo",
  description:
    "A premium multi-surface restaurant platform demo for Mirch Masala with website, dashboard, kitchen board, and WhatsApp-style operations flows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col text-foreground">
        <LiveRefresh />
        {children}
      </body>
    </html>
  );
}
