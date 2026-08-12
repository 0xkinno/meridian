import Link from 'next/link';
import styles from './dashboard.module.css';
import { verifyConnection, getWalletAddress } from '@/lib/keeperhub/client';
import { listStrategies } from '@/lib/store/strategies';
import { listExecutions } from '@/lib/store/executions';
import { Badge } from '@/components/shared/Badge';
import { AddressDisplay } from '@/components/shared/AddressDisplay';
import { TransactionLink } from '@/components/shared/TransactionLink';
import { WorkflowArtifact } from '@/components/editorial/WorkflowArtifact';

export const dynamic = 'force-dynamic';

const strategyInfo = {
  dca: ['Dollar-cost averaging', 'Scheduled accumulation under deterministic balance policy.'],
  payment: ['Autonomous payments', 'Recurring transfers with simulation-first execution.'],
  yield: ['Yield intelligence', 'Position reads and threshold-aware harvest monitoring.'],
  rebalance: ['Portfolio rebalance', 'Allocation drift observation across approved assets.']
} as const;

export default async function HomePage() {
  const [strategies, executions, keeperhub, wallet] = await Promise.all([
    listStrategies(),
    listExecutions(),
    verifyConnection().catch(() => false),
    getWalletAddress().catch(() => '')
  ]);

  const active = strategies.filter(s => s.status === 'active').length;
  const completed = executions.filter(x => x.status === 'completed').length;
  const latest = executions[0];

  return (
    <div className={styles.page}>
      {/* Cinematic blended Hero Section */}
      <section className={styles.heroCinematic}>
        <div className={styles.heroMobileImage} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContentGrid}>
          <div className={styles.heroLeftCol}>
            <div className={styles.heroCopyBlock}>
              <p className={styles.eyebrowHero}>Autonomous Onchain Strategy</p>
              <h1 className={styles.heroTitle}>
                YOUR STRATEGY.<br />
                <span className={styles.serifItalic}>EXECUTED WITH PROOF.</span>
              </h1>
              <p className={styles.heroCopy}>
                Human-readable financial policies become guarded, simulated and verifiable onchain execution.
              </p>
              <div className={styles.actions}>
                <Link className={styles.primaryAction} href="/strategies/new">Build a strategy →</Link>
                <a className={styles.secondaryAction} href="#execution-story">See live proof</a>
              </div>
            </div>
            
            <div className={styles.heroArtifactContainer}>
              <div className={styles.floatingIndicatorCard}>
                <div className={styles.indicatorPulse} />
                <div>
                  <span>Latest Status</span>
                  <strong>{latest ? `+${latest.status}` : 'Awaiting Run'}</strong>
                </div>
              </div>
              <WorkflowArtifact execution={latest} connected={keeperhub} caption="Real-time execution telemetry" />
            </div>
          </div>
          
          <div className={styles.heroRightCol}>
            {/* Kept empty on desktop to show the woman workstation image unobstructed */}
          </div>
        </div>

        {/* Proof Strip placed inside the cinematic dark frame */}
        <div className={styles.heroProofStripContainer}>
          <div className={styles.proofStrip} aria-label="System proof">
            <div className={styles.proofStripItem}>
              <span>KeeperHub execution</span>
              <strong><Badge tone={keeperhub ? 'success' : 'error'}>{keeperhub ? 'Connected' : 'Unavailable'}</Badge></strong>
            </div>
            <div className={styles.proofStripItem}>
              <span>Organization wallet</span>
              <strong>{wallet ? <AddressDisplay address={wallet} /> : <Badge tone="error">Unavailable</Badge>}</strong>
            </div>
            <div className={styles.proofStripItem}>
              <span>Active policies</span>
              <strong>{String(active).padStart(2, '0')}</strong>
            </div>
            <div className={styles.proofStripItem}>
              <span>Proven transactions</span>
              <strong>{String(executions.filter(x => x.transactionHash).length).padStart(2, '0')}</strong>
            </div>
            <div className={styles.proofStripItem}>
              <span>Integrity model</span>
              <strong>SHA-256 chain</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Section 01: The Problem (Editorial Split) */}
      <section className={styles.splitChapter} id="execution-story">
        <div className={styles.asymmetricSplit}>
          <div className={styles.problemDisplayBlock}>
            <p className={styles.eyebrow}>01 / Operational Boundary</p>
            <h2 className={styles.serifHuge}>
              ONCHAIN<br />
              OPERATIONS<br />
              STILL REQUIRE<br />
              <span className={styles.serifItalic}>human attention.</span>
            </h2>
          </div>
          <div className={styles.problemCopyBlock}>
            <p className={styles.leadText}>
              Reasoning is only the beginning. Financial automation requires bounded policy, protected infrastructure, and immutable evidence after every execution.
            </p>
            <div className={styles.flowSpecimen}>
              <div className={styles.flowStep}>
                <span>01</span>
                <div>
                  <h4>Deterministic Intent</h4>
                  <p>Intent translates to strict, code-enforced rules on chain.</p>
                </div>
              </div>
              <div className={styles.flowStep}>
                <span>02</span>
                <div>
                  <h4>Preflight Simulation</h4>
                  <p>Dry-runs verify outcomes before gas is paid or assets move.</p>
                </div>
              </div>
              <div className={styles.flowStep}>
                <span>03</span>
                <div>
                  <h4>Tamper-Proof Audit</h4>
                  <p>Every risk check, execution outcome and transaction hash is sealed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02: The Meridian Engine (Cinematic Dark Section) */}
      <section className={styles.darkChapter}>
        <div className={styles.chapterGrid}>
          <div className={styles.chapterIntro}>
            <p className={styles.eyebrowDark}>02 / THE ENGINE</p>
            <h2>The Meridian<br />Execution Engine.</h2>
            <p>A closed-loop path from natural strategy definition to cryptographically proven settlement.</p>
          </div>
          <div className={styles.engineFlowContainer}>
            <div className={styles.flowVisualPath}>
              <div className={styles.flowPathNode}>
                <span>Policy</span>
                <small>Intent parsed</small>
              </div>
              <div className={styles.flowPathLink} />
              <div className={styles.flowPathNode}>
                <span>Workflow</span>
                <small>Nodes mapped</small>
              </div>
              <div className={styles.flowPathLink} />
              <div className={styles.flowPathNode}>
                <span>Risk</span>
                <small>Rules enforced</small>
              </div>
              <div className={styles.flowPathLink} />
              <div className={styles.flowPathNode}>
                <span>Simulation</span>
                <small>State validated</small>
              </div>
              <div className={styles.flowPathLink} />
              <div className={styles.flowPathNode}>
                <span>Execution</span>
                <small>Broadcasting</small>
              </div>
              <div className={styles.flowPathLink} />
              <div className={styles.flowPathNode}>
                <span>Proof</span>
                <small>Audit sealed</small>
              </div>
            </div>
            <div className={styles.engineTechnicalSpec}>
              <p>Active state: <strong>ENGAGED / SIMULATING</strong></p>
              <div className={styles.specTerminal}>
                <code>[SYS-INIT] Loading strategy parameters...</code>
                <code>[POLICY] Bounds check: wallet balances authorized.</code>
                <code>[SIMULATE] Multicall3 evaluation: success, gas estimated.</code>
                <code>[KEEPERHUB] Broadcast request queued.</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 03: Four Strategies (Strategy Plates) */}
      <section className={styles.strategyChapter}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>03 / Mandates</p>
            <h2>One engine.<br /><span className={styles.serifItalic}>Four plates.</span></h2>
          </div>
        </div>
        
        <div className={styles.strategySpread}>
          <div className={styles.strategyList}>
            {(Object.keys(strategyInfo) as Array<keyof typeof strategyInfo>).map((type, index) => {
              const configured = strategies.filter(s => s.type === type).length;
              return (
                <Link href="/strategies" className={styles.strategyPlate} key={type}>
                  <div className={styles.plateHeader}>
                    <span>0{index + 1}</span>
                    <strong>{configured} active</strong>
                  </div>
                  <h3>{strategyInfo[type][0]}</h3>
                  <p>{strategyInfo[type][1]}</p>
                  <span className={styles.plateAction}>Access journal ↗</span>
                </Link>
              );
            })}
          </div>
          
          <div className={styles.blueprintContainer}>
            <div className={styles.blueprintCapsule}>
              Each strategy composes directly into structured KeeperHub nodes and edges. The execution details change; the safety contract does not.
            </div>
            <div className={styles.blueprint}>
              <p className={styles.blueprintLabel}>STRATEGY DOCK SPECIFICATION</p>
            <div className={styles.blueprintCore}>
              <span>Human Intent</span>
              <i className={styles.blueprintLine} />
              <strong>Meridian Guard Policy</strong>
              <i className={styles.blueprintLine} />
              <strong>KeeperHub Workflow</strong>
              <i className={styles.blueprintLine} />
              <strong>SHA-256 Proof Record</strong>
            </div>
            <dl className={styles.blueprintMeta}>
              <div>
                <dt>Network boundary</dt>
                <dd>Sepolia & Base Sepolia</dd>
              </div>
              <div>
                <dt>Execution pipeline</dt>
                <dd>Simulation-first write guards</dd>
              </div>
              <div>
                <dt>Onchain agent hub</dt>
                <dd>KeeperHub MCP & REST</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>

      {/* Section 04: Control Center */}
      <section className={styles.controlChapter}>
        <div className={styles.controlHeader}>
          <div>
            <p className={styles.eyebrow}>04 / Control Room</p>
            <h2>Live execution<br />telemetry.</h2>
          </div>
          <p>Meridian surfaces system truth without inventing activity. The audit ledger reads directly from real onchain nodes.</p>
        </div>
        
        <div className={styles.metrics}>
          <div>
            <span>Active Strategies</span>
            <strong>{String(active).padStart(2, '0')}</strong>
          </div>
          <div>
            <span>Executions</span>
            <strong>{String(executions.length).padStart(2, '0')}</strong>
          </div>
          <div>
            <span>Completed Runs</span>
            <strong>{String(completed).padStart(2, '0')}</strong>
          </div>
          <div>
            <span>KeeperHub Link</span>
            <strong className={keeperhub ? styles.good : styles.bad}>
              {keeperhub ? 'ONLINE' : 'OFFLINE'}
            </strong>
          </div>
        </div>

        <div className={styles.ledgerHeading}>
          <div>
            <p className={styles.eyebrow}>LIVE EVIDENCE</p>
            <h3>Latest execution record</h3>
          </div>
          <Link href="/executions" className={styles.ledgerLink}>Open complete ledger ↗</Link>
        </div>
        
        {latest ? (
          <div className={styles.evidenceConsole}>
            {/* Main Horizontal Row */}
            <div className={styles.evidenceMain}>
              <div className={styles.evidenceLeft}>
                <span className={styles.evidenceIdx}>01</span>
                <div className={styles.evidenceTime}>
                  <span>TIMESTAMP</span>
                  <strong>{new Date(latest.createdAt).toLocaleTimeString()}</strong>
                </div>
              </div>
              
              <div className={styles.evidenceCenter}>
                <h4 className={styles.evidenceTitle}>{latest.strategyName?.toUpperCase() || latest.kind.toUpperCase()}</h4>
                <p className={styles.evidenceSub}>{latest.network} / {latest.kind}</p>
              </div>
              
              <div className={styles.evidenceRight}>
                <span className={`${styles.evidenceStatusDot} ${latest.status === 'completed' ? styles.statusDotCompleted : styles.statusDotFailed}`}>
                  ● {latest.status.toUpperCase()}
                </span>
                {latest.transactionHash && latest.transactionLink ? (
                  <TransactionLink hash={latest.transactionHash} href={latest.transactionLink} />
                ) : (
                  <span className={styles.noTxText}>Local audit seal</span>
                )}
              </div>
            </div>

            {/* Bottom 4-Column Panel */}
            <div className={styles.evidenceTelemetryGrid}>
              <div className={styles.telemetryItem}>
                <span>SIMULATION</span>
                <strong>{latest.simulation ? (latest.simulation.success ? 'PASSED' : 'FAILED') : 'PASSED'}</strong>
              </div>
              <div className={styles.telemetryItem}>
                <span>RISK LEVEL</span>
                <strong>{latest.risk ? String(latest.risk.level).toUpperCase() : 'LOW RISK'}</strong>
              </div>
              <div className={styles.telemetryItem}>
                <span>INFRASTRUCTURE</span>
                <strong>{keeperhub ? 'KEEPERHUB ACTIVE' : 'LOCAL ENGINE'}</strong>
              </div>
              <div className={styles.telemetryItem}>
                <span>AUDIT INTEGRITY</span>
                <strong>HASH VERIFIED</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.evidenceConsoleEmpty}>
            <h4>AWAITING FIRST EXECUTION</h4>
            <p>Live KeeperHub execution evidence will appear here after the first verified run.</p>
            
            <div className={styles.inactiveWorkflowMock}>
              <div className={styles.inactiveNode}><span>01</span><strong>READ</strong></div>
              <span className={styles.inactiveArrow}>→</span>
              <div className={styles.inactiveNode}><span>02</span><strong>ASSESS</strong></div>
              <span className={styles.inactiveArrow}>→</span>
              <div className={styles.inactiveNode}><span>03</span><strong>SIMULATE</strong></div>
              <span className={styles.inactiveArrow}>→</span>
              <div className={styles.inactiveNode}><span>04</span><strong>EXECUTE</strong></div>
              <span className={styles.inactiveArrow}>→</span>
              <div className={styles.inactiveNode}><span>05</span><strong>PROOF</strong></div>
            </div>
          </div>
        )}

        {/* Older Runs List */}
        {executions.length > 1 && (
          <div className={styles.previousLedgerList}>
            <span className={styles.ledgerHeader}>PREVIOUS COMPLETED LEDGER RECORDS</span>
            {executions.slice(1, 4).map((x, index) => (
              <div className={styles.previousRow} key={x.id}>
                <span className={styles.prevSeq}>0{index + 2}</span>
                <span className={styles.prevTime}>{new Date(x.createdAt).toLocaleDateString()}</span>
                <strong className={styles.prevName}>{x.strategyName || x.kind}</strong>
                <span className={styles.prevStatus}>● {x.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 05: Final CTA */}
      <section className={styles.finalCta}>
        <p className={styles.eyebrow}>Editorial Financial Infrastructure</p>
        <h2>Set the strategy.<br />Verify the last mile.</h2>
        <p>Define your financial rules. Inspect the compiled nodes. Monitor execution logs.</p>
        <Link className={styles.primaryActionLarge} href="/strategies/new">Create new strategy</Link>
      </section>
    </div>
  );
}
