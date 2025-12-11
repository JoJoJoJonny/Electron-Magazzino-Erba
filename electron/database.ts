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
      nome TEXT,
      piva TEXT,
      telefono TEXT,
      email TEXT,
      indirizzo TEXT
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

    // Tabella Prodotti
    db.exec(`
    CREATE TABLE IF NOT EXISTS prodotti (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ddtCliente TEXT,
      codArticolo TEXT,
      quantita INTEGER,
      dataProduzione DATETIME DEFAULT CURRENT_TIMESTAMP,
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

    // Tabella Attrezzi
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

    // Tabella Semilavorati
    db.exec(`
    CREATE TABLE IF NOT EXISTS semilavorati (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      quantita TEXT, --deve essere descrittiva, in quanto potrebbe essere in bancali, in kg, in unità ecc.
      stoccaggio TEXT
    );
  `);

    // Tabella Transazioni
    db.exec(`
    CREATE TABLE IF NOT EXISTS transazioni (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ddtCliente TEXT,
      codArticolo TEXT,
      quantita INTEGER,
      valore REAL,
      data DATETIME DEFAULT CURRENT_TIMESTAMP,
      tipo TEXT      --"in" oppure "out"
        -- ho tolto le chiavi esterne in modo che un prodotto possa essere cancellato
        -- anche se c'è stata in passato una transizione
      /*FOREIGN KEY (ddtCliente) REFERENCES clienti(ddt)
          ON UPDATE CASCADE
          ON DELETE RESTRICT,
      FOREIGN KEY (codArticolo) REFERENCES articoli(cod)
          ON UPDATE CASCADE
          ON DELETE RESTRICT*/
    );
  `);

    console.log('Tabelle create o già esistenti.');
}

// Esegui l'inizializzazione del DB al primo avvio
initDatabase();

// Esporta la connessione per altre operazioni (lettura/scrittura)
export { db };