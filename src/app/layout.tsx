import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./school-theme.css";
import { Providers } from "./providers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SafeGuard | Modern School Platform",
  description: "Professional K-12 Student Safeguarding & Wellbeing Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
