import StyledComponentsRegistry from "@dodao/web-core/utils/StyledComponentsRegistry";
import { NotificationProvider } from "@dodao/web-core/ui/contexts/NotificationContext";
import { CSSProperties, ReactNode } from "react";
import "./globals.scss";
import "tailwindcss/tailwind.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const style = {
    "--primary-color": "#7f7f7f",
    "--primary-text-color": "#fff",
    "--bg-color": "#fff",
    "--text-color": "#000",
    "--link-color": "#000",
    "--heading-color": "#000",
    "--border-color": "#000",
    "--block-bg": "#fff",
  } as CSSProperties;

  return (
    <html lang="en" className="h-full">
      <body
        className={"max-h-screen"}
        style={{ ...style, backgroundColor: "var(--bg-color)" }}
      >
        <StyledComponentsRegistry>
          <NotificationProvider>{children}</NotificationProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
