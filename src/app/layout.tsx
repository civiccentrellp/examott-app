import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Toaster } from "sonner";



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ExamOTT",
  description: "Next.js Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        </body>
    </html>
  );
}
