//import React from "react";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

// Definisco l'interfaccia dei dati del cliente
interface ClienteInputs {
    ddt: string;
    piva: string;
    nome: string;
    telefono: string;
    email: string;
}

// Interfaccia che rappresenta il Cliente completo letto dal DB (include l'ID interno di SQLite)
// L'ID interno sarà usato per l'UPDATE della riga.
export interface ClienteRecord extends ClienteInputs {
    id: number; // Assumiamo che il DB usi un ID numerico (ROWID) per l'identificazione interna
}

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose }) => {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ClienteInputs>();
    const [statusMessage, setStatusMessage] = useState('');

    if (!isOpen) return null;

    const onSubmit: SubmitHandler<ClienteInputs> = async (data) => {
        setStatusMessage('Salvataggio in corso...');

        try {
            const result = await window.ipcRenderer.invoke('db-insert-cliente', data);

            if (result && result.success) {
                setStatusMessage('Cliente inserito con successo!');
                reset();
                onClose();
            } else {
                setStatusMessage(`Errore: ${result.error || 'Impossibile salvare i dati.'}`);
            }
        } catch (error) {
            console.error('Errore IPC:', error);
            setStatusMessage('Errore di comunicazione con il database.');
        }
    };

    const handleClose = () => {
        reset();
        setStatusMessage('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4 text-myColor">Aggiungi Nuovo Cliente</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Campo DDT */}
                    <div>
                        <label htmlFor="ddt" className="block text-sm font-medium text-gray-700">DDT *</label>
                        <input
                            id="ddt"
                            type="text"
                            {...register("ddt", { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-myColor focus:border-myColor"
                        />
                    </div>

                    {/* Campo Partita IVA */}
                    <div>
                        <label htmlFor="piva" className="block text-sm font-medium text-gray-700">P. IVA *</label>
                        <input
                            id="piva"
                            type="text"
                            {...register("piva", { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-myColor focus:border-myColor"
                        />
                    </div>

                    {/* Campo Nome */}
                    <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome/Ragione Sociale *</label>
                        <input
                            id="nome"
                            type="text"
                            {...register("nome", { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-myColor focus:border-myColor"
                        />
                    </div>

                    {/* Campo Telefono */}
                    <div>
                        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Telefono</label>
                        <input
                            id="telefono"
                            type="tel"
                            {...register("telefono")}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-myColor focus:border-myColor"
                        />
                    </div>

                    {/* Campo Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            {...register("email")}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-myColor focus:border-myColor"
                        />
                    </div>

                    {/* Messaggio di stato */}
                    {statusMessage && (
                        <p className={`text-center p-2 rounded text-sm ${statusMessage.startsWith('Errore') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {statusMessage}
                        </p>
                    )}

                    {/* Bottoni di Azione */}
                    <div className="flex justify-end space-x-4 pt-4">
                        {/* Bottone ANNULLA */}
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition disabled:opacity-50"
                        >
                            Annulla
                        </button>

                        {/* Bottone CONFERMA */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 text-sm font-medium text-white bg-myColor rounded-lg shadow-md hover:bg-myColor/90 transition disabled:opacity-50"
                        >
                            {isSubmitting ? 'Salvataggio...' : 'Conferma Inserimento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};




interface EditClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientToEdit: ClienteRecord; // Il cliente da popolare e modificare
    forceRefresh: () => void;
}

// ... (omissis)
const EditClientModal: React.FC<EditClientModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             clientToEdit,
                                                             forceRefresh
                                                         }) => {
    // Usiamo 'useForm' con il tipo ClienteInputs (che è l'output del form)
    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
        setValue,
        watch
    } = useForm<ClienteInputs>({
        // Passiamo i valori del record per i default. React Hook Form li accetterà.
        defaultValues: {
            ddt: clientToEdit.ddt,
            piva: clientToEdit.piva,
            nome: clientToEdit.nome,
            telefono: clientToEdit.telefono,
            email: clientToEdit.email,
        }
    });
    const [statusMessage, setStatusMessage] = useState('');

    // Stato calcolato per sapere se i dati sono cambiati
    // Confrontiamo i valori correnti del form (formValues, tipo ClienteInputs)
    // con i valori iniziali (clientToEdit, tipo ClienteRecord)
    const formValues = watch();

    // Dobbiamo ciclare solo sulle chiavi che esistono in ClienteInputs
    const keysToCompare: (keyof ClienteInputs)[] = ['ddt', 'piva', 'nome', 'telefono', 'email'];

    // Controlla se almeno uno dei campi è diverso
    const isDirty = keysToCompare.some(key => formValues[key] !== clientToEdit[key]);


    // Effetto per aggiornare i valori del form se il cliente da editare cambia
    // Questo è cruciale quando si seleziona un NUOVO cliente per la modifica.
    useEffect(() => {
        if (clientToEdit) {
            // Usiamo clientToEdit.id come trigger per resettare lo stato interno del form
            // e forzare l'aggiornamento dei campi.
            // NON possiamo confrontare clientToEdit.id con formValues.id perché formValues non ha un campo id!
            setValue('ddt', clientToEdit.ddt);
            setValue('piva', clientToEdit.piva);
            setValue('nome', clientToEdit.nome);
            setValue('telefono', clientToEdit.telefono);
            setValue('email', clientToEdit.email);

            // Resettiamo eventuali errori e messaggi di stato
            setStatusMessage('');
        }
    }, [clientToEdit, setValue]); // Dipendiamo solo da clientToEdit e setValue

    if (!isOpen) return null;
// ... (il resto del componente continua normalmente)

    const onSubmit: SubmitHandler<ClienteInputs> = async (data) => {
        setStatusMessage('Salvataggio modifiche in corso...');

        try {
            // Chiamata IPC per l'aggiornamento
            // NOTA: Passiamo sia i dati aggiornati che l'ID interno per la WHERE
            const result = await window.ipcRenderer.invoke('db-update-cliente', {
                // Passiamo l'ID del record e il DDT *originale* se ne avessimo bisogno.
                // Per ora, ci affidiamo all'ID interno (ROWID) per la lookup.
                id: clientToEdit.id,
                // Passiamo i dati modificati, inclusa la nuova ddt
                ...data
            });

            if (result && result.success) {
                setStatusMessage('Cliente aggiornato con successo!');
                // Non resettiamo subito il form per mostrare il messaggio di successo,
                // ma chiudiamo il modale per far vedere i nuovi dati in tabella.
                onClose();
                forceRefresh(); // Forziamo il refresh della tabella
            } else {
                setStatusMessage(`Errore: ${result.error || 'Impossibile aggiornare i dati.'}`);
            }
        } catch (error) {
            console.error('Errore IPC:', error);
            setStatusMessage('Errore di comunicazione con il database.');
        }
    };

    const handleClose = () => {
        reset();
        setStatusMessage('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4 text-yellow-600">Modifica Cliente ID Interno: {clientToEdit.id}</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Campo DDT (ORA MODIFICABILE - LA CHIAVE PRIMARIA) */}
                    <div>
                        <label htmlFor="ddt" className="block text-sm font-medium text-gray-700">DDT (Chiave Primaria) *</label>
                        <input
                            id="ddt"
                            type="text"
                            {...register("ddt", { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-600 focus:border-yellow-600"
                        />
                    </div>

                    {/* Campo Partita IVA */}
                    <div>
                        <label htmlFor="piva" className="block text-sm font-medium text-gray-700">P. IVA *</label>
                        <input
                            id="piva"
                            type="text"
                            {...register("piva", { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-600 focus:border-yellow-600"
                        />
                    </div>

                    {/* Campo Nome */}
                    <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome/Ragione Sociale *</label>
                        <input
                            id="nome"
                            type="text"
                            {...register("nome", { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-600 focus:border-yellow-600"
                        />
                    </div>

                    {/* Campo Telefono */}
                    <div>
                        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Telefono</label>
                        <input
                            id="telefono"
                            type="tel"
                            {...register("telefono")}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-600 focus:border-yellow-600"
                        />
                    </div>

                    {/* Campo Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            {...register("email")}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-600 focus:border-yellow-600"
                        />
                    </div>

                    {/* Messaggio di stato */}
                    {statusMessage && (
                        <p className={`text-center p-2 rounded text-sm ${statusMessage.startsWith('Errore') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {statusMessage}
                        </p>
                    )}

                    {/* Bottoni di Azione */}
                    <div className="flex justify-end space-x-4 pt-4">
                        {/* Bottone ANNULLA */}
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition disabled:opacity-50"
                        >
                            Annulla Modifica
                        </button>

                        {/* Bottone CONFERMA */}
                        <button
                            type="submit"
                            // Il tasto è disabilitato se sta sottomettendo O se i dati non sono cambiati
                            disabled={isSubmitting || !isDirty}
                            className="px-6 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg shadow-md hover:bg-yellow-700 transition disabled:opacity-50"
                        >
                            {isSubmitting ? 'Aggiornamento...' : 'Conferma Modifiche'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- NUOVO COMPONENTE: MODALE DI CONFERMA ---

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




import TabellaClienti from '@/components/tabellaClienti';

export const Clienti = () => {
    // Stato per controllare l'apertura/chiusura del modale di AGGIUNTA
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // NUOVO STATO: Stato per controllare l'apertura/chiusura del modale di MODIFICA
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // NUOVO STATO: Stato per tenere traccia del cliente selezionato (per Modifica/Elimina)
    const [selectedClient, setSelectedClient] = useState<ClienteRecord | null>(null);

    // NUOVO STATO: Messaggio di stato globale (per errori/successo operazioni)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

    // NUOVO STATO: Stato per controllare l'apertura/chiusura del modale di CONFERMA eliminazione
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // Funzione per gestire la selezione di un cliente
    const handleClientSelect = (client: ClienteRecord | null) => {
        setSelectedClient(client);
    };

    // Funzione per aprire il modale di modifica
    const openEditModal = () => {
        if (selectedClient) {
            setIsEditModalOpen(true);
        }
    };

    // Funzione per chiudere il modale di modifica e pulire lo stato di selezione
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedClient(null);
    };

    // Funzione per aprire il modale di aggiunta
    const openAddModal = () => {
        setSelectedClient(null); // Assicurati che non ci siano selezioni attive
        setIsAddModalOpen(true);
    };

    // Funzione per chiudere il modale di aggiunta
    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    // Stato per la chiave di refresh per forzare il ricaricamento della tabella
    const [refreshKey, setRefreshKey] = useState(0);

    // NUOVO STATO: Stato per il termine di ricerca inserito dall'utente
    const [searchTerm, setSearchTerm] = useState('');


    // Ascolta l'evento 'refresh-clienti' dal processo principale (Electron)
    useEffect(() => {
        if (window.ipcRenderer) {
            // Definiamo il tipo esatto del listener che ci aspettiamo
            type IpcListenerSubscription = (...args: any[]) => void;

            // 1. Usiamo 'any' per consentire l'assegnazione, ignorando il conflitto sul valore di ritorno di 'on'.
            const subscription: any = window.ipcRenderer.on('refresh-clienti', forceRefresh);

            // 2. La funzione di cleanup usa il casting per dire a TypeScript che 'subscription'
            // è la funzione esatta che 'off' si aspetta.
            return () => {
                // Applichiamo il casting esplicito alla variabile 'subscription'
                // per conformarla al tipo richiesto dal metodo 'off'.
                window.ipcRenderer.off('refresh-clienti', subscription as IpcListenerSubscription);
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
        setSelectedClient(null); // Deseleziona al refresh
        setMessage(null); // Pulisce il messaggio di stato
    };

    // NUOVO STATO INTERMEDIO per l'eliminazione.
    const handleDelete = () => {
        if (!selectedClient || !selectedClient.id) {
            setMessage({ text: "Nessun cliente valido selezionato per l'eliminazione.", type: 'error' });
            return;
        }

        // APRI IL MODALE DI CONFERMA (NON BLOCCHIAMO PIÙ IL THREAD)
        setIsConfirmModalOpen(true);
    };

    // NUOVA FUNZIONE: Esegue l'eliminazione solo DOPO LA CONFERMA nel modale.
    const confirmDelete = async () => {
        setIsConfirmModalOpen(false); // Chiudi il modale subito

        // Protezione aggiuntiva
        if (!selectedClient || !selectedClient.id) return;

        try {
            // Chiama la funzione IPC passando solo l'ID (ROWID)
            const result = await window.electronAPI.deleteCliente(selectedClient.id);

            if (result && 'error' in result) {
                setMessage({ text: `Errore durante l'eliminazione: ${result.error}`, type: 'error' });
            } else {
                setMessage({ text: result.message, type: 'success' });
                // Forza il ricaricamento della tabella e deseleziona il cliente
                forceRefresh();
            }
        } catch (e) {
            setMessage({ text: "Errore di comunicazione IPC durante l'eliminazione.", type: 'error' });
        }
    };




    return (
        <div className="p-6 space-y-6">

            {/* 1. Titolo della Pagina */}
            <h1 className="text-3xl font-bold text-gray-800">Gestione Clienti</h1>

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
                    <button
                        onClick={openAddModal} // Usa la nuova funzione
                        className="flex items-center px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Aggiungi
                    </button>

                    {/* Tasto Modifica (Abilitato solo se un cliente è selezionato) */}
                    <button
                        onClick={openEditModal}
                        disabled={!selectedClient} // Disabilita se selectedClient è null
                        className={`flex items-center px-4 py-2 text-white font-semibold rounded-lg shadow-md transition 
                            ${selectedClient ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-yellow-300 opacity-50 cursor-not-allowed'}`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        Modifica
                    </button>

                    {/* Tasto Elimina (Abilitato solo se un cliente è selezionato) */}
                    <button
                        onClick={handleDelete}
                        disabled={!selectedClient}
                        className={`flex items-center px-4 py-2 text-white font-semibold rounded-lg shadow-md transition 
                            ${selectedClient ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 opacity-50 cursor-not-allowed'}`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Elimina
                    </button>
                </div>

                {/* Spazio per espansione (Spinge gli elementi successivi a destra) */}
                <div className="flex-grow w-4"></div>

                {/* Gruppo 3: Barra di Ricerca */}
                <div className="relative w-full sm:w-80">
                    <input
                        type="text"
                        // IMPOSTA IL VALORE E GESTISCI IL CAMBIO (Input Controllato)
                        value={searchTerm.toLowerCase()} // Mostra in minuscolo per una migliore UX
                        onChange={handleSearchChange}
                        placeholder="Cerca per DDT, P.IVA, Nome..."
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

            {/* 3. Visualizzazione della Tabella Clienti */}
            <div className="min-h-screen pt-4">
                {/* PASSAGGIO PROPS: selectedClient (per evidenziazione) e handleClientSelect (per aggiornare lo stato) */}
                <TabellaClienti
                    key={refreshKey}
                    onClientSelect={handleClientSelect}
                    selectedClient={selectedClient}
                    // NUOVA PROP AGGIUNTA
                    searchTerm={searchTerm}
                />
            </div>

            {/* 4. Inclusione dei Modali */}
            <AddClientModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
            />

            {/* Il Modale Modifica compare SOLO se un cliente è selezionato */}
            {selectedClient && (
                <EditClientModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    clientToEdit={selectedClient}
                    forceRefresh={forceRefresh}
                />
            )}

            {/* NUOVO BLOCCO: Modale di conferma eliminazione non bloccante */}
            {selectedClient && (
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Conferma Eliminazione Cliente"
                    message={`Sei sicuro di voler eliminare definitivamente il cliente "${selectedClient.nome}" (ID: ${selectedClient.id})? Quest'azione non può essere annullata.`}
                    confirmButtonText="Sì, Elimina"
                    confirmButtonColor="bg-red-600"
                />
            )}
        </div>
    );
};
