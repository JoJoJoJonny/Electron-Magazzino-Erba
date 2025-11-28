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






import TabellaClienti from '@/components/tabellaClienti';

export const Clienti = () => {
    // Stato per controllare l'apertura/chiusura del modale
    const [isModalOpen, setIsModalOpen] = useState(false);

    // NUOVO STATO: Chiave di refresh per forzare il ricaricamento della tabella
    const [refreshKey, setRefreshKey] = useState(0);

    // Funzione per forzare il refresh (incrementa la chiave)
    const forceRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

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

    // Placeholder per la funzione di ricerca (da implementare in seguito)
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Ricerca in corso:", e.target.value);
    };

    return (
        <div className="p-6 space-y-6">

            {/* 1. Titolo della Pagina */}
            <h1 className="text-3xl font-bold text-gray-800">Gestione Clienti</h1>

            {/* 2. Barra di Controllo Dinamica (Layout Flex) */}
            <div className="flex items-center space-x-4">

                {/* Gruppo 1: Aggiorna (A sinistra) */}
                <button
                    onClick={forceRefresh} // Chiama la funzione di refresh
                    className="flex items-center px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.34 19M7 11V6h5m-.582 5A8.001 8.001 0 0119.66 5"></path></svg>
                    Aggiorna
                </button>

                {/* Spazio tra Aggiorna e il blocco Aggiungi/Modifica/Elimina */}
                <div className="w-4"></div>

                {/* Gruppo 2: Aggiungi/Modifica/Elimina (Ravvicinati) */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsModalOpen(true)} // Apre il modale di aggiunta
                        className="flex items-center px-4 py-2 bg-myColor text-white font-semibold rounded-lg shadow-md hover:bg-myColor/90 transition"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Aggiungi
                    </button>

                    {/* Placeholder per Modifica e Elimina */}
                    <button
                        disabled // Disabilitato per ora
                        className="flex items-center px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md opacity-50 cursor-not-allowed"
                    >
                        Modifica
                    </button>
                    <button
                        disabled // Disabilitato per ora
                        className="flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md opacity-50 cursor-not-allowed"
                    >
                        Elimina
                    </button>
                </div>

                {/* Spazio per espansione (Spinge gli elementi successivi a destra) */}
                <div className="flex-grow w-4"></div>

                {/* Gruppo 3: Barra di Ricerca e Filtri (A destra) */}
                <input
                    type="text"
                    placeholder="Cerca per DDT, Nome, P.IVA..."
                    onChange={handleSearchChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm w-80 focus:ring-myColor focus:border-myColor transition"
                />

                {/* Tasto Filtri */}
                <button
                    disabled // Disabilitato per ora
                    className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md opacity-50 cursor-not-allowed transition"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v7l-4 4v-7a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                    Filtri
                </button>

            </div>

            {/* 3. Visualizzazione della Tabella Clienti */}
            <div className="min-h-screen pt-4">
                <TabellaClienti key={refreshKey} /> {/* Passiamo la chiave per il refresh */}
            </div>

            {/* 4. Inclusione del Modale */}
            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};
