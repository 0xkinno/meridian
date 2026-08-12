'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Strategy } from '@/lib/strategies/types';
import { Button } from '@/components/shared/Button';
import styles from './actions.module.css';

export function StrategyActions({strategy}:{strategy:Strategy}){
  const router=useRouter();const[busy,setBusy]=useState('');const[message,setMessage]=useState('');const[error,setError]=useState(false);
  async function run(action:'workflow'|'execute'|'publish'){setBusy(action);setMessage('');setError(false);const response=await fetch(`/api/strategies/${strategy.id}/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})});const data=await response.json();if(!response.ok){setError(true);setMessage(data.error||`Unable to ${action}`)}else{setMessage(action==='workflow'?'KeeperHub workflow created.':action==='execute'?'Execution submitted and recorded.':'Strategy published to marketplace.');router.refresh()}setBusy('')}
  return <div className={styles.actions}><p className={styles.label}>Available operations</p><div className={styles.buttons}>{!strategy.keeperHubWorkflowId&&<Button onClick={()=>run('workflow')} disabled={Boolean(busy)}>{busy==='workflow'?'Composing…':'Create workflow'}</Button>}<Button variant={strategy.keeperHubWorkflowId?'primary':'secondary'} onClick={()=>run('execute')} disabled={Boolean(busy)}>{busy==='execute'?'Executing…':'Execute safely'}</Button>{strategy.keeperHubWorkflowId&&!strategy.marketplaceSlug&&<Button variant="secondary" onClick={()=>run('publish')} disabled={Boolean(busy)}>{busy==='publish'?'Publishing…':'Publish'}</Button>}</div>{message&&<p className={error?styles.error:styles.success} role="status">{message}</p>}</div>
}
