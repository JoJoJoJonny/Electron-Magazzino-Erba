import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(channel: string, func: (...args: any[]) => void) {
    // La funzione di sottoscrizione nasconde l'oggetto 'event' di Electron
    const subscription = (_event: Electron.IpcRendererEvent, ...args: any[]) => func(...args);

    // Registra il listener
    ipcRenderer.on(channel, subscription);

    // Ritorna la funzione di sottoscrizione creata. ESSENZIALE per poterla rimuovere.
    return subscription;
  },
  off(channel: string, subscription: (...args: any[]) => void) {
    // Rimuove la sottoscrizione (la funzione specifica) dal canale
    ipcRenderer.removeListener(channel, subscription);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})


// Espone l'oggetto API al window del renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Funzione generica per leggere tutti i dati di una tabella
  getAll: (tableName: string) => ipcRenderer.invoke('db-get-all', tableName),

  // CRUD - clienti
  insertCliente: (data: any) => ipcRenderer.invoke('db-insert-cliente', data),
  updateCliente: (data: any) => ipcRenderer.invoke('db-update-cliente', data),
  deleteCliente: (id: any) => ipcRenderer.invoke('db-delete-cliente', id),

  // CRUD - articoli
  insertArticolo: (data: any) => ipcRenderer.invoke('db-insert-articolo', data),
  updateArticolo: (data: any) => ipcRenderer.invoke('db-update-articolo', data),
  deleteArticolo: (id: any) => ipcRenderer.invoke('db-delete-articolo', id),

  // CRUD - prodotti
  insertProdotto: (data: any) => ipcRenderer.invoke('db-insert-prodotto', data),
  updateProdotto: (data: any) => ipcRenderer.invoke('db-update-prodotto', data),
  deleteProdotto: (id: any) => ipcRenderer.invoke('db-delete-prodotto', id),

  entrataProdotto: (data: any) => ipcRenderer.invoke('db-prodotto-in-entrata', data),
  uscitaProdotto: (data: any) => ipcRenderer.invoke('db-prodotto-in-uscita', data),

  // CRUD - attrezzature
  insertAttrezzatura: (data: any) => ipcRenderer.invoke('db-insert-attrezzatura', data),
  updateAttrezzatura: (data: any) => ipcRenderer.invoke('db-update-attrezzatura', data),
  deleteAttrezzatura: (id: any) => ipcRenderer.invoke('db-delete-attrezzatura', id),

  getStatistiche: () => ipcRenderer.invoke('db-get-all'),

});
