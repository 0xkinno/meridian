'use client';
export function Toast({ message, tone='success' }:{message:string;tone?:'success'|'error'}) { return <div className={`toast toast-${tone}`} role="status">{message}</div>; }

