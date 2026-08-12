import { StrategyBuilder } from '@/components/strategies/StrategyBuilder';
import styles from '../../pages.module.css';
export default function NewStrategyPage(){return <div className={styles.shell}><header className={styles.header}><div><p className={styles.eyebrow}>New mandate / Policy studio</p><h1>Strategy<br/>becomes execution.</h1><p>Define intent, inspect the deterministic workflow, then seal the strategy for KeeperHub composition.</p></div></header><StrategyBuilder/></div>}
