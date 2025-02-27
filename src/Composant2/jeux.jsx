import React, { useState } from "react";
import Camera from "./camera";
import { PlayerHealth } from "./PlayerHealth";
import { Inventaire } from "./Inventaire";

function Jeux() {
    const [health, setHealth] = useState(100); // Gérer la santé du joueur

    return (
        <div>
            <Camera />
            <PlayerHealth health={health} setHealth={setHealth} />
            <Inventaire setHealth={setHealth} />
        </div>
    );
}

export default Jeux;
