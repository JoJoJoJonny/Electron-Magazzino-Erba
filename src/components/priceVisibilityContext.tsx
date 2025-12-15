// src/contexts/PriceVisibilityContext.js
import { createContext, useContext, useState } from 'react';

// 1. Creazione del Contesto
// Il valore predefinito è uno scheletro per il provider
const PriceVisibilityContext = createContext({
    showPrices: false, // Valore iniziale
    togglePrices: () => {}, // Funzione segnaposto
});

// 2. Creazione del Provider
// @ts-ignore
export function PriceVisibilityProvider({ children }) {
    // Lo stato effettivo che verrà condiviso
    const [showPrices, setShowPrices] = useState(false);

    // Funzione per invertire lo stato
    const togglePrices = () => {
        setShowPrices(prev => !prev);
    };

    // L'oggetto che verrà fornito a tutti i componenti che lo consumeranno
    const value = {
        showPrices,
        togglePrices,
    };

    return (
        <PriceVisibilityContext.Provider value={value}>
            {children}
        </PriceVisibilityContext.Provider>
    );
}

// 3. Creazione di un Hook personalizzato per un uso più semplice
export function usePriceVisibility() {
    return useContext(PriceVisibilityContext);
}