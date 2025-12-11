
export const Tutorial = () => {

    return(
        <div className="mx-auto  rounded-xl card p-6 sm:p-10">
        
            <header className="text-center mb-10 pt-6 pb-6 border-t border-b">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Benvenuto/a sulla Piattaforma!</h1>
                <p className="text-gray-600 text-lg">Di seguito una semplice guida per capire come funziona.</p>
            </header>

            <section className="mb-10 p-6 bg-myColor-50 rounded-lg border-l-4 border-myColor">
                <h2 className="text-2xl font-bold text-myColor mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    1. Ordine Corretto - Cosa Inserire o Eliminare Prima
                </h2>
                <p className="text-gray-700 leading-relaxed">
                    Per questioni di sicurezza dei dati, l'inserimento di un prodotto o di una attrezzatura richiede un ordine ben preciso.
                </p>
                <ul className="mt-4 mb-4 space-y-3">
                    <li className="p-3 bg-white rounded-md border border-gray-200">
                        <span className="font-semibold">PASSO 1: Clienti e Articoli</span>
                        <p className="text-sm text-gray-500 mt-1">Per primi si inseriscono il Cliente e l'Articolo.</p>
                    </li>
                    <li className="p-3 bg-white rounded-md border border-gray-200">
                        <span className="font-semibold">PASSO 2: Prodotti o Attrezzature</span>
                        <p className="text-sm text-gray-500 mt-1">Solo dopo si può inserire un Prodotto o un'Attrezzatura, in quanto verrà chiesto di specificare o selezionare un "DDT del Cliente" e un "Codice Articolo" che devono già esistere nella piattaforma.</p>
                    </li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                    Allo stesso modo, NON è possibile eliminare un Cliente o un Articolo se esistono dei Prodotti o delle Attrezzature ad esso collegati.
                </p>
            </section>

            <section className="mb-10 p-6 bg-myColor-50 rounded-lg border-l-4 border-myColor">
                <h2 className="text-2xl font-bold text-myColor mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    2. Tasti Principali - Aggiungi, Modifica, Elimina
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                    Questi tre tasti funzionano allo stesso modo nelle varie sezione, ma NON lasciano traccia nello Storico. <br/>
                    Ciò vuol dire che qualsiasi aggiunta, modifica o rimozione eseguite coi seguenti bottoni NON
                    genereranno una
                    transazione nello storico.
                </p>

                <div className="space-y-4">
                    <div className="p-4 bg-white rounded-md shadow-sm">
                        <span className="font-bold text-gray-800">Tasto "<span className="text-green-500">Aggiungi</span>"</span>
                        <p className="text-sm text-gray-600">
                            Serve per inserire un nuovo elemento (Cliente, Articolo, Prodotto ecc.). <br/>
                            È un semplice inserimento che NON conta come movimento di magazzino, e quindi NON genera una transazione.</p>
                    </div>
                    <div className="p-4 bg-white rounded-md shadow-sm">
                        <span className="font-bold text-gray-800">Tasto "<span className="text-yellow-500">Modifica</span>"</span>
                        <p className="text-sm text-gray-600">
                            Si attiva solo quando viene selezionata una riga. <br/>
                            Permette di cambiare qualsiasi informazione di quell'elemento (tranne gli identificatori interni come ID). <br/>
                            Anche questa è una semplice correzione che NON viene tracciata come transazione.</p>
                    </div>
                    <div className="p-4 bg-white rounded-md shadow-sm">
                        <span className="font-bold text-gray-800">Tasto "<span className="text-red-600">Elimina</span>"</span>
                        <p className="text-sm text-gray-600">Si attiva solo quando selezioni una riga. La rimuove **per sempre** dal database. Fai attenzione, non si può più recuperare!</p>
                    </div>
                </div>
            </section>

            <section className="mb-10 p-6 bg-myColor-50 rounded-lg border-l-4 border-myColor">
                <h2 className="text-2xl font-bold text-myColor mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M16 3l4 3-4 3M20 18H4M8 15l-4 3 4 3"
                        />
                    </svg>
                    3. Transazioni dei Prodotti - I Movimenti Tracciati
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                    La sezione Prodotti, essendo relativa anche alle consegne, presenta due tasti aggiuntivi.
                </p>
        
                <div className="space-y-4">
                    <div className="p-4 bg-white rounded-md shadow-sm">
                        <span className="font-bold text-gray-800">Tasto "<span className="text-blue-500">In Entrata</span>"</span>
                        <p className="text-sm text-gray-600">
                            Registra un elemento che è appena arrivato nel magazzino. <br/>
                            Crea un nuovo Prodotto nella lista e viene salvato nello Storico come transazione in ingresso (Entrata).</p>
                    </div>
                    <div className="p-4 bg-white rounded-md shadow-sm">
                        <span className="font-bold text-gray-800">Tasto "<span className="text-purple-500">In Uscita</span>"</span>
                        <p className="text-sm text-gray-600">Registra una consegna a un cliente o in generale un'uscita dal magazzino. Richiede la quantità in uscita:</p>
                        <ul className="list-disc list-inside ml-4 mt-2 text-sm text-gray-600 space-y-1">
                            <li>Se la quantità è minore di quella massima, il Prodotto viene modificato (diminuisce la quantità) e questa modifica viene tracciata nello Storico come transazione in uscita.</li>
                            <li>Se la quantità è uguale a quella massima, il Prodotto viene eliminato completamente (non ne rimane più in magazzino) e anche questa eliminazione viene tracciata nello Storico come transazione in uscita.</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="mb-10 p-6 bg-myColor-50 rounded-lg border-l-4 border-myColor">
                <h2 className="text-2xl font-bold text-myColor mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    4. I Tasti dello Storico
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">Le Transazioni sono generate automaticamente. È tuttavia possibile eliminarle tramite i relativi tre bottoni.</p>
        
                <div className="space-y-4">
                    <div className="p-4 bg-white rounded-md shadow-sm">
                        <span className="font-bold text-gray-800">Tasto "<span className="text-red-600">Elimina</span>"</span>
                        <p className="text-sm text-gray-600">Si attiva solo quando viene selezionata una riga. <br/> Cancella definitivamente la singola transazione selezionata.</p>
                    </div>
                    <div className="p-4 bg-white rounded-md shadow-sm">
                        <span className="font-bold text-gray-800">Tasto "<span className="text-red-600">Elimina Prima Mese Corrente</span>"</span>
                        <p className="text-sm text-gray-600">Cancella tutte le transazioni registrate che non rientrano nel mese attuale. È utile per mantenere pulito lo storico, conservando solo i dati più recenti.</p>
                    </div>
                    <div className="p-4 bg-white rounded-md shadow-sm">
                        <span className="font-bold text-gray-800">Tasto "<span className="text-red-600">Elimina Tutte</span>"</span>
                        <p className="text-sm text-gray-600">Cancella **ogni singola transazione**, incluse quelle del mese corrente. Attenzione, è un'eliminazione totale e definitiva!</p>
                    </div>
                </div>
            </section>

            <section className="p-6 bg-myColor-50 rounded-lg border-l-4 border-myColor">
                <h2 className="text-2xl font-bold text-myColor mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h12M4 18h8"
                        />
                    </svg>
                    5. Ordinamento e Ricerca
                </h2>
        
                <div className="space-y-4">
                    <div className="p-4 bg-white rounded-md shadow-sm">
                        <span className="font-bold text-gray-800">Ordinare le Tabelle</span>
                        <p className="text-sm text-gray-600">Se vuoi ordinare le righe della tabella, ti basta fare click sul nome del campo (l'intestazione della colonna):
                            <ul className="list-disc list-inside ml-4 mt-2 text-sm text-gray-600 space-y-1">
                                <li>1° Click: Ordina dal più piccolo al più grande (Crescente).</li>
                                <li>2° Click: Ordina dal più grande al più piccolo (Decrescente).</li>
                                <li>3° Click: Annulla l'ordinamento e torna alla visualizzazione iniziale.</li>
                            </ul>
                        </p>
                    </div>
                    <div className="p-4 bg-white rounded-md shadow-sm">
                        <span className="font-bold text-gray-800">Casella di Ricerca</span>
                        <p className="text-sm text-gray-600">Ti permette di filtrare tutte le righe. Inserisci una parola o un numero e vedrai solo le righe che contengono esattamente quel testo.</p>
                    </div>
                </div>
            </section>
        
            <footer className="mt-10 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
                TUTTI I DATI, UNA VOLTA ELIMINATI, NON POSSONO ESSERE RECUPERATI!
            </footer>
        
        </div>
    );
};