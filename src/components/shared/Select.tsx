import type { SelectHTMLAttributes } from 'react';
import styles from './ui.module.css';
export function Select({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) { return <label className={styles.field}><span className={styles.label}>{label}</span><select className={styles.select} {...props}>{children}</select></label>; }

