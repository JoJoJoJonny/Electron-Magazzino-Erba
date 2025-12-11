import { Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/sidebar";
import { Tutorial } from "@/pages/tutorial";
import { Clienti } from "@/pages/clienti";
import { Articoli } from "@/pages/articoli";
import { Prodotti } from "@/pages/prodotti";
import { Semilavorati } from "@/pages/semilavorati";
import { Attrezzature } from "@/pages/attrezzature";
import { Transazioni } from "@/pages/transazioni";
import { Statistiche } from "@/pages/statistiche";

export default function App() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-auto bg-gray-50 p-4">
                    <Routes>
                        <Route path="/tutorial" element={<Tutorial />} />
                        <Route path="/clienti" element={<Clienti />} />
                        <Route path="/articoli" element={<Articoli />} />
                        <Route path="/prodotti" element={<Prodotti />} />
                        <Route path="/semilavorati" element={<Semilavorati />} />
                        <Route path="/attrezzature" element={<Attrezzature />} />
                        <Route path="/transazioni" element={<Transazioni />} />
                        <Route path="/statistiche" element={<Statistiche />} />
                        <Route path="/" element={<Tutorial />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}
