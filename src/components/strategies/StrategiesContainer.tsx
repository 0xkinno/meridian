'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/shared/Badge';
import styles from './strategies.module.css';

interface StrategyConfig {
  chainId?: number;
  interval?: string;
  amount?: string;
  senderAddress?: string;
  recipientAddress?: string;
  positionAddress?: string;
  tokenAddress?: string;
}

interface Strategy {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  keeperHubWorkflowId?: string;
  config: StrategyConfig;
}

export function StrategiesContainer({ initialStrategies }: { initialStrategies: Strategy[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(
    initialStrategies.length > 0 ? (initialStrategies[0]?.id ?? null) : null
  );

  const activeStrategy = initialStrategies.find(s => s.id === hoveredId) || initialStrategies[0];

  const getWorkflowNodes = (type: string, name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('dca')) {
      return [
        { label: 'TRIGGER', val: 'Hourly Schedule' },
        { label: 'BALANCE', val: 'Observe target vault' },
        { label: 'RISK', val: 'Max slippage check' },
        { label: 'SIMULATION', val: 'Dry-run preflight' },
        { label: 'EXECUTION', val: 'Swap asset to USDC' },
        { label: 'PROOF', val: 'Seal hash link' }
      ];
    } else if (type === 'payment') {
      return [
        { label: 'TRIGGER', val: 'Due Date / Interval' },
        { label: 'BALANCE', val: 'Observe treasury funds' },
        { label: 'RISK', val: 'Authorized limit check' },
        { label: 'SIMULATION', val: 'Dry-run transaction' },
        { label: 'EXECUTION', val: 'Onchain transfer' },
        { label: 'PROOF', val: 'Sealed transaction proof' }
      ];
    } else if (type === 'yield' || nameLower.includes('usdc')) {
      return [
        { label: 'TRIGGER', val: 'Balance shift alert' },
        { label: 'BALANCE', val: 'Multicall3 balance check' },
        { label: 'RISK', val: 'Gas limit threshold' },
        { label: 'SIMULATION', val: 'Dry-run multicall read' },
        { label: 'EXECUTION', val: 'Harvest & batch-read' },
        { label: 'PROOF', val: 'Audit ledger hash seal' }
      ];
    } else if (type === 'rebalance') {
      return [
        { label: 'TRIGGER', val: 'Drift deviation threshold' },
        { label: 'BALANCE', val: 'Portfolio allocations check' },
        { label: 'RISK', val: 'Target weight boundaries' },
        { label: 'SIMULATION', val: 'Estimate reallocate swap' },
        { label: 'EXECUTION', val: 'Execute portfolio swap' },
        { label: 'PROOF', val: 'State updates verified' }
      ];
    }
    return [
      { label: 'TRIGGER', val: 'Onchain trigger event' },
      { label: 'BALANCE', val: 'Inventory checks' },
      { label: 'RISK', val: 'Sanity margin assessment' },
      { label: 'SIMULATION', val: 'Local state dry-run' },
      { label: 'EXECUTION', val: 'Smart contract invocation' },
      { label: 'PROOF', val: 'Hash chain ledger seal' }
    ];
  };

  const workflowNodes = activeStrategy 
    ? getWorkflowNodes(activeStrategy.type, activeStrategy.name)
    : getWorkflowNodes('default', '');

  return (
    <div className={styles.container}>
      {/* Editorial Header */}
      <div className={styles.headerHero}>
        <div className={styles.headerHeroOverlay} />
        <div className={styles.headerHeroContent}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrowHero}>Policy Registry / {String(initialStrategies.length).padStart(2, '0')}</p>
              <h1 className={styles.titleHero}>
                STRATEGIES THAT<br />
                <span className={styles.serifItalic}>BECOME OPERATIONS.</span>
              </h1>
              <p className={styles.descHero}>
                Proven financial policies, packaged for autonomous execution with strict rules and cross-verified hash logs.
              </p>
              <Link href="/strategies/new" className={styles.createStrategyBtn}>Create strategy →</Link>
            </div>
          </header>
        </div>
      </div>

      <div className={styles.splitLayout}>
        {/* Left Side: Magazine-style Numbered Strategy List */}
        <div className={styles.leftCol}>
          <h3 className={styles.sectionHeading}>ACTIVE MANDATES</h3>
          <div className={styles.strategiesList}>
            {initialStrategies.map((strategy, idx) => {
              const isSelected = strategy.id === activeStrategy?.id;
              
              return (
                <div
                  key={strategy.id}
                  className={`${styles.strategyRow} ${isSelected ? styles.strategyRowActive : ''}`}
                  onMouseEnter={() => setHoveredId(strategy.id)}
                >
                  <div className={styles.rowLeft}>
                    <span className={styles.rowIdx}>{String(idx + 1).padStart(2, '0')}</span>
                    <div className={styles.rowText}>
                      <h4 className={styles.rowTitle}>{strategy.name}</h4>
                      <p className={styles.rowDesc}>{strategy.description || 'Deterministic financial policy mandate.'}</p>
                    </div>
                  </div>
                  <div className={styles.rowRight}>
                    <Badge tone={strategy.status === 'active' ? 'success' : 'warning'}>
                      {strategy.status}
                    </Badge>
                    <span className={styles.rowType}>{strategy.type}</span>
                    <Link href={`/strategies/${strategy.id}`} className={styles.rowLink}>
                      Dossier ↗
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Elegant Paper-style Strategy Blueprint Artifact */}
        <div className={styles.rightCol}>
          <div className={styles.blueprintCard}>
            <div className={styles.blueprintOverlay} />
            <div className={styles.blueprintContent}>
              <div className={styles.blueprintTop}>
                <span>STRATEGY BLUEPRINT</span>
                <span className={styles.figLabel}>FIG. 01 / STRATEGY → WORKFLOW</span>
              </div>
              
              {activeStrategy ? (
                <>
                  <div className={styles.blueprintMeta}>
                    <h3 className={styles.blueprintTitle}>{activeStrategy.name}</h3>
                    <div className={styles.metaBadgeRow}>
                      <span className={styles.monoLabel}>TYPE:</span>
                      <span className={styles.monoVal}>{activeStrategy.type.toUpperCase()}</span>
                      <span className={styles.divider}>|</span>
                      <span className={styles.monoLabel}>WORKFLOW:</span>
                      <span className={styles.monoVal}>{activeStrategy.keeperHubWorkflowId || 'DRAFT'}</span>
                    </div>
                  </div>

                  <div className={styles.blueprintFlow}>
                    {workflowNodes.map((node, index) => (
                      <div key={node.label} className={styles.blueprintNodeWrapper}>
                        <div className={styles.blueprintNode}>
                          <div className={styles.nodeLeft}>
                            <span className={styles.nodeStep}>0{index + 1}</span>
                            <span className={styles.nodeTitle}>{node.label}</span>
                          </div>
                          <span className={styles.nodeValue}>{node.val}</span>
                        </div>
                        {index < workflowNodes.length - 1 && (
                          <div className={styles.blueprintConnector} />
                        )}
                      </div>
                    ))}
                  </div>

                  <p className={styles.blueprintCaption}>
                    Policy conditions become deterministic execution steps.
                  </p>
                </>
              ) : (
                <div className={styles.blueprintEmpty}>
                  <p>Hover a strategy to inspect its execution blueprint</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
