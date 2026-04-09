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
  title: "fern.bot — Developer Infrastructure for Robotics",
  description:
    "Inference, training, observability, and voice APIs for robots. An applied research lab backed by Y Combinator (W26).",
  metadataBase: new URL("https://fern.bot"),
  openGraph: {
    title: "fern.bot — Developer Infrastructure for Robotics",
    description:
      "Inference, training, observability, and voice APIs for robots.",
    url: "https://fern.bot",
    siteName: "fern.bot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "fern.bot — Developer Infrastructure for Robotics",
    description:
      "Inference, training, observability, and voice APIs for robots.",
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
