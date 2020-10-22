import React from 'react';
import { ResponsiveContainer } from 'recharts';

export interface GraphContainerProps {
    title: string;
}

const GraphContainer = ({ children }) => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            {children}
        </ResponsiveContainer>
    );
};

export default GraphContainer;