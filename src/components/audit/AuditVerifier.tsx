'use client';
import { useState } from 'react';
import styles from './audit.module.css';

export function AuditVerifier({ initial }: { initial: boolean }) {
  const [valid, setValid] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function verify() {
    setBusy(true);
    const r = await fetch('/api/audit');
    const d = await r.json();
    setValid(Boolean(d.verification?.valid));
    setBusy(false);
  }

  async function exportLog() {
    const r = await fetch('/api/audit');
    const d = await r.json();
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meridian-audit.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.verifier}>
      <div className={`${styles.statusBox} ${valid ? styles.statusValid : styles.statusInvalid}`}>
        <span className={styles.blinkingDot} />
        <span className={styles.statusText}>{valid ? 'Chain valid' : 'Chain invalid'}</span>
      </div>
      
      <button 
        className={styles.verifyBtn} 
        onClick={verify} 
        disabled={busy}
      >
        {busy ? 'Verifying…' : 'Verify chain'}
      </button>
      
      <button 
        className={styles.exportBtn} 
        onClick={exportLog}
      >
        Export log
      </button>
    </div>
  );
}
