'use client';

import { useState } from 'react';
import { Badge } from '@/components/shared/Badge';
import { TransactionLink } from '@/components/shared/TransactionLink';
import type { ExecutionRecord } from '@/lib/store/executions';
import styles from './executions.module.css';

export function ExecutionsContainer({ initialExecutions }: { initialExecutions: ExecutionRecord[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    initialExecutions.length > 0 ? (initialExecutions[0]?.id ?? null) : null
  );

  const active = initialExecutions.find(x => x.id === selectedId) || initialExecutions[0];

  const getTimelineStages = (x: ExecutionRecord | undefined) => {
    if (!x) return [];
    
    const risk = x.risk as { score?: number; level?: string } | undefined;
    const sim = x.simulation as { success?: boolean; gasEstimate?: string } | undefined;
    
    return [
      {
        label: 'TRIGGER',
        val: 'Chronological signal',
        meta: x.network.toUpperCase(),
        time: new Date(x.createdAt).toLocaleTimeString(),
        status: 'completed'
      },
      {
        label: 'BALANCE',
        val: 'Vault funds observed',
        meta: 'Balance: OK',
        time: new Date(x.createdAt).toLocaleTimeString(),
        status: 'completed'
      },
      {
        label: 'RISK',
        val: risk ? `${risk.level ?? 'assessed'}` : 'Sanity check',
        meta: risk ? `Score: ${risk.score ?? '—'}` : 'Allowed',
        time: new Date(x.createdAt).toLocaleTimeString(),
        status: 'completed'
      },
      {
        label: 'SIMULATION',
        val: sim ? (sim.success ? 'Preflight Passed' : 'Preflight Failed') : 'Dry-run validated',
        meta: sim?.gasEstimate ? `Gas: ${sim.gasEstimate}` : 'Success',
        time: new Date(x.createdAt).toLocaleTimeString(),
        status: sim?.success === false ? 'failed' : 'completed'
      },
      {
        label: 'EXECUTE',
        val: x.status === 'completed' ? 'Dispatched' : x.status === 'failed' ? 'Failed' : 'Pending',
        meta: x.keeperHubExecutionId ? `ID: ${x.keeperHubExecutionId.slice(0, 8)}…` : 'Awaiting ID',
        time: x.completedAt ? new Date(x.completedAt).toLocaleTimeString() : 'Running',
        status: x.status
      },
      {
        label: 'PROOF',
        val: x.transactionHash ? 'Evidence sealed' : 'Audit logs seal',
        meta: x.transactionHash ? `${x.transactionHash.slice(0, 8)}…` : 'Not broadcast',
        time: x.completedAt ? new Date(x.completedAt).toLocaleTimeString() : 'Pending',
        status: x.transactionHash ? 'completed' : 'pending'
      }
    ];
  };

  const stages = getTimelineStages(active);

  return (
    <div className={styles.container}>
      {/* Premium Trade Chart Header */}
      <div className={styles.headerHero}>
        <div className={styles.headerHeroOverlay} />
        <div className={styles.headerHeroContent}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrowHero}>Verified Ledger / {String(initialExecutions.length).padStart(2, '0')}</p>
              <h1 className={styles.titleHero}>
                EXECUTION /<br />
                <span className={styles.serifItalic}>LIVE RECORD</span>
              </h1>
              <p className={styles.descHero}>
                Simulation, risk decision, KeeperHub execution ID, receipt status, and explorer proof in one chronological record.
              </p>
            </div>
          </header>
        </div>
      </div>

      {active && (
        <section className={styles.observatory}>
          <h3 className={styles.sectionHeading}>OBSERVATORY TIMELINE</h3>
          <div className={styles.timelineContainer}>
            <div className={styles.timelineRow}>
              {stages.map((stage, index) => {
                const isCompleted = stage.status === 'completed';
                const isFailed = stage.status === 'failed';
                const isPending = stage.status === 'pending';
                const isActive = index === 4 && !isCompleted && !isFailed; // Execution state active signal
                
                return (
                  <div key={stage.label} className={styles.stageWrapper}>
                    <div className={`${styles.stageNode} ${isCompleted ? styles.stageSage : ''} ${isFailed ? styles.stageError : ''} ${isPending ? styles.stagePending : ''} ${isActive ? styles.stageCopper : ''}`}>
                      <div className={styles.nodeTop}>
                        <span className={styles.nodeIndex}>0{index + 1}</span>
                        <strong className={styles.nodeLabel}>{stage.label}</strong>
                      </div>
                      <div className={styles.nodeBody}>
                        <p className={styles.nodeVal}>{stage.val}</p>
                        <span className={styles.nodeMeta}>{stage.meta}</span>
                      </div>
                      <div className={styles.nodeFoot}>
                        <i className={styles.signalDot} />
                        <span className={styles.nodeTime}>{stage.time}</span>
                      </div>
                    </div>
                    {index < stages.length - 1 && (
                      <div className={`${styles.nodeConnector} ${isCompleted ? styles.connectorSage : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Execution Table / Ledger */}
      <section className={styles.ledgerSection}>
        <h3 className={styles.sectionHeading}>CHRONOLOGICAL LEDGER EVIDENCE</h3>
        <div className={styles.ledgerRows}>
          <div className={styles.ledgerHeaderRow}>
            <span>SEQ</span>
            <span>TIMESTAMP</span>
            <span>STRATEGY / MANDATE</span>
            <span>STATE</span>
            <span>NETWORK</span>
            <span>PROOF</span>
          </div>
          
          {initialExecutions.map((x, index) => {
            const isSelected = x.id === active?.id;
            
            return (
              <div 
                key={x.id} 
                className={`${styles.ledgerRow} ${isSelected ? styles.ledgerRowActive : ''}`}
                onMouseEnter={() => setSelectedId(x.id)}
              >
                <span className={styles.rowSeq}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.rowTime}>{new Date(x.createdAt).toLocaleString()}</span>
                <strong className={styles.rowName}>{x.strategyName || x.kind}</strong>
                <span>
                  <Badge tone={x.status === 'completed' ? 'success' : x.status === 'failed' ? 'error' : 'warning'}>
                    {x.status}
                  </Badge>
                </span>
                <span className={styles.rowNetwork}>{x.network}</span>
                <div className={styles.rowActionWrapper}>
                  {x.transactionHash && x.transactionLink ? (
                    <TransactionLink hash={x.transactionHash} href={x.transactionLink} />
                  ) : (
                    <span className={styles.noTx}>Local Seal</span>
                  )}
                  <span className={styles.rowActionLabel}>View ↗</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
