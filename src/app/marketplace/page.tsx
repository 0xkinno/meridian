import styles from '../pages.module.css';
import { listStrategies } from '@/lib/store/strategies';
import { Badge } from '@/components/shared/Badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { canonicalMarketplaceUrl } from '@/lib/keeperhub/marketplace';

export const dynamic = 'force-dynamic';

export default async function MarketplacePage() {
  const listings = (await listStrategies()).filter(s => s.marketplaceSlug);

  return (
    <div className={styles.shell}>
      {/* Premium Trade Chart Header */}
      <div className={styles.headerHero}>
        <div className={styles.headerHeroOverlay} />
        <div className={styles.headerHeroContent}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrowHero}>KeeperHub / Agent Commerce</p>
              <h1 className={styles.titleHero}>
                THE STRATEGY<br />
                <span className={styles.serifItalic}>LIBRARY.</span>
              </h1>
              <p className={styles.descHero}>
                Proven workflows, packaged for autonomous execution with explicit schemas and x402-native access.
              </p>
            </div>
          </header>
        </div>
      </div>

      <div className={styles.metricGrid}>
        <div className={styles.metric}>
          <span className={styles.eyebrow}>Live listings</span>
          <strong>{String(listings.length).padStart(2, '0')}</strong>
        </div>
        <div className={styles.metric}>
          <span className={styles.eyebrow}>Price model</span>
          <strong>USDC</strong>
        </div>
        <div className={styles.metric}>
          <span className={styles.eyebrow}>Protocol</span>
          <strong>x402</strong>
        </div>
      </div>

      {listings.length ? (
        <div className={styles.marketListSpread}>
          {listings.map((s, index) => {
            const isEven = index % 2 === 0;
            
            const detailsBlock = (
              <div className={styles.spreadDetails} key="details">
                <div className={styles.listingTop}>
                  <span className={styles.eyebrow}>0{index + 1} / {s.type}</span>
                  <Badge tone="success">Verified Live</Badge>
                </div>
                <h3>{s.name}</h3>
                <p className={styles.listingDescription}>
                  {s.description || 'A proven Meridian workflow published through KeeperHub.'}
                </p>
                
                <div className={styles.listingMetaGrid}>
                  <div>
                    <span>Network</span>
                    <strong>{s.config.chainId === 84532 ? 'Base Sepolia' : 'Ethereum Sepolia'}</strong>
                  </div>
                  <div>
                    <span>Price</span>
                    <strong>{s.marketplacePrice} USDC / call</strong>
                  </div>
                  <div>
                    <span>Workflow ID</span>
                    <strong>{s.keeperHubWorkflowId}</strong>
                  </div>
                  <div>
                    <span>Execution Count</span>
                    <strong>{s.executionCount === 0 ? 'NO EXECUTIONS YET' : s.executionCount}</strong>
                  </div>
                </div>
                
                <div className={styles.spreadActions}>
                  <a 
                    href={canonicalMarketplaceUrl(s.marketplaceSlug!)} 
                    target="_blank" 
                    rel="noreferrer"
                    className={styles.openListingBtn}
                  >
                    Open KeeperHub listing ↗
                  </a>
                  <span className={styles.x402Descriptor}>
                    Requires x402 authorization per request.
                  </span>
                </div>
              </div>
            );

            const specimenBlock = (
              <div 
                className={styles.spreadSpecimen}
                style={{ backgroundImage: 'url(/images/marketplace_bg.jpg)' }}
                key="specimen"
              >
                <div className={styles.specimenOverlay} />
                <div className={styles.specimenContent}>
                  <div className={styles.specimenHeader}>
                    <span>PRODUCT SPECIMEN</span>
                    <strong className={styles.specimenId}>{s.id.slice(0, 8)}</strong>
                  </div>
                  
                  <div className={styles.specimenFlow}>
                    <div className={styles.specimenNode}>
                      <span className={styles.nodeNum}>01</span>
                      <div>
                        <strong>MONITOR</strong>
                        <small>ERC20 contract read</small>
                      </div>
                    </div>
                    
                    <div className={styles.specimenArrow}>↓</div>
                    
                    <div className={styles.specimenNode}>
                      <span className={styles.nodeNum}>02</span>
                      <div>
                        <strong>READ</strong>
                        <small>Batch balance queries</small>
                      </div>
                    </div>
                    
                    <div className={styles.specimenArrow}>↓</div>
                    
                    <div className={styles.specimenNode}>
                      <span className={styles.nodeNum}>03</span>
                      <div>
                        <strong>ASSESS</strong>
                        <small>Harvest bounds check</small>
                      </div>
                    </div>
                    
                    <div className={styles.specimenArrow}>↓</div>
                    
                    <div className={styles.specimenNode}>
                      <span className={styles.nodeNum}>04</span>
                      <div>
                        <strong>REPORT</strong>
                        <small>Simulation & hash log</small>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.specimenFoot}>
                    <span>VERIFICATION</span>
                    <strong>INTEGRITY VALID / ACTIVE</strong>
                  </div>
                </div>
              </div>
            );

            return (
              <article className={styles.editorialSpread} key={s.id}>
                {isEven ? [detailsBlock, specimenBlock] : [specimenBlock, detailsBlock]}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          title="The library is awaiting its first listing" 
          description="Publish a proven KeeperHub workflow from a strategy detail page to make it available here."
        />
      )}
    </div>
  );
}
