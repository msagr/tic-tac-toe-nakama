import "./globals.css";
import { NavBar } from "@/components/Navbar";
import { UserProvider } from "@/lib/hook/UserContext";

export const metadata = {
  title: "XOXO Multiplayer",
  description: "Nakama + Next.js + Phaser",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <NavBar />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
