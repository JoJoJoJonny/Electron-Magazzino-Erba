import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { Clienti } from "@/pages/clienti";
//import { Articoli } from "@/pages/articoli";
//import { Prodotti } from "@/pages/prodotti";
//import { Attrezzature } from "@/pages/attrezzature";
//import { Transazioni } from "@/pages/transazioni";
//import { Statistiche } from "@/pages/statistiche";

export default function App() {
    return (
        <Router>
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <TopBar />
                    <div className="flex-1 overflow-auto bg-gray-50 p-4">
                        <Routes>
                            <Route path="/clienti" element={<Clienti />} />
                            {/*<Route path="/articoli" element={<Articoli />} />
                            <Route path="/prodotti" element={<Prodotti />} />
                            <Route path="/attrezzature" element={<Attrezzature />} />
                            <Route path="/transazioni" element={<Transazioni />} />
                            <Route path="/statistiche" element={<Statistiche />} />
                            <Route path="*" element={<Clienti />} />*/}
                        </Routes>
                    </div>
                </div>
            </div>
        </Router>
    );
}
