import React from "react";
import { Button } from "@/components/button";

interface TopBarProps {
    onAdd?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onAdd, onEdit, onDelete }) => {
    return (
        <div className="flex gap-2 bg-gray-100 p-2 shadow">
            <Button onClick={onAdd} className={"bg-myColor hover:bg-myColor-foreground"}>Aggiungi</Button>
            <Button onClick={onEdit} className={"bg-myColor hover:bg-myColor-foreground"}>Modifica</Button>
            <Button onClick={onDelete} className={"bg-myColor hover:bg-myColor-foreground"}>Elimina</Button>
        </div>
    );
};
