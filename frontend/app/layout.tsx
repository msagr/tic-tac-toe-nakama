import "./globals.css";
import { NavBar } from "@/components/Navbar";

export const metadata = {
  title: "XOXO Multiplayer",
  description: "Nakama + Next.js + Phaser",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
