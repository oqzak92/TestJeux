import React, { useState } from "react";
import Camera from "./camera";
import { PlayerHealth } from "./PlayerHealth";
import { Inventaire } from "./Inventaire";
import { FallDamage } from "./DamageDiver/FallDamage";

function Jeux() {
    const [health, setHealth] = useState(100); // Gérer la santé du joueur
    const [playerY, setPlayerY] = useState(0); // Stocker la position Y du joueur
    
    return (
        <div>
            <Camera setHealth={setHealth} setPlayerY={setPlayerY} />
            <PlayerHealth health={health} setHealth={setHealth} />
            <Inventaire setHealth={setHealth} />
            <FallDamage setHealth={setHealth} setPlayerY={setPlayerY} />
            <div style={{
                position: 'absolute', 
                top: '10px', 
                right: '10px', 
                background: 'rgba(0, 0, 0, 0.5)', 
                color: 'white', 
                padding: '5px 10px', 
                borderRadius: '5px',
                fontFamily: 'monospace'
            }}>
                Position Y du joueur : {playerY.toFixed(2)}
            </div>
        </div>
    );
}

export default Jeux;