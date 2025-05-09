import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.scss";
import { NotificationProvider } from "@dodao/web-core/ui/contexts/NotificationContext";
import { NotificationWrapper } from "@dodao/web-core/components/layout/NotificationWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <NotificationProvider>
          <>
            <NotificationWrapper />
            {children}
          </>
        </NotificationProvider>
      </body>
    </html>
  );
}
