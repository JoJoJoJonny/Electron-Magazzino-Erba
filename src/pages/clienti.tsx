import React from "react";

import TabellaClienti from '@/components/tabellaClienti';

export const Clienti = () => {
    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Clienti</h2>
            <div className="min-h-screen p-0">
                <TabellaClienti />
            </div>
        </div>
    );
};
