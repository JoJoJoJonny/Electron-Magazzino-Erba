import React from "react";
import { NavLink } from "react-router-dom";

import Logo from "@/assets/logo nuovo.png";

import {usePriceVisibility} from "@/components/priceVisibilityContext.tsx";

const menuItems = [
    { name: "Clienti", path: "/clienti", separatorAfter: false },
    { name: "Articoli", path: "/articoli", separatorAfter: true }, // Separatore 1: dopo Articoli

    { name: "Prodotti", path: "/prodotti", separatorAfter: true }, // Separatore 2: dopo Prodotti

    { name: "Semilavorati", path: "/semilavorati", separatorAfter: false },
    { name: "Attrezzature", path: "/attrezzature", separatorAfter: true }, // Separatore 3: dopo Attrezzature

    { name: "Transazioni", path: "/transazioni", separatorAfter: false },
    { name: "Statistiche", path: "/statistiche", separatorAfter: false },
];

const PriceVisibilityToggle = () => {
    // 1. Ottieni lo stato e il toggler dal contesto
    const { showPrices, togglePrices } = usePriceVisibility();

    return (
        // Lo stile è pensato per abbinarsi al tema della tua sidebar
        <div className="mt-auto pt-4 border-t border-white/20 w-full flex items-center justify-between px-4">
            <span className="text-sm font-light">Mostra Prezzi</span>

            {/* 2. Implementazione semplificata dello slider (checkbox) */}
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={showPrices}
                    onChange={togglePrices}
                    className="sr-only peer"
                />
                {/* Stili per il "track" dello slider (stile semplice Tailwind) */}
                <div className="w-9 h-5 bg-myColor-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-myColor-foreground"></div>
            </label>
        </div>
    );
};

export const Sidebar = () => {
    return (
        <div className="bg-myColor text-white w-48 h-screen flex flex-col items-start p-4 gap-4">
            <NavLink to={"/tutorial"}>
                <div className="mb-6">
                    <img src={Logo} alt="Logo Azienda" className="w-32 h-auto" />
                </div>
            </NavLink>

            {menuItems.map((item) => (
                <React.Fragment key={item.path}>
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `block px-4 py-1 rounded hover:bg-myColor-foreground transition ${
                                isActive ? "bg-myColor-foreground" : ""
                            }`
                        }
                    >
                        {item.name}
                    </NavLink>

                    {/*separatore*/}
                    {item.separatorAfter && (
                        <div className="border-t border-white/20 w-11/12 mx-auto my-1" />
                    )}
                </React.Fragment>
            ))}


            <PriceVisibilityToggle />
        </div>
    );
};
