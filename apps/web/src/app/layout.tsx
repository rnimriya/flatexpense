import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SplitNest | The Ultimate Roommate OS",
  description: "Financial harmony for shared living. Split expenses, manage chores, and track bills effortlessly.",
  keywords: ["roommate", "expense sharing", "chores", "apartment", "split bills"],
  openGraph: {
    title: "SplitNest | The Ultimate Roommate OS",
    description: "Financial harmony for shared living. Split expenses, manage chores, and track bills effortlessly.",
    url: "https://splitnest.example.com",
    siteName: "SplitNest",
    images: [
      {
        url: "https://splitnest.example.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "SplitNest Dashboard",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SplitNest | The Ultimate Roommate OS",
    description: "Financial harmony for shared living. Split expenses, manage chores, and track bills effortlessly.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`dark ${jakarta.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col">
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
