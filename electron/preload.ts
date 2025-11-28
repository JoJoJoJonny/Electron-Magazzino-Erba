import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
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

  // Funzione specifica per inserire un cliente
  insertCliente: (data: any) => ipcRenderer.invoke('db-insert-cliente', data),

  // TODO: Altre API andranno qui (es. insertProdotto, updateProdotto, ecc.)
});
