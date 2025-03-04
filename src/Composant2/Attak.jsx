import React, { useState } from 'react';


export function AttakIa({ setHealth }) {




    if (setHealth) {
        setHealth(prevHealth => Math.max(prevHealth - 10, 0));
    } else {
        console.error("setHealth n'a pas été fourni !");
    }
}



//export const AttakPlayer = 