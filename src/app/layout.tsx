import type { Metadata } from "next";
import { Asap } from "next/font/google";
import "./globals.css";

const asap = Asap({
  variable: "--font-asap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stickylynx Online",
  description: "The premium public page builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${asap.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
