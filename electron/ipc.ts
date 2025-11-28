// Nel main.ts o in un file dedicato alla logica IPC

import { ipcMain } from 'electron';
import { db } from './database'; // Importa la connessione creata prima

// Gestore per la lettura generica di tutte le righe di una tabella
ipcMain.handle('db-get-all', (event, tableName) => {
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
ipcMain.handle('db-insert-cliente', (event, datiCliente) => {
    try {
        const stmt = db.prepare(`
      INSERT INTO cliente (ddt, piva, nome, telefono, email)
      VALUES (?, ?, ?, ?, ?)
    `);
        const info = stmt.run(
            datiCliente.ddt,
            datiCliente.piva,
            datiCliente.nome,
            datiCliente.telefono,
            datiCliente.email
        );
        return { success: true, lastInsertRowid: info.lastInsertRowid };
    } catch (error) {
        console.error("Errore nell'inserimento del cliente:", error);
        return { error: 'Inserimento cliente fallito' };
    }
});