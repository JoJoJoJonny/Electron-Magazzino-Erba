import React, { useEffect, useState } from 'react';
// Importiamo l'interfaccia TransazioneRecord dal componente padre
import { TransazioneRecord } from '@/pages/transazioni';

import {usePriceVisibility} from "@/components/priceVisibilityContext.tsx";

// Definisci le props che riceverà TabellaTransazioni dal genitore
interface TabellaTransazioniProps {
    // Funzione chiamata quando un transazione viene selezionato (o deselezionato)
    onTransactionSelect: (transaction: TransazioneRecord | null) => void;
    // Il transazione attualmente selezionato (per evidenziazione e confronto)
    selectedTransaction: TransazioneRecord | null;
    // NUOVA RIGA: Termine di ricerca ricevuto dal componente padre
    searchTerm: string;
}

// NUOVO BLOCCO: Interfacce per la gestione dell'ordinamento
type SortKey = keyof TransazioneRecord | 'rowid'; // Le chiavi su cui possiamo ordinare
type SortDirection = 'ascending' | 'descending' | null;

interface SortConfig {
    key: SortKey | null;
    direction: SortDirection;
}

// MODIFICA DELLA RIGA:
const TabellaTransazioni: React.FC<TabellaTransazioniProps> = ({ onTransactionSelect, selectedTransaction, searchTerm }) => {
    // Utilizziamo l'interfaccia corretta TransazioneRecord
// ...    // Utilizziamo l'interfaccia corretta TransazioneRecord
    const [transazioni, setTransazioni] = useState<TransazioneRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // NUOVO STATO: Configurazione corrente dell'ordinamento
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

    // NUOVA FUNZIONE: Gestisce il cambio di ordinamento
    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'ascending';

        if (sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') {
                direction = 'descending';
            } else if (sortConfig.direction === 'descending') {
                // Ritorna allo stato di non ordinamento
                setSortConfig({ key: null, direction: null });
                return;
            }
        }

        setSortConfig({ key, direction });
    };

    // Gestisce il click sulla riga
    const handleRowClick = (transaction: TransazioneRecord) => {
        // Se il transazione cliccato è già selezionato, deselezionalo
        if (selectedTransaction && selectedTransaction.rowid === transaction.rowid) {
            onTransactionSelect(null);
        } else {
            // Altrimenti, seleziona questo transazione
            onTransactionSelect(transaction);
        }
    };

    // NUOVA FUNZIONE: Evidenziazione del testo trovato
    const highlightMatch = (text: string | undefined | null) => {
        if (!text) return null;
        if (!searchTerm) return text;

        const textUpper = text.toUpperCase();
        // Cerca l'indice della prima occorrenza del termine di ricerca
        const matchIndex = textUpper.indexOf(searchTerm);

        if (matchIndex === -1) {
            return text; // Nessun match
        }

        const length = searchTerm.length;

        // Crea tre parti della stringa: prima del match, match, dopo il match
        const before = text.substring(0, matchIndex);
        const match = text.substring(matchIndex, matchIndex + length);
        const after = text.substring(matchIndex + length);

        return (
            <>
                {before}
                <span className="bg-yellow-300 font-bold rounded px-0.5">{match}</span>
                {after}
            </>
        );
    };

    const fetchTransazioni = async () => {
        setLoading(true);
        setError(null);
        try {
            // Chiama la funzione esposta nel preload script
            const result = await window.electronAPI.getAll('transazioni');

            if (result && 'error' in result) {
                setError(result.error);
            } else if (Array.isArray(result)) {
                // Il casting corretto è a TransazioneRecord[]
                setTransazioni(result as TransazioneRecord[]);
            }
        } catch (e) {
            setError("Errore di comunicazione IPC.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Rimuovi ogni selezione attiva quando la tabella viene montata/aggiornata
        onTransactionSelect(null);
        fetchTransazioni();
        // NOTA: il fetch avviene solo al mount, ma il componente viene rimontato
        // grazie alla 'key' passata dal componente padre (Clienti.tsx)
    }, []);

    if (loading) return <p className="p-4 text-myColor">Caricamento...</p>;
    if (error) return <p className="p-4 text-red-600">Errore: {error}</p>;

    const { showPrices } = usePriceVisibility();

    // NUOVO BLOCCO: Logica di filtraggio
    const filteredTransazioni = transazioni.filter(transaction => {
        if (!searchTerm) return true; // Mostra tutto se la ricerca è vuota

        // Controlla se il termine di ricerca è incluso, in modo case-insensitive, in:
        // id, cliente.ddt, articolo.cod, quantità, dataproduzione, valore, stoccaggio, ecc.
        const matches = (
            transaction.id.toString().toUpperCase().includes(searchTerm) ||
            transaction.ddtCliente.toUpperCase().includes(searchTerm) ||
            transaction.codArticolo.toUpperCase().includes(searchTerm) ||
            transaction.quantita.toString().toUpperCase().includes(searchTerm) ||
            transaction.data.toString().toUpperCase().includes(searchTerm) ||
            (showPrices && transaction.valore.toString().toUpperCase().includes(searchTerm))
        );

        return matches;
    });

    // NUOVO BLOCCO: Logica di Ordinamento
    let sortedTransazioni = [...filteredTransazioni];

    if (sortConfig.key !== null) {
        sortedTransazioni.sort((a, b) => {
            const aValue = String(a[sortConfig.key!]).toUpperCase();
            const bValue = String(b[sortConfig.key!]).toUpperCase();

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    const baseColumns = [
        { key: 'id', label: 'ID' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'ddtCliente', label: 'DDT Cliente' },
        { key: 'codArticolo', label: 'Cod Articolo' },
        { key: 'quantita', label: 'Quantità' },
        { key: 'valore', label: 'Valore' },
        { key: 'data', label: 'Data e Ora' },
    ];

    // 2. Filtra dinamicamente le colonne in base a showPrices
    const displayedColumns = baseColumns.filter(column =>
        showPrices || column.key !== 'valore'
    );

    return (
        <div className="p-0">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-myColor text-white">
                <tr>
                    {/* Definiamo i campi ordinabili e il testo da mostrare */}
                    {(displayedColumns as { key: SortKey, label: string }[]).map(({ key, label }) => (
                        <th
                            key={key}
                            onClick={() => handleSort(key)} // NUOVO: Aggiungi l'handler di click
                            className="py-2 px-4 text-left cursor-pointer hover:bg-myColor/80 transition duration-150"
                        >
                            <div className="flex items-center">
                                <span>{label}</span>
                                {/* Icona di ordinamento dinamica */}
                                {sortConfig.key === key && (
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                                            // Se la direzione è 'ascending' (A->Z/1->9), mostra la freccia su
                                            sortConfig.direction === 'ascending'
                                                ? "M5 15l7-7 7 7"
                                                // Se la direzione è 'descending' (Z->A/9->1), mostra la freccia giù
                                                : "M19 9l-7 7-7-7"
                                        } />
                                    </svg>
                                )}
                            </div>
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {/* RIGA MODIFICATA: Mappa i transazioni ordinati */}
                {sortedTransazioni.map((c) => (
                    <tr
                        key={c.rowid}
                        onClick={() => handleRowClick(c)} // Aggiungi l'handler di click
                        className={`border-b cursor-pointer transition 
                            ${selectedTransaction && selectedTransaction.rowid === c.rowid
                            ? 'bg-yellow-100 border-yellow-400 font-semibold' // Evidenzia se selezionato
                            : 'hover:bg-gray-50'}`} // Classe standard
                    >
                        <td className="py-2 px-4">{highlightMatch(c.id.toString())}</td>
                        <td className="py-2 px-4">
                            {c.tipo === 'in' ? (
                                <span
                                    title="Entrata"
                                    className="flex text-green-600 font-bold"
                                >
                                        {/* Freccia Verde verso il Basso (IN) */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                            <polyline points="19 12 12 19 5 12"></polyline>
                                        </svg>
                                        Entrata
                                    </span>
                            ) : c.tipo === 'out' ? (
                                <span
                                    title="Uscita"
                                    className="flex text-red-600 font-bold"
                                >
                                        {/* Freccia Rossa verso l'Alto (OUT) */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                            <line x1="12" y1="19" x2="12" y2="5"></line>
                                            <polyline points="5 12 12 5 19 12"></polyline>
                                        </svg>
                                        Uscita
                                    </span>
                            ) : (
                                <span
                                    title="Tipo non definito"
                                    className="flex text-gray-400"
                                >
                                        {/* Trattino */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                    </span>
                            )}
                        </td>
                        <td className="py-2 px-4">{highlightMatch(c.ddtCliente)}</td>
                        <td className="py-2 px-4">{highlightMatch(c.codArticolo)}</td>
                        <td className="py-2 px-4">{highlightMatch(c.quantita.toString())}</td>
                        {showPrices &&(
                            <td className="py-2 px-4">{highlightMatch(c.valore.toString())}€</td>
                        )}
                        <td className="py-2 px-4">{highlightMatch(c.data.toString())}</td>
                    </tr>
                ))}
                {/* NUOVO BLOCCO: Messaggio se la ricerca non trova nulla */}
                {filteredTransazioni.length === 0 && searchTerm && (
                    <tr>
                        <td colSpan={displayedColumns.length} className="py-4 px-4 text-center text-gray-500">
                            Nessun risultato trovato per "{searchTerm}"
                        </td>
                    </tr>
                )}
                {/* FINE NUOVO BLOCCO */}
                </tbody>
            </table>
        </div>
    );
};

export default TabellaTransazioni;