import React from "react";
import { NavLink } from "react-router-dom";

import Logo from "@/assets/logo nuovo.png";

const menuItems = [
    { name: "Clienti", path: "/clienti", separatorAfter: false },
    { name: "Articoli", path: "/articoli", separatorAfter: true }, // Separatore 1: dopo Articoli

    { name: "Prodotti", path: "/prodotti", separatorAfter: true }, // Separatore 2: dopo Prodotti

    { name: "Semilavorati", path: "/semilavorati", separatorAfter: false },
    { name: "Attrezzature", path: "/attrezzature", separatorAfter: true }, // Separatore 3: dopo Attrezzature

    { name: "Transazioni", path: "/transazioni", separatorAfter: false },
    { name: "Statistiche", path: "/statistiche", separatorAfter: false },
];

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
                            `block px-4 py-2 rounded hover:bg-myColor-foreground transition ${
                                isActive ? "bg-myColor-foreground" : ""
                            }`
                        }
                    >
                        {item.name}
                    </NavLink>

                    {/*separatore*/}
                    {item.separatorAfter && (
                        <div className="border-t border-white/20 w-11/12 mx-auto my-3" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};
