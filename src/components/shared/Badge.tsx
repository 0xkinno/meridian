import type { ReactNode } from 'react';
import styles from './ui.module.css';
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral'|'success'|'error'|'warning' }) { return <span className={`${styles.badge} ${tone !== 'neutral' ? styles[tone] : ''}`}>{children}</span>; }

