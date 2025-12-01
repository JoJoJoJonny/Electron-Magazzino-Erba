// Nel main.ts o in un file dedicato alla logica IPC

import { ipcMain, BrowserWindow } from 'electron';
import { db } from './database'; // Importa la connessione creata prima

// Gestore per la lettura generica di tutte le righe di una tabella
ipcMain.handle('db-get-all', (_event, tableName) => {
    try {
        const stmt = db.prepare(`SELECT ROWID as id, * FROM ${tableName}`);
        return stmt.all(); // Ritorna tutte le righe come array di oggetti
    } catch (error) {
        console.error(`Errore durante il recupero dei dati dalla tabella ${tableName}:`, error);
        // IMPORTANTE: Non esporre l'errore SQL completo al frontend
        return { error: `Impossibile recuperare i dati dalla tabella ${tableName}` };
    }
});

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

// Gestore per la modifica (UPDATE) di un cliente
ipcMain.handle('db-update-cliente', (_event, datiClienteAggiornati) => {
    // datiClienteAggiornati contiene { id: number, ddt: string, piva: string, ...}
    try {
        const stmt = db.prepare(`
            UPDATE clienti 
            SET ddt = @ddt, 
                piva = @piva, 
                nome = @nome, 
                telefono = @telefono, 
                email = @email
            WHERE ROWID = @id
        `);

        // Esegui l'aggiornamento.
        // L'oggetto datiClienteAggiornati deve contenere tutti i campi (@ddt, @piva, ...)
        // e l'ID (@id) per la clausola WHERE.
        const info = stmt.run(datiClienteAggiornati);

        if (info.changes === 0) {
            return { error: "Nessun cliente trovato con l'ID specificato o nessun dato è stato modificato." };
        }

        // Segnala al processo di rendering che i dati dei clienti devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-clienti', { status: 'success' });
        }

        return { success: true, message: 'Cliente aggiornato', changes: info.changes };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'aggiornamento del cliente:", errorMessage);

        // Controllo specifico per violazione di vincolo (es. DDT duplicato)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Il DDT specificato (chiave primaria) esiste già in un altro record." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

// Gestore per l'eliminazione di un cliente
ipcMain.handle('db-delete-cliente', (_event, idCliente) => {
    // idCliente è il valore 'id' (ROWID) del cliente da eliminare
    try {
        const stmt = db.prepare(`
            DELETE FROM clienti 
            WHERE ROWID = @id
        `);

        // Esegui l'eliminazione. Passiamo l'ID ricevuto dal frontend
        // come parametro @id (usiamo un oggetto { id: valore } per il binding)
        const info = stmt.run({ id: idCliente });

        if (info.changes === 0) {
            return { error: "Nessun cliente trovato con l'ID specificato per l'eliminazione." };
        }

        // Segnala al processo di rendering che i dati dei clienti devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-clienti', { status: 'success' });
        }

        return { success: true, message: 'Cliente eliminato', changes: info.changes };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'eliminazione del cliente:", errorMessage);

        // Controllo se l'eliminazione è impedita da vincoli (es. FOREIGN KEY)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Impossibile eliminare il cliente: sono presenti prodotti/documenti collegati a questo ID." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});







ipcMain.handle('db-insert-articolo', (_event, datiArticolo) => {
    try {
        const stmt = db.prepare(`
            INSERT INTO articoli (cod, descrizione, prezzo)
            VALUES (@cod, @descrizione, @prezzo)
        `);

        const info = stmt.run(datiArticolo);
        // Segnala al processo di rendering che i dati degli articoli devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-articoli', { status: 'success' });
        }

        return { success: true, message: 'Articolo inserito', lastInsertRowid: info.lastInsertRowid };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'inserimento dell'articolo:", errorMessage);

        // Controllo specifico per violazione di vincolo (es. cod duplicato)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Il COD specificato (chiave primaria) esiste già." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

ipcMain.handle('db-update-articolo', (_event, datiArticoloAggiornati) => {
    // datiArticoloAggiornato contiene { id: number, cod: string, descrizione: string, ...}
    try {
        const stmt = db.prepare(`
            UPDATE articoli 
            SET cod = @cod, 
                descrizione = @descrizione, 
                prezzo = @prezzo
            WHERE ROWID = @id
        `);

        // Esegui l'aggiornamento.
        // L'oggetto datiArticoloAggiornati deve contenere tutti i campi (@cod, @descrizione, ...)
        // e l'ID (@id) per la clausola WHERE.
        const info = stmt.run(datiArticoloAggiornati);

        if (info.changes === 0) {
            return { error: "Nessun articolo trovato con l'ID specificato o nessun dato è stato modificato." };
        }

        // Segnala al processo di rendering che i dati degli articoli devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-articoli', { status: 'success' });
        }

        return { success: true, message: 'Articolo aggiornato', changes: info.changes };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'aggiornamento dell'articolo:", errorMessage);

        // Controllo specifico per violazione di vincolo (es. COD duplicato)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Il COD specificato (chiave primaria) esiste già in un altro record." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

ipcMain.handle('db-delete-articolo', (_event, idArticolo) => {
    // idArticolo è il valore 'id' (ROWID) dell'articolo da eliminare
    try {
        const stmt = db.prepare(`
            DELETE FROM articoli 
            WHERE ROWID = @id
        `);

        // Esegui l'eliminazione. Passiamo l'ID ricevuto dal frontend
        // come parametro @id (usiamo un oggetto { id: valore } per il binding)
        const info = stmt.run({ id: idArticolo });

        if (info.changes === 0) {
            return { error: "Nessun articolo trovato con l'ID specificato per l'eliminazione." };
        }

        // Segnala al processo di rendering che i dati degli articoli devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-articoli', { status: 'success' });
        }

        return { success: true, message: 'Articolo eliminato', changes: info.changes };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'eliminazione dell'articolo:", errorMessage);

        // Controllo se l'eliminazione è impedita da vincoli (es. FOREIGN KEY)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Impossibile eliminare l'articolo: sono presenti prodotti/documenti collegati a questo ID." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});