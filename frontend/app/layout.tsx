import "./globals.css";

export const metadata = {
  title: "XOXO Multiplayer",
  description: "Nakama + Next.js + Phaser",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
