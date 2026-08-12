import type { InputHTMLAttributes } from 'react';
import styles from './ui.module.css';
export function Input({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className={styles.field}><span className={styles.label}>{label}</span><input className={styles.input} {...props}/></label>; }

