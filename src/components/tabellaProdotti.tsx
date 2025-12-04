import React, { useEffect, useState } from 'react';
// Importiamo l'interfaccia ProdottoRecord dal componente padre
import { ProdottoRecord } from '@/pages/prodotti';

// Definisci le props che riceverà TabellaProdotti dal genitore
interface TabellaProdottiProps {
    // Funzione chiamata quando un prodotto viene selezionato (o deselezionato)
    onProductSelect: (product: ProdottoRecord | null) => void;
    // Il prodotto attualmente selezionato (per evidenziazione e confronto)
    selectedProduct: ProdottoRecord | null;
    // NUOVA RIGA: Termine di ricerca ricevuto dal componente padre
    searchTerm: string;
}

// NUOVO BLOCCO: Interfacce per la gestione dell'ordinamento
type SortKey = keyof ProdottoRecord | 'rowid'; // Le chiavi su cui possiamo ordinare
type SortDirection = 'ascending' | 'descending' | null;

interface SortConfig {
    key: SortKey | null;
    direction: SortDirection;
}

// MODIFICA DELLA RIGA:
const TabellaProdotti: React.FC<TabellaProdottiProps> = ({ onProductSelect, selectedProduct, searchTerm }) => {
    // Utilizziamo l'interfaccia corretta ProdottoRecord
// ...    // Utilizziamo l'interfaccia corretta ProdottoRecord
    const [prodotti, setProdotti] = useState<ProdottoRecord[]>([]);
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
    const handleRowClick = (product: ProdottoRecord) => {
        // Se il prodotto cliccato è già selezionato, deselezionalo
        if (selectedProduct && selectedProduct.rowid === product.rowid) {
            onProductSelect(null);
        } else {
            // Altrimenti, seleziona questo prodotto
            onProductSelect(product);
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

    const fetchProdotti = async () => {
        setLoading(true);
        setError(null);
        try {
            // Chiama la funzione esposta nel preload script
            const result = await window.electronAPI.getAll('prodotti');

            if (result && 'error' in result) {
                setError(result.error);
            } else if (Array.isArray(result)) {
                // Il casting corretto è a ProdottoRecord[]
                setProdotti(result as ProdottoRecord[]);
            }
        } catch (e) {
            setError("Errore di comunicazione IPC.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Rimuovi ogni selezione attiva quando la tabella viene montata/aggiornata
        onProductSelect(null);
        fetchProdotti();
        // NOTA: il fetch avviene solo al mount, ma il componente viene rimontato
        // grazie alla 'key' passata dal componente padre (Clienti.tsx)
    }, []);

    if (loading) return <p className="p-4 text-myColor">Caricamento...</p>;
    if (error) return <p className="p-4 text-red-600">Errore: {error}</p>;

    // NUOVO BLOCCO: Logica di filtraggio
    const filteredProdotti = prodotti.filter(product => {
        if (!searchTerm) return true; // Mostra tutto se la ricerca è vuota

        // Controlla se il termine di ricerca è incluso, in modo case-insensitive, in:
        // id, cliente.ddt, articolo.cod, quantità, dataproduzione, valore, stoccaggio, ecc.
        const matches = (
            product.id.toString().toUpperCase().includes(searchTerm) ||
            product.ddtCliente.toUpperCase().includes(searchTerm) ||
            product.codArticolo.toUpperCase().includes(searchTerm) ||
            product.quantita.toString().toUpperCase().includes(searchTerm) ||
            product.dataProduzione.toString().toUpperCase().includes(searchTerm) ||
            product.valore.toString().toUpperCase().includes(searchTerm) ||
            product.stoccaggio.toUpperCase().includes(searchTerm)
        );

        return matches;
    });

    // NUOVO BLOCCO: Logica di Ordinamento
    let sortedProdotti = [...filteredProdotti];

    if (sortConfig.key !== null) {
        sortedProdotti.sort((a, b) => {
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
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-myColor text-white">
                <tr>
                    {/* Definiamo i campi ordinabili e il testo da mostrare */}
                    {([
                        { key: 'id', label: 'ID' },
                        { key: 'ddtCliente', label: 'DDT Cliente' },
                        { key: 'codArticolo', label: 'Cod Articolo' },
                        { key: 'quantita', label: 'Quantità' },
                        { key: 'dataProduzione', label: 'Data Produzione' },
                        { key: 'valore', label: 'Valore' },
                        { key: 'stoccaggio', label: 'Stoccaggio' },
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
                {/* RIGA MODIFICATA: Mappa i prodotti ordinati */}
                {sortedProdotti.map((c) => (
                    <tr
                        key={c.rowid}
                        onClick={() => handleRowClick(c)} // Aggiungi l'handler di click
                        className={`border-b cursor-pointer transition 
                            ${selectedProduct && selectedProduct.rowid === c.rowid
                            ? 'bg-yellow-100 border-yellow-400 font-semibold' // Evidenzia se selezionato
                            : 'hover:bg-gray-50'}`} // Classe standard
                    >
                        {/* RIGHE MODIFICATE: Applica highlightMatch a tutte le celle */}
                        <td className="py-2 px-4">{highlightMatch(c.id.toString())}</td>
                        <td className="py-2 px-4">{highlightMatch(c.ddtCliente)}</td>
                        <td className="py-2 px-4">{highlightMatch(c.codArticolo)}</td>
                        <td className="py-2 px-4">{highlightMatch(c.quantita.toString())}</td>
                        <td className="py-2 px-4">{highlightMatch(c.dataProduzione.toString())}</td>
                        <td className="py-2 px-4">{highlightMatch(c.valore.toString())}€</td>
                        <td className="py-2 px-4">{highlightMatch(c.stoccaggio)}</td>
                    </tr>
                ))}
                {/* NUOVO BLOCCO: Messaggio se la ricerca non trova nulla */}
                {filteredProdotti.length === 0 && searchTerm && (
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

export default TabellaProdotti;