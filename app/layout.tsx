import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import type { ReactNode } from "react";
import NavBar from "./NavBar";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "700"] });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif", weight: ["500", "600"] });

export const metadata: Metadata = {
  title: "EcoPlate",
  description: "Turn leftover ingredients into meals and waste less food.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <NavBar />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}