import { describe,expect,it } from 'vitest';import{createEntry,GENESIS_HASH,verifyChain}from'../../src/lib/audit/chain';
describe('audit chain',()=>{it('verifies linked entries',()=>{const a=createEntry(1,'A',{x:1},GENESIS_HASH,'2026-01-01T00:00:00.000Z');const b=createEntry(2,'B',{x:2},a.hash,'2026-01-01T00:00:01.000Z');expect(verifyChain([a,b])).toEqual({valid:true})});it('detects tampering',()=>{const a=createEntry(1,'A',{x:1},GENESIS_HASH,'2026-01-01T00:00:00.000Z');expect(verifyChain([{...a,payload:{x:9}}]).valid).toBe(false)});});

