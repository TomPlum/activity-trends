import { createContext } from 'react';
import { SnapshotDates } from '../domain/SnapshotDates';

export interface Snapshots {
    sleep: string[];
}

export interface SnapshotContextProps {
    snapshots?: SnapshotDates;
    selected?: string;
    latest?: string;
}

const SnapshotContext = createContext<SnapshotContextProps>({
    snapshots: new SnapshotDates()
});

export default SnapshotContext;