//revy-quiz/src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { AnswersProvider } from "@/context/AnswersContext";
import { AppNav } from "@/components/AppNav";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Rêvy — Design, made smarter",
  description: "Discover your French-California interior StyleDNA.",
  icons: {
    icon: [
      { url: `${basePath}/icon.png?v=4`, type: "image/png", sizes: "32x32" },
    ],
    shortcut: `${basePath}/icon.png?v=4`,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-sans" style={{ fontFamily: "var(--font-inter), ui-sans-serif, sans-serif" }}>
      <head>
        <link rel="icon" href={`${basePath}/icon.png`} type="image/png" sizes="32x32" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: ":root{--font-playfair:'Playfair Display',serif;--font-inter:'Inter',ui-sans-serif,sans-serif}" }} />
      </head>
      <body>
        <AuthProvider>
          <ProjectProvider>
            <AnswersProvider>
              <div className="min-h-screen flex flex-col">
                <AppNav />
                <div className="flex-1">{children}</div>
              </div>
            </AnswersProvider>
          </ProjectProvider>
        </AuthProvider>
      </body>
    </html>
  );
}