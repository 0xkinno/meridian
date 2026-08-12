'use client';
import { useState } from 'react';
import styles from './ui.module.css';
export function AddressDisplay({address}:{address:string}){const[copied,setCopied]=useState(false);const short=`${address.slice(0,8)}…${address.slice(-6)}`;async function copy(){await navigator.clipboard.writeText(address);setCopied(true);window.setTimeout(()=>setCopied(false),1400)}return <span className={styles.address} title={address}>{short}<button className={styles.copy} type="button" onClick={copy}>{copied?'Copied':'Copy'}</button></span>}
