import React from 'react';
import PoolGrid from '../app/components/PoolGrid';

interface PacksPageProps {
    user: any;
}

export const PacksPage: React.FC<PacksPageProps> = () => {
    return (
        <div className="animate-in fade-in duration-700">
            <PoolGrid initialPool="DJPACKS" />
        </div>
    );
};
