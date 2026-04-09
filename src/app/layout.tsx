import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enabling physical AI at scale",
  description:
    "Enabling physical AI at scale",
  metadataBase: new URL("https://fern.bot"),
  openGraph: {
    title: "Enabling physical AI at scale",
    description:
      "Enabling physical AI at scale",
    url: "https://fern.bot",
    siteName: "fern.bot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enabling physical AI at scale",
    description:
      "Enabling physical AI at scale",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#fafafa]">{children}</body>
    </html>
  );
}
