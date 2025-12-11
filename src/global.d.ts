// Nuova interfaccia che riflette ESATTAMENTE i metodi esposti in preload.ts
export interface IIpcRenderer {
    on: (channel: string, func: (...args: any[]) => void) => (...args: any[]) => void;
    off: (channel: string, subscription: (...args: any[]) => void) => void;
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
}

export interface IElectronAPI {
    getAll: (tableName: string) => Promise<any[] | { error: string }>;

    //CRUD - clienti
    insertCliente: (data: any) => Promise<{ success: boolean, lastInsertRowid?: number } | { error: string }>;
    updateCliente: (data: any) => Promise<{ success: boolean, changes?: number, message: string } | { error: string }>;
    deleteCliente: (id: number) => Promise<{ success: boolean, changes?: number, message: string } | { error: string }>;

    //CRUD - Articoli
    insertArticolo: (data: any) => Promise<{ success: boolean, lastInsertRowid?: number } | { error: string }>;
    updateArticolo: (data: any) => Promise<{ success: boolean, changes?: number, message: string } | { error: string }>;
    deleteArticolo: (id: number) => Promise<{ success: boolean, changes?: number, message: string } | { error: string }>;

    //CRUD - Prodotti
    insertProdotto: (data: any) => Promise<{ success: boolean, lastInsertRowid?: number } | { error: string }>;
    updateProdotto: (data: any) => Promise<{ success: boolean, changes?: number, message: string } | { error: string }>;
    deleteProdotto: (id: number) => Promise<{ success: boolean, changes?: number, message: string } | { error: string }>;

    //CRUD - semilavorati
    insertSemilavorato: (data: any) => Promise<{ success: boolean, lastInsertRowid?: number } | { error: string }>;
    updateSemilavorato: (data: any) => Promise<{ success: boolean, changes?: number, message: string } | { error: string }>;
    deleteSemilavorato: (id: number) => Promise<{ success: boolean, changes?: number, message: string } | { error: string }>;

    //CRUD - Attrezzature
    insertAttrezzatura: (data: any) => Promise<{ success: boolean, lastInsertRowid?: number } | { error: string }>;
    updateAttrezzatura: (data: any) => Promise<{ success: boolean, changes?: number, message: string } | { error: string }>;
    deleteAttrezzatura: (id: number) => Promise<{ success: boolean, changes?: number, message: string } | { error: string }>;

    // CRUD - transazioni
    deleteTransazione: (id: number) => Promise<{ success: boolean, changes?: number, message: string } | { error: string }>;
    deleteMonthTransazioni: () => Promise<{ success: boolean, changes?: number, message: string } | { error: string }>;
    deleteAllTransazioni: () => Promise<{ success: boolean, changes?: number, message: string } | { error: string }>;

    // CRUD - statistiche
    getStatistiche: () => Promise<any[] | { error: string }>;

    // Comunicazione asincrona (per il refresh della tabella)
    on: (channel: string, listener: (...args: any[]) => void) => () => void;
    off: (channel: string, listener: (...args: any[]) => void) => void;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
        ipcRenderer: IIpcRenderer;
    }
}