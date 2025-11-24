"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "../app/Landing.module.css";
import { useUser } from "@/lib/hook/UserContext";

type NavLink = {
  href: string;
  label: string;
};

const links: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/mode-select", label: "Play" },
];

function NavUserAvatar({
  username,
  onClick,
}: {
  username: string;
  onClick?: () => void;
}) {
  const initial = username.trim().charAt(0).toUpperCase() || "?";

  return (
    <button
      type="button"
      className={styles.navUserAvatar}
      aria-label={username}
      title={username}
      onClick={onClick}
    >
      <span className={styles.navUserAvatarInitial}>{initial}</span>
    </button>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const hideOnRoutes = [
    "/multiplayer/waiting",
    "/multiplayer/game",
  ];

  if (hideOnRoutes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

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
            <div className={styles.navUserMenuWrapper}>
              <NavUserAvatar
                username={user.username as string}
                onClick={() => setIsUserMenuOpen((open) => !open)}
              />
              {isUserMenuOpen && (
                <div className={styles.navUserMenuDropdown}>
                    <div className={styles.navUserMenuHeader}>
                    <div className={styles.navUserMenuLabel}>Signed in as</div>
                    <div className={styles.navUserMenuName}>
                        {user.username as string}
                    </div>
                    </div>

                    <button
                    type="button"
                    className={styles.navUserMenuItem}
                    onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                    }}
                    >
                    Logout
                    </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
