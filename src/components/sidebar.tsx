import React from "react";
import { NavLink } from "react-router-dom";

import Logo from "@/assets/logo nuovo.png";

const menuItems = [
    { name: "Clienti", path: "/clienti" },
    { name: "Modelli", path: "/modelli" },
    { name: "Prodotti", path: "/prodotti" },
    { name: "Attrezzature", path: "/attrezzature" },
    { name: "Transazioni", path: "/transazioni" },
    { name: "Statistiche", path: "/statistiche" },
];

export const Sidebar = () => {
    return (
        <div className="bg-myColor text-white w-48 h-screen flex flex-col items-start p-4 gap-4">
            <div className="mb-6">
                <img src={Logo} alt="Logo Azienda" className="w-32 h-auto" />
            </div>
            {menuItems.map((item) => (
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
            ))}
        </div>
    );
};
