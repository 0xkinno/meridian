import type { ExecutionRecord } from '@/lib/store/executions';
import styles from './editorial.module.css';

interface WorkflowArtifactProps {
  execution?: ExecutionRecord;
  connected?: boolean;
  caption?: string;
}

export function WorkflowArtifact({ execution, connected = true, caption = 'Live execution architecture' }: WorkflowArtifactProps) {
  const risk = execution?.risk as { score?: number; level?: string } | undefined;
  
  const nodes = [
    { label: 'Policy', desc: 'Deterministic intent', active: execution?.status === 'pending' },
    { label: 'Balance', desc: 'Funds observed', active: false },
    { label: 'Risk', desc: risk ? `${risk.score ?? '—'} / ${risk.level ?? 'assessed'}` : 'Local assessment', active: false },
    { label: 'Simulate', desc: 'Preflight simulation: OK', active: execution?.status === 'processing' },
    { label: 'Execute', desc: execution?.status ?? 'Awaiting run', active: execution?.status === 'completed' || execution?.status === 'failed' },
    { label: 'Proof', desc: execution?.transactionHash ? 'Evidence sealed' : 'Hash-linked audit', active: Boolean(execution?.transactionHash) }
  ];

  // Find active node index
  const activeIdx = nodes.findIndex(n => n.active);
  const currentActive = activeIdx !== -1 ? activeIdx : 4; // default to execute

  return (
    <figure className={styles.figure}>
      <div className={styles.artifact}>
        <div className={styles.artifactTop}>
          <span>MERIDIAN / EXECUTION ENGINE</span>
          <span className={connected ? styles.online : styles.offline}>
            {connected ? 'KEEPERHUB CONNECTED' : 'CONNECTION OFFLINE'}
          </span>
        </div>
        
        <div className={styles.workflowVertical}>
          {nodes.map((node, index) => {
            const isActive = index === currentActive;
            const isCompleted = index < currentActive;
            
            return (
              <div key={node.label} className={styles.nodeWrapper}>
                <div className={`${styles.consoleNode} ${isActive ? styles.nodeActive : ''} ${isCompleted ? styles.nodeCompleted : ''}`}>
                  <div className={styles.nodeLeft}>
                    <span className={styles.nodeIndex}>{String(index + 1).padStart(2, '0')}</span>
                    <strong className={styles.nodeLabel}>{node.label}</strong>
                  </div>
                  <div className={styles.nodeRight}>
                    <span className={styles.nodeDesc}>{node.desc}</span>
                    <i className={styles.statusDot} />
                  </div>
                </div>
                {index < nodes.length - 1 && (
                  <div className={`${styles.nodeConnector} ${isCompleted ? styles.connectorCompleted : ''}`} />
                )}
              </div>
            );
          })}
        </div>
        
        <div className={styles.artifactFootCompact}>
          <span>BASE SEPOLIA</span>
          <span>•</span>
          <span>SIMULATION READY</span>
          <span>•</span>
          <span>KEEPERHUB ACTIVE</span>
        </div>
      </div>
      <figcaption>
        <span>FIG. 01 / EXECUTION PATH</span>
        {caption}
      </figcaption>
    </figure>
  );
}
