//import React from "react";

import React, { useState, useEffect } from 'react';

// Definisco l'interfaccia dei dati del transazione
interface TransazioneInputs {
    id: string;
    tipo: string;
    ddtCliente: string;
    codArticolo: string;
    quantita: number;
    valore: number;
    data: string;
}

// Interfaccia che rappresenta il Transazione completo letto dal DB (include l'ID interno di SQLite)
// L'ID interno sarà usato per l'UPDATE della riga.
export interface TransazioneRecord extends TransazioneInputs {
    rowid: number; // Assumiamo che il DB usi un ID numerico (ROWID) per l'identificazione interna
}


interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
    title: string;
    confirmButtonText: string;
    confirmButtonColor: string; // Tailwind class
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 onConfirm,
                                                                 message,
                                                                 title,
                                                                 confirmButtonText,
                                                                 confirmButtonColor
                                                             }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all">
                <h3 className="text-xl font-bold mb-3 text-red-600 border-b pb-2">{title}</h3>
                <p className="text-gray-700 mb-6">{message}</p>

                <div className="flex justify-end space-x-3">
                    {/* Bottone ANNULLA */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                        Annulla
                    </button>

                    {/* Bottone CONFERMA */}
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white ${confirmButtonColor} rounded-lg shadow-md hover:${confirmButtonColor.replace('-600', '-700')} transition`}
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};




import TabellaTransazioni from '@/components/tabellaTransazioni';

export const Transazioni = () => {

    // NUOVO STATO: Stato per tenere traccia del transazione selezionato (per Modifica/Elimina)
    const [selectedTransaction, setSelectedTransaction] = useState<TransazioneRecord | null>(null);

    // NUOVO STATO: Messaggio di stato globale (per errori/successo operazioni)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

    // NUOVO STATO: Stato per controllare l'apertura/chiusura del modale di CONFERMA eliminazione
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isConfirmAllModalOpen, setIsConfirmAllModalOpen] = useState(false);
    const [isConfirmMonthModalOpen, setIsConfirmMonthModalOpen] = useState(false);

    // Funzione per gestire la selezione di un transazione
    const handleTransactionSelect = (transaction: TransazioneRecord | null) => {
        setSelectedTransaction(transaction);
    };

    // Stato per la chiave di refresh per forzare il ricaricamento della tabella
    const [refreshKey, setRefreshKey] = useState(0);

    // NUOVO STATO: Stato per il termine di ricerca inserito dall'utente
    const [searchTerm, setSearchTerm] = useState('');


    // Ascolta l'evento 'refresh-transazioni' dal processo principale (Electron)
    useEffect(() => {
        if (window.ipcRenderer) {
            // Definiamo il tipo esatto del listener che ci aspettiamo
            type IpcListenerSubscription = (...args: any[]) => void;

            // 1. Usiamo 'any' per consentire l'assegnazione, ignorando il conflitto sul valore di ritorno di 'on'.
            const subscription: any = window.ipcRenderer.on('refresh-transazioni', forceRefresh);

            // 2. La funzione di cleanup usa il casting per dire a TypeScript che 'subscription'
            // è la funzione esatta che 'off' si aspetta.
            return () => {
                // Applichiamo il casting esplicito alla variabile 'subscription'
                // per conformarla al tipo richiesto dal metodo 'off'.
                window.ipcRenderer.off('refresh-transazioni', subscription as IpcListenerSubscription);
            };
        }
    }, []);

    // Gestisce il cambio del testo nella barra di ricerca
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // RIGA MODIFICATA: Salva il testo in maiuscolo per facilitare la ricerca case-insensitive
        setSearchTerm(e.target.value.toUpperCase());
    };

    // NUOVA FUNZIONE: Pulisce la barra di ricerca
    const handleClearSearch = () => {
        setSearchTerm(''); // Pulisce lo stato
    };



    const forceRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1);
        setSelectedTransaction(null); // Deseleziona al refresh
        setMessage(null); // Pulisce il messaggio di stato
    };

    // NUOVO STATO INTERMEDIO per l'eliminazione.
    const handleDelete = () => {
        if (!selectedTransaction || !selectedTransaction.rowid) {
            setMessage({ text: "Nessuna transazione valida selezionata per l'eliminazione.", type: 'error' });
            return;
        }

        // APRI IL MODALE DI CONFERMA (NON BLOCCHIAMO PIÙ IL THREAD)
        setIsConfirmModalOpen(true);
    };

    const handleAllDelete = () => {
        // APRI IL MODALE DI CONFERMA (NON BLOCCHIAMO PIÙ IL THREAD)
        setIsConfirmAllModalOpen(true);
    };

    const handleMonthDelete = () => {
        // APRI IL MODALE DI CONFERMA (NON BLOCCHIAMO PIÙ IL THREAD)
        setIsConfirmMonthModalOpen(true);
    };

    // NUOVA FUNZIONE: Esegue l'eliminazione solo DOPO LA CONFERMA nel modale.
    const confirmDelete = async () => {
        setIsConfirmModalOpen(false); // Chiudi il modale subito

        // Protezione aggiuntiva
        if (!selectedTransaction || !selectedTransaction.rowid) return;

        try {
            // Chiama la funzione IPC passando solo l'ID (ROWID)
            const result = await window.electronAPI.deleteTransazione(selectedTransaction.rowid);

            if (result && 'error' in result) {
                setMessage({ text: `Errore durante l'eliminazione: ${result.error}`, type: 'error' });
            } else {
                setMessage({ text: result.message, type: 'success' });
                // Forza il ricaricamento della tabella e deseleziona il transazione
                forceRefresh();
            }
        } catch (e) {
            setMessage({ text: "Errore di comunicazione IPC durante l'eliminazione.", type: 'error' });
        }
    };

    const confirmAllDelete = async () => {
        setIsConfirmAllModalOpen(false); // Chiudi il modale subito

        try {
            // Chiama la funzione IPC passando solo l'ID (ROWID)
            const result = await window.electronAPI.deleteAllTransazioni();

            if (result && 'error' in result) {
                setMessage({ text: `Errore durante l'eliminazione: ${result.error}`, type: 'error' });
            } else {
                setMessage({ text: result.message, type: 'success' });
                // Forza il ricaricamento della tabella e deseleziona il transazione
                forceRefresh();
            }
        } catch (e) {
            setMessage({ text: "Errore di comunicazione IPC durante l'eliminazione.", type: 'error' });
        }
    };

    const confirmMonthDelete = async () => {
        setIsConfirmMonthModalOpen(false); // Chiudi il modale subito

        try {
            // Chiama la funzione IPC passando solo l'ID (ROWID)
            const result = await window.electronAPI.deleteMonthTransazioni();

            if (result && 'error' in result) {
                setMessage({ text: `Errore durante l'eliminazione: ${result.error}`, type: 'error' });
            } else {
                setMessage({ text: result.message, type: 'success' });
                // Forza il ricaricamento della tabella e deseleziona il transazione
                forceRefresh();
            }
        } catch (e) {
            setMessage({ text: "Errore di comunicazione IPC durante l'eliminazione.", type: 'error' });
        }
    };




    return (
        <div className="p-6 space-y-6">

            {/* 1. Titolo della Pagina */}
            <h1 className="text-3xl font-bold text-gray-800">Gestione Transazioni</h1>

            {/* NUOVO BLOCCO: Messaggio di Stato */}
            {message && (
                <div className={`p-4 rounded-lg shadow-md text-sm font-medium 
                    ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* 2. Barra di Controllo Dinamica (Layout Flex) */}
            <div className="flex items-center space-x-4">

                {/* Gruppo 1: Aggiorna (A sinistra) */}
                <button
                    onClick={forceRefresh} // Chiama la funzione di refresh
                    className="flex items-center px-4 py-2 bg-myColor text-white font-semibold rounded-lg shadow-md hover:bg-myColor/90 transition"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747" />
                        <path d="M20 4v5h-5" />
                    </svg>
                    Aggiorna
                </button>

                {/* Spazio tra Aggiorna e il blocco Aggiungi/Modifica/Elimina */}
                <div className="w-4"></div>

                {/* Gruppo 2: Aggiungi/Modifica/Elimina (Ravvicinati) */}
                <div className="flex space-x-2">
                    {/* Tasto Elimina (Abilitato solo se un transazione è selezionato) */}
                    <button
                        onClick={handleDelete}
                        disabled={!selectedTransaction}
                        className={`flex items-center px-4 py-2 text-white font-semibold rounded-lg shadow-md transition 
                            ${selectedTransaction ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 opacity-50 cursor-not-allowed'}`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Elimina
                    </button>
                </div>

                {/* Spazio per espansione (Spinge gli elementi successivi a destra) */}
                <div className="flex-grow w-4"></div>

                {/* Gruppo 2: Elimina tutte le transazioni */}
                <div className="flex space-x-2">
                    {/* Tasto Elimina (Abilitato solo se un transazione è selezionato) */}
                    <button
                        onClick={handleMonthDelete}
                        className='flex items-center px-4 py-2 text-white font-semibold rounded-lg shadow-md transition bg-red-600 hover:bg-red-700'
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Elimina Prima Mese Corrente
                    </button>
                </div>

                {/* Spazio per espansione (Spinge gli elementi successivi a destra) */}
                <div className="flex-grow w-4"></div>

                {/* Gruppo 2: Elimina tutte le transazioni */}
                <div className="flex space-x-2">
                    {/* Tasto Elimina (Abilitato solo se un transazione è selezionato) */}
                    <button
                        onClick={handleAllDelete}
                        className='flex items-center px-4 py-2 text-white font-semibold rounded-lg shadow-md transition bg-red-600 hover:bg-red-700'
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Elimina TUTTE
                    </button>
                </div>

                {/* Spazio per espansione (Spinge gli elementi successivi a destra) */}
                <div className="flex-grow w-4"></div>

                {/* Gruppo 3: Barra di Ricerca e Filtri (A destra) */}
                <div className="relative w-full sm:w-80">
                    <input
                        type="text"
                        // IMPOSTA IL VALORE E GESTISCI IL CAMBIO (Input Controllato)
                        value={searchTerm.toLowerCase()} // Mostra in minuscolo per una migliore UX
                        onChange={handleSearchChange}
                        placeholder="Cerca per COD, Descrizione, Prezzo..."
                        // Aggiungi padding a destra per l'icona
                        className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm w-full focus:ring-myColor focus:border-myColor transition pr-10"
                    />

                    {/* Icona "X" per pulire, visibile solo se c'è testo */}
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            // Posizionamento assoluto in alto a destra
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                            aria-label="Pulisci ricerca"
                        >
                            {/* Icona SVG per la "X" */}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    )}
                </div>
                {/* FINE MODIFICA */}

            </div>

            {/* 3. Visualizzazione della Tabella Transazioni */}
            <div className="min-h-screen pt-4">
                {/* PASSAGGIO PROPS: selectedTransaction (per evidenziazione) e handleTransactionSelect (per aggiornare lo stato) */}
                <TabellaTransazioni
                    key={refreshKey}
                    onTransactionSelect={handleTransactionSelect}
                    selectedTransaction={selectedTransaction}
                    // NUOVA PROP AGGIUNTA
                    searchTerm={searchTerm}
                />
            </div>

            {/* NUOVO BLOCCO: Modale di conferma eliminazione non bloccante */}
            {selectedTransaction && (
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Conferma Eliminazione Transazione"
                    message={`Sei sicuro di voler eliminare definitivamente la transazione "${selectedTransaction.id}" (ROWID: ${selectedTransaction.rowid})? Quest'azione non può essere annullata.`}
                    confirmButtonText="Sì, Elimina"
                    confirmButtonColor="bg-red-600"
                />
            )}

            <ConfirmationModal
                isOpen={isConfirmMonthModalOpen}
                onClose={() => setIsConfirmMonthModalOpen(false)}
                onConfirm={confirmMonthDelete}
                title="Conferma Eliminazione Transazioni Mese Scorso"
                message={`Sei sicuro di voler eliminare definitivamente le transazioni del MESE SCORSO? Quest'azione non può essere annullata.`}
                confirmButtonText="Sì, Elimina"
                confirmButtonColor="bg-red-600"
            />

            <ConfirmationModal
                isOpen={isConfirmAllModalOpen}
                onClose={() => setIsConfirmAllModalOpen(false)}
                onConfirm={confirmAllDelete}
                title="Conferma Eliminazione Transazioni"
                message={`Sei sicuro di voler eliminare definitivamente TUTTE le transazioni? Quest'azione non può essere annullata.`}
                confirmButtonText="Sì, Elimina"
                confirmButtonColor="bg-red-600"
            />
        </div>
    );
};
