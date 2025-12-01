import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// Il percorso in cui l'app salva i dati utente, perfetto per un DB stand-alone.
const dbPath = path.join(app.getPath('userData'), 'magazzino.db');
const db = new Database(dbPath);

console.log(`Database connected at: ${dbPath}`);

// Funzione per inizializzare le tabelle
function initDatabase() {
    db.exec(
        `PRAGMA foreign_keys = ON;`
    );

    // Tabella Clienti
    db.exec(`
    CREATE TABLE IF NOT EXISTS clienti (
      ddt TEXT PRIMARY KEY,
      piva TEXT,
      nome TEXT,
      telefono TEXT,
      email TEXT
    );
  `);

    // Tabella Prodotti
    db.exec(`
    CREATE TABLE IF NOT EXISTS prodotti (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ddtCliente TEXT,
      codArticolo TEXT,
      quantità INTEGER,
      data_produzione DATETIME DEFAULT CURRENT_TIMESTAMP,
      valore REAL,
      stoccaggio TEXT,
      FOREIGN KEY (ddtCliente) REFERENCES clienti(ddt)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
      FOREIGN KEY (codArticolo) REFERENCES articoli(cod)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
    );
  `);

    // Tabella Attrezzi (inventario interno)
    db.exec(`
    CREATE TABLE IF NOT EXISTS attrezzature (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ddtCliente TEXT,
      codArticolo TEXT,
      stoccaggio TEXT,
      FOREIGN KEY (ddtCliente) REFERENCES clienti(ddt)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
      FOREIGN KEY (codArticolo) REFERENCES articoli(cod)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
    );
  `);

    // Tabella Articoli
    db.exec(`
    CREATE TABLE IF NOT EXISTS articoli (
      cod TEXT PRIMARY KEY,
      descrizione TEXT,
      prezzo REAL
    );
  `);

    console.log('Tabelle create o già esistenti.');
}

// Esegui l'inizializzazione del DB al primo avvio
initDatabase();

// Esporta la connessione per altre operazioni (lettura/scrittura)
export { db };