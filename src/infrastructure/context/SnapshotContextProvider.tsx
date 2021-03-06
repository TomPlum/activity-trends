import React, { createContext, useState } from 'react';
import { SnapshotDates } from '../../domain/SnapshotDates';

export interface Snapshots {
    sleep: string[];
}

export interface SnapshotContextProps {
    snapshots?: SnapshotDates;
    selected?: string;
    latest?: string;
}

export const SnapshotContext = createContext<SnapshotContextProps>({
    snapshots: new SnapshotDates()
});


const SnapshotContextProvider = (props) => {
    const [snapshots, setSnapshots] = useState<SnapshotDates>(undefined);

    const storeSnapshotDates = (snapshotDates: SnapshotDates) => {
        setSnapshots(snapshotDates);
    }

    return (
        <SnapshotContext.Provider value={{ snapshots }}>
            {props.children}
        </SnapshotContext.Provider>
    )
}

export default SnapshotContextProvider;