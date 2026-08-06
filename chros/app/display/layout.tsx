import type { ReactNode } from 'react';
import SnapshotProvider from './SnapshotProvider';

export default function DisplayLayout({ children }: { children: ReactNode }) {
  return <SnapshotProvider>{children}</SnapshotProvider>;
}
