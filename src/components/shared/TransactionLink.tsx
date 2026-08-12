import styles from './ui.module.css';
export function TransactionLink({hash,href}:{hash:string;href:string}){return <a className={styles.tx} href={href} target="_blank" rel="noreferrer" title={hash}>{hash.slice(0,10)}…{hash.slice(-8)} ↗</a>}
