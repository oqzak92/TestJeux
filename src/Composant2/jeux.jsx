import React from "react";
import Camera from "./camera";
import { PlayerHealth } from "./PlayerHealth";
import { Inventaire } from "./inventaire";

function Jeux() {
    return (
        <div>
            <Camera />
            <PlayerHealth />
            <Inventaire />
        </div>
    );
}

export default Jeux;
