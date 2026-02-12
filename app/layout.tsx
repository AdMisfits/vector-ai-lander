import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vector Algorithmics — Automated Trading That Profits In Any Market",
  description:
    "Market-neutral trading algorithms that capture gains whether markets rise or fall. No leverage, US-regulated execution. Talk to our AI to learn more.",
  other: {
    "viewport": "width=device-width, initial-scale=1, viewport-fit=cover",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        {children}
        <script
          src="https://links.vectoralgorithmics.io/js/form_embed.js"
          async
        />
      </body>
    </html>
  );
}
