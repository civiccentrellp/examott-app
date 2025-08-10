import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Poppins } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Toaster } from "sonner";
import { UserProvider } from "@/context/userContext";
import QueryProvider from "@/providers/QueryProvider";
import { LoaderProvider } from "@/context/LoaderContext";
import Script from "next/script";
import { RealtimeWrapper } from "@/components/RealtimeWrapper";



// const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Optional: include needed weights
  display: "swap",
});


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

      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Examott" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      {/* <body className={inter.className}> */}
      <body className={poppins.className}>
        <QueryProvider>
          <UserProvider>
            <LoaderProvider>
              <RealtimeWrapper />
              {children}
              <Toaster position="top-right" offset={60} />
            </LoaderProvider>
          </UserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
