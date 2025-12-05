import React, { useState, useEffect } from 'react';

// Definisci l'interfaccia per i dati attesi dal backend (ipcMain)
interface StatisticheData {
    numClienti: number;
    numArticoli: number;
    numAttrezzature: number;
    numProdottiTotali: number;
    valoreTotaleProdotti: number;
}

// Mappa delle statistiche per la visualizzazione
/*const statisticheMap: { label: string; key: keyof StatisticheData; format?: (value: number) => string }[] = [
    { label: 'Numero di Clienti', key: 'numClienti' },
    { label: 'Numero di Articoli', key: 'numArticoli' },
    { label: 'Numero di Attrezzature', key: 'numAttrezzature' },
    { label: 'Numero di Prodotti Totali', key: 'numProdottiTotali' },
    {
        label: 'Valore Totale Prodotti',
        key: 'valoreTotaleProdotti',
        // Funzione di formattazione per la valuta
        format: (value) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
    },
];*/

const StatCard: React.FC<{ title: string; value: number | string; unit?: string }> = ({ title, value, unit }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg transition duration-300 hover:shadow-2xl border border-gray-100">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <div className="mt-1 flex items-baseline">
            <span className="text-3xl font-extrabold text-myColor">
                {value}
            </span>
            {unit && <span className="ml-2 text-sm font-medium text-gray-500">{unit}</span>}
        </div>
    </div>
);

// Funzione principale del componente
export const Statistiche = () => {
    const [data, setData] = useState<StatisticheData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Effetto per caricare i dati reali dal database tramite IPC
    useEffect(() => {
        const loadData = async () => {
            if (!window.ipcRenderer) {
                setError("Errore: Funzionalità IPC non disponibile.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // CHIAMATA IPC AL BACKEND
                const result = await window.ipcRenderer.invoke('db-get-statistiche');

                if (result && !('error' in result)) {
                    setData(result as StatisticheData);
                } else {
                    setError(result.error || 'Errore sconosciuto nel recupero delle statistiche.');
                }

            } catch (e) {
                console.error("IPC Error:", e);
                setError('Errore di comunicazione con il processo principale.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <div className="text-xl font-semibold text-gray-500 animate-pulse">Caricamento statistiche...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <div className="text-xl font-semibold text-red-600">Errore: {error}</div>
            </div>
        );
    }

    if (!data) return (
        <div className="p-8 text-center text-gray-500">Nessun dato statistico disponibile.</div>
    );

    return (
        <div className="p-6 space-y-6">

            {/* 1. Intestazione della Pagina - Copiata dallo stile Prodotti */}
            <h1 className="text-3xl font-bold text-gray-800">Statistiche e Riepilogo</h1>

            {/* 3. Griglia delle Statistiche con le Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 pt-4">

                <StatCard
                    title="Totale Clienti"
                    value={data.numClienti.toLocaleString('it-IT')}
                />

                <StatCard
                    title="Totale Articoli"
                    value={data.numArticoli.toLocaleString('it-IT')}
                />

                <StatCard
                    title="Totale Attrezzature"
                    value={data.numAttrezzature.toLocaleString('it-IT')}
                />

                <StatCard
                    title="Inventario Prodotti"
                    value={data.numProdottiTotali.toLocaleString('it-IT')}
                    unit="Unità"
                />

                {/* Formattazione valuta per il Valore Totale */}
                <StatCard
                    title="Valore Inventario Totale"
                    value={data.valoreTotaleProdotti.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    unit="€"
                />

            </div>
        </div>
    );
};