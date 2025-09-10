import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import SplashCursor from "@/components/SplashCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hi Chat - Transform Your Business Communication",
  description:
    "Comprehensive SaaS platform for startups and growing businesses. Streamline operations with integrated Customer Support, Project Management, Email Marketing, HR, Accounting & Finance, and Cyber Security.",
  keywords:
    "SaaS platform, business communication, CRM, project management, customer support, email marketing, startup tools",
  authors: [{ name: "Hi Chat Team" }],
  creator: "Hi Chat",
  publisher: "Hi Chat",
  robots: "index, follow",
  openGraph: {
    title: "Hi Chat - Transform Your Business Communication",
    description:
      "Comprehensive SaaS platform for startups and growing businesses",
    url: "https://hichat.com",
    siteName: "Hi Chat",
    images: [
      {
        url: "/assets/hichat-logo.png",
        width: 800,
        height: 600,
        alt: "Hi Chat Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hi Chat - Transform Your Business Communication",
    description:
      "Comprehensive SaaS platform for startups and growing businesses",
    images: ["/assets/hichat-logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if toasters should be shown
  const shouldShowToasters = process.env.NEXT_PUBLIC_SHOW_TOASTERS === "on";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 overflow-auto`}
      >
        {/* <SplashCursor /> */}

        {children}

        {/* Conditionally render ToastContainer based on environment variable */}
        {shouldShowToasters && (
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            aria-label="Notifications"
          />
        )}
      </body>
    </html>
  );
}
