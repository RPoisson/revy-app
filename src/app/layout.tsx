//revy-quiz/src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Playfair_Display, Inter } from "next/font/google";
import { ProjectProvider } from "@/context/ProjectContext";
import { AppNav } from "@/components/AppNav";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Rêvy — Design, made smarter",
  description: "Discover your French-California interior StyleDNA.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
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
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body>
        <ProjectProvider>
          <div className="min-h-screen flex flex-col">
            <AppNav />
            <div className="flex-1">{children}</div>
          </div>
        </ProjectProvider>
      </body>
    </html>
  );
}