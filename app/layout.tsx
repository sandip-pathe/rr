import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./auth/AuthContext";
import { PageHeadingProvider } from "./auth/PageHeadingContext";
import { cn } from "@/lib/utils";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Research Repo Web App",
  description: "CRM for college",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-[#1f1f1e] font-sans antialiased",
          fontSans.variable
        )}
      >
        <div id="modal-root"></div>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <PageHeadingProvider>{children}</PageHeadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
