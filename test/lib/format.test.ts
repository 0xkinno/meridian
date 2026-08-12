import{describe,expect,it}from'vitest';import{formatAmount,truncateAddress}from'../../src/lib/format';describe('format utilities',()=>{it('truncates addresses',()=>expect(truncateAddress('0x1234567890abcdef')).toBe('0x1234…cdef'));it('formats numeric amounts',()=>expect(formatAmount('1234.5')).toBe('1,234.5'));it('handles invalid amounts',()=>expect(formatAmount('nope')).toBe('—'));});

