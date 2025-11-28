// Esempio di TabellaClienti.tsx

import React, { useEffect, useState } from 'react';

interface Clienti {
    ddt: string;
    piva: string;
    nome: string;
    telefono: string;
    email: string;
}

const TabellaClienti: React.FC = () => {
    const [clienti, setClienti] = useState<Clienti[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClienti = async () => {
        setLoading(true);
        setError(null);
        try {
            // Chiama la funzione esposta nel preload script
            const result = await window.electronAPI.getAll('clienti');

            if (result && 'error' in result) {
                setError(result.error);
            } else if (Array.isArray(result)) {
                setClienti(result as Clienti[]);
            }
        } catch (e) {
            setError("Errore di comunicazione IPC.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClienti();
    }, []);

    if (loading) return <p className="p-4 text-primary">Caricamento...</p>;
    if (error) return <p className="p-4 text-red-600">Errore: {error}</p>;

    return (
        <div className="p-0">
            <button
                onClick={fetchClienti}
                className="bg-myColor hover:bg-myColor-foreground text-white font-bold py-2 px-4 rounded mb-4"
            >
                Aggiorna
            </button>

            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-myColor text-white">
                <tr>
                    <th className="py-2 px-4 text-left">DDT</th>
                    <th className="py-2 px-4 text-left">P.Iva</th>
                    <th className="py-2 px-4 text-left">Nome</th>
                    <th className="py-2 px-4 text-left">Telefono</th>
                    <th className="py-2 px-4 text-left">Email</th>
                </tr>
                </thead>
                <tbody>
                {clienti.map((c) => (
                    <tr key={c.ddt} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{c.ddt}</td>
                        <td className="py-2 px-4">{c.piva}</td>
                        <td className="py-2 px-4">{c.nome}</td>
                        <td className="py-2 px-4">{c.telefono}</td>
                        <td className="py-2 px-4">{c.email}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TabellaClienti;