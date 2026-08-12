'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

const links = [
  ['Control', '/'],
  ['Strategies', '/strategies'],
  ['Executions', '/executions'],
  ['Audit', '/audit'],
  ['Marketplace', '/marketplace']
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/" onClick={() => setOpen(false)}>
          Meridian
        </Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          {links.map(([label, href]) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link 
                href={href} 
                key={href} 
                className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <span className={styles.network}>
          <i />Base Sepolia / Testnet
        </span>
        <button 
          className={styles.menuButton} 
          type="button" 
          aria-label="Toggle navigation" 
          aria-expanded={open} 
          onClick={() => setOpen(v => !v)}
        >
          <span />
        </button>
      </header>
      {open && (
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {links.map(([label, href]) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link 
                href={href} 
                key={href} 
                className={isActive ? styles.activeMobileLink : ''}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
