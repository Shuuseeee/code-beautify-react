import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/i18n/context";
import { Analytics } from "@vercel/analytics/react";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "Code Beautify",
  description: "Format and beautify HTML, CSS, JavaScript, and JSON code online. Supports diff view, ServiceNow syntax highlighting, and more.",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (t === 'dark' || (!t && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <I18nProvider>
          <ClientLayout>{children}</ClientLayout>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
