// Nel main.ts o in un file dedicato alla logica IPC

import { ipcMain, BrowserWindow } from 'electron';
import { db } from './database'; // Importa la connessione creata prima

// Gestore per la lettura generica di tutte le righe di una tabella
ipcMain.handle('db-get-all', (_event, tableName) => {
    try {
        const stmt = db.prepare(`SELECT * FROM ${tableName}`);
        return stmt.all(); // Ritorna tutte le righe come array di oggetti
    } catch (error) {
        console.error(`Errore durante il recupero dei dati dalla tabella ${tableName}:`, error);
        // IMPORTANTE: Non esporre l'errore SQL completo al frontend
        return { error: `Impossibile recuperare i dati dalla tabella ${tableName}` };
    }
});

// TODO: Aggiungi le altre funzioni per inserimento, modifica, eliminazione ecc.
ipcMain.handle('db-insert-cliente', (_event, datiCliente) => {
    try {
        const stmt = db.prepare(`
            INSERT INTO clienti (ddt, piva, nome, telefono, email)
            VALUES (@ddt, @piva, @nome, @telefono, @email)
        `);

        const info = stmt.run(datiCliente);
        // Segnala al processo di rendering che i dati dei clienti devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-clienti', { status: 'success' });
        }

        return { success: true, message: 'Cliente inserito', lastInsertRowid: info.lastInsertRowid };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'inserimento del cliente:", errorMessage);

        // Controllo specifico per violazione di vincolo (es. DDT duplicato)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Il DDT specificato (chiave primaria) esiste già." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});