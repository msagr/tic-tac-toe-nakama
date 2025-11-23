"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../app/Landing.module.css";
import { useUser } from "@/lib/hook/UserContext";

type NavLink = {
  href: string;
  label: string;
};

const links: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/mode-select", label: "Play" },
  { href: "/multiplayer", label: "Multiplayer" },
  { href: "/tictactoe", label: "Vs Computer" },
];

function NavUserAvatar({ username }: { username: string }) {
  const initial = username.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className={styles.navUserAvatar} aria-label={username} title={username}>
      <span className={styles.navUserAvatarInitial}>{initial}</span>
    </div>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <header className={styles.navRoot}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.navBrand}>
          <span className={styles.navLogo}>XOXO</span>
          <span className={styles.navBrandText}>Multiplayer</span>
        </Link>

        <nav className={styles.navLinks}>
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${
                  isActive ? styles.navLinkActive : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.navAuth}>
           {!user ? (
            <>
                <Link href="/login" className={styles.navAuthLink}>
                    Log in
                </Link>
                <Link href="/register" className={styles.navAuthPrimary}>
                    Sign up
                </Link>
            </>
            ) : (
                <NavUserAvatar username={user.username as string} />
            )}
        </div>
      </div>
    </header>
  );
}
