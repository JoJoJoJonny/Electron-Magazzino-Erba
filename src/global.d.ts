export interface IElectronAPI {
    getAll: (tableName: string) => Promise<any[] | { error: string }>;
    insertCliente: (data: any) => Promise<{ success: boolean, lastInsertRowid?: number } | { error: string }>;
    // TODO: ... altre API
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}