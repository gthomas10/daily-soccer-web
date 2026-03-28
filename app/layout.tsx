import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dailysoccerreport.com"),
  title: "Daily Soccer Report",
  description: "Your daily soccer briefing — every league, every result, every FPL angle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <a
          href="https://www.instagram.com/daily.soccer.report/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-accent-emerald px-4 py-2.5 text-center text-sm font-medium text-text-on-dark transition-opacity hover:opacity-90"
        >
          Follow us on Instagram @daily.soccer.report
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
