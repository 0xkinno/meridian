import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Meridian — Autonomous Strategy Execution',
  description: 'Set your strategy. The agent handles the last mile through KeeperHub.',
};

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><Header/><main>{children}</main><Footer/></body></html>}
