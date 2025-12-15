// Nel main.ts o in un file dedicato alla logica IPC

import { ipcMain, BrowserWindow } from 'electron';
import { db } from './database'; // Importa la connessione creata prima

// Gestore per la lettura generica di tutte le righe di una tabella
ipcMain.handle('db-get-all', (_event, tableName) => {
    try {
        const stmt = db.prepare(`SELECT ROWID as rowid, * FROM ${tableName}`);
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
            INSERT INTO clienti (ddt, nome, piva, telefono, email, indirizzo)
            VALUES (@ddt, @nome, @piva, @telefono, @email, @indirizzo)
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
                nome = @nome, 
                piva = @piva, 
                telefono = @telefono, 
                email = @email,
                indirizzo = @indirizzo
            WHERE ROWID = @rowid
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
            WHERE ROWID = @rowid
        `);

        // Esegui l'eliminazione. Passiamo l'ID ricevuto dal frontend
        // come parametro @id (usiamo un oggetto { id: valore } per il binding)
        const info = stmt.run({ rowid: idCliente });

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
            WHERE ROWID = @rowid
        `);

        // Esegui l'aggiornamento.
        // L'oggetto datiArticoloAggiornati deve contenere tutti i campi (@cod, @descrizione, ...)
        // e l'ID (@id) per la clausola WHERE.
        const info = stmt.run(datiArticoloAggiornati);

        if (info.changes === 0) {
            return { error: "Nessun articolo trovato con l'ID specificato o nessun dato è stato modificato." };
        }

        // Controlliamo se il prezzo è stato effettivamente aggiornato e se è valido
        const nuovoPrezzo = parseFloat(datiArticoloAggiornati.prezzo);
        if (typeof nuovoPrezzo !== 'number' || nuovoPrezzo < 0) {
            throw new Error("Prezzo unitario non valido per il ricalcolo dei prodotti.");
        }

        // --- 2. AGGIORNAMENTO DEI PRODOTTI COLLEGATI ---

        // La query aggiorna il campo 'valore' in tutti i prodotti che hanno il 'codArticolo'
        // corrispondente al 'cod' dell'articolo appena modificato.
        // Calcolo: valore = (nuovo prezzo) * quantita
        const updateProdottiStmt = db.prepare(`
            UPDATE prodotti
            SET valore = ROUND(@nuovoPrezzo * quantita * 100) / 100.0 --dovrebbe risolvere il problema del floating point
            WHERE codArticolo = @codArticolo
        `);

        // Esegui l'aggiornamento dei prodotti.
        // Passiamo il nuovo prezzo e il codice articolo per identificare le righe.
        const infoProdotti = updateProdottiStmt.run({
            nuovoPrezzo: nuovoPrezzo,
            codArticolo: datiArticoloAggiornati.cod
        });

        // Segnala al processo di rendering che i dati degli articoli devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-articoli', { status: 'success' });
        }

        return {
            success: true,
            message: `Articolo aggiornato. Ricalcolati ${infoProdotti.changes} prodotti.`,
            changes: info.changes + infoProdotti.changes
        };

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
            WHERE ROWID = @rowid
        `);

        // Esegui l'eliminazione. Passiamo l'ID ricevuto dal frontend
        // come parametro @id (usiamo un oggetto { id: valore } per il binding)
        const info = stmt.run({ rowid: idArticolo });

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






interface ArticoloPrezzo {
    prezzo: number | null; // Usiamo 'null' o 'unknown' perché non siamo sicuri di cosa restituisca il DB
}

ipcMain.handle('db-insert-prodotto', (_event, datiProdotto) => {
    try {
        //prima prendo il prezzo unitario per il calcolo del valore
        const getPrezzoStmt = db.prepare(`
            SELECT prezzo
            FROM articoli
            WHERE cod = @codArticolo
        `);

        const articolo = getPrezzoStmt.get({ codArticolo: datiProdotto.codArticolo }) as ArticoloPrezzo;

        if (!articolo) {
            // Se l'articolo non è stato trovato nel DB, lanciamo un errore
            throw new Error(`Articolo non trovato per il codice: ${datiProdotto.codArticolo}`);
        }

        const prezzo = articolo.prezzo;

        if (!prezzo || typeof prezzo !== 'number') {
            // Se l'articolo non esiste o il prezzo non è valido, interrompiamo la transazione.
            throw new Error(`Articolo non trovato o prezzo unitario non valido per il COD Articolo: ${datiProdotto.codArticolo}`);
        }

        const valore = parseFloat((prezzo * datiProdotto.quantita).toFixed(2));

        const stmt = db.prepare(`
            INSERT INTO prodotti (ddtCliente, codArticolo, quantita, dataProduzione, valore, stoccaggio)
            VALUES (@ddtCliente, @codArticolo, @quantita, @dataProduzione, @valore, @stoccaggio)
        `);

        const info = stmt.run({
            ddtCliente: datiProdotto.ddtCliente,
            codArticolo: datiProdotto.codArticolo,
            quantita: datiProdotto.quantita,
            dataProduzione: datiProdotto.dataProduzione,
            valore: valore, // Usa il valore calcolato
            stoccaggio: datiProdotto.stoccaggio
        });
        // Segnala al processo di rendering che i dati dei prodotti devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-prodotti', { status: 'success' });
        }

        return { success: true, message: 'Prodotto inserito', lastInsertRowid: info.lastInsertRowid };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'inserimento del prodotto:", errorMessage);

        // Controllo specifico per violazione di vincolo (es. cod duplicato)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "L'ID specificato (chiave primaria) esiste già." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

ipcMain.handle('db-update-prodotto', (_event, datiProdottoAggiornati) => {
    try {
        //prima prendo il prezzo unitario per il calcolo del valore
        const getPrezzoStmt = db.prepare(`
            SELECT prezzo
            FROM articoli
            WHERE cod = @codArticolo
        `);

        const articolo = getPrezzoStmt.get({ codArticolo: datiProdottoAggiornati.codArticolo }) as ArticoloPrezzo;

        if (!articolo) {
            // Se l'articolo non è stato trovato nel DB, lanciamo un errore
            throw new Error(`Articolo non trovato per il codice: ${datiProdottoAggiornati.codArticolo}`);
        }

        const prezzo = articolo.prezzo;

        if (!prezzo || typeof prezzo !== 'number') {
            // Se l'articolo non esiste o il prezzo non è valido, interrompiamo la transazione.
            throw new Error(`Articolo non trovato o prezzo unitario non valido per il COD Articolo: ${datiProdottoAggiornati.codArticolo}`);
        }

        const valore = parseFloat((prezzo * datiProdottoAggiornati.quantita).toFixed(2));

        const stmt = db.prepare(`
            UPDATE prodotti 
            SET ddtCliente = @ddtCliente, 
                codArticolo = @codArticolo, 
                quantita = @quantita,
                dataProduzione = @dataProduzione,
                valore = @valore,
                stoccaggio = @stoccaggio
            WHERE ROWID = @rowid
        `);

        // Esegui l'aggiornamento.
        // L'oggetto datiProdottoAggiornati deve contenere tutti i campi
        // e l'ID (@id) per la clausola WHERE.
        const info = stmt.run({
            ddtCliente: datiProdottoAggiornati.ddtCliente,
            codArticolo: datiProdottoAggiornati.codArticolo,
            quantita: datiProdottoAggiornati.quantita,
            dataProduzione: datiProdottoAggiornati.dataProduzione,
            valore: valore, // Usa il valore calcolato
            stoccaggio: datiProdottoAggiornati.stoccaggio,
            rowid: datiProdottoAggiornati.rowid
        });

        if (info.changes === 0) {
            return { error: "Nessun prodotto trovato con l'ID specificato o nessun dato è stato modificato." };
        }

        // Segnala al processo di rendering che i dati dei prodotti devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-prodotti', { status: 'success' });
        }

        return { success: true, message: 'Prodotto aggiornato', changes: info.changes };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'aggiornamento del prodotto:", errorMessage);

        // Controllo specifico per violazione di vincolo (es. COD duplicato)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "L'ID specificato (chiave primaria) esiste già in un altro record." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

ipcMain.handle('db-delete-prodotto', (_event, idProdotto) => {
    try {
        const stmt = db.prepare(`
            DELETE FROM prodotti 
            WHERE ROWID = @rowid
        `);

        // Esegui l'eliminazione. Passiamo l'ID ricevuto dal frontend
        // come parametro @id (usiamo un oggetto { id: valore } per il binding)
        const info = stmt.run({ rowid: idProdotto });

        if (info.changes === 0) {
            return { error: "Nessun prodotto trovato con l'ID specificato per l'eliminazione." };
        }

        // Segnala al processo di rendering che i dati dei prodotti devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-prodotti', { status: 'success' });
        }

        return { success: true, message: 'Prodotto eliminato', changes: info.changes };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'eliminazione del prodotto:", errorMessage);

        // Controllo se l'eliminazione è impedita da vincoli (es. FOREIGN KEY)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Impossibile eliminare il prodotto: sono presenti prodotti/documenti collegati a questo ID." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

interface Row{
    ddt: string,
    cod: string
}

ipcMain.handle('db-get-unique-prodotti-keys', (_event) => {
    try {
        // 1. Recupera tutti i DDT unici dalla tabella 'clienti'
        const ddtResults = db.prepare('SELECT DISTINCT ddt FROM clienti ORDER BY ddt ASC').all();
        // Mappa i risultati in un semplice array di stringhe
        const ddtList = ddtResults.map(row => (row as Row).ddt);

        // 2. Recupera tutti i COD unici dalla tabella 'articoli'
        const codArticoloResults = db.prepare('SELECT DISTINCT cod FROM articoli ORDER BY cod ASC').all();
        // Mappa i risultati in un semplice array di stringhe
        const codArticoloList = codArticoloResults.map(row => (row as Row).cod);

        // Ritorna entrambi gli array
        return {
            ddt: ddtList,
            codArticolo: codArticoloList
        };

    } catch (error) {
        console.error("Errore nel recupero delle chiavi uniche per i Datalist:", error);
        // Ritorna un oggetto di errore con array vuoti per evitare crash
        return {
            error: "Impossibile recuperare i dati unici richiesti.",
            ddt: [],
            codArticolo: []
        };
    }
});








ipcMain.handle('db-insert-semilavorato', (_event, datiSemilavorato) => {
    try {
        const stmt = db.prepare(`
            INSERT INTO semilavorati (nome, quantita, stoccaggio)
            VALUES (@nome, @quantita, @stoccaggio)
        `);

        const info = stmt.run(datiSemilavorato);
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-semilavorati', { status: 'success' });
        }

        return { success: true, message: 'Semilavorato inserito', lastInsertRowid: info.lastInsertRowid };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'inserimento del semilavorato:", errorMessage);

        // Controllo specifico per violazione di vincolo (es. cod duplicato)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "L'ID esiste già." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

ipcMain.handle('db-update-semilavorato', (_event, datiSemilavoratoAggiornati) => {
    try {
        const stmt = db.prepare(`
            UPDATE semilavorati
            SET nome = @nome,
                quantita = @quantita,
                stoccaggio = @stoccaggio
            WHERE ROWID = @rowid
        `);

        const info = stmt.run(datiSemilavoratoAggiornati);

        if (info.changes === 0) {
            return { error: "Nessun semilavorato trovato con l'ID specificato o nessun dato è stato modificato." };
        }

        // Segnala al processo di rendering che i dati devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-semilavorato', { status: 'success' });
        }

        return { success: true, message: 'Semilavorato aggiornato', changes: info.changes };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'aggiornamento del semilavorato:", errorMessage);

        // Controllo specifico per violazione di vincolo (es. DDT duplicato)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "L'ID specificato esiste già in un altro record." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

ipcMain.handle('db-delete-semilavorato', (_event, idSemilavorato) => {
    try {
        const stmt = db.prepare(`
            DELETE FROM semilavorati 
            WHERE ROWID = @rowid
        `);

        // Esegui l'eliminazione. Passiamo l'ID ricevuto dal frontend
        // come parametro @id (usiamo un oggetto { id: valore } per il binding)
        const info = stmt.run({ rowid: idSemilavorato });

        if (info.changes === 0) {
            return { error: "Nessun semilavorato trovato con l'ID specificato per l'eliminazione." };
        }

        // Segnala al processo di rendering che i dati dell'attrezzatura devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-semilavorato', { status: 'success' });
        }

        return { success: true, message: 'Semilavorato eliminato', changes: info.changes };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'eliminazione del semilavorato:", errorMessage);

        // Controllo se l'eliminazione è impedita da vincoli (es. FOREIGN KEY)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Impossibile eliminare il semilavorato: sono presenti elementi collegati a questo ID." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});












ipcMain.handle('db-insert-attrezzatura', (_event, datiAttrezzatura) => {
    try {
        const stmt = db.prepare(`
            INSERT INTO attrezzature (ddtCliente, codArticolo, stoccaggio)
            VALUES (@ddtCliente, @codArticolo, @stoccaggio)
        `);

        const info = stmt.run(datiAttrezzatura);
        // Segnala al processo di rendering che i dati delle attrezzature devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-attrezzature', { status: 'success' });
        }

        return { success: true, message: 'Attrezzatura inserita', lastInsertRowid: info.lastInsertRowid };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'inserimento dell'attrezzatura:", errorMessage);

        // Controllo specifico per violazione di vincolo (es. cod duplicato)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Il COD specificato (chiave primaria) esiste già." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

ipcMain.handle('db-update-attrezzatura', (_event, datiAttrezzaturaAggiornati) => {
    try {
        const stmt = db.prepare(`
            UPDATE attrezzature
            SET ddtCliente = @ddtCliente,
                codArticolo = @codArticolo,
                stoccaggio = @stoccaggio
            WHERE ROWID = @rowid
        `);

        const info = stmt.run(datiAttrezzaturaAggiornati);

        if (info.changes === 0) {
            return { error: "Nessuna attrezzatura trovata con l'ID specificato o nessun dato è stato modificato." };
        }

        // Segnala al processo di rendering che i dati devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-attrezzature', { status: 'success' });
        }

        return { success: true, message: 'Attrezzatura aggiornata', changes: info.changes };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'aggiornamento dell'attrezzatura:", errorMessage);

        // Controllo specifico per violazione di vincolo (es. DDT duplicato)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Il DDT specificato (chiave primaria) esiste già in un altro record." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

ipcMain.handle('db-delete-attrezzatura', (_event, idAttrezzatura) => {
    try {
        const stmt = db.prepare(`
            DELETE FROM attrezzature 
            WHERE ROWID = @rowid
        `);

        // Esegui l'eliminazione. Passiamo l'ID ricevuto dal frontend
        // come parametro @id (usiamo un oggetto { id: valore } per il binding)
        const info = stmt.run({ rowid: idAttrezzatura });

        if (info.changes === 0) {
            return { error: "Nessuna attrezzatura trovata con l'ID specificato per l'eliminazione." };
        }

        // Segnala al processo di rendering che i dati dell'attrezzatura devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-attrezzatura', { status: 'success' });
        }

        return { success: true, message: 'Attrezzatura eliminata', changes: info.changes };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'eliminazione dell'attrezzatura:", errorMessage);

        // Controllo se l'eliminazione è impedita da vincoli (es. FOREIGN KEY)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Impossibile eliminare l'attrezzatura: sono presenti elementi collegati a questo ID." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});


ipcMain.handle('db-get-statistiche', () => {
    try {
        // Funzione helper per estrarre il valore di conteggio/somma da una singola riga
        const getValue = (sql:string) => {
            const row = db.prepare(sql).get();
            return row ? Object.values(row)[0] || 0 : 0;
        };

        const numClienti = getValue(`SELECT COUNT(DISTINCT ddt) FROM clienti`);

        const numArticoli = getValue(`SELECT COUNT(DISTINCT cod) FROM articoli`);

        const numAttrezzature = getValue(`SELECT COUNT(id) FROM attrezzature`);

        const numProdottiTotali = getValue(`SELECT SUM(quantita) FROM prodotti`);

        const valoreTotaleProdotti = getValue(`SELECT SUM(valore) FROM prodotti`);

        // Risultato finale
        return {
            numClienti: numClienti,
            numArticoli: numArticoli,
            numAttrezzature: numAttrezzature,
            numProdottiTotali: numProdottiTotali,
            // Assicurati che il valore monetario sia un numero
            valoreTotaleProdotti: parseFloat(valoreTotaleProdotti) || 0,
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore durante il recupero delle statistiche:", errorMessage);

        return { error: `Errore database: ${errorMessage}` };
    }
});










ipcMain.handle('db-prodotto-in-entrata', (_event, datiProdotto) => {

    try {
        //prima prendo il prezzo unitario per il calcolo del valore
        const getPrezzoStmt = db.prepare(`
            SELECT prezzo
            FROM articoli
            WHERE cod = @codArticolo
        `);

        const articolo = getPrezzoStmt.get({ codArticolo: datiProdotto.codArticolo }) as ArticoloPrezzo;

        if (!articolo) {
            // Se l'articolo non è stato trovato nel DB, lanciamo un errore
            throw new Error(`Articolo non trovato per il codice: ${datiProdotto.codArticolo}`);
        }

        const prezzo = articolo.prezzo;

        if (!prezzo || typeof prezzo !== 'number') {
            // Se l'articolo non esiste o il prezzo non è valido, interrompiamo la transazione.
            throw new Error(`Articolo non trovato o prezzo unitario non valido per il COD Articolo: ${datiProdotto.codArticolo}`);
        }

        const valore = parseFloat((prezzo * datiProdotto.quantita).toFixed(2));

        const stmt = db.prepare(`
            INSERT INTO prodotti (ddtCliente, codArticolo, quantita, dataProduzione, valore, stoccaggio)
            VALUES (@ddtCliente, @codArticolo, @quantita, @dataProduzione, @valore, @stoccaggio)
        `);

        const info = stmt.run({
            ddtCliente: datiProdotto.ddtCliente,
            codArticolo: datiProdotto.codArticolo,
            quantita: datiProdotto.quantita,
            dataProduzione: datiProdotto.dataProduzione,
            valore: valore, // Usa il valore calcolato
            stoccaggio: datiProdotto.stoccaggio
        });

        const stmt2 = db.prepare(`
            INSERT INTO transazioni (ddtCliente, codArticolo, quantita, valore, tipo)
            VALUES (@ddtCliente, @codArticolo, @quantita, @valore, @tipo)
        `);
        stmt2.run({
            ddtCliente: datiProdotto.ddtCliente,
            codArticolo: datiProdotto.codArticolo,
            quantita: datiProdotto.quantita,
            valore: valore, // Usa il valore calcolato
            tipo: "in",
        });
// Segnala al processo di rendering che i dati dei prodotti devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-prodotti', { status: 'success' });
        }

        return { success: true, message: 'Prodotto e transazione inseriti', lastInsertRowid: info.lastInsertRowid };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'inserimento del prodotto:", errorMessage);

        // Controllo specifico per violazione di vincolo (es. cod duplicato)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "L'ID specificato (chiave primaria) esiste già." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

ipcMain.handle('db-prodotto-in-uscita', (_event, datiProdotto) => {
    try {
        //prima prendo il prezzo unitario per il calcolo del valore
        const getPrezzoStmt = db.prepare(`
            SELECT prezzo
            FROM articoli
            WHERE cod = @codArticolo
        `);

        const articolo = getPrezzoStmt.get({ codArticolo: datiProdotto.codArticolo }) as ArticoloPrezzo;

        if (!articolo) {
            // Se l'articolo non è stato trovato nel DB, lanciamo un errore
            throw new Error(`Articolo non trovato per il codice: ${datiProdotto.codArticolo}`);
        }

        const prezzo = articolo.prezzo;

        if (!prezzo || typeof prezzo !== 'number') {
            // Se l'articolo non esiste o il prezzo non è valido, interrompiamo la transazione.
            throw new Error(`Articolo non trovato o prezzo unitario non valido per il COD Articolo: ${datiProdotto.codArticolo}`);
        }

        const nuovaQuantita = datiProdotto.quantita-datiProdotto.quantitaUscita;

        const valore = parseFloat((prezzo * nuovaQuantita).toFixed(2));

        const valoreTransazione = parseFloat((prezzo * datiProdotto.quantitaUscita).toFixed(2));

        if(nuovaQuantita > 0) {
            const stmt = db.prepare(`
                UPDATE prodotti 
                SET quantita = @quantita,
                    valore = @valore
                WHERE ROWID = @rowid
            `);

            // Esegui l'aggiornamento.
            // L'oggetto datiProdottoAggiornati deve contenere tutti i campi
            // e l'ID (@id) per la clausola WHERE.
            const info = stmt.run({
                quantita: nuovaQuantita,
                valore: valore, // Usa il valore calcolato
                rowid: datiProdotto.rowid
            });

            if (info.changes === 0) {
                return { error: "Nessun prodotto trovato con l'ID specificato o nessun dato è stato modificato." };
            }

            //return { success: true, message: 'Prodotto aggiornato', changes: info.changes };

        }else if(nuovaQuantita == 0) {
            const stmt = db.prepare(`
                DELETE FROM prodotti 
                WHERE ROWID = @rowid
            `);

            // Esegui l'eliminazione. Passiamo l'ID ricevuto dal frontend
            // come parametro @id (usiamo un oggetto { id: valore } per il binding)
            const info = stmt.run({ rowid: datiProdotto.rowid });

            if (info.changes === 0) {
                return { error: "Nessun prodotto trovato con l'ID specificato per l'eliminazione." };
            }

            //return { success: true, message: 'Prodotto eliminato', changes: info.changes };
        }

        // Segnala al processo di rendering che i dati dei prodotti devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-prodotti', { status: 'success' });
        }

        const stmt2 = db.prepare(`
            INSERT INTO transazioni (ddtCliente, codArticolo, quantita, valore, tipo)
            VALUES (@ddtCliente, @codArticolo, @quantita, @valore, @tipo)
        `);
        stmt2.run({
            ddtCliente: datiProdotto.ddtCliente,
            codArticolo: datiProdotto.codArticolo,
            quantita: datiProdotto.quantitaUscita,
            valore: valoreTransazione, // Usa il valore calcolato
            tipo: "out",
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'aggiornamento del prodotto:", errorMessage);

        // Controllo specifico per violazione di vincolo (es. COD duplicato)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "L'ID specificato (chiave primaria) esiste già in un altro record." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});






ipcMain.handle('db-delete-transazione', (_event, idTransazione) => {
    try {
        const stmt = db.prepare(`
            DELETE FROM transazioni 
            WHERE ROWID = @rowid
        `);

        // Esegui l'eliminazione. Passiamo l'ID ricevuto dal frontend
        // come parametro @id (usiamo un oggetto { id: valore } per il binding)
        const info = stmt.run({ rowid: idTransazione });

        if (info.changes === 0) {
            return { error: "Nessuna transazione trovata con l'ID specificato per l'eliminazione." };
        }

        // Segnala al processo di rendering che i dati dell'attrezzatura devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-transazioni', { status: 'success' });
        }

        return { success: true, message: 'Transazione eliminata', changes: info.changes };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'eliminazione della transazione:", errorMessage);

        // Controllo se l'eliminazione è impedita da vincoli (es. FOREIGN KEY)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Impossibile eliminare la transazione: sono presenti elementi collegati a questo ID." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    // getMonth() restituisce 0 per Gennaio, quindi aggiungiamo 1
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

ipcMain.handle('db-delete-month-transazioni', (_event) => {
    try {
        const today = new Date();

        // 1. Calcola il PRIMO giorno del mese CORRENTE (es. 2025-12-01)
        // Impostiamo il giorno a 1 e le ore/minuti/secondi a 0 per avere l'inizio esatto del mese.
        const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);

        // 2. Formatta la data di inizio per il database
        const cutoffDate = formatDate(firstDayOfCurrentMonth); // Esempio: "2025-12-01"

        const stmt = db.prepare(`
            DELETE FROM transazioni 
            WHERE data < @cutoffDate
        `);

        // Esegui l'eliminazione
        // La variabile cutoffDate è "YYYY-MM-01", quindi saranno eliminate tutte le date dei mesi precedenti.
        const info = stmt.run({ cutoffDate });

        // Segnala al processo di rendering che i dati delle transazioni devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-transazioni', { status: 'success' });
        }

        return {
            success: true,
            message: `Eliminate ${info.changes} transazioni precedenti al mese corrente (mantenute solo quelle da ${cutoffDate} in poi).`,
            changes: info.changes
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'eliminazione delle transazioni dei mesi precedenti:", errorMessage);

        // Controllo se l'eliminazione è impedita da vincoli (es. FOREIGN KEY)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Impossibile eliminare le transazioni: sono presenti elementi collegati a qualche ID." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

ipcMain.handle('db-delete-all-transazioni', (_event) => {
    try {
        // senza la clausa WHERE, elimina tutto
        const stmt = db.prepare(`
            DELETE FROM transazioni
        `);

        const info = stmt.run();

        // Segnala al processo di rendering che i dati dell'attrezzatura devono essere aggiornati
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            mainWindow.webContents.send('refresh-transazioni', { status: 'success' });
        }

        return { success: true, message: `Tutte le transazioni sono state eliminate. (${info.changes} record)`, changes: info.changes };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        console.error("Errore nell'eliminazione di tutte le transazioni:", errorMessage);

        // Controllo se l'eliminazione è impedita da vincoli (es. FOREIGN KEY)
        if (errorMessage.includes('SQLITE_CONSTRAINT')) {
            return { error: "Impossibile eliminare le transazioni: sono presenti elementi collegati a qualche ID." };
        }

        return { error: `Errore database: ${errorMessage}` };
    }
});

