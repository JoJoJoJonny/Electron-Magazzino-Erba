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

// MODIFICA DELLA RIGA:
const TabellaClienti: React.FC<TabellaClientiProps> = ({ onClientSelect, selectedClient, searchTerm }) => {
    // Utilizziamo l'interfaccia corretta ClienteRecord
// ...    // Utilizziamo l'interfaccia corretta ClienteRecord
    const [clienti, setClienti] = useState<ClienteRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Gestisce il click sulla riga
    const handleRowClick = (client: ClienteRecord) => {
        // Se il cliente cliccato è già selezionato, deselezionalo
        if (selectedClient && selectedClient.id === client.id) {
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
            client.piva.toUpperCase().includes(searchTerm) ||
            client.nome.toUpperCase().includes(searchTerm) ||
            (client.telefono || '').toUpperCase().includes(searchTerm) || // Gestisce null/undefined
            (client.email || '').toUpperCase().includes(searchTerm)
        );

        return matches;
    });

    return (
        <div className="p-0">
            {/* Tasto Aggiorna rimosso: gestito dal componente padre */}
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-myColor text-white">
                <tr>
                    <th className="py-2 px-4 text-left">DDT</th>
                    <th className="py-2 px-4 text-left">P.Iva</th>
                    <th className="py-2 px-4 text-left">Nome</th>
                    <th className="py-2 px-4 text-left">Telefono</th>
                    <th className="py-2 px-4 text-left">Email</th>
                </tr>
                </thead>
                <tbody>
                {/* RIGA MODIFICATA: Mappa i clienti filtrati */}
                {filteredClienti.map((c) => (
                    <tr
                        key={c.id}
                        onClick={() => handleRowClick(c)} // Aggiungi l'handler di click
                        className={`border-b cursor-pointer transition 
                            ${selectedClient && selectedClient.id === c.id
                            ? 'bg-yellow-100 border-yellow-400 font-semibold' // Evidenzia se selezionato
                            : 'hover:bg-gray-50'}`} // Classe standard
                    >
                        {/* RIGHE MODIFICATE: Applica highlightMatch a tutte le celle */}
                        <td className="py-2 px-4">{highlightMatch(c.ddt)}</td>
                        <td className="py-2 px-4">{highlightMatch(c.piva)}</td>
                        <td className="py-2 px-4">{highlightMatch(c.nome)}</td>
                        <td className="py-2 px-4">{highlightMatch(c.telefono)}</td>
                        <td className="py-2 px-4">{highlightMatch(c.email)}</td>
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