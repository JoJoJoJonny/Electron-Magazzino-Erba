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

    // Comunicazione asincrona (per il refresh della tabella)
    on: (channel: string, listener: (...args: any[]) => void) => () => void;
    off: (channel: string, listener: (...args: any[]) => void) => void;

    // TODO: ... altre API
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
        ipcRenderer: IIpcRenderer;
    }
}