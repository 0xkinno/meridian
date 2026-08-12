import { describe, expect, it } from 'vitest';
import { evaluatePolicy } from '../../src/lib/policy/engine';
import type { Strategy } from '../../src/lib/strategies/types';
const base:Strategy={id:'test',name:'Valid payment',type:'payment',status:'draft',config:{chainId:84532,interval:'hourly',amount:'0.01',recipientAddress:'0x1111111111111111111111111111111111111111',senderAddress:'0x2222222222222222222222222222222222222222'},createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-01T00:00:00.000Z',executionCount:0};
describe('policy engine',()=>{it('allows a capped testnet payment',()=>expect(evaluatePolicy(base).allowed).toBe(true));it('rejects mainnet',()=>expect(evaluatePolicy({...base,config:{...base.config,chainId:1}}).violations).toContain('Chain 1 is not in the testnet allowlist'));it('rejects amount above cap',()=>expect(evaluatePolicy({...base,config:{...base.config,amount:'1'}}).allowed).toBe(false));it('rejects malformed recipient',()=>expect(evaluatePolicy({...base,config:{...base.config,recipientAddress:'bad'}}).allowed).toBe(false));});

