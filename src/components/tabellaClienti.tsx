import React, { useEffect, useState } from 'react';
// Importiamo l'interfaccia ClienteRecord dal componente padre
import { ClienteRecord } from '@/pages/clienti';

// Definisci le props che riceverà TabellaClienti dal genitore
interface TabellaClientiProps {
    // Funzione chiamata quando un cliente viene selezionato (o deselezionato)
    onClientSelect: (client: ClienteRecord | null) => void;
    // Il cliente attualmente selezionato (per evidenziazione e confronto)
    selectedClient: ClienteRecord | null;
    // NUOVA RIGA: Termine di ricerca ricevuto dal componente padre
    searchTerm: string;
}

// NUOVO BLOCCO: Interfacce per la gestione dell'ordinamento
type SortKey = keyof ClienteRecord | 'rowid'; // Le chiavi su cui possiamo ordinare
type SortDirection = 'ascending' | 'descending' | null;

interface SortConfig {
    key: SortKey | null;
    direction: SortDirection;
}

// MODIFICA DELLA RIGA:
const TabellaClienti: React.FC<TabellaClientiProps> = ({ onClientSelect, selectedClient, searchTerm }) => {
    // Utilizziamo l'interfaccia corretta ClienteRecord
// ...    // Utilizziamo l'interfaccia corretta ClienteRecord
    const [clienti, setClienti] = useState<ClienteRecord[]>([]);
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
    const handleRowClick = (client: ClienteRecord) => {
        // Se il cliente cliccato è già selezionato, deselezionalo
        if (selectedClient && selectedClient.rowid === client.rowid) {
            onClientSelect(null);
        } else {
            // Altrimenti, seleziona questo cliente
            onClientSelect(client);
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

    const fetchClienti = async () => {
        setLoading(true);
        setError(null);
        try {
            // Chiama la funzione esposta nel preload script
            const result = await window.electronAPI.getAll('clienti');

            if (result && 'error' in result) {
                setError(result.error);
            } else if (Array.isArray(result)) {
                // Il casting corretto è a ClienteRecord[]
                setClienti(result as ClienteRecord[]);
            }
        } catch (e) {
            setError("Errore di comunicazione IPC.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Rimuovi ogni selezione attiva quando la tabella viene montata/aggiornata
        onClientSelect(null);
        fetchClienti();
        // NOTA: il fetch avviene solo al mount, ma il componente viene rimontato
        // grazie alla 'key' passata dal componente padre (Clienti.tsx)
    }, []);

    if (loading) return <p className="p-4 text-myColor">Caricamento...</p>;
    if (error) return <p className="p-4 text-red-600">Errore: {error}</p>;

    // NUOVO BLOCCO: Logica di filtraggio
    const filteredClienti = clienti.filter(client => {
        if (!searchTerm) return true; // Mostra tutto se la ricerca è vuota

        // Controlla se il termine di ricerca è incluso, in modo case-insensitive, in:
        // DDT, P.IVA, Nome, Telefono, Email.
        const matches = (
            client.ddt.toUpperCase().includes(searchTerm) ||
            client.nome.toUpperCase().includes(searchTerm) ||
            client.piva.toUpperCase().includes(searchTerm) ||
            client.telefono.toUpperCase().includes(searchTerm) ||
            client.email.toUpperCase().includes(searchTerm) ||
            client.indirizzo.toUpperCase().includes(searchTerm)
        );

        return matches;
    });

    // NUOVO BLOCCO: Logica di Ordinamento
    let sortedClienti = [...filteredClienti];

    if (sortConfig.key !== null) {
        sortedClienti.sort((a, b) => {
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

    return (
        <div className="p-0">
            <table className="w-full table-auto bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-myColor text-white">
                <tr>
                    {/* Definiamo i campi ordinabili e il testo da mostrare */}
                    {([
                        { key: 'ddt', label: 'DDT' },
                        { key: 'nome', label: 'Nome' },
                        { key: 'piva', label: 'P.Iva' },
                        { key: 'telefono', label: 'Telefono' },
                        { key: 'email', label: 'Email' },
                        { key: 'indirizzo', label: 'Indirizzo' },
                    ] as { key: SortKey, label: string }[]).map(({ key, label }) => (
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
                {/* RIGA MODIFICATA: Mappa i clienti ordinati */}
                {sortedClienti.map((c) => (
                    <tr
                        key={c.rowid}
                        onClick={() => handleRowClick(c)} // Aggiungi l'handler di click
                        className={`border-b cursor-pointer transition 
                            ${selectedClient && selectedClient.rowid === c.rowid
                            ? 'bg-yellow-100 border-yellow-400 font-semibold' // Evidenzia se selezionato
                            : 'hover:bg-gray-50'}`} // Classe standard
                    >
                        {/* RIGHE MODIFICATE: Applica highlightMatch a tutte le celle */}
                        <td className="py-2 px-4">{highlightMatch(c.ddt)}</td>
                        <td className="py-2 px-4">{highlightMatch(c.nome)}</td>
                        <td className="py-2 px-4">{highlightMatch(c.piva)}</td>
                        <td className="py-2 px-4">{highlightMatch(c.telefono)}</td>
                        <td className="py-2 px-4">{highlightMatch(c.email)}</td>
                        <td className="py-2 px-4">{highlightMatch(c.indirizzo)}</td>
                    </tr>
                ))}
                {/* NUOVO BLOCCO: Messaggio se la ricerca non trova nulla */}
                {filteredClienti.length === 0 && searchTerm && (
                    <tr>
                        <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
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

export default TabellaClienti;