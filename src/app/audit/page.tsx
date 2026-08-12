import styles from '../pages.module.css';
import { readAuditLog, verifyAuditLog } from '@/lib/audit/logger';
import { AuditVerifier } from '@/components/audit/AuditVerifier';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  const entries = await readAuditLog();
  const verification = await verifyAuditLog();
  
  return (
    <div className={styles.shell}>
      {/* Premium Trade Chart Header */}
      <div className={styles.headerHero}>
        <div className={styles.headerHeroOverlay} />
        <div className={styles.headerHeroContent}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrowHero}>Audit / Integrity</p>
              <h1 className={styles.titleHero}>
                Proof should be<br />
                tamper-evident.
              </h1>
              <p className={styles.descHero}>
                Every observation, simulation, decision, submission, receipt, listing, and alert is linked by SHA-256.
              </p>
            </div>
          </header>
        </div>
      </div>

      {/* Forensic Hash Chain Specimen */}
      <section className={styles.hashSpecimenSection}>
        <div className={styles.hashSpecimenOverlay} />
        <div className={styles.specimenInnerContent}>
          <div className={styles.specimenHeader}>
            <span>CRYPTO EVIDENCE / HASH CHAIN DOCK</span>
            <span className={styles.specimenStatus}>INTEGRITY: {verification.valid ? 'VALID' : 'CORRUPTED'}</span>
          </div>
          
          <div className={styles.chainFlowScroll}>
            <div className={styles.chainNodesRow}>
              {entries.slice(0, 4).map((e, index) => (
                <div className={styles.chainBlock} key={e.hash}>
                  <div className={styles.blockTop}>
                    <span className={styles.blockSeq}>000{e.seq}</span>
                    <span className={styles.blockType}>{e.type.slice(0, 18)}</span>
                  </div>
                  
                  <div className={styles.blockContent}>
                    <div className={styles.blockHashRow}>
                      <span>previous</span>
                      <code>{e.prevHash ? `${e.prevHash.slice(0, 8)}…` : '0x00000000'}</code>
                    </div>
                    <div className={styles.blockHashRow}>
                      <span>current</span>
                      <code>{e.hash ? `${e.hash.slice(0, 8)}…` : '—'}</code>
                    </div>
                    <div className={styles.blockHashRow}>
                      <span>integrity</span>
                      <strong className={styles.blockIntegrity}>VALID</strong>
                    </div>
                  </div>
                  
                  {index < 3 && index < entries.length - 1 && (
                    <div className={styles.chainConnector}>
                      <div className={styles.connectorLine} />
                      <span className={styles.connectorSymbol}>→</span>
                    </div>
                  )}
                </div>
              ))}
              {entries.length > 4 && (
                <div className={styles.chainMoreCard}>
                  <span>+{entries.length - 4} records</span>
                  <p>sealed in chain</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.auditSummary}>
        <div>
          <span className={styles.eyebrow}>Chain integrity</span>
          <strong>{verification.valid ? 'Chain verified' : 'Verification failed'}</strong>
          <p>{entries.length} hash-linked records in the current ledger.</p>
        </div>
        <AuditVerifier initial={verification.valid} />
      </section>

      <div className={styles.auditWrapper}>
        <div className={styles.auditHeaderRow}>
          <span>SEQ</span>
          <span>TIMESTAMP</span>
          <span>EVENT TYPE</span>
          <span>HASH IDENTIFIER</span>
          <span></span> {/* Empty header space for expand button alignment */}
        </div>
        <div className={styles.audit}>
          {entries.map(e => (
            <details className={styles.auditLine} key={e.hash}>
              <summary className={styles.auditSummaryRow}>
                <span className={styles.auditSeq}>#{String(e.seq).padStart(6, '0')}</span>
                <time className={styles.auditTime}>{e.ts}</time>
                <span className={styles.auditType}>{e.type}</span>
                <code className={styles.auditHashShort}>{e.hash.slice(0, 24)}…</code>
              </summary>
              <div className={styles.auditPayload}>
                <div className={styles.payloadRow}>
                  <span>PREVIOUS HASH</span>
                  <code>{e.prevHash || 'None'}</code>
                </div>
                <div className={styles.payloadRow}>
                  <span>CURRENT HASH</span>
                  <code>{e.hash}</code>
                </div>
                <div className={styles.payloadRow}>
                  <span>PAYLOAD DATA</span>
                  <pre>{JSON.stringify(e.payload, null, 2)}</pre>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
